import React from "react";

// AI chip icon: lucide-style CPU outline with "AI" lettering inside
const AiChipIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="5" y="5" width="14" height="14" rx="2" />
    <path d="M9 2v3M12 2v3M15 2v3M9 19v3M12 19v3M15 19v3M2 9h3M2 12h3M2 15h3M19 9h3M19 12h3M19 15h3" />
    <text
      x="12"
      y="12.5"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="8"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      AI
    </text>
  </svg>
);

export default AiChipIcon;
