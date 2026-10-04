"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { LANGUAGE_CODES, IANA_TIMEZONES } from "../lib/constants";

type ExistingProfile = {
  full_name: string;
  date_of_birth: string;
  ui_language: string;
  preferred_language: string | null;
  timezone: string;
  guardian_consent_completed_at: string | null;
} | null;

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function ClientProfileForm({
  userId,
  existingProfile,
  allowedLanguageCodes,
  afterSave,
  defaultName,
  submitLabel,
  hideUiLanguage,
  onboarding,
  defaultPhone,
}: {
  userId: string;
  existingProfile: ExistingProfile;
  allowedLanguageCodes: string[] | null; // null = no restriction (all allowed)
  afterSave?: string; // where first-time setup goes next
  defaultName?: string; // e.g. the name Google or Apple gave us
  submitLabel?: string;
  hideUiLanguage?: boolean; // keep app language at its default ("en")
  onboarding?: boolean; // first-time setup: no language fields, optional phone instead
  defaultPhone?: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [saved, setSaved] = useState(false);

  const [fullName, setFullName] = useState(existingProfile?.full_name || defaultName || "");
  const [dob, setDob] = useState(existingProfile?.date_of_birth || "");
  const [uiLanguage, setUiLanguage] = useState(existingProfile?.ui_language || "en");
  const [preferredLanguage, setPreferredLanguage] = useState(existingProfile?.preferred_language || "");
  const [timezone, setTimezone] = useState(existingProfile?.timezone || "Asia/Kolkata");
  const [phone, setPhone] = useState(defaultPhone || "");
  const [guardianConsent, setGuardianConsent] = useState(!!existingProfile?.guardian_consent_completed_at);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const age = dob ? calculateAge(dob) : null;
  const isMinor = age !== null && age < 18;

  const preferredLanguageOptions = allowedLanguageCodes
    ? LANGUAGE_CODES.filter((l) => allowedLanguageCodes.includes(l.code))
    : LANGUAGE_CODES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !dob) {
      setErrorMsg("Please fill in your name and date of birth.");
      return;
    }
    if (isMinor && !guardianConsent) {
      setErrorMsg("A parent or guardian needs to confirm consent to continue.");
      return;
    }

    // Phone is optional. Accept a 10-digit Indian mobile, or +country code.
    let e164: string | null = null;
    if (onboarding && phone.trim()) {
      const raw = phone.replace(/[\s()-]/g, "");
      if (/^\+\d{8,15}$/.test(raw)) e164 = raw;
      else if (/^(?:\+?91|0)?[6-9]\d{9}$/.test(raw)) e164 = `+91${raw.slice(-10)}`;
      else {
        setErrorMsg("That phone number doesn't look right. Use a 10-digit mobile number, or leave it empty.");
        return;
      }
    }

    setIsSaving(true);

    try {
      if (e164) {
        const res = await fetch("/api/profile/phone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: e164 }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Couldn't save your phone number.");
      }

      const { error } = await supabase.from("client_profiles").upsert({
        user_id: userId,
        full_name: fullName.trim(),
        date_of_birth: dob,
        ui_language: onboarding ? existingProfile?.ui_language || "en" : uiLanguage,
        preferred_language: onboarding ? existingProfile?.preferred_language || null : preferredLanguage || null,
        timezone,
        guardian_consent_completed_at:
          isMinor && guardianConsent ? new Date().toISOString() : existingProfile?.guardian_consent_completed_at || null,
      });

      if (error) throw new Error(error.message);

      setSaved(true);
      setIsSaving(false);
      router.refresh();
      // First-time setup goes on to the directory; edits stay put.
      if (!existingProfile || afterSave) router.push(afterSave || "/therapists");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while saving your profile.");
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {errorMsg && <p role="alert" className="alert alert-error">{errorMsg}</p>}
      {saved && !errorMsg && <p role="status" className="alert alert-ok">Saved.</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className="field-label">Full name</label>
          <input id="full_name" value={fullName} onChange={(e) => { setFullName(e.target.value); setSaved(false); }} required autoComplete="name" className="field" />
        </div>
        <div>
          <label htmlFor="dob" className="field-label">Date of birth</label>
          <input id="dob" type="date" value={dob} onChange={(e) => { setDob(e.target.value); setSaved(false); }} required
            max={new Date().toISOString().split("T")[0]} className="field" />
        </div>
      </div>

      {isMinor && (
        <label className="alert alert-warn flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={guardianConsent} onChange={(e) => setGuardianConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-[#1b1a47]" />
          <span>I&rsquo;m a parent or legal guardian, or I have a parent or guardian&rsquo;s permission to create this account.</span>
        </label>
      )}

      {onboarding ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="field-label">
              Phone number <span className="font-normal text-ink-3">(optional)</span>
            </label>
            <div className="flex items-stretch overflow-hidden rounded-[var(--radius-field,14px)]">
              <span className="field !w-auto shrink-0 !rounded-r-none !border-r-0 bg-mist px-3 text-ink-2" aria-hidden>+91</span>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setSaved(false); }}
                placeholder="98765 43210"
                maxLength={16}
                className="field min-w-0 !rounded-l-none"
              />
            </div>
            <p className="field-hint">
              We may send a one-time code (OTP) to verify it. It&rsquo;s also a backup way to get back into your account. We
              never share it or use it for ads.
            </p>
          </div>
          <div>
            <label htmlFor="tz" className="field-label">Timezone</label>
            <select id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="field">
              {IANA_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {!hideUiLanguage && (
            <div>
              <label htmlFor="ui_lang" className="field-label">App language</label>
              <select id="ui_lang" value={uiLanguage} onChange={(e) => setUiLanguage(e.target.value)} className="field">
                {LANGUAGE_CODES.map((l) => (
                  <option key={l.code} value={l.code}>{l.native} ({l.label})</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="session_lang" className="field-label">Language for sessions</label>
            <select id="session_lang" value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} className="field">
              <option value="">No preference</option>
              {preferredLanguageOptions.map((l) => (
                <option key={l.code} value={l.code}>{l.native} ({l.label})</option>
              ))}
            </select>
            {allowedLanguageCodes && <p className="field-hint">All 10 languages are included in the Growth plan.</p>}
          </div>
          <div>
            <label htmlFor="tz" className="field-label">Timezone</label>
            <select id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="field">
              {IANA_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button type="submit" disabled={isSaving} className="btn btn-primary">
        {isSaving ? "Saving…" : submitLabel || (existingProfile ? "Save changes" : "Save and find a therapist")}
      </button>
    </form>
  );
}
