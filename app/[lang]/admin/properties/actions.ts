"use server";

import { revalidatePath } from "next/cache";
import { locales, localePath } from "@/i18n/config";
import { getCurrentUser } from "@/lib/auth";
import {
  PROPERTY_IMAGES_BUCKET,
  extractStoragePathFromPublicUrl,
} from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import {
  isListingType,
  isPropertyStatus,
  isPropertyType,
  type PropertyFieldErrorKey,
  type PropertyFormPayload,
  type PropertyMutationResult,
  type TogglePropertyActiveResult,
} from "@/types/admin";
import type { PropertyImage } from "@/types/property";

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const DEFAULT_AGENT_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w";

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function formatUsdCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

function estimateMonthlyMortgage(priceValue: number): string {
  if (priceValue <= 0) return "$0/mo";
  const principal = priceValue * 0.8; // 20% down
  const monthlyRate = 0.065 / 12; // 6.5% APR
  const months = 360; // 30-year fixed
  const factor = Math.pow(1 + monthlyRate, months);
  const monthly = (principal * (monthlyRate * factor)) / (factor - 1);
  return `${formatUsdCurrency(monthly)}/mo`;
}

interface ValidatedPropertyRow {
  slug: string;
  title: string;
  location: string;
  price: string;
  price_value: number;
  period: string | null;
  listing_type: "FOR SALE" | "FOR RENT";
  property_type: string;
  status: "published" | "draft" | "sold";
  is_active: boolean;
  beds: number;
  baths: number;
  area: string;
  year_built: number | null;
  garage: number;
  description: string[];
  amenities: string[];
  badges: string[];
  is_featured: boolean;
  featured_badge: string | null;
  latitude: number;
  longitude: number;
  agent_name: string;
  agent_role: string;
  agent_image: string;
  estimated_payment: string | null;
  images: PropertyImage[];
}

