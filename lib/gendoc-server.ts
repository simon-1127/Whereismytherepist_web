import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import { getViewer } from "./viewer";
import { GENDOC_PROFILE_SELECT, QUEUE_SELECT, istToday, toGenDocProfile, type GenDocProfile, type QueueEntry } from "./gendoc";

/** Where non-doctors go when they wander into /gendoc. */
export function homeForRole(role: string | null) {
  return role === "provider" ? "/provider/dashboard" : "/therapists";
}

/**
 * Doctor-portal pages: signed-in, role gendoc, with a profile row. The
 * layout checks the role too, but layouts don't stop a page rendering, so
 * pages check again (memoised, no extra DB hit).
 */
export async function requireGenDoc(path: string) {
  const viewer = await getViewer();
  if (!viewer.user) redirect(`/login?next=${encodeURIComponent(path)}`);
  if (viewer.role !== "gendoc") redirect(homeForRole(viewer.role));

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("gendoc_profiles")
    .select(GENDOC_PROFILE_SELECT)
    .eq("user_id", viewer.user.id)
    .maybeSingle();
  if (!row) redirect("/gendoc/not-set-up");
  return { supabase, userId: viewer.user.id, profile: toGenDocProfile(row) };
}

/** Employee pages: any signed-in non-doctor, non-therapist account. */
export async function requireEmployee(path: string) {
  const viewer = await getViewer();
  if (!viewer.user) redirect(`/login?next=${encodeURIComponent(path)}`);
  if (viewer.role === "gendoc") redirect("/gendoc");
  if (viewer.role === "provider") redirect("/provider/dashboard");
  const supabase = await createClient();
  return { supabase, userId: viewer.user.id, tier: viewer.tier };
}

/**
 * Doctors this employee can reach. No filter on purpose: RLS already limits
 * gendoc_profiles to approved doctors assigned to an org the caller is an
 * active employee of (plus their own row, which only doctors have).
 */
export async function listCompanyDoctors(supabase: SupabaseClient): Promise<GenDocProfile[]> {
  const { data } = await supabase.from("gendoc_profiles").select(GENDOC_PROFILE_SELECT).order("full_name");
  return (data || []).map(toGenDocProfile);
}

/** The employee's own open entry for today (any doctor), with the doctor's name. */
export async function myActiveEntry(supabase: SupabaseClient, userId: string): Promise<QueueEntry | null> {
  const { data } = await supabase
    .from("gendoc_queue_entries")
    .select(`${QUEUE_SELECT}, gendoc_profiles(full_name, photo_url)`)
    .eq("client_id", userId)
    .eq("queue_date", istToday())
    .in("status", ["waiting", "in_progress"])
    .order("requested_at", { ascending: false })
    .limit(1);
  return ((data as unknown as QueueEntry[]) || [])[0] || null;
}
