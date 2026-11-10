import Link from "next/link";
import { notFound } from "next/navigation";
import { myActiveEntry, requireEmployee } from "../../../lib/gendoc-server";
import { GENDOC_PROFILE_SELECT, availability, toGenDocProfile } from "../../../lib/gendoc";
import { fmtTime } from "../../../lib/format";
import { Avatar } from "../../../components/ui";
import { AvailabilityLine, HoursList } from "../../../components/gendoc/GenDocBits";
import JoinQueueButton from "../../../components/gendoc/JoinQueueButton";
import Footer from "../../../components/Footer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your company doctor" };

export default async function CompanyDoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireEmployee(`/company-doctor/${id}`);

  // RLS: only approved doctors serving one of the viewer's orgs come back.
  const [{ data: row }, entry, { count }] = await Promise.all([
    supabase.from("gendoc_profiles").select(GENDOC_PROFILE_SELECT).eq("user_id", id).maybeSingle(),
    myActiveEntry(supabase, userId),
    supabase.from("gendoc_profiles").select("user_id", { count: "exact", head: true }),
  ]);
  if (!row) notFound();
  const doc = toGenDocProfile(row);
  const a = availability(doc);
  const mine = entry && entry.gendoc_id === doc.user_id ? entry : null;
  const elsewhere = entry && !mine ? entry : null;

  return (
    <>
      <main className="shell py-10 md:py-14">
        {(count || 0) > 1 && (
          <Link href="/company-doctor" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-2 hover:text-ink">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
            All company doctors
          </Link>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <section className="sheet p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-5">
              <Avatar name={doc.full_name} src={doc.photo_url} size={96} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal">Your company doctor</p>
                <h1 className="mt-1 text-3xl font-bold md:text-4xl">{doc.full_name}</h1>
                <p className="mt-1 text-ink-2">
                  {doc.professional_title || "General Physician"}
                  {doc.years_experience ? `, ${doc.years_experience} years' experience` : ""}
                </p>
              </div>
            </div>

            {doc.bio && <p className="mt-8 text-lg leading-relaxed text-ink-2">{doc.bio}</p>}

            <dl className="mt-8 grid gap-5 sm:grid-cols-2">
              {!!doc.qualifications?.length && (
                <div>
                  <dt className="text-sm text-ink-3">Qualifications</dt>
                  <dd className="mt-1 font-semibold">{doc.qualifications.join(", ")}</dd>
                </div>
              )}
              {doc.registration_no && (
                <div>
                  <dt className="text-sm text-ink-3">Registration</dt>
                  <dd className="mt-1 font-semibold">
                    {doc.registration_no}
                    {doc.registration_council ? `, ${doc.registration_council}` : ""}
                  </dd>
                </div>
              )}
              {doc.clinic_affiliation && (
                <div>
                  <dt className="text-sm text-ink-3">Clinic</dt>
                  <dd className="mt-1 font-semibold">{doc.clinic_affiliation}</dd>
                </div>
              )}
              {doc.languages.length > 0 && (
                <div>
                  <dt className="text-sm text-ink-3">Languages</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {doc.languages.map((l) => (
                      <span key={l.id} className="chip">{l.name}</span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="card p-6">
              <p className="text-sm font-semibold text-ink-3">Today</p>
              <AvailabilityLine a={a} className="mt-2 text-base" />

              <div className="mt-6">
                {mine ? (
                  <div className="space-y-3">
                    <p className="font-display text-xl font-semibold">
                      {mine.status === "in_progress" ? "Your consult has started" : `You're #${mine.position} in line`}
                    </p>
                    <p className="text-sm text-ink-2">
                      {mine.status === "in_progress"
                        ? "Join the video call now."
                        : mine.estimated_start
                          ? `Expected around ${fmtTime(mine.estimated_start)}.`
                          : "Your estimated time is on its way."}
                    </p>
                    <Link href={`/company-doctor/consult/${mine.id}`} className="btn btn-primary w-full">
                      {mine.status === "in_progress" ? "Join video" : "See my place in line"}
                    </Link>
                  </div>
                ) : elsewhere ? (
                  <div className="space-y-3">
                    <p className="text-[15px] text-ink-2">
                      You&rsquo;re already in line with {elsewhere.gendoc_profiles?.full_name || "another doctor"} today. Leave that queue
                      first to join this one.
                    </p>
                    <Link href={`/company-doctor/consult/${elsewhere.id}`} className="btn btn-quiet w-full">See my place</Link>
                  </div>
                ) : a.joinable ? (
                  <>
                    <JoinQueueButton gendocId={doc.user_id} />
                    <p className="mt-3 text-center text-[13px] text-ink-3">
                      Free, covered by your employer. You&rsquo;ll get a place in line and an estimated time straight away.
                    </p>
                  </>
                ) : (
                  <p className="alert alert-warn">
                    {a.kind === "paused"
                      ? "This doctor isn't taking new requests right now. Check back later."
                      : `This doctor isn't consulting today.${a.detail ? ` ${a.detail}.` : ""}`}
                  </p>
                )}
              </div>
            </div>

            <div className="card p-6">
              <p className="mb-1 text-sm font-semibold text-ink-3">Consulting hours</p>
              <HoursList profile={doc} />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
