import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { createRazorpayOrder, razorpayKeyId } from "../../../../lib/razorpay";
import { BOOKING_ENV, missingEnv } from "../../../../lib/env";

export async function POST(request: Request) {
  // Check config BEFORE holding a slot or taking money. Previously a missing
  // SUPABASE_SERVICE_ROLE_KEY only surfaced in /verify — after the client
  // had already paid.
  const missing = missingEnv(BOOKING_ENV);
  if (missing.length) {
    console.error("Booking disabled, missing env:", missing.join(", "));
    return NextResponse.json(
      { error: "Booking is temporarily unavailable. Please try again shortly or contact support." },
      { status: 503 }
    );
  }

  let sessionId: string | null = null;
  try {
    const { slotId } = await request.json();
    if (!slotId) return NextResponse.json({ error: "Pick a time slot first." }, { status: 400 });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to book a session." }, { status: 401 });

    const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (userRow?.role !== "client") {
      return NextResponse.json({ error: "Only client accounts can book sessions." }, { status: 403 });
    }

    try {
      await supabase.rpc("release_expired_holds");
    } catch {}

    const { data: holdResult, error: holdError } = await supabase
      .rpc("create_booking_hold", { p_slot_id: slotId })
      .single();

    if (holdError || !holdResult) {
      return NextResponse.json(
        { error: holdError?.message || "That slot was just taken. Pick another time." },
        { status: 409 }
      );
    }

    const result = holdResult as {
      session_id: string;
      amount: number;
      currency: string;
      provider_id: string;
      scheduled_start: string;
      scheduled_end: string;
    };
    sessionId = result.session_id;

    const order = await createRazorpayOrder({
      amountInPaise: result.amount,
      currency: result.currency,
      receipt: result.session_id, // reconcile finds orders by this
      notes: {
        type: "session",
        session_id: result.session_id,
        client_id: user.id,
        provider_id: result.provider_id,
      },
    });

    return NextResponse.json({
      sessionId: result.session_id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      razorpayKeyId: razorpayKeyId(),
    });
  } catch (err: any) {
    console.error("create-order error:", err);
    // Razorpay order failed after the slot was held — release it, same as
    // the app backend does, instead of locking the slot for 15 minutes.
    if (sessionId) await rollback(sessionId).catch(() => undefined);
    return NextResponse.json({ error: "Could not start the payment. Please try again." }, { status: 500 });
  }
}

async function rollback(sessionId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("sessions")
    .select("slot_id")
    .eq("id", sessionId)
    .eq("status", "pending_payment")
    .maybeSingle();
  if (!data) return;
  await admin.from("payments").delete().eq("session_id", sessionId);
  await admin.from("sessions").delete().eq("id", sessionId).eq("status", "pending_payment");
  if (data.slot_id) {
    await admin
      .from("availability_slots")
      .update({ status: "open", held_by_client_id: null, held_until: null })
      .eq("id", data.slot_id)
      .eq("status", "held");
  }
}
