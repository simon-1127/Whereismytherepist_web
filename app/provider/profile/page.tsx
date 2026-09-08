import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProviderProfileForm from "../../../components/provider/ProviderProfileForm";

export const revalidate = 0;

export default async function ProviderProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();

  // There is no in-app path to become a provider — accounts are provisioned
  // by an admin directly in the database. If someone without that role
  // lands here (e.g. by guessing the URL), block them here rather than
  // relying on RLS alone to fail their writes silently.
  if (userRow?.role !== "provider") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
        <div className="max-w-lg mx-auto text-center py-24 px-6">
          <p className="text-slate-700 font-semibold text-lg mb-2">This page is for providers only</p>
          <p className="text-slate-500 text-sm mb-6">
            Provider accounts are set up by our team. If you're a therapist looking to join, please
            get in touch with us.
          </p>
          <Link href="/" className="text-blue-700 font-semibold text-sm">← Back home</Link>
        </div>
      </div>
    );
  }

  const [
    { data: existingProfile },
    { data: allLanguages },
    { data: allApproaches },
    { data: allSpecialties },
    { data: myLanguages },
    { data: myApproaches },
    { data: mySpecialties },
  ] = await Promise.all([
    supabase.from("provider_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("languages").select("id, name").order("name"),
    supabase.from("therapeutic_approaches").select("id, name").order("name"),
    supabase.from("specialties").select("id, name").order("name"),
    supabase.from("provider_languages").select("language_id").eq("provider_id", user.id),
    supabase.from("provider_approaches").select("approach_id").eq("provider_id", user.id),
    supabase.from("provider_specialties").select("specialty_id").eq("provider_id", user.id),
  ]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-10 w-full flex-grow">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-extrabold text-[#1E1B4B]">
            {existingProfile ? "Edit your provider profile" : "Set up your provider profile"}
          </h1>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            🛡️ Your information is secure
          </span>
        </div>
        <div className="flex items-center gap-2 mb-8">
          <span className="w-7 h-7 rounded-full bg-[#1E1B4B] text-white text-xs flex items-center justify-center font-bold">1</span>
          <div className="h-px bg-slate-300 flex-1" />
          <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 text-xs flex items-center justify-center font-bold">2</span>
        </div>

        <ProviderProfileForm
          userId={user.id}
          existingProfile={existingProfile || null}
          allLanguages={allLanguages || []}
          allApproaches={allApproaches || []}
          allSpecialties={allSpecialties || []}
          initialSelectedLanguageIds={(myLanguages || []).map((r) => r.language_id)}
          initialSelectedApproachIds={(myApproaches || []).map((r) => r.approach_id)}
          initialSelectedSpecialtyIds={(mySpecialties || []).map((r) => r.specialty_id)}
        />
      </div>
    </div>
  );
}
