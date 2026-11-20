import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  defaultLocale,
  isLocale,
  locales,
  negotiateLocale,
  type Locale,
} from "@/i18n/config";
import { updateSession } from "@/lib/supabase/proxy";
import { guardAdminRoute } from "@/lib/supabase/role-middleware";

function saveLocale(response: NextResponse, locale: Locale) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieValue = request.cookies.get(LOCALE_COOKIE)?.value;
  const savedLocale = isLocale(cookieValue) ? cookieValue : undefined;

  const pathLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // URL already has a locale: refresh the Supabase session and let it through.
  // On a first visit through a direct link we remember the locale, but never override
  // an explicit earlier choice (and skip prefetches).
  if (pathLocale) {
    const session = await updateSession(request);
    const denied = await guardAdminRoute(request, session, pathLocale);
    const response = denied ?? session.response;
    if (!savedLocale && !request.headers.has("next-router-prefetch")) {
      saveLocale(response, pathLocale);
    }
    return response;
  }

  // No locale in the URL: cookie → Accept-Language → default.
  const locale =
    savedLocale ??
    negotiateLocale(request.headers.get("accept-language")) ??
    defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  if (!savedLocale) saveLocale(response, locale);
  return response;
}

export const config = {
  // Skip Next internals, API routes, auth route handlers and any path with a file extension.
  matcher: ["/((?!_next|api|auth/|.*\\..*).*)"],
};
