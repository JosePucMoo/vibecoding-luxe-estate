import { cache } from "react";
import { supabase } from "./supabase";
import {
  FeaturedProperty,
  ListingType,
  MarketProperty,
  PaginatedMarketProperties,
  PropertyDetail,
  PropertyFilters,
  PropertyImage,
} from "@/types/property";

export const MARKET_PAGE_SIZE = 8;
export const FEATURED_PROPERTIES_LIMIT = 2;

const DEFAULT_FALLBACK_IMAGE: PropertyImage = {
  url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjNDU9iE4zwPuWeg-CjIrLI-87GF24_LgOggcXT0vmUYfMx2q1dJAheiqWqVN-39uiwyLKEfP18FsG1vtUyAPX902OhGEfM4clcQiDsJW7MBbc_BoMtZXtqIeFKIfkHnkIPwmFbQg8Eaan6ULV99T8AUVUuKsro0HoTMrIaxw5pp1uSuQlF8X5Dait4US1W4vmyZnVioXbFnCoaOOZ0LPorb0rVGAIQd9reWcpqq27C0oO4ltnsCTHIcjIm0xp-2qVbRJSIZzWPv0",
  alt: "Luxury residence exterior",
};

interface FeaturedPropertyRow {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number | string;
  area: string;
  featured_badge: string | null;
  images: PropertyImage[] | null;
  is_favorite: boolean;
  sort_order: number;
}

interface MarketPropertyRow {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: string;
  period: string | null;
  listing_type: ListingType;
  beds: number;
  baths: number | string;
  area: string;
  images: PropertyImage[] | null;
  is_favorite: boolean;
  sort_order: number;
}

interface PropertyDetailRow {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: string;
  period: string | null;
  listing_type: ListingType;
  beds: number;
  baths: number | string;
  area: string;
  garage: number;
  description: string[] | null;
  amenities: string[] | null;
  badges: string[] | null;
  is_featured: boolean;
  featured_badge: string | null;
  latitude: number;
  longitude: number;
  agent_name: string;
  agent_role: string;
  agent_image: string;
  estimated_payment: string | null;
  images: PropertyImage[] | null;
  is_favorite: boolean;
}

function normalizeImages(
  images: PropertyImage[] | null | undefined,
  fallbackTitle: string
): PropertyImage[] {
  if (!Array.isArray(images) || images.length === 0) {
    return [{ url: DEFAULT_FALLBACK_IMAGE.url, alt: fallbackTitle }];
  }

  return images
    .filter((img) => Boolean(img && typeof img.url === "string" && img.url.trim()))
    .map((img, index) => ({
      url: img.url,
      alt: img.alt?.trim() || `${fallbackTitle} - Photo ${index + 1}`,
    }));
}

function formatBaths(baths: number | string): number | string {
  const num = typeof baths === "string" ? parseFloat(baths) : baths;
  if (Number.isNaN(num)) return baths;
  return Number.isInteger(num) ? num : num;
}

function mapFeaturedProperty(row: FeaturedPropertyRow): FeaturedProperty {
  const normalizedImages = normalizeImages(row.images, row.title);
  const primaryImage = normalizedImages[0];

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    price: row.price,
    beds: row.beds,
    baths: formatBaths(row.baths),
    area: row.area,
    badge: row.featured_badge ?? "",
    imageUrl: primaryImage.url,
    imageAlt: primaryImage.alt,
    images: normalizedImages,
    isFavorite: row.is_favorite,
  };
}

function mapMarketProperty(row: MarketPropertyRow): MarketProperty {
  const normalizedImages = normalizeImages(row.images, row.title);
  const primaryImage = normalizedImages[0];

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    price: row.price,
    period: row.period ?? undefined,
    listingType: row.listing_type,
    beds: row.beds,
    baths: formatBaths(row.baths),
    area: row.area,
    imageUrl: primaryImage.url,
    imageAlt: primaryImage.alt,
    images: normalizedImages,
    isFavorite: row.is_favorite,
  };
}

function mapPropertyDetail(row: PropertyDetailRow): PropertyDetail {
  const normalizedImages = normalizeImages(row.images, row.title);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    price: row.price,
    period: row.period ?? undefined,
    listingType: row.listing_type,
    beds: row.beds,
    baths: formatBaths(row.baths),
    area: row.area,
    garage: row.garage ?? 2,
    description:
      row.description && row.description.length > 0
        ? row.description
        : [
            `Experience modern luxury in ${row.title}, located in ${row.location}. Designed with an emphasis on indoor-outdoor living, this residence features expansive windows that flood the interiors with natural light.`,
            "The open-concept layout is equipped with premium finishes and custom cabinetry, offering an exceptional sanctuary for contemporary living.",
          ],
    amenities:
      row.amenities && row.amenities.length > 0
        ? row.amenities
        : [
            "Smart Home System",
            "Swimming Pool",
            "Central Heating & Cooling",
            "Electric Vehicle Charging",
            "Private Gym",
            "Wine Cellar",
          ],
    badges:
      row.badges && row.badges.length > 0 ? row.badges : ["Premium", "New"],
    isFeatured: row.is_featured,
    featuredBadge: row.featured_badge ?? undefined,
    latitude: row.latitude ?? 37.4419,
    longitude: row.longitude ?? -122.143,
    agent: {
      name: row.agent_name || "Sarah Jenkins",
      role: row.agent_role || "Top Rated Agent",
      imageUrl:
        row.agent_image ||
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w",
    },
    estimatedPayment: row.estimated_payment || "$5,430/mo",
    images: normalizedImages,
    isFavorite: row.is_favorite,
  };
}

