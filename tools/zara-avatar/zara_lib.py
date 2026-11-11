"""Shared helpers: stabilised 540px RGBA head crops from the promo frames."""
import glob, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
FPS = 15; BOX = 540; OUTRO_T0 = 308.6
S = os.path.dirname(os.path.abspath(__file__))
P1 = sorted(glob.glob(os.path.join(S, "promo/frames/*.png")))
P2 = sorted(glob.glob(os.path.join(S, "promo/frames2/*.png")))

def _cut(path):
    a = np.asarray(Image.open(path).convert("RGB")).astype(np.int16)
    edges = np.concatenate([a[:, :24], a[:, -24:]], axis=1)
    bg = np.median(edges, axis=1)[:, None, :]
    close = np.abs(a - bg).sum(-1) < 30
    lab, _ = ndimage.label(close)
    el = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    fg = ~np.isin(lab, el[el > 0])
    fg = ndimage.binary_opening(ndimage.binary_fill_holes(fg), iterations=2)
    # the helmet + face are convex row by row: fill each row between its
    # outermost pixels, so shading keyed out at the helmet rim comes back
    rows = np.where(fg.any(1))[0]; top = rows.min()
    for y in range(top, min(top + 470, fg.shape[0])):
        xs = np.where(fg[y])[0]
        if len(xs): fg[y, xs.min():xs.max() + 1] = True
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.0))
    img = Image.fromarray(a.astype(np.uint8)).convert("RGBA"); img.putalpha(alpha)
    top = np.where(fg.any(1))[0].min()
    cols = np.where(fg[top + 40: top + 300].any(0))[0]
    return img, top, (cols.min() + cols.max()) / 2

_cache = {}
def crop(t):
    """Stabilised 540x540 RGBA crop of the frame at time t (helmet top/centre fixed)."""
    src, t0 = (P2, OUTRO_T0) if t >= 300 else (P1, 0.0)
    i = max(0, min(int(round((t - t0) * FPS)), len(src) - 1))
    k = (t0, i)
    if k not in _cache:
        img, top, cx = _cut(src[i])
        l = int(round(cx - BOX / 2)); tp = int(round(top - 22))
        sq = Image.new("RGBA", (BOX, BOX))
        sq.alpha_composite(img.crop((max(l, 0), max(tp, 0), l + BOX, tp + BOX)), (max(-l, 0), max(-tp, 0)))
        _cache[k] = sq
    return _cache[k].copy()

def eyes(img):
    """Pupil centres (left, right) in a stabilised crop, or None."""
    a = np.asarray(img.convert("RGB")).astype(np.int16)
    y0, y1 = 240, 350
    band = a[y0:y1, 90:470].max(-1) < 60
    band = ndimage.binary_opening(band, iterations=2)
    lab, n = ndimage.label(band)
    if n < 2: return None
    sizes = ndimage.sum(band, lab, range(1, n + 1))
    idx = np.argsort(sizes)[::-1][:2] + 1
    if sizes[idx[1] - 1] < 150: return None
    cs = [ndimage.center_of_mass(band, lab, i) for i in idx]
    cs = sorted(((x + 90, y + y0) for y, x in cs))
    return cs
