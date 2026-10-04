import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { displayStatus } from "../../../lib/sessions";
import { canJoinSession } from "../../../lib/daily";
import { fmtDayLong, fmtTimeRange } from "../../../lib/format";
import { formatMoney } from "../../../lib/money";
import { SessionTicket } from "../../../components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

const STATUS_COPY: Record<string, string> = {
  draft: "Finish setup so clients can find you.",
  submitted: "Your profile is with our team for review.",
  under_review: "Your profile is being reviewed.",
  rejected: "Your profile needs changes. Check your email for details.",
  suspended: "Your profile is paused. Contact support.",
};

export default async function ProviderDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/provider/dashboard");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userRow?.role !== "provider") redirect("/");

  const { data: profile } = await supabase
    .from("provider_profiles")
    .select("full_name, application_status, kyc_status, is_publicly_listed, rating_avg, rating_count")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <main className="shell flex flex-1 items-center justify-center py-20">
        <div className="sheet max-w-lg p-8 text-center md:p-10">
          <h1 className="text-3xl font-bold">Welcome. Let&rsquo;s set up your profile.</h1>
          <p className="mt-3 text-ink-2">Clients can&rsquo;t find or book you until your profile is filled in.</p>
          <Link href="/provider/profile" className="btn btn-primary mt-6">Set up my profile</Link>
        </div>
      </main>
    );
  }

  const nowIso = new Date().toISOString();
  const weekAhead = new Date(Date.now() + 7 * 86_400_000).toISOString();
  const [{ data: soon }, { count: openSlots }, { data: done }] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, client_id, status, scheduled_start, scheduled_end, provider_payout_amount, currency")
      .eq("provider_id", user.id)
      .in("status", ["confirmed", "in_progress"])
      .gte("scheduled_end", new Date(Date.now() - 15 * 60_000).toISOString())
      .order("scheduled_start", { ascending: true })
      .limit(6),
    supabase
      .from("availability_slots")
      .select("id", { count: "exact", head: true })
      .eq("provider_id", user.id)
      .eq("status", "open")
      .gte("start_time", nowIso)
      .lte("start_time", weekAhead),
    supabase
      .from("sessions")
      .select("provider_payout_amount, scheduled_end, status")
      .eq("provider_id", user.id)
      .in("status", ["confirmed", "in_progress", "completed"])
      .lt("scheduled_end", nowIso),
  ]);

  const ids = Array.from(new Set((soon || []).map((s) => s.client_id)));
  const { data: clients } = ids.length
    ? await supabase.from("client_profiles").select("user_id, full_name").in("user_id", ids)
    : { data: [] as { user_id: string; full_name: string }[] };
  const names = new Map((clients || []).map((c) => [c.user_id, c.full_name]));

  const next = soon?.[0];
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthEarned = (done || [])
    .filter((s) => new Date(s.scheduled_end) >= monthStart)
    .reduce((sum, s) => sum + (s.provider_payout_amount || 0), 0);
  const first = profile.full_name?.split(" ")[0] || "there";

  return (
    <main className="shell py-10 md:py-14">
      <header className="mb-8">
        <h1 className="text-[2.4rem] font-bold md:text-5xl">Hello, {first}</h1>
        <p className="mt-2 text-lg text-ink-2">Here&rsquo;s your week.</p>
      </header>

      {profile.application_status !== "approved" && (
        <div className="alert alert-warn mb-6 flex flex-wrap items-center justify-between gap-3">
          <span>{STATUS_COPY[profile.application_status] || `Profile status: ${profile.application_status}`}</span>
          {profile.application_status === "draft" && <Link href="/provider/payout" className="font-semibold underline">Finish setup</Link>}
        </div>
      )}

      <div data-reveal-group className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-[var(--radius-sheet)] bg-brand p-7 text-white md:p-9">
          <p className="text-sm font-semibold text-lilac">Next session</p>
          {next ? (
            <>
              <p className="mt-4 font-display text-4xl font-semibold leading-tight">{names.get(next.client_id) || "Client"}</p>
              <p className="mt-2 text-lg text-white/75">
                {fmtDayLong(next.scheduled_start)}, {fmtTimeRange(next.scheduled_start, next.scheduled_end)} IST
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {canJoinSession(next) ? (
                  <Link href={`/sessions/${next.id}/room`} className="btn btn-primary">Join call</Link>
                ) : (
                  <Link href={`/sessions/${next.id}`} className="btn bg-white text-ink hover:bg-lilac">Open session</Link>
                )}
                <Link href="/provider/bookings" className="btn text-white ring-1 ring-white/25 hover:bg-white/10">All sessions</Link>
              </div>
            </>
          ) : (
            <>
              <p className="mt-4 font-display text-3xl font-semibold leading-tight">Nothing booked yet</p>
              <p className="mt-2 text-white/70">Open some times this week so clients can book you.</p>
              <Link href="/provider/availability" className="btn btn-primary mt-6">Open times</Link>
            </>
          )}
        </section>

        <dl className="grid grid-cols-2 gap-4">
          <div className="card p-6">
            <dt className="text-sm text-ink-3">Open slots, next 7 days</dt>
            <dd className="mt-2 font-display text-4xl font-bold">{openSlots || 0}</dd>
          </div>
          <div className="card p-6">
            <dt className="text-sm text-ink-3">Earned this month</dt>
            <dd className="mt-2 font-display text-4xl font-bold">{formatMoney(monthEarned, "INR")}</dd>
          </div>
          <div className="card p-6">
            <dt className="text-sm text-ink-3">Rating</dt>
            <dd className="mt-2 font-display text-4xl font-bold">{profile.rating_count ? Number(profile.rating_avg).toFixed(1) : "New"}</dd>
          </div>
          <div className="card p-6">
            <dt className="text-sm text-ink-3">Visible to clients</dt>
            <dd className={`mt-2 font-display text-4xl font-bold ${profile.is_publicly_listed ? "text-teal" : "text-ink-3"}`}>
              {profile.is_publicly_listed ? "Yes" : "Not yet"}
            </dd>
          </div>
        </dl>
      </div>

      {soon && soon.length > 1 && (
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Coming up</h2>
          <ul className="space-y-3">
            {soon.slice(1).map((s) => (
              <li key={s.id}>
                <SessionTicket
                  href={`/sessions/${s.id}`}
                  personName={names.get(s.client_id) || "Client"}
                  start={s.scheduled_start}
                  end={s.scheduled_end}
                  display={displayStatus(s)}
                  meta={s.provider_payout_amount ? `You earn ${formatMoney(s.provider_payout_amount, s.currency || "INR")}` : undefined}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="mt-10 grid gap-3 sm:grid-cols-3" aria-label="Shortcuts">
        {[
          { href: "/provider/availability", t: "Availability", d: "Open or remove times" },
          { href: "/provider/profile", t: "Public profile", d: "What clients see" },
          { href: "/provider/bookings?view=history", t: "Session history", d: "Everyone you've seen" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="card p-5 transition-shadow card-hover">
            <p className="font-display text-lg font-semibold">{l.t}</p>
            <p className="text-ink-3">{l.d}</p>
          </Link>
        ))}
      </nav>
    </main>
  );
}
