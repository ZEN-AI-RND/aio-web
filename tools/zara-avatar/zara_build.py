"""Build ZARA's avatar clips from the promo, editing frames where the
footage lacks the expression:
  idle      front (outro 317.40s), her right (intro 5.2s), front, her left
            (outro 315.4s turn, closed smile pasted, mirrored); 10s each,
            eye-aligned dissolve between; closed eyes (312.0s) pasted in for
            a blink every 3s. Loop starts 5s into the first front hold.
  thinking  eyes closed + mouth closed (312.0s) with a slow nod.
  talking   intro 0.3-3.3s.   happy  intro 3.8-4.7s (smile, wink)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
from zara_lib import crop, eyes, FPS

OUT = sys.argv[1]; SIZE = 200
MOUTH_SRC, MOUTH_SRC_C = 316.6, (262, 408)
EYES_SRC, EYES_SRC_C = 312.0, [(170, 297), (350, 300)]
MOUTH_FROM_EYES = (9, 113)          # mouth centre relative to the pupils' midpoint

def soft_ellipse(w, h, inner=0.86, blur=None):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).ellipse([w * (1 - inner) / 2, h * (1 - inner) / 2, w * (1 + inner) / 2, h * (1 + inner) / 2], fill=255)
    return m.filter(ImageFilter.GaussianBlur(blur or min(w, h) * 0.07))

def paste(dst, src, sc, dc, hw, hh):
    """Paste src's box around sc onto dst at dc, colour-matched, feathered."""
    sbox = (int(sc[0] - hw), int(sc[1] - hh), int(sc[0] + hw), int(sc[1] + hh))
    dbox = (int(dc[0] - hw), int(dc[1] - hh), int(dc[0] + hw), int(dc[1] + hh))
    s = np.asarray(src.crop(sbox).convert("RGB")).astype(np.float32)
    d = np.asarray(dst.crop(dbox).convert("RGB")).astype(np.float32)
    ring = np.asarray(soft_ellipse(2 * hw, 2 * hh, inner=0.98, blur=1)) < 128      # box corners
    gain = np.clip(d[ring].mean(0) / np.maximum(s[ring].mean(0), 1), 0.85, 1.15)
    s = np.clip(s * gain, 0, 255).astype(np.uint8)
    piece = Image.fromarray(s).convert("RGBA")
    mask = soft_ellipse(2 * hw, 2 * hh)
    region = dst.crop(dbox); region.paste(piece, (0, 0), mask)
    a = dst.split()[-1]; dst.paste(region, dbox[:2]); dst.putalpha(a)
    return dst

M_SRC = crop(MOUTH_SRC); E_SRC = crop(EYES_SRC)

def closed_mouth(img, e):
    mx = (e[0][0] + e[1][0]) / 2 + MOUTH_FROM_EYES[0]; my = (e[0][1] + e[1][1]) / 2 + MOUTH_FROM_EYES[1]
    # centre a little low: the talking jaw drops the lower lip ~35px
    return paste(img, M_SRC, (MOUTH_SRC_C[0], MOUTH_SRC_C[1] + 10), (mx, my + 10), 92, 60)

def closed_eyes(img, e, strength=1.0):
    out = img.copy()
    for sc, dc in zip(EYES_SRC_C, e):
        paste(out, E_SRC, (sc[0], sc[1] + 4), (dc[0], dc[1] + 2), 76, 56)
    return Image.blend(img, out, strength) if strength < 1 else out

def idle_frame(t, blink=0.0):
    img = crop(t); e = eyes(img)
    img = closed_mouth(img, e)
    if blink: img = closed_eyes(img, e, blink)
    return img

def times(a, b): return [a + k / FPS for k in range(int(round((b - a) * FPS)) + 1)]
def cycle(seq, n): return [seq[k % len(seq)] for k in range(n)]
def pingpong(seq): return seq + seq[-2:0:-1]
BLINK = [0.5, 1.0, 1.0, 0.5]

def side(hold_frames, blink_at):
    # front -> turned; 314.93-315.00 skipped (the footage blinks mid-turn,
    # which repeated as stray winks on every turn)
    t_in = [314.8, 314.866, 315.066, 315.133, 315.2]
    hold = cycle(pingpong(times(315.2, 315.6)), hold_frames)
    seq = [(t, 0.0) for t in t_in] + [(t, 0.0) for t in hold] + [(t, 0.0) for t in reversed(t_in)]
    b0 = len(t_in) + blink_at
    for k, s in enumerate(BLINK): seq[b0 + k] = (seq[b0 + k][0], s)
    return [idle_frame(t, b) for t, b in seq]

# idle (20.5s loop): faces front, turns to the pose in the promo intro at
# 5.2s (face toward screen-left, lips softly parted), holds 10s, turns back
# with a blink, holds 10s. The loop starts 5s into the front hold, so the
# first turn comes 5s after load. Blinks every 3s throughout. Holds are
# single still frames with long durations, so the file stays small.
IDLE_T = 317.40                  # front, closed smile (outro)
TURNED_T = 5.2                   # turned pose (intro), as in the reference screenshot
BLINK_MS = [67, 134, 67]         # half, closed, half
TURN_STEPS = 4                   # dissolve frames, ~0.27s

_front = crop(IDLE_T); _fe = eyes(_front)
_turn = crop(TURNED_T); _te = eyes(_turn)
F = [_front, closed_eyes(_front, _fe, 0.5), closed_eyes(_front, _fe, 1.0)]
T = [_turn, closed_eyes(_turn, _te, 0.5), closed_eyes(_turn, _te, 1.0)]

