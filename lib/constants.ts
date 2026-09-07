// Matches the language picker in your mobile app (screenshot: English, हिन्दी,
// தமிழ், বাংলা, मराठी, ગુજરાતી, ಕನ್ನಡ, മലയാളം, ਪੰਜਾਬੀ, తెలుగు).
// `code` values here are what's stored in client_profiles.ui_language /
// preferred_language, and what subscription_tiers.allowed_language_codes
// restricts against.
export const LANGUAGE_CODES: { code: string; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
];

export function languageLabel(code: string | null | undefined): string {
  if (!code) return "";
  return LANGUAGE_CODES.find((l) => l.code === code)?.label || code;
}

// Matches provider_profiles.age_groups_served CHECK constraint.
export const AGE_GROUPS: { value: string; label: string }[] = [
  { value: "children", label: "Children" },
  { value: "teens", label: "Teens" },
  { value: "adults", label: "Adults" },
  { value: "all_ages", label: "All Ages" },
];

export const IANA_TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Kathmandu",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Australia/Sydney",
];
