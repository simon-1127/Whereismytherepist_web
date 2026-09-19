import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createRazorpayOrder } from "../../../../lib/razorpay";

export async function POST(request: Request) {
  try {
    const { slotId } = await request.json();

    if (!slotId) {
      return NextResponse.json({ error: "slotId is required" }, { status: 400 });
    }

    // Uses the logged-in user's own session (cookies), so auth.uid() inside
    // the create_booking_hold() Postgres function correctly identifies them.
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You must be signed in to book a session" }, { status: 401 });
    }

    // Fast-fail with a clear message; the real enforcement is inside
    // create_booking_hold() itself (see sql/003), which can't be bypassed
    // by calling the RPC directly.
    const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (userRow?.role !== "client") {
      return NextResponse.json({ error: "Only client accounts can book sessions" }, { status: 403 });
    }

    // Best-effort cleanup of any of this provider's stale holds before we try
    // to grab this slot. Safe to skip if it errors — the RPC self-heals too.
    try {
  await supabase.rpc("release_expired_holds");
} catch {}

    const { data: holdResult, error: holdError } = await supabase
      .rpc("create_booking_hold", { p_slot_id: slotId })
      .single();

    if (holdError || !holdResult) {
      return NextResponse.json(
        { error: holdError?.message || "Could not hold this slot" },
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

    const order = await createRazorpayOrder({
      // result.amount is already in paise (matches provider_profiles.base_session_rate),
      // which is also the unit Razorpay's API expects — no conversion needed here.
      amountInPaise: result.amount,
      currency: result.currency,
      receipt: result.session_id,
      notes: {
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
      scheduledStart: result.scheduled_start,
      scheduledEnd: result.scheduled_end,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error("create-order error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
