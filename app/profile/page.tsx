import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import ClientProfileForm from "../../components/ClientProfileForm";
import PlanManager, { type TierPrice } from "../../components/PlanManager";
import { Avatar } from "../../components/ui";
import Footer from "../../components/Footer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your profile" };

export default async function ClientProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; billing?: string; trial?: string }>;
}) {
  const requested = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/profile${requested.plan ? `?plan=${requested.plan}&billing=${requested.billing || "monthly"}${requested.trial ? `&trial=${requested.trial}` : ""}` : ""}`)}`);

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userRow?.role === "provider") redirect("/provider/profile");

  const { data: profile } = await supabase
    .from("client_profiles")
    .select("full_name, date_of_birth, ui_language, preferred_language, timezone, guardian_consent_completed_at, subscription_tier")
    .eq("user_id", user.id)
    .maybeSingle();

  const tierId = profile?.subscription_tier || "free";
  const { data: tierRows } = await supabase
    .from("subscription_tiers")
    .select("id, display_name, price_amount, price_amount_yearly")
    .in("id", ["starter", "growth"])
    .order("sort_order");
  const tiers: TierPrice[] = (tierRows || [])
    .filter((t) => t.price_amount)
    .map((t) => ({ id: t.id, name: t.display_name, monthly: t.price_amount, yearly: t.price_amount_yearly ?? null }));
  const planLabel = tierId === "free" ? "No plan" : tierId === "HR-Onboarding" ? "Via your organisation" : tierId;

  return (
    <>
    <main className="shell py-10 md:py-14">
      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-[var(--radius-sheet)] bg-brand p-7 text-white lg:sticky lg:top-28">
          <Avatar name={profile?.full_name || user.email} size={72} />
          <p className="mt-5 font-display text-2xl font-semibold leading-tight">{profile?.full_name || "Your account"}</p>
          <p className="mt-1 truncate text-white/60">{user.email}</p>
          <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-white/60">Plan</dt>
              <dd className="font-semibold capitalize">{planLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/60">Timezone</dt>
              <dd className="font-semibold">{profile?.timezone || "Asia/Kolkata"}</dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-white/55">
            Only you and the therapists you book can see your name. Your date of birth is never shown to anyone.
          </p>
        </aside>

        <div className="space-y-8">
        {profile ? (
          <PlanManager tiers={tiers} currentTier={tierId} email={user.email} requested={requested} />
        ) : requested.plan ? (
          <p className="alert alert-warn">Save your details below first, then you can choose your plan here.</p>
        ) : null}
        <section className="sheet p-6 md:p-10">
          <h1 className="text-4xl font-bold">{profile ? "Your details" : "A few details before you book"}</h1>
          <p className="mt-2 max-w-xl text-lg text-ink-2">
            This helps us suggest the right therapists and show times in your language.
          </p>
          <div className="mt-8">
            <ClientProfileForm
              userId={user.id}
              existingProfile={profile || null}
            />
          </div>
        </section>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}
