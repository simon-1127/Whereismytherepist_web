import { createClient } from "@supabase/supabase-js";
import { assertEnv } from "../env";

/**
 * SERVER-ONLY Supabase client using the service role key. Bypasses RLS —
 * never import from a "use client" file.
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY at runtime (Supabase Dashboard -> Project
 * Settings -> API -> service_role). No NEXT_PUBLIC_ prefix.
 */
export function createAdminClient() {
  assertEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
