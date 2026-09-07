import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { verifyCheckoutSignature } from "../../../../lib/razorpay";
import { createDailyRoom } from "../../../../lib/daily";

export async function POST(request: Request) {
  try {
    const {
      sessionId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = await request.json();

    if (!sessionId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // Confirm the requester is signed in (defense in depth — the real trust
    // boundary is the cryptographic signature check below).
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const isValid = verifyCheckoutSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Fetch the session to know the scheduled window for the Daily room, and
    // to confirm it actually belongs to this client (defense in depth).
    const { data: sessionRow, error: fetchError } = await admin
      .from("sessions")
      .select("id, client_id, scheduled_start, scheduled_end, daily_room_url")
      .eq("id", sessionId)
      .single();

    if (fetchError || !sessionRow) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (sessionRow.client_id !== user.id) {
      return NextResponse.json({ error: "This session does not belong to you" }, { status: 403 });
    }

    const { error: confirmError } = await admin.rpc("confirm_booking_payment", {
      p_session_id: sessionId,
      p_order_id: razorpay_order_id,
      p_payment_id: razorpay_payment_id,
      p_amount: amount,
      p_method: "razorpay_checkout",
    });

    if (confirmError) {
      console.error("confirm_booking_payment error:", confirmError);
      return NextResponse.json({ error: "Could not confirm booking" }, { status: 500 });
    }

    // Create the Daily room if one doesn't already exist for this session
    // (the webhook may have beaten us to it — that's fine, this is a no-op then).
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

    return NextResponse.json({ success: true, sessionId });
  } catch (err: any) {
    console.error("verify error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
