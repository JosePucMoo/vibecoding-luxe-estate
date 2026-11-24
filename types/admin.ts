import {
  LISTING_TYPES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  type ListingType,
  type PropertyImage,
  type PropertyStatus,
  type PropertyType,
} from "./property";

export const USER_ROLES = ["admin", "broker", "agent", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["active", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}

export function isUserStatus(value: unknown): value is UserStatus {
  return typeof value === "string" && (USER_STATUSES as readonly string[]).includes(value);
}

export function isPropertyType(value: unknown): value is PropertyType {
  return typeof value === "string" && (PROPERTY_TYPES as readonly string[]).includes(value);
}

export function isListingType(value: unknown): value is ListingType {
  return typeof value === "string" && (LISTING_TYPES as readonly string[]).includes(value);
}

export function isPropertyStatus(value: unknown): value is PropertyStatus {
  return (
    typeof value === "string" &&
    (PROPERTY_STATUSES as readonly string[]).includes(value)
  );
}

export interface AdminUserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  provider: string | null;
  role: UserRole;
  status: UserStatus;
  lastSignInAt: string | null;
}

export interface AdminProperty {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: string;
  period?: string;
  listingType: ListingType;
  propertyType: string;
  status: PropertyStatus;
  beds: number;
  baths: number | string;
  area: string;
  isFeatured: boolean;
  estimatedPayment?: string;
  imageUrl: string;
  imageAlt: string;
}

export interface AdminPropertyRecord {
  id: string;
  slug: string;
  title: string;
  location: string;
  priceValue: number;
  period: string | null;
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  beds: number;
  baths: number;
  area: number;
  yearBuilt: number | null;
  garage: number;
  description: string[];
  amenities: string[];
  badges: string[];
  isFeatured: boolean;
  featuredBadge: string | null;
  latitude: number;
  longitude: number;
  agentName: string;
  agentRole: string;
  agentImage: string;
  estimatedPayment: string | null;
  images: PropertyImage[];
}

export interface PropertyFormPayload {
  title: string;
  slug: string;
  priceValue: number;
  period?: string;
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  description: string;
  images: PropertyImage[];
  location: string;
  latitude: number;
  longitude: number;
  area: number;
  yearBuilt: number | null;
  beds: number;
  baths: number;
  garage: number;
  amenities: string[];
  badges: string[];
  isFeatured: boolean;
  featuredBadge?: string;
  estimatedPayment?: string;
  agentName: string;
  agentRole: string;
  agentImage: string;
}

export type PropertyFieldErrorKey =
  | "title"
  | "slug"
  | "priceValue"
  | "location"
  | "latitude"
  | "longitude"
  | "area"
  | "yearBuilt"
  | "images"
  | "agentName"
  | "agentRole"
  | "agentImage";

export type PropertyMutationResult =
  | { ok: true; id: string; slug: string }
  | {
      ok: false;
      error: "forbidden" | "invalid" | "slug_taken" | "not_found" | "generic";
      fieldErrors?: Partial<Record<PropertyFieldErrorKey, string>>;
    };

export interface AdminPropertyStats {
  total: number;
  forSale: number;
  forRent: number;
  featured: number;
}

export interface AdminPage<T> {
  items: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export type RoleCounts = Record<UserRole | "all", number>;

export type UpdateUserResult =
  | { ok: true }
  | { ok: false; error: "forbidden" | "invalid" | "self" | "generic" };
