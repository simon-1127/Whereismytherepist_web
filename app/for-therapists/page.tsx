import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import Footer from "../../components/Footer";
import { SESSION_PRICE_RANGE } from "../../lib/pricing";
import { jsonLd, SITE_URL } from "../../lib/site";
import { POLICY, SESSION } from "../../lib/policy";

export const metadata = {
  title: "Join as a Therapist: Provider Onboarding",
  description:
    "Psychologists and counsellors in India: join Where's My Therapist, set your own price and hours, keep 78% of every session fee, and see exactly which documents to send for verification.",
  alternates: { canonical: "/for-therapists" },
};

const PARTNER_EMAIL = "partner@wheresmytherapist.com";

const STEPS = [
  {
    title: "Create a therapist account",
    body: "Sign up and choose “I’m a therapist”. Use the email you want clients’ booking notifications to reach. Google and Apple sign-in work too.",
  },
  {
    title: "Fill in your profile",
    body: `Right after signup you’ll see the profile form: photo, title, qualifications, licence or registration number, specialities, languages, approaches, bio and your price per session (${SESSION_PRICE_RANGE}).`,
  },
  {
    title: "Email your documents",
    body: `Send the documents listed below to ${PARTNER_EMAIL} from the same email address you signed up with, so we can match them to your account.`,
  },
  {
    title: "We verify you",
    body: "Our team checks your identity, qualifications and bank details. If anything is missing or unclear, we reply to your email.",
  },
  {
    title: "Set your hours and go live",
    body: "Once approved, add your weekly availability. Your profile appears in the directory and clients can book and pay for sessions straight away.",
  },
];

const DOCS: { group: string; items: [string, string?][] }[] = [
  {
    group: "Basic details",
    items: [
      ["Full name", "As it appears on your PAN card"],
      ["Email you signed up with"],
      ["Mobile number", "With WhatsApp, if you use it"],
      ["City and state"],
      ["Highest qualification", "Plus the university and year"],
      ["Licence or registration number", "RCI, NHA, state council or similar, or “in process”"],
    ],
  },
  {
    group: "Identity and tax",
    items: [
      ["Aadhaar card", "A masked Aadhaar from the UIDAI site is enough and safer"],
      ["PAN card", "Needed for payouts and TDS"],
    ],
  },
  {
    group: "Bank account for payouts",
    items: [
      ["Account holder name", "Must match your PAN"],
      ["Account number"],
      ["IFSC code"],
      ["Bank and branch name"],
      ["Cancelled cheque or passbook front page", "Optional, but it speeds up checks"],
    ],
  },
  {
    group: "Qualifications",
    items: [
      ["Degree certificates", "Master’s or equivalent"],
      ["Licence or registration certificate", "If you have one"],
      ["Clear headshot", "If you haven’t uploaded one to your profile"],
    ],
  },
];

const MAIL_SUBJECT = "Provider onboarding - [Your full name]";
const MAIL_BODY = `Hello Where's My Therapist team,

I've created my therapist account and filled in my profile. My details are below and my documents are attached.

Full name (as on PAN):
Email used to sign up:
Mobile:
City, state:
Highest qualification, university, year:
Licence / registration number:

Bank account holder name:
Account number:
IFSC:
Bank and branch:

Attached: Aadhaar (masked), PAN, degree certificate(s), licence certificate (if any).

Thank you,
`;

