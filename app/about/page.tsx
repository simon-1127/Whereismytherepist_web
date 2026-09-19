import PageHeader from "../../components/PageHeader";
import Footer from "../../components/Footer";
import Reveal from "../../components/Reveal";

export const metadata = {
  title: "About Us",
  description: "Building mental healthcare that actually works for India.",
};

const VALUES = [
  {
    icon: "🤝",
    title: "Equity First",
    desc: "We price for actual Indian incomes. We support 10 languages. We accept UPI, not just credit cards. There's no \"economy tier\" where you get less care — everyone gets the same clinical rigor.",
  },
  {
    icon: "🔬",
    title: "Evidence-Backed",
    desc: "Our AI is trained on CBT, DBT, and ACT. Our therapists are licensed. Our features are designed with clinical input, not marketing noise. We measure outcomes because mental health is serious.",
  },
  {
    icon: "🌱",
    title: "Destigmatizing",
    desc: "Mental illness is an illness. Full stop. We talk about it like we talk about diabetes. We build tools that normalize therapy. And we never, ever judge someone for getting help.",
  },
  {
    icon: "🛡️",
    title: "Privacy Sacred",
    desc: "Your mental health data is the most sensitive data about you. We encrypt it, we never sell it, and we comply with applicable Indian privacy law. Full stop.",
  },
];

const IMPACT_STATS = [
  { value: "10", label: "Indian Languages", sub: "Full UI and provider support" },
  { value: "₹0", label: "Starting Price", sub: "Free tier for basic mental health" },
  { value: "13", label: "Unique Features", sub: "More than any competitor in India" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
      <PageHeader
        title="Building mental healthcare that"
        highlight="actually works for India"
        description="We're a team of therapists, engineers, and advocates who believe mental health shouldn't be a luxury — it should be accessible, affordable, and in your language."
      />

      {/* Mission */}
      <Reveal className="max-w-4xl mx-auto px-5 md:px-8 py-14 md:py-16 w-full">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E1B4B] mb-6">Our Mission</h2>
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            197 million Indians need mental healthcare. 48 million get it. Of those, most have to pay
            out-of-pocket because insurance barely covers it. And almost all of it is in English — a
            language only 10% of India speaks fluently at home.
          </p>
          <p>
            We exist to fix this. We built an all-in-one platform where you get an AI companion you name
            yourself (there 24/7), a licensed therapist (for real clinical care), and a community that gets
            it — all in 10 Indian languages, paid with the payment methods you already use, at prices that
            don't require you to earn a Silicon Valley salary.
          </p>
          <p className="font-semibold text-[#1E1B4B] pt-2">
            Every feature we build. Every decision we make. Starts with one question: "Would an Indian
            family earning ₹20,000/month be able to afford this?"
          </p>
        </div>
      </Reveal>

      {/* Values */}
      <Reveal className="bg-white border-y border-slate-200 py-14 md:py-16 w-full">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E1B4B] mb-10">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="group flex gap-4 p-6 rounded-2xl border border-slate-100 bg-[#F8FAFC] transition-all duration-300 hover:bg-white hover:border-indigo-100 hover:shadow-lg hover:-translate-y-0.5">
                <div className="text-3xl shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">{v.icon}</div>
                <div>
                  <p className="font-bold text-[#1E1B4B] mb-1.5">{v.title}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Team */}
      <Reveal className="py-14 md:py-16 w-full">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E1B4B] text-center mb-10">Meet the Team</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="group bg-white border border-slate-200 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-100">
              <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
                <img src="/founder.jpeg" alt="Chitranshu Simon" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
              </div>
              <div className="p-6 md:p-8">
                <p className="font-bold text-lg text-[#1E1B4B] text-center">Chitranshu Simon</p>
                <p className="text-sm text-indigo-600 font-semibold text-center mb-5">Founder & CEO</p>
                <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                  <p>I didn't start Where's My Therapist because I saw a business opportunity. I started it because I was looking for help myself.</p>
                  <p>During one of the most difficult periods of my life, I knew I needed therapy. Taking that first step was already hard — but finding the right therapist felt even harder. I spent hours searching through websites, comparing profiles, reading reviews, and trying to understand who would actually be the right fit. Then came another reality check: the cost. Many therapy sessions were priced far beyond what I could comfortably afford. And I kept wondering how many people, just like me, give up — not because they don't want help, but because they can't find someone they trust within their budget.</p>
                  <p>That's when one question changed everything: "Why is getting mental health support so complicated when it's needed the most?"</p>
                  <p>The more I spoke with friends and others, the more I realized my experience wasn't unique. So many people were struggling to find the right therapist, compare prices, understand specialties, and book with confidence. That's why I built Where's My Therapist — not just another therapist directory, but a platform designed around the people seeking help. Our mission is to make therapy more accessible, transparent, and affordable by helping you find therapists based on your unique needs (not just location), compare pricing upfront with no hidden surprises, and spend less time searching and more time healing.</p>
                  <p>Everyone deserves access to quality mental healthcare, regardless of their financial situation. If Where's My Therapist can help even one person avoid the confusion, stress, and financial uncertainty that I experienced, then this journey will have been worth it.</p>
                </div>
              </div>
            </div>

            <div className="group bg-white border border-slate-200 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-100">
              <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
                <img src="/techlead.png" alt="Pushpesh Upreti" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
              </div>
              <div className="p-6 md:p-8">
                <p className="font-bold text-lg text-[#1E1B4B] text-center">Pushpesh Upreti</p>
                <p className="text-sm text-indigo-600 font-semibold text-center mb-5">Tech Lead & Manager</p>
                <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                  <p>Pushpesh is the architect behind everything you see and experience on Where's My Therapist. As Tech Lead and Manager, he bridges the gap between a deeply human mission and the technology that makes it possible — ensuring that every click, every search, and every booking feels effortless for someone who is already going through enough.</p>
                  <p>When the founder shared the vision of making mental healthcare accessible to every Indian, Pushpesh didn't just see a product to build — he saw a problem worth solving. He understood that even the best idea means nothing if the platform is slow, confusing, or out of reach. So he set out to build something different: a platform that works as hard as the people using it.</p>
                  <p>From architecting the backend infrastructure to managing the team that brings it all together, Pushpesh ensures that Where's My Therapist delivers on its promise — not just in words, but in every line of code. He believes that in a country of 1.4 billion people, where 197 million need mental health support, technology isn't optional. It's the only way to scale compassion.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Impact */}
      <Reveal className="bg-white border-t border-slate-200 py-14 md:py-16 w-full">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E1B4B] mb-10">Our Impact (by launch)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {IMPACT_STATS.map((stat) => (
              <div key={stat.label} className="text-center bg-gradient-to-b from-[#F8FAFC] to-indigo-50/60 border border-slate-100 rounded-2xl py-8 px-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200">
                <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-pink-500 bg-clip-text text-transparent mb-2">{stat.value}</p>
                <p className="font-semibold text-[#1E1B4B] text-sm mb-1">{stat.label}</p>
                <p className="text-xs text-slate-500">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Footer />
    </div>
  );
}
