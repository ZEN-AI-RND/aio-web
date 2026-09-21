import React, { useEffect, useRef, useState } from "react";
import AioLogo from "./AioLogo";
import { drawRibbons } from "./ribbons";

/* Page splash. Covers the whole viewport while a page settles:
   - a canvas of hair-thin green lines woven into slowly twisting ribbons,
   - the animated AIO mark in a dark disc with pulse rings,
   - the slogan "decoding" out of random glyphs, over a thin progress line.
   It fades out on its own after `showMs`, or at once on a click, tap or key.
   Everything is driven by JS or CSS transitions rather than keyframes where
   possible, because index.css forces every keyframe animation to 0.5s on
   phones. */

const SLOGAN = "Your AI. Your Data. Your Infra.";
// Time on screen before the exit starts. The first load gets the full run;
// every later page gets a short one, because the same five seconds between
// two clicks reads as a stall rather than an entrance.
export const SPLASH_FIRST_MS = 5000;
export const SPLASH_NAV_MS = 1800;
const EXIT_MS = 900; // fade-out length; keep in sync with duration-[900ms] below
// Canvas pixel budget. The ribbons are soft glowing lines, so rendering fewer
// pixels and letting CSS scale the canvas up is invisible, and it keeps the
// frame cost flat on large and full-screen displays.
const CANVAS_PIXELS = 1.1e6;
const GLYPHS = "01<>/{}[]#$%&*+=?ABCDEFXYZ";

/* ---------- Background: woven line ribbons (see ribbons.js) ---------- */

function useRibbonCanvas(canvasRef, animate) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const scale = Math.min(
        window.devicePixelRatio || 1,
        2,
        Math.sqrt(CANVAS_PIXELS / (width * height))
      );
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      if (!animate) drawRibbons(ctx, width, height, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    if (animate) {
      // Motion follows elapsed time, not frame count, so a dropped frame
      // never makes the ribbons stutter or slow down.
      const start = performance.now();
      const tick = (now) => {
        drawRibbons(ctx, width, height, (now - start) / 1000);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef, animate]);
}

/* ---------- Slogan: decodes out of random glyphs ---------- */

function DecodingText({ text, startDelay, charDelay, animate }) {
  const [shown, setShown] = useState(() =>
    animate ? text.split("").map(() => null) : text.split("")
  );

  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    let begin = 0;
    let lastFrame = 0;
    const tick = (now) => {
      if (!begin) begin = now + startDelay;
      // ~30 glyph swaps a second reads as scrambling; faster only costs renders.
      if (now - lastFrame < 33) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastFrame = now;
      const elapsed = now - begin;
      let done = true;
      const next = text.split("").map((ch, i) => {
        if (ch === " ") return " ";
        if (elapsed >= i * charDelay + 260) return ch; // settled
        done = false;
        if (elapsed < i * charDelay) return elapsed < 0 ? null : "";
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      });
      setShown(next);
      if (!done) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, startDelay, charDelay, animate]);

  return (
    <span className="relative inline-block">
      {/* Invisible copy holds the final width so the line never jitters. */}
      <span className="invisible">{text}</span>
      <span aria-hidden="true" className="absolute inset-0 whitespace-nowrap">
        {shown.map((ch, i) =>
          ch === text[i] ? (
            <span key={i}>{ch}</span>
          ) : (
            <span key={i} className="text-green-400">
              {ch ?? ""}
            </span>
          )
        )}
      </span>
    </span>
  );
}

/* ---------- Splash ---------- */

// Owns only whether the splash exists. Unmounting the overlay (rather than
// rendering null inside it) is what stops its animation loops and releases
// the scroll lock.
// `onReveal` fires when the fade-out starts, so the page can start painting
// underneath just in time to be seen.
// One mount is one run. The host remounts it (via a changing `key`) for every
// page it opens, so each navigation gets its own splash.
export default function SplashScreen({ onReveal, showMs = SPLASH_FIRST_MS }) {
  const [visible, setVisible] = useState(true);
  return visible ? (
    <SplashOverlay
      onReveal={onReveal}
      showMs={showMs}
      onDone={() => setVisible(false)}
    />
  ) : null;
}