function validatePayload(payload: PropertyFormPayload): {
  row?: ValidatedPropertyRow;
  fieldErrors: Partial<Record<PropertyFieldErrorKey, string>>;
} {
  const fieldErrors: Partial<Record<PropertyFieldErrorKey, string>> = {};

  const title = (payload.title ?? "").trim();
  if (title.length < 3 || title.length > 160) {
    fieldErrors.title = "title";
  }

  const slug = (payload.slug ?? "").trim().toLowerCase();
  if (!slug || slug.length > 120 || !SLUG_REGEX.test(slug)) {
    fieldErrors.slug = "slug";
  }

  const priceValue = Number(payload.priceValue);
  const isDraft = payload.status === "draft";
  if (
    !Number.isFinite(priceValue) ||
    priceValue < 0 ||
    (!isDraft && priceValue <= 0)
  ) {
    fieldErrors.priceValue = "priceValue";
  }

  const listingType = isListingType(payload.listingType)
    ? payload.listingType
    : "FOR SALE";
  const propertyType = isPropertyType(payload.propertyType)
    ? payload.propertyType
    : "House";
  const status = isPropertyStatus(payload.status)
    ? payload.status
    : "published";
  const isActive = payload.isActive !== false;

  const location = (payload.location ?? "").trim();
  if (!isDraft && (location.length < 2 || location.length > 200)) {
    fieldErrors.location = "location";
  }

  const latitude = Number(payload.latitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    fieldErrors.latitude = "latitude";
  }

  const longitude = Number(payload.longitude);
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    fieldErrors.longitude = "longitude";
  }

  const area = Number(payload.area);
  if (!Number.isFinite(area) || area < 0 || (!isDraft && area <= 0)) {
    fieldErrors.area = "area";
  }

  let yearBuilt: number | null = null;
  if (
    payload.yearBuilt !== null &&
    payload.yearBuilt !== undefined &&
    String(payload.yearBuilt).trim() !== ""
  ) {
    const parsedYear = Math.trunc(Number(payload.yearBuilt));
    if (
      !Number.isFinite(parsedYear) ||
      parsedYear < 1800 ||
      parsedYear > 2100
    ) {
      fieldErrors.yearBuilt = "yearBuilt";
    } else {
      yearBuilt = parsedYear;
    }
  }

  const beds = Math.max(0, Math.min(50, Math.trunc(Number(payload.beds) || 0)));
  const rawBaths = Math.max(0, Math.min(50, Number(payload.baths) || 0));
  const baths = Math.round(rawBaths * 2) / 2;
  const garage = Math.max(
    0,
    Math.min(50, Math.trunc(Number(payload.garage) || 0))
  );

  const sanitizedImages: PropertyImage[] = Array.isArray(payload.images)
    ? payload.images
        .filter(
          (img) =>
            Boolean(img && typeof img.url === "string" && isValidHttpUrl(img.url.trim()))
        )
        .map((img, index) => ({
          url: img.url.trim(),
          alt: img.alt?.trim() || `${title || "Property"} - Photo ${index + 1}`,
        }))
    : [];

  if (status === "published" && isActive && sanitizedImages.length === 0) {
    fieldErrors.images = "images";
  }

  const agentName = (payload.agentName ?? "").trim();
  if (!agentName) {
    fieldErrors.agentName = "agentName";
  }

  const agentRole = (payload.agentRole ?? "").trim();
  if (!agentRole) {
    fieldErrors.agentRole = "agentRole";
  }

  const rawAgentImage = (payload.agentImage ?? "").trim() || DEFAULT_AGENT_IMAGE;
  if (!isValidHttpUrl(rawAgentImage)) {
    fieldErrors.agentImage = "agentImage";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const descriptionParagraphs = (payload.description ?? "")
    .slice(0, 2000)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const amenities = Array.from(
    new Set(
      (Array.isArray(payload.amenities) ? payload.amenities : [])
        .map((a) => String(a).trim())
        .filter(Boolean)
    )
  );

  const badges = Array.from(
    new Set(
      (Array.isArray(payload.badges) ? payload.badges : [])
        .map((b) => String(b).trim())
        .filter(Boolean)
    )
  );

  const safePrice = Math.max(0, priceValue);
  const formattedPrice = formatUsdCurrency(safePrice);
  const period =
    listingType === "FOR RENT"
      ? (payload.period ?? "").trim() || "/mo"
      : null;

  const customEstimated = (payload.estimatedPayment ?? "").trim();
  const estimatedPayment =
    customEstimated ||
    (listingType === "FOR RENT"
      ? `${formattedPrice}${period ?? "/mo"}`
      : estimateMonthlyMortgage(safePrice));

  const safeArea = Math.max(0, area);
  const areaLabel = `${
    Number.isInteger(safeArea) ? safeArea : Number(safeArea.toFixed(1))
  }m²`;

  const isFeatured = Boolean(payload.isFeatured);
  const featuredBadge = isFeatured
    ? (payload.featuredBadge ?? "").trim() || "Exclusive"
    : null;

  return {
    fieldErrors,
    row: {
      slug,
      title,
      location: location || "Address pending",
      price: formattedPrice,
      price_value: safePrice,
      period,
      listing_type: listingType,
      property_type: propertyType,
      status,
      is_active: isActive,
      beds,
      baths,
      area: areaLabel,
      year_built: yearBuilt,
      garage,
      description: descriptionParagraphs,
      amenities,
      badges,
      is_featured: isFeatured,
      featured_badge: featuredBadge,
      latitude,
      longitude,
      agent_name: agentName,
      agent_role: agentRole,
      agent_image: rawAgentImage,
      estimated_payment: estimatedPayment,
      images: sanitizedImages,
    },
  };
}

function revalidatePropertyPaths(slugs: string[], editedId?: string) {
  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));
  for (const locale of locales) {
    revalidatePath(localePath(locale, "/"));
    revalidatePath(localePath(locale, "/admin/properties"));
    if (editedId) {
      revalidatePath(localePath(locale, `/admin/properties/${editedId}/edit`));
    }
    for (const slug of uniqueSlugs) {
      revalidatePath(localePath(locale, `/properties/${slug}`));
    }
  }
}

export async function createPropertyAction(
  payload: PropertyFormPayload
): Promise<PropertyMutationResult> {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin" || admin.status !== "active") {
    return { ok: false, error: "forbidden" };
  }

  const { row, fieldErrors } = validatePayload(payload);
  if (!row) {
    return { ok: false, error: "invalid", fieldErrors };
  }

  const supabase = await createClient();

  const { data: existingSlug } = await supabase
    .from("properties")
    .select("id")
    .or(`slug.eq.${row.slug},id.eq.${row.slug}`)
    .limit(1);

  if (existingSlug && existingSlug.length > 0) {
    return {
      ok: false,
      error: "slug_taken",
      fieldErrors: { slug: "slug_taken" },
    };
  }

  const { data, error } = await supabase
    .from("properties")
    .insert({
      id: row.slug,
      ...row,
    })
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "slug_taken",
        fieldErrors: { slug: "slug_taken" },
      };
    }
    console.error("Error creating property:", error);
    return { ok: false, error: "generic" };
  }

  revalidatePropertyPaths([data.slug]);
  return { ok: true, id: data.id, slug: data.slug };
}

