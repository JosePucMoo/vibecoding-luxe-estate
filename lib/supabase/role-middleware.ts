import { NextResponse, type NextRequest } from "next/server";
import type { Locale } from "@/i18n/config";
import type { SessionContext } from "./proxy";

/**
 * Role check for /[lang]/admin/**. Returns a redirect response when access is
 * denied, or null when the route is public / the user is an active admin.
 * This is an optimistic gate; layouts, actions and RLS re-validate.
 */
export async function guardAdminRoute(
  request: NextRequest,
  session: SessionContext,
  locale: Locale
): Promise<NextResponse | null> {
  const { pathname, search } = request.nextUrl;
  const base = `/${locale}/admin`;
  if (pathname !== base && !pathname.startsWith(`${base}/`)) return null;

  const redirectTo = (path: string, query = "") => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = query;
    const response = NextResponse.redirect(url);
    // Keep refreshed auth cookies on the redirect.
    session.response.cookies
      .getAll()
      .forEach((cookie) => response.cookies.set(cookie));
    return response;
  };

  if (!session.userId) {
    return redirectTo(
      `/${locale}/login`,
      `?next=${encodeURIComponent(pathname + search)}`
    );
  }

  const { data: profile } = await session.supabase
    .from("user_profiles")
    .select("role, status")
    .eq("id", session.userId)
    .maybeSingle();

  if (profile?.role !== "admin" || profile?.status !== "active") {
    return redirectTo(`/${locale}`);
  }

  return null;
}
