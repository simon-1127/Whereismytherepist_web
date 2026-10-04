"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

/** Reached from the reset email: the link has already signed the person in. */
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [ready, setReady] = useState<"checking" | "ok" | "no-session">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email || "");
        setReady("ok");
      } else setReady("no-session");
    });
  }, [supabase]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setSaving(false);
      setError(
        /different from the old/i.test(error.message)
          ? "Choose a password you haven't used here before."
          : /weak|short/i.test(error.message)
            ? "That password is too weak. Try a longer one."
            : error.message
      );
      return;
    }
    setDone(true);
    // Continue to wherever this person normally lands.
    let path = "/therapists";
    try {
      const res = await fetch("/api/auth/finish", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const j = await res.json();
      if (res.ok && j.path) path = j.path;
    } catch {}
    setTimeout(() => {
      router.replace(path);
      router.refresh();
    }, 1200);
  }

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 10 ? 3 : 2;

  return (
    <main className="shell flex flex-1 items-center py-10 md:py-16">
      <div className="sheet mx-auto w-full max-w-md p-7 md:p-10">
        {ready === "checking" && <p className="text-ink-3">Checking your link…</p>}

        {ready === "no-session" && (
          <>
            <h1 className="text-3xl font-bold">This link has expired</h1>
            <p className="mt-3 text-ink-2">Reset links work once and only for an hour. Ask for a new one and use it straight away.</p>
            <Link href="/forgot-password" className="btn btn-primary mt-6">Get a new link</Link>
          </>
        )}

        {ready === "ok" && done && (
          <>
            <h1 className="text-3xl font-bold">Password updated</h1>
            <p className="mt-3 text-ink-2">You&rsquo;re signed in. Taking you back…</p>
          </>
        )}

        {ready === "ok" && !done && (
          <>
            <h1 className="text-3xl font-bold md:text-4xl">Set a new password</h1>
            {email && <p className="mt-2 text-ink-2">For <strong className="break-all text-ink">{email}</strong></p>}
            {error && <p role="alert" className="alert alert-error mt-5">{error}</p>}
            <form onSubmit={save} className="mt-6 space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="pw" className="field-label">New password</label>
                  <button type="button" onClick={() => setShow(!show)} className="text-sm font-semibold text-brand-violet">{show ? "Hide" : "Show"}</button>
                </div>
                <input id="pw" type={show ? "text" : "password"} autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="field" autoFocus />
                <div className="mt-2 flex gap-1.5" aria-hidden>
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${strength >= n ? (strength === 1 ? "bg-[#d42f5c]" : strength === 2 ? "bg-[#e0a100]" : "bg-[#12a26b]") : "bg-mist-2"}`} />
                  ))}
                </div>
                <p className="field-hint">At least 8 characters. Longer, with a number and a capital letter, is stronger.</p>
              </div>
              <div>
                <label htmlFor="pw2" className="field-label">Confirm new password</label>
                <input id="pw2" type={show ? "text" : "password"} autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="field" />
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary w-full">{saving ? "Saving…" : "Save new password"}</button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
