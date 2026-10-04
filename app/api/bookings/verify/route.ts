import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { reconcileSessionPayment } from "../../../../lib/payments";

/**
 * Called by the browser right after Razorpay Checkout succeeds. The
 * signature is no longer the gate: confirmation happens only when
 * Razorpay's API shows a captured payment for this session's order.
 */
export async function POST(request: Request) {
  try {
    const { sessionId, razorpay_order_id, razorpay_payment_id } = await request.json();
    if (!sessionId) return NextResponse.json({ error: "Missing session" }, { status: 400 });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const { data: own } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("client_id", user.id)
      .maybeSingle();
    if (!own) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const status = await reconcileSessionPayment(sessionId, {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
    return NextResponse.json({ status, sessionId });
  } catch (err: any) {
    console.error("verify error:", err);
    // The session page keeps reconciling, so the client is never stuck.
    return NextResponse.json({ status: "pending", error: err.message }, { status: 202 });
  }
}
