import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createAdminClient } from "./supabase/admin";
import { safeNext } from "./safe-next";

/**
 * Therapist self-signup. A new account becomes a provider only when it asked
 * to at signup (OAuth "as=provider" or email-signup metadata) AND it is brand
 * new, so an existing client can never flip their own role. The profile
 * still starts as a draft that our team reviews before it is listed.
 */
const NEW_ACCOUNT_MS = 24 * 60 * 60 * 1000;

export async function promoteIfRequested(user: User, requested: boolean) {
  const wants = requested || user.user_metadata?.account_type === "provider";
  if (!wants) return false;
  if (Date.now() - new Date(user.created_at).getTime() > NEW_ACCOUNT_MS) return false;
  try {
    const admin = createAdminClient();
    const { data: row } = await admin.from("users").select("role").eq("id", user.id).maybeSingle();
    if (row?.role === "provider") return true;
    if (row && row.role && row.role !== "client") return false; // never touch admins
    const { error } = await admin.from("users").update({ role: "provider" }).eq("id", user.id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("provider promotion failed:", err);
    return false;
  }
}

/** Where someone lands after signing in or up. */
export async function postAuthPath(supabase: SupabaseClient, user: User, next: string | null) {
  const { data: row } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();

  if (row?.role === "provider") {
    const { data: p } = await supabase
      .from("provider_profiles")
      .select("application_status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!p || p.application_status === "draft") return "/provider/profile?welcome=1";
    return safeNext(next, "/provider/dashboard");
  }

  const { data: profile } = await supabase
    .from("client_profiles")
    .select("full_name, date_of_birth")
    .eq("user_id", user.id)
    .maybeSingle();
  const target = safeNext(next, "/therapists");
  if (!profile?.full_name || !profile?.date_of_birth) {
    return `/welcome?next=${encodeURIComponent(target)}`;
  }
  return target;
}
