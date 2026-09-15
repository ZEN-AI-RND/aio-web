/* Woven line ribbons for the splash background.

   Each ribbon is a bundle of lines that share one wave but spread apart by an
   amount that itself waves along the ribbon, so the bundle pinches and fans
   out like the reference artwork. Every line in a ribbon shares the same
   per-step wave and twist, so those are computed once per ribbon per frame and
   each line only offsets them. Lines are stroked in a handful of alpha bands
   (one path per band) instead of one stroke per line. */

export const RIBBONS = [
  { y: 0.32, angle: -0.35, amp: 0.15, freq: 1.4, speed: 0.4, spread: 0.34, phase: 0, alpha: 0.9 },
  { y: 0.66, angle: 0.22, amp: 0.18, freq: 1.1, speed: -0.32, spread: 0.4, phase: 2.1, alpha: 0.8 },
  { y: 0.5, angle: 1.2, amp: 0.13, freq: 1.8, speed: 0.26, spread: 0.3, phase: 4.2, alpha: 0.6 },
  { y: 0.45, angle: -1.05, amp: 0.12, freq: 1.3, speed: -0.2, spread: 0.26, phase: 5.6, alpha: 0.45 },
];

const BANDS = 5; // alpha levels per ribbon, from the dim middle to bright edges

let xs = new Float32Array(0);
let wave = new Float32Array(0);
let twist = new Float32Array(0);

export function ribbonDetail(width) {
  return width < 640 ? { lines: 40, steps: 48 } : { lines: 64, steps: 72 };
}

export function drawRibbons(ctx, width, height, t) {
  const { lines, steps } = ribbonDetail(width);
  if (xs.length !== steps + 1) {
    xs = new Float32Array(steps + 1);
    wave = new Float32Array(steps + 1);
    twist = new Float32Array(steps + 1);
  }

  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = 0.8;
  const diag = Math.hypot(width, height);

  for (const r of RIBBONS) {
    for (let s = 0; s <= steps; s++) {
      const u = s / steps;
      xs[s] = (u - 0.5) * diag;
      wave[s] =
        (Math.sin(u * Math.PI * r.freq * 2 + t * r.speed + r.phase) * r.amp +
          Math.sin(u * Math.PI * r.freq * 3.3 - t * r.speed * 0.6 + r.phase * 1.7) *
            r.amp * 0.45) *
        height;
      twist[s] = Math.sin(u * Math.PI * 2.4 + t * r.speed * 0.8 + r.phase) * r.spread * height;
    }

    ctx.save();
    ctx.translate(width / 2, height * r.y);
    ctx.rotate(r.angle);

    for (let b = 0; b < BANDS; b++) {
      // Band b covers lines whose distance from the ribbon's centre falls in
      // [b, b+1) / BANDS of the half-width; edges glow brighter than the middle.
      const edge = 0.45 + ((b + 0.5) / BANDS) * 0.7;
      ctx.strokeStyle = `rgba(72, 200, 56, ${(r.alpha * edge * 0.22).toFixed(3)})`;
      ctx.beginPath();
      for (let j = 0; j < lines; j++) {
        const k = j / (lines - 1) - 0.5;
        if (Math.min(BANDS - 1, Math.floor(Math.abs(k) * 2 * BANDS)) !== b) continue;
        const offset = height * 0.02 * k;
        ctx.moveTo(xs[0], wave[0] + k * twist[0] + offset);
        for (let s = 1; s <= steps; s++) {
          ctx.lineTo(xs[s], wave[s] + k * twist[s] + offset);
        }
      }
      ctx.stroke();
    }

    ctx.restore();
  }
}
