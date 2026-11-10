import Link from "next/link";
import { requireGenDoc } from "../../../lib/gendoc-server";
import { needsProfileSetup } from "../../../lib/gendoc";
import GenDocProfileForm from "../../../components/gendoc/GenDocProfileForm";
import { StatusBanner } from "../../../components/gendoc/GenDocBits";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your doctor profile" };

export default async function GenDocProfilePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { supabase, userId, profile } = await requireGenDoc("/gendoc/profile");
  const { data: allLanguages } = await supabase.from("languages").select("id, name").order("name");
  const onboarding = welcome === "1" || needsProfileSetup(profile);

  return (
    <main className="shell py-10 md:py-14">
      <div className="mx-auto max-w-3xl">
        {!onboarding && (
          <Link href="/gendoc" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-2 hover:text-ink">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
            Today&rsquo;s queue
          </Link>
        )}
        <header className="mb-8">
          <h1 className="text-[2.4rem] font-bold md:text-5xl">{onboarding ? "Set up your profile" : "Your doctor profile"}</h1>
          <p className="mt-2 text-lg text-ink-2">Employees see this before they join your queue.</p>
        </header>
        <div className="mb-6">
          <StatusBanner profile={profile} withLink={false} />
        </div>
        <div className="sheet p-6 md:p-10">
          <GenDocProfileForm
            profile={profile}
            userId={userId}
            allLanguages={allLanguages || []}
            onboarding={onboarding}
          />
        </div>
      </div>
    </main>
  );
}
