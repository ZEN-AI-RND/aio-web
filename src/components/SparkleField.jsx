import React, { useEffect, useRef } from "react";

/* Rising "sprinkle" field: soft embers that drift upward behind the page.
   Drawn on one canvas instead of DOM nodes so a few hundred particles stay
   cheap, and pre-rendered glow sprites keep it to one drawImage per particle. */

const COLORS = ["#ffffff", "#22c55e", "#00f0ff", "#3b82f6", "#facc15"];

// Weights pick the palette mix: mostly white/green, a little cyan, rare amber.
const WEIGHTS = [0.4, 0.28, 0.18, 0.09, 0.05];

const SPRITE_SIZE = 64; // px of the pre-rendered glow, scaled down per particle

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const makeSprite = (color) => {
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE_SIZE;
  canvas.height = SPRITE_SIZE;
  const ctx = canvas.getContext("2d");
  const half = SPRITE_SIZE / 2;
  const [r, g, b] = hexToRgb(color);
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
  grad.addColorStop(0.18, `rgba(${r}, ${g}, ${b}, 0.65)`);
  grad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, 0.14)`);
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return canvas;
};

const pickColorIndex = () => {
  let roll = Math.random();
  for (let i = 0; i < WEIGHTS.length; i++) {
    roll -= WEIGHTS[i];
    if (roll <= 0) return i;
  }
  return 0;
};

const SparkleField = ({ density = 1 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const sprites = COLORS.map(makeSprite);
    let particles = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;

    // Spawn anywhere on screen for the first fill, at the bottom afterwards,
    // so the effect looks settled the moment the page loads.
    const spawn = (particle, seeded) => {
      const size = 1.5 + Math.random() * 5.5;
      particle.size = size;
      particle.x = Math.random() * width;
      particle.y = seeded
        ? Math.random() * height
        : height + Math.random() * height * 0.25 + size;
      // Smaller motes sit "further away": slower and dimmer.
      particle.speed = 10 + size * 5 + Math.random() * 16;
      particle.drift = 6 + Math.random() * 26;
      particle.wobble = 0.15 + Math.random() * 0.5;
      particle.phase = Math.random() * Math.PI * 2;
      particle.alpha = 0.25 + Math.random() * 0.5;
      particle.twinkle = 0.6 + Math.random() * 1.8;
      particle.color = pickColorIndex();
      particle.originX = particle.x;
      return particle;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // clientWidth, not innerWidth: the latter counts the desktop scrollbar,
      // which would size the canvas wider than the area it can actually paint.
      width = document.documentElement.clientWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.round(
        Math.min(180, Math.max(35, (width * height) / 14000)) * density,
      );
      if (particles.length > target) {
        particles.length = target;
      } else {
        while (particles.length < target) particles.push(spawn({}, true));
      }
    };

    const draw = (time) => {
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;
      last = time;
      const seconds = time / 1000;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const p of particles) {
        p.y -= p.speed * dt;
        p.x = p.originX + Math.sin(seconds * p.wobble + p.phase) * p.drift;

        if (p.y < -p.size * 4) {
          spawn(p, false);
          continue;
        }

        // Fade in off the bottom edge and out near the top.
        const edgeFade = Math.min(
          1,
          (height - p.y) / (height * 0.18),
          p.y / (height * 0.3),
        );
        const pulse = 0.7 + 0.3 * Math.sin(seconds * p.twinkle + p.phase);
        ctx.globalAlpha = Math.max(0, p.alpha * edgeFade * pulse);

        const glow = p.size * 4;
        ctx.drawImage(
          sprites[p.color],
          p.x - glow / 2,
          p.y - glow / 2,
          glow,
          glow,
        );
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
      draw(0);
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      frame = requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="sparkles" aria-hidden="true" />;
};

export default SparkleField;
