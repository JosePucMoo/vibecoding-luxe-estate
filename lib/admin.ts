import { createClient } from "./supabase/server";
import {
  USER_ROLES,
  isListingType,
  isPropertyStatus,
  isPropertyType,
  isUserRole,
  isUserStatus,
  type AdminPage,
  type AdminProperty,
  type AdminPropertyActivityFilter,
  type AdminPropertyRecord,
  type AdminPropertyStats,
  type AdminUserProfile,
  type RoleCounts,
  type UserRole,
} from "@/types/admin";
import type { ListingType, PropertyImage } from "@/types/property";

export const ADMIN_PAGE_SIZE = 5;

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBjNDU9iE4zwPuWeg-CjIrLI-87GF24_LgOggcXT0vmUYfMx2q1dJAheiqWqVN-39uiwyLKEfP18FsG1vtUyAPX902OhGEfM4clcQiDsJW7MBbc_BoMtZXtqIeFKIfkHnkIPwmFbQg8Eaan6ULV99T8AUVUuKsro0HoTMrIaxw5pp1uSuQlF8X5Dait4US1W4vmyZnVioXbFnCoaOOZ0LPorb0rVGAIQd9reWcpqq27C0oO4ltnsCTHIcjIm0xp-2qVbRJSIZzWPv0";

/** Strips characters that would break PostgREST `or()` filter syntax. */
function sanitizeSearch(q?: string): string {
  return (q ?? "").trim().replace(/[,()%*\\]/g, " ").trim();
}

function pageRange(page: number, pageSize = ADMIN_PAGE_SIZE) {
  const current = Math.max(1, Math.floor(page) || 1);
  const from = (current - 1) * pageSize;
  return { current, from, to: from + pageSize - 1, pageSize };
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
  status: string;
  is_active: boolean;
  beds: number;
  baths: number | string;
  area: string;
  is_featured: boolean;
  estimated_payment: string | null;
  images: PropertyImage[] | null;
}

interface AdminPropertyDetailRow {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: string;
  price_value: number | string | null;
  period: string | null;
  listing_type: string;
  property_type: string;
  status: string;
  is_active: boolean;
  beds: number;
  baths: number | string;
  area: string;
  year_built: number | null;
  garage: number | null;
  description: string[] | null;
  amenities: string[] | null;
  badges: string[] | null;
  is_featured: boolean;
  featured_badge: string | null;
  latitude: number | null;
  longitude: number | null;
  agent_name: string | null;
  agent_role: string | null;
  agent_image: string | null;
  estimated_payment: string | null;
  images: PropertyImage[] | null;
}

export async function getAdminProperties(opts: {
  q?: string;
  listingType?: ListingType;
  activity?: AdminPropertyActivityFilter;
  page?: number;
}): Promise<AdminPage<AdminProperty>> {
  const client = await createClient();
  const { current, from, to } = pageRange(opts.page ?? 1);

  let query = client
    .from("properties")
    .select(
      "id, slug, title, location, price, period, listing_type, property_type, status, is_active, beds, baths, area, is_featured, estimated_payment, images",
      { count: "exact" }
    );

  const q = sanitizeSearch(opts.q);
  if (q) {
    query = query.or(
      `title.ilike.%${q}%,location.ilike.%${q}%,property_type.ilike.%${q}%`
    );
  }
  if (opts.listingType) query = query.eq("listing_type", opts.listingType);
  if (opts.activity === "active") query = query.eq("is_active", true);
  if (opts.activity === "inactive") query = query.eq("is_active", false);

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
        status: isPropertyStatus(row.status) ? row.status : "published",
        isActive: row.is_active !== false,
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

export async function getAdminPropertyStats(): Promise<AdminPropertyStats> {
  const client = await createClient();
  const countBase = () =>
    client.from("properties").select("id", { count: "exact", head: true });
  const countProperties = async (
    apply?: (q: ReturnType<typeof countBase>) => ReturnType<typeof countBase>
  ) => {
    const { count } = await (apply ? apply(countBase()) : countBase());
    return count ?? 0;
  };

  const [total, active, forSale, forRent, featured] = await Promise.all([
    countProperties(),
    countProperties((q) => q.eq("is_active", true).eq("status", "published")),
    countProperties((q) =>
      q.eq("is_active", true).eq("listing_type", "FOR SALE")
    ),
    countProperties((q) =>
      q.eq("is_active", true).eq("listing_type", "FOR RENT")
    ),
    countProperties((q) => q.eq("is_active", true).eq("is_featured", true)),
  ]);
  return { total, active, forSale, forRent, featured };
}

export async function getAdminPropertyById(
  id: string
): Promise<AdminPropertyRecord | null> {
  const trimmedId = id.trim();
  if (!trimmedId) return null;

  const client = await createClient();
  const { data, error } = await client
    .from("properties")
    .select(
      "id, slug, title, location, price, price_value, period, listing_type, property_type, status, is_active, beds, baths, area, year_built, garage, description, amenities, badges, is_featured, featured_badge, latitude, longitude, agent_name, agent_role, agent_image, estimated_payment, images"
    )
    .eq("id", trimmedId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch property "${trimmedId}": ${error.message}`);
  }
  if (!data) return null;

  const row = data as AdminPropertyDetailRow;
  const parsedPriceValue =
    row.price_value !== null && row.price_value !== undefined
      ? Number(row.price_value)
      : Number(String(row.price).replace(/[^0-9.]/g, ""));
  const parsedArea = parseFloat(String(row.area).replace(/[^0-9.]/g, ""));
  const parsedBaths = Number(row.baths);
  const validImages = Array.isArray(row.images)
    ? row.images
        .filter((img) => Boolean(img && typeof img.url === "string" && img.url.trim()))
        .map((img, idx) => ({
          url: img.url.trim(),
          alt: img.alt?.trim() || `${row.title} - Photo ${idx + 1}`,
        }))
    : [];

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    priceValue: Number.isFinite(parsedPriceValue) ? parsedPriceValue : 0,
    period: row.period,
    listingType: isListingType(row.listing_type) ? row.listing_type : "FOR SALE",
    propertyType: isPropertyType(row.property_type) ? row.property_type : "House",
    status: isPropertyStatus(row.status) ? row.status : "published",
    isActive: row.is_active !== false,
    beds: Number.isFinite(row.beds) ? row.beds : 3,
    baths: Number.isFinite(parsedBaths) ? parsedBaths : 2,
    area: Number.isFinite(parsedArea) ? parsedArea : 0,
    yearBuilt: typeof row.year_built === "number" ? row.year_built : null,
    garage: typeof row.garage === "number" ? row.garage : 0,
    description: Array.isArray(row.description) ? row.description : [],
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    badges: Array.isArray(row.badges) ? row.badges : [],
    isFeatured: Boolean(row.is_featured),
    featuredBadge: row.featured_badge,
    latitude: typeof row.latitude === "number" ? row.latitude : 37.4419,
    longitude: typeof row.longitude === "number" ? row.longitude : -122.143,
    agentName: row.agent_name || "Sarah Jenkins",
    agentRole: row.agent_role || "Senior Luxury Advisor",
    agentImage: row.agent_image || FALLBACK_IMAGE,
    estimatedPayment: row.estimated_payment,
    images: validImages,
  };
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
