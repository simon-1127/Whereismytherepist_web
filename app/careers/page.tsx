import PageHeader from "../../components/PageHeader";
import Footer from "../../components/Footer";

export const metadata = {
  title: 'Careers: Build Mental Healthcare for India',
  description: "Join a remote-first team building India's most accessible online therapy platform.",
  alternates: { canonical: '/careers' },
};

const CULTURE = [
  { title: "Real impact", desc: "Your code, design or clinical work directly affects how millions of Indians get help. No vanity metrics." },
  { title: "Ownership", desc: "We're a small team. You own your problems and make the calls. Flat hierarchy, real responsibility." },
  { title: "Remote-first", desc: "Work from anywhere in India. We're building for the whole country, so we hire from all of it." },
  { title: "Fair pay", desc: "Market-rate salaries, equity from day one and health insurance for you and your family." },
  { title: "Keep learning", desc: "A budget for courses, conferences and certifications. You grow with the company." },
  { title: "Mental health first", desc: "Flexible hours, mental health days and therapy subsidies for everyone. We practise what we build." },
];

const PERKS = [
  ["Salary and equity", "Market-rate pay, equity from day one"],
  ["Health insurance", "For you and your family"],
  ["Mental health days", "Take them, no explanation needed"],
  ["Learning budget", "₹2 lakh a year"],
  ["Work from anywhere", "Anywhere in India"],
  ["Tech budget", "The laptop and tools you need"],
  ["Flexible hours", "No time tracking, unlimited leave"],
  ["Parental leave", "Four months, fully paid"],
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        title="Help fix mental healthcare in India"
        description="We're a small, focused team building the most accessible mental health platform in the country. If impact matters most to you, talk to us."
      />
      <main className="shell space-y-16 py-16 md:space-y-24 md:py-24">
        <section>
          <h2 className="text-4xl font-bold md:text-5xl">What working here is like</h2>
          <ul data-reveal-group className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {CULTURE.map((c) => (
              <li key={c.title} className="border-t-2 border-ink pt-5">
                <h3 className="text-2xl font-semibold">{c.title}</h3>
                <p className="mt-2 text-ink-2">{c.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-8 rounded-[var(--radius-sheet)] bg-brand p-8 text-white md:grid-cols-[1.2fr_1fr] md:items-center md:p-12">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">No open roles listed right now</h2>
            <p className="mt-3 max-w-lg text-white/70">
              We&rsquo;re growing, and we&rsquo;d still like to hear from people who care about this. Tell us what you do and why it
              matters to you.
            </p>
          </div>
          <a href="mailto:manager@wheresmytherapist.com?subject=General%20application" className="btn btn-primary btn-lg justify-self-start md:justify-self-end">
            Send a general application
          </a>
        </section>

        <section>
          <h2 className="text-4xl font-bold md:text-5xl">Perks</h2>
          <dl data-reveal-group className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PERKS.map(([t, d]) => (
              <div key={t} className="card p-6">
                <dt className="font-display text-xl font-semibold">{t}</dt>
                <dd className="mt-1 text-ink-2">{d}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <Footer />
    </>
  );
}
