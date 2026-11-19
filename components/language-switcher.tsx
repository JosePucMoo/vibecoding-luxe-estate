"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  localeMeta,
  locales,
  localePath,
  stripLocale,
  type Locale,
} from "@/i18n/config";
import { saveLocaleCookie } from "@/i18n/cookie";
import { useI18n } from "@/i18n/i18n-provider";

export default function LanguageSwitcher() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const changeLocale = (next: Locale) => {
    setIsOpen(false);
    if (next === locale) return;

    // Remember the explicit choice for future visits.
    saveLocaleCookie(next);

    // Same page in the new language, keeping filters / pagination.
    // Read the query string on click to avoid useSearchParams' Suspense requirement.
    const target = `${localePath(next, stripLocale(pathname))}${window.location.search}`;
    router.push(target);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={dict.language.switchTo}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-1 px-2 py-2 text-[#19322F] hover:text-[#006655] transition-colors cursor-pointer"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          {localeMeta[locale].flag}
        </span>
        <span className="text-sm font-semibold uppercase">{locale}</span>
        <span className="material-icons text-base leading-none">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label={dict.language.label}
          className="absolute right-0 mt-2 min-w-40 py-1 bg-white rounded-lg border border-[#19322F]/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] z-50"
        >
          {locales.map((code) => {
            const isActive = code === locale;
            return (
              <li key={code} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  lang={code}
                  onClick={() => changeLocale(code)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-sm text-left cursor-pointer transition-colors ${
                    isActive
                      ? "font-semibold text-[#006655] bg-[#006655]/5"
                      : "text-[#19322F] hover:bg-[#EEF6F6]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-lg leading-none">
                      {localeMeta[code].flag}
                    </span>
                    {localeMeta[code].label}
                  </span>
                  {isActive && (
                    <span className="material-icons text-base leading-none">
                      check
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
