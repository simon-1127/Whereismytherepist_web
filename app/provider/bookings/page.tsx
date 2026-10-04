import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import SessionsBoard, { type BoardSession } from "../../../components/SessionsBoard";
import type { Bucket } from "../../../lib/sessions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sessions" };

export default async function ProviderSessionsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/provider/bookings");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userRow?.role !== "provider") redirect("/sessions");

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, client_id, status, scheduled_start, scheduled_end, amount, currency, provider_payout_amount")
    .eq("provider_id", user.id)
    .order("scheduled_start", { ascending: false })
    .limit(300);

  const ids = Array.from(new Set((sessions || []).map((s) => s.client_id)));
  const { data: clients } = ids.length
    ? await supabase.from("client_profiles").select("user_id, full_name").in("user_id", ids)
    : { data: [] as { user_id: string; full_name: string }[] };
  const names = new Map((clients || []).map((c) => [c.user_id, c.full_name]));

  const board: BoardSession[] = (sessions || []).map((s) => ({
    ...s,
    personName: names.get(s.client_id) || "Client",
  }));

  const active: Bucket = view === "history" || view === "cancelled" ? view : "upcoming";

  return (
    <main className="shell py-10 md:py-14">
      <header className="mb-8">
        <h1 className="text-[2.4rem] font-bold md:text-5xl">Sessions</h1>
        <p className="mt-2 text-lg text-ink-2">Who you&rsquo;re seeing next, and everyone you&rsquo;ve seen.</p>
      </header>
      <SessionsBoard sessions={board} view={active} basePath="/provider/bookings" perspective="provider" />
    </main>
  );
}
