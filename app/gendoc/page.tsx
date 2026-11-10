import Link from "next/link";
import { requireGenDoc } from "../../lib/gendoc-server";
import { DEFAULT_SCHEDULE, QUEUE_SELECT, hoursLabel, istToday, needsProfileSetup, workingDaysLabel, worksOn, type QueueEntry } from "../../lib/gendoc";
import { fmtDayLong } from "../../lib/format";
import GenDocQueueBoard from "../../components/gendoc/GenDocQueueBoard";
import { StatusBanner } from "../../components/gendoc/GenDocBits";

export const dynamic = "force-dynamic";
export const metadata = { title: "Today's queue" };

export default async function GenDocQueuePage() {
  const { supabase, userId, profile } = await requireGenDoc("/gendoc");
  const today = istToday();

  const { data: rows } = await supabase
    .from("gendoc_queue_entries")
    .select(QUEUE_SELECT)
    .eq("gendoc_id", userId)
    .eq("queue_date", today)
    .order("position");

  const schedule = profile.schedule || DEFAULT_SCHEDULE;
  const first = (profile.full_name || "").replace(/^dr\.?\s+/i, "").split(" ")[0] || "Doctor";
  const approved = profile.application_status === "approved";

  return (
    <main className="shell py-10 md:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-violet">{fmtDayLong(new Date())}</p>
          <h1 className="mt-1 text-[2.4rem] font-bold md:text-5xl">Hello, Dr. {first}</h1>
          <p className="mt-2 text-lg text-ink-2">
            {worksOn(schedule) ? `Consulting today, ${hoursLabel(schedule)} IST.` : `Not a working day. You consult ${workingDaysLabel(schedule.working_days)}.`}
          </p>
        </div>
        <Link href="/gendoc/hours" className="btn btn-quiet btn-sm">Change hours</Link>
      </header>

      <div className="mb-6 space-y-3">
        <StatusBanner profile={profile} />
        {approved && needsProfileSetup(profile) && (
          <p className="alert alert-warn">
            Finish your profile so employees know who they&rsquo;re seeing.{" "}
            <Link href="/gendoc/profile" className="font-semibold underline">Complete profile</Link>
          </p>
        )}
        {approved && profile.is_accepting_queue === false && (
          <p className="alert alert-warn">
            Your queue is paused, so nobody new can join.{" "}
            <Link href="/gendoc/hours" className="font-semibold underline">Turn it back on</Link>
          </p>
        )}
      </div>

      <GenDocQueueBoard gendocId={userId} today={today} initialEntries={(rows as QueueEntry[]) || []} />
    </main>
  );
}
