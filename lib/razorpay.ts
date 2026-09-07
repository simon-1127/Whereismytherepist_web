import crypto from "crypto";

/**
 * Thin wrapper around the Razorpay REST API. Uses plain fetch + Basic Auth
 * rather than the `razorpay` npm package, so there's no extra dependency to
 * install — just set these two env vars (server-only, no NEXT_PUBLIC_ prefix):
 *
 *   RAZORPAY_KEY_ID
 *   RAZORPAY_KEY_SECRET
 *
 * The Checkout widget on the client also needs the key id, but as a public
 * value, so also set:
 *
 *   NEXT_PUBLIC_RAZORPAY_KEY_ID   (same value as RAZORPAY_KEY_ID)
 *
 * And for webhook verification:
 *
 *   RAZORPAY_WEBHOOK_SECRET   (set this same string in the Razorpay
 *                              dashboard under Settings -> Webhooks)
 */

function getAuthHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables.");
  }
  return "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

/**
 * Creates a Razorpay order for the given amount (in the smallest currency
 * unit — paise for INR, so ₹100 => amount: 10000).
 */
export async function createRazorpayOrder(params: {
  amountInPaise: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      amount: params.amountInPaise,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes || {},
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.description || "Failed to create Razorpay order");
  }

  return data as RazorpayOrder;
}

/**
 * Verifies the signature Razorpay Checkout returns to the browser after a
 * successful payment (razorpay_order_id + razorpay_payment_id + razorpay_signature).
 * Call this server-side before trusting that a payment succeeded.
 */
export function verifyCheckoutSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error("Missing RAZORPAY_KEY_SECRET environment variable.");

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  return timingSafeEqual(expected, params.signature);
}

/**
 * Verifies the X-Razorpay-Signature header on incoming webhook requests
 * against the raw request body.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("Missing RAZORPAY_WEBHOOK_SECRET environment variable.");
  if (!signatureHeader) return false;

  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

  return timingSafeEqual(expected, signatureHeader);
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
