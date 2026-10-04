"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { safeNext } from "../../lib/safe-next";
import { Contours } from "../../components/PageHeader";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const next = params.get("next");

  const [isSignUp, setIsSignUp] = useState(
    params.get("confirmed") !== "1" && (params.get("mode") === "signup" || params.get("as") === "provider")
  );
  const [asProvider, setAsProvider] = useState(params.get("as") === "provider");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Optional, never gates signup (TCPA): SMS/WhatsApp/email reminders.
  const [smsConsent, setSmsConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(params.get("error") || "");
  const [notice, setNotice] = useState(params.get("confirmed") === "1" ? "Your email is confirmed. Sign in to continue." : "");
  // Set after email signup: shows the "check your inbox" screen.
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  async function goAfterAuth() {
    // The server decides: therapists to their profile setup, new clients to
    // the details page, everyone else to where they were going.
    let path = safeNext(next, "/therapists");
    try {
      const res = await fetch("/api/auth/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next, as: isSignUp && asProvider ? "provider" : undefined }),
      });
      const j = await res.json();
      if (res.ok && j.path) path = j.path;
    } catch {}
    // replace (not push) so Back doesn't return to the sign-in form, then
    // refresh so server components pick up the new session cookie.
    router.replace(path);
    router.refresh();
  }

  const emailRedirectTo = () =>
    `${window.location.origin}/auth/callback?flow=email&terms=1${asProvider ? "&as=provider" : ""}${next ? `&next=${encodeURIComponent(safeNext(next))}` : ""}`;

  // While the "check your inbox" screen is up, watch for the session: if the
  // link is opened in this browser (another tab), carry on here automatically.
  useEffect(() => {
    if (!sentTo) return;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      goAfterAuth();
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => session && finish());
    const poll = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) finish();
    }, 3000);
    return () => {
      sub.subscription.unsubscribe();
      clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentTo]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function resend() {
    if (!sentTo || resendIn > 0) return;
    setError("");
    const { error } = await supabase.auth.resend({ type: "signup", email: sentTo, options: { emailRedirectTo: emailRedirectTo() } });
    if (error) setError(error.message);
    else setResendIn(60);
  }

  async function handleOAuth(provider: "google" | "apple") {
    if (isSignUp && !termsAccepted) return setError("Please accept the Terms of Service to continue.");
    const q = new URLSearchParams();
    if (isSignUp) {
      q.set("terms", "1");
      if (asProvider) q.set("as", "provider");
      if (smsConsent) {
        q.set("consent", "1");
        if (phone.trim()) q.set("phone", phone.trim());
      }
    }
    if (next) q.set("next", safeNext(next));
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback${q.toString() ? `?${q}` : ""}` },
    });
    if (error) setError(error.message);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (isSignUp && !termsAccepted) return setError("Please accept the Terms of Service to continue.");
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: emailRedirectTo(),
            data: {
              signup_next: next ? safeNext(next) : null,
              account_type: asProvider ? "provider" : "client",
              terms_accepted: true,
              terms_accepted_at: new Date().toISOString(),
              comms_consent: smsConsent,
              comms_consent_at: smsConsent ? new Date().toISOString() : null,
              phone: smsConsent && phone.trim() ? phone.trim() : null,
            },
          },
        });
        if (error) throw error;
        // With email confirmation on, there's no session yet. The old code
        // tried to route anyway and the button sat on "Processing…" forever.
        if (!data.session) {
          setSentTo(email.trim());
          setResendIn(60);
          return;
        }
        await goAfterAuth();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await goAfterAuth();
      }
    } catch (err: any) {
      const msg: string = err?.message || "Something went wrong.";
      setError(
        /invalid login/i.test(msg)
          ? "That email and password don't match. Check them, or sign in with Google or Apple if that's how you joined."
          : /email not confirmed/i.test(msg)
            ? "Confirm your email first — the link is in your inbox."
            : msg
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell flex-1 py-8 md:py-12">
      <div className="grid overflow-hidden sheet lg:grid-cols-[1fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <Contours className="pointer-events-none absolute -left-40 bottom-[-30%] h-[120%] text-white/25" mono />
          <img src="/logo_full.png" alt="" className="relative w-40 rounded-2xl bg-white p-3" />
          <div className="relative">
            {isSignUp && asProvider ? (
              <>
                <p className="font-display text-[2.6rem] font-semibold leading-[1.08]">Meet clients who are already looking for you.</p>
                <p className="mt-4 max-w-sm text-white/70">
                  Set your own price, hours and languages. We handle bookings, payments and video calls.
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-[2.6rem] font-semibold leading-[1.08]">
                  Finding help shouldn&rsquo;t be the hardest part.
                </p>
                <p className="mt-4 max-w-sm text-white/70">
                  Compare licensed therapists by what you&rsquo;re going through, your language and your budget. Book in a couple of
                  minutes.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="px-6 py-10 sm:px-12 md:py-14">
          {sentTo ? (
            <CheckInbox
              email={sentTo}
              error={error}
              resendIn={resendIn}
              onResend={resend}
              onChangeEmail={() => {
                setSentTo(null);
                setError("");
              }}
            />
          ) : (
          <div className="mx-auto max-w-md">
            <h1 className="text-4xl font-bold">{isSignUp ? (asProvider ? "Join as a therapist" : "Create your account") : "Welcome back"}</h1>
            <p className="mt-2 text-ink-2">
              {isSignUp ? "Already have one?" : "New here?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setNotice("");
                }}
                className="link"
              >
                {isSignUp ? "Sign in" : "Create an account"}
              </button>
            </p>

            {error && <p role="alert" className="alert alert-error mt-6">{error}</p>}
            {notice && <p role="status" className="alert alert-ok mt-6">{notice}</p>}

            {isSignUp && (
              <div className="mt-6 grid grid-cols-2 rounded-2xl bg-mist p-1 ring-1 ring-line" role="radiogroup" aria-label="Account type">
                {[
                  { v: false, l: "I want therapy" },
                  { v: true, l: "I'm a therapist" },
                ].map((o) => (
                  <button
                    key={o.l}
                    type="button"
                    role="radio"
                    aria-checked={asProvider === o.v}
                    onClick={() => setAsProvider(o.v)}
                    className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${asProvider === o.v ? "bg-white text-ink shadow-sm ring-1 ring-line" : "text-ink-3 hover:text-ink"}`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            )}
            {isSignUp && asProvider && (
              <p className="mt-3 rounded-2xl bg-lilac px-4 py-3 text-sm leading-relaxed text-ink-2">
                You&rsquo;ll fill in your profile right after signing up. Then email your documents to{" "}
                <a href="mailto:partner@wheresmytherapist.com" className="link">partner@wheresmytherapist.com</a>.{" "}
                <Link href="/for-therapists" target="_blank" className="link">See what to send</Link>
              </p>
            )}

            {isSignUp && (
              <label className="mt-6 flex cursor-pointer items-start gap-3 text-[15px] text-ink-2">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 h-4 w-4 accent-[#1b1a47]" />
                <span>
                  I accept the <Link href="/terms" target="_blank" className="link">Terms of Service</Link> and have read the{" "}
                  <Link href="/privacy" target="_blank" className="link">Privacy Policy</Link>.
                </span>
              </label>
            )}

            <button onClick={() => handleOAuth("google")} disabled={isSignUp && !termsAccepted} className="btn btn-quiet mt-6 w-full">
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
            <button onClick={() => handleOAuth("apple")} disabled={isSignUp && !termsAccepted} className="btn mt-3 w-full bg-black text-white hover:bg-black/85">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.62-1.7-3.19-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.11 8.79.73 1.06 1.6 2.25 2.75 2.2 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.71.71 2.88.69 1.19-.02 1.94-1.08 2.67-2.14.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.32-.89-2.33-3.54zM14.18 6.13c.61-.74 1.02-1.76.91-2.78-.88.04-1.94.59-2.57 1.32-.56.65-1.06 1.69-.93 2.69.98.08 1.98-.5 2.59-1.23z" />
              </svg>
              Continue with Apple
            </button>

            <div className="my-6 flex items-center gap-3 text-sm text-ink-3">
              <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="field-label">Email</label>
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="password" className="field-label">Password</label>
                  {!isSignUp && (
                    <Link href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`} className="text-sm font-semibold text-brand-violet hover:underline">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <input id="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} required minLength={6}
                  value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
              </div>

              {isSignUp && (
                <>
                  <div>
                    <label htmlFor="phone" className="field-label">
                      Phone <span className="font-normal text-ink-3">(optional)</span>
                    </label>
                    <input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="field"
                      placeholder="For session reminders on WhatsApp or SMS" />
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-ink-3">
                    <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#1b1a47]" />
                    <span>
                      Optional: send me appointment reminders, updates and support messages from Where&rsquo;s My Therapist by
                      WhatsApp, SMS or email at the number above. Message frequency varies. Message and data rates may apply. Reply
                      HELP for help or STOP to opt out. See the <Link href="/terms" target="_blank" className="link">Mobile Terms</Link> and{" "}
                      <Link href="/privacy" target="_blank" className="link">Privacy Policy</Link>.
                    </span>
                  </label>
                </>
              )}

              <button type="submit" disabled={loading || (isSignUp && !termsAccepted)} className="btn btn-primary w-full">
                {loading ? (isSignUp ? "Creating account…" : "Signing in…") : isSignUp ? "Create account" : "Sign in"}
              </button>
            </form>
          </div>
          )}
        </div>
      </div>
    </main>
  );
}

function inboxLink(email: string): { href: string; label: string } | null {
  const d = email.split("@")[1]?.toLowerCase() || "";
  if (d === "gmail.com" || d === "googlemail.com") return { href: "https://mail.google.com/mail/u/0/#search/wheresmytherapist", label: "Open Gmail" };
  if (/^(outlook|hotmail|live|msn)\./.test(d)) return { href: "https://outlook.live.com/mail/0/", label: "Open Outlook" };
  if (d.startsWith("yahoo.") || d === "ymail.com") return { href: "https://mail.yahoo.com/", label: "Open Yahoo Mail" };
  if (d === "icloud.com" || d === "me.com") return { href: "https://www.icloud.com/mail", label: "Open iCloud Mail" };
  if (d.startsWith("rediffmail.")) return { href: "https://mail.rediff.com/", label: "Open Rediffmail" };
  return null;
}

function CheckInbox({
  email,
  error,
  resendIn,
  onResend,
  onChangeEmail,
}: {
  email: string;
  error: string;
  resendIn: number;
  onResend: () => void;
  onChangeEmail: () => void;
}) {
  const box = inboxLink(email);
  return (
    <div className="mx-auto max-w-md">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-soft">
        <svg className="h-8 w-8 text-brand-violet" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 className="mt-6 text-4xl font-bold">Check your inbox</h1>
      <p className="mt-3 text-lg text-ink-2">
        We sent a confirmation link to <strong className="break-all text-ink">{email}</strong>.
      </p>
      <ol className="mt-6 space-y-3 text-[15px] text-ink-2">
        <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">1</span><span>Open the email from Where&rsquo;s My Therapist.</span></li>
        <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">2</span><span>Tap <strong className="text-ink">Confirm your email</strong>. You&rsquo;ll be signed in and taken to the next step.</span></li>
      </ol>
      <p className="mt-5 flex items-center gap-2 rounded-2xl bg-mist px-4 py-3 text-sm text-ink-3">
        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-teal" />
        If you open the link in this browser, this page continues by itself.
      </p>
      {error && <p role="alert" className="alert alert-error mt-5">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        {box && (
          <a href={box.href} target="_blank" rel="noopener noreferrer" className="btn btn-primary">{box.label}</a>
        )}
        <button onClick={onResend} disabled={resendIn > 0} className="btn btn-quiet">
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend email"}
        </button>
      </div>
      <p className="mt-6 text-sm text-ink-3">
        Can&rsquo;t find it? Check Spam or Promotions.{" "}
        <button onClick={onChangeEmail} className="link">Use a different email</button>
      </p>
    </div>
  );
}
