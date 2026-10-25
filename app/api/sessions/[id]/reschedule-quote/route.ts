import { NextResponse } from "next/server";
import { callBackend } from "../../../../../lib/backend";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** What moving this session to ?provider_id costs: credit, top-up due, or refund. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const providerId = new URL(request.url).searchParams.get("provider_id") || "";
  if (!UUID_RE.test(id) || !UUID_RE.test(providerId)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const res = await callBackend(`/sessions/${id}/reschedule-quote?provider_id=${providerId}`);
  if (res.error) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json(res.data);
}
