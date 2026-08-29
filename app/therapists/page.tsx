import { createClient } from "../../lib/supabase/server"; // Use the new server client
import Link from "next/link";
import Navbar from "../../components/Navbar";
import FilterSidebar from "../../components/FilterSidebar";

export default async function FindTherapist({ searchParams }: { searchParams: Promise<{ maxPrice?: string }> }) {
  // 1. Initialize the Server Client (This automatically passes your login cookies to Supabase!)
  const supabase = await createClient();
  const params = await searchParams; // Safely await modern Next.js searchParams

  // 2. Build the query
  let query = supabase
    .from('provider_profiles')
    .select('user_id, full_name, professional_title, years_experience, base_session_rate, currency, rating_avg, rating_count, photo_url');
    // I have temporarily removed the 'is_publicly_listed' filter below so your test draft data will show up. 
    // Uncomment this when you are ready for production!
    // .eq('is_publicly_listed', true);

  // 3. Apply the Price Filter if it exists in the URL
  if (params?.maxPrice) {
    query = query.lte('base_session_rate', parseInt(params.maxPrice));
  }

  // 4. Fetch the data
  const { data: therapists, error } = await query;

  if (error) console.error("Database error:", error);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-8 pb-20 w-full flex-grow">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E1B4B] mb-2">Find a Therapist</h1>
            <p className="text-slate-500">Connect with the right therapist for your needs.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* INTERACTIVE SIDEBAR */}
          <FilterSidebar />

          {/* THERAPIST LIST */}
          <div className="flex-1 space-y-5">
            <div className="flex justify-between items-center text-sm mb-2 px-2">
              <span className="font-semibold text-[#1E1B4B]">{therapists?.length || 0} therapists found</span>
            </div>

            {therapists && therapists.length > 0 ? (
              therapists.map((therapist) => (
                <div key={therapist.user_id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start hover:shadow-lg transition-all duration-300">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-indigo-50 shrink-0 overflow-hidden flex items-center justify-center text-indigo-700 text-3xl font-bold">
                    {therapist.photo_url ? <img src={therapist.photo_url} alt={therapist.full_name} className="w-full h-full object-cover" /> : (therapist.full_name?.substring(0, 2).toUpperCase() || '??')}
                  </div>
                  
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                      <div>
                        <h2 className="text-xl font-bold text-[#1E1B4B] flex items-center gap-2">
                          {therapist.full_name || 'Unnamed Therapist'} 
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full border border-emerald-200"><span className="w-2 h-2 bg-emerald-500 rounded-full inline-block mr-1"></span>Verified</span>
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">{therapist.professional_title}</p>
                      </div>
                      <div className="sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="font-bold text-[#1E1B4B]"><span className="text-yellow-400">★</span> {therapist.rating_avg || 'New'} <span className="text-xs text-slate-400 font-normal">({therapist.rating_count || 0})</span></p>
                        <p className="font-bold text-pink-600 mt-1">₹{therapist.base_session_rate || 0} <span className="text-xs text-slate-500 font-normal">/ session</span></p>
                      </div>
                    </div>

                    <div className="flex justify-between border-t border-slate-100 pt-5 mt-auto">
                      <div className="flex gap-4 text-xs font-medium text-slate-600">
                        <span className="bg-slate-100 px-3 py-1.5 rounded-lg">💼 {therapist.years_experience || 0} yrs exp</span>
                      </div>
                      <Link href={`/therapists/${therapist.user_id}`} className="bg-gradient-to-r from-blue-700 to-pink-500 text-white px-8 py-2.5 rounded-full text-sm font-bold hover:opacity-90">
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-200">
                <p className="font-semibold text-lg text-slate-700">No therapists found</p>
                <p className="text-sm mt-2">Try increasing your max price filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}