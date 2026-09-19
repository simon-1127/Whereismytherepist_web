import Link from "next/link";
import { createClient } from "../lib/supabase/server";
import { formatMoney } from "../lib/money";
import TrustFooterBar from "../components/TrustFooterBar";
import AnxietyInfoSection from "../components/AnxietyInfoSection";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";

export const revalidate = 0;

export default async function Home() {
  // 1. Initialize the Server Client and check for an active session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 2. STATIC DUMMY DATA FOR THE LANDING PAGE TEASER
  const dummyTherapists = [
    { id: "login-required", initials: "SA", name: "Sana Ajaz", title: "Psychologist · Bangalore", rate: "₹700" },
    { id: "login-required", initials: "AM", name: "Dr. Aanya Mehta", title: "Clinical Psychologist · Delhi", rate: "₹900" },
    { id: "login-required", initials: "MI", name: "Meera Iyer", title: "Counsellor · Mumbai", rate: "₹800" },
    { id: "login-required", initials: "NV", name: "Nisha Verma", title: "Psychologist · Indore", rate: "₹600" },
  ];

  // 3. REAL DATA (Fetched only if the user is logged in)
  let displayTherapists = dummyTherapists;

  if (user) {
    const { data: realTherapists } = await supabase
      .from('provider_profiles')
      .select('user_id, full_name, professional_title, base_session_rate, currency, rating_avg, rating_count, photo_url')
      .limit(4);

    // Map the real database rows to match our card props
    if (realTherapists && realTherapists.length > 0) {
      displayTherapists = realTherapists.map(t => ({
        id: t.user_id,
        initials: t.full_name ? t.full_name.substring(0, 2).toUpperCase() : "??",
        name: t.full_name || "Unknown",
        title: t.professional_title || "Therapist",
        rate: formatMoney(t.base_session_rate, t.currency)
      }));
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-x-hidden flex flex-col">

      {/* --- HERO SECTION --- */}
      <section className="relative px-5 md:px-8 py-10 md:py-20 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-center w-full">

        {/* Soft decorative depth behind the hero — quiet, not a light show */}
        <div aria-hidden className="pointer-events-none absolute -top-10 -left-16 w-72 h-72 rounded-full bg-gradient-to-br from-blue-200/40 to-indigo-200/30 blur-3xl drift" />
        <div aria-hidden className="pointer-events-none absolute top-24 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-pink-200/40 to-rose-100/30 blur-3xl drift" style={{ animationDelay: "1.5s" }} />

        <div className="md:col-span-7 md:pr-8 text-center md:text-left order-2 md:order-1 relative">
          <h1 className="enter text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1E1B4B] leading-[1.1] mb-6 tracking-tight">
            Find the right therapist<br className="hidden md:block" />
            for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-pink-500">where you are</span> in life.
          </h1>
          <p className="enter text-base sm:text-lg text-slate-600 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed" style={{ animationDelay: "120ms" }}>
            Search by concern, city, language or therapy format. Compare therapist profiles and take the next step when you're ready.
          </p>

          {/* Dynamic Call-to-Action based on Auth State */}
          <div className="enter" style={{ animationDelay: "240ms" }}>
            {user ? (
              <Link href="/therapists" className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-700 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-bold shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
                Browse our full directory
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            ) : (
              <Link href="/login" className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-700 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-bold shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
                Sign up to find your therapist
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            )}
          </div>
        </div>

        {/* --- HERO GRAPHIC --- */}
        <div className="enter md:col-span-5 relative flex flex-col justify-center items-center order-1 md:order-2" style={{ animationDelay: "80ms" }}>
           <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(closest-side,rgba(99,102,241,0.16),rgba(236,72,153,0.10),transparent)] blur-2xl" />
           <img src="/logo_full.png" alt="Where's My Therapist" className="drift w-full max-w-[280px] sm:max-w-[360px] lg:max-w-[480px] h-auto object-contain drop-shadow-2xl z-10" />
           <div className="w-24 sm:w-32 md:w-40 h-2 sm:h-3 bg-slate-800/15 rounded-[100%] blur-[4px] -mt-2 md:-mt-4"></div>
        </div>
      </section>

      {/* --- THERAPIST PROFILES --- */}
      <Reveal className="px-4 sm:px-8 max-w-7xl mx-auto w-full mb-10 md:mb-16">
        <section className="py-10 md:py-16 px-4 sm:px-8 -mx-4 sm:-mx-8 bg-white rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-400 to-pink-500" />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
              {user ? "Explore therapist profiles" : "Top verified professionals"}
            </h2>
            {user && (
              <Link href="/therapists" className="group text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-1.5 z-20 relative">
                View all therapists
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayTherapists.map((therapist, i) => (
              <div
                key={i}
                className={`group border border-slate-200 rounded-2xl p-5 md:p-6 bg-white flex flex-col h-full transition-all duration-300 ${!user ? "opacity-60" : "hover:-translate-y-1 hover:shadow-xl hover:border-indigo-200"}`}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-indigo-100 text-indigo-700 shadow-sm shrink-0 transition-transform duration-300 ${user ? "group-hover:scale-110" : ""}`}>
                    {therapist.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-lg text-[#1E1B4B] tracking-tight">{therapist.name}</h3>
                    <p className="text-xs text-slate-500">{therapist.title}</p>
                  </div>
                </div>
                <div className="mt-auto space-y-4">
                  <div>
                    <p className="text-[11px] md:text-xs font-bold text-[#1E1B4B] mb-1.5">Starts at {therapist.rate} / session</p>
                  </div>

                  {/* Changes link based on authentication */}
                  {user ? (
                    <Link href={`/therapists/${therapist.id}`} className="w-full py-2.5 md:py-3 rounded-full border border-pink-200 text-pink-700 text-sm font-semibold hover:bg-pink-500 hover:text-white hover:border-pink-500 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2">
                      View profile <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                    </Link>
                  ) : (
                    <div className="w-full py-2.5 md:py-3 rounded-full border border-slate-200 text-slate-400 text-sm font-semibold flex items-center justify-center gap-2">
                      View profile
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* OVERLAY BANNER (Hidden if the user is logged in) */}
          {!user && (
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex flex-col items-center justify-end pb-16 z-10">
                <h3 className="text-2xl font-bold text-[#1E1B4B] mb-4">Unlock our full network of therapists</h3>
                <Link href="/login" className="bg-[#1E1B4B] text-white px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
                  Create a free account to search
                </Link>
            </div>
          )}
        </section>
      </Reveal>

      <Reveal><AnxietyInfoSection /></Reveal>

      <Reveal><TrustFooterBar /></Reveal>

      <Footer />

    </div>
  );
}
