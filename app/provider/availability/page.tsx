import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import AvailabilityManager from "../../../components/provider/AvailabilityManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Availability" };

export default async function ProviderAvailabilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/provider/availability");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userRow?.role !== "provider") redirect("/");

  const { data: profile } = await supabase.from("provider_profiles").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!profile) redirect("/provider/profile");

  const { data: slots } = await supabase
    .from("availability_slots")
    .select("id, start_time, end_time, status")
    .eq("provider_id", user.id)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(300);

  return (
    <main className="shell py-10 md:py-14">
      <header className="mb-8">
        <h1 className="text-[2.4rem] font-bold md:text-5xl">Availability</h1>
        <p className="mt-2 text-lg text-ink-2">Clients can only book the times you open here. Times are in IST.</p>
      </header>
      <AvailabilityManager providerId={user.id} initialSlots={slots || []} />
    </main>
  );
}
