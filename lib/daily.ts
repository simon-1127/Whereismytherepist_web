/**
 * Daily.co room creation.
 *
 * If DAILY_API_KEY is not set, this returns a stub room so the rest of the
 * booking pipeline (confirmation, session detail page, "Join call" button)
 * can be built and tested end-to-end today. The stub is clearly marked
 * (isStub: true) so the UI can show a "video not live yet" placeholder
 * instead of trying to embed a real call.
 *
 * Once you have a Daily.co account, set in your environment (server-only):
 *   DAILY_API_KEY=your_key_here
 * and everything downstream starts working with no other code changes.
 */

export interface DailyRoom {
  name: string;
  url: string;
  isStub: boolean;
}

export async function createDailyRoom(params: {
  sessionId: string;
  scheduledStart: string; // ISO timestamp
  scheduledEnd: string; // ISO timestamp
}): Promise<DailyRoom> {
  const apiKey = process.env.DAILY_API_KEY;

  if (!apiKey) {
    // Stub mode — no real room, but a stable, deterministic "url" so the
    // rest of the app has something to store and display.
    return {
      name: `stub-session-${params.sessionId}`,
      url: `stub://daily/session-${params.sessionId}`,
      isStub: true,
    };
  }

  // Give a little buffer around the scheduled window so early joiners /
  // slightly-late finishers aren't kicked mid-conversation.
  const nbfEpoch = Math.floor(new Date(params.scheduledStart).getTime() / 1000) - 5 * 60;
  const expEpoch = Math.floor(new Date(params.scheduledEnd).getTime() / 1000) + 15 * 60;

  const res = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: `session-${params.sessionId}`,
      privacy: "private",
      properties: {
        nbf: nbfEpoch,
        exp: expEpoch,
        enable_chat: true,
        enable_screenshare: true,
        max_participants: 2,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || data?.info || "Failed to create Daily room");
  }

  return { name: data.name, url: data.url, isStub: false };
}

/**
 * Creates a short-lived Daily meeting token scoped to one user, so the
 * room can be private while still letting the right client/provider join.
 * Skipped entirely in stub mode.
 */
export async function createDailyMeetingToken(params: {
  roomName: string;
  userName: string;
  isOwner: boolean;
}): Promise<string | null> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.daily.co/v1/meeting-tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: params.roomName,
        user_name: params.userName,
        is_owner: params.isOwner,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || data?.info || "Failed to create Daily meeting token");
  }
  return data.token as string;
}
