"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CONSENT_COOKIE, CONSENT_MAX_AGE, gtagConsent, parseConsent, serializeConsent, type Consent } from "../lib/consent";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const OPEN_EVENT = "wmt:cookie-settings";

function readCookie(): Consent | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]+)`));
  return parseConsent(m?.[1]);
}

function save(c: Consent) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(serializeConsent(c))}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  window.gtag?.("consent", "update", gtagConsent(c));
  // If someone withdraws analytics/marketing, clear what Google already set.
  if (!c.analytics || !c.marketing) {
    const host = location.hostname.replace(/^www\./, "");
    document.cookie.split("; ").forEach((kv) => {
      const name = kv.split("=")[0];
      const isAnalytics = name === "_ga" || name.startsWith("_ga_") || name === "_gid";
      const isAds = name.startsWith("_gcl") || name === "_gac";
      if ((isAnalytics && !c.analytics) || (isAds && !c.marketing)) {
        for (const d of ["", `; Domain=.${host}`, `; Domain=${location.hostname}`]) {
          document.cookie = `${name}=; Max-Age=0; Path=/${d}`;
        }
      }
    });
  }
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const current = readCookie();
    if (!current) setOpen(true);
    else {
      setAnalytics(current.analytics);
      setMarketing(current.marketing);
    }
    const reopen = () => {
      const c = readCookie();
      if (c) {
        setAnalytics(c.analytics);
        setMarketing(c.marketing);
      }
      setCustom(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (c: Consent) => {
    save(c);
    setOpen(false);
    setCustom(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-[460px] animate-[rise_.4s_ease-out_both] sm:inset-x-auto sm:left-5 sm:bottom-5 sm:mx-0"
    >
      <div className="card overflow-hidden shadow-[var(--shadow-float)]">
        <div aria-hidden className="h-1 bg-[linear-gradient(90deg,#00b8bc,#0077c6_35%,#522cad_70%,#ff5266)]" />
        <div className="p-4 sm:p-5">
          <h2 id="cookie-title" className="text-base font-semibold sm:text-lg">Cookies on Where&rsquo;s My Therapist</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2 sm:text-sm">
            We use essential cookies to keep you signed in and take payments safely, and, with your permission, to measure how
            the site is used.<span className="hidden sm:inline"> We never use your health information for advertising.</span>{" "}
            <Link href="/cookies" className="link">Cookie policy</Link>
          </p>

          {custom && (
            <ul className="mt-4 space-y-2">
              <Toggle label="Essential" desc="Sign-in, security, payments and video calls. Always on." checked disabled />
              <Toggle label="Analytics" desc="Google Analytics: which pages help people, so we can improve them." checked={analytics} onChange={setAnalytics} />
              <Toggle label="Marketing" desc="Google Ads: measures whether our ads lead to sign-ups." checked={marketing} onChange={setMarketing} />
            </ul>
          )}

          <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
            {custom ? (
              <button onClick={() => choose({ analytics, marketing })} className="btn btn-primary btn-sm">
                Save choices
              </button>
            ) : (
              <button onClick={() => choose({ analytics: true, marketing: true })} className="btn btn-primary btn-sm">
                Accept all
              </button>
            )}
            <button onClick={() => choose({ analytics: false, marketing: false })} className="btn btn-quiet btn-sm">
              Essential only
            </button>
            {!custom && (
              <button onClick={() => setCustom(true)} className="px-2 text-sm font-semibold text-brand-violet hover:underline">
                Choose
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <li className="flex items-start justify-between gap-4 rounded-2xl bg-mist px-4 py-3">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[13px] text-ink-3">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${checked ? "bg-brand" : "bg-mist-2 ring-1 ring-line"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </button>
    </li>
  );
}

/** Footer link that reopens the banner (required so people can change their mind). */
export function CookieSettingsLink({ className = "hover:text-brand-violet" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className={className}>
      Cookie settings
    </button>
  );
}
