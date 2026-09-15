import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import AioLogo from "./AioLogo";

/* Top menu. Transparent over the hero and pinned to the top at every width;
   once the page scrolls it picks up a light blur, so the links stay readable
   over the videos. Below lg the links fold into a hamburger panel.

   Anchor targets are the `id`s set on the matching sections in App.jsx. */

const SOLUTIONS = [
  { label: "ZARA", href: "#zara" },
  { label: "ZARA x AIO Agent", href: "#zara-agent" },
  { label: "AIO Form Filler", href: "#form-filler" },
  { label: "AIO Form Checker", href: "#form-checker" },
  { label: "AIO Insight", href: "#insight" },
  { label: "AIO Forecast", href: "#forecast" },
  { label: "AIO Lab", href: "#lab" },
  { label: "AIO Code", href: "#code" },
];

const DEMO_HREF = "#";

const linkClass =
  "text-[1.0625rem] text-white transition-colors duration-200 hover:text-green-400";

function Logo() {
  return (
    <a href="#" aria-label="AI Office home" className="relative inline-block">
      {/* Same lockup as the footer brand, scaled down. */}
      <span className="relative inline-flex h-14 w-14 items-center justify-center text-[3.5rem] lg:h-16 lg:w-16 lg:text-[4rem]">
        <AioLogo className="absolute inset-0 h-full w-full" />
        <span className="relative font-display font-extrabold text-[0.26em] leading-none tracking-[-0.01em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          AIO
        </span>
      </span>
      <span
        aria-hidden="true"
        className="absolute -right-1 top-0.5 text-[0.55rem] font-semibold leading-none text-gray-400"
      >
        ™
      </span>
    </a>
  );
}

function DemoButton({ className = "" }) {
  return (
    <a
      href={DEMO_HREF}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-green-500 px-5 py-2.5 text-base font-medium text-black transition-colors duration-300 hover:bg-green-400 ${className}`}
    >
      Book a Demo
      <ArrowUpRight className="h-5 w-5" />
    </a>
  );
}

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const solutionsRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the desktop dropdown on an outside click or Escape.
  useEffect(() => {
    if (!solutionsOpen) return;
    const onPointerDown = (event) => {
      if (!solutionsRef.current?.contains(event.target)) setSolutionsOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSolutionsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [solutionsOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileSolutionsOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/40 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:grid lg:h-20 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <div className="lg:justify-self-start">
          <Logo />
        </div>

        {/* Desktop links */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            <li>
              <a href="#philosophy" className={linkClass}>
                Philosophy
              </a>
            </li>
            <li
              ref={solutionsRef}
              className="relative"
              // Hover is mouse-only: on a touchscreen laptop the tap would
              // open it via hover and then close it again via the click.
              onPointerEnter={(event) =>
                event.pointerType === "mouse" && setSolutionsOpen(true)
              }
              onPointerLeave={(event) =>
                event.pointerType === "mouse" && setSolutionsOpen(false)
              }
            >
              <button
                type="button"
                aria-expanded={solutionsOpen}
                aria-controls="solutions-menu"
                onClick={() => setSolutionsOpen((open) => !open)}
                className={`${linkClass} inline-flex items-center gap-1.5`}
              >
                Solutions
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    solutionsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {/* pt-4 bridges the gap so the pointer can travel to the panel
                  without leaving the hover area. */}
              <div
                id="solutions-menu"
                hidden={!solutionsOpen}
                className="absolute left-1/2 top-full -translate-x-1/2 pt-4"
              >
                <ul className="w-60 rounded-xl border border-white/10 bg-[#0a0f1a]/90 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                  {SOLUTIONS.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={() => setSolutionsOpen(false)}
                        className="block rounded-lg px-4 py-2.5 text-[0.9375rem] text-gray-300 transition-colors hover:bg-white/5 hover:text-green-400"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
            <li>
              <a href="#benefit" className={linkClass}>
                Benefit
              </a>
            </li>
            <li>
              <a href="#" className={linkClass}>
                About
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2 lg:justify-self-end">
          <DemoButton className="hidden lg:inline-flex" />
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-md text-green-500 transition-colors hover:bg-white/10 hover:text-green-400 lg:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <nav
        id="mobile-menu"
        aria-label="Main"
        hidden={!mobileOpen}
        className="mx-4 max-h-[calc(100svh-5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#0a0f1a]/95 p-3 backdrop-blur-xl sm:mx-6 lg:hidden"
      >
        <ul className="flex flex-col">
          <li>
            <a href="#philosophy" onClick={closeMobile} className="block rounded-lg px-4 py-3 text-lg text-white hover:bg-white/5">
              Philosophy
            </a>
          </li>
          <li>
            <button
              type="button"
              aria-expanded={mobileSolutionsOpen}
              aria-controls="mobile-solutions"
              onClick={() => setMobileSolutionsOpen((open) => !open)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-lg text-white hover:bg-white/5"
            >
              Solutions
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-200 ${
                  mobileSolutionsOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <ul id="mobile-solutions" hidden={!mobileSolutionsOpen} className="mb-1 ml-4 border-l border-white/10 pl-2">
              {SOLUTIONS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={closeMobile}
                    className="block rounded-lg px-4 py-2.5 text-base text-gray-300 hover:bg-white/5 hover:text-green-400"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <a href="#benefit" onClick={closeMobile} className="block rounded-lg px-4 py-3 text-lg text-white hover:bg-white/5">
              Benefit
            </a>
          </li>
          <li>
            <a href="#" onClick={closeMobile} className="block rounded-lg px-4 py-3 text-lg text-white hover:bg-white/5">
              About
            </a>
          </li>
        </ul>
        <DemoButton className="mt-3 w-full" />
      </nav>
    </header>
  );
}
