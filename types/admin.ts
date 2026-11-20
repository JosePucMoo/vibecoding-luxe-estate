import type { ListingType } from "./property";

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
  beds: number;
  baths: number | string;
  area: string;
  isFeatured: boolean;
  estimatedPayment?: string;
  imageUrl: string;
  imageAlt: string;
}

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
