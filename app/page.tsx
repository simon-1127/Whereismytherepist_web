import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { formatMoney } from "../lib/money";
import Footer from "../components/Footer";
import ContourMap from "../components/home/ContourMap";
import AboutAppSection from "../components/AboutAppSection";
import ComparisonTableSection from "../components/ComparisonTableSection";
import PricingSection from "../components/PricingSection";
import AnxietyInfoSection from "../components/AnxietyInfoSection";
import TrustFooterBar from "../components/TrustFooterBar";
import AppZone from "../components/home/AppZone";
import { Avatar } from "../components/ui";
import FaqSection from "../components/home/FaqSection";
import ReachSection from "../components/home/ReachSection";
import SocialSection from "../components/home/SocialSection";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "../lib/site";

export const metadata = {
  title: { absolute: DEFAULT_TITLE },
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

// Our own therapists, shown to everyone. Signed-in visitors see live
// directory profiles instead (falls back to these if the query is empty).
const FEATURED = [
  { id: "inayat", name: "Inayat Ranjit Pardeshi", title: "Counsellor, Ph.D.", rate: "₹700", photo: "/therapists/inayat.jpg", tags: ["Couples", "Adolescents"], years: 9, langs: "English, Hindi, Marathi, Urdu +2" },
  { id: "janani", name: "Janani SV", title: "Counsellor & psychotherapist", rate: "₹1,000", photo: "/therapists/janani.jpg", tags: ["Relationships", "Parenting"], years: 8, langs: "English, Tamil" },
  { id: "atifa", name: "Atifa Khatoon", title: "Clinical psychologist", rate: "₹600", photo: "/therapists/atifa.jpg", tags: ["Anxiety", "Relationships"], years: 4, langs: "English, Hindi" },
  { id: "rashmi", name: "Rashmi Rekha Das", title: "Counselling psychologist", rate: "₹600", photo: "/therapists/rashmi.jpg", tags: ["CBT", "REBT"], years: 6, langs: "English, Hindi, Assamese" },
  { id: "unnati", name: "Unnati Nihalani", title: "Clinical psychologist", rate: "₹1,000", photo: "/therapists/unnati.jpg", tags: ["Anxiety", "Self-esteem"], years: 2, langs: "English, Hindi" },
  { id: "neha", name: "Neha Agrawal", title: "Counselling psychologist & life coach", rate: "₹1,000", photo: "/therapists/neha.jpg", tags: ["Life coaching", "Personal growth"], years: 11, langs: "Hindi, English" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const STEPS = [
  {
    title: "Say what's going on",
    body: "Filter by what you need help with, the language you think in and what you can spend. No intake forms first.",
  },
  {
    title: "Compare real profiles",
    body: "See each therapist's training, approach, languages and price per session, side by side.",
  },
  {
    title: "Book and talk",
    body: "Pick a time, pay with UPI or card, and join a private video call from your browser or the app.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: row } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (row?.role === "provider") redirect("/provider/dashboard");
  }

  // New order on every page load (the page is rendered per request).
  let featured: Tile[] = shuffle(FEATURED);
  let live = false;
  if (user) {
    const { data } = await supabase
      .from("provider_profiles")
      .select("user_id, full_name, professional_title, years_experience, base_session_rate, currency, photo_url, provider_specialties ( specialties ( name ) )")
      .order("rating_count", { ascending: false, nullsFirst: false })
      .limit(6);
    if (data?.length) {
      featured = data.map((t: any) => ({
        id: t.user_id,
        name: t.full_name || "Therapist",
        title: t.professional_title || "Therapist",
        rate: formatMoney(t.base_session_rate, t.currency || "INR"),
        photo: t.photo_url,
        tags: (t.provider_specialties || []).map((r: any) => r.specialties?.name).filter(Boolean).slice(0, 2),
        years: t.years_experience,
      }));
      live = true;
    }
  }

  return (
    <>
      <main>
        {/* HERO — full-bleed, runs up behind the (transparent) navbar */}
        <section className="relative isolate -mt-[77px] overflow-hidden pt-[77px]">
          {/* Logo-colour wash so the first screen never reads as empty white */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#eef9fb_0%,#f3f0ff_55%,#f5f7fc_100%)]" />
          <div aria-hidden className="absolute -left-32 -top-24 -z-10 h-[34rem] w-[34rem] rounded-full bg-[#00b8bc]/25 blur-[110px]" />
          <div aria-hidden className="absolute right-[-10rem] top-10 -z-10 h-[36rem] w-[36rem] rounded-full bg-[#522cad]/20 blur-[120px]" />
          <div aria-hidden className="absolute bottom-[-12rem] left-1/3 -z-10 h-[28rem] w-[28rem] rounded-full bg-[#ff5266]/15 blur-[110px]" />

          <div className="shell grid items-center gap-4 lg:grid-cols-[1.05fr_1fr]">
            <div className="hero-copy relative z-10 pb-6 pt-10 md:pt-14 lg:pb-16">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-ink-2 shadow-sm ring-1 ring-line backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-teal live-dot" />
                Licensed therapists, online across India
              </p>
              <h1 className="mt-6 text-[2.8rem] font-bold leading-[1.02] sm:text-6xl lg:text-[4.4rem]">
                Find a therapist for where you are <span className="text-brand">right now.</span>
              </h1>
              <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-2 md:text-xl">
                Search by what you&rsquo;re going through, the language you speak and what you can afford. Book a private video
                session and pay with UPI.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={user ? "/therapists" : "/login?mode=signup&next=/therapists"} className="btn btn-primary btn-lg btn-shine">
                  {user ? "Browse therapists" : "Find my therapist"}
                </Link>
                {user ? (
                  <Link href="/sessions" className="btn btn-quiet btn-lg">My sessions</Link>
                ) : (
                  <Link href="#how" className="btn btn-quiet btn-lg">How it works</Link>
                )}
              </div>
              <ul className="mt-9 grid max-w-xl grid-cols-[0.8fr_1.35fr_0.8fr] gap-2 text-sm sm:grid-cols-3 sm:gap-3" aria-label="Why people choose us">
                {[
                  ["10", "Indian languages"],
                  ["₹500–1,200", "per session"],
                  ["3 weeks", "free app trial"],
                ].map(([big, small]) => (
                  <li key={small} className="rounded-2xl bg-white/70 px-3 py-3 ring-1 ring-line backdrop-blur sm:px-4">
                    <span className="text-brand block whitespace-nowrap font-display text-lg font-bold leading-none sm:text-2xl">{big}</span>
                    <span className="mt-1 block text-ink-3">{small}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative h-[380px] sm:h-[460px] lg:h-[620px]">
              <ContourMap className="absolute inset-0 h-full w-full" />
              {/* The pin lands on the map */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="hero-pin grid h-48 w-48 place-items-center rounded-full bg-white shadow-[var(--shadow-float)] ring-1 ring-line md:h-56 md:w-56">
                  <img src="/favicon.png" alt="Where's My Therapist" className="h-32 w-32 object-contain md:h-40 md:w-40" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS — a real sequence, so it's numbered */}
        <section id="how" className="shell scroll-mt-28 py-16 md:py-24">
          <h2 data-reveal className="max-w-2xl text-4xl font-bold md:text-5xl">From searching to talking, in three steps</h2>
          <ol data-reveal-group className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative card p-7">
                <span className="text-brand font-display text-6xl font-bold leading-none">{i + 1}</span>
                <h3 className="mt-5 text-2xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* THERAPISTS — real profiles when signed in, showcase behind a prompt when not */}
        <section className="shell pb-16 md:pb-24">
          <div data-reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-xl text-4xl font-bold md:text-5xl">
              Meet some of our therapists
            </h2>
            {user && (
              <Link href="/therapists" className="btn btn-quiet">See all therapists</Link>
            )}
          </div>

          <ul data-reveal-group className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => (
              <li key={t.id}>
                <TherapistTile t={t} href={live ? `/therapists/${t.id}` : user ? "/therapists" : "/login?mode=signup&next=/therapists"} />
              </li>
            ))}
          </ul>

          {!user && (
            <div data-reveal className="mt-10 flex flex-col items-center gap-4 rounded-[28px] bg-white px-6 py-8 text-center ring-1 ring-line sm:flex-row sm:justify-between sm:text-left md:px-10">
              <div>
                <h3 className="text-2xl font-bold">Book any of them in a few minutes</h3>
                <p className="mt-1 text-ink-2">Create a free account to see their open times and the rest of our network.</p>
              </div>
              <Link href="/login?mode=signup&next=/therapists" className="btn btn-primary shrink-0">Create a free account</Link>
            </div>
          )}
        </section>

        <TrustFooterBar />
        <AnxietyInfoSection />
        <ReachSection signedIn={!!user} />
        <FaqSection />
        <SocialSection />

        {/* The app: features, comparison and plans on their own dark canvas */}
        <AppZone>
          <AboutAppSection />
          <ComparisonTableSection />
          <PricingSection />
        </AppZone>
      </main>
      <Footer />
    </>
  );
}

type Tile = { id: string; name: string; title: string; rate: string; photo?: string | null; tags: string[]; years?: number; langs?: string };

function TherapistTile({ t, href }: { t: Tile; href: string }) {
  return (
    <Link href={href} className="card card-hover flex h-full flex-col overflow-hidden">
      <div className="h-20 bg-brand-soft" aria-hidden />
      <div className="-mt-12 flex flex-1 flex-col px-5 pb-5">
        <Avatar name={t.name} src={t.photo} size={88} className="ring-4 ring-white" />
        <p className="mt-3 font-display text-xl font-semibold leading-tight">{t.name}</p>
        <p className="text-sm text-ink-3">{t.title}{t.years ? `, ${t.years} yrs` : ""}</p>
        {t.langs && <p className="mt-1 text-[13px] text-ink-3">Speaks {t.langs}</p>}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {t.tags.map((tag) => (
            <span key={tag} className="chip">{tag}</span>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between pt-5">
          <p>
            <span className="font-display text-2xl font-bold">{t.rate}</span>
            <span className="text-sm text-ink-3"> /session</span>
          </p>
          <span className="text-sm font-semibold text-brand-violet">Book</span>
        </div>
      </div>
    </Link>
  );
}
