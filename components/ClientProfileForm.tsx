"use client";

import { useState } from "react";
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
}: {
  userId: string;
  existingProfile: ExistingProfile;
  allowedLanguageCodes: string[] | null; // null = no restriction (all allowed)
}) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(existingProfile?.full_name || "");
  const [dob, setDob] = useState(existingProfile?.date_of_birth || "");
  const [uiLanguage, setUiLanguage] = useState(existingProfile?.ui_language || "en");
  const [preferredLanguage, setPreferredLanguage] = useState(existingProfile?.preferred_language || "");
  const [timezone, setTimezone] = useState(existingProfile?.timezone || "Asia/Kolkata");
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

    setIsSaving(true);

    try {
      const { error } = await supabase.from("client_profiles").upsert({
        user_id: userId,
        full_name: fullName.trim(),
        date_of_birth: dob,
        ui_language: uiLanguage,
        preferred_language: preferredLanguage || null,
        timezone,
        guardian_consent_completed_at:
          isMinor && guardianConsent ? new Date().toISOString() : existingProfile?.guardian_consent_completed_at || null,
      });

      if (error) throw new Error(error.message);

      router.push("/therapists");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while saving your profile.");
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100">{errorMsg}</div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Full Name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Date of Birth</label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
          max={new Date().toISOString().split("T")[0]}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isMinor && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <label className="flex items-start gap-3 text-sm text-amber-800 cursor-pointer">
            <input
              type="checkbox"
              checked={guardianConsent}
              onChange={(e) => setGuardianConsent(e.target.checked)}
              className="mt-1 w-4 h-4"
            />
            <span>
              I am a parent or legal guardian, or I have a parent/guardian's permission to create this
              account.
            </span>
          </label>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">App Language</label>
          <select
            value={uiLanguage}
            onChange={(e) => setUiLanguage(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LANGUAGE_CODES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native} · {l.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Session Language</label>
          <select
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No preference</option>
            {preferredLanguageOptions.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native} · {l.label}
              </option>
            ))}
          </select>
          {allowedLanguageCodes && (
            <p className="text-[11px] text-slate-400 mt-1">
              More languages available on the Growth plan.
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Timezone</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {IANA_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-gradient-to-r from-blue-700 to-pink-500 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isSaving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
