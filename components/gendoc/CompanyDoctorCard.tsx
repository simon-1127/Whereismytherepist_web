import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { getViewer } from "../../lib/viewer";
import { listCompanyDoctors, myActiveEntry } from "../../lib/gendoc-server";
import { HR_TIER, availability, peopleAhead } from "../../lib/gendoc";
import { fmtTime } from "../../lib/format";
import { Avatar } from "../ui";
import { AvailabilityLine } from "./GenDocBits";

/**
 * "Your company doctor" entry on the signed-in client pages. Shown when the
 * account is HR-onboarded OR RLS returns at least one doctor (approved and
 * assigned to an org they're an active employee of). HR-onboarded with no
 * doctor yet gets a calm "ask HR" line rather than nothing. Render inside
 * <Suspense fallback={null}> so it never holds up the page.
 */
export default async function CompanyDoctorCard() {
  const { user, role, tier } = await getViewer();
  if (!user || role === "provider" || role === "gendoc") return null;

  const supabase = await createClient();
  const [doctors, entry] = await Promise.all([listCompanyDoctors(supabase), myActiveEntry(supabase, user.id)]);
  const isHr = tier === HR_TIER;
  if (!isHr && !doctors.length && !entry) return null;

  if (entry) {
    const live = entry.status === "in_progress";
    const ahead = peopleAhead(entry);
    const doc = entry.gendoc_profiles?.full_name || "your company doctor";
    return (
      <Link
        href={`/company-doctor/consult/${entry.id}`}
        className={`card card-hover mb-8 flex flex-wrap items-center gap-4 p-5 md:p-6 ${live ? "ring-2 ring-teal" : ""}`}
      >
        <Avatar name={entry.gendoc_profiles?.full_name} src={entry.gendoc_profiles?.photo_url} size={52} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">Your company doctor</p>
          <p className="mt-0.5 font-display text-lg font-semibold">
            {live ? `${doc} is ready for you` : ahead === 0 ? `You're next with ${doc}` : `You're #${entry.position} in line with ${doc}`}
          </p>
          <p className="text-sm text-ink-3">
            {live ? "Your consult has started." : entry.estimated_start ? `Expected around ${fmtTime(entry.estimated_start)}.` : "Your estimated time is on its way."}
          </p>
        </div>
        <span className={`btn btn-sm ${live ? "btn-primary" : "btn-quiet"}`}>{live ? "Join video" : "See my place"}</span>
      </Link>
    );
  }

  if (!doctors.length) {
    return (
      <div className="well mb-8 flex flex-wrap items-center gap-4 p-5 md:p-6">
        <span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-soft text-teal">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" /></svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">Your company doctor</p>
          <p className="mt-0.5 font-semibold text-ink">Your company hasn&rsquo;t assigned a doctor yet</p>
          <p className="text-sm text-ink-3">Contact your HR team. Once they add one, you can consult them from here.</p>
        </div>
      </div>
    );
  }

  const single = doctors.length === 1 ? doctors[0] : null;
  const openToday = doctors.filter((d) => availability(d).joinable).length;
  const a = single ? availability(single) : null;

  return (
    <Link href={single ? `/company-doctor/${single.user_id}` : "/company-doctor"} className="card card-hover mb-8 flex flex-wrap items-center gap-4 p-5 md:p-6">
      <div className="flex shrink-0 -space-x-3">
        {doctors.slice(0, 3).map((d) => (
          <Avatar key={d.user_id} name={d.full_name} src={d.photo_url} size={52} className="ring-2 ring-paper" />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">Your company doctor</p>
        <p className="mt-0.5 truncate font-display text-lg font-semibold">{single ? single.full_name : `${doctors.length} doctors for your team`}</p>
        {a ? (
          <AvailabilityLine a={a} />
        ) : (
          <p className="text-sm text-ink-2">{openToday ? `${openToday} of ${doctors.length} consulting today` : "No one consulting today"}</p>
        )}
        <p className="mt-1 text-[13px] text-ink-3">Free, covered by your employer.</p>
      </div>
      <span className={`btn btn-sm ${openToday ? "btn-primary" : "btn-quiet"}`}>{openToday ? "Join queue" : "See hours"}</span>
    </Link>
  );
}