export async function updatePropertyAction(
  id: string,
  payload: PropertyFormPayload,
  removedStoragePaths: string[] = []
): Promise<PropertyMutationResult> {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin" || admin.status !== "active") {
    return { ok: false, error: "forbidden" };
  }

  const targetId = (id ?? "").trim();
  if (!targetId) {
    return { ok: false, error: "invalid" };
  }

  const { row, fieldErrors } = validatePayload(payload);
  if (!row) {
    return { ok: false, error: "invalid", fieldErrors };
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("properties")
    .select("id, slug, images, agent_image")
    .eq("id", targetId)
    .maybeSingle();

  if (fetchError) {
    console.error("Error loading existing property:", fetchError);
    return { ok: false, error: "generic" };
  }
  if (!existing) {
    return { ok: false, error: "not_found" };
  }

  if (row.slug !== existing.slug) {
    const { data: slugConflict } = await supabase
      .from("properties")
      .select("id")
      .eq("slug", row.slug)
      .neq("id", targetId)
      .limit(1);

    if (slugConflict && slugConflict.length > 0) {
      return {
        ok: false,
        error: "slug_taken",
        fieldErrors: { slug: "slug_taken" },
      };
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("properties")
    .update(row)
    .eq("id", targetId)
    .select("id, slug");

  if (updateError) {
    if (updateError.code === "23505") {
      return {
        ok: false,
        error: "slug_taken",
        fieldErrors: { slug: "slug_taken" },
      };
    }
    console.error("Error updating property:", updateError);
    return { ok: false, error: "generic" };
  }

  if (!updated || updated.length === 0) {
    return { ok: false, error: "forbidden" };
  }

  // Clean up any Storage files removed or replaced during editing.
  const activePaths = new Set<string>();
  for (const img of row.images) {
    const p = extractStoragePathFromPublicUrl(img.url);
    if (p) activePaths.add(p);
  }
  const activeAgentPath = extractStoragePathFromPublicUrl(row.agent_image);
  if (activeAgentPath) activePaths.add(activeAgentPath);

  const candidateRemovals = new Set<string>();
  for (const raw of removedStoragePaths) {
    if (typeof raw === "string" && raw.trim() && !raw.includes("..") && !raw.startsWith("/")) {
      candidateRemovals.add(raw.trim());
    }
  }

  const prevImages = Array.isArray(existing.images)
    ? (existing.images as PropertyImage[])
    : [];
  for (const prev of prevImages) {
    const p = extractStoragePathFromPublicUrl(prev?.url ?? "");
    if (p) candidateRemovals.add(p);
  }
  const prevAgentPath = extractStoragePathFromPublicUrl(
    typeof existing.agent_image === "string" ? existing.agent_image : ""
  );
  if (prevAgentPath) candidateRemovals.add(prevAgentPath);

  const pathsToDelete = Array.from(candidateRemovals).filter(
    (p) => !activePaths.has(p)
  );

  if (pathsToDelete.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .remove(pathsToDelete);
    if (storageError) {
      console.warn("Non-fatal error removing old storage images:", storageError);
    }
  }

  revalidatePropertyPaths([existing.slug, row.slug], targetId);
  return { ok: true, id: targetId, slug: row.slug };
}

/**
 * Soft-deactivates (or reactivates) a property without deleting it from the
 * database or removing its images from Storage, so it remains editable in the
 * admin dashboard while being hidden from all public views and search filters.
 */
export async function setPropertyActiveStateAction(
  id: string,
  isActive: boolean
): Promise<TogglePropertyActiveResult> {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin" || admin.status !== "active") {
    return { ok: false, error: "forbidden" };
  }

  const targetId = typeof id === "string" ? id.trim() : "";
  if (!targetId || targetId.length > 160 || typeof isActive !== "boolean") {
    return { ok: false, error: "invalid" };
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("properties")
    .select("id, slug")
    .eq("id", targetId)
    .maybeSingle();

  if (fetchError) {
    console.error("Error loading property for active state change:", fetchError);
    return { ok: false, error: "generic" };
  }
  if (!existing) {
    return { ok: false, error: "not_found" };
  }

  const { data: updated, error: updateError } = await supabase
    .from("properties")
    .update({ is_active: isActive })
    .eq("id", targetId)
    .select("id, slug, is_active");

  if (updateError) {
    console.error("Error updating property active state:", updateError);
    return { ok: false, error: "generic" };
  }
  if (!updated || updated.length === 0) {
    return { ok: false, error: "forbidden" };
  }

  revalidatePropertyPaths([existing.slug], targetId);
  return { ok: true, id: targetId, isActive };
}
