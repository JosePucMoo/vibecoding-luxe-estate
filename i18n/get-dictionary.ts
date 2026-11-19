import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import type es from "./dictionaries/es.json";

/** The default dictionary (es) defines the shape; every other language must match it. */
export type Dictionary = typeof es;

// Add one line per language. `Record<Locale, …>` makes TypeScript fail if a locale
// declared in config.ts has no loader, or if a JSON is missing keys.
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  es: () => import("./dictionaries/es.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
};

/** Current locale from the `[lang]` root param (Server Components only). */
export async function getLocale(): Promise<Locale> {
  const current = await lang();
  if (!isLocale(current)) notFound();
  return current;
}

export function loadDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

/** Dictionary for the current locale (Server Components only). */
export async function getDictionary(): Promise<Dictionary> {
  return loadDictionary(await getLocale());
}