export async function getFeaturedProperties(): Promise<FeaturedProperty[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, slug, title, location, price, beds, baths, area, featured_badge, images, is_favorite, sort_order"
    )
    .eq("is_active", true)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(FEATURED_PROPERTIES_LIMIT);

  if (error) {
    console.error("Error fetching featured properties:", error);
    throw new Error(`Failed to fetch featured properties: ${error.message}`);
  }

  return (data as FeaturedPropertyRow[]).map(mapFeaturedProperty);
}

export function hasActiveFilters(filters: PropertyFilters): boolean {
  return Boolean(
    (filters.q && filters.q.trim().length > 0) ||
      (filters.type &&
        filters.type.trim().length > 0 &&
        filters.type.toLowerCase() !== "all" &&
        filters.type.toLowerCase() !== "any type") ||
      filters.listingType ||
      (filters.minPrice !== undefined && filters.minPrice > 0) ||
      (filters.maxPrice !== undefined && filters.maxPrice > 0) ||
      (filters.beds !== undefined && filters.beds > 0) ||
      (filters.baths !== undefined && filters.baths > 0) ||
      (filters.amenities && filters.amenities.length > 0)
  );
}

export async function getMarketProperties(
  filtersOrPage: number | PropertyFilters = 1
): Promise<PaginatedMarketProperties> {
  const filters: PropertyFilters =
    typeof filtersOrPage === "number"
      ? { page: filtersOrPage }
      : filtersOrPage;

  const validPage = Math.max(1, Math.floor(filters.page ?? 1) || 1);
  const from = (validPage - 1) * MARKET_PAGE_SIZE;
  const to = from + MARKET_PAGE_SIZE - 1;
  const filteringActive = hasActiveFilters(filters);

  let query = supabase
    .from("properties")
    .select(
      "id, slug, title, location, price, period, listing_type, beds, baths, area, images, is_favorite, sort_order",
      { count: "exact" }
    )
    .eq("is_active", true)
    .eq("status", "published");

  if (!filteringActive) {
    query = query.eq("is_featured", false);
  }

  if (filters.q && filters.q.trim()) {
    const safeQ = filters.q.trim().replace(/[,()]/g, " ").trim();
    if (safeQ) {
      query = query.or(
        `title.ilike.%${safeQ}%,location.ilike.%${safeQ}%,property_type.ilike.%${safeQ}%`
      );
    }
  }

  if (
    filters.type &&
    filters.type.trim() &&
    filters.type.toLowerCase() !== "all" &&
    filters.type.toLowerCase() !== "any type"
  ) {
    query = query.ilike("property_type", filters.type.trim());
  }

  if (filters.listingType) {
    query = query.eq("listing_type", filters.listingType);
  }

  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    query = query.gte("price_value", filters.minPrice);
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    query = query.lte("price_value", filters.maxPrice);
  }

  if (filters.beds !== undefined && filters.beds > 0) {
    query = query.gte("beds", filters.beds);
  }

  if (filters.baths !== undefined && filters.baths > 0) {
    query = query.gte("baths", filters.baths);
  }

  if (filters.amenities && filters.amenities.length > 0) {
    query = query.contains("amenities", filters.amenities);
  }

  const { data, error, count } = await query
    .order("sort_order", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("Error fetching market properties:", error);
    throw new Error(`Failed to fetch market properties: ${error.message}`);
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / MARKET_PAGE_SIZE));

  return {
    properties: (data as MarketPropertyRow[]).map(mapMarketProperty),
    total,
    totalPages,
    currentPage: validPage,
  };
}

export async function countMatchingProperties(
  filters: PropertyFilters
): Promise<number> {
  const filteringActive = hasActiveFilters(filters);

  let query = supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("status", "published");

  if (!filteringActive) {
    query = query.eq("is_featured", false);
  }

  if (filters.q && filters.q.trim()) {
    const safeQ = filters.q.trim().replace(/[,()]/g, " ").trim();
    if (safeQ) {
      query = query.or(
        `title.ilike.%${safeQ}%,location.ilike.%${safeQ}%,property_type.ilike.%${safeQ}%`
      );
    }
  }

  if (
    filters.type &&
    filters.type.trim() &&
    filters.type.toLowerCase() !== "all" &&
    filters.type.toLowerCase() !== "any type"
  ) {
    query = query.ilike("property_type", filters.type.trim());
  }

  if (filters.listingType) {
    query = query.eq("listing_type", filters.listingType);
  }

  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    query = query.gte("price_value", filters.minPrice);
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    query = query.lte("price_value", filters.maxPrice);
  }

  if (filters.beds !== undefined && filters.beds > 0) {
    query = query.gte("beds", filters.beds);
  }

  if (filters.baths !== undefined && filters.baths > 0) {
    query = query.gte("baths", filters.baths);
  }

  if (filters.amenities && filters.amenities.length > 0) {
    query = query.contains("amenities", filters.amenities);
  }

  const { count, error } = await query;
  if (error) {
    console.error("Error counting matching properties:", error);
    return 0;
  }

  return count ?? 0;
}

export const getPropertyBySlug = cache(
  async (slug: string): Promise<PropertyDetail | null> => {
    const { data, error } = await supabase
      .from("properties")
      .select(
        "id, slug, title, location, price, period, listing_type, beds, baths, area, garage, description, amenities, badges, is_featured, featured_badge, latitude, longitude, agent_name, agent_role, agent_image, estimated_payment, images, is_favorite"
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      console.error(`Error fetching property with slug "${slug}":`, error);
      throw new Error(`Failed to fetch property: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return mapPropertyDetail(data as PropertyDetailRow);
  }
);
