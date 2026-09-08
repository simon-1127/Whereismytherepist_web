import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const revalidate = 0;

export default async function ProviderPayoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userRow?.role !== "provider") redirect("/");

  const { data: profile } = await supabase
    .from("provider_profiles")
    .select("application_status, kyc_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/provider/profile");

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      <div className="max-w-lg mx-auto px-5 md:px-8 py-10 w-full flex-grow">
        <div className="flex items-center gap-2 mb-8">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">✓</span>
          <div className="h-px bg-slate-300 flex-1" />
          <span className="w-7 h-7 rounded-full bg-[#1E1B4B] text-white text-xs flex items-center justify-center font-bold">2</span>
        </div>

        <h1 className="text-2xl font-extrabold text-[#1E1B4B] mb-2">Get paid for your sessions</h1>
        <p className="text-sm text-slate-500 mb-6">
          We verify your identity and bank account before your profile goes live. This is also where your
          session earnings are paid out.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <p className="font-bold text-amber-800 mb-1.5">Payout setup coming soon</p>
          <p className="text-sm text-amber-700">
            Bank/KYC verification on the web isn't wired up to Razorpay yet — that's a separate
            integration (Razorpay Route/X) from the booking payments flow. For now, your profile
            info from step 1 is saved and live. Reach out to support to complete payout setup
            manually in the meantime.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8">
          <p className="text-sm text-slate-500 mb-1">Profile status</p>
          <p className="font-bold text-[#1E1B4B] capitalize">{profile.application_status?.replace(/_/g, " ")}</p>
        </div>

        <Link
          href="/provider/bookings"
          className="w-full bg-[#1E1B4B] text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center"
        >
          Go to my dashboard
        </Link>
      </div>
    </div>
  );
}
