import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { postAuthPath, promoteIfRequested } from "../../../lib/onboarding";

/**
 * The public origin. Behind cPanel/Passenger, request.url is the internal
 * address (e.g. http://localhost:3000), so redirecting to it sent people
 * to a dead localhost page after Google sign-in. Prefer the forwarded host.
 */
function publicOrigin(request: Request) {
  // Stay on the host the request came in on (www or not): the session
  // cookie belongs to that host, so switching hosts would drop the sign-in.
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
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const termsAccepted = searchParams.get("terms") === "1";
  const consent = searchParams.get("consent") === "1";
  const phone = searchParams.get("phone");
  const next = searchParams.get("next");
  const asProvider = searchParams.get("as") === "provider";
  const origin = publicOrigin(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          const admin = createAdminClient();
          if (termsAccepted) {
            await admin
              .from("users")
              .update({ terms_accepted_at: new Date().toISOString() })
              .eq("id", user.id)
              .is("terms_accepted_at", null);
          }
          if (consent) {
            const updates: Record<string, string> = { comms_consent_at: new Date().toISOString() };
            if (phone) updates.phone = phone;
            await admin.from("users").update(updates).eq("id", user.id).is("comms_consent_at", null);
          }
        } catch (err) {
          // Consent stamps are best-effort; never block sign-in on them.
          console.error("auth callback consent update failed:", err);
        }

        // Password reset link (code flow): straight to the new-password form.
        if (searchParams.get("flow") === "recovery") return NextResponse.redirect(`${origin}/reset-password`);
        await promoteIfRequested(user, asProvider);
        // New people (Google, Apple or email) go to the details page first.
        return NextResponse.redirect(`${origin}${await postAuthPath(supabase, user, next)}`);
      }
    }
  }

  // Email links opened in another browser or mail app can't finish the code
  // exchange (the PKCE cookie lives in the browser that signed up), but the
  // email IS confirmed by then. Say so instead of showing an error.
  if (searchParams.get("flow") === "recovery") {
    return NextResponse.redirect(
      `${origin}/forgot-password?error=${encodeURIComponent("That reset link has expired, was already used, or was opened in a different browser. Request a new one below.")}`
    );
  }
  if (searchParams.get("flow") === "email") {
    return NextResponse.redirect(`${origin}/login?confirmed=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Sign-in didn't complete. Please try again.")}`);
}
