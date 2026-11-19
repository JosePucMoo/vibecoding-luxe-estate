import { PropertyFilters } from "@/types/property";
import { localePath, type Locale } from "@/i18n/config";

export function buildFilterHref(
  filters: PropertyFilters,
  locale: Locale
): string {
  const params = new URLSearchParams();

  if (filters.q && filters.q.trim()) {
    params.set("q", filters.q.trim());
  }

  if (
    filters.type &&
    filters.type.trim() &&
    filters.type.toLowerCase() !== "all" &&
    filters.type.toLowerCase() !== "any type"
  ) {
    params.set("type", filters.type.trim());
  }

  if (filters.listingType) {
    params.set("listingType", filters.listingType);
  }

  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    params.set("minPrice", String(filters.minPrice));
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    params.set("maxPrice", String(filters.maxPrice));
  }

  if (filters.beds !== undefined && filters.beds > 0) {
    params.set("beds", String(filters.beds));
  }

  if (filters.baths !== undefined && filters.baths > 0) {
    params.set("baths", String(filters.baths));
  }

  if (filters.amenities && filters.amenities.length > 0) {
    params.set("amenities", filters.amenities.join(","));
  }

  if (filters.page !== undefined && filters.page > 1) {
    params.set("page", String(filters.page));
  }

  const queryString = params.toString();
  return localePath(locale, queryString ? `/?${queryString}` : "/");
}
