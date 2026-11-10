import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export type Role = "client" | "provider" | "gendoc";

export type Viewer = {
  user: { id: string; email: string | null } | null;
  role: Role | null;
  /** Display name from the role's own profile table (round nav icon). */
  name: string | null;
  /** client_profiles.subscription_tier — clients only. */
  tier: string | null;
};

const NAME_TABLE: Record<Role, string> = {
  client: "client_profiles",
  provider: "provider_profiles",
  gendoc: "gendoc_profiles",
};

/**
 * Who is looking at this page, once per request. The root layout already
 * needs the role + name for the Navbar, so section layouts that guard by
 * role call this too and get the same (memoised) answer — no extra DB hit.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, role: null, name: null, tier: null };

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
  const raw = userRow?.role as string | undefined;
  const role: Role | null = raw === "provider" || raw === "gendoc" || raw === "client" ? raw : null;

  const isClient = role !== "provider" && role !== "gendoc";
  const { data: prof } = await supabase
    .from(NAME_TABLE[role || "client"])
    .select(isClient ? "full_name, subscription_tier" : "full_name")
    .eq("user_id", user.id)
    .maybeSingle();
  const row = prof as { full_name?: string | null; subscription_tier?: string | null } | null;

  return {
    user: { id: user.id, email: user.email ?? null },
    role,
    name: row?.full_name || null,
    tier: isClient ? row?.subscription_tier || null : null,
  };
});

/** Client-only sections (sessions, profile, welcome, provider): send doctors home. */
export async function keepGenDocOut() {
  const { role } = await getViewer();
  if (role === "gendoc") redirect("/gendoc");
}
