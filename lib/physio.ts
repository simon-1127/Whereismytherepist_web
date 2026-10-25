/**
 * Home physiotherapy waitlist (/physiotherapy). Option values match the
 * CHECK constraints on public.physio_waitlist (backend migration 007).
 */
export const FOR_WHOM = [
  { value: "self", label: "Myself" },
  { value: "parent_elderly", label: "Parent / elderly family member" },
  { value: "other_family", label: "Other family member" },
  { value: "someone_else", label: "I'm exploring for someone else" },
] as const;

export const TIMING = [
  { value: "asap", label: "As soon as it's available" },
  { value: "within_month", label: "Within the next month" },
  { value: "one_to_three_months", label: "Within 1–3 months" },
  { value: "researching", label: "Just researching for now" },
] as const;

export const SUPPORT = [
  { value: "mobility", label: "Mobility, balance or strength" },
  { value: "post_injury_surgery", label: "Recovery after injury or surgery" },
  { value: "elderly_support", label: "Support for an elderly person" },
  { value: "general", label: "General physiotherapy enquiry" },
  { value: "not_sure", label: "Not sure yet" },
] as const;

export const PRICE_FIT = [
  { value: "yes", label: "Yes, I'd consider it" },
  { value: "maybe", label: "Maybe, depending on details" },
  { value: "no", label: "No, that's above my budget" },
  { value: "more_info", label: "I'd like to know more first" },
] as const;

export type PhysioEntry = {
  name: string;
  contact: string;
  city: string;
  state: string;
  for_whom: string;
  timing: string;
  support: string;
  price_fit: string;
  note: string | null;
};

const oneOf = (opts: readonly { value: string }[], v: string) => opts.some((o) => o.value === v);

/** Normalises the input and returns it, or the first problem found. */
export function checkPhysioInput(raw: Record<string, unknown>): { input?: PhysioEntry; error?: string } {
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");
  const input: PhysioEntry = {
    name: str(raw.name, 120),
    contact: str(raw.contact, 160),
    city: str(raw.city, 80),
    state: str(raw.state, 80),
    for_whom: str(raw.for_whom, 40),
    timing: str(raw.timing, 40),
    support: str(raw.support, 40),
    price_fit: str(raw.price_fit, 40),
    note: typeof raw.note === "string" && raw.note.trim() ? raw.note.trim().slice(0, 1000) : null,
  };
  if (!input.name) return { error: "Please tell us your name." };
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contact);
  const isPhone = /^\+?[\d\s-]{8,16}$/.test(input.contact);
  if (!isEmail && !isPhone) return { error: "Enter an email address or a phone number we can reach you on." };
  if (!input.city || !input.state) return { error: "Please tell us your city and state." };
  if (!oneOf(FOR_WHOM, input.for_whom)) return { error: "Choose who needs the service." };
  if (!oneOf(TIMING, input.timing)) return { error: "Choose when you'd use it." };
  if (!oneOf(SUPPORT, input.support)) return { error: "Choose the kind of support you're interested in." };
  if (!oneOf(PRICE_FIT, input.price_fit)) return { error: "Tell us whether the starting price works for you." };
  if (raw.contact_consent !== true) return { error: "Please agree that we may contact you about the waitlist." };
  return { input };
}
