import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import FilterSidebar from "../../components/FilterSidebar";
import SortDropdown from "../../components/SortDropdown";
import Reveal from "../../components/Reveal";
import { formatMoney, rupeesToPaise } from "../../lib/money";

type SearchParams = {
  minPrice?: string;
  maxPrice?: string;
  specialties?: string;
  languages?: string;
  sort?: string;
};

export default async function FindTherapist({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (userRow?.role === "provider") {
      redirect("/provider/dashboard");
    }
  }

  // The directory is only shown to signed-in clients — logged-out visitors
  // get a sign-in prompt instead, and we skip all the therapist queries
  // below since there's nothing to render for them yet.
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col items-center justify-center px-5">
        <div className="enter max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 md:p-10 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1E1B4B] mb-3">Sign in to find a therapist</h1>
          <p className="text-slate-500 mb-8">
            Create a free account or sign in to browse our full directory of verified therapists and book a session.
          </p>
          <Link href="/login" className="inline-block bg-gradient-to-r from-blue-700 to-pink-500 text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-sm transition-all duration-300 hover:opacity-95 hover:shadow-lg hover:shadow-pink-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
            Sign In / Sign Up →
          </Link>
        </div>
      </div>
    );
  }

  // Lookup lists for the filter sidebar — small, cached-ish reads, fine to
  // run on every request.
  const [{ data: specialtyOptions }, { data: languageOptions }] = await Promise.all([
    supabase.from("specialties").select("id, name").order("name"),
    supabase.from("languages").select("id, name").order("name"),
  ]);

  const selectedSpecialtyIds = params?.specialties?.split(",").filter(Boolean) || [];
  const selectedLanguageIds = params?.languages?.split(",").filter(Boolean) || [];

  // Specialty/language filters live in join tables, so resolve them to a set
  // of matching provider ids first, then intersect if both are active.
  let providerIdFilter: string[] | null = null;

  if (selectedSpecialtyIds.length > 0) {
    const { data: rows } = await supabase
      .from("provider_specialties")
      .select("provider_id")
      .in("specialty_id", selectedSpecialtyIds);
    const ids = Array.from(new Set((rows || []).map((r) => r.provider_id)));
    providerIdFilter = providerIdFilter ? providerIdFilter.filter((id) => ids.includes(id)) : ids;
  }

  if (selectedLanguageIds.length > 0) {
    const { data: rows } = await supabase
      .from("provider_languages")
      .select("provider_id")
      .in("language_id", selectedLanguageIds);
    const ids = Array.from(new Set((rows || []).map((r) => r.provider_id)));
    providerIdFilter = providerIdFilter ? providerIdFilter.filter((id) => ids.includes(id)) : ids;
  }

  // No matches from the join-table filters means no results — short circuit
  // rather than sending an empty .in() (which Postgres reads as "match none"
  // in some drivers, but let's be explicit).
  const noPossibleMatches = providerIdFilter !== null && providerIdFilter.length === 0;

  let query = supabase
    .from("provider_profiles")
    .select(
      "user_id, full_name, professional_title, years_experience, base_session_rate, currency, rating_avg, rating_count, photo_url, kyc_status"
    );
    // .eq('is_publicly_listed', true); // uncomment when ready for production

  // The price slider UI works in whole rupees, but base_session_rate is
  // stored in paise — convert at this boundary before querying.
  if (params?.maxPrice) query = query.lte("base_session_rate", rupeesToPaise(params.maxPrice));
  if (params?.minPrice) query = query.gte("base_session_rate", rupeesToPaise(params.minPrice));
  if (providerIdFilter) query = query.in("user_id", providerIdFilter);

  switch (params?.sort) {
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

  const { data: therapists, error } = noPossibleMatches ? { data: [], error: null } : await query;

  if (error) console.error("Database error:", error);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">

      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-8 pb-20 w-full flex-grow">
        <div className="enter flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E1B4B] mb-2">Find a Therapist</h1>
            <p className="text-slate-500">Connect with the right therapist for your needs.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="enter" style={{ animationDelay: "80ms" }}>
            <FilterSidebar specialtyOptions={specialtyOptions || []} languageOptions={languageOptions || []} />
          </div>

          <div className="flex-1 space-y-5">
            <div className="flex justify-between items-center text-sm mb-2 px-2">
              <span className="font-semibold text-[#1E1B4B]">{therapists?.length || 0} therapists found</span>
              <SortDropdown />
            </div>

            {therapists && therapists.length > 0 ? (
              therapists.map((therapist, i) => (
                <Reveal key={therapist.user_id} delay={Math.min(i, 6) * 60}>
                  <div className="group bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100/60 hover:border-indigo-200 hover:-translate-y-1">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-indigo-50 shrink-0 overflow-hidden flex items-center justify-center text-indigo-700 text-3xl font-bold">
                      {therapist.photo_url ? (
                        <img
                          src={therapist.photo_url}
                          alt={therapist.full_name}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                      ) : (
                        therapist.full_name?.substring(0, 2).toUpperCase() || '??'
                      )}
                    </div>

                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                        <div>
                          <h2 className="text-xl font-bold text-[#1E1B4B] flex items-center gap-2">
                            {therapist.full_name || 'Unnamed Therapist'}
                            {therapist.kyc_status === 'verified' && (
                              <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full border border-emerald-200 flex items-center">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block mr-1"></span>Verified
                              </span>
                            )}
                          </h2>
                          <p className="text-sm text-slate-500 mt-1">{therapist.professional_title}</p>
                        </div>
                        <div className="sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-start sm:items-end w-full sm:w-auto transition-colors duration-300 group-hover:bg-indigo-50/60 group-hover:border-indigo-100">
                          <p className="font-bold text-[#1E1B4B] flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            {therapist.rating_avg || 'New'} <span className="text-xs text-slate-400 font-normal">({therapist.rating_count || 0})</span>
                          </p>
                          <p className="font-bold text-pink-600 mt-1">{formatMoney(therapist.base_session_rate, therapist.currency)} <span className="text-xs text-slate-500 font-normal">/ session</span></p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-5 mt-auto">
                        <div className="flex gap-4 text-xs font-medium text-slate-600">
                          <span className="bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors duration-300 group-hover:bg-indigo-100">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            {therapist.years_experience || 0} yrs exp
                          </span>
                        </div>
                        <Link
                          href={`/therapists/${therapist.user_id}`}
                          className="bg-gradient-to-r from-blue-700 to-pink-500 text-white px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-pink-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))
            ) : (
              <div className="enter text-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-200">
                <p className="font-semibold text-lg text-slate-700">No therapists found</p>
                <p className="text-sm mt-2">Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
