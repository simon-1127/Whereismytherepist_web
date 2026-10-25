import { NextResponse } from "next/server";
import { callBackend } from "../../../../lib/backend";

/** Stops autopay: during the trial nothing is charged; paid plans run to the period end. */
export async function POST() {
  const res = await callBackend("/payments/subscription/cancel", { method: "POST" });
  if (res.error) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json(res.data);
}
