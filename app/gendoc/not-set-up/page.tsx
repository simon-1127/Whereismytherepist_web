import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getViewer } from "../../../lib/viewer";
import { Contours } from "../../../components/PageHeader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Doctor account not ready", robots: { index: false } };

/**
 * A gendoc login with no gendoc_profiles row. Rows are created by the HR
 * dashboard (the table has no INSERT policy), so a setup form here would
 * only fail on save. Say what happens next instead.
 */
export default async function GenDocNotSetUpPage() {
  const { user, role } = await getViewer();
  if (!user || role !== "gendoc") redirect("/");

  const supabase = await createClient();
  const { data: row } = await supabase.from("gendoc_profiles").select("user_id").eq("user_id", user.id).maybeSingle();
  if (row) redirect("/gendoc");

  return (
    <main className="shell flex flex-1 items-center justify-center py-16">
      <div className="sheet relative w-full max-w-xl overflow-hidden p-8 md:p-12">
        <Contours className="pointer-events-none absolute -right-28 -top-16 h-[150%] text-lilac" />
        <div className="relative">
          <p className="text-sm font-semibold text-brand-violet">Company doctor account</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Your doctor profile isn&rsquo;t ready yet</h1>
          <p className="mt-4 text-lg text-ink-2">
            Doctor accounts are set up by the organisation you consult for, not from this site. Once your HR team adds your
            profile, your consultation queue appears here the next time you sign in.
          </p>
          <div className="well mt-6 p-5 text-[15px] text-ink-2">
            <p className="font-semibold text-ink">What to do</p>
            <p className="mt-1">
              Ask your HR contact to finish setting up your doctor profile for <strong className="text-ink">{user.email}</strong>.
              If you think this is a mistake, write to{" "}
              <a href="mailto:support@wheresmytherapist.com" className="link">support@wheresmytherapist.com</a>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
