import React, { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

/* Video that buffers just before it is reached, plays only while on screen,
   and hands its decoder back once it is well out of the way.

   Three problems this solves:
   - A plain `autoplay` attribute starts every clip on mount, so the videos far
     below the fold compete for bandwidth with the hero on a phone.
   - Waiting for the element to be visible before fetching anything means the
     viewer watches it buffer, so the source is attached NEAR_MARGIN early.
   - Phones cap how many videos may hold a decoder at once. Past that cap the
     browser evicts one, and an evicted element that still has a `src` paints
     blank rather than falling back to its poster. Dropping the src when the
     clip is far away keeps the live count low and restores the poster.

   `muted playsinline` is also not enough on mobile: iOS Low Power Mode and
   Android Data Saver reject play() outright, and the rejection arrives as a
   silent promise. Catching it lets us offer a tap target, which supplies the
   user gesture those modes insist on. */

const NEAR_MARGIN = "600px"; // how early to start buffering
const RELEASE_DELAY = 1500; // ms out of range before the decoder is handed back

export default function AutoplayVideo({ className, src, ...props }) {
  const videoRef = useRef(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      setVisible(true);
      return;
    }

    const nearObserver = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: NEAR_MARGIN }
    );
    const viewObserver = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    nearObserver.observe(video);
    viewObserver.observe(video);

    return () => {
      nearObserver.disconnect();
      viewObserver.disconnect();
    };
  }, []);

  // Attach the source on approach; drop it once the clip has been out of range
  // long enough that this is not just a fast scroll past it.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (near) {
      if (video.getAttribute("src") !== src) {
        video.setAttribute("src", src);
        video.load();
      }
      return;
    }

    if (!video.getAttribute("src")) return;

    const timer = setTimeout(() => {
      video.pause();
      video.removeAttribute("src");
      video.load(); // frees the decoder and brings the poster back
      setBlocked(false);
    }, RELEASE_DELAY);

    return () => clearTimeout(timer);
  }, [near, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!visible) {
      video.pause();
      return;
    }
    if (!near) return;

    const started = video.play();
    // Pre-promise browsers return undefined from play() rather than a thenable.
    if (!started?.catch) return;
    started.then(() => setBlocked(false)).catch(() => setBlocked(true));
  }, [visible, near]);

  const playFromGesture = () => {
    videoRef.current
      ?.play()
      .then(() => setBlocked(false))
      .catch(() => setBlocked(true));
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className={className}
        muted
        loop
        playsInline
        controls
        preload="none"
        {...props}
      />
      {blocked && (
        <button
          type="button"
          onClick={playFromGesture}
          aria-label="Play video"
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/40 !text-white backdrop-blur-sm transition-colors hover:bg-black/50"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-green-500 bg-black/60">
            <Play className="ml-0.5 h-6 w-6" />
          </span>
          <span className="text-xs text-gray-300">Tap to play</span>
        </button>
      )}
    </div>
  );
}
