import { createAdminClient } from "./supabase/admin";
import {
  capturePayment,
  fetchOrder,
  fetchOrderPayments,
  fetchOrdersByReceipt,
  fetchPayment,
  type RazorpayPayment,
} from "./razorpay";

export type ReconcileResult = "confirmed" | "pending" | "not_found";

/**
 * Confirms a booking from Razorpay's own API instead of trusting the
 * browser callback or waiting for a webhook.
 *
 * This is what fixes "paid on Razorpay, stuck on the confirmation screen":
 * the old flow only confirmed if the browser's verify call succeeded or the
 * webhook arrived. Either one failing (closed tab, missing env var, webhook
 * set up in the wrong mode) left a paid session at pending_payment forever.
 * Now the session page, the verify route and the webhook all funnel here,
 * and this asks Razorpay directly: "is there a captured payment for this
 * session?". confirm_booking_payment() is idempotent, so running it from
 * several paths is safe.
 *
 * Works for sessions created by the mobile app's backend too — both use the
 * session id as the Razorpay order receipt.
 */
export async function reconcileSessionPayment(
  sessionId: string,
  hint?: { paymentId?: string; orderId?: string }
): Promise<ReconcileResult> {
  const admin = createAdminClient();

  const { data: session } = await admin
    .from("sessions")
    .select("id, status")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) return "not_found";
  if (session.status !== "pending_payment") return "confirmed";

  let captured: RazorpayPayment | null = null;

  // Fast path: the browser handed us the payment id.
  if (hint?.paymentId) {
    const p = await fetchPayment(hint.paymentId).catch(() => null);
    if (p && (await orderBelongsToSession(p.order_id, sessionId))) {
      captured = await ensureCaptured(p);
    }
  }

  // Slow path: find every order for this session and look for a payment.
  if (!captured) {
    const orderIds = new Set<string>();
    if (hint?.orderId) orderIds.add(hint.orderId);
    const orders = await fetchOrdersByReceipt(sessionId).catch(() => []);
    orders.forEach((o) => orderIds.add(o.id));

    for (const orderId of orderIds) {
      if (!(await orderBelongsToSession(orderId, sessionId))) continue;
      const payments = await fetchOrderPayments(orderId).catch(() => []);
      const candidate =
        payments.find((p) => p.status === "captured") || payments.find((p) => p.status === "authorized");
      if (candidate) {
        captured = await ensureCaptured(candidate);
        if (captured) break;
      }
    }
  }

  if (!captured) return "pending";

  const { error } = await admin.rpc("confirm_booking_payment", {
    p_session_id: sessionId,
    p_order_id: captured.order_id,
    p_payment_id: captured.id,
    p_amount: captured.amount,
    p_method: captured.method || "razorpay",
  });
  if (error) throw new Error(`Could not confirm booking: ${error.message}`);

  return "confirmed";
}

async function orderBelongsToSession(orderId: string, sessionId: string): Promise<boolean> {
  const order = await fetchOrder(orderId).catch(() => null);
  return !!order && order.receipt === sessionId;
}

/** An 'authorized' payment auto-refunds if nobody captures it. */
async function ensureCaptured(p: RazorpayPayment): Promise<RazorpayPayment | null> {
  if (p.status === "captured") return p;
  if (p.status === "authorized") {
    return capturePayment(p.id, p.amount, p.currency).catch(() => null);
  }
  return null;
}
