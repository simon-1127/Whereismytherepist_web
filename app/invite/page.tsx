import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { PLAY_STORE_URL, androidIntentUrl, isAndroid } from "../../lib/app-links";
import { SITE_URL } from "../../lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your invitation", robots: { index: false } };

/**
 * Landing page for the employer invite email (HR dashboard
 * sendEmployeeInvite). Both email buttons come here: "Continue on the
 * website" and "Open in the app" (?app=1).
 *
 * Why a page and not the raw Supabase link: the sign-in token works ONCE.
 * Mail scanners (Gmail, Outlook Safe Links) open links before the person
 * does, which used to burn the token, so the employee then saw "Email link
 * is invalid or has expired". This page doesn't touch the token; it's only
 * used when the person taps a button.
 */
export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; email?: string; app?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token_hash && /^[A-Za-z0-9_-]{10,200}$/.test(sp.token_hash) ? sp.token_hash : null;
  const type = sp.type === "invite" ? "invite" : "magiclink";
  const email = sp.email && sp.email.length < 200 ? sp.email : null;
  const preferApp = sp.app === "1";
  const android = isAndroid((await headers()).get("user-agent") || "");

  const q = token ? `token_hash=${encodeURIComponent(token)}&type=${type}` : "";
  const webHref = token ? `/auth/confirm?${q}` : "/login";
  const here = `${SITE_URL}/invite?${q}${email ? `&email=${encodeURIComponent(email)}` : ""}`;
  const appHref = token ? androidIntentUrl(`login-callback/?${q}`, PLAY_STORE_URL || here) : null;

  const webCard = (
    <div className="card p-6 md:p-8" key="web">
      <p className="text-sm font-semibold uppercase tracking-wide text-ink-3">On a computer, or any browser</p>
      <h2 className="mt-1 text-2xl font-semibold">Continue on the website</h2>
      <p className="mt-2 text-ink-2">
        Signs you in here and takes you to a short profile step. Your employer&rsquo;s plan is applied to your account
        automatically, and you can book sessions and use your benefits right away.
      </p>
      <a href={webHref} className="btn btn-primary mt-5">Continue on the website</a>
    </div>
  );

  const appCard = (
    <div className="card p-6 md:p-8" key="app">
      <p className="text-sm font-semibold uppercase tracking-wide text-ink-3">On your Android phone</p>
      <h2 className="mt-1 text-2xl font-semibold">Open in the app</h2>
      <p className="mt-2 text-ink-2">
        Install the Where&rsquo;s My Therapist app first
        {PLAY_STORE_URL ? (
          <> (<a href={PLAY_STORE_URL} className="link">get it on Google Play</a>)</>
        ) : null}
        , then tap the button below on the same phone. The app signs you in with this invite. It also has the AI
        companion, mood check-ins and journaling.
      </p>
      {android && appHref ? (
        <a href={appHref} className="btn btn-primary mt-5">Open in the app</a>
      ) : (
        <p className="mt-5 rounded-2xl bg-mist-2 p-4 text-sm text-ink-2">
          Open this email on your Android phone to use this option. On a computer, use &ldquo;Continue on the
          website&rdquo;.
        </p>
      )}
    </div>
  );

  return (
    <main className="shell py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-[2.4rem] font-bold md:text-5xl">You&rsquo;re invited</h1>
        <p className="mt-3 text-lg text-ink-2">
          Your employer has set you up with Where&rsquo;s My Therapist{email ? <> for <strong>{email}</strong></> : null}.
          Choose where you&rsquo;d like to start. You can use both later with the same email.
        </p>

        {!token && (
          <p className="mt-6 rounded-2xl bg-lilac p-4 text-ink-2">
            This invite link is incomplete. Sign in below with the email your invite was sent to.
          </p>
        )}

        <div className="mt-8 grid gap-5">{preferApp ? [appCard, webCard] : [webCard, appCard]}</div>

        <div className="mt-8 rounded-2xl p-5 ring-1 ring-line">
          <h3 className="font-semibold">Link expired or already used?</h3>
          <p className="mt-1 text-[15px] text-ink-2">
            Invite links work once and only for a limited time. You don&rsquo;t need a new one: sign in on the website
            or in the app with <strong>{email || "the email your invite was sent to"}</strong>, using &ldquo;Continue
            with Google&rdquo; or &ldquo;Forgot password&rdquo; to set a password. Your employer benefits are tied to
            that email.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/login" className="btn btn-quiet btn-sm">Sign in</Link>
            <Link href="/forgot-password" className="btn btn-quiet btn-sm">Forgot password</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
