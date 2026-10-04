"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { dateParts, fmtTime, istDayKey } from "../lib/format";

type Slot = { id: string; start_time: string; end_time: string };

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// Group by the IST calendar day, so a 12:30 AM slot isn't filed under the
// previous day for someone whose laptop clock is set to another zone.
function groupByDay(slots: Slot[]) {
  const groups = new Map<string, Slot[]>();
  for (const slot of slots) {
    const key = istDayKey(slot.start_time);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(slot);
  }
  return Array.from(groups.entries()).map(([key, list]) => {
    const p = dateParts(list[0].start_time);
    return {
      key,
      weekday: p.weekday,
      day: p.day,
      month: p.month,
      slots: list.sort((a, b) => a.start_time.localeCompare(b.start_time)),
    };
  });
}

export default function BookingWidget({
  providerId,
  providerName,
  rateLabel,
}: {
  providerId: string;
  providerName: string;
  rateLabel: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "starting" | "paying" | "confirming">(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("availability_slots")
        .select("id, start_time, end_time")
        .eq("provider_id", providerId)
        .eq("status", "open")
        .gte("start_time", new Date(Date.now() + 15 * 60_000).toISOString())
        .order("start_time", { ascending: true })
        .limit(120);
      if (cancelled) return;
      const list = (data as Slot[]) || [];
      setSlots(list);
      if (list.length) setDayKey(istDayKey(list[0].start_time));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [providerId, supabase]);

  const days = useMemo(() => groupByDay(slots), [slots]);
  const activeDay = days.find((d) => d.key === dayKey);
  const selected = slots.find((s) => s.id === slotId);

  async function handleBook() {
    if (!slotId) return;
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setBusy("starting");
    try {
      const res = await fetch("/api/bookings/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId }),
      });
      const order = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) setSlots((prev) => prev.filter((s) => s.id !== slotId));
        throw new Error(order.error || "Could not start the booking.");
      }

      if (!(await loadRazorpay())) throw new Error("The payment window couldn't load. Check your connection and try again.");

      setBusy("paying");
      const rzp = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Where's My Therapist",
        description: `Session with ${providerName}`,
        prefill: { email: user.email || undefined },
        theme: { color: "#1b1a47" },
        handler: async (response: any) => {
          setBusy("confirming");
          // Best effort: the session page re-checks Razorpay itself, so a
          // failure here can no longer leave a paid booking stuck.
          await fetch("/api/bookings/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: order.sessionId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          }).catch(() => undefined);
          router.push(`/sessions/${order.sessionId}`);
        },
        modal: { ondismiss: () => setBusy(null) },
      });
      rzp.on("payment.failed", (r: any) => {
        setError(r?.error?.description || "The payment didn't go through. You haven't been charged — try again.");
        setBusy(null);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setBusy(null);
    }
  }

  const buttonLabel =
    busy === "starting" ? "Reserving your slot…" : busy === "paying" ? "Complete payment in the window" : busy === "confirming" ? "Confirming…" : selected ? `Pay ${rateLabel} and book` : "Choose a time";

  return (
    <div className="overflow-hidden card">
      <div className="flex items-baseline justify-between bg-brand px-5 py-4 text-white">
        <h2 className="font-display text-xl font-semibold">Book a session</h2>
        <p>
          <span className="font-display text-xl font-semibold">{rateLabel}</span>
          <span className="text-sm text-white/60"> / session</span>
        </p>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="space-y-3" aria-busy="true">
            <div className="h-[72px] animate-pulse rounded-[var(--radius-inner)] bg-mist" />
            <div className="h-28 animate-pulse rounded-[var(--radius-inner)] bg-mist" />
          </div>
        ) : days.length === 0 ? (
          <p className="well px-4 py-6 text-center text-ink-2">
            No open times right now. {providerName.split(" ")[0]} usually adds new slots each week.
          </p>
        ) : (
          <>
            <p className="mb-2 text-sm font-semibold">Day</p>
            <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1" role="listbox" aria-label="Choose a day">
              {days.map((d) => {
                const on = d.key === dayKey;
                return (
                  <button
                    key={d.key}
                    role="option"
                    aria-selected={on}
                    onClick={() => {
                      setDayKey(d.key);
                      setSlotId(null);
                    }}
                    className={`flex w-[64px] shrink-0 flex-col items-center rounded-[var(--radius-inner)] py-2 transition-colors ${
                      on ? "bg-brand text-white" : "bg-mist text-ink hover:bg-mist-2"
                    }`}
                  >
                    <span className={`text-xs font-semibold ${on ? "text-white/70" : "text-ink-3"}`}>{d.weekday}</span>
                    <span className="font-display text-2xl font-bold leading-tight">{d.day}</span>
                    <span className={`text-xs ${on ? "text-white/70" : "text-ink-3"}`}>{d.month}</span>
                  </button>
                );
              })}
            </div>

            <p className="mb-2 text-sm font-semibold">Time (IST)</p>
            <div className="grid grid-cols-3 gap-2" role="listbox" aria-label="Choose a time">
              {activeDay?.slots.map((s) => {
                const on = s.id === slotId;
                return (
                  <button
                    key={s.id}
                    role="option"
                    aria-selected={on}
                    onClick={() => setSlotId(s.id)}
                    className={`rounded-full py-2 text-sm font-semibold transition-colors ${
                      on ? "bg-brand text-white border border-transparent" : "bg-paper text-ink border border-line hover:border-brand-violet/40"
                    }`}
                  >
                    {fmtTime(s.start_time)}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {error && <p className="alert alert-error mt-5">{error}</p>}

        <button onClick={handleBook} disabled={!slotId || !!busy} className="btn btn-primary mt-5 w-full">
          {buttonLabel}
        </button>
        <p className="mt-3 text-center text-[13px] text-ink-3">
          UPI, cards and netbanking via Razorpay. Your slot is held for 15 minutes while you pay.
        </p>
      </div>
    </div>
  );
}
