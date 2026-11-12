"""ZARA waving hello (promo intro 0.1-1.6s), mouth closed, for the round
launcher. Wide framing so the raised hand fits, easing in to the idle's
close-up as the hand comes down, then blending into the idle's front pose.
Plays once."""
import sys, os, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from zara_lib import crop, eyes, FPS, BOX
import zara_build as zb   # closed_mouth, dissolve, _front, _fe

OUT = sys.argv[1]; SIZE = 200
WIDE = 900                       # square crop that fits head + raised hand
HEAD_AT = 0.64                   # head centre sits at 64% across the wide box
paths = sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), "promo/wave/*.png")))
X0, Y0 = 380, 0                  # where the wide frames were cut from the video

def cut(path):
    a = np.asarray(Image.open(path).convert("RGB")).astype(np.int16)
    # backdrop per row from the right margin only: the raised arm reaches
    # the left edge and would skew the estimate there
    bg = np.median(a[:, -24:], axis=1)[:, None, :]
    close = np.abs(a - bg).sum(-1) < 30
    lab, _ = ndimage.label(close)
    el = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    fg = ~np.isin(lab, el[el > 0])
    fg = ndimage.binary_opening(ndimage.binary_fill_holes(fg), iterations=2)
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.0))
    img = Image.fromarray(a.astype(np.uint8)).convert("RGBA"); img.putalpha(alpha)
    top = np.where(fg.any(1))[0].min()
    # head centre from the helmet band only (the hand is lower, beside the face)
    band = fg[top + 30: top + 160]
    lab2, n = ndimage.label(band)
    sizes = ndimage.sum(band, lab2, range(1, n + 1)); biggest = np.argmax(sizes) + 1
    cols = np.where((lab2 == biggest).any(0))[0]
    return img, top, (cols.min() + cols.max()) / 2

def box_crop(img, l, t, size):
    sq = Image.new("RGBA", (int(size), int(size)))
    l, t, size = int(round(l)), int(round(t)), int(round(size))
    sq.alpha_composite(img.crop((max(l, 0), max(t, 0), l + size, t + size)), (max(-l, 0), max(-t, 0)))
    return sq

def frame(i, ease):
    """ease 0 = wide framing, 1 = the idle's tight 540 framing."""
    img, top, cx = cut(paths[i])
    # close the mouth on the tight (idle-style) crop, then paste it back
    tl, tt = cx - BOX / 2, top - 22
    tight = box_crop(img, tl, tt, BOX)
    e = eyes(tight)
    if e is not None:
        tight = zb.closed_mouth(tight, e)
        img.alpha_composite(tight.crop((max(0, -int(round(tl))), max(0, -int(round(tt))), BOX, BOX)),
                            (max(0, int(round(tl))), max(0, int(round(tt)))))
    wl, wt = cx - HEAD_AT * WIDE, top - 40
    l = wl + (tl - wl) * ease; t = wt + (tt - wt) * ease; size = WIDE + (BOX - WIDE) * ease
    return box_crop(img, l, t, size).resize((BOX, BOX), Image.LANCZOS)

def smooth(x): return x * x * (3 - 2 * x)
WAVE = range(int(0.1 * FPS), int(1.25 * FPS) + 1)          # hand up
ZOOM = range(int(1.25 * FPS) + 1, int(1.6 * FPS) + 1)       # hand down, ease in
frames = [frame(i, 0.0) for i in WAVE]
frames += [frame(i, smooth((k + 1) / len(ZOOM))) for k, i in enumerate(ZOOM)]
last = frames[-1]; le = eyes(last)
frames += [f for f, _ in zb.dissolve(last, zb._front, le, zb._fe)] + [zb._front]
seq = [f.resize((SIZE, SIZE), Image.LANCZOS) for f in frames]
p = os.path.join(OUT, "zara-wave.webp")
seq[0].save(p, save_all=True, append_images=seq[1:], duration=int(1000 / FPS), loop=1, quality=78, method=6, minimize_size=True)
print(f"wave: {len(seq)} frames, {len(seq) * int(1000 / FPS)} ms, {os.path.getsize(p)//1024} KB")
sel = seq[::2]
from PIL import ImageDraw
pv = Image.new("RGBA", (len(sel) * 102, 102), (5, 8, 16, 255))
for k, f in enumerate(sel):
    c = f.resize((100, 100), Image.LANCZOS)
    m = Image.new("L", (100, 100), 0); ImageDraw.Draw(m).ellipse([0, 0, 99, 99], fill=255)
    bg = Image.new("RGBA", (100, 100), (25, 45, 30, 255)); bg.alpha_composite(c); pv.paste(bg, (k * 102, 1), m)
pv.save(os.path.join(OUT, "preview-wave.png"))
