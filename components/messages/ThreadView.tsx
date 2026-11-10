"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { fmtDayLong, fmtTime, istDayKey } from "../../lib/format";
import {
  MESSAGE_MAX,
  MESSAGE_SELECT,
  MESSAGES_READ_EVENT,
  isClosedError,
  messagesBase,
  otherName,
  sendErrorMessage,
  type ConversationRow,
  type Message,
  type Perspective,
} from "../../lib/messages";
import { Avatar } from "../ui";
import { useLiveRows } from "./useLiveRows";

const PAGE = 100;

function mergeMessages(current: Message[], incoming: Message[]) {
  if (incoming.length === 0) return current;
  const byId = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, { ...byId.get(m.id), ...m });
  return Array.from(byId.values()).sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
}

/**
 * One conversation: history oldest -> newest, live appends over Realtime,
 * read receipts via fn_mark_conversation_read (on open and whenever the
 * other person's messages arrive while the tab is visible), and the send
 * box, which is shut whenever fn_can_message says so.
 */
export default function ThreadView({
  conversation: initialConversation,
  initialMessages,
  initialHasMore,
  userId,
  perspective,
}: {
  conversation: ConversationRow;
  initialMessages: Message[];
  initialHasMore: boolean;
  userId: string;
  perspective: Perspective;
}) {
  const supabase = useMemo(() => createClient(), []);
  const id = initialConversation.conversation_id;
  const [conversation, setConversation] = useState(initialConversation);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const scroller = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const prependFrom = useRef<number | null>(null);

  const name = otherName(conversation, perspective);
  const first = name.split(" ")[0];
  const canMessage = conversation.can_message;

  // ---- Read receipts ------------------------------------------------------
  const markTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markRead = useCallback(() => {
    if (markTimer.current) clearTimeout(markTimer.current);
    markTimer.current = setTimeout(async () => {
      if (document.visibilityState !== "visible") return;
      const { error: err } = await supabase.rpc("fn_mark_conversation_read", { p_conversation_id: id });
      if (!err) window.dispatchEvent(new Event(MESSAGES_READ_EVENT));
    }, 400);
  }, [supabase, id]);

  useEffect(() => {
    markRead();
    return () => {
      if (markTimer.current) clearTimeout(markTimer.current);
    };
  }, [markRead]);

  // ---- Live updates -------------------------------------------------------
  const refreshConversation = useCallback(async () => {
    const { data } = await supabase.rpc("fn_my_conversations", { p_conversation_id: id });
    const row = ((data || []) as ConversationRow[])[0];
    if (row) setConversation(row);
  }, [supabase, id]);

  const refetch = useCallback(async () => {
    const { data } = await supabase
      .from("messages")
      .select(MESSAGE_SELECT)
      .eq("conversation_id", id)
      .order("created_at", { ascending: false })
      .limit(PAGE);
    const latest = (data || []) as Message[];
    setMessages((cur) => mergeMessages(cur, latest));
    if (latest.some((m) => m.sender_id !== userId && !m.read_at)) markRead();
    // Sending can open or close with time (a session ending), so re-check.
    refreshConversation();
  }, [supabase, id, userId, markRead, refreshConversation]);

  const onChange = useCallback(
    (change: { eventType: string; new: Record<string, unknown> }) => {
      const row = change.new as unknown as Message;
      if (!row?.id || row.conversation_id !== id) return;
      setMessages((cur) => mergeMessages(cur, [row]));
      if (change.eventType === "INSERT" && row.sender_id !== userId) markRead();
    },
    [id, userId, markRead]
  );

  useLiveRows(supabase, `thread-${id}`, "messages", [`conversation_id=eq.${id}`], onChange, refetch);

  // Catch up the moment the tab comes back (useLiveRows refetches too; this
  // is just for the read receipt, which is skipped while hidden).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") markRead();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [markRead]);

  // ---- Scrolling ----------------------------------------------------------
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (prependFrom.current !== null) {
      el.scrollTop += el.scrollHeight - prependFrom.current;
      prependFrom.current = null;
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  async function loadOlder() {
    const oldest = messages[0];
    if (!oldest) return;
    setLoadingOlder(true);
    const { data } = await supabase
      .from("messages")
      .select(MESSAGE_SELECT)
      .eq("conversation_id", id)
      .lt("created_at", oldest.created_at)
      .order("created_at", { ascending: false })
      .limit(PAGE);
    const older = (data || []) as Message[];
    prependFrom.current = scroller.current?.scrollHeight ?? null;
    setMessages((cur) => mergeMessages(cur, older));
    setHasMore(older.length === PAGE);
    setLoadingOlder(false);
  }

  // ---- Sending ------------------------------------------------------------
  const body = draft.trim();
  const tooLong = draft.length > MESSAGE_MAX;

  async function send() {
    if (!body || tooLong || sending || !canMessage) return;
    setSending(true);
    setError("");
    const { data, error: err } = await supabase
      .from("messages")
      .insert({ conversation_id: id, sender_id: userId, body })
      .select(MESSAGE_SELECT)
      .single();
    setSending(false);
    if (err || !data) {
      setError(sendErrorMessage(err));
      if (isClosedError(err)) refreshConversation();
      return;
    }
    stickToBottom.current = true;
    setMessages((cur) => mergeMessages(cur, [data as Message]));
    setDraft("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  const lastMine = [...messages].reverse().find((m) => m.sender_id === userId);
  const lastMessage = messages[messages.length - 1];

  return (
    <div className="flex w-full flex-col">
      <Link
        href={messagesBase(perspective)}
        className="mb-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink-2 hover:text-ink"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
        All messages
      </Link>

      <section className="sheet flex flex-col overflow-hidden">
        <header className="flex items-center gap-4 border-b border-line px-5 py-4 md:px-6">
          <Avatar name={name} src={conversation.other_photo_url} size={48} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-semibold md:text-2xl">{name}</h1>
            <p className="text-sm text-ink-3">{perspective === "client" ? "Your therapist" : "Your client"}</p>
          </div>
          {perspective === "client" && (
            <Link href={`/therapists/${conversation.provider_id}`} className="btn btn-quiet btn-sm shrink-0">
              View profile
            </Link>
          )}
        </header>

        <p className="border-b border-amber/20 bg-amber-soft px-5 py-2.5 text-[13px] leading-relaxed text-ink-2 md:px-6">
          Messages aren&rsquo;t monitored in real time and aren&rsquo;t for emergencies. If you&rsquo;re in crisis,{" "}
          <Link href="/contact" className="link">
            get help now
          </Link>
          {" "}(Tele MANAS{" "}
          <a href="tel:14416" className="font-semibold text-ink">
            14416
          </a>
          , free 24/7).
        </p>

        <div
          ref={scroller}
          onScroll={onScroll}
          className="h-[min(62vh,620px)] min-h-[320px] overflow-y-auto bg-mist/60 px-4 py-5 md:px-6"
          aria-live="polite"
          aria-label={`Conversation with ${name}`}
        >
          {hasMore && (
            <div className="mb-4 text-center">
              <button onClick={loadOlder} disabled={loadingOlder} className="btn btn-quiet btn-sm">
                {loadingOlder ? "Loading…" : "Load earlier messages"}
              </button>
            </div>
          )}
          {messages.length === 0 ? (
            <p className="mt-16 text-center text-ink-3">
              {canMessage ? `No messages yet. Say hello to ${first}.` : "No messages in this conversation."}
            </p>
          ) : (
            <ol className="space-y-2">
              {messages.map((m, i) => {
                const mine = m.sender_id === userId;
                const prev = messages[i - 1];
                const newDay = !prev || istDayKey(prev.created_at) !== istDayKey(m.created_at);
                return (
                  <li key={m.id}>
                    {newDay && (
                      <p className="my-4 text-center text-[12px] font-semibold uppercase tracking-wide text-ink-3">
                        {fmtDayLong(m.created_at)}
                      </p>
                    )}
                    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-[20px] px-4 py-2.5 sm:max-w-[70%] ${
                          mine ? "rounded-br-md bg-brand text-white" : "rounded-bl-md border border-line bg-paper text-ink"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{m.body}</p>
                        <p className={`mt-1 text-right text-[11px] ${mine ? "text-white/65" : "text-ink-3"}`}>
                          {fmtTime(m.created_at)}
                          {mine && m.id === lastMine?.id && m.id === lastMessage?.id && m.read_at ? " · Seen" : ""}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="border-t border-line bg-paper p-4 md:p-5">
          {error && (
            <p role="alert" className="alert alert-error mb-3">
              {error}
            </p>
          )}
          {!canMessage && (
            <div className="well mb-3 px-4 py-3 text-[15px] text-ink-2">
              {perspective === "client" ? (
                <>
                  Messaging is closed. It reopens when you book your next session with {name}.{" "}
                  <Link href={`/therapists/${conversation.provider_id}`} className="link">
                    Book a session
                  </Link>
                </>
              ) : (
                <>Messaging reopens when this client books another session with you.</>
              )}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-end gap-3"
          >
            <label htmlFor="message-body" className="sr-only">
              Message {name}
            </label>
            <textarea
              id="message-body"
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={!canMessage || sending}
              maxLength={MESSAGE_MAX}
              placeholder={canMessage ? `Write to ${first}…` : "Messaging is closed"}
              className="field min-h-[52px] flex-1 resize-y disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button type="submit" disabled={!canMessage || sending || !body || tooLong} className="btn btn-primary shrink-0">
              {sending ? "Sending…" : "Send"}
            </button>
          </form>
          {canMessage && (
            <p className={`mt-1.5 text-right text-[12px] ${draft.length > MESSAGE_MAX - 100 ? "text-rose-deep" : "text-ink-3"}`}>
              {draft.length}/{MESSAGE_MAX} · Enter to send, Shift+Enter for a new line
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
