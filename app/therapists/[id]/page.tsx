import type { Metadata } from "next";
import Link from "next/link";
import { jsonLd, SITE_URL } from "../../../lib/site";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import BookingWidget from "../../../components/BookingWidget";
import Footer from "../../../components/Footer";
import { Avatar } from "../../../components/ui";
import { formatMoney } from "../../../lib/money";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: t } = await supabase
    .from("provider_profiles")
    .select("full_name, professional_title, years_experience, base_session_rate, currency, bio")
    .eq("user_id", id)
    .maybeSingle();
  if (!t) return { title: "Therapist", robots: { index: false } };
  const name = t.full_name || "Therapist";
  const role = t.professional_title || "Therapist";
  return {
    title: `${name}, ${role}: Book Online Therapy`,
    description: `${name} is a ${role.toLowerCase()} with ${t.years_experience || 0} years of experience offering online therapy sessions in India from ${formatMoney(t.base_session_rate, t.currency || "INR")}. ${(t.bio || "").slice(0, 110)}`.trim(),
    alternates: { canonical: `/therapists/${id}` },
    openGraph: { type: "profile", title: `${name}, ${role}`, url: `/therapists/${id}` },
  };
}

const AGE_LABELS: Record<string, string> = { children: "children", teens: "teens", adults: "adults", all_ages: "all ages" };

