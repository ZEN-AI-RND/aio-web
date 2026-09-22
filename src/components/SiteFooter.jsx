import React from "react";
import { ArrowUpRight, Database, Server } from "lucide-react";
import AioLogo from "./AioLogo";
import AiChipIcon from "./AiChipIcon";

/* Site footer, shared by the landing page and the product detail pages.

   The quick links point at landing-page sections, and `onNavigate` is what takes
   the reader there: on the landing page it scrolls to the section, and on a
   detail page, where those sections are not mounted, it returns home first and
   scrolls afterwards. */

// Same destinations as the top menu (SiteHeader.jsx). The column they sit in
// is headed "Why AIO".
const QUICK_LINKS = [
  { label: "Architecture", href: "#architecture" },
  { label: "Solutions", href: "#zara" },
  { label: "Benefit", href: "#benefit" },
  { label: "About", href: "#" },
];

// Same list as the top menu's Solutions dropdown. A plain string has no detail
// page yet, so it stays inert text; an entry with an `href` opens that
// product's detail page, same as the top menu.
const SOLUTIONS = [
  { label: "ZARA", href: "#zara", opensPage: true },
  { label: "ZARA x AIO Agent", href: "#zara-agent", opensPage: true },
  { label: "AIO Form Filler", href: "#form-filler", opensPage: true },
  "AIO Form Checker",
  "AIO Insight",
  "AIO Forecast",
  "AIO Lab",
  "AIO Code",
];

const ARCHITECTURE = [
  { label: "Local AI", icon: AiChipIcon },
  { label: "Local knowledge base", icon: Database },
  { label: "On-premise deployment", icon: Server },
];

export default function SiteFooter({ onNavigate, onOpenPage }) {
  const handleClick = (event, href) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(href);
  };

  const handleSolutionClick = (event, item) => {
    if (item.opensPage && onOpenPage) {
      event.preventDefault();
      onOpenPage(item.href);
      return;
    }
    handleClick(event, item.href);
  };

  return (
    <footer className="p-5 rounded-2xl bg-[#0a0f1a]/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg mb-4">
              {/* Footer brand: the hero mark with the AIO initials set in
                  the ring. The mark's hole is 71.7% of its canvas, so the
                  initials sit at ~0.34em of the container to stay clear of
                  the strands. */}
              <span className="relative inline-block">
                <span className="relative inline-flex h-16 w-16 items-center justify-center text-[4rem]">
                  <AioLogo className="absolute inset-0 h-full w-full" />
                  <span className="relative font-display font-extrabold text-[0.26em] leading-none tracking-[-0.01em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    AIO
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="absolute right-1 top-1.5 text-[0.6rem] font-semibold leading-none text-gray-400"
                >
                  ™
                </span>
                <span className="sr-only">AI Office</span>
              </span>
            </h3>

            <p className="text-sm text-gray-400 mb-2">
              AI Office. The intelligent workspace for organizations with
              sovereign, secure, and sustainable AI.
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Your AI. Your Data. Your Infra.
            </p>
          </div>

          {/* Why AIO — the quick links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Why AIO</h3>
            <ul className="space-y-2 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(event) => handleClick(event, link.href)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Solutions</h3>
            <ul className="space-y-2 text-sm">
              {SOLUTIONS.map((item) => {
                const label = typeof item === "string" ? item : item.label;
                return (
                  <li key={label} className="text-gray-400">
                    {typeof item === "string" ? (
                      label
                    ) : (
                      <a
                        href={item.href}
                        onClick={(event) => handleSolutionClick(event, item)}
                        className="hover:text-white transition-colors"
                      >
                        {label}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Architecture */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Architecture</h3>
            <ul className="space-y-3 text-sm">
              {ARCHITECTURE.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.label} className="flex items-center">
                    <span className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-green-500 bg-transparent shadow-[0_0_12px_rgba(80,192,64,0.35)]">
                      <Icon className="w-4 h-4 text-green-500" />
                    </span>
                    <span className="text-gray-400">{feature.label}</span>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-green-500 px-5 py-2.5 text-sm font-medium text-black transition-colors duration-300 hover:bg-green-400"
            >
              Request Demo
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-400 text-center sm:text-left">
              <p>&copy; 2026 AI Office. All rights reserved.</p>
              <p className="mt-1">Co-created with ZARA</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">🇲🇾 Made in Malaysia</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
