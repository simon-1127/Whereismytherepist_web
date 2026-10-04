import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payouts" };

export default async function ProviderPayoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/provider/payout");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userRow?.role !== "provider") redirect("/");

  const { data: profile } = await supabase
    .from("provider_profiles")
    .select("application_status, kyc_status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/provider/profile");

  return (
    <main className="shell py-10 md:py-14">
      <div className="mx-auto max-w-2xl">
        <ol className="mb-6 flex items-center gap-3 text-sm font-semibold" aria-label="Setup progress">
          <li className="flex items-center gap-2 text-ink-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-teal text-white">✓</span> Your profile</li>
          <li aria-hidden className="h-px flex-1 bg-line" />
          <li className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-white">2</span> Payouts</li>
        </ol>
        <h1 className="text-[2.4rem] font-bold md:text-5xl">Get paid for your sessions</h1>
        <p className="mt-3 text-lg text-ink-2">
          We verify your identity and bank account before your profile goes live. Your session earnings are paid to that account.
        </p>

        <div className="sheet mt-8 space-y-5 p-6 md:p-8">
          <div className="alert alert-warn">
            <p className="font-semibold">Bank verification happens in the app for now.</p>
            <p className="mt-1">
              Open the Where&rsquo;s My Therapist app, go to Earnings and add your bank details there, or ask{" "}
              <a href="mailto:support@wheresmytherapist.com" className="underline">support</a> to set it up with you. Your profile
              details are already saved.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            <div className="well p-4">
              <dt className="text-sm text-ink-3">Profile</dt>
              <dd className="mt-1 font-display text-lg font-semibold capitalize">{profile.application_status?.replace(/_/g, " ")}</dd>
            </div>
            <div className="well p-4">
              <dt className="text-sm text-ink-3">Bank verification</dt>
              <dd className="mt-1 font-display text-lg font-semibold capitalize">{(profile.kyc_status || "not started").replace(/_/g, " ")}</dd>
            </div>
          </dl>
          <Link href="/provider/dashboard" className="btn btn-primary w-full">Go to dashboard</Link>
        </div>
      </div>
    </main>
  );
}
