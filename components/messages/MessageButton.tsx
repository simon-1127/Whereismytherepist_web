"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { messagesBase, type Perspective } from "../../lib/messages";

/**
 * Opens (or starts) the conversation with another user via
 * fn_open_conversation, then goes to the thread. NULL back means there's
 * nothing to show yet (never booked, or no thread and no active booking).
 */
export default function MessageButton({
  otherUserId,
  perspective,
  label,
  className = "btn btn-quiet w-full",
  noteClassName = "mt-2 text-sm text-ink-3",
}: {
  otherUserId: string;
  perspective: Perspective;
  label?: string;
  className?: string;
  noteClassName?: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function open() {
    setBusy(true);
    setNote("");
    const { data, error } = await supabase.rpc("fn_open_conversation", { p_other_user_id: otherUserId });
    if (error) {
      setNote(/JWT|sign in/i.test(error.message || "") ? "Please sign in again to send messages." : "Couldn't open messages. Please try again.");
      setBusy(false);
      return;
    }
    if (!data) {
      setNote(
        perspective === "client"
          ? "You can message this therapist once you've booked a session with them."
          : "You can message this client while they have a session booked with you."
      );
      setBusy(false);
      return;
    }
    router.push(`${messagesBase(perspective)}/${data as string}`);
  }

  return (
    <div>
      <button type="button" onClick={open} disabled={busy} className={className}>
        {busy ? "Opening…" : label || (perspective === "client" ? "Message" : "Message client")}
      </button>
      {note && (
        <p role="status" className={noteClassName}>
          {note}
        </p>
      )}
    </div>
  );
}
