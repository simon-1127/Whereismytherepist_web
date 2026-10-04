import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Daily.co rooms — kept in lockstep with the mobile backend
 * (NestJS DailyService) because a web client and an app provider join the
 * SAME session row:
 *
 *  - Rooms are created lazily, at join time, not at payment. Sessions
 *    confirmed by the app's backend never had a web-created room.
 *  - daily_room_exp is always stored. The mobile backend only reuses a room
 *    when daily_room_url AND daily_room_exp are set and unexpired; the old
 *    web code never set exp, so the app created a second room and the two
 *    people ended up in different calls.
 *  - Join window matches the app: 10 min before start until 15 min after
 *    end. The old web rooms had nbf = start − 5 min, so joining 6–10 min
 *    early (which the UI allowed) was rejected by Daily.
 *  - Creating the room flips confirmed → in_progress, like the app does.
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

function apiKey(): string {
  const key = process.env.DAILY_API_KEY;
  if (!key) throw new Error("DAILY_API_KEY is not set on the server.");
  return key;
}

async function daily<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`https://api.daily.co/v1${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey()}` },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.info || data?.error || `Daily request failed (${res.status})`);
  return data as T;
}

type SessionRow = {
  id: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  daily_room_name: string | null;
  daily_room_url: string | null;
  daily_room_exp: string | null;
};

/** Reuses a valid room or creates one. `admin` must be the service-role client. */
export async function getOrCreateSessionRoom(admin: SupabaseClient, session: SessionRow) {
  const now = Date.now();
  const valid =
    session.daily_room_url &&
    session.daily_room_name &&
    session.daily_room_exp &&
    new Date(session.daily_room_exp).getTime() > now;
  if (valid) return { name: session.daily_room_name!, url: session.daily_room_url! };

  const { closesAt } = joinWindow(session.scheduled_start, session.scheduled_end);
  const exp = Math.floor(closesAt / 1000);
  // Unique name: Daily rejects re-using a name, and an expired room may
  // still exist under the old one.
  const name = `wmt-${session.id.slice(0, 8)}-${now.toString(36)}`;

  const room = await daily<{ name: string; url: string }>("/rooms", {
    name,
    privacy: "private",
    properties: {
      exp,
      max_participants: 2,
      enable_chat: true,
      enable_screenshare: true,
      eject_at_room_exp: true,
      enable_recording: false,
    },
  });

  // Only claim the row if nobody (web or app) stored a valid room in the
  // meantime — otherwise the two participants would split across rooms.
  const nowIso = new Date(now).toISOString();
  const { data: claimed } = await admin
    .from("sessions")
    .update({
      daily_room_name: room.name,
      daily_room_url: room.url,
      daily_room_exp: new Date(exp * 1000).toISOString(),
      updated_at: nowIso,
    })
    .eq("id", session.id)
    .or(`daily_room_url.is.null,daily_room_exp.is.null,daily_room_exp.lte.${nowIso}`)
    .select("id");

  if (!claimed || claimed.length === 0) {
    const { data: fresh } = await admin
      .from("sessions")
      .select("daily_room_name, daily_room_url")
      .eq("id", session.id)
      .single();
    if (fresh?.daily_room_url && fresh?.daily_room_name) {
      return { name: fresh.daily_room_name, url: fresh.daily_room_url };
    }
  }

  // Same status transition as the app backend.
  await admin
    .from("sessions")
    .update({ status: "in_progress", actual_start: nowIso })
    .eq("id", session.id)
    .eq("status", "confirmed");

  return { name: room.name, url: room.url };
}

/** Rooms are private, so every join needs a fresh per-user token. */
export async function createDailyMeetingToken(params: {
  roomName: string;
  userName: string;
  isOwner: boolean;
  exp?: number;
}): Promise<string> {
  const data = await daily<{ token: string }>("/meeting-tokens", {
    properties: {
      room_name: params.roomName,
      user_name: params.userName,
      is_owner: params.isOwner,
      ...(params.exp ? { exp: params.exp } : {}),
    },
  });
  return data.token;
}
