import { localeMeta, type Locale } from "./config";

/** Replaces `{name}` placeholders: format("Page {n}", { n: 2 }) → "Page 2" */
export function format(
  template: string,
  vars: Record<string, string | number> = {}
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match
  );
}

/**
 * Resolves plural forms stored as `<key>_one`, `<key>_other` (plus `_zero`, `_two`,
 * `_few`, `_many` for languages that need them) using Intl.PluralRules.
 */
export function plural(
  dict: Record<string, string>,
  key: string,
  count: number,
  locale: Locale,
  vars: Record<string, string | number> = {}
): string {
  const category = new Intl.PluralRules(localeMeta[locale].intl).select(count);
  const template =
    dict[`${key}_${category}`] ?? dict[`${key}_other`] ?? dict[key] ?? key;
  return format(template, { count, ...vars });
}

/**
 * Looks up the translated label of a database value (property type, amenity, …).
 * Falls back to the raw value so new values added in the DB never break the UI.
 */
export function label(map: Record<string, string>, value: string): string {
  return map[value] ?? value;
}

export function formatNumber(value: number, locale: Locale): string {
  return value.toLocaleString(localeMeta[locale].intl);
}
