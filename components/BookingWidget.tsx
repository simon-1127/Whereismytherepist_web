"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

type Slot = {
  id: string;
  start_time: string;
  end_time: string;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function groupSlotsByDay(slots: Slot[]) {
  const groups = new Map<string, Slot[]>();
  for (const slot of slots) {
    const dayKey = new Date(slot.start_time).toDateString();
    if (!groups.has(dayKey)) groups.set(dayKey, []);
    groups.get(dayKey)!.push(slot);
  }
  return Array.from(groups.entries()).map(([dayKey, daySlots]) => ({
    dayKey,
    date: new Date(daySlots[0].start_time),
    slots: daySlots.sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }));
}

export default function BookingWidget({
  providerId,
  providerName,
  sessionRate,
  currency,
}: {
  providerId: string;
  providerName: string;
  sessionRate: number;
  currency: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchSlots() {
      setLoadingSlots(true);
      const { data, error } = await supabase
        .from("availability_slots")
        .select("id, start_time, end_time")
        .eq("provider_id", providerId)
        .eq("status", "open")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(60);

      if (!cancelled) {
        if (!error && data) {
          setSlots(data as Slot[]);
          if (data.length > 0) {
            setSelectedDayKey(new Date(data[0].start_time).toDateString());
          }
        }
        setLoadingSlots(false);
      }
    }

    fetchSlots();
    return () => {
      cancelled = true;
    };
  }, [providerId]);

  const dayGroups = useMemo(() => groupSlotsByDay(slots), [slots]);
  const activeDayGroup = dayGroups.find((g) => g.dayKey === selectedDayKey);

  const currencySymbol = currency === "INR" ? "₹" : "";

  async function handleBook() {
    if (!selectedSlotId) return;
    setErrorMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setIsBooking(true);

    try {
      const orderRes = await fetch("/api/bookings/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlotId }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Could not start booking");
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Could not load payment gateway. Check your connection and try again.");
      }

      const razorpay = new window.Razorpay({
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "Where's My Therapist",
        description: `Session with ${providerName}`,
        prefill: { email: user.email || undefined },
        theme: { color: "#1E1B4B" },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/bookings/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId: orderData.sessionId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: orderData.amount,
              }),
            });
            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment succeeded but confirmation failed. Contact support.");
            }

            router.push(`/sessions/${orderData.sessionId}`);
          } catch (err: any) {
            setErrorMsg(err.message);
            setIsBooking(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsBooking(false);
          },
        },
      });

      razorpay.on("payment.failed", function (response: any) {
        setErrorMsg(response.error?.description || "Payment failed. Please try again.");
        setIsBooking(false);
      });

      razorpay.open();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong");
      setIsBooking(false);
    }
  }

  return (
    <div className="w-full md:w-[320px] shrink-0 border border-slate-200 rounded-3xl p-6 bg-slate-50/50 flex flex-col h-fit">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-[#1E1B4B]">Book a Session</h3>
        <span className="text-sm font-bold text-pink-600">
          {currencySymbol}
          {sessionRate}
        </span>
      </div>

      {loadingSlots ? (
        <p className="text-sm text-slate-500 py-6 text-center">Loading availability…</p>
      ) : dayGroups.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center">
          No open slots right now. Please check back soon.
        </p>
      ) : (
        <>
          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
            {dayGroups.map((group) => {
              const isSelected = group.dayKey === selectedDayKey;
              return (
                <button
                  key={group.dayKey}
                  onClick={() => {
                    setSelectedDayKey(group.dayKey);
                    setSelectedSlotId(null);
                  }}
                  className={`shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border text-sm font-semibold transition-colors ${
                    isSelected
                      ? "border-[#1E1B4B] bg-white text-[#1E1B4B]"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <span className="text-[10px] uppercase text-slate-400">
                    {group.date.toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                  <span className="text-lg">{group.date.getDate()}</span>
                </button>
              );
            })}
          </div>

          {/* Time slots for the selected day */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {activeDayGroup?.slots.map((slot) => {
              const isSelected = slot.id === selectedSlotId;
              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`py-2 rounded-lg border text-xs font-semibold transition-colors ${
                    isSelected
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {new Date(slot.start_time).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </button>
              );
            })}
          </div>
        </>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-100 mb-4">
          {errorMsg}
        </div>
      )}

      <button
        onClick={handleBook}
        disabled={!selectedSlotId || isBooking}
        className="w-full bg-gradient-to-r from-blue-700 to-pink-500 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isBooking ? "Processing…" : "Book & Pay"}
      </button>
      <p className="text-[11px] text-slate-400 text-center mt-3">
        Secure payment via Razorpay. You'll get a confirmation once payment completes.
      </p>
    </div>
  );
}
