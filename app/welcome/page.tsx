import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { safeNext } from "../../lib/safe-next";
import ClientProfileForm from "../../components/ClientProfileForm";
import { Contours } from "../../components/PageHeader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your details", robots: { index: false } };

/**
 * Shown once, right after anyone signs up (email, Google or Apple), before
 * they reach the directory. The auth callback sends people here when their
 * client profile is missing.
 */
export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = safeNext(next, "/therapists");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/welcome")}`);

  const { data: userRow } = await supabase.from("users").select("role, phone").eq("id", user.id).single();
  if (userRow?.role === "provider") redirect("/provider/profile");

  const { data: profile } = await supabase
    .from("client_profiles")
    .select("full_name, date_of_birth, ui_language, preferred_language, timezone, guardian_consent_completed_at, subscription_tier")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile?.full_name && profile?.date_of_birth) redirect(target);

  const { data: tier } = await supabase
    .from("subscription_tiers")
    .select("allowed_language_codes")
    .eq("id", profile?.subscription_tier || "free")
    .maybeSingle();

  const meta = user.user_metadata || {};
  const defaultName: string = meta.full_name || meta.name || "";
  const first = defaultName.split(" ")[0];

  return (
    <main className="shell flex-1 py-8 md:py-12">
      <div className="mx-auto grid max-w-5xl overflow-hidden sheet lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="relative overflow-hidden bg-brand p-8 text-white md:p-10">
          <Contours className="pointer-events-none absolute -right-40 bottom-[-40%] h-[120%] text-white/20" mono />
          <ol className="relative flex items-center gap-2 text-sm font-semibold" aria-label="Setup progress">
            <li className="flex items-center gap-2 text-white/70">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20">✓</span> Account
            </li>
            <li aria-hidden className="h-px w-8 bg-white/40" />
            <li className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink">2</span> Your details
            </li>
          </ol>
          <p className="relative mt-10 font-display text-[2.2rem] font-semibold leading-[1.08] md:text-[2.6rem]">
            {first ? `Welcome, ${first}.` : "Welcome."} One last thing.
          </p>
          <p className="relative mt-4 max-w-sm text-white/75">
            Takes under a minute. Only you and the therapists you book see your name; your date of birth is never shown to
            anyone.
          </p>
        </aside>

        <section className="p-6 sm:p-10">
          <h1 className="text-4xl font-bold">Your details</h1>
          <p className="mt-2 max-w-xl text-lg text-ink-2">This helps us suggest the right therapists and keep your account safe.</p>
          <div className="mt-8">
            <ClientProfileForm
              userId={user.id}
              existingProfile={profile?.full_name && profile?.date_of_birth ? (profile as any) : null}
              allowedLanguageCodes={tier?.allowed_language_codes || null}
              afterSave={target}
              defaultName={defaultName}
              submitLabel="Save and continue"
              onboarding
              defaultPhone={(userRow as any)?.phone?.replace(/^\+91/, "") || ""}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
