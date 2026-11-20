import { redirect } from "next/navigation";
import { connection } from "next/server";
import { localePath, type Locale } from "@/i18n/config";
import { isUserRole, isUserStatus, type UserRole, type UserStatus } from "@/types/admin";
import { createClient } from "./supabase/server";

/** Narrow, UI-safe view of the signed-in user. */
export interface NavUser {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  provider: string | null;
  role: UserRole;
  status: UserStatus;
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/** Reads the session from cookies (request-time: call it behind <Suspense>). */
export async function getCurrentUser(): Promise<NavUser | null> {
  // Defer past static/runtime prerendering: supabase.auth.getClaims() reads Date.now().
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;

  const claims = data.claims;
  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
  const appMeta = (claims.app_metadata ?? {}) as Record<string, unknown>;

  // Role lives in the DB (never in user_metadata) so changes apply immediately.
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, status")
    .eq("id", claims.sub)
    .maybeSingle();

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
    role: isUserRole(profile?.role) ? profile.role : "viewer",
    status: isUserStatus(profile?.status) ? profile.status : "active",
  };
}

/** Defense in depth for Server Components: requires an active admin. */
export async function requireAdmin(locale: Locale): Promise<NavUser> {
  const user = await getCurrentUser();
  if (!user) redirect(localePath(locale, "/login"));
  if (user.role !== "admin" || user.status !== "active") {
    redirect(localePath(locale, "/"));
  }
  return user;
}
