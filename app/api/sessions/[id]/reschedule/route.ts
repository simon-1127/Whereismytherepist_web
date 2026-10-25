import { NextResponse } from "next/server";
import { callBackend } from "../../../../../lib/backend";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Reschedule / change therapist for a session — proxies the backend's
 * RescheduleService, which owns eligibility (free after a therapist no-show,
 * both absent, interruption or therapist cancel), credit, top-ups and refunds.
 * GET = can this session be rescheduled; POST { provider_id, slot_id, idempotency_key }.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  const res = await callBackend(`/sessions/${id}/reschedule-options`);
  if (res.error) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json(res.data);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  if (!UUID_RE.test(id) || !UUID_RE.test(b?.provider_id || "") || !UUID_RE.test(b?.slot_id || "") || typeof b?.idempotency_key !== "string") {
    return NextResponse.json({ error: "Please pick a time again." }, { status: 400 });
  }
  const res = await callBackend(`/sessions/${id}/reschedule`, {
    method: "POST",
    body: { provider_id: b.provider_id, slot_id: b.slot_id, idempotency_key: b.idempotency_key.slice(0, 100) },
    fallbackError: "We couldn't move your session. Please try again.",
  });
  if (res.error) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json(res.data);
}