function SplashOverlay({ onReveal, showMs, onDone }) {
  const [phase, setPhase] = useState("enter"); // enter → show → exit
  const canvasRef = useRef(null);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useRibbonCanvas(canvasRef, !reduceMotion);

  // The scroll lock is released at the start of the exit, not on unmount: a
  // navigation that asks for a section scrolls to it while the splash fades,
  // and `overflow: hidden` would swallow that scroll.
  const prevOverflow = useRef("");

  useEffect(() => {
    prevOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Next frame, so the enter transitions have a starting state to run from.
    const raf = requestAnimationFrame(() => setPhase("show"));
    const exitTimer = setTimeout(() => setPhase("exit"), showMs);

    const skip = () => setPhase("exit");
    window.addEventListener("keydown", skip);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      window.removeEventListener("keydown", skip);
      document.body.style.overflow = prevOverflow.current;
    };
  }, [showMs]);

  useEffect(() => {
    if (phase !== "exit") return;
    document.body.style.overflow = prevOverflow.current;
    onReveal?.();
    const timer = setTimeout(onDone, EXIT_MS);
    return () => clearTimeout(timer);
    // Runs once per phase change; the callbacks are not triggers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const entered = phase !== "enter";
  const leaving = phase === "exit";

  return (
    <div
      role="status"
      aria-label="Loading AI Office"
      onClick={() => setPhase("exit")}
      className={`fixed inset-0 z-[100] flex cursor-pointer items-center justify-center overflow-hidden bg-[#040704] bg-[radial-gradient(ellipse_at_center,#0b2a0a_0%,#061206_45%,#030503_100%)] transition-opacity duration-[900ms] ease-out ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Darken the middle so the mark reads, and fade the edges out. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(4,7,4,0.85)_0%,rgba(4,7,4,0.4)_20%,rgba(4,7,4,0)_45%,rgba(4,7,4,0.35)_100%)]"
      />

      <div
        className={`relative flex flex-col items-center px-6 text-center transition-[opacity,transform] duration-[900ms] ease-out ${
          leaving
            ? "scale-105 opacity-0"
            : entered
            ? "scale-100 opacity-100"
            : "scale-90 opacity-0"
        }`}
      >
        {/* Mark in a dark disc, with rings pulsing outward. */}
        <div className="relative flex h-44 w-44 items-center justify-center sm:h-56 sm:w-56">
          {!reduceMotion && (
            <>
              <span aria-hidden="true" className="splash-ping absolute inset-0 rounded-full border border-green-500/60" />
              <span aria-hidden="true" className="splash-ping splash-ping-late absolute inset-0 rounded-full border border-green-500/40" />
            </>
          )}
          <div className="absolute inset-0 rounded-full bg-black shadow-[0_0_60px_rgba(80,192,64,0.25),inset_0_0_30px_rgba(80,192,64,0.08)]" />
          {/* Static glow behind the mark. The hero's animated drop-shadow
              filter would be re-rasterised every frame here, because the
              mark's paths change every frame. */}
          <div aria-hidden="true" className="absolute inset-10 rounded-full bg-[radial-gradient(circle,rgba(80,192,64,0.35)_0%,rgba(80,192,64,0.12)_45%,rgba(80,192,64,0)_70%)]" />
          <span className="relative inline-flex h-[1em] w-[1em] items-center justify-center text-[8.5rem] sm:text-[11rem]">
            <AioLogo className="absolute inset-0 h-full w-full" />
            <span className="relative font-display font-extrabold text-[0.21em] leading-none tracking-[-0.01em] text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.55)]">
              AIO
            </span>
          </span>
          <span
            aria-hidden="true"
            className="absolute right-3 top-6 text-xs font-semibold text-gray-300 sm:right-4 sm:top-8"
          >
            ™
          </span>
        </div>

        <p className="mt-10 text-xl font-bold tracking-[-0.01em] text-white sm:mt-12 sm:text-3xl">
          {/* The decode is timed as a fraction of the run, so a short splash
              still shows the slogan settling instead of cutting it off. */}
          <DecodingText
            text={SLOGAN}
            startDelay={700 * (showMs / SPLASH_FIRST_MS)}
            charDelay={55 * (showMs / SPLASH_FIRST_MS)}
            animate={!reduceMotion}
          />
        </p>

        {/* Progress line: fills over the time the splash is up. */}
        <div aria-hidden="true" className="mt-6 h-px w-48 overflow-hidden bg-white/10 sm:w-64">
          <div
            className="h-full origin-left bg-gradient-to-r from-green-700 via-green-400 to-green-200"
            style={{
              transform: `scaleX(${entered ? 1 : 0})`,
              transition: `transform ${showMs}ms linear`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
