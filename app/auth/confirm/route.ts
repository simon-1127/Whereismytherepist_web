import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { postAuthPath, promoteIfRequested } from "../../../lib/onboarding";
import { safeNext } from "../../../lib/safe-next";

/**
 * Email link target (signup confirmation and password reset). Verifying a
 * token_hash works in ANY browser or mail app and signs the person in.
 *
 * Supabase templates:
 *   Confirm signup:  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
 *   Reset password:  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery
 */

const TYPES: EmailOtpType[] = ["email", "signup", "recovery", "invite", "magiclink", "email_change"];

/**
 * Redirect on the SAME host the link was opened on. The session cookie is
 * set for this host, so sending someone from wheresmytherapist.com to
 * www.wheresmytherapist.com would drop the sign-in.
 */
function sameHostOrigin(request: Request) {
  const h = request.headers;
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = (h.get("x-forwarded-proto") || "https").split(",")[0].trim();
  if (host && !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return `${proto}://${host}`;
  // Behind cPanel/Passenger the host can be the internal localhost: use the
  // public site URL then (but keep localhost when actually developing).
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const origin = sameHostOrigin(request);
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const rawType = searchParams.get("type") || "email";
  const type: EmailOtpType = TYPES.includes(rawType as EmailOtpType) ? (rawType as EmailOtpType) : "email";
  const isRecovery = type === "recovery";

  const fail = (msg: string) =>
    NextResponse.redirect(
      isRecovery
        ? `${origin}/forgot-password?error=${encodeURIComponent(msg)}`
        : `${origin}/login?error=${encodeURIComponent(msg)}`
    );

  if (!tokenHash) return fail("That link is incomplete. Please request a new one.");

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    const user = data?.user;

    if (error || !user) {
      console.error("auth confirm: verifyOtp failed:", error?.status, error?.message);
      return fail(
        isRecovery
          ? "That reset link has expired or was already used. Request a new one below."
          : "That confirmation link has expired or was already used. Sign in, or sign up again to get a new link."
      );
    }

    if (isRecovery) return NextResponse.redirect(`${origin}/reset-password`);

    // Signup confirmation: stamp consents from signup metadata (best effort).
    const meta = user.user_metadata || {};
    try {
      const admin = createAdminClient();
      if (meta.terms_accepted) {
        await admin.from("users").update({ terms_accepted_at: meta.terms_accepted_at || new Date().toISOString() }).eq("id", user.id).is("terms_accepted_at", null);
      }
      if (meta.comms_consent) {
        const updates: Record<string, string> = { comms_consent_at: meta.comms_consent_at || new Date().toISOString() };
        if (meta.phone) updates.phone = meta.phone;
        await admin.from("users").update(updates).eq("id", user.id).is("comms_consent_at", null);
      }
    } catch (err) {
      console.error("auth confirm: consent update failed:", err);
    }

    await promoteIfRequested(user, false); // reads account_type from signup metadata
    const next = typeof meta.signup_next === "string" ? safeNext(meta.signup_next, "") || null : null;
    return NextResponse.redirect(`${origin}${await postAuthPath(supabase, user, next)}`);
  } catch (err: any) {
    // Never show a bare 500: log it and send the person somewhere useful.
    console.error("auth confirm crashed:", err?.stack || err);
    return fail(`Something went wrong while checking your link (${String(err?.message || err).slice(0, 120)}). Please try again.`);
  }
}
