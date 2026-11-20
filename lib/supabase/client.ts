import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./config";

/** Supabase client for Client Components (PKCE flow, cookie-based session). */
export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
