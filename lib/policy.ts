/**
 * Session and payment policy, in one place so every page says the same thing.
 * Change a number here and the policy page, terms, FAQ and therapist pages follow.
 */
export const SESSION = {
  slotMinutes: 60, // what a booking occupies on the calendar
  talkMinutes: 50, // time with the therapist
  breakMinutes: 10, // buffer before the next session
};

export const POLICY = {
  providerSharePct: 78,
  platformSharePct: 22,
  attendanceCheckMinutes: 30, // after the start time
  rescheduleCutoffHours: 24,
  clientReschedules: 2, // per booking
  refundDays: "5–7",
};
