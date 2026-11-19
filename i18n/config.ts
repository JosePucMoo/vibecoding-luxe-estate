/**
 * i18n configuration — single source of truth.
 *
 * To add a language:
 *   1. Add its code to `locales` and an entry to `localeMeta`.
 *   2. Create `i18n/dictionaries/<code>.json` (copy `es.json` and translate the values).
 *   3. Register the loader in `i18n/get-dictionary.ts`.
 * See README.md ("Agregar un idioma").
 */
export const locales = ["es", "en", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year, in seconds

/** `label`: name shown in the language switcher. `flag`: emoji next to it. `intl`: BCP-47 tag for Intl/number formatting. */
export const localeMeta: Record<Locale, { label: string; flag: string; intl: string }> = {
  es: { label: "Español", flag: "🇪🇸", intl: "es" },
  en: { label: "English", flag: "🇺🇸", intl: "en-US" },
  fr: { label: "Français", flag: "🇫🇷", intl: "fr" },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Prefixes a path with the locale: localePath("fr", "/?q=x") → "/fr?q=x" */
export function localePath(locale: Locale, path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  if (normalized.startsWith("/?")) return `/${locale}${normalized.slice(1)}`;
  return `/${locale}${normalized}`;
}

/** Removes the locale prefix from a pathname: "/fr/properties/x" → "/properties/x" */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  if (isLocale(first)) return `/${rest.join("/")}`;
  return pathname;
}

/**
 * Picks the best supported locale from an Accept-Language header.
 * Matches by full tag first, then by primary subtag (es-MX → es, fr-CA → fr).
 */
export function negotiateLocale(
  acceptLanguage: string | null | undefined
): Locale | undefined {
  if (!acceptLanguage) return undefined;

  const requested = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const quality = q ? parseFloat(q.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), quality };
    })
    .filter((entry) => entry.tag && entry.tag !== "*" && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of requested) {
    const exact = locales.find((l) => l.toLowerCase() === tag);
    if (exact) return exact;
    const primary = tag.split("-")[0];
    const match = locales.find((l) => l.toLowerCase() === primary);
    if (match) return match;
  }
  return undefined;
}
