/**
 * Daily.co join window, matching the backend (NestJS DailyService): 10 min
 * before start until 15 min after end.
 *
 * Rooms and meeting tokens are issued ONLY by the backend
 * (POST /sessions/:id/room, see app/sessions/[id]/room). The website used to
 * mint its own tokens without the user's id, so web joiners couldn't be
 * attributed and a present person was recorded as absent.
 */

export const JOIN_OPENS_MIN = 10;
export const JOIN_CLOSES_MIN = 15;

export function joinWindow(scheduledStart: string, scheduledEnd: string) {
  const opensAt = new Date(scheduledStart).getTime() - JOIN_OPENS_MIN * 60_000;
  const closesAt = new Date(scheduledEnd).getTime() + JOIN_CLOSES_MIN * 60_000;
  return { opensAt, closesAt };
}

export function canJoinSession(s: { status: string; scheduled_start: string; scheduled_end: string }, now = Date.now()) {
  if (!["confirmed", "in_progress"].includes(s.status)) return false;
  const { opensAt, closesAt } = joinWindow(s.scheduled_start, s.scheduled_end);
  return now >= opensAt && now <= closesAt;
}
