/**
 * Client <-> therapist messaging (backend migration 010). Mirrors the DB
 * contract: one conversation per (client, provider) pair; history always
 * readable; sending only while fn_can_message() says so (an active paid
 * booking). Reads go through fn_my_conversations(); sends are a plain
 * INSERT into messages with only {conversation_id, sender_id, body}.
 */
import { fmtDayShort, fmtTime, istDayKey } from "./format";

export const MESSAGE_MAX = 2000;

export type Perspective = "client" | "provider";

export type ConversationRow = {
  conversation_id: string;
  client_id: string;
  provider_id: string;
  other_user_id: string;
  other_name: string | null;
  other_photo_url: string | null;
  created_at: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_sender_id: string | null;
  unread_count: number;
  can_message: boolean;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export const MESSAGE_SELECT = "id, conversation_id, sender_id, body, created_at, read_at";

export function messagesBase(p: Perspective) {
  return p === "provider" ? "/provider/messages" : "/messages";
}

export function otherName(row: Pick<ConversationRow, "other_name">, p: Perspective) {
  return row.other_name?.trim() || (p === "client" ? "Your therapist" : "Client");
}

/** "4:05 PM" today, otherwise "Fri, 2 Oct". IST, deterministic (see format.ts). */
export function fmtListTime(iso: string | null | undefined, now = Date.now()) {
  if (!iso) return "";
  return istDayKey(iso) === istDayKey(now) ? fmtTime(iso) : fmtDayShort(iso);
}

/** Turns a PostgREST / trigger error into something to show the person. */
export function sendErrorMessage(err: { message?: string; code?: string } | null | undefined) {
  const msg = err?.message || "";
  if (/too quickly/i.test(msg)) return "You are sending messages too quickly. Please wait a moment.";
  if (/row-level security|violates row-level|permission denied/i.test(msg) || err?.code === "42501")
    return "Messaging is closed for this conversation right now.";
  if (/messages_body_length|check constraint/i.test(msg)) return `Messages can be 1 to ${MESSAGE_MAX} characters.`;
  if (/JWT/i.test(msg)) return "Your session has expired. Please sign in again.";
  return "Couldn't send your message. Please try again.";
}

/** True when the error means sending is no longer allowed (re-check eligibility). */
export function isClosedError(err: { message?: string; code?: string } | null | undefined) {
  return !!err && (err.code === "42501" || /row-level security/i.test(err.message || ""));
}

/** Fired after a thread is marked read so the Navbar badge can refresh. */
export const MESSAGES_READ_EVENT = "wmt:messages-read";
