import PageHeader from "../../components/PageHeader";
import Footer from "../../components/Footer";
import { CookieSettingsLink } from "../../components/CookieConsent";

export const metadata = {
  title: "Cookie Policy",
  description: "Which cookies Where's My Therapist uses, why, how long they last, and how to change your choice.",
  alternates: { canonical: "/cookies" },
};

type Row = { name: string; provider: string; purpose: string; duration: string };

const GROUPS: { title: string; when: string; rows: Row[] }[] = [
  {
    title: "Essential",
    when: "Always on. The site can't work without these, so they don't need consent.",
    rows: [
      { name: "sb-…-auth-token", provider: "Where's My Therapist (Supabase)", purpose: "Keeps you signed in and protects your account. May be split into .0 / .1 parts.", duration: "Until you sign out (refreshed while you use the site)" },
      { name: "wmt_consent", provider: "Where's My Therapist", purpose: "Remembers your cookie choices so we don't ask on every visit.", duration: "180 days" },
      { name: "Razorpay checkout cookies", provider: "Razorpay", purpose: "Set only while you pay. Used for payment security and fraud prevention.", duration: "Session to 1 year, set by Razorpay" },
      { name: "Daily.co call cookies", provider: "Daily.co", purpose: "Set only inside a video session, to connect and keep the call stable.", duration: "Session" },
    ],
  },
  {
    title: "Analytics",
    when: "Only if you allow them.",
    rows: [
      { name: "_ga", provider: "Google Analytics", purpose: "Tells visits apart so we can count how many people use each page.", duration: "2 years" },
      { name: "_ga_7YGYQEECPC", provider: "Google Analytics", purpose: "Keeps track of a visit (session) for the reports above.", duration: "2 years" },
    ],
  },
  {
    title: "Marketing",
    when: "Only if you allow them.",
    rows: [
      { name: "_gcl_au", provider: "Google Ads", purpose: "Measures whether someone who clicked one of our ads went on to sign up.", duration: "90 days" },
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <PageHeader title="Cookie policy" description="Last updated 1 October 2026. What we store in your browser, why, and how to change your mind." />
      <main className="shell max-w-[960px] space-y-8 py-12 md:py-16">
        <section className="card p-6 md:p-8">
          <h2 className="text-2xl font-semibold">The short version</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-2 marker:text-brand-violet">
            <li>Essential cookies keep you signed in and let you pay and join calls. They&rsquo;re always on.</li>
            <li>Analytics and marketing cookies are off until you say yes, and you can switch them off again any time.</li>
            <li>We never put your health information, therapy topics or session details into cookies, and never use them for advertising.</li>
            <li>We follow India&rsquo;s Digital Personal Data Protection Act, 2023: consent is optional, specific and easy to withdraw.</li>
          </ul>
          <div className="mt-6">
            <CookieSettingsLink className="btn btn-primary btn-sm" />
          </div>
        </section>

        {GROUPS.map((g) => (
          <section key={g.title} className="card overflow-hidden">
            <div className="p-6 md:px-8">
              <h2 className="text-2xl font-semibold">{g.title}</h2>
              <p className="mt-1 text-ink-2">{g.when}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[15px]">
                <thead className="bg-mist text-sm text-ink-3">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-semibold md:px-8">Cookie</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Set by</th>
                    <th scope="col" className="px-4 py-3 font-semibold">What it&rsquo;s for</th>
                    <th scope="col" className="px-4 py-3 font-semibold md:pr-8">How long</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r) => (
                    <tr key={r.name} className="border-t border-line align-top">
                      <td className="px-6 py-4 font-mono text-[13px] font-semibold md:px-8">{r.name}</td>
                      <td className="px-4 py-4 text-ink-2">{r.provider}</td>
                      <td className="px-4 py-4 text-ink-2">{r.purpose}</td>
                      <td className="px-4 py-4 text-ink-2 md:pr-8">{r.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        <section className="card p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Changing or clearing cookies</h2>
          <p className="mt-3 text-ink-2">
            Use &ldquo;Cookie settings&rdquo; at the bottom of any page to change your choice. Turning analytics or marketing off
            also deletes the cookies they set. You can clear all cookies in your browser settings too, though you&rsquo;ll be signed
            out. Questions: <a className="link" href="mailto:support@wheresmytherapist.com">support@wheresmytherapist.com</a>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
