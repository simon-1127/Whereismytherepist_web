import { joinWindow } from "./daily";

export type SessionLike = {
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  /** 'required' = missed through no fault of the client; they can rebook free. */
  reschedule_state?: string | null;
};

/** Statuses where the backend offers the client a free reschedule. */
export const FREE_RESCHEDULE_STATUSES = ["no_show_provider", "no_show_both", "cancelled_by_provider", "interrupted"];

export const needsReschedule = (s: SessionLike) => s.reschedule_state === "required" && FREE_RESCHEDULE_STATUSES.includes(s.status);

export type Bucket = "upcoming" | "history" | "cancelled";

export type Display = {
  label: string;
  tone: "teal" | "rose" | "amber" | "ink" | "muted";
  bucket: Bucket;
};

/**
 * What a session should LOOK like, which isn't always its raw status.
 * Nothing marks sessions 'completed' yet, so a session whose window has
 * closed but is still 'confirmed'/'in_progress' (the app sets in_progress
 * when the room opens) is shown as finished rather than "in progress"
 * forever. An unpaid hold that has passed is shown as not booked.
 */
export function displayStatus(s: SessionLike, now = Date.now()): Display {
  const { opensAt, closesAt } = joinWindow(s.scheduled_start, s.scheduled_end);
  const over = now > closesAt;

  // Kept under "upcoming" so it can't be missed: there's a booking to make.
  if (needsReschedule(s)) return { label: "Reschedule for free", tone: "amber", bucket: "upcoming" };

  switch (s.status) {
    case "pending_payment":
      return over
        ? { label: "Not booked", tone: "muted", bucket: "cancelled" }
        : { label: "Awaiting payment", tone: "amber", bucket: "upcoming" };
    case "confirmed":
    case "in_progress":
      if (over) return { label: "Completed", tone: "ink", bucket: "history" };
      if (now >= opensAt) return { label: "Live now", tone: "rose", bucket: "upcoming" };
      return { label: "Confirmed", tone: "teal", bucket: "upcoming" };
    case "completed":
      return { label: "Completed", tone: "ink", bucket: "history" };
    case "no_show_client":
      return { label: "Missed", tone: "muted", bucket: "history" };
    case "no_show_provider":
      return { label: "Therapist didn't join", tone: "amber", bucket: "history" };
    case "no_show_both":
      return { label: "Missed", tone: "muted", bucket: "history" };
    case "interrupted":
      return { label: "Interrupted", tone: "amber", bucket: "history" };
    case "rescheduled":
      return { label: "Rescheduled", tone: "muted", bucket: "cancelled" };
    case "cancelled_by_client":
      return { label: "Cancelled", tone: "muted", bucket: "cancelled" };
    case "cancelled_by_provider":
      return { label: "Cancelled by therapist", tone: "muted", bucket: "cancelled" };
    case "refunded":
      return { label: "Refunded", tone: "muted", bucket: "cancelled" };
    case "partially_refunded":
      return { label: "Partly refunded", tone: "muted", bucket: "cancelled" };
    case "disputed":
      return { label: "Under review", tone: "amber", bucket: "history" };
    default:
      return { label: s.status.replace(/_/g, " "), tone: "muted", bucket: "history" };
  }
}
