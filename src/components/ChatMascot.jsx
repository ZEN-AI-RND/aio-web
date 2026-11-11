import React from "react";
import idleClip from "../assets/zara/zara-idle.webp";
import talkingClip from "../assets/zara/zara-talking.webp";
import happyClip from "../assets/zara/zara-happy.webp";
import thinkingClip from "../assets/zara/zara-thinking.webp";
import stillFrame from "../assets/zara/zara-still.webp";

/* ZARA's avatar, from the ZARA promo video (ZaraPromo.mp4): her head keyed
   off the studio background, steadied, and saved as animated WebP clips
   (15 fps, 200px, transparent). Frames were edited where the footage lacked
   the expression (rebuild: tools/zara-avatar/):

     idle      front -> her right -> front -> her left, 10s each, a blink on
               every return to front; first turn 5s after load (41s loop).
               Blinks every 3s the whole time.
     thinking  eyes and mouth closed (outro 312.0s), slow nod     (2.4s loop)
     talking   talking, from the promo's opening line            (3.1s loop)
     happy     smile and a wink, plays once, sparkles on top     (1.5s)

   `still` (old message avatars, reduced motion) shows a single frame.
   Round with a soft backdrop in the launcher; a plain cut-out inside the
   chat window (ChatWidget.css). */
const CLIPS = { idle: idleClip, talking: talkingClip, happy: happyClip, thinking: thinkingClip };

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function ChatMascot({ mood = "idle", still = false, className = "" }) {
  const src = still || reducedMotion ? stillFrame : CLIPS[mood] || idleClip;
  return (
    <span
      className={`zc-mascot zc-z ${className}`}
      data-mood={mood}
      data-still={still || undefined}
      aria-hidden="true"
      // her silhouette, so the thinking shimmer only lights her, not the box
      style={{ "--zc-face": `url("${stillFrame}")` }}
    >
      {/* key: a mood change restarts the clip from its first frame */}
      <img key={src} src={src} alt="" draggable="false" decoding="async" />
      <span className="zc-z-think">
        <i />
        <i />
        <i />
      </span>
      <span className="zc-z-spark zc-z-spark-1" />
      <span className="zc-z-spark zc-z-spark-2" />
    </span>
  );
}
