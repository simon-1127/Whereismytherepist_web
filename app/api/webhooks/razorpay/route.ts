import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { verifyWebhookSignature } from "../../../../lib/razorpay";
import { reconcileSessionPayment } from "../../../../lib/payments";

/**
 * Backup path for when the browser never calls /verify (closed tab).
 * Razorpay Dashboard -> Settings -> Webhooks, in the SAME mode (test/live)
 * as RAZORPAY_KEY_ID:
 *   URL:    https://wheresmytherapist.com/api/webhooks/razorpay
 *   Events: payment.captured
 *   Secret: RAZORPAY_WEBHOOK_SECRET
 *
 * Even without a working webhook, bookings now confirm from the session
 * page (see lib/payments.ts) — this just makes it instant.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const verified = verifyWebhookSignature(rawBody, request.headers.get("x-razorpay-signature"));

  let payload: any = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {}

  try {
    const admin = createAdminClient();
    await admin.from("payment_webhook_log").insert({
      razorpay_event_id: payload?.id || `web-${Date.now()}`,
      event_type: payload?.event || "unknown",
      signature_verified: verified,
      raw_payload: payload || { raw: rawBody },
    });
  } catch (err) {
    console.error("webhook log failed:", err);
  }

  if (!verified) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const payment = payload?.payload?.payment?.entity;
  const sessionId: string | undefined = payment?.notes?.session_id;
  const isSession = !payment?.notes?.type || payment?.notes?.type === "session";

  if ((payload?.event === "payment.captured" || payload?.event === "order.paid") && sessionId && isSession) {
    try {
      await reconcileSessionPayment(sessionId, { paymentId: payment.id, orderId: payment.order_id });
    } catch (err) {
      console.error("webhook confirm failed:", err);
      // Non-2xx so Razorpay retries; confirm_booking_payment is idempotent.
      return NextResponse.json({ error: "retry" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
