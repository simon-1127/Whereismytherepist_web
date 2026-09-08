import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const revalidate = 0;

export default async function ProviderDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userRow?.role !== "provider") redirect("/");

  const { data: profile } = await supabase
    .from("provider_profiles")
    .select("full_name, application_status, kyc_status, is_publicly_listed")
    .eq("user_id", user.id)
    .maybeSingle();

  const now = new Date().toISOString();

  const [{ count: upcomingCount }, { count: pendingPaymentCount }, { data: nextSession }] = await Promise.all([
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("provider_id", user.id)
      .eq("status", "confirmed")
      .gte("scheduled_start", now),
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("provider_id", user.id)
      .eq("status", "pending_payment"),
    supabase
      .from("sessions")
      .select("id, scheduled_start, client_id")
      .eq("provider_id", user.id)
      .eq("status", "confirmed")
      .gte("scheduled_start", now)
      .order("scheduled_start", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
        <div className="max-w-lg mx-auto text-center py-24 px-6">
          <p className="text-slate-700 font-semibold text-lg mb-2">Welcome — let's set up your profile</p>
          <p className="text-slate-500 text-sm mb-6">
            Clients won't be able to find or book you until your provider profile is complete.
          </p>
          <Link
            href="/provider/profile"
            className="inline-block bg-[#1E1B4B] text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Set up my profile →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-10 w-full flex-grow">
        <h1 className="text-2xl font-extrabold text-[#1E1B4B] mb-1">Welcome back, {profile.full_name}</h1>
        <p className="text-sm text-slate-500 mb-8">Here's what's happening with your practice.</p>

        {profile.application_status !== "approved" && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-2xl p-4 mb-6">
            Your profile status is <strong className="capitalize">{profile.application_status?.replace(/_/g, " ")}</strong>.
            {profile.application_status === "draft" && " Complete payout setup to submit it for review."}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 mb-1">Upcoming sessions</p>
            <p className="text-3xl font-extrabold text-[#1E1B4B]">{upcomingCount || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 mb-1">Awaiting client payment</p>
            <p className="text-3xl font-extrabold text-[#1E1B4B]">{pendingPaymentCount || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 mb-1">Publicly listed</p>
            <p className="text-3xl font-extrabold text-[#1E1B4B]">{profile.is_publicly_listed ? "Yes" : "No"}</p>
          </div>
        </div>

        {nextSession && (
          <Link
            href={`/sessions/${nextSession.id}`}
            className="block bg-white border border-slate-200 rounded-2xl p-5 mb-8 hover:shadow-md transition-shadow"
          >
            <p className="text-xs text-slate-500 mb-1">Your next session</p>
            <p className="font-bold text-[#1E1B4B]">
              {new Date(nextSession.scheduled_start).toLocaleString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </Link>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link href="/provider/bookings" className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex items-center justify-between">
            <span className="font-semibold text-[#1E1B4B]">View all bookings</span>
            <span>→</span>
          </Link>
          <Link href="/provider/availability" className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex items-center justify-between">
            <span className="font-semibold text-[#1E1B4B]">Manage availability</span>
            <span>→</span>
          </Link>
          <Link href="/provider/profile" className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex items-center justify-between">
            <span className="font-semibold text-[#1E1B4B]">Edit my profile</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
