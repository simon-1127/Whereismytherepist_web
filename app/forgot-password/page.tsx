"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotInner />
    </Suspense>
  );
}

function ForgotInner() {
  const params = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState(params.get("email") || "");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(params.get("error") || "");
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (wait > 0) return;
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?flow=recovery`,
    });
    setLoading(false);
    // Don't reveal whether an account exists: only rate-limit errors are shown.
    if (error && /rate|seconds|too many/i.test(error.message)) {
      setError("Please wait a minute before asking for another link.");
      return;
    }
    if (error) console.error("reset email:", error.message);
    setSent(true);
    setWait(60);
  }

  return (
    <main className="shell flex flex-1 items-center py-10 md:py-16">
      <div className="sheet mx-auto w-full max-w-md p-7 md:p-10">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft">
          <svg className="h-7 w-7 text-brand-violet" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>

        {sent ? (
          <>
            <h1 className="mt-6 text-3xl font-bold md:text-4xl">Check your inbox</h1>
            <p className="mt-3 text-ink-2">
              If there&rsquo;s an account for <strong className="break-all text-ink">{email}</strong>, we&rsquo;ve sent a link to set a new
              password. It works once and expires in an hour.
            </p>
            <p className="mt-4 rounded-2xl bg-mist px-4 py-3 text-sm text-ink-3">
              Signed up with Google or Apple? You don&rsquo;t have a password here. Just use that button on the sign-in page.
            </p>
            {error && <p role="alert" className="alert alert-error mt-5">{error}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => send()} disabled={wait > 0 || loading} className="btn btn-quiet">
                {wait > 0 ? `Resend in ${wait}s` : "Resend link"}
              </button>
              <Link href="/login" className="btn btn-primary">Back to sign in</Link>
            </div>
            <p className="mt-5 text-sm text-ink-3">
              Can&rsquo;t find it? Check Spam or Promotions, or{" "}
              <button onClick={() => setSent(false)} className="link">try another email</button>.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-3xl font-bold md:text-4xl">Forgot your password?</h1>
            <p className="mt-3 text-ink-2">Enter the email you signed up with and we&rsquo;ll send you a link to set a new one.</p>
            {error && <p role="alert" className="alert alert-error mt-5">{error}</p>}
            <form onSubmit={send} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="field-label">Email</label>
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" autoFocus />
              </div>
              <button type="submit" disabled={loading || wait > 0} className="btn btn-primary w-full">
                {loading ? "Sending…" : wait > 0 ? `Wait ${wait}s` : "Send reset link"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-ink-3">
              Remembered it? <Link href="/login" className="link">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
