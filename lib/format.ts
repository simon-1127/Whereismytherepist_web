/**
 * Every date on the site goes through here.
 *
 * 1. Timezone: server components run in the host's zone (UTC on cPanel), so
 *    `toLocaleString()` showed a 4:00 PM IST session as "10:30 AM". The
 *    platform is India-first, so everything renders in IST.
 * 2. Determinism: Node's ICU and browsers format the same date differently
 *    ("Friday, 2 October" vs "Friday 2 October", narrow vs normal spaces),
 *    which breaks hydration in client components. IST has a fixed +05:30
 *    offset and no daylight saving, so we compute the parts ourselves and
 *    build the strings by hand — identical output on server and browser.
 */
export const DEFAULT_TZ = "Asia/Kolkata";
const IST_OFFSET_MS = 330 * 60_000;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Parts = { year: number; month: number; day: number; weekday: number; hour: number; minute: number };

export function istParts(d: string | Date | number): Parts {
  const t = new Date(new Date(d).getTime() + IST_OFFSET_MS);
  return {
    year: t.getUTCFullYear(),
    month: t.getUTCMonth(),
    day: t.getUTCDate(),
    weekday: t.getUTCDay(),
    hour: t.getUTCHours(),
    minute: t.getUTCMinutes(),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "2026-10-02" — the IST calendar day, for grouping slots. */
export function istDayKey(d: string | Date | number) {
  const p = istParts(d);
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}`;
}

export function fmtTime(d: string | Date | number) {
  const { hour, minute } = istParts(d);
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${pad(minute)} ${hour < 12 ? "AM" : "PM"}`;
}

export function fmtTimeRange(start: string | Date, end: string | Date) {
  return `${fmtTime(start)} – ${fmtTime(end)}`;
}

/** "Friday, 2 October" */
export function fmtDayLong(d: string | Date | number) {
  const p = istParts(d);
  return `${DAYS[p.weekday]}, ${p.day} ${MONTHS[p.month]}`;
}

/** "Fri, 2 Oct" */
export function fmtDayShort(d: string | Date | number) {
  const p = istParts(d);
  return `${DAYS_SHORT[p.weekday]}, ${p.day} ${MONTHS_SHORT[p.month]}`;
}

/** Pieces for the big date block on session tickets. */
export function dateParts(d: string | Date | number) {
  const p = istParts(d);
  return { day: String(p.day), month: MONTHS_SHORT[p.month], weekday: DAYS_SHORT[p.weekday], year: String(p.year) };
}

export function minutesBetween(a: string | Date, b: string | Date) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
}

export function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] || "")).toUpperCase();
}
