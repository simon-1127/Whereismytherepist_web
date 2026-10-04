import PageHeader from "../../components/PageHeader";
import Footer from "../../components/Footer";
import Icon from "../../components/icons/Icon";

export const metadata = {
  title: 'About Us: Affordable Mental Healthcare for India',
  description: "Where's My Therapist makes therapy affordable, easy to find and available in 10 Indian languages. Meet the team and why we started.",
  alternates: { canonical: '/about' },
};

const VALUES: { icon: "rupee" | "beaker" | "heart" | "shield-check"; title: string; desc: string }[] = [
  {
    icon: "rupee",
    title: "Equity First",
    desc: "We price for actual Indian incomes. We support 10 languages. We accept UPI, not just credit cards. There's no \"economy tier\" where you get less care — everyone gets the same clinical rigor.",
  },
  {
    icon: "beaker",
    title: "Evidence-Backed",
    desc: "Our AI is trained on CBT, DBT, and ACT. Our therapists are licensed. Our features are designed with clinical input, not marketing noise. We measure outcomes because mental health is serious.",
  },
  {
    icon: "heart",
    title: "Destigmatizing",
    desc: "Mental illness is an illness. Full stop. We talk about it like we talk about diabetes. We build tools that normalize therapy. And we never, ever judge someone for getting help.",
  },
  {
    icon: "shield-check",
    title: "Privacy Sacred",
    desc: "Your mental health data is the most sensitive data about you. We encrypt it, we never sell it, and we comply with applicable Indian privacy law. Full stop.",
  },
];

const IMPACT_STATS = [
  { value: "10", label: "Indian Languages", sub: "Full UI and provider support" },
  { value: "3 weeks", label: "Free Trial", sub: "Full Starter plan before you pay" },
  { value: "13", label: "Unique Features", sub: "More than any competitor in India" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="Building mental healthcare that actually works for India"
        description="We're therapists, engineers and advocates who think mental health support should be affordable, easy to find and available in your language."
      />

      <main className="shell space-y-16 py-16 md:space-y-24 md:py-24">
        <section data-reveal className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <h2 className="text-4xl font-bold md:text-5xl">Why we exist</h2>
          <div className="space-y-5 text-lg leading-relaxed text-ink-2">
            <p>
              197 million Indians need mental healthcare. 48 million get it. Most pay out of pocket because insurance barely covers
              it, and almost all of it happens in English, a language only about 10% of India speaks fluently at home.
            </p>
            <p>
              So we built one place with an AI companion you name yourself, licensed therapists for real clinical care, and a
              community that understands, in 10 Indian languages, paid for the way you already pay, at prices that fit Indian
              salaries.
            </p>
            <p className="border-l-4 border-rose pl-5 font-display text-2xl font-medium leading-snug text-ink">
              Every decision starts with one question: could a family earning ₹20,000 a month afford this?
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-4xl font-bold md:text-5xl">What we hold ourselves to</h2>
          <ul data-reveal-group className="mt-10 grid gap-4 md:grid-cols-2">
            {VALUES.map((v) => (
              <li key={v.title} className="flex gap-5 card p-7">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lilac">
                  <Icon name={v.icon} className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-2xl font-semibold">{v.title}</h3>
                  <p className="mt-2 text-ink-2">{v.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-4xl font-bold md:text-5xl">The people building it</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {TEAM.map((m) => (
              <article key={m.name} data-reveal className="sheet p-6 md:p-8">
                {/* Same fixed frame for every photo, whatever the bio length */}
                <div className="flex items-center gap-5">
                  <div className="h-[168px] w-[136px] shrink-0 overflow-hidden rounded-[20px] bg-brand-soft ring-4 ring-white shadow-[var(--shadow-lift)] sm:h-[200px] sm:w-[160px]">
                    <img src={m.photo} alt={m.name} className="h-full w-full object-cover object-top" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold md:text-3xl">{m.name}</h3>
                    <p className="mt-1 font-semibold text-brand-violet">{m.role}</p>
                  </div>
                </div>
                <div className="mt-6 space-y-3 text-[15px] leading-relaxed text-ink-2">
                  {m.bio.map((para, i) => <p key={i}>{para}</p>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section data-reveal className="rounded-[var(--radius-sheet)] bg-brand p-8 text-white md:p-12">
          <h2 className="text-3xl font-bold md:text-4xl">At launch</h2>
          <dl className="mt-8 grid gap-8 sm:grid-cols-3">
            {IMPACT_STATS.map((s) => (
              <div key={s.label}>
                <dd className="font-display text-6xl font-bold leading-none">{s.value}</dd>
                <dt className="mt-3 text-lg font-semibold">{s.label}</dt>
                <dd className="text-white/60">{s.sub}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <Footer />
    </>
  );
}

const TEAM = [
  {
    name: "Chitranshu Simon",
    role: "Founder and CEO",
    photo: "/founder.jpeg",
    bio: [
      "I didn't start Where's My Therapist because I saw a business opportunity. I started it because I was looking for help myself.",
      "During one of the hardest periods of my life, I knew I needed therapy. Taking that first step was hard, and finding the right therapist was harder: hours comparing profiles, reading reviews, trying to work out who would actually fit. Then came the cost. Many sessions were priced far beyond what I could afford, and I kept wondering how many people give up, not because they don't want help, but because they can't find someone they trust within their budget.",
      "So I built a platform around the people looking for help: find therapists by what you need, not just location, see prices upfront, and spend less time searching and more time healing. If it saves even one person the confusion and stress I went through, it's worth it.",
    ],
  },
  {
    name: "Pushpesh Upreti",
    role: "Tech lead and manager",
    photo: "/techlead.png",
    bio: [
      "Pushpesh is the architect behind everything you see on Where's My Therapist. He bridges a deeply human mission and the technology that makes it possible, so every search and booking feels effortless for someone who's already going through enough.",
      "From the backend infrastructure to the team that builds on it, he makes sure the platform keeps its promise in every line of code. In a country of 1.4 billion people, where 197 million need mental health support, he believes technology is the only way to scale compassion.",
    ],
  },
];
