import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { verifyWebhookSignature } from "../../../../lib/razorpay";
import { createDailyRoom } from "../../../../lib/daily";

/**
 * Backup confirmation path. The main flow is app/api/bookings/verify, which
 * runs right after Checkout succeeds in the browser. This webhook exists in
 * case the user closes the tab before that call completes — Razorpay will
 * still notify us the payment captured, and confirm_booking_payment() is
 * idempotent so it's safe if both paths fire.
 *
 * Set this URL in your Razorpay Dashboard -> Settings -> Webhooks:
 *   https://yourdomain.com/api/webhooks/razorpay
 * Events to enable: payment.captured
 * Set RAZORPAY_WEBHOOK_SECRET to the same secret you configure there.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  const admin = createAdminClient();

  let signatureVerified = false;
  try {
    signatureVerified = verifyWebhookSignature(rawBody, signature);
  } catch (err) {
    console.error("Webhook signature check errored:", err);
  }

  let payload: any = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    // ignore, logged below regardless
  }

  // Log every webhook attempt, verified or not, for auditing.
  await admin.from("payment_webhook_log").insert({
    razorpay_event_id: payload?.id || `unverified-${Date.now()}`,
    event_type: payload?.event || "unknown",
    signature_verified: signatureVerified,
    raw_payload: payload || { raw: rawBody },
  });

  if (!signatureVerified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (payload?.event === "payment.captured") {
    const paymentEntity = payload.payload?.payment?.entity;
    const sessionId = paymentEntity?.notes?.session_id;

    if (sessionId) {
      try {
        const { data: sessionRow } = await admin
          .from("sessions")
          .select("id, scheduled_start, scheduled_end, daily_room_url")
          .eq("id", sessionId)
          .single();

        if (sessionRow) {
          await admin.rpc("confirm_booking_payment", {
            p_session_id: sessionId,
            p_order_id: paymentEntity.order_id,
            p_payment_id: paymentEntity.id,
            p_amount: paymentEntity.amount,
            p_method: paymentEntity.method || "razorpay_webhook",
          });

          if (!sessionRow.daily_room_url) {
            const room = await createDailyRoom({
              sessionId,
              scheduledStart: sessionRow.scheduled_start,
              scheduledEnd: sessionRow.scheduled_end,
            });
            await admin
              .from("sessions")
              .update({ daily_room_name: room.name, daily_room_url: room.url })
              .eq("id", sessionId);
          }
        }
      } catch (err) {
        console.error("Webhook confirm error:", err);
        // Still return 200 below — Razorpay will retry on non-2xx, and we've
        // logged this attempt. Swallow so retries don't pile up on a bug we
        // can fix without losing the payment record.
      }
    }
  }

  return NextResponse.json({ received: true });
}
