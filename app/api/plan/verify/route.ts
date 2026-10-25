import { NextResponse } from "next/server";
import { callBackend } from "../../../../lib/backend";

/** Fast path after Razorpay Checkout's success callback; webhooks stay the source of truth. */
export async function POST(request: Request) {
  const b = await request.json().catch(() => ({}));
  const res = await callBackend("/payments/subscriptions/verify", {
    method: "POST",
    body: {
      razorpay_subscription_id: b?.razorpay_subscription_id,
      razorpay_payment_id: b?.razorpay_payment_id,
      razorpay_signature: b?.razorpay_signature,
    },
  });
  if (res.error) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json(res.data);
}
