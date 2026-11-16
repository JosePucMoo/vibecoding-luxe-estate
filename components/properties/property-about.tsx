"use client";

import { useState } from "react";

interface PropertyAboutProps {
  description: string[];
}

export default function PropertyAbout({ description }: PropertyAboutProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleParagraphs = isExpanded ? description : description.slice(0, 2);
  const hasExtraParagraphs = description.length > 2;

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-[#006655]/5">
      <h2 className="text-lg font-semibold mb-4 text-[#19322F]">
        About this home
      </h2>
      <div className="prose prose-slate max-w-none text-[#19322F]/70 leading-relaxed space-y-4">
        {visibleParagraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="mt-4 text-[#006655] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
      >
        {hasExtraParagraphs && isExpanded ? "Read less" : "Read more"}
        <span className="material-icons text-sm leading-none">
          {hasExtraParagraphs && isExpanded ? "arrow_upward" : "arrow_forward"}
        </span>
      </button>
    </div>
  );
}
