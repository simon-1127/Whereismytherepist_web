import Link from "next/link";
import { redirect } from "next/navigation";
import { listCompanyDoctors, myActiveEntry, requireEmployee } from "../../lib/gendoc-server";
import { HR_TIER, availability } from "../../lib/gendoc";
import { Avatar, EmptyState } from "../../components/ui";
import { AvailabilityLine } from "../../components/gendoc/GenDocBits";
import Footer from "../../components/Footer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your company doctor" };

/** Doctors the employer provides. With exactly one, skip the list. */
export default async function CompanyDoctorDirectoryPage() {
  const { supabase, userId, tier } = await requireEmployee("/company-doctor");
  const [doctors, entry] = await Promise.all([listCompanyDoctors(supabase), myActiveEntry(supabase, userId)]);

  if (doctors.length === 1 && !entry) redirect(`/company-doctor/${doctors[0].user_id}`);

  return (
    <>
      <main className="shell py-10 md:py-14">
        <header className="mb-8">
          <h1 className="text-[2.4rem] font-bold md:text-5xl">Your company doctor</h1>
          <p className="mt-2 max-w-2xl text-lg text-ink-2">
            A general doctor your employer provides, free for you. Join their queue for a video consult and get an estimated time
            straight away. No slot to book.
          </p>
        </header>

        {entry && (
          <Link href={`/company-doctor/consult/${entry.id}`} className="alert alert-ok mb-6 flex flex-wrap items-center justify-between gap-3">
            <span>
              {entry.status === "in_progress"
                ? `${entry.gendoc_profiles?.full_name || "Your doctor"} has started your consult.`
                : `You're in line with ${entry.gendoc_profiles?.full_name || "your doctor"}.`}
            </span>
            <span className="font-semibold underline">{entry.status === "in_progress" ? "Join video" : "See my place"}</span>
          </Link>
        )}

        {doctors.length === 0 ? (
          tier === HR_TIER ? (
            <EmptyState
              title="Your company hasn't assigned a doctor yet"
              body="Contact your HR team. Once they add a doctor, you can join their queue from here."
            />
          ) : (
            <EmptyState
              title="No company doctor on your account"
              body="This is for people whose employer provides a doctor through Where's My Therapist. If yours does, ask your HR team to add you."
              action={{ href: "/therapists", label: "Find a therapist" }}
            />
          )
        ) : (
          <ul data-reveal-group className="grid gap-4 md:grid-cols-2">
            {doctors.map((d) => {
              const a = availability(d);
              return (
                <li key={d.user_id}>
                  <Link href={`/company-doctor/${d.user_id}`} className="card card-hover flex h-full items-start gap-4 p-5 md:p-6">
                    <Avatar name={d.full_name} src={d.photo_url} size={64} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-xl font-semibold">{d.full_name}</p>
                      <p className="text-sm text-ink-3">
                        {d.professional_title || "General Physician"}
                        {d.years_experience ? `, ${d.years_experience} yrs` : ""}
                      </p>
                      <AvailabilityLine a={a} className="mt-3" />
                      {d.languages.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {d.languages.slice(0, 4).map((l) => (
                            <span key={l.id} className="chip">{l.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
