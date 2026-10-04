"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Shown while a booking is "awaiting payment". Asks the server to check
 * Razorpay directly every few seconds; the moment Razorpay reports the
 * payment, the server confirms the booking and this page refreshes.
 */
export default function PaymentWatcher({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "waiting">("checking");

  useEffect(() => {
    let stop = false;
    let tries = 0;
    async function tick() {
      tries++;
      try {
        const res = await fetch(`/api/bookings/${sessionId}/reconcile`, { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (data.status === "confirmed") {
          router.refresh();
          return;
        }
      } catch {}
      if (stop) return;
      if (tries >= 3) setState("waiting");
      if (tries < 20) setTimeout(tick, tries < 5 ? 3000 : 8000);
    }
    tick();
    return () => {
      stop = true;
    };
  }, [sessionId, router]);

  return (
    <div className="alert alert-warn flex items-start gap-3">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber live-dot" />
      <div>
        {state === "checking" ? (
          <p className="font-semibold">Checking your payment with Razorpay…</p>
        ) : (
          <>
            <p className="font-semibold">We haven&rsquo;t received this payment yet.</p>
            <p className="mt-1">
              If money left your account, don&rsquo;t pay again — this page updates by itself once Razorpay
              confirms it. If you closed the payment window before paying, the slot is released after 15 minutes
              and you can book again.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
