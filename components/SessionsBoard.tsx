import Link from "next/link";
import { displayStatus, type Bucket } from "../lib/sessions";
import { fmtDayLong, fmtTimeRange } from "../lib/format";
import { formatMoney } from "../lib/money";
import { canJoinSession } from "../lib/daily";
import { Avatar, EmptyState, SessionTicket, StatusPill } from "./ui";

export type BoardSession = {
  id: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  amount: number | null;
  currency: string | null;
  provider_payout_amount?: number | null;
  personName: string;
  personPhoto?: string | null;
};

const TABS: { id: Bucket; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "history", label: "History" },
  { id: "cancelled", label: "Cancelled" },
];

/**
 * Upcoming / history / cancelled, shared by the client's "My sessions" and
 * the therapist's "Sessions" page. Tabs are plain links (?view=), so the
 * page stays a server component and the back button works.
 */
export default function SessionsBoard({
  sessions,
  view,
  basePath,
  perspective,
}: {
  sessions: BoardSession[];
  view: Bucket;
  basePath: string;
  perspective: "client" | "provider";
}) {
  const now = Date.now();
  const withDisplay = sessions.map((s) => ({ ...s, display: displayStatus(s, now) }));

  const buckets: Record<Bucket, typeof withDisplay> = { upcoming: [], history: [], cancelled: [] };
  withDisplay.forEach((s) => buckets[s.display.bucket].push(s));
  buckets.upcoming.sort((a, b) => a.scheduled_start.localeCompare(b.scheduled_start));
  buckets.history.sort((a, b) => b.scheduled_start.localeCompare(a.scheduled_start));
  buckets.cancelled.sort((a, b) => b.scheduled_start.localeCompare(a.scheduled_start));

  const next = buckets.upcoming.find((s) => s.status !== "pending_payment");
  const list = buckets[view];

  const completed = buckets.history.filter((s) => s.display.label === "Completed");
  const totalMinutes = completed.reduce(
    (m, s) => m + (new Date(s.scheduled_end).getTime() - new Date(s.scheduled_start).getTime()) / 60000,
    0
  );
  const earned = completed.reduce((sum, s) => sum + (s.provider_payout_amount || 0), 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <nav aria-label="Session views" className="mb-6 inline-flex rounded-full bg-paper p-1 border border-line">
          {TABS.map((t) => {
            const active = t.id === view;
            return (
              <Link
                key={t.id}
                href={`${basePath}?view=${t.id}`}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:px-5 ${
                  active ? "bg-brand text-white" : "text-ink-2 hover:bg-mist"
                }`}
              >
                {t.label}
                <span className={`ml-1.5 ${active ? "text-white/60" : "text-ink-3"}`}>{buckets[t.id].length}</span>
              </Link>
            );
          })}
        </nav>

        {list.length === 0 ? (
          <EmptyState
            title={
              view === "upcoming" ? "Nothing booked yet" : view === "history" ? "No past sessions yet" : "Nothing cancelled"
            }
            body={
              view === "upcoming"
                ? perspective === "client"
                  ? "When you book a session it shows up here, with a join button on the day."
                  : "Open more availability so clients can find a time with you."
                : view === "history"
                  ? "Sessions you've finished will be listed here."
                  : undefined
            }
            action={
              view === "upcoming"
                ? perspective === "client"
                  ? { href: "/therapists", label: "Find a therapist" }
                  : { href: "/provider/availability", label: "Add availability" }
                : undefined
            }
          />
        ) : (
          <ul data-reveal-group className="space-y-3">
            {list.map((s) => (
              <li key={s.id}>
                <SessionTicket
                  href={`/sessions/${s.id}`}
                  personName={s.personName}
                  personPhoto={s.personPhoto}
                  start={s.scheduled_start}
                  end={s.scheduled_end}
                  display={s.display}
                  meta={
                    perspective === "provider"
                      ? s.provider_payout_amount
                        ? `You earn ${formatMoney(s.provider_payout_amount, s.currency || "INR")}`
                        : undefined
                      : s.amount
                        ? formatMoney(s.amount, s.currency || "INR")
                        : undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-[var(--radius-card)] bg-brand p-6 text-white">
          <p className="text-sm font-semibold text-lilac">Next session</p>
          {next ? (
            <>
              <div className="mt-4 flex items-center gap-3">
                <Avatar name={next.personName} src={next.personPhoto} size={44} className="ring-2 ring-white/20" />
                <p className="font-display text-xl font-semibold leading-tight">{next.personName}</p>
              </div>
              <p className="mt-4 font-display text-2xl font-semibold leading-tight">{fmtDayLong(next.scheduled_start)}</p>
              <p className="text-white/70">{fmtTimeRange(next.scheduled_start, next.scheduled_end)} IST</p>
              <div className="mt-5 flex items-center gap-3">
                {canJoinSession(next, now) ? (
                  <Link href={`/sessions/${next.id}/room`} className="btn btn-primary btn-sm">
                    Join call
                  </Link>
                ) : (
                  <Link href={`/sessions/${next.id}`} className="btn btn-sm bg-white text-ink hover:bg-lilac">
                    View details
                  </Link>
                )}
                <StatusPill display={next.display} />
              </div>
            </>
          ) : (
            <p className="mt-3 text-white/70">
              {perspective === "client" ? "No session booked. Pick a therapist and a time that suits you." : "No upcoming sessions right now."}
            </p>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-3">
          <div className="card p-5">
            <dt className="text-sm text-ink-3">Sessions done</dt>
            <dd className="mt-1 font-display text-3xl font-bold">{completed.length}</dd>
          </div>
          <div className="card p-5">
            <dt className="text-sm text-ink-3">{perspective === "provider" ? "Earned" : "Time in therapy"}</dt>
            <dd className="mt-1 font-display text-3xl font-bold">
              {perspective === "provider" ? formatMoney(earned, "INR") : `${Math.round(totalMinutes / 60 * 10) / 10}h`}
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
