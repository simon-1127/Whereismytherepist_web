import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import ProviderProfileForm from "../../../components/provider/ProviderProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your therapist profile" };

export default async function ProviderProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/provider/profile");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userRow?.role !== "provider") {
    return (
      <main className="shell flex flex-1 items-center justify-center py-20">
        <div className="sheet max-w-lg p-8 text-center">
          <h1 className="text-3xl font-bold">This page is for therapists</h1>
          <p className="mt-3 text-ink-2">
            This account is set up for booking therapy. To join as a therapist, create a separate therapist account with a
            different email.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/for-therapists" className="btn btn-primary">How to join</Link>
            <Link href="/" className="btn btn-quiet">Go home</Link>
          </div>
        </div>
      </main>
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

  const onboarding = !existingProfile || existingProfile.application_status === "draft";

  return (
    <main className="shell py-10 md:py-14">
      <div className="mx-auto max-w-3xl">
        {onboarding ? (
          <ol className="mb-6 flex items-center gap-3 text-sm font-semibold" aria-label="Setup progress">
            <li className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-white">1</span> Your profile</li>
            <li aria-hidden className="h-px flex-1 bg-line" />
            <li className="flex items-center gap-2 text-ink-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-mist-2">2</span> Payouts</li>
          </ol>
        ) : (
          <Link href="/provider/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-2 hover:text-ink">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
            Dashboard
          </Link>
        )}
        <header className="mb-8">
          <h1 className="text-[2.4rem] font-bold md:text-5xl">{onboarding ? "Set up your profile" : "Your public profile"}</h1>
          <p className="mt-2 text-lg text-ink-2">This is what clients read before they book you.</p>
        </header>
        {onboarding && (
          <div className="mb-6 flex flex-col gap-4 rounded-[24px] bg-lilac p-5 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div>
              <p className="font-display text-lg font-semibold">Two steps to go live</p>
              <p className="mt-1 text-[15px] text-ink-2">
                1. Fill in your profile below. 2. Email your ID, PAN and bank details to{" "}
                <a href="mailto:partner@wheresmytherapist.com" className="link">partner@wheresmytherapist.com</a> so we can verify you.
              </p>
            </div>
            <Link href="/for-therapists" className="btn btn-quiet btn-sm shrink-0">What to send</Link>
          </div>
        )}
        <div className="sheet p-6 md:p-10">
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
    </main>
  );
}
