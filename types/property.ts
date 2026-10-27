export type PropertyCategory = "all" | "house" | "apartment" | "villa" | "penthouse";

export type ListingType = "FOR SALE" | "FOR RENT";

export interface FeaturedProperty {
  id: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number | string;
  area: string;
  imageUrl: string;
  imageAlt: string;
  badge: string;
  isFavorite?: boolean;
}

export interface MarketProperty {
  id: string;
  title: string;
  location: string;
  price: string;
  period?: string;
  listingType: ListingType;
  beds: number;
  baths: number;
  area: string;
  imageUrl: string;
  imageAlt: string;
  isFavorite?: boolean;
  visibilityClass?: string;
}