const FAQS = [
  {
    q: "Who can join?",
    a: "Psychologists, counselling psychologists and counsellors with a relevant postgraduate qualification. If your licence or registration is still in process, say so in your email; we review each case individually.",
  },
  {
    q: "How do I set my price?",
    a: `You choose your own price per session, anywhere from ${SESSION_PRICE_RANGE}. You can change it later from your profile.`,
  },
  {
    q: "How much do I earn per session?",
    a: `You keep ${POLICY.providerSharePct}% of the fee for every completed session; we keep ${POLICY.platformSharePct}% to cover payments, video calls, the platform and support. At ₹1,000 a session, you receive ₹780.`,
  },
  {
    q: "How long is a session?",
    a: `Every booking is a ${SESSION.slotMinutes}-minute slot: a ${SESSION.talkMinutes}-minute session with your client, then a ${SESSION.breakMinutes}-minute break before your next one. There are no shorter or longer formats.`,
  },
  {
    q: "What if my client doesn't show up?",
    a: `We check attendance automatically ${POLICY.attendanceCheckMinutes} minutes after the start. If you joined and your client didn't, the session counts as attended and you're paid in full.`,
  },
  {
    q: "What if I need to cancel?",
    a: `Life happens, so if you must cancel, do it as early as you can. If you cancel a confirmed booking or don't join, and the client then switches therapist or is refunded, you forfeit your ${POLICY.providerSharePct}% for that booking. If they reschedule with you and the session goes ahead, you're paid as normal.`,
  },
  {
    q: "Is it safe to email my Aadhaar and bank details?",
    a: "Send them only to partner@wheresmytherapist.com. A masked Aadhaar is enough. We use these documents only to verify you and pay you, and we will never ask for an OTP, password or UPI PIN.",
  },
  {
    q: "I already have a client account. Can I use it?",
    a: "Please create a separate therapist account with a different email address, so your own therapy and your practice stay apart.",
  },
];

