import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { reconcileSessionPayment } from "../../../../../lib/payments";

/** Polled by the session page while a booking shows "payment pending". */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: own } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", id)
    .or(`client_id.eq.${user.id},provider_id.eq.${user.id}`)
    .maybeSingle();
  if (!own) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  try {
    return NextResponse.json({ status: await reconcileSessionPayment(id) });
  } catch (err: any) {
    console.error("reconcile error:", err);
    return NextResponse.json({ status: "pending" });
  }
}
