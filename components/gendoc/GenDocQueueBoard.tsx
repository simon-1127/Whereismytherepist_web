"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { fmtTime } from "../../lib/format";
import { QUEUE_SELECT, QUEUE_STATUS_LABEL, rpcMessage, type QueueEntry, type QueueStatus } from "../../lib/gendoc";
import { EmptyState } from "../ui";
import { useLiveQueue } from "./useLiveQueue";

const DONE_TONE: Record<string, string> = {
  completed: "bg-teal-soft text-teal",
  no_show: "bg-amber-soft text-amber",
  cancelled: "bg-mist text-ink-3",
};

/**
 * The doctor's live queue for today. Every status change goes through
 * fn_set_gendoc_queue_status (it stamps start/end and recomputes everyone's
 * ETA); the doctor's plain UPDATE policy must not be used for this.
 * Employee names aren't readable by the doctor, so rows show the place in
 * line and the reason given.
 */
export default function GenDocQueueBoard({
  gendocId,
  today,
  initialEntries,
}: {
  gendocId: string;
  today: string;
  initialEntries: QueueEntry[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [entries, setEntries] = useState<QueueEntry[]>(initialEntries);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("gendoc_queue_entries")
      .select(QUEUE_SELECT)
      .eq("gendoc_id", gendocId)
      .eq("queue_date", today)
      .order("position");
    if (!err && data) setEntries(data as QueueEntry[]);
  }, [supabase, gendocId, today]);

  useLiveQueue(supabase, `gendoc-queue-${gendocId}`, `gendoc_id=eq.${gendocId}`, refetch);

  const current = entries.find((e) => e.status === "in_progress") || null;
  const waiting = entries.filter((e) => e.status === "waiting").sort((a, b) => a.position - b.position);
  const done = entries
    .filter((e) => e.status !== "waiting" && e.status !== "in_progress")
    .sort((a, b) => (b.actual_end || b.requested_at).localeCompare(a.actual_end || a.requested_at));
  const seen = done.filter((e) => e.status === "completed").length;

  async function setStatus(id: string, status: QueueStatus, thenJoin = false) {
    setError("");
    setConfirm(null);
    setBusy(id + status);
    const { error: err } = await supabase.rpc("fn_set_gendoc_queue_status", { p_entry_id: id, p_status: status });
    if (err) {
      setError(rpcMessage(err, "Couldn't update the queue. Please try again."));
      setBusy(null);
      await refetch();
      return;
    }
    if (thenJoin) {
      router.push(`/gendoc/consult/${id}`);
      return;
    }
    await refetch();
    setBusy(null);
  }

  /** Two taps for the ones that drop someone from the queue. */
  function confirmable(id: string, status: QueueStatus, label: string, cls = "btn btn-quiet btn-sm") {
    const key = id + status;
    if (confirm === key) {
      return (
        <span className="inline-flex items-center gap-2">
          <button onClick={() => setStatus(id, status)} disabled={!!busy} className="btn btn-sm bg-rose text-white hover:bg-rose-deep">
            {busy === key ? "Saving…" : `Yes, ${label.toLowerCase()}`}
          </button>
          <button onClick={() => setConfirm(null)} className="text-sm font-semibold text-ink-3 hover:text-ink">Keep</button>
        </span>
      );
    }
    return (
      <button onClick={() => setConfirm(key)} disabled={!!busy} className={cls}>
        {label}
      </button>
    );
  }

  const next = !current ? waiting[0] : null;

  return (
    <div className="space-y-8">
      {error && <p role="alert" className="alert alert-error">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-[var(--radius-sheet)] bg-brand p-7 text-white md:p-9" aria-live="polite">
          {current ? (
            <>
              <p className="flex items-center gap-2 text-sm font-semibold text-lilac">
                <span className="live-dot h-2 w-2 rounded-full bg-brand-coral" /> In consult now
              </p>
              <p className="mt-4 font-display text-4xl font-semibold leading-tight">Current patient</p>
              <p className="mt-2 text-lg text-white/75">
                {current.actual_start ? `Started ${fmtTime(current.actual_start)}` : "Started just now"}
              </p>
              {current.reason && <p className="mt-4 rounded-2xl bg-white/10 p-4 text-[15px] text-white/90">&ldquo;{current.reason}&rdquo;</p>}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href={`/gendoc/consult/${current.id}`} className="btn btn-primary">Join video</Link>
                <button onClick={() => setStatus(current.id, "completed")} disabled={!!busy} className="btn bg-white text-ink hover:bg-lilac">
                  {busy === current.id + "completed" ? "Saving…" : "Mark complete"}
                </button>
                {confirmable(current.id, "no_show", "No-show", "btn text-white ring-1 ring-white/25 hover:bg-white/10")}
              </div>
            </>
          ) : next ? (
            <>
              <p className="text-sm font-semibold text-lilac">Next up</p>
              <p className="mt-4 font-display text-4xl font-semibold leading-tight">Patient #{next.position}</p>
              <p className="mt-2 text-lg text-white/75">
                Joined {fmtTime(next.requested_at)}
                {next.estimated_start ? `. Expected around ${fmtTime(next.estimated_start)}` : ""}
              </p>
              {next.reason && <p className="mt-4 rounded-2xl bg-white/10 p-4 text-[15px] text-white/90">&ldquo;{next.reason}&rdquo;</p>}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button onClick={() => setStatus(next.id, "in_progress", true)} disabled={!!busy} className="btn btn-primary">
                  {busy === next.id + "in_progress" ? "Starting…" : "Start consult and join video"}
                </button>
                {confirmable(next.id, "no_show", "No-show", "btn text-white ring-1 ring-white/25 hover:bg-white/10")}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-lilac">Queue</p>
              <p className="mt-4 font-display text-3xl font-semibold leading-tight">No one waiting</p>
              <p className="mt-2 text-white/70">When an employee joins your queue, they appear here straight away with an estimated time.</p>
            </>
          )}
        </section>

        <dl className="grid grid-cols-2 gap-4">
          <div className="card p-6">
            <dt className="text-sm text-ink-3">Waiting now</dt>
            <dd className="mt-2 font-display text-4xl font-bold">{waiting.length}</dd>
          </div>
          <div className="card p-6">
            <dt className="text-sm text-ink-3">Seen today</dt>
            <dd className="mt-2 font-display text-4xl font-bold">{seen}</dd>
          </div>
          <div className="card col-span-2 p-6">
            <dt className="text-sm text-ink-3">Last estimated start</dt>
            <dd className="mt-2 font-display text-2xl font-bold">
              {waiting.length && waiting[waiting.length - 1].estimated_start ? fmtTime(waiting[waiting.length - 1].estimated_start!) : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Waiting</h2>
        {waiting.length === 0 ? (
          <EmptyState title="Nobody in line" body="This list updates by itself as people join or leave." />
        ) : (
          <ol className="space-y-3">
            {waiting.map((e) => (
              <li key={e.id} className="card flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap sm:pr-6">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-mist font-display text-2xl font-bold text-ink">
                  {e.position}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg font-semibold">{e.reason || `Joined ${fmtTime(e.requested_at)}`}</p>
                  <p className="text-sm text-ink-3">
                    {e.estimated_start ? `Expected around ${fmtTime(e.estimated_start)}` : "Estimating…"}
                    {e.reason ? `. Joined ${fmtTime(e.requested_at)}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setStatus(e.id, "in_progress", true)}
                    disabled={!!busy || !!current}
                    title={current ? "Finish the current consult first" : undefined}
                    className="btn btn-ink btn-sm disabled:opacity-40"
                  >
                    {busy === e.id + "in_progress" ? "Starting…" : "Start"}
                  </button>
                  {confirmable(e.id, "no_show", "No-show")}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold">Earlier today</h2>
          <ul className="card divide-y divide-line">
            {done.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{e.reason || "Consult"}</p>
                  <p className="text-sm text-ink-3">
                    {e.actual_start ? `${fmtTime(e.actual_start)}${e.actual_end ? ` – ${fmtTime(e.actual_end)}` : ""}` : `Joined ${fmtTime(e.requested_at)}`}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${DONE_TONE[e.status] || DONE_TONE.cancelled}`}>
                  {QUEUE_STATUS_LABEL[e.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
