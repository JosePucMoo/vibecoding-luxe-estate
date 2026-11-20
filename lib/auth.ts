import { createClient } from "./supabase/server";

/** Narrow, UI-safe view of the signed-in user. */
export interface NavUser {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  provider: string | null;
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/** Reads the session from cookies (request-time: call it behind <Suspense>). */
export async function getCurrentUser(): Promise<NavUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;

  const claims = data.claims;
  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
  const appMeta = (claims.app_metadata ?? {}) as Record<string, unknown>;

  return {
    id: claims.sub,
    email: pickString(claims.email, meta.email),
    fullName: pickString(
      meta.full_name,
      meta.name,
      meta.user_name,
      meta.preferred_username
    ),
    // Google exposes `picture`, GitHub exposes `avatar_url`.
    avatarUrl: pickString(meta.avatar_url, meta.picture),
    provider: pickString(appMeta.provider),
  };
}
