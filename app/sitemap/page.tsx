import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Sitemap",
  description: "All pages on Where's My Therapist.",
};

const SECTIONS = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/therapists", label: "Find a Therapist" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign In / Sign Up" },
      { href: "/profile", label: "My Profile (client)" },
      { href: "/sessions", label: "My Bookings (client)" },
      { href: "/provider/dashboard", label: "Provider Dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Use (incl. Medical & AI Disclaimer)" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
      <PageHeader title="Site" highlight="Map" description="Every page on Where's My Therapist, in one place." />

      <section className="max-w-4xl mx-auto px-5 md:px-8 py-14 w-full flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {SECTIONS.map((section) => (
            <div key={section.title} className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-bold text-[#1E1B4B] mb-4">{section.title}</h2>
              <div className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-sm text-indigo-600 hover:underline">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
