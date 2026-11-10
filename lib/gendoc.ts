import { istDayKey, istParts } from "./format";

/**
 * General Doctor ("GenDoc"): a doctor an employer provides to its staff.
 * Mirrors the Flutter app (lib/data/repositories/gendoc_repository.dart).
 *
 * Rules that shape every caller:
 * - Queue changes ONLY through the fn_* RPCs (join/leave/set status/
 *   recompute). They renumber positions and recompute everyone's ETA in one
 *   transaction; a direct UPDATE would "work" for the doctor and leave stale
 *   times for everyone else.
 * - Plain reads go straight to the tables: RLS scopes gendoc_profiles to
 *   "mine, or approved doctors assigned to an org I'm an active employee
 *   of", and queue rows to the client or the doctor on them.
 * - A doctor can't read employee names (no policy), so queue rows show the
 *   person's place in line and the reason they gave.
 */

export const HR_TIER = "HR-Onboarding";

/** schedules + languages are readable by the doctor and by employees of a served org. */
export const GENDOC_PROFILE_SELECT = "*, gendoc_schedules(*), gendoc_languages(languages(id, name))";

export type GenDocStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "suspended";
export type QueueStatus = "waiting" | "in_progress" | "completed" | "no_show" | "cancelled";

export type GenDocSchedule = {
  day_start: string;
  day_end: string;
  lunch_start: string | null;
  lunch_end: string | null;
  /** ISO weekday numbers, 1 = Monday … 7 = Sunday — what the app writes. */
  working_days: number[];
};

export type GenDocProfile = {
  user_id: string;
  full_name: string;
  professional_title: string | null;
  registration_no: string | null;
  registration_council: string | null;
  years_experience: number | null;
  qualifications: string[] | null;
  clinic_affiliation: string | null;
  bio: string | null;
  photo_url: string | null;
  video_intro_url: string | null;
  consultation_minutes: number | null;
  timezone: string | null;
  application_status: GenDocStatus;
  rejection_reason: string | null;
  profile_completed_by_gendoc: boolean | null;
  is_accepting_queue: boolean | null;
  schedule: GenDocSchedule | null;
  languages: { id: string; name: string }[];
};

export type QueueEntry = {
  id: string;
  gendoc_id: string;
  client_id: string;
  queue_date: string;
  position: number;
  status: QueueStatus;
  reason: string | null;
  estimated_start: string | null;
  actual_start: string | null;
  actual_end: string | null;
  requested_at: string;
  gendoc_profiles?: { full_name: string | null; photo_url: string | null } | null;
};

export const QUEUE_SELECT =
  "id, gendoc_id, client_id, queue_date, position, status, reason, estimated_start, actual_start, actual_end, requested_at";

export const DEFAULT_SCHEDULE: GenDocSchedule = {
  day_start: "09:00:00",
  day_end: "17:00:00",
  lunch_start: null,
  lunch_end: null,
  working_days: [1, 2, 3, 4, 5],
};

/** A PostgREST row (with embeds) → GenDocProfile. The 1:1 schedule embed can arrive as an object or a list. */
export function toGenDocProfile(row: any): GenDocProfile {
  const rawSchedule = Array.isArray(row?.gendoc_schedules) ? row.gendoc_schedules[0] : row?.gendoc_schedules;
  const languages = ((row?.gendoc_languages as any[]) || [])
    .map((r) => r?.languages)
    .filter(Boolean)
    .map((l: any) => ({ id: String(l.id), name: String(l.name) }));
  const { gendoc_schedules: _s, gendoc_languages: _l, ...rest } = row || {};
  return {
    ...rest,
    schedule: rawSchedule
      ? {
          day_start: rawSchedule.day_start || DEFAULT_SCHEDULE.day_start,
          day_end: rawSchedule.day_end || DEFAULT_SCHEDULE.day_end,
          lunch_start: rawSchedule.lunch_start || null,
          lunch_end: rawSchedule.lunch_end || null,
          working_days: (rawSchedule.working_days || DEFAULT_SCHEDULE.working_days).map(Number),
        }
      : null,
    languages,
  } as GenDocProfile;
}

/** Today's queue_date, in IST (the server runs in UTC). */
export function istToday() {
  return istDayKey(new Date());
}

/** 1 = Monday … 7 = Sunday, in IST. */
export function isoWeekdayIST(now: Date = new Date()) {
  const wd = istParts(now).weekday; // 0 = Sunday
  return wd === 0 ? 7 : wd;
}

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function worksOn(s: GenDocSchedule, now: Date = new Date()) {
  return s.working_days.includes(isoWeekdayIST(now));
}

