export type PropertyCategory = "all" | "house" | "apartment" | "villa" | "penthouse";

export const PROPERTY_TYPES = [
  "House",
  "Apartment",
  "Villa",
  "Penthouse",
  "Condo",
  "Townhouse",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const LISTING_TYPES = ["FOR SALE", "FOR RENT"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const PROPERTY_STATUSES = ["published", "draft", "sold"] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const CANONICAL_AMENITIES = [
  "Swimming Pool",
  "Gym",
  "Parking",
  "Air Conditioning",
  "High-speed Wifi",
  "Patio / Terrace",
  "Smart Home System",
  "Wine Cellar",
] as const;

export interface PropertyFilters {
  q?: string;
  type?: string;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  amenities?: string[];
  page?: number;
}

export interface PropertyImage {
  url: string;
  alt: string;
}

export interface PropertyAgent {
  name: string;
  role: string;
  imageUrl: string;
}

export interface FeaturedProperty {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number | string;
  area: string;
  imageUrl: string;
  imageAlt: string;
  images: PropertyImage[];
  badge: string;
  isFavorite?: boolean;
}

export interface MarketProperty {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: string;
  period?: string;
  listingType: ListingType;
  beds: number;
  baths: number | string;
  area: string;
  imageUrl: string;
  imageAlt: string;
  images: PropertyImage[];
  isFavorite?: boolean;
  visibilityClass?: string;
}

export interface PropertyDetail {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: string;
  period?: string;
  listingType: ListingType;
  beds: number;
  baths: number | string;
  area: string;
  garage: number;
  description: string[];
  amenities: string[];
  badges: string[];
  isFeatured: boolean;
  featuredBadge?: string;
  latitude: number;
  longitude: number;
  agent: PropertyAgent;
  estimatedPayment: string;
  images: PropertyImage[];
  isFavorite?: boolean;
}

export interface PaginatedMarketProperties {
  properties: MarketProperty[];
  total: number;
  totalPages: number;
  currentPage: number;
}
