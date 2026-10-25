"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadRazorpay } from "../lib/checkout";
import { formatMoney } from "../lib/money";
import { fmtDayLong } from "../lib/format";

export type TierPrice = { id: "starter" | "growth"; name: string; monthly: number; yearly: number | null };
type Billing = "monthly" | "yearly";
type Sub = {
  status: string;
  tier_id?: string;
  billing?: Billing;
  amount?: number;
  trial_ends_at?: string | null;
  next_charge_at?: string | null;
  access_until?: string | null;
  cancel_at_cycle_end?: boolean;
  trial_used?: boolean;
  error?: string;
};

const LIVE = ["authenticated", "active", "pending"];

/**
 * The client's plan: start the 3-week Starter trial, subscribe (monthly or
 * yearly), switch, or cancel. All rules (one trial per account, carrying a
 * trial over on upgrade, switching at renewal) live in the backend; this
 * only shows its answer and runs Razorpay Checkout for the subscription.
 * Therapy sessions are paid per session and are not part of any plan.
 */
export default function PlanManager({
  tiers,
  currentTier,
  email,
  requested,
}: {
  tiers: TierPrice[];
  currentTier: string;
  email?: string | null;
  requested?: { plan?: string; billing?: string; trial?: string };
}) {
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  const [sub, setSub] = useState<Sub | null>(null);
  const [billing, setBilling] = useState<Billing>(requested?.billing === "yearly" ? "yearly" : "monthly");
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const wanted = requested?.plan === "starter" || requested?.plan === "growth" ? requested.plan : null;

  async function refresh() {
    const res = await fetch("/api/plan", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    setSub(res.ok ? data : { status: "unknown", error: data.error || "Couldn't load your plan." });
  }

  useEffect(() => {
    refresh();
    if (wanted) ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (currentTier === "HR-Onboarding") {
    return (
      <section ref={ref} className="sheet p-6 md:p-8" aria-labelledby="plan-title">
        <h2 id="plan-title" className="font-display text-2xl font-semibold">Your plan</h2>
        <p className="mt-2 text-ink-2">Your plan is provided by your organisation. There&rsquo;s nothing to pay.</p>
      </section>
    );
  }

  const now = Date.now();
  const live = !!sub && LIVE.includes(sub.status) && !sub.cancel_at_cycle_end;
  const trialing = !!sub?.trial_ends_at && new Date(sub.trial_ends_at).getTime() > now && ["authenticated", "cancelled"].includes(sub.status);
  const trialOpen = !!sub && !sub.trial_used && !live && !trialing;
  const accessUntil = sub?.access_until ? new Date(sub.access_until) : null;

  async function start(tier: TierPrice, trial: boolean) {
    setErrorMsg(null);
    setOkMsg(null);
    setBusy(`${tier.id}-${trial}`);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier_id: tier.id, trial, billing }),
      });
      const draft = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(draft.error || "Couldn't start checkout.");
      if (!(await loadRazorpay())) throw new Error("The payment window couldn't load. Check your connection and try again.");

      const firstCharge = draft.first_charge_at ? new Date(draft.first_charge_at) : null;
      const later = firstCharge && firstCharge.getTime() - Date.now() > 60 * 60_000;
      const rzp = new window.Razorpay({
        key: draft.razorpay_key_id,
        subscription_id: draft.subscription_id,
        name: "Where's My Therapist",
        description: later
          ? `${tier.name} · first charge ${fmtDayLong(firstCharge!)}`
          : `${tier.name} · ${formatMoney(draft.amount, "INR")} / ${draft.billing === "yearly" ? "year" : "month"}`,
        prefill: { email: email || undefined },
        theme: { color: "#1b1a47" },
        handler: async (r: any) => {
          setBusy("confirming");
          const v = await fetch("/api/plan/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(r),
          });
          const data = await v.json().catch(() => ({}));
          // Webhooks finish the job even if this fails; just show the latest.
          if (v.ok) setSub(data);
          else await refresh();
          setOkMsg(draft.trial_ends_at ? "Your free trial has started. Nothing is charged until it ends." : later ? "Done. Your new plan starts on the date shown." : "Your plan is active.");
          setBusy(null);
          router.refresh();
        },
        modal: { ondismiss: () => setBusy(null) },
      });
      rzp.on("payment.failed", (r: any) => {
        setErrorMsg(r?.error?.description || "Autopay couldn't be set up. You haven't been charged — try again.");
        setBusy(null);
      });
      rzp.open();
    } catch (e: any) {
      setErrorMsg(e.message || "Something went wrong. Please try again.");
      setBusy(null);
    }
  }

  async function cancel() {
    setErrorMsg(null);
    setBusy("cancel");
    const res = await fetch("/api/plan/cancel", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setSub(data);
      setOkMsg(trialing ? "Autopay is off. You won't be charged, and your trial runs to its end." : "Autopay is off. Your plan runs to the end of the period you paid for.");
      router.refresh();
    } else setErrorMsg(data.error || "Couldn't cancel. Please try again.");
    setConfirmCancel(false);
    setBusy(null);
  }

  const priceOf = (t: TierPrice) => (billing === "yearly" && t.yearly ? t.yearly : t.monthly);
  const perMonth = (t: TierPrice) => (billing === "yearly" && t.yearly ? Math.round(t.yearly / 12) : t.monthly);

  return (
    <section ref={ref} id="plan" className="sheet scroll-mt-28 space-y-5 p-6 md:p-8" aria-labelledby="plan-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="plan-title" className="font-display text-2xl font-semibold">Your plan</h2>
          <p className="mt-1 text-sm text-ink-3">Booking a therapist never needs a plan. Sessions are paid per session.</p>
        </div>
        <div className="flex rounded-full bg-mist p-1 text-sm font-semibold" role="group" aria-label="Billing">
          {(["monthly", "yearly"] as const).map((b) => (
            <button key={b} type="button" onClick={() => setBilling(b)} aria-pressed={billing === b}
              className={`rounded-full px-4 py-1.5 ${billing === b ? "bg-paper text-ink shadow-sm" : "text-ink-3"}`}>
              {b === "monthly" ? "Monthly" : "Yearly, save 30%"}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && <p role="alert" className="alert alert-error">{errorMsg}</p>}
      {okMsg && <p role="status" className="alert alert-ok">{okMsg}</p>}

      {/* Where you stand */}
      {!sub ? (
        <p className="text-ink-3">Loading your plan…</p>
      ) : sub.status === "unknown" ? (
        <p className="alert alert-warn">{sub.error}</p>
      ) : trialing ? (
        <div className="well p-4">
          <p className="font-semibold">Free trial · {capital(sub.tier_id)} until {fmtDayLong(sub.trial_ends_at!)}</p>
          <p className="mt-1 text-sm text-ink-2">
            {live ? `Then ${formatMoney(sub.amount, "INR")} / ${sub.billing === "yearly" ? "year" : "month"} by autopay. Cancel before then and you pay nothing.` : "Autopay is off — you won't be charged."}
          </p>
        </div>
      ) : sub.status === "pending" ? (
        <p className="alert alert-warn">Your last autopay charge didn&rsquo;t go through. Razorpay will retry; check your UPI app or card.</p>
      ) : sub.status === "halted" ? (
        <p className="alert alert-error">Your plan is paused because autopay failed. Subscribe again below to continue.</p>
      ) : live || (accessUntil && accessUntil.getTime() > now) ? (
        <div className="well p-4">
          <p className="font-semibold">
            {capital(sub.tier_id)} · {formatMoney(sub.amount, "INR")} / {sub.billing === "yearly" ? "year" : "month"}
          </p>
          <p className="mt-1 text-sm text-ink-2">
            {live && sub.next_charge_at
              ? `${sub.status === "authenticated" ? "Starts" : "Renews"} ${fmtDayLong(sub.next_charge_at)} by autopay.`
              : accessUntil
                ? `Autopay is off. Your plan ends ${fmtDayLong(accessUntil)}.`
                : ""}
          </p>
        </div>
      ) : (
        <p className="text-ink-2">
          {trialOpen ? "Try Starter free for 3 weeks. Nothing is charged until day 22, and you can cancel any time before." : "You don't have a plan right now."}
        </p>
      )}

      {/* Choices */}
      {sub && sub.status !== "unknown" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {tiers.map((t) => {
            const isCurrent = live && sub.tier_id === t.id && sub.billing === billing;
            const highlight = wanted === t.id;
            const canTrial = trialOpen && t.id === "starter";
            return (
              <div key={t.id} className={`rounded-[var(--radius-inner)] border p-5 ${highlight ? "border-brand-violet ring-2 ring-brand-violet/30" : "border-line"}`}>
                <p className="font-display text-xl font-semibold">{t.name}</p>
                <p className="mt-1">
                  <span className="font-display text-3xl font-bold">{formatMoney(perMonth(t), "INR")}</span>
                  <span className="text-sm text-ink-3"> / month</span>
                </p>
                {billing === "yearly" && t.yearly && <p className="text-sm text-ink-3">{formatMoney(priceOf(t), "INR")} billed yearly</p>}
                <div className="mt-4 space-y-2">
                  {isCurrent ? (
                    <p className="text-sm font-semibold text-teal">Your current plan</p>
                  ) : (
                    <>
                      {canTrial && (
                        <button type="button" disabled={!!busy} onClick={() => start(t, true)} className="btn btn-primary w-full">
                          {busy === `${t.id}-true` ? "Opening…" : "Start 3-week free trial"}
                        </button>
                      )}
                      <button type="button" disabled={!!busy} onClick={() => start(t, false)} className={`btn w-full ${canTrial ? "btn-quiet" : "btn-primary"}`}>
                        {busy === `${t.id}-false`
                          ? "Opening…"
                          : trialing
                            ? `Switch to ${t.name} — trial continues`
                            : live
                              ? `Switch to ${t.name} at renewal`
                              : canTrial
                                ? "Skip the trial, subscribe now"
                                : `Subscribe to ${t.name}`}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {live && (
        <div className="border-t border-line pt-4">
          {!confirmCancel ? (
            <button type="button" onClick={() => setConfirmCancel(true)} className="text-sm font-semibold text-ink-3 underline hover:text-rose-deep">
              Cancel autopay
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-ink-2">
                {trialing ? "You won't be charged and your trial runs to its end." : "Your plan runs to the end of this period, then stops."}
              </span>
              <button type="button" disabled={busy === "cancel"} onClick={cancel} className="btn btn-sm btn-ink">
                {busy === "cancel" ? "Cancelling…" : "Yes, cancel"}
              </button>
              <button type="button" onClick={() => setConfirmCancel(false)} className="btn btn-sm btn-quiet">Keep my plan</button>
            </div>
          )}
        </div>
      )}
      <p className="text-xs text-ink-3">
        Autopay by UPI or card through Razorpay. Your bank may show a small refundable verification when you set it up, and notifies you before every charge.
      </p>
    </section>
  );
}

function capital(s?: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
