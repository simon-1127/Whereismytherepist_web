import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { kycStatus } from "../../../lib/kyc";
import PayoutKycForm from "../../../components/provider/PayoutKycForm";
import EarningsPanel from "../../../components/provider/EarningsPanel";

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

  // Masked bank details live in their own owner-only table (backend
  // migration 003), not provider_profiles, which listed clients can read.
  // Missing row or table just means nothing to show yet.
  const { data: payout } = await supabase
    .from("provider_payout_details")
    .select("account_holder_name, account_last4, ifsc, submitted_at, failure_reason")
    .eq("user_id", user.id)
    .maybeSingle();

  const [{ data: settlements }, { data: payouts }, { data: adjustments }] = await Promise.all([
    supabase
      .from("session_settlements")
      .select("status, provider_share_amount, payout_id")
      .eq("provider_id", user.id)
      .in("status", ["held", "releasable"]),
    supabase
      .from("payouts")
      .select("id, amount, status, utr, created_at, processed_at")
      .eq("provider_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    // Open deductions only (not yet taken from a payout). Table comes from
    // backend migration 005; absent → treated as none.
    supabase.from("provider_adjustments").select("amount").eq("provider_id", user.id).is("payout_id", null),
  ]);

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
          <PayoutKycForm
            status={kycStatus(profile.kyc_status)}
            summary={{
              holder: payout?.account_holder_name ?? null,
              last4: payout?.account_last4 ?? null,
              ifsc: payout?.ifsc ?? null,
              submittedAt: payout?.submitted_at ?? null,
              failureReason: payout?.failure_reason ?? null,
            }}
          />
          <div className="well p-4">
            <p className="text-sm text-ink-3">Profile review</p>
            <p className="mt-1 font-display text-lg font-semibold capitalize">{profile.application_status?.replace(/_/g, " ")}</p>
          </div>
          <Link href="/provider/dashboard" className="btn btn-quiet w-full">Go to dashboard</Link>
        </div>
        <EarningsPanel settlements={settlements ?? []} payouts={payouts ?? []} adjustments={adjustments ?? []} />
      </div>
    </main>
  );
}
