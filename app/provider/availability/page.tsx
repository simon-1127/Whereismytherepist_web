import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import AvailabilityManager from "../../../components/provider/AvailabilityManager";

export const revalidate = 0;

export default async function ProviderAvailabilityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userRow?.role !== "provider") redirect("/");

  const { data: profile } = await supabase
    .from("provider_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/provider/profile");

  const { data: slots } = await supabase
    .from("availability_slots")
    .select("id, start_time, end_time, status")
    .eq("provider_id", user.id)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(200);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-10 w-full flex-grow">
        <h1 className="text-2xl font-extrabold text-[#1E1B4B] mb-1">Availability</h1>
        <p className="text-sm text-slate-500 mb-8">
          Clients can only book sessions during the times you add here.
        </p>

        <AvailabilityManager providerId={user.id} initialSlots={slots || []} />
      </div>
    </div>
  );
}