export default async function TherapistProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (userRow?.role === "provider") redirect("/provider/dashboard");
  }

  const { data: t } = await supabase
    .from("provider_profiles")
    .select(
      `*, provider_languages ( languages ( id, name ) ), provider_specialties ( specialties ( id, name ) ), provider_approaches ( therapeutic_approaches ( id, name ) )`
    )
    .eq("user_id", id)
    .maybeSingle();

  if (!t) notFound();

  const languages = (t.provider_languages || []).map((r: any) => r.languages).filter(Boolean);
  const specialties = (t.provider_specialties || []).map((r: any) => r.specialties).filter(Boolean);
  const approaches = (t.provider_approaches || []).map((r: any) => r.therapeutic_approaches).filter(Boolean);
  const name: string = t.full_name || "Therapist";
  const first = name.split(" ")[0];
  const rate = formatMoney(t.base_session_rate, t.currency || "INR");
  const ages = (t.age_groups_served || []).map((g: string) => AGE_LABELS[g] || g);
  const verified = t.kyc_status === "verified";

  return (
    <>
      <main className="shell py-8 md:py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Person",
                name,
                jobTitle: t.professional_title || "Therapist",
                description: t.bio || undefined,
                image: t.photo_url || undefined,
                url: `${SITE_URL}/therapists/${t.user_id}`,
                knowsLanguage: languages.map((l: any) => l.name),
                knowsAbout: specialties.map((x: any) => x.name),
                hasCredential: (t.education_credentials || []).map((c: string) => ({ "@type": "EducationalOccupationalCredential", name: c })),
                worksFor: { "@id": `${SITE_URL}/#org` },
                makesOffer: {
                  "@type": "Offer",
                  name: "Online therapy session",
                  price: (t.base_session_rate || 0) / 100,
                  priceCurrency: t.currency || "INR",
                },
                ...(t.rating_count ? { aggregateRating: { "@type": "AggregateRating", ratingValue: Number(t.rating_avg).toFixed(1), reviewCount: t.rating_count } } : {}),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                  { "@type": "ListItem", position: 2, name: "Therapists", item: `${SITE_URL}/therapists` },
                  { "@type": "ListItem", position: 3, name, item: `${SITE_URL}/therapists/${t.user_id}` },
                ],
              },
            ],
          })}
        />
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-3">
          <Link href="/therapists" className="font-semibold text-ink-2 hover:text-ink">
            Therapists
          </Link>
          <span className="mx-2">/</span>
          <span>{name}</span>
        </nav>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
          <div className="contents space-y-6 lg:block">
            {/* Identity */}
            <section className="sheet relative order-1 overflow-hidden p-6 md:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
                <div className="relative w-fit">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={name} className="h-40 w-40 rounded-[32px] object-cover md:h-48 md:w-48" />
                  ) : (
                    <Avatar name={name} size={168} className="!rounded-[32px]" />
                  )}
                  {verified && (
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-teal px-3 py-1 text-[13px] font-semibold text-white">
                      Verified
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-[2.6rem] font-bold md:text-6xl">{name}</h1>
                  <p className="mt-2 text-lg text-ink-2">{t.professional_title || "Therapist"}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="chip">
                      {t.rating_count ? `★ ${Number(t.rating_avg).toFixed(1)} (${t.rating_count} reviews)` : "New on the platform"}
                    </span>
                    <span className="chip">{t.years_experience || 0} years of practice</span>
                    <span className="chip">Video sessions</span>
                    {ages.length > 0 && <span className="chip">Sees {ages.join(", ")}</span>}
                  </div>
                </div>
              </div>

              {t.approach_statement && (
                <blockquote className="mt-8 border-l-4 border-rose pl-5 font-display text-xl font-medium leading-snug text-ink md:text-2xl">
                  {t.approach_statement}
                </blockquote>
              )}
            </section>

            <section className="card order-3 p-6 md:p-8">
              <h2 className="text-2xl font-semibold">About {first}</h2>
              <p className="mt-3 max-w-[68ch] whitespace-pre-wrap text-[17px] leading-relaxed text-ink-2">
                {t.bio || `${first} hasn't written an introduction yet.`}
              </p>

              {specialties.length > 0 && (
                <>
                  <h3 className="mt-8 text-lg font-semibold">Can help with</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {specialties.map((s: any) => (
                      <span key={s.id} className="rounded-full bg-lilac px-3.5 py-1.5 text-sm font-semibold text-ink">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {approaches.length > 0 && (
                <>
                  <h3 className="mt-8 text-lg font-semibold">How {first} works</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {approaches.map((a: any) => (
                      <span key={a.id} className="chip">{a.name}</span>
                    ))}
                  </div>
                </>
              )}
            </section>

            {t.video_intro_url && (
              <section className="card order-3 overflow-hidden">
                <h2 className="px-6 pt-6 text-2xl font-semibold md:px-8">Meet {first}</h2>
                <video controls preload="metadata" className="mt-4 max-h-[460px] w-full bg-brand">
                  <source src={t.video_intro_url} />
                </video>
              </section>
            )}

            <div className="order-3 grid gap-6 md:grid-cols-2">
              <section className="card p-6">
                <h2 className="text-lg font-semibold">Languages</h2>
                <p className="mt-2 text-ink-2">{languages.length ? languages.map((l: any) => l.name).join(", ") : "Not listed yet"}</p>
              </section>
              <section className="card p-6">
                <h2 className="text-lg font-semibold">Training</h2>
                {t.education_credentials?.length ? (
                  <ul className="mt-2 space-y-1 text-ink-2">
                    {t.education_credentials.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-ink-2">Not listed yet</p>
                )}
                {t.license_no && <p className="mt-2 text-sm text-ink-3">Licence no. {t.license_no}</p>}
              </section>
            </div>
          </div>

          <div className="order-2 min-w-0 lg:sticky lg:top-28 lg:order-none">
            {user ? (
              <BookingWidget providerId={t.user_id} providerName={name} rateLabel={rate} />
            ) : (
              <div className="overflow-hidden card">
                <div className="bg-brand px-5 py-4 text-white">
                  <p className="font-display text-xl font-semibold">{rate} per session</p>
                </div>
                <div className="p-5">
                  <p className="text-ink-2">Sign in to see {first}&rsquo;s open times and book.</p>
                  <Link href={`/login?next=/therapists/${t.user_id}`} className="btn btn-primary mt-4 w-full">
                    Sign in to book
                  </Link>
                </div>
              </div>
            )}
            <ul className="mt-4 space-y-2 px-2 text-sm text-ink-2">
              <li className="flex gap-2"><Check /> Private, encrypted video call</li>
              <li className="flex gap-2"><Check /> Join from your browser or the app</li>
              <li className="flex gap-2"><Check /> Pay with UPI, card or netbanking</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Check() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
