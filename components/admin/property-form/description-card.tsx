"use client";

import { useRef } from "react";
import { format } from "@/i18n/format";
import { useI18n } from "@/i18n/i18n-provider";

const MAX_DESCRIPTION_CHARS = 2000;

interface DescriptionCardProps {
  description: string;
  onChange: (value: string) => void;
}

export default function DescriptionCard({
  description,
  onChange,
}: DescriptionCardProps) {
  const { dict } = useI18n();
  const t = dict.admin.propertyForm;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const applyFormat = (kind: "bold" | "italic" | "list") => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart ?? description.length;
    const end = el.selectionEnd ?? description.length;
    const selected = description.slice(start, end);

    let replacement = "";
    let cursorOffset = 0;

    if (kind === "bold") {
      const content = selected || "text";
      replacement = `**${content}**`;
      cursorOffset = selected ? replacement.length : 2 + content.length;
    } else if (kind === "italic") {
      const content = selected || "text";
      replacement = `*${content}*`;
      cursorOffset = selected ? replacement.length : 1 + content.length;
    } else {
      const lines = (selected || "Feature item").split("\n");
      replacement = lines
        .map((line) => (line.startsWith("• ") ? line : `• ${line}`))
        .join("\n");
      cursorOffset = replacement.length;
    }

    const nextValue = (
      description.slice(0, start) +
      replacement +
      description.slice(end)
    ).slice(0, MAX_DESCRIPTION_CHARS);

    onChange(nextValue);

    requestAnimationFrame(() => {
      el.focus();
      const pos = Math.min(start + cursorOffset, nextValue.length);
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
        <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
          <span className="material-icons text-lg leading-none">
            description
          </span>
        </div>
        <h2 className="text-xl font-bold text-nordic">{t.descriptionTitle}</h2>
      </div>

      <div className="p-8">
        <div className="mb-3 flex gap-2 border-b border-gray-100 pb-2">
          <button
            type="button"
            title={t.bold}
            aria-label={t.bold}
            onClick={() => applyFormat("bold")}
            className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors cursor-pointer"
          >
            <span className="material-icons text-lg leading-none">
              format_bold
            </span>
          </button>
          <button
            type="button"
            title={t.italic}
            aria-label={t.italic}
            onClick={() => applyFormat("italic")}
            className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors cursor-pointer"
          >
            <span className="material-icons text-lg leading-none">
              format_italic
            </span>
          </button>
          <button
            type="button"
            title={t.bulletList}
            aria-label={t.bulletList}
            onClick={() => applyFormat("list")}
            className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors cursor-pointer"
          >
            <span className="material-icons text-lg leading-none">
              format_list_bulleted
            </span>
          </button>
        </div>

        <textarea
          ref={textareaRef}
          id="property-description"
          maxLength={MAX_DESCRIPTION_CHARS}
          value={description}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_DESCRIPTION_CHARS))}
          placeholder={t.descriptionPlaceholder}
          className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base leading-relaxed resize-y min-h-[200px]"
        />

        <div className="mt-2 text-right text-xs text-gray-400">
          {format(t.charactersCount, { count: description.length })}
        </div>
      </div>
    </div>
  );
}
