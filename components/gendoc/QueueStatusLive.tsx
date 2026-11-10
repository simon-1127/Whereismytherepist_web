"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { fmtTime } from "../../lib/format";
import { QUEUE_SELECT, peopleAhead, rpcMessage, type QueueEntry } from "../../lib/gendoc";
import { Avatar } from "../ui";
import { useLiveQueue } from "./useLiveQueue";

/**
 * The employee's place in line, live. Position and ETA are whatever the
 * server last computed (fn_recompute_gendoc_queue runs on every change), so
 * this just re-reads the row when it changes. Leaving goes through
 * fn_leave_gendoc_queue (employees have no write policy on queue rows).
 */
export default function QueueStatusLive({ initialEntry }: { initialEntry: QueueEntry }) {
  const supabase = useMemo(() => createClient(), []);
  const [entry, setEntry] = useState<QueueEntry>(initialEntry);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    const { data } = await supabase
      .from("gendoc_queue_entries")
      .select(`${QUEUE_SELECT}, gendoc_profiles(full_name, photo_url)`)
      .eq("id", initialEntry.id)
      .maybeSingle();
    if (data) setEntry(data as unknown as QueueEntry);
  }, [supabase, initialEntry.id]);

  useLiveQueue(supabase, `gendoc-entry-${initialEntry.id}`, `id=eq.${initialEntry.id}`, refetch, 20_000);

  async function leave() {
    setBusy(true);
    setError("");
    const { error: err } = await supabase.rpc("fn_leave_gendoc_queue", { p_entry_id: entry.id });
    if (err) setError(rpcMessage(err, "Couldn't leave the queue. Please try again."));
    setConfirmLeave(false);
    await refetch();
    setBusy(false);
  }

  const doc = entry.gendoc_profiles?.full_name || "Your company doctor";
  const ahead = peopleAhead(entry);
  const back = (
    <Link href={`/company-doctor/${entry.gendoc_id}`} className="btn btn-quiet">
      Back to {entry.gendoc_profiles?.full_name || "the doctor"}
    </Link>
  );

  return (
    <div className="w-full max-w-xl">
      <div className="sheet overflow-hidden">
        <div className="flex items-center gap-4 border-b border-line p-6 md:p-8">
          <Avatar name={entry.gendoc_profiles?.full_name} src={entry.gendoc_profiles?.photo_url} size={56} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">Your company doctor</p>
            <p className="truncate font-display text-xl font-semibold">{doc}</p>
          </div>
        </div>

        <div className="p-6 md:p-8" aria-live="polite">
          {error && <p role="alert" className="alert alert-error mb-5">{error}</p>}

          {entry.status === "waiting" && (
            <>
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-3">
                <span className="live-dot h-2 w-2 rounded-full bg-teal" /> You&rsquo;re in line. This page updates by itself.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="well p-5">
                  <p className="text-sm text-ink-3">Your place</p>
                  <p className="mt-1 font-display text-5xl font-bold">#{entry.position}</p>
                  <p className="mt-1 text-sm text-ink-2">{ahead === 0 ? "You're next" : ahead === 1 ? "1 person ahead" : `${ahead} people ahead`}</p>
                </div>
                <div className="well p-5">
                  <p className="text-sm text-ink-3">Expected around</p>
                  <p className="mt-1 font-display text-4xl font-bold">{entry.estimated_start ? fmtTime(entry.estimated_start) : "…"}</p>
                  <p className="mt-1 text-sm text-ink-2">IST, may shift a little</p>
                </div>
              </div>
              <p className="mt-6 text-[15px] text-ink-2">
                Keep this page open. When {doc} starts your consult, a <strong className="text-ink">Join video</strong> button appears here.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {confirmLeave ? (
                  <>
                    <button onClick={leave} disabled={busy} className="btn bg-rose text-white hover:bg-rose-deep">
                      {busy ? "Leaving…" : "Yes, leave the queue"}
                    </button>
                    <button onClick={() => setConfirmLeave(false)} className="btn btn-quiet">Stay in line</button>
                  </>
                ) : (
                  <button onClick={() => setConfirmLeave(true)} className="btn btn-quiet">Leave the queue</button>
                )}
              </div>
            </>
          )}

          {entry.status === "in_progress" && (
            <>
              <p className="font-display text-3xl font-bold">{doc} is ready for you</p>
              <p className="mt-2 text-ink-2">Your consult has started. Join the video call now.</p>
              <Link href={`/company-doctor/consult/${entry.id}/room`} className="btn btn-primary btn-lg mt-6 w-full">Join video</Link>
            </>
          )}

          {entry.status === "completed" && (
            <>
              <p className="font-display text-3xl font-bold">Consult finished</p>
              <p className="mt-2 text-ink-2">
                {entry.actual_end ? `Ended at ${fmtTime(entry.actual_end)}. ` : ""}Hope you feel better soon.
              </p>
              <div className="mt-6">{back}</div>
            </>
          )}

          {(entry.status === "cancelled" || entry.status === "no_show") && (
            <>
              <p className="font-display text-3xl font-bold">
                {entry.status === "no_show" ? "You were marked as missed" : "You've left the queue"}
              </p>
              <p className="mt-2 text-ink-2">
                {entry.status === "no_show"
                  ? "The doctor couldn't reach you when it was your turn. You can join the queue again if they're still consulting today."
                  : "You can join again any time the doctor is consulting."}
              </p>
              <div className="mt-6">{back}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
