import { createClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";
import PhysioWaitlistForm from "../../components/PhysioWaitlistForm";
import Footer from "../../components/Footer";
import { Contours } from "../../components/PageHeader";
import Icon from "../../components/icons/Icon";
import type { PhysioEntry } from "../../lib/physio";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Physiotherapy at Home: Join the Waitlist",
  description:
    "Interested in physiotherapy at home for yourself or your loved ones? Join the Where's My Therapist waitlist and tell us your city and care needs. Sessions planned from ₹1,000.",
};

const FAQS = [
  {
    q: "Is home physiotherapy available everywhere in India right now?",
    a: "Not yet. This waitlist measures interest across India. Where we launch first depends on where people need it and where we can bring physiotherapists on board.",
  },
  { q: "Does joining the waitlist book a physiotherapist?", a: "No. It records your interest only. We'll contact you when there's an update for your city." },
  {
    q: "How much will a session cost?",
    a: "The planned starting price is ₹1,000 per session. Final pricing, any travel fee and service details will be confirmed before you book anything.",
  },
  { q: "Why are you asking for my city?", a: "City-level answers show us where demand is, so we know where to start. Please don't enter your full home address." },
];

const ENTRY_COLS = "name, contact, city, state, for_whom, timing, support, price_fit, note";

/**
 * Waitlist for a possible home-physiotherapy service. Open to everyone;
 * signed-out visitors are sent to sign up after joining. On sign-in, an
 * entry they made anonymously is attached to the account — only when the
 * account's verified email is exactly the contact they gave.
 */
async function claimAnonymousEntry(userId: string, email: string) {
  const exact = email.replace(/[\\%_]/g, (c) => `\\${c}`); // ilike without wildcards = case-insensitive equals
  const { error } = await createAdminClient()
    .from("physio_waitlist")
    .update({ user_id: userId })
    .is("user_id", null)
    .ilike("contact", exact);
  if (error && error.code !== "23505") console.error("physio waitlist claim failed:", error.message);
}

export default async function PhysiotherapyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existing: PhysioEntry | null = null;
  let fullName = "";
  if (user) {
    const own = () => supabase.from("physio_waitlist").select(ENTRY_COLS).eq("user_id", user.id).maybeSingle();
    let { data } = await own();
    if (!data && user.email && user.email_confirmed_at) {
      await claimAnonymousEntry(user.id, user.email);
      ({ data } = await own());
    }
    existing = (data as PhysioEntry) ?? null;
    const { data: profile } = await supabase.from("client_profiles").select("full_name").eq("user_id", user.id).maybeSingle();
    fullName = profile?.full_name || user.user_metadata?.full_name || "";
  }

  return (
    <>
      <main>
        <section className="shell pt-8 md:pt-12">
          <div className="relative overflow-hidden sheet px-6 py-12 md:px-14 md:py-16">
            <Contours className="pointer-events-none absolute -right-24 -top-10 h-[130%] w-auto md:right-0" />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-ink-2 shadow-sm ring-1 ring-line">
                  <span className="h-2 w-2 rounded-full bg-teal live-dot" />
                  Coming soon · Waitlist
                </p>
                <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.04] md:text-[3.8rem]">
                  Physiotherapy that comes <span className="text-brand">right to your home.</span>
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
                  We&rsquo;re exploring home physiotherapy for you and for elderly parents. Join the interest list and tell us where
                  you&rsquo;d like it to be available.
                </p>
                <p className="mt-5 font-display text-xl font-semibold">
                  Planned sessions from <span className="text-brand">₹1,000</span>
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <a href="#waitlist" className="btn btn-primary btn-lg btn-shine">{existing ? "See my answers" : "Join the waitlist →"}</a>
                  <span className="text-sm text-ink-3">Free to join. It doesn&rsquo;t book anything.</span>
                </div>
              </div>
              <div className="hidden rounded-[2.5rem] bg-[linear-gradient(145deg,var(--color-teal-soft),#ece4fb)] p-10 text-center lg:grid lg:min-h-[22rem] lg:place-items-center" aria-hidden>
                <div>
                  <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/80 text-brand-violet shadow-sm">
                    <Icon name="heart" className="h-10 w-10" />
                  </span>
                  <p className="mt-5 font-display text-xl font-semibold">Physiotherapy at home</p>
                  <p className="mt-1 text-ink-2">For you and the people you care about</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="waitlist" className="shell grid scroll-mt-24 gap-8 py-16 md:py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-teal">Help us plan the service</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Where should we bring home physiotherapy next?</h2>
            <p className="mt-4 text-ink-2">Your answers show us interest by city, who needs care, and what kind of support people are looking for.</p>
            <ul className="mt-5 space-y-2.5 text-ink-2">
              {[
                "Tell us your city so we can measure local demand.",
                "Say whether you're asking for yourself or a family member.",
                "Choose the kind of support you're interested in.",
                "Agree to hear from us when there's a launch update.",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-1 text-teal" aria-hidden>✓</span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="alert alert-warn mt-6">
              <strong>Privacy first:</strong> please don&rsquo;t share diagnoses, medical records or other sensitive health details in this form.
            </p>
          </div>
          <div className="sheet p-6 md:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-teal">Early access interest list</p>
            <h2 className="mt-2 text-3xl font-bold">Join the waitlist</h2>
            <p className="mb-6 mt-1 text-ink-3">It takes about a minute. Fields marked * are required.</p>
            <PhysioWaitlistForm existing={existing} signedIn={!!user} defaults={{ name: fullName, contact: user?.email || "" }} />
          </div>
        </section>

        <section className="shell pb-16 md:pb-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold md:text-4xl">Before you join</h2>
            <div className="mt-8 space-y-3">
              {FAQS.map((f) => (
                <details key={f.q} className="card group p-5">
                  <summary className="cursor-pointer list-none font-display text-lg font-semibold">
                    <span className="flex items-center justify-between gap-4">
                      {f.q}
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist-2 text-lg transition-transform group-open:rotate-45" aria-hidden>+</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-ink-3">Home physiotherapy depends on a future launch and on physiotherapists being available near you.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
