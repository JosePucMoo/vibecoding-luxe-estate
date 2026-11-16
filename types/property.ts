export type PropertyCategory = "all" | "house" | "apartment" | "villa" | "penthouse";

export type PropertyType =
  | "House"
  | "Apartment"
  | "Villa"
  | "Penthouse"
  | "Condo"
  | "Townhouse";

export type ListingType = "FOR SALE" | "FOR RENT";

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
