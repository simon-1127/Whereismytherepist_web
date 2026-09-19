import Link from "next/link";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/therapists", label: "Find a Therapist" },
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
      { href: "/terms", label: "Terms of Use" },
      { href: "/sitemap", label: "Sitemap" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#1E1B4B] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 md:py-16 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <img src="/logo.png" alt="Where's My Therapist Logo" className="h-8  " />
          <p className="text-sm text-white/60 leading-relaxed">
            Find the right therapist for where you are in life.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-bold uppercase tracking-wide text-white/40 mb-4">{col.title}</p>
            <div className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-white/80 hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Where's My Therapist. All rights reserved.
          </p>
          <p className="text-xs text-white/50">Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
