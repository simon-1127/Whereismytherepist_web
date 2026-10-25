import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { clientIp, rateLimited } from "../../../lib/rate-limit";

/**
 * Contact form → support inbox via Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Public on purpose: people write in before they have an account. Spam
 * guards: a hidden honeypot field and a small per-IP rate limit (in-memory,
 * fine for the single Node process on cPanel). Reply-To is the sender, so
 * support can just hit Reply.
 *
 * Env: RESEND_API_KEY (required), CONTACT_TO (default support@…),
 * CONTACT_FROM (default noreply@wheresmytherapist.com — must be on a domain
 * verified in Resend).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  // Bots fill every field; people never see this one.
  if (typeof body?.company === "string" && body.company.trim()) return NextResponse.json({ ok: true });

  const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const name = clean(body?.name, 120).replace(/[\r\n]+/g, " ");
  const email = clean(body?.email, 160);
  const subject = clean(body?.subject, 160).replace(/[\r\n]+/g, " ");
  const message = clean(body?.message, 5000);
  if (!name || !subject || message.length < 5) {
    return NextResponse.json({ error: "Please fill in your name, a subject and your message." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  if (rateLimited(`contact:${clientIp(request)}`)) {
    return NextResponse.json({ error: "You've sent a few messages already. Please wait a few minutes and try again." }, { status: 429 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("Contact form disabled: RESEND_API_KEY is not set.");
    return NextResponse.json({ error: "Our contact form is temporarily unavailable." }, { status: 503 });
  }

  // Signed-in senders are tagged so support can find their account.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const text = [
    message,
    "",
    "—",
    `From: ${name} <${email}>`,
    user ? `Account: ${user.email} (${user.id})` : "Account: not signed in",
    `Sent from the contact form at ${new Date().toISOString()}`,
  ].join("\n");

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || "Where's My Therapist <noreply@wheresmytherapist.com>",
        to: [process.env.CONTACT_TO || "support@wheresmytherapist.com"],
        reply_to: email,
        subject: `[Contact] ${subject}`,
        text,
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e) {
    console.error("Resend unreachable:", e);
    return NextResponse.json({ error: "We couldn't send your message. Please try again or email us directly." }, { status: 502 });
  }
  if (!res.ok) {
    console.error("Resend error:", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ error: "We couldn't send your message. Please try again or email us directly." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
