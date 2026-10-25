import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { callBackend } from "../../../../lib/backend";
import { checkKycInput, kycStatus } from "../../../../lib/kyc";

/**
 * Submits the signed-in provider's bank account + PAN for payout KYC via the
 * Railway backend (POST /payments/payout-account). RazorpayX keys never
 * touch the website.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userRow?.role !== "provider") return NextResponse.json({ error: "Only therapists can add payout details." }, { status: 403 });

  const { input, error } = checkKycInput(await request.json().catch(() => ({})));
  if (!input) return NextResponse.json({ error }, { status: 400 });

  // The backend runs the penny drop inline, which can take a while.
  const res = await callBackend("/payments/payout-account", {
    method: "POST",
    body: input,
    timeoutMs: 45_000,
    fallbackError: "Bank verification failed. Check your details and try again.",
  });
  if (res.error) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json({ ok: true, kyc_status: kycStatus(res.data?.kyc_status) });
}
