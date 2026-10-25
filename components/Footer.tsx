import Link from "next/link";
import { CookieSettingsLink } from "./CookieConsent";
import SocialIcon from "./SocialIcon";
import { SOCIALS } from "../lib/site";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/therapists", label: "Find a therapist" },
      { href: "/quiz", label: "Free self-check" },
      { href: "/sessions", label: "My sessions" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/for-therapists", label: "Join as a therapist" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of use" },
      { href: "/cancellation-refund-policy", label: "Cancellation & refunds" },
      { href: "/cookies", label: "Cookie policy" },
      { href: "/sitemap", label: "Sitemap" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div aria-hidden className="h-[3px] bg-[linear-gradient(90deg,#00b8bc,#0077c6_35%,#522cad_70%,#ff5266)]" />
      <div className="shell grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:py-16">
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Where's My Therapist home">
            <img src="/favicon.png" alt="" className="h-11 w-11 object-contain" />
            <span className="leading-none">
              <span className="block font-display text-xl font-bold tracking-tight">wheres</span>
              <span className="text-brand block font-display text-lg font-semibold tracking-tight">my therapist</span>
            </span>
          </Link>
          <p className="mt-4 text-[15px] text-ink-2">Helping you find your way back to you.</p>
          <p className="mt-5 rounded-2xl bg-rose-soft px-4 py-3 text-sm leading-relaxed text-rose-deep">
            In crisis right now? Call Tele MANAS on{" "}
            <a href="tel:14416" className="font-bold underline underline-offset-4">14416</a>, free and open 24/7.
          </p>
          <ul className="mt-5 flex gap-2.5" aria-label="Follow us">
            {SOCIALS.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label={`Where's My Therapist on ${s.name}`}
                  style={{ ["--brand" as any]: s.color, ["--brand-bg" as any]: s.bg }}
                  className="grid h-10 w-10 place-items-center rounded-full bg-mist text-ink-2 ring-1 ring-line transition-all hover:-translate-y-0.5 hover:[background:var(--brand-bg)] hover:text-white hover:ring-transparent"
                >
                  <SocialIcon id={s.id} className="h-[18px] w-[18px]" />
                </a>
              </li>
            ))}
          </ul>
          <a
            href="https://www.producthunt.com/products/google-docs-10?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-google-docs-cfc207c3-e1ca-4891-be8c-b12b9bde5698"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block transition-opacity hover:opacity-90"
          >
            <img
              alt="Where's My Therapist, featured on Product Hunt"
              width={250}
              height={54}
              loading="lazy"
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1291825&theme=dark&t=1792892011574"
            />
          </a>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-4 font-display text-[15px] font-semibold">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[15px] text-ink-2 hover:text-brand-violet">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="shell flex flex-col gap-2 py-5 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Where&rsquo;s My Therapist. Made in India.{" "}
            <Link href="/quiz" className="hover:text-brand-violet">
              Self-check powered by <span className="font-semibold">Sarvam AI</span>
            </Link>
          </p>
          <div className="flex gap-5">
            <CookieSettingsLink />
            <a href="mailto:partner@wheresmytherapist.com" className="hover:text-brand-violet">partner@wheresmytherapist.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
