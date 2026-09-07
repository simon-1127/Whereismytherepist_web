import { createClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY Supabase client using the service role key.
 *
 * This bypasses Row Level Security entirely, so it must NEVER be imported
 * into any file that ships to the browser (no "use client" files, no
 * client components). Only use it inside:
 *   - app/api/**\/route.ts handlers
 *   - other server-only modules that are only ever imported by route handlers
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in your environment (get it from
 * Supabase Dashboard -> Project Settings -> API -> service_role key).
 * Do NOT prefix it with NEXT_PUBLIC_ — that would expose it to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
