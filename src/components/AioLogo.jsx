import React, { useEffect, useRef } from "react";

/* Animated AIO brand mark. The PNG is two interlaced four-lobed rings, each
   r(θ) = R + A·cos(4θ − φ) (fitted against public/aio-logo.png), so it's
   redrawn here as SVG paths that can move. "Thinking" motion: the mark spins
   slowly while the two rings sway against each other and their wave depth
   breathes out of step. The sway is kept small so the rings never fall into
   phase and collapse into one square. Frame 0 matches the PNG, which is also
   what reduced-motion users see. */

const SIZE = 512;
const C = SIZE / 2;
const RADIUS = 193;
const AMPLITUDE = 20;
const LOBES = 4;
const STROKE = 13;
const STEPS = 120; // segments per ring; ~1.5px each at hero size

const SPIN = 24; // deg/s for the whole mark
const SWAY = 9; // ± deg each ring rocks against the other
const BREATHE_DEPTH = 6; // ± units of wave amplitude
const PERIOD = 2.8; // seconds per sway/breathe cycle

const RINGS = [
  // Blue first so green sits on top, as it mostly does in the PNG.
  { color: "#4a94f8", phase: 264, sway: -1, breathe: Math.PI },
  { color: "#50c040", phase: 90, sway: 1, breathe: 0 },
];

const ringPath = (amplitude, phaseDeg) => {
  const phase = (phaseDeg * Math.PI) / 180;
  let d = "";
  for (let i = 0; i < STEPS; i++) {
    const t = (i / STEPS) * Math.PI * 2;
    const r = RADIUS + amplitude * Math.cos(LOBES * t - phase);
    d += `${i ? "L" : "M"}${(C + r * Math.cos(t)).toFixed(1)} ${(C - r * Math.sin(t)).toFixed(1)}`;
  }
  return d + "Z";
};

// Rotating a ring by θ is the same as shifting its phase by LOBES·θ.
const frame = (ring, seconds) => {
  const cycle = (seconds * 2 * Math.PI) / PERIOD;
  const rotation = SPIN * seconds + ring.sway * SWAY * Math.sin(cycle);
  return ringPath(
    AMPLITUDE + BREATHE_DEPTH * Math.sin(cycle + ring.breathe),
    ring.phase + LOBES * rotation,
  );
};

export default function AioLogo({ className = "" }) {
  const svgRef = useRef(null);
  const pathRefs = useRef([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let start = 0;
    let elapsed = 0; // carried across pauses so the motion resumes, not jumps

    const tick = (now) => {
      if (!start) start = now - elapsed * 1000;
      elapsed = (now - start) / 1000;
      RINGS.forEach((ring, i) => {
        pathRefs.current[i]?.setAttribute("d", frame(ring, elapsed));
      });
      raf = requestAnimationFrame(tick);
    };

    // Only animate while on screen.
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      start = 0;
      if (entry.isIntersecting) raf = requestAnimationFrame(tick);
    });
    observer.observe(svg);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
      className={className}
    >
      {RINGS.map((ring, i) => (
        <path
          key={ring.color}
          ref={(el) => (pathRefs.current[i] = el)}
          d={frame(ring, 0)}
          fill="none"
          stroke={ring.color}
          strokeWidth={STROKE}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
