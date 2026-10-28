import { supabase } from "./supabase";
import {
  FeaturedProperty,
  MarketProperty,
  PaginatedMarketProperties,
} from "@/types/property";

export const MARKET_PAGE_SIZE = 8;

interface FeaturedPropertyRow {
  id: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: string;
  area: string;
  badge: string;
  image_url: string;
  image_alt: string;
  is_favorite: boolean;
  sort_order: number;
}

interface MarketPropertyRow {
  id: string;
  title: string;
  location: string;
  price: string;
  period: string | null;
  listing_type: "FOR SALE" | "FOR RENT";
  beds: number;
  baths: number;
  area: string;
  image_url: string;
  image_alt: string;
  is_favorite: boolean;
  sort_order: number;
}

function mapFeaturedProperty(row: FeaturedPropertyRow): FeaturedProperty {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    price: row.price,
    beds: row.beds,
    baths: row.baths,
    area: row.area,
    badge: row.badge,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    isFavorite: row.is_favorite,
  };
}

function mapMarketProperty(row: MarketPropertyRow): MarketProperty {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    price: row.price,
    period: row.period ?? undefined,
    listingType: row.listing_type,
    beds: row.beds,
    baths: row.baths,
    area: row.area,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    isFavorite: row.is_favorite,
  };
}

export async function getFeaturedProperties(): Promise<FeaturedProperty[]> {
  const { data, error } = await supabase
    .from("featured_properties")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching featured properties:", error);
    throw new Error(`Failed to fetch featured properties: ${error.message}`);
  }

  return (data as FeaturedPropertyRow[]).map(mapFeaturedProperty);
}

export async function getMarketProperties(
  page: number = 1
): Promise<PaginatedMarketProperties> {
  const validPage = Math.max(1, Math.floor(page) || 1);
  const from = (validPage - 1) * MARKET_PAGE_SIZE;
  const to = from + MARKET_PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("market_properties")
    .select("*", { count: "exact" })
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

