import { createClient as createBrowserSupabaseClient } from "./supabase/client";

export const PROPERTY_IMAGES_BUCKET = "property-images";
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ImageValidationError = "invalid_type" | "file_too_large";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateImageFile(file: File): ImageValidationError | null {
  if (
    !(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)
  ) {
    return "invalid_type";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "file_too_large";
  }
  return null;
}

/**
 * Extracts the relative object path inside `property-images` when a URL belongs
 * to this project's Supabase Storage public bucket; returns null for external URLs.
 */
export function extractStoragePathFromPublicUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const prefix = `/storage/v1/object/public/${PROPERTY_IMAGES_BUCKET}/`;

  try {
    const parsed = new URL(url);
    if (supabaseUrl) {
      const expected = new URL(supabaseUrl);
      if (parsed.origin !== expected.origin) return null;
    }
    const idx = parsed.pathname.indexOf(prefix);
    if (idx === -1) return null;
    const rawPath = decodeURIComponent(
      parsed.pathname.slice(idx + prefix.length)
    ).trim();
    if (
      !rawPath ||
      rawPath.startsWith("/") ||
      rawPath.includes("..") ||
      rawPath.includes("\\")
    ) {
      return null;
    }
    return rawPath;
  } catch {
    return null;
  }
}

function sanitizeFolderSegment(segment: string): string {
  const cleaned = segment
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return cleaned || "draft";
}

export async function uploadPropertyImageClient(
  file: File,
  folderSegment = "listings"
): Promise<{ url: string; path: string }> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const supabase = createBrowserSupabaseClient();
  const ext = MIME_TO_EXT[file.type] ?? "jpg";
  const folder = sanitizeFolderSegment(folderSegment);
  const uniqueId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const path = `properties/${folder}/${uniqueId}.${ext}`;

  const { error } = await supabase.storage
    .from(PROPERTY_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(PROPERTY_IMAGES_BUCKET)
    .getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
  };
}

export async function removePropertyImagesClient(paths: string[]): Promise<void> {
  const validPaths = Array.from(
    new Set(
      paths.filter(
        (p) =>
          typeof p === "string" &&
          p.trim().length > 0 &&
          !p.startsWith("/") &&
          !p.includes("..")
      )
    )
  );
  if (validPaths.length === 0) return;

  const supabase = createBrowserSupabaseClient();
  await supabase.storage.from(PROPERTY_IMAGES_BUCKET).remove(validPaths);
}
