# ZARA avatar clips

Builds `src/assets/zara/zara-{idle,thinking,talking,happy,still}.webp` from
`ZaraPromo.mp4` (AIO launch video). Frames are keyed off the studio
background, steadied, and edited where the footage lacks the expression
(closed mouth + blinks on the idle head turn, eyes-closed nod for thinking).

```bash
# 1. Python env (Pillow, numpy, scipy) and a full ffmpeg
python3 -m venv .venv && .venv/bin/pip install pillow numpy scipy imageio-ffmpeg
FF=$(.venv/bin/python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")

# 2. 15 fps head-region frames: intro (0-10s) and outro (from 308.6s)
mkdir -p promo/frames promo/frames2
$FF -t 10.05 -i ZaraPromo.mp4 -vf "fps=15,crop=700:680:590:20" promo/frames/%04d.png
$FF -ss 308.6 -i ZaraPromo.mp4 -vf "fps=15,crop=700:680:590:20" promo/frames2/%04d.png

# 3. Build (zara_lib.py reads promo/ next to it); writes clips + preview PNGs
.venv/bin/python zara_build.py out
cp out/zara-*.webp ../../src/assets/zara/
```

Timings, patch positions and sizes are constants at the top of `zara_build.py`.
