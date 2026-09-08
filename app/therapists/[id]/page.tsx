import { createClient } from "../../../lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BookingWidget from "../../../components/BookingWidget";
import { formatMoney, paiseToRupees } from "../../../lib/money";

// Ensure fresh data is fetched
export const revalidate = 0;

export default async function TherapistProfile({ params }: { params: Promise<{ id: string }> }) {
  // 1. Await the dynamic URL parameters (Next.js 15 requirement)
  const resolvedParams = await params;
  
  // 2. Initialize the server-side Supabase client (Passes your login cookies!)
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (userRow?.role === "provider") {
      redirect("/provider/dashboard");
    }
  }

  // 3. Fetch specific therapist profile using the ID from the URL, including
  // the joined lookup tables (languages, specialties, therapeutic approaches)
  // that the list/detail pages weren't surfacing before.
  const { data: therapist, error } = await supabase
    .from('provider_profiles')
    .select(`
      *,
      provider_languages ( languages ( id, name ) ),
      provider_specialties ( specialties ( id, name ) ),
      provider_approaches ( therapeutic_approaches ( id, name ) )
    `)
    .eq('user_id', resolvedParams.id)
    .single();

  const languages = (therapist?.provider_languages || [])
    .map((row: any) => row.languages)
    .filter(Boolean);
  const specialties = (therapist?.provider_specialties || [])
    .map((row: any) => row.specialties)
    .filter(Boolean);
  const approaches = (therapist?.provider_approaches || [])
    .map((row: any) => row.therapeutic_approaches)
    .filter(Boolean);

  const ageGroupLabels: Record<string, string> = {
    children: 'Children',
    teens: 'Teens',
    adults: 'Adults',
    all_ages: 'All Ages',
  };

  // If the ID is invalid, or the DB blocks the request, show a 404 page
  if (error || !therapist) {
    console.error("Error fetching profile:", error);
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-20 flex flex-col">
      
      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-8 mb-6 w-full flex-grow">
        {/* BREADCRUMBS */}
        <p className="text-sm text-slate-500 flex gap-2 items-center flex-wrap mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link> <span className="text-[10px]">▶</span> 
          <Link href="/therapists" className="hover:text-blue-600">Find a Therapist</Link> <span className="text-[10px]">▶</span> 
          <span className="text-[#1E1B4B] font-medium">{therapist.full_name || 'Provider Profile'}</span>
        </p>

        <div className="space-y-6">
          {/* TOP PROFILE CARD */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 relative overflow-hidden">
            
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="w-40 h-40 md:w-56 md:h-56 bg-indigo-50 rounded-2xl flex items-center justify-center text-5xl font-bold text-indigo-700 mb-4 overflow-hidden border border-indigo-100">
                 {therapist.photo_url ? (
                   <img src={therapist.photo_url} alt={therapist.full_name} className="w-full h-full object-cover" /> 
                 ) : (
                   therapist.full_name?.substring(0, 2).toUpperCase() || '??'
                 )}
              </div>
              {therapist.kyc_status === 'verified' && ( 
                <div className="absolute bottom-0 bg-white shadow-md rounded-full px-4 py-1.5 flex items-center gap-2 border border-slate-100 -mb-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                  <span className="text-xs font-bold text-emerald-700">Verified Therapist</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-[#1E1B4B] flex items-center gap-2 mb-1">
                {therapist.full_name || 'Unnamed Therapist'}
              </h1>
              <p className="text-lg text-slate-700 font-medium mb-1">{therapist.professional_title}</p>
              
              <div className="flex items-center gap-4 text-sm font-semibold text-[#1E1B4B] mb-6 mt-4">
                <span className="flex items-center gap-1"><span className="text-yellow-400 text-lg">★</span> {therapist.rating_avg || 'New'} <span className="text-slate-400 font-normal">({therapist.rating_count || 0} reviews)</span></span>
                <span className="text-slate-300">|</span>
                <span>{therapist.years_experience || 0} years experience</span>
              </div>

              <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-600 border-t border-slate-100 pt-6">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  {formatMoney(therapist.base_session_rate, therapist.currency)} / session
                </span>
                <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg text-xs">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  Online Sessions
                </span>
                {therapist.age_groups_served && therapist.age_groups_served.length > 0 && (
                  <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg text-xs">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4"></path></svg>
                    Works with {therapist.age_groups_served.map((g: string) => ageGroupLabels[g] || g).join(', ')}
                  </span>
                )}
              </div>

              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {specialties.map((s: any) => (
                    <span key={s.id} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-100">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Booking Card Area */}
            <BookingWidget
              providerId={therapist.user_id}
              providerName={therapist.full_name || "this therapist"}
              sessionRate={paiseToRupees(therapist.base_session_rate)}
              currency={therapist.currency || "INR"}
            />
          </div>

          {/* BOTTOM GRIDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 h-fit">
              
              <h3 className="text-lg font-bold text-[#1E1B4B] flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                About Me
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-8 whitespace-pre-wrap">
                {therapist.bio || "This provider has not added a bio yet."} 
              </p>

              <h3 className="text-lg font-bold text-[#1E1B4B] flex items-center gap-2 mb-4 pt-6 border-t border-slate-100">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                Approach
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-2 whitespace-pre-wrap">
                {therapist.approach_statement || "Not specified."} 
              </p>
              {approaches.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {approaches.map((a: any) => (
                    <span key={a.id} className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
                      {a.name}
                    </span>
                  ))}
                </div>
              )}

              {therapist.video_intro_url && (
                <>
                  <h3 className="text-lg font-bold text-[#1E1B4B] flex items-center gap-2 mb-4 pt-6 border-t border-slate-100">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    Video Introduction
                  </h3>
                  <video controls className="w-full rounded-2xl mb-8 bg-black max-h-[400px]">
                    <source src={therapist.video_intro_url} />
                  </video>
                </>
              )}

              {therapist.education_credentials && therapist.education_credentials.length > 0 && (
                  <>
                  <h3 className="text-lg font-bold text-[#1E1B4B] flex items-center gap-2 mb-4 pt-6 border-t border-slate-100">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>
                    Education
                  </h3>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                    {therapist.education_credentials.map((cred: string, index: number) => ( 
                      <li key={index}>{cred}</li>
                    ))}
                  </ul>
                  </>
              )}
            </div>

            {/* SIDEBAR FOR EXTRA INFO */}
            <div className="space-y-6">
              {languages.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-[#1E1B4B] flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.5 7a15.975 15.975 0 01-6.5 6.5" /></svg>
                    Languages Spoken
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((l: any) => (
                      <span key={l.id} className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                        {l.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-[#1E1B4B] flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  Safety & Security
                </h3>
                <div className="space-y-4 text-sm text-slate-600">
                  <p className="flex items-center gap-3"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Identity Verified</p>
                  <p className="flex items-center gap-3"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Credentials Checked</p>
                  <p className="flex items-center gap-3"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Secure Video Calling</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}