import React, { useId } from "react";

/* ZARA's mascot: a small round robot with a dark visor and big glowing eyes,
   drawn in the brand greens. Inline SVG, no images.

   `mood` picks the expression (animated in ChatWidget.css):
     idle      blinks and floats
     thinking  eyes look around, a shimmer sweeps the visor
     happy     eyes turn to smiling arcs, big smile
     talking   mouth moves */
export default function ChatMascot({ mood = "idle", className = "" }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={`zc-mascot ${className}`}
      data-mood={mood}
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6FD45E" />
          <stop offset="1" stopColor="#3FA332" />
        </linearGradient>
        <clipPath id={`${id}-visor`}>
          <rect x="13" y="23" width="38" height="23" rx="11.5" />
        </clipPath>
      </defs>

      <g className="zc-m-bob">
        {/* antenna */}
        <line x1="32" y1="13" x2="32" y2="6" stroke="#3FA332" strokeWidth="2.5" strokeLinecap="round" />
        <circle className="zc-m-tip" cx="32" cy="5" r="3" fill="#A0E48F" />
        {/* waving hand */}
        <g className="zc-m-hand">
          <circle cx="57" cy="42" r="4" fill={`url(#${id}-body)`} />
        </g>
        {/* head */}
        <circle cx="32" cy="35" r="22" fill={`url(#${id}-body)`} />
        <ellipse cx="24" cy="20" rx="7" ry="3.5" fill="#fff" opacity=".25" />
        {/* visor */}
        <rect x="13" y="23" width="38" height="23" rx="11.5" fill="#0a0f1a" />
        <g clipPath={`url(#${id}-visor)`}>
          <rect className="zc-m-shimmer" x="-20" y="20" width="10" height="30" fill="#A0E48F" opacity=".25" transform="skewX(-20)" />
        </g>
        {/* eyes: open */}
        <g className="zc-m-eyes">
          <ellipse cx="25" cy="33" rx="3.4" ry="4.2" fill="#A0E48F" />
          <ellipse cx="39" cy="33" rx="3.4" ry="4.2" fill="#A0E48F" />
          <circle cx="26.2" cy="31.4" r="1.1" fill="#fff" />
          <circle cx="40.2" cy="31.4" r="1.1" fill="#fff" />
        </g>
        {/* eyes: happy arcs */}
        <g className="zc-m-happy-eyes" fill="none" stroke="#A0E48F" strokeWidth="2.4" strokeLinecap="round">
          <path d="M21.5 34 q3.5 -4.5 7 0" />
          <path d="M35.5 34 q3.5 -4.5 7 0" />
        </g>
        {/* mouths */}
        <path className="zc-m-smile" d="M28.5 40 q3.5 2.6 7 0" fill="none" stroke="#A0E48F" strokeWidth="2" strokeLinecap="round" />
        <path className="zc-m-grin" d="M27 39 q5 5 10 0 z" fill="#A0E48F" />
        <ellipse className="zc-m-talk" cx="32" cy="41" rx="3" ry="2" fill="#A0E48F" />
      </g>
    </svg>
  );
}