/** "09:00:00" → minutes since midnight. */
export function pgMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** "13:30:00" → "1:30 PM" */
export function fmtPgTime(t: string | null | undefined) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m || 0).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function workingDaysLabel(days: number[]) {
  if (!days.length) return "No working days set";
  return [...days].sort((a, b) => a - b).map((d) => DAY_LABELS[Math.min(Math.max(d - 1, 0), 6)]).join(", ");
}

export function hoursLabel(s: GenDocSchedule) {
  const base = `${fmtPgTime(s.day_start)} – ${fmtPgTime(s.day_end)}`;
  return s.lunch_start && s.lunch_end ? `${base}, lunch ${fmtPgTime(s.lunch_start)} – ${fmtPgTime(s.lunch_end)}` : base;
}

function nextWorkingDayLabel(s: GenDocSchedule, now: Date) {
  if (!s.working_days.length) return null;
  const today = isoWeekdayIST(now);
  for (let i = 1; i <= 7; i++) {
    const d = ((today - 1 + i) % 7) + 1;
    if (s.working_days.includes(d)) return i === 1 ? "tomorrow" : `on ${DAY_LABELS[d - 1]}`;
  }
  return null;
}

export type Availability = {
  kind: "open" | "lunch" | "later" | "done" | "not_today" | "paused";
  label: string;
  detail: string;
  /** Can the queue be joined today (approved, switched on, a working day)? */
  joinable: boolean;
};

/** Same states as the app's GenDocAvailability, computed in IST. */
export function availability(doc: GenDocProfile, now: Date = new Date()): Availability {
  const s = doc.schedule || DEFAULT_SCHEDULE;
  const next = nextWorkingDayLabel(s, now);
  const back = next ? `Back ${next}` : "";
  if (doc.application_status !== "approved" || doc.is_accepting_queue === false) {
    return { kind: "paused", label: "Queue paused", detail: "Not taking new requests", joinable: false };
  }
  if (!worksOn(s, now)) return { kind: "not_today", label: "Not consulting today", detail: back, joinable: false };
  const p = istParts(now);
  const m = p.hour * 60 + p.minute;
  if (m < pgMinutes(s.day_start)) {
    return { kind: "later", label: `Opens at ${fmtPgTime(s.day_start)}`, detail: `Until ${fmtPgTime(s.day_end)}`, joinable: true };
  }
  if (m >= pgMinutes(s.day_end)) return { kind: "done", label: "Done for today", detail: back, joinable: true };
  if (s.lunch_start && s.lunch_end && m >= pgMinutes(s.lunch_start) && m < pgMinutes(s.lunch_end)) {
    return { kind: "lunch", label: "On lunch break", detail: `Back at ${fmtPgTime(s.lunch_end)}`, joinable: true };
  }
  return { kind: "open", label: "Available now", detail: `Until ${fmtPgTime(s.day_end)}`, joinable: true };
}

export const AVAILABILITY_DOT: Record<Availability["kind"], string> = {
  open: "bg-teal",
  lunch: "bg-amber",
  later: "bg-brand-blue",
  done: "bg-brand-violet",
  not_today: "bg-amber",
  paused: "bg-ink-3",
};

export const QUEUE_STATUS_LABEL: Record<QueueStatus, string> = {
  waiting: "Waiting",
  in_progress: "In consult",
  completed: "Completed",
  no_show: "No-show",
  cancelled: "Cancelled",
};

/**
 * People in front. Clients can only read their own row, but the recompute
 * function renumbers waiting entries 1..n on every change, so position − 1
 * is exactly that count.
 */
export function peopleAhead(e: Pick<QueueEntry, "status" | "position">) {
  return e.status === "waiting" ? Math.max(0, (e.position || 1) - 1) : 0;
}

/** Supabase/PostgREST error → a line for people. RPCs raise friendly messages; show them. */
export function rpcMessage(err: { message?: string } | null | undefined, fallback = "Something went wrong. Please try again.") {
  const msg = err?.message?.trim();
  if (!msg) return fallback;
  if (/JWT|permission denied|violates row-level/i.test(msg)) return "You don't have access to do that. Try signing in again.";
  return msg;
}

/** Where a doctor lands after sign-in (also used to guard the portal pages). */
export function needsProfileSetup(p: Pick<GenDocProfile, "application_status" | "profile_completed_by_gendoc">) {
  return p.profile_completed_by_gendoc === false || p.application_status === "draft";
}