def hold(pose, ms, blink_first=False):
    """(frame, ms) list: pose held for ms, blinking every 3s."""
    out, t = [], 0
    if blink_first:
        out += [(pose[1], 67), (pose[2], 134), (pose[1], 67)]; t = 268
    while t < ms:
        open_ms = min(3000 - 268, ms - t); out.append((pose[0], open_ms)); t += open_ms
        if t + 268 <= ms: out += [(pose[1], 67), (pose[2], 134), (pose[1], 67)]; t += 268
    return out

def _shift(img, dx, dy):
    out = Image.new("RGBA", img.size); out.alpha_composite(img, (int(round(dx)), int(round(dy)))) if dx >= 0 and dy >= 0 else None
    if dx < 0 or dy < 0:
        out = Image.new("RGBA", img.size)
        out.alpha_composite(img.crop((max(0, -int(round(dx))), max(0, -int(round(dy))), img.width, img.height)),
                            (max(0, int(round(dx))), max(0, int(round(dy)))))
    return out

def _mid(e): return ((e[0][0] + e[1][0]) / 2, (e[0][1] + e[1][1]) / 2)

def dissolve(a, b, ea, eb):
    """Blend a -> b while sliding both so their eyes line up (a light morph):
    the face moves across instead of showing two faces at once."""
    (ax, ay), (bx, by) = _mid(ea), _mid(eb)
    dx, dy = bx - ax, by - ay
    out = []
    for k in range(TURN_STEPS):
        t = (k + 1) / (TURN_STEPS + 1)
        A = _shift(a, dx * t, dy * t)              # a slides toward b's face position
        B = _shift(b, -dx * (1 - t), -dy * (1 - t))  # b starts at a's position
        out.append((Image.blend(A, B, t), 67))
    return out

# her left: the outro head turn (315.4s) with her closed smile pasted in,
# mirrored (the footage turns to her right)
LEFT_T = 315.4
def _left(blink=0.0):
    img = crop(LEFT_T); e = eyes(img)
    img = closed_mouth(img, e)
    if blink: img = closed_eyes(img, e, blink)
    return ImageOps.mirror(img)
L = [_left(), _left(0.5), _left(1.0)]
_le = eyes(L[0])

def visit(pose, pose_eyes):
    """front -> pose, hold 10s, -> front"""
    return (dissolve(_front, pose[0], _fe, pose_eyes) + hold(pose, 10000)
            + dissolve(pose[0], _front, pose_eyes, _fe))

# front, right (her right: promo 5.2s), front, left (her left), loop
timeline = (hold(F, 10000, blink_first=True) + visit(T, _te)
            + hold(F, 10000, blink_first=True) + visit(L, _le))
# start the loop 5s into the front hold: first turn 5s after load
START_MS = 5000
acc = 0
for k, (f, ms) in enumerate(timeline):
    if acc + ms > START_MS:                       # split the frame that spans 5s
        head = START_MS - acc
        timeline = [(f, ms - head)] + timeline[k + 1:] + timeline[:k] + ([(f, head)] if head else [])
        break
    acc += ms
IDLE_FRAMES = [f for f, _ in timeline]
IDLE_MS = [ms for _, ms in timeline]
clips = {"idle": IDLE_FRAMES}

# thinking: eyes and mouth closed, slow nod (2.4s)
base = crop(EYES_SRC)
N = 36
clips["thinking"] = [base.rotate(3.5 * math.sin(2 * math.pi * k / N), resample=Image.BICUBIC, center=(270, 520),
                                 translate=(0, 7 * math.sin(2 * math.pi * k / N + 0.6))) for k in range(N)]
clips["talking"] = [crop(t) for t in times(0.3, 3.3)]
clips["happy"] = [crop(t) for t in times(3.8, 4.7)] + [crop(4.7)] * 8

os.makedirs(OUT, exist_ok=True)
for name, seq in clips.items():
    seq = [f.resize((SIZE, SIZE), Image.LANCZOS) for f in seq]
    p = os.path.join(OUT, f"zara-{name}.webp")
    seq[0].save(p, save_all=True, append_images=seq[1:], duration=IDLE_MS if name == "idle" else int(1000 / FPS),
                loop=1 if name == "happy" else 0, quality=78, method=6, minimize_size=True)
    print(f"{name}: {len(seq)} frames, {os.path.getsize(p)//1024} KB")
    if name in ("idle", "thinking"):
        step = 1 if name == "idle" else 3
        sel = seq[::step]
        pv = Image.new("RGBA", (len(sel) * 92, 92), (5, 8, 16, 255))
        for k, f in enumerate(sel): pv.alpha_composite(f.resize((90, 90), Image.LANCZOS), (k * 92, 1))
        pv.save(os.path.join(OUT, f"preview-{name}.png"))
still = _front.resize((SIZE, SIZE), Image.LANCZOS); still.save(os.path.join(OUT, "zara-still.webp"), quality=90, method=6)
# big check: right, right blink, front, front blink, left, left blink, mid-turn to left
mid = dissolve(_front, L[0], _fe, _le)[TURN_STEPS // 2][0]
pv = Image.new("RGBA", (2100, 300), (5, 8, 16, 255))
for k, f in enumerate([T[0], T[2], F[0], F[2], L[0], L[2], mid]):
    pv.alpha_composite(f.resize((300, 300), Image.LANCZOS), (k * 300, 0))
pv.save(os.path.join(OUT, "check-edits.png"))
