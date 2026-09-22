import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

/* Full-demo overlay. Playback starts from the click that opened it, so the
   browser counts it as a user gesture and lets the video run with sound —
   none of the muted-autoplay restrictions apply here. */

export default function VideoModal({ src, poster, label, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // Keep the page behind the overlay from scrolling under the finger.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 !text-white transition-colors hover:bg-white/10"
      >
        <X className="h-5 w-5" />
      </button>
      <video
        // The click lands on the backdrop otherwise and closes the dialog.
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85vh] w-full max-w-5xl rounded-xl bg-black"
        src={src}
        poster={poster}
        autoPlay
        controls
        playsInline
      />
    </div>
  );
}
