"use client";

import { useState } from "react";
import Link from "next/link";
import Tilt from "./Tilt";

export const TRIAL_DAYS = 21;

const TIERS = [
  {
    name: "Starter",
    tagline: "Everyday emotional support",
    monthly: 299,
    features: ["Unlimited AI companion", "Daily mood check-in and breathing", "Full community access, including posting", "24/7 crisis SOS"],
    cta: "Start 3 weeks free",
    note: "Free for 3 weeks, then billed monthly",
  },
  {
    name: "Growth",
    tagline: "AI support plus real therapy, monthly",
    monthly: 799,
    features: ["Everything in Starter", "MediTrack medication manager", "Priority booking in any of 10 languages"],
    cta: "Choose Growth",
    note: "Upgrade any time, even during your trial",
    popular: true,
  },
];

const YEARLY_DISCOUNT = 0.3;

function price(monthly: number, yearly: boolean) {
  const p = yearly ? Math.round((monthly * (1 - YEARLY_DISCOUNT)) / 10) * 10 : monthly;
  return `₹${p.toLocaleString("en-IN")}`;
}

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="shell">
      <div data-reveal className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold md:text-5xl">App plans priced for Indian incomes</h2>
          <p className="mt-4 text-lg text-white/75">
            Every account starts with 3 weeks of Starter, free. A typical 22–29 year old professional here earns
            ₹18,000–22,000 a month; Starter costs under 2% of that, paid with UPI or any Indian card.
          </p>
          <p className="mt-3 text-white/60">
            Booking a therapist doesn&rsquo;t need a plan. Sessions cost ₹500–₹1,200 each, set by the therapist and shown upfront.
          </p>
        </div>

        <div className="inline-flex justify-self-start rounded-full bg-white/10 p-1 ring-1 ring-white/15" role="radiogroup" aria-label="Billing period">
          {[
            { v: false, l: "Monthly" },
            { v: true, l: "Yearly, save 30%" },
          ].map((o) => (
            <button
              key={o.l}
              role="radio"
              aria-checked={yearly === o.v}
              onClick={() => setYearly(o.v)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${yearly === o.v ? "bg-white text-ink" : "text-white/75 hover:text-white"}`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <ul data-reveal-group className="mt-12 grid gap-6 md:grid-cols-3" style={{ perspective: "1200px" }}>
        <li>
          <div className="flex h-full flex-col rounded-[28px] bg-[linear-gradient(160deg,rgb(0_184_188/0.22),rgb(82_44_173/0.18))] p-7 text-white ring-1 ring-white/15">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#5fe3e6]">Free trial</p>
            <p className="mt-4 font-display text-6xl font-bold leading-none">3 weeks</p>
            <p className="mt-2 text-white/70">of Starter, on us</p>
            <ol className="mt-7 flex-1 space-y-4 text-[15px] text-white/80">
              {[
                ["Today", "Sign up and set up UPI AutoPay or a card. Nothing is charged."],
                ["Day 18", "We remind you by email and in the app that your trial ends soon."],
                ["Day 22", "Starter begins at ₹299/month. Your bank notifies you a day before."],
              ].map(([d, t]) => (
                <li key={d} className="flex gap-3">
                  <span className="w-14 shrink-0 font-semibold text-white">{d}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80">
              Cancel any time before day 22 and you pay nothing.
            </p>
          </div>
        </li>
        {TIERS.map((t) => (
          <li key={t.name}>
            <Tilt className="h-full rounded-[28px]" max={t.popular ? 7 : 10} glare={t.popular ? 0.25 : 0.4}>
              <div
                className={`flex h-full flex-col rounded-[28px] p-7 ${
                  t.popular
                    ? "bg-white text-ink shadow-[0_30px_80px_-24px_rgb(255_82_102/0.55)] ring-2 ring-[#ff5266]/60"
                    : "bg-white/[0.07] text-white ring-1 ring-white/15 backdrop-blur-md"
                }`}
                style={{ transform: "translateZ(30px)" }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold">{t.name}</h3>
                  {t.popular && <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">Most chosen</span>}
                </div>
                <p className={`mt-1 text-sm ${t.popular ? "text-ink-3" : "text-white/60"}`}>{t.tagline}</p>
                <p className="mt-7">
                  <span className={`font-display text-6xl font-bold ${t.popular ? "text-brand" : ""}`}>{price(t.monthly, yearly)}</span>
                  <span className={`ml-1 text-sm ${t.popular ? "text-ink-3" : "text-white/60"}`}>
                    {yearly ? "/mo, billed yearly" : "/month"}
                  </span>
                </p>
                <ul className="mt-7 flex-1 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className={`flex gap-2.5 text-[15px] ${t.popular ? "text-ink-2" : "text-white/80"}`}>
                      <svg className={`mt-1 h-4 w-4 shrink-0 ${t.popular ? "text-brand-violet" : "text-[#5fe3e6]"}`} fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className={`mt-6 text-sm ${t.popular ? "text-ink-3" : "text-white/60"}`}>{t.note}</p>
                <Link
                  href="/login?mode=signup"
                  className={`btn mt-3 w-full ${t.popular ? "btn-primary" : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"}`}
                >
                  {t.cta}
                </Link>
              </div>
            </Tilt>
          </li>
        ))}
      </ul>
    </div>
  );
}
