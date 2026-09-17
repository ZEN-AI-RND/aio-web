import React from "react";
import { ArrowUp } from "lucide-react";

/* Floating scroll-to-top button, shared by the landing page and the product
   detail pages. Fixed to the viewport, so where it sits in the tree only
   decides paint order. */

export default function ScrollToTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-[#0a0f1a]/80 backdrop-blur-xl border border-green-500/40 hover:border-green-400 hover:bg-[#0a0f1a] text-green-400 p-3 sm:p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50"
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
  );
}
