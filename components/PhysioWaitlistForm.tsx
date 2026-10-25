"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FOR_WHOM, PRICE_FIT, SUPPORT, TIMING, checkPhysioInput, type PhysioEntry } from "../lib/physio";

const SIGNUP_HREF = `/login?mode=signup&next=${encodeURIComponent("/physiotherapy")}`;
const LOGIN_HREF = `/login?next=${encodeURIComponent("/physiotherapy")}`;

/**
 * Home-physiotherapy waitlist form. Posts to /api/physio-waitlist. Works
 * signed out; afterwards signed-out visitors are taken to sign up (using the
 * same email links their entry to the account).
 */
export default function PhysioWaitlistForm({
  existing,
  signedIn,
  defaults,
}: {
  existing: PhysioEntry | null;
  signedIn: boolean;
  defaults: { name: string; contact: string };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: existing?.name ?? defaults.name,
    contact: existing?.contact ?? defaults.contact,
    city: existing?.city ?? "",
    state: existing?.state ?? "",
    for_whom: existing?.for_whom ?? "",
    timing: existing?.timing ?? "",
    support: existing?.support ?? "",
    price_fit: existing?.price_fit ?? "",
    note: existing?.note ?? "",
    company: "", // honeypot
  });
  const [consent, setConsent] = useState(!!existing);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [editing, setEditing] = useState(!existing);
  const [redirectIn, setRedirectIn] = useState<number | null>(null);

  // Signed out: after joining, on to sign up (a short pause to read the thanks).
  useEffect(() => {
    if (redirectIn === null) return;
    if (redirectIn <= 0) {
      router.push(SIGNUP_HREF);
      return;
    }
    const t = setTimeout(() => setRedirectIn((n) => (n === null ? null : n - 1)), 1000);
    return () => clearTimeout(t);
  }, [redirectIn, router]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    const payload = { ...form, contact_consent: consent };
    const { error } = checkPhysioInput(payload);
    if (error) return setErrorMsg(error);
    setBusy(true);
    try {
      const res = await fetch("/api/physio-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "We couldn't save your response. Please try again.");
      setDone(true);
      setEditing(false);
      if (!data.signedIn) setRedirectIn(4);
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!editing && done && !signedIn) {
    return (
      <div className="rounded-[var(--radius-inner)] bg-teal-soft p-8 text-center" role="status">
        <p className="text-4xl text-teal" aria-hidden>✓</p>
        <h2 className="mt-2 text-2xl font-bold">Thanks, you&rsquo;re on the list!</h2>
        <p className="mt-2 text-ink-2">
          Create a free account to see your answers and hear about new services first. Sign up with the same email you gave us and
          we&rsquo;ll link your waitlist entry to it.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href={SIGNUP_HREF} className="btn btn-primary">Create my account{redirectIn ? ` (${redirectIn})` : ""}</Link>
          <Link href={LOGIN_HREF} onClick={() => setRedirectIn(null)} className="btn btn-quiet">I already have one</Link>
        </div>
      </div>
    );
  }

  if (!editing) {
    return (
      <div className="rounded-[var(--radius-inner)] bg-teal-soft p-8 text-center">
        <p className="text-4xl text-teal" aria-hidden>✓</p>
        <h2 className="mt-2 text-2xl font-bold">{done ? "Thanks, you're on the list!" : "You're on the list"}</h2>
        <p className="mt-2 text-ink-2">
          We&rsquo;ve noted your interest for {form.city}, {form.state}. We&rsquo;ll get in touch when home physiotherapy is available near you.
        </p>
        <button type="button" onClick={() => setEditing(true)} className="btn btn-quiet mt-5">Update my answers</button>
      </div>
    );
  }

  const select = (id: keyof typeof form, label: string, options: readonly { value: string; label: string }[], full = false) => (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label htmlFor={`pw-${id}`} className="field-label">{label} *</label>
      <select id={`pw-${id}`} required value={form[id] as string} onChange={set(id)} className="field">
        <option value="">Choose one</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {errorMsg && <p role="alert" className="alert alert-error">{errorMsg}</p>}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="pw-company">Company</label>
        <input id="pw-company" tabIndex={-1} autoComplete="off" value={form.company} onChange={set("company")} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="pw-name" className="field-label">Your name *</label>
          <input id="pw-name" required autoComplete="name" placeholder="Full name" value={form.name} onChange={set("name")} className="field" />
        </div>
        <div>
          <label htmlFor="pw-contact" className="field-label">Email or phone number *</label>
          <input id="pw-contact" required autoComplete="email" placeholder="How can we reach you?" value={form.contact} onChange={set("contact")} className="field" />
        </div>
        <div>
          <label htmlFor="pw-city" className="field-label">City *</label>
          <input id="pw-city" required autoComplete="address-level2" placeholder="e.g. Indore" value={form.city} onChange={set("city")} className="field" />
        </div>
        <div>
          <label htmlFor="pw-state" className="field-label">State *</label>
          <input id="pw-state" required autoComplete="address-level1" placeholder="e.g. Madhya Pradesh" value={form.state} onChange={set("state")} className="field" />
        </div>
        {select("for_whom", "Who needs the service?", FOR_WHOM)}
        {select("timing", "When would you use it?", TIMING)}
        {select("support", "What kind of support are you interested in?", SUPPORT, true)}
        {select("price_fit", "Would a starting price of ₹1,000 per session work for you?", PRICE_FIT, true)}
        <div className="sm:col-span-2">
          <label htmlFor="pw-note" className="field-label">Anything else? (optional)</label>
          <textarea id="pw-note" rows={3} maxLength={1000} value={form.note} onChange={set("note")} className="field"
            placeholder="For example, preferred days or general feedback (please don't share medical records)." />
        </div>
      </div>
      <label className="flex items-start gap-3 text-sm text-ink-2">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-brand-violet" />
        <span>I agree that Where&rsquo;s My Therapist may contact me about this waitlist and service updates. I understand joining the list is not a booking. *</span>
      </label>
      <p className="field-hint">Your details are used only for this enquiry and related updates, in line with our privacy policy.</p>
      <button type="submit" disabled={busy} className="btn btn-primary btn-lg btn-shine w-full sm:w-auto">
        {busy ? "Saving…" : existing ? "Update my answers" : "Join the waitlist →"}
      </button>
    </form>
  );
}
