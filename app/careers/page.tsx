import PageHeader from "../../components/PageHeader";
import Footer from "../../components/Footer";
import Reveal from "../../components/Reveal";

export const metadata = {
  title: "Careers",
  description: "Join us in fixing mental healthcare in India.",
};

const CULTURE = [
  { icon: "🎯", title: "Impact-Driven", desc: "Your code, design, or clinical expertise directly affects the mental health of millions of Indians. No vanity metrics here." },
  { icon: "🚀", title: "Autonomy", desc: "We're a small team. You own your problems. You make your decisions. Flat hierarchy, real responsibility." },
  { icon: "🌍", title: "Remote-First", desc: "Work from anywhere in India. We're building for India, and we believe the best ideas come from all across the country." },
  { icon: "💪", title: "Competitive Pay", desc: "We pay market rates for impact-driven talent. Equity from day one. Health insurance for you and your family." },
  { icon: "📚", title: "Learning", desc: "Budget for conferences, courses, and skill-building. We sponsor your certifications. You grow with us." },
  { icon: "❤️", title: "Mental Health First", desc: "We practice what we preach. Flexible schedules, mental health days, and therapy subsidies for all employees." },
];

const PERKS = [
  { icon: "💰", title: "Competitive Salary", desc: "Market-rate pay + equity from day 1" },
  { icon: "🏥", title: "Health Insurance", desc: "For you and your family" },
  { icon: "🧘", title: "Mental Health Days", desc: "Take them without explaining" },
  { icon: "🚀", title: "Learning Budget", desc: "₹2L/year for growth" },
  { icon: "🏠", title: "Remote-First", desc: "Work from anywhere in India" },
  { icon: "🎧", title: "Tech Budget", desc: "Best laptop & tools to work" },
  { icon: "🎁", title: "Flexible Hours", desc: "No time tracking. Unlimited PTO." },
  { icon: "👨‍👩‍👧", title: "Parental Leave", desc: "4 months fully paid" },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
      <PageHeader
        title="Join us in fixing mental"
        highlight="healthcare in India"
        description="We're a small, focused team building the most accessible mental health platform in India. If you care about impact over everything else, this is the place for you."
      />

      {/* Culture */}
      <Reveal className="max-w-6xl mx-auto px-5 md:px-8 py-14 w-full">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E1B4B] mb-10">Why you'd love working here</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CULTURE.map((c) => (
            <div key={c.title} className="group bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200">
              <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">{c.icon}</div>
              <p className="font-bold text-[#1E1B4B] mb-1.5">{c.title}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Open roles — none right now */}
      <Reveal className="bg-white border-y border-slate-200 py-14 w-full">
        <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
          <h2 className="text-2xl font-extrabold text-[#1E1B4B] mb-4">Open Roles</h2>
          <p className="text-slate-600 mb-6">
            We don't have any open positions listed right now — but we're growing, and we'd still love to
            hear from people who care about this mission.
          </p>
          <a
            href="mailto:manager@wheresmytherapist.com?subject=General%20Application"
            className="inline-block bg-gradient-to-r from-blue-700 to-pink-500 text-white px-8 py-3.5 rounded-full font-bold transition-all duration-300 hover:opacity-95 hover:shadow-lg hover:shadow-pink-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            Send us a general application →
          </a>
        </div>
      </Reveal>

      {/* Perks */}
      <Reveal className="max-w-5xl mx-auto px-5 md:px-8 py-14 w-full">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E1B4B] text-center mb-10">Our Perks</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {PERKS.map((p) => (
            <div key={p.title} className="text-center group transition-transform duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110">{p.icon}</div>
              <p className="font-semibold text-[#1E1B4B] text-sm mb-1">{p.title}</p>
              <p className="text-xs text-slate-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Footer />
    </div>
  );
}
