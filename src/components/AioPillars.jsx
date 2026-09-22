import React from "react";
import { Database, Server } from "lucide-react";
import AiChipIcon from "./AiChipIcon";

/* The three-pillar row: what "Your AI. Your Data. Your Infra." means, one
   ringed icon each. Shared by the landing page's `#architecture` section and by
   every product detail page, so the claim reads the same wherever it appears.
   The headings above it belong to the host, since only the landing page
   carries them. */

const PILLARS = [
  {
    Icon: AiChipIcon,
    title: <>Local AI</>,
    body: "Full control, secure, and customizable AI that runs on your own infrastructure.",
  },
  {
    Icon: Database,
    title: <>Local knowledge base</>,
    body: "AI grounded in your trusted, up-to-date in-house knowledge.",
  },
  {
    Icon: Server,
    // The hyphenated word is the one that breaks badly on narrow columns.
    title: (
      <>
        <span className="whitespace-nowrap">On-premise</span> deployment
      </>
    ),
    body: (
      <>
        Your AI infrastructure, deployed{" "}
        <span className="whitespace-nowrap">on-premise</span> and kept entirely
        in Malaysia.
      </>
    ),
  },
];

export default function AioPillars({ className = "" }) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 ${className}`}
    >
      {PILLARS.map(({ Icon, title, body }, idx) => (
        <div
          key={idx}
          className="group p-5 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1"
        >
          <div className="mx-auto mb-3 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-green-500 bg-transparent shadow-[0_0_20px_rgba(80,192,64,0.35)]">
            <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
            {title}
          </h3>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400">{body}</p>
        </div>
      ))}
    </div>
  );
}
