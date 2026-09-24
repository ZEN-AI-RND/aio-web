import React from "react";
import AioLogo from "./AioLogo";

/* A still illustration standing in for a detail page's headline and video,
   with the rotating AIO mark floating over the open palm. `about-hero.webp`
   is ZARA cut out of her grey backdrop with the globe she held painted out;
   the mark sits where the globe was, so the percentages below are that
   globe's centre and size in the 848 × 1245 image. The width comes from a
   height budget, like the hero video card, so the art never grows taller
   than the viewport; the "AIO" lettering is sized off that width (cqw) so it
   tracks the mark. The image is cut flat at the waist, so its bottom edge
   fades out into the page instead. */

export default function HeroArt({ src, alt }) {
  return (
    <div className="relative mx-auto [container-type:inline-size] aspect-[848/1245] w-[min(100%,calc((100svh-7rem)*0.681))]">
      <img
        src={src}
        alt={alt}
        className="block h-full w-full [mask-image:linear-gradient(to_bottom,black_85%,transparent)]"
      />
      <span className="absolute left-[20.2%] top-[48.4%] flex w-[25%] -translate-x-1/2 -translate-y-1/2 items-center justify-center aspect-square">
        <AioLogo className="logo-glow absolute inset-0 h-full w-full" />
        <span className="relative font-display font-extrabold text-[5.3cqw] leading-none tracking-[-0.01em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          AIO
        </span>
      </span>
    </div>
  );
}
