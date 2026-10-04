import crypto from "crypto";

/**
 * Thin wrapper around the Razorpay REST API (plain fetch + Basic Auth, no SDK).
 *
 * Server-only env vars, read at RUNTIME (so they must be set on the cPanel
 * Node app, not just in your local .env when you build):
 *   RAZORPAY_KEY_ID
 *   RAZORPAY_KEY_SECRET
 *   RAZORPAY_WEBHOOK_SECRET   (same string as Razorpay Dashboard -> Webhooks)
 *
 * NEXT_PUBLIC_RAZORPAY_KEY_ID is no longer needed: create-order returns the
 * runtime RAZORPAY_KEY_ID to the browser instead. NEXT_PUBLIC_* values are
 * baked in at build time, so a missing/stale one locally silently broke
 * checkout on the server.
 */

const API = "https://api.razorpay.com/v1";

export function razorpayKeyId(): string {
  const id = process.env.RAZORPAY_KEY_ID;
  if (!id) throw new Error("RAZORPAY_KEY_ID is not set on the server.");
  return id;
}

function getAuthHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set on the server.");
  }
  return "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

async function rz<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: getAuthHeader(), ...(init?.headers || {}) },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.error?.description || `Razorpay request failed (${res.status})`);
  }
  return data as T;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  method?: string;
  notes?: Record<string, string>;
}

/** amountInPaise must come from the database, never the request body. */
export function createRazorpayOrder(params: {
  amountInPaise: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  return rz<RazorpayOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: params.amountInPaise,
      currency: params.currency,
      receipt: params.receipt.slice(0, 40),
      notes: params.notes || {},
      payment_capture: 1,
    }),
  });
}

export function fetchOrder(orderId: string) {
  return rz<RazorpayOrder>(`/orders/${encodeURIComponent(orderId)}`);
}

/** Orders created for a session use the session id as the receipt — both
 * on the web and in the mobile backend — so this finds them from either. */
export async function fetchOrdersByReceipt(receipt: string): Promise<RazorpayOrder[]> {
  const data = await rz<{ items: RazorpayOrder[] }>(`/orders?receipt=${encodeURIComponent(receipt)}`);
  return data.items || [];
}

export async function fetchOrderPayments(orderId: string): Promise<RazorpayPayment[]> {
  const data = await rz<{ items: RazorpayPayment[] }>(`/orders/${encodeURIComponent(orderId)}/payments`);
  return data.items || [];
}

export function fetchPayment(paymentId: string) {
  return rz<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}

export function capturePayment(paymentId: string, amount: number, currency: string) {
  return rz<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}/capture`, {
    method: "POST",
    body: JSON.stringify({ amount, currency }),
  });
}

/**
 * Checkout callback signature (order_id|payment_id, signed with the key
 * secret). A hint only — confirmation always re-checks Razorpay's API.
 */
export function verifyCheckoutSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return timingSafeEqual(expected, params.signature);
}

/** X-Razorpay-Signature on webhooks, over the raw body. */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || !signatureHeader) return false;
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return timingSafeEqual(expected, signatureHeader);
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
