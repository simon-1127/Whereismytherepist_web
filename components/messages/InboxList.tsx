"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { fmtListTime, messagesBase, otherName, type ConversationRow, type Perspective } from "../../lib/messages";
import { Avatar, EmptyState } from "../ui";
import { useLiveRows } from "./useLiveRows";

/**
 * The inbox. Starts from the server-rendered rows and re-reads
 * fn_my_conversations whenever one of the caller's conversations changes
 * (every new message updates its conversation's summary columns).
 */
export default function InboxList({
  initialRows,
  userId,
  perspective,
}: {
  initialRows: ConversationRow[];
  userId: string;
  perspective: Perspective;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState(initialRows);
  const base = messagesBase(perspective);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase.rpc("fn_my_conversations", { p_conversation_id: null });
    if (!error && data) setRows(data as ConversationRow[]);
  }, [supabase]);

  const side = perspective === "client" ? "client_id" : "provider_id";
  useLiveRows(supabase, `inbox-${userId}`, "conversations", [`${side}=eq.${userId}`], refetch, refetch);

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No messages yet"
        body={
          perspective === "client"
            ? "Once you've booked a session, you can message your therapist from their profile or your session page."
            : "When a client with a booked session messages you, or you message them, the conversation shows up here."
        }
        action={perspective === "client" ? { href: "/sessions", label: "My sessions" } : { href: "/provider/bookings", label: "Your sessions" }}
      />
    );
  }

  return (
    <ul className="card divide-y divide-line overflow-hidden">
      {rows.map((r) => {
        const name = otherName(r, perspective);
        const unread = r.unread_count > 0;
        const mine = r.last_sender_id === userId;
        return (
          <li key={r.conversation_id}>
            <Link
              href={`${base}/${r.conversation_id}`}
              className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-mist sm:px-6"
            >
              <Avatar name={name} src={r.other_photo_url} size={48} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`truncate font-display text-lg ${unread ? "font-bold text-ink" : "font-semibold text-ink"}`}>{name}</p>
                  {!r.can_message && (
                    <span className="shrink-0 rounded-full bg-mist px-2 py-0.5 text-[12px] font-semibold text-ink-3">Closed</span>
                  )}
                </div>
                <p className={`truncate text-[15px] ${unread ? "font-semibold text-ink" : "text-ink-3"}`}>
                  {r.last_message_preview ? `${mine ? "You: " : ""}${r.last_message_preview}` : "No messages yet"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="text-[13px] text-ink-3">{fmtListTime(r.last_message_at || r.created_at)}</span>
                {unread && (
                  <span
                    className="grid h-6 min-w-6 place-items-center rounded-full bg-rose px-1.5 text-[12px] font-bold text-white"
                    aria-label={`${r.unread_count} unread`}
                  >
                    {r.unread_count > 99 ? "99+" : r.unread_count}
                  </span>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
