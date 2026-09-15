import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

/* Cycles through `words` in place: the current word slides up and out while
   the next one rises in from below. All words share one grid cell, and the
   cell's width eases to fit the incoming word, so the sentence around it
   closes up smoothly instead of leaving gaps around the shorter words.
   Screen readers get the whole list once instead of the animation. */

const INTERVAL = 2000; // ms each word stays on screen

export default function RotatingWord({ words, className = "" }) {
  const [active, setActive] = useState(0);
  const [widths, setWidths] = useState(null);
  const itemRefs = useRef([]);
  const wordsKey = words.join("|");

  useEffect(() => {
    const timer = setInterval(
      () => setActive((index) => (index + 1) % words.length),
      INTERVAL
    );
    return () => clearInterval(timer);
  }, [words.length]);

  // Re-measure when the web font lands or the vw-based font size changes.
  useLayoutEffect(() => {
    const items = itemRefs.current.slice(0, words.length);
    const measure = () =>
      setWidths(items.map((el) => el.getBoundingClientRect().width));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [wordsKey, words.length]);

  const previous = (active - 1 + words.length) % words.length;

  return (
    <>
      <span
        aria-hidden="true"
        style={widths ? { width: widths[active] } : undefined}
        className={`inline-grid grid-cols-[minmax(0,1fr)] justify-items-center overflow-clip transition-[width] duration-500 ease-out motion-reduce:transition-none ${className}`}
      >
        {words.map((word, index) => (
          <span
            key={word}
            ref={(el) => (itemRefs.current[index] = el)}
            className={`col-start-1 row-start-1 whitespace-nowrap transition-all duration-500 ease-out motion-reduce:transition-none ${
              index === active
                ? "translate-y-0 opacity-100"
                : index === previous
                ? "-translate-y-full opacity-0"
                : "translate-y-full opacity-0"
            }`}
          >
            {word}
          </span>
        ))}
      </span>
      <span className="sr-only">{words.join(", ")}</span>
    </>
  );
}
