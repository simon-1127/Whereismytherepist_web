import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import SessionsBoard, { type BoardSession } from "../../components/SessionsBoard";
import Footer from "../../components/Footer";
import type { Bucket } from "../../lib/sessions";

export const dynamic = "force-dynamic";
export const metadata = { title: "My sessions" };

export default async function MySessionsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/sessions");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userRow?.role === "provider") redirect("/provider/bookings");

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, provider_id, status, scheduled_start, scheduled_end, amount, currency")
    .eq("client_id", user.id)
    .order("scheduled_start", { ascending: false })
    .limit(200);

  const ids = Array.from(new Set((sessions || []).map((s) => s.provider_id)));
  const { data: providers } = ids.length
    ? await supabase.from("provider_profiles").select("user_id, full_name, photo_url").in("user_id", ids)
    : { data: [] as { user_id: string; full_name: string; photo_url: string | null }[] };
  const byId = new Map((providers || []).map((p) => [p.user_id, p]));

  const board: BoardSession[] = (sessions || []).map((s) => ({
    ...s,
    personName: byId.get(s.provider_id)?.full_name || "Your therapist",
    personPhoto: byId.get(s.provider_id)?.photo_url,
  }));

  const active: Bucket = view === "history" || view === "cancelled" ? view : "upcoming";

  return (
    <>
      <main className="shell py-10 md:py-14">
        <header className="mb-8">
          <h1 className="text-[2.4rem] font-bold md:text-5xl">My sessions</h1>
          <p className="mt-2 text-lg text-ink-2">Your bookings and every session you&rsquo;ve had, in one place.</p>
        </header>
        <SessionsBoard sessions={board} view={active} basePath="/sessions" perspective="client" />
      </main>
      <Footer />
    </>
  );
}