export default function ForTherapistsPage() {
  const mailto = `mailto:${PARTNER_EMAIL}?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(MAIL_BODY)}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to join Where's My Therapist as a therapist",
          url: `${SITE_URL}/for-therapists`,
          step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body })),
        })}
      />
      <PageHeader
        title="Join as a therapist"
        description="Reach people across India who are looking for help in their own language. Set your own price and hours, keep 78% of every session fee, and let us take care of bookings, payments and video calls."
        aside={
          <Link href="/login?mode=signup&as=provider" className="btn btn-primary btn-lg btn-shine">
            Create therapist account
          </Link>
        }
      />

      <main className="shell space-y-16 py-14 md:space-y-24 md:py-20">
        <section aria-labelledby="earn-title">
          <h2 id="earn-title" data-reveal className="text-4xl font-bold md:text-5xl">How it works for you</h2>
          <div data-reveal-group className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="flex flex-col rounded-[var(--radius-sheet)] bg-brand p-7 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Your earnings</p>
              <p className="mt-3 font-display text-6xl font-bold leading-none">{POLICY.providerSharePct}%</p>
              <p className="mt-2 text-white/85">of every session fee is yours. We keep {POLICY.platformSharePct}% for payments, video, the platform and support.</p>
              <div className="mt-auto pt-6">
                <div className="flex h-3 overflow-hidden rounded-full bg-white/20" aria-hidden>
                  <span className="bg-white" style={{ width: `${POLICY.providerSharePct}%` }} />
                </div>
                <p className="mt-3 text-sm text-white/80">Example: a ₹1,000 session pays you <strong className="text-white">₹780</strong>.</p>
              </div>
            </div>
            <div className="card flex flex-col p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-violet">Session format</p>
              <p className="mt-3 font-display text-6xl font-bold leading-none">{SESSION.talkMinutes}<span className="text-3xl"> min</span></p>
              <p className="mt-2 text-ink-2">
                with your client, then a {SESSION.breakMinutes}-minute break before the next one. Every booking is a {SESSION.slotMinutes}-minute slot, so your
                calendar stays simple.
              </p>
              <div className="mt-auto flex gap-1 pt-6" aria-hidden>
                <span className="h-3 rounded-l-full bg-[#522cad]" style={{ width: `${(SESSION.talkMinutes / SESSION.slotMinutes) * 100}%` }} />
                <span className="h-3 flex-1 rounded-r-full bg-[#00b8bc]/50" />
              </div>
            </div>
            <div className="card flex flex-col p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-violet">Reliability</p>
              <p className="mt-3 font-display text-2xl font-bold leading-tight">Clients are trusting you with a hard moment. Please be there.</p>
              <ul className="mt-4 space-y-2.5 text-[15px] text-ink-2">
                <li className="flex gap-2.5"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />Join on time. Attendance is checked automatically {POLICY.attendanceCheckMinutes} minutes in.</li>
                <li className="flex gap-2.5"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />Client doesn&rsquo;t show? You&rsquo;re still paid.</li>
                <li className="flex gap-2.5"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />Our tech fails? You&rsquo;re never penalised.</li>
                <li className="flex gap-2.5"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose" />You cancel or don&rsquo;t join? You forfeit that booking&rsquo;s share if the client switches or is refunded.</li>
              </ul>
            </div>
          </div>
          <p className="mt-5 text-sm text-ink-3">
            Full details are in our <Link href="/terms#terms-4" className="link">provider terms</Link> and{" "}
            <Link href="/cancellation-refund-policy" className="link">cancellation and refund policy</Link>.
          </p>
        </section>

        <section>
          <h2 data-reveal className="text-4xl font-bold md:text-5xl">How onboarding works</h2>
          <ol data-reveal-group className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card p-6">
                <span className="text-brand font-display text-5xl font-bold leading-none">{i + 1}</span>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-[15px] text-ink-2 [overflow-wrap:anywhere]">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div>
            <h2 data-reveal className="text-4xl font-bold md:text-5xl">What to send us</h2>
            <p data-reveal className="mt-3 max-w-2xl text-lg text-ink-2">
              One email to <a href={`mailto:${PARTNER_EMAIL}`} className="link font-semibold">{PARTNER_EMAIL}</a> with the details
              below in the message and the documents attached as PDFs or clear photos.
            </p>
            <div data-reveal-group className="mt-8 grid gap-4 sm:grid-cols-2">
              {DOCS.map((d) => (
                <div key={d.group} className="card p-6">
                  <h3 className="text-lg font-semibold">{d.group}</h3>
                  <ul className="mt-4 space-y-3">
                    {d.items.map(([label, hint]) => (
                      <li key={label} className="flex gap-3">
                        <svg className="mt-1 h-4 w-4 shrink-0 text-brand-violet" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>
                          <span className="block text-[15px] font-semibold">{label}</span>
                          {hint && <span className="block text-[13px] text-ink-3">{hint}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[var(--radius-sheet)] bg-brand p-7 text-white lg:sticky lg:top-28 md:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Send to</p>
            <p className="mt-2 break-all font-display text-2xl font-semibold">{PARTNER_EMAIL}</p>
            <p className="mt-4 text-white/75">
              Subject: <span className="font-semibold text-white">Provider onboarding - your full name</span>
            </p>
            <a href={mailto} className="btn mt-6 w-full bg-white text-ink hover:bg-white/90">
              Open a pre-filled email
            </a>
            <ul className="mt-6 space-y-2.5 border-t border-white/20 pt-5 text-sm text-white/80">
              <li>Send from the email you signed up with.</li>
              <li>A masked Aadhaar is enough.</li>
              <li>We never ask for OTPs, passwords or your UPI PIN.</li>
            </ul>
          </aside>
        </section>

        <section>
          <h2 data-reveal className="text-4xl font-bold md:text-5xl">Questions therapists ask</h2>
          <dl data-reveal-group className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {FAQS.map((f) => (
              <div key={f.q} className="border-t-2 border-ink pt-5">
                <dt className="text-xl font-semibold">{f.q}</dt>
                <dd className="mt-2 text-ink-2">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="flex flex-col items-start gap-5 rounded-[var(--radius-sheet)] bg-white p-8 ring-1 ring-line md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Ready to start?</h2>
            <p className="mt-2 text-ink-2">Account first, then your profile, then one email. That&rsquo;s it.</p>
          </div>
          <Link href="/login?mode=signup&as=provider" className="btn btn-primary btn-lg">Create therapist account</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
