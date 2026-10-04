import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { formatMoney } from "../../../lib/money";
import { fmtDayLong, fmtDayShort, fmtTime, fmtTimeRange, minutesBetween } from "../../../lib/format";
import { displayStatus } from "../../../lib/sessions";
import { canJoinSession, joinWindow } from "../../../lib/daily";
import { Avatar, StatusPill } from "../../../components/ui";
import PaymentWatcher from "../../../components/PaymentWatcher";
import Footer from "../../../components/Footer";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/sessions/${id}`);

  const { data: session } = await supabase.from("sessions").select("*").eq("id", id).maybeSingle();
  if (!session) notFound();

  const isClient = session.client_id === user.id;
  const isProvider = session.provider_id === user.id;
  if (!isClient && !isProvider) notFound();

  let other: { name: string; title?: string | null; photo?: string | null; id?: string } = { name: "Client" };
  if (isClient) {
    const { data: p } = await supabase
      .from("provider_profiles")
      .select("full_name, professional_title, photo_url")
      .eq("user_id", session.provider_id)
      .maybeSingle();
    other = { name: p?.full_name || "Your therapist", title: p?.professional_title, photo: p?.photo_url, id: session.provider_id };
  } else {
    const { data: c } = await supabase.from("client_profiles").select("full_name").eq("user_id", session.client_id).maybeSingle();
    other = { name: c?.full_name || "Client" };
  }

  const now = Date.now();
  const display = displayStatus(session, now);
  const canJoin = canJoinSession(session, now);
  const { opensAt } = joinWindow(session.scheduled_start, session.scheduled_end);
  const backHref = isProvider ? "/provider/bookings" : "/sessions";

  // Session log: a real sequence of what happened to this booking.
  const paid = !["pending_payment"].includes(session.status);
  const log: { when?: string; label: string; done: boolean }[] = [
    { when: session.created_at, label: "Slot reserved", done: true },
    { label: paid ? "Payment received, session confirmed" : "Waiting for payment", done: paid },
  ];
  if (session.cancelled_at || session.status.startsWith("cancelled")) {
    log.push({ when: session.cancelled_at, label: display.label, done: true });
  } else if (session.status === "refunded") {
    log.push({ label: "Refunded", done: true });
  } else {
    log.push({ when: session.actual_start, label: "Video room opened", done: !!session.actual_start });
    log.push({
      when: session.actual_end || (display.label === "Completed" ? session.scheduled_end : undefined),
      label: "Session finished",
      done: display.bucket === "history",
    });
  }

  return (
    <>
    <main className="shell max-w-[1080px] py-10 md:py-14">
      <Link href={backHref} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-2 hover:text-ink">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
        All sessions
      </Link>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
        <section className="sheet overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 md:p-8">
            <div className="flex items-center gap-4">
              <Avatar name={other.name} src={other.photo} size={64} />
              <div>
                <p className="text-sm text-ink-3">Session with</p>
                <h1 className="text-3xl font-bold">{other.name}</h1>
                {other.title && <p className="text-ink-2">{other.title}</p>}
              </div>
            </div>
            <StatusPill display={display} />
          </div>

          <div className="mx-6 h-px bg-line" aria-hidden />

          <dl className="grid gap-6 p-6 sm:grid-cols-[1.3fr_1.2fr_0.7fr] md:p-8">
            <div>
              <dt className="text-sm text-ink-3">Date</dt>
              <dd className="mt-1 font-display text-xl font-semibold">{fmtDayLong(session.scheduled_start)}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-3">Time (IST)</dt>
              <dd className="mt-1 font-display text-xl font-semibold">{fmtTimeRange(session.scheduled_start, session.scheduled_end)}</dd>
              <dd className="text-sm text-ink-3">{minutesBetween(session.scheduled_start, session.scheduled_end)} minutes, online</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-3">{isProvider ? "You earn" : "Paid"}</dt>
              <dd className="mt-1 font-display text-xl font-semibold">
                {formatMoney(isProvider ? session.provider_payout_amount : session.amount, session.currency)}
              </dd>
            </div>
          </dl>

          <div className="space-y-4 px-6 pb-6 md:px-8 md:pb-8">
            {session.status === "pending_payment" && display.bucket === "upcoming" && isClient && (
              <PaymentWatcher sessionId={session.id} />
            )}

            {canJoin ? (
              <Link href={`/sessions/${session.id}/room`} className="btn btn-primary btn-lg w-full">
                Join video call
              </Link>
            ) : display.bucket === "upcoming" && session.status !== "pending_payment" ? (
              <div className="well px-5 py-4 text-center text-ink-2">
                The call opens at <strong className="text-ink">{fmtTime(new Date(opensAt))}</strong> on{" "}
                {fmtDayShort(new Date(opensAt))}, 10 minutes before you start.
              </div>
            ) : null}

            {display.bucket !== "upcoming" && isClient && other.id && (
              <Link href={`/therapists/${other.id}`} className="btn btn-quiet w-full">
                Book another session with {other.name.split(" ")[0]}
              </Link>
            )}
          </div>
        </section>

        <aside className="card h-fit p-6">
          <h2 className="text-lg font-semibold">Session log</h2>
          <ol className="mt-5 space-y-0">
            {log.map((step, i) => (
              <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
                {i < log.length - 1 && <span className="absolute left-[7px] top-5 h-full w-px bg-line" aria-hidden />}
                <span
                  className={`relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full ${
                    step.done ? "bg-teal" : "border-2 border-line bg-paper"
                  }`}
                />
                <div>
                  <p className={`text-[15px] font-semibold ${step.done ? "text-ink" : "text-ink-3"}`}>{step.label}</p>
                  {step.when && step.done && (
                    <p className="text-[13px] text-ink-3">
                      {fmtDayShort(step.when)}, {fmtTime(step.when)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-line pt-4 text-[13px] text-ink-3">
            Need help with this booking? Write to{" "}
            <a className="link" href={`mailto:support@wheresmytherapist.com?subject=Session%20${session.id.slice(0, 8)}`}>
              support
            </a>{" "}
            and mention reference {session.id.slice(0, 8)}.
          </p>
        </aside>
      </div>
    </main>
    <Footer />
    </>
  );
}
