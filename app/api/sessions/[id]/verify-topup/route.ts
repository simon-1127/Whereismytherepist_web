import { NextResponse } from "next/server";
import { callBackend } from "../../../../../lib/backend";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * After paying a reschedule top-up: the backend checks Razorpay and confirms
 * the new session (finishing the reschedule). Webhooks do the same if this fails.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const b = await request.json().catch(() => ({}));
  const res = await callBackend(`/payments/sessions/${id}/verify`, {
    method: "POST",
    body: {
      razorpay_order_id: b?.razorpay_order_id,
      razorpay_payment_id: b?.razorpay_payment_id,
      razorpay_signature: b?.razorpay_signature,
    },
  });
  if (res.error) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json(res.data);
}
