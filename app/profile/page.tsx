import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import ClientProfileForm from "../../components/ClientProfileForm";

export const revalidate = 0;

export default async function ClientProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userRow?.role === "provider") {
    redirect("/provider/dashboard");
  }

  const { data: existingProfile } = await supabase
    .from("client_profiles")
    .select(
      "full_name, date_of_birth, ui_language, preferred_language, timezone, guardian_consent_completed_at, subscription_tier"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  // Some tiers (e.g. free) restrict which session languages are selectable —
  // look up the current tier's allowed_language_codes so the dropdown only
  // offers valid choices (matches the DB trigger's enforcement). Brand-new
  // clients without a profile yet default to the 'free' tier.
  const tierId = existingProfile?.subscription_tier || "free";
  const { data: tierRow } = await supabase
    .from("subscription_tiers")
    .select("allowed_language_codes")
    .eq("id", tierId)
    .maybeSingle();
  const allowedLanguageCodes: string[] | null = tierRow?.allowed_language_codes || null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
      <div className="max-w-lg mx-auto px-5 md:px-8 py-10 w-full flex-grow">
        <h1 className="text-2xl font-extrabold text-[#1E1B4B] mb-1">
          {existingProfile ? "Edit your profile" : "Complete your profile"}
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          This helps us match you with the right therapist and personalize your experience.
        </p>

        <ClientProfileForm
          userId={user.id}
          existingProfile={existingProfile || null}
          allowedLanguageCodes={allowedLanguageCodes}
        />
      </div>
    </div>
  );
}
