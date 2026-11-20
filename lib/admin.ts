import { supabase } from "./supabase";
import { createClient } from "./supabase/server";
import {
  USER_ROLES,
  isUserRole,
  isUserStatus,
  type AdminPage,
  type AdminProperty,
  type AdminPropertyStats,
  type AdminUserProfile,
  type RoleCounts,
  type UserRole,
} from "@/types/admin";
import type { ListingType, PropertyImage } from "@/types/property";

export const ADMIN_PAGE_SIZE = 8;

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBjNDU9iE4zwPuWeg-CjIrLI-87GF24_LgOggcXT0vmUYfMx2q1dJAheiqWqVN-39uiwyLKEfP18FsG1vtUyAPX902OhGEfM4clcQiDsJW7MBbc_BoMtZXtqIeFKIfkHnkIPwmFbQg8Eaan6ULV99T8AUVUuKsro0HoTMrIaxw5pp1uSuQlF8X5Dait4US1W4vmyZnVioXbFnCoaOOZ0LPorb0rVGAIQd9reWcpqq27C0oO4ltnsCTHIcjIm0xp-2qVbRJSIZzWPv0";

/** Strips characters that would break PostgREST `or()` filter syntax. */
function sanitizeSearch(q?: string): string {
  return (q ?? "").trim().replace(/[,()%*\\]/g, " ").trim();
}

function pageRange(page: number) {
  const current = Math.max(1, Math.floor(page) || 1);
  const from = (current - 1) * ADMIN_PAGE_SIZE;
  return { current, from, to: from + ADMIN_PAGE_SIZE - 1 };
}

interface PropertyRow {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: string;
  period: string | null;
  listing_type: ListingType;
  property_type: string;
  beds: number;
  baths: number | string;
  area: string;
  is_featured: boolean;
  estimated_payment: string | null;
  images: PropertyImage[] | null;
}

export async function getAdminProperties(opts: {
  q?: string;
  listingType?: ListingType;
  page?: number;
}): Promise<AdminPage<AdminProperty>> {
  const { current, from, to } = pageRange(opts.page ?? 1);

  let query = supabase
    .from("properties")
    .select(
      "id, slug, title, location, price, period, listing_type, property_type, beds, baths, area, is_featured, estimated_payment, images",
      { count: "exact" }
    );

  const q = sanitizeSearch(opts.q);
  if (q) {
    query = query.or(
      `title.ilike.%${q}%,location.ilike.%${q}%,property_type.ilike.%${q}%`
    );
  }
  if (opts.listingType) query = query.eq("listing_type", opts.listingType);

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .order("sort_order", { ascending: true })
    .range(from, to);

  if (error) throw new Error(`Failed to fetch properties: ${error.message}`);

  const total = count ?? 0;
  return {
    items: ((data ?? []) as PropertyRow[]).map((row) => {
      const image = Array.isArray(row.images) ? row.images[0] : undefined;
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        location: row.location,
        price: row.price,
        period: row.period ?? undefined,
        listingType: row.listing_type,
        propertyType: row.property_type,
        beds: row.beds,
        baths: row.baths,
        area: row.area,
        isFeatured: row.is_featured,
        estimatedPayment: row.estimated_payment ?? undefined,
        imageUrl: image?.url || FALLBACK_IMAGE,
        imageAlt: image?.alt || row.title,
      };
    }),
    total,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
    currentPage: current,
  };
}

const countBase = () =>
  supabase.from("properties").select("id", { count: "exact", head: true });

async function countProperties(
  apply?: (q: ReturnType<typeof countBase>) => ReturnType<typeof countBase>
) {
  const { count } = await (apply ? apply(countBase()) : countBase());
  return count ?? 0;
}

export async function getAdminPropertyStats(): Promise<AdminPropertyStats> {
  const [total, forSale, forRent, featured] = await Promise.all([
    countProperties(),
    countProperties((q) => q.eq("listing_type", "FOR SALE")),
    countProperties((q) => q.eq("listing_type", "FOR RENT")),
    countProperties((q) => q.eq("is_featured", true)),
  ]);
  return { total, forSale, forRent, featured };
}

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  provider: string | null;
  role: string;
  status: string;
  last_sign_in_at: string | null;
}

/** Uses the signed-in admin's session so Postgres RLS enforces access. */
export async function getAdminUsers(opts: {
  q?: string;
  role?: UserRole;
  page?: number;
}): Promise<AdminPage<AdminUserProfile>> {
  const client = await createClient();
  const { current, from, to } = pageRange(opts.page ?? 1);

  let query = client
    .from("user_profiles")
    .select(
      "id, email, full_name, avatar_url, provider, role, status, last_sign_in_at",
      { count: "exact" }
    );

  const q = sanitizeSearch(opts.q);
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  if (opts.role) query = query.eq("role", opts.role);

  const { data, error, count } = await query
    .order("created_at", { ascending: true })
    .range(from, to);

  if (error) throw new Error(`Failed to fetch users: ${error.message}`);

  const total = count ?? 0;
  return {
    items: ((data ?? []) as ProfileRow[]).map((row) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      provider: row.provider,
      role: isUserRole(row.role) ? row.role : "viewer",
      status: isUserStatus(row.status) ? row.status : "active",
      lastSignInAt: row.last_sign_in_at,
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
    currentPage: current,
  };
}

export async function getRoleCounts(): Promise<RoleCounts> {
  const client = await createClient();
  const countFor = async (role?: UserRole) => {
    let query = client
      .from("user_profiles")
      .select("id", { count: "exact", head: true });
    if (role) query = query.eq("role", role);
    const { count } = await query;
    return count ?? 0;
  };

  const [all, ...perRole] = await Promise.all([
    countFor(),
    ...USER_ROLES.map((role) => countFor(role)),
  ]);

  const counts = { all } as RoleCounts;
  USER_ROLES.forEach((role, i) => {
    counts[role] = perRole[i];
  });
  return counts;
}
