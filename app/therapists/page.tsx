import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import FilterSidebar from "../../components/FilterSidebar";
import SortDropdown from "../../components/SortDropdown";
import Footer from "../../components/Footer";
import { Avatar, EmptyState } from "../../components/ui";
import { Contours } from "../../components/PageHeader";
import { formatMoney, rupeesToPaise } from "../../lib/money";

export const dynamic = "force-dynamic";
export const metadata = {
  title: 'Find a Therapist Online in India: Psychologists & Counsellors',
  description: 'Browse licensed psychologists and counsellors across India. Filter by anxiety, depression, relationships and more, by language (Hindi, Tamil, Telugu, Bengali and others) and by price. Book a private video session.',
  alternates: { canonical: '/therapists' },
};

type SearchParams = { minPrice?: string; maxPrice?: string; specialties?: string; languages?: string; sort?: string };

export default async function FindTherapist({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (userRow?.role === "provider") redirect("/provider/dashboard");
  }

  if (!user) {
    return (
      <>
        <main className="shell flex flex-1 items-center py-14">
          <div className="sheet relative mx-auto w-full max-w-2xl overflow-hidden p-8 md:p-12">
            <Contours className="pointer-events-none absolute -right-28 -top-16 h-[150%] text-lilac" />
            <div className="relative">
              <h1 className="text-4xl font-bold md:text-5xl">Sign in to browse therapists</h1>
              <p className="mt-4 max-w-md text-lg text-ink-2">
                It&rsquo;s free. Once you&rsquo;re in, you can filter by what you&rsquo;re going through, your language and your
                budget, and book a time that works.
              </p>
              <Link href="/login?next=/therapists" className="btn btn-primary btn-lg mt-8">
                Sign in or create an account
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const [{ data: specialtyOptions }, { data: languageOptions }] = await Promise.all([
    supabase.from("specialties").select("id, name").order("name"),
    supabase.from("languages").select("id, name").order("name"),
  ]);

  const specIds = params.specialties?.split(",").filter(Boolean) || [];
  const langIds = params.languages?.split(",").filter(Boolean) || [];

  let idFilter: string[] | null = null;
  const intersect = (ids: string[]) => (idFilter ? idFilter.filter((x) => ids.includes(x)) : ids);
  if (specIds.length) {
    const { data } = await supabase.from("provider_specialties").select("provider_id").in("specialty_id", specIds);
    idFilter = intersect(Array.from(new Set((data || []).map((r) => r.provider_id))));
  }
  if (langIds.length) {
    const { data } = await supabase.from("provider_languages").select("provider_id").in("language_id", langIds);
    idFilter = intersect(Array.from(new Set((data || []).map((r) => r.provider_id))));
  }

  let query = supabase
    .from("provider_profiles")
    .select(
      "user_id, full_name, professional_title, years_experience, base_session_rate, currency, rating_avg, rating_count, photo_url, kyc_status, bio, provider_specialties ( specialties ( id, name ) ), provider_languages ( languages ( id, name ) )"
    );
  if (params.maxPrice) query = query.lte("base_session_rate", rupeesToPaise(params.maxPrice));
  if (params.minPrice) query = query.gte("base_session_rate", rupeesToPaise(params.minPrice));
  if (idFilter) query = query.in("user_id", idFilter);

  switch (params.sort) {
    case "price_asc":
      query = query.order("base_session_rate", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_session_rate", { ascending: false });
      break;
    case "rating":
      query = query.order("rating_avg", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("rating_count", { ascending: false, nullsFirst: false });
  }

  const { data: therapists, error } =
    idFilter && idFilter.length === 0 ? { data: [] as any[], error: null } : await query;
  if (error) console.error("therapists query:", error);

  const count = therapists?.length || 0;

  return (
    <>
      <main className="shell py-8 md:py-12">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[2.4rem] font-bold md:text-[3.4rem]">Find your therapist</h1>
            <p className="mt-2 max-w-xl text-lg text-ink-2">
              Every therapist here is licensed and works online, so you can start from wherever you are.
            </p>
          </div>
          <Suspense>
            <SortDropdown />
          </Suspense>
        </header>

        <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-28">
            <Suspense>
              <FilterSidebar specialtyOptions={specialtyOptions || []} languageOptions={languageOptions || []} />
            </Suspense>
          </aside>

          <section aria-label="Results">
            <p className="mb-4 text-sm font-semibold text-ink-2">
              {count === 1 ? "1 therapist" : `${count} therapists`} match
            </p>

            {count === 0 ? (
              <EmptyState title="No one matches all of that" body="Try removing a filter or widening the price range." />
            ) : (
              <ul data-reveal-group className="space-y-4">
                {therapists!.map((t: any) => {
                  const specs = (t.provider_specialties || []).map((r: any) => r.specialties).filter(Boolean);
                  const langs = (t.provider_languages || []).map((r: any) => r.languages?.name).filter(Boolean);
                  return (
                    <li key={t.user_id}>
                      <article className="card card-hover group relative flex cursor-pointer flex-col overflow-hidden md:flex-row">
                        <div className="flex flex-1 gap-5 p-5 md:p-6">
                          {t.photo_url ? (
                            <img src={t.photo_url} alt="" className="h-24 w-24 shrink-0 rounded-[22px] object-cover md:h-28 md:w-28" />
                          ) : (
                            <Avatar name={t.full_name} size={104} className="!rounded-[22px]" />
                          )}
                          <div className="min-w-0">
                            <h2 className="flex flex-wrap items-center gap-2 text-2xl font-semibold">
                              {/* after: overlay stretches this link over the whole card */}
                              <Link href={`/therapists/${t.user_id}`} className="after:absolute after:inset-0 after:content-[''] group-hover:text-brand-violet">
                                {t.full_name || "Therapist"}
                              </Link>
                              {t.kyc_status === "verified" && (
                                <span className="rounded-full bg-teal-soft px-2.5 py-0.5 font-sans text-xs font-semibold text-teal">Verified</span>
                              )}
                            </h2>
                            <p className="text-ink-2">
                              {t.professional_title || "Therapist"}, {t.years_experience || 0} yrs
                            </p>
                            {t.bio && <p className="mt-2 line-clamp-2 max-w-[60ch] text-[15px] text-ink-3">{t.bio}</p>}
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {specs.slice(0, 4).map((s: any) => (
                                <span key={s.id} className="rounded-full bg-lilac px-2.5 py-1 text-[13px] font-medium text-brand-violet">{s.name}</span>
                              ))}
                              {specs.length > 4 && <span className="px-1 py-1 text-[13px] text-ink-3">+{specs.length - 4} more</span>}
                            </div>
                            {langs.length > 0 && <p className="mt-2 text-[13px] text-ink-3">Speaks {langs.join(", ")}</p>}
                          </div>
                        </div>

                        <div className="m-2 flex items-center justify-between gap-4 rounded-[18px] bg-brand-soft p-4 md:m-3 md:w-[200px] md:flex-col md:items-stretch md:justify-center md:p-5">
                          <div>
                            <p className="font-display text-3xl font-bold leading-none">
                              {formatMoney(t.base_session_rate, t.currency || "INR")}
                            </p>
                            <p className="mt-1 text-sm text-ink-3">
                              per session{t.rating_count ? `, ★ ${Number(t.rating_avg).toFixed(1)}` : ""}
                            </p>
                          </div>
                          <Link href={`/therapists/${t.user_id}`} className="btn btn-primary btn-sm relative z-10 md:w-full">
                            Book
                          </Link>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
