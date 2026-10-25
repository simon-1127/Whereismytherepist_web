import { NextResponse } from "next/server";
import { callBackend } from "../../../lib/backend";

/**
 * Client plans (Razorpay Subscriptions) — thin proxies to the backend's
 * /payments/subscription* routes, which own trial eligibility, plan changes
 * and Razorpay. GET = my plan, POST = start checkout { tier_id, trial, billing }.
 */
export async function GET() {
  const res = await callBackend("/payments/subscription");
  if (res.error) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json(res.data);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const res = await callBackend("/payments/subscriptions", {
    method: "POST",
    body: {
      tier_id: body?.tier_id,
      trial: body?.trial === true,
      billing: body?.billing === "yearly" ? "yearly" : "monthly",
    },
    fallbackError: "Couldn't start checkout. Please try again.",
  });
  if (res.error) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json(res.data);
}
