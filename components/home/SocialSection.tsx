import { SOCIALS } from "../../lib/site";
import SocialIcon from "../SocialIcon";
import { Contours } from "../PageHeader";

/** "Find us between sessions": our social profiles, made to stand out. */
export default function SocialSection() {
  return (
    <section className="shell pb-16 md:pb-24" aria-labelledby="social-title">
      <div data-reveal className="relative isolate overflow-hidden rounded-[var(--radius-sheet)] bg-brand px-6 py-10 text-white md:px-12 md:py-14">
        <Contours className="pointer-events-none absolute -right-32 -top-24 -z-10 h-[150%] text-white/15" mono />
        <div aria-hidden className="absolute -bottom-24 -left-16 -z-10 h-72 w-72 rounded-full bg-[#ff5266]/40 blur-[90px]" />
        <div aria-hidden className="absolute -top-20 left-1/3 -z-10 h-64 w-64 rounded-full bg-[#00b8bc]/35 blur-[90px]" />

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-semibold ring-1 ring-white/25 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#5fe3e6] live-dot" /> We&rsquo;re on social
            </p>
            <h2 id="social-title" className="mt-5 text-4xl font-bold leading-[1.05] md:text-5xl">
              Find us between <span className="social-underline">sessions</span>.
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/80">
              Small, steady doses of support in your feed, plus news about who we are and what we&rsquo;re building.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {SOCIALS.map((s, i) => (
              <li key={s.id} className="social-tile" style={{ ["--brand" as any]: s.color, animationDelay: `${i * 0.12}s` }}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label={`Follow Where's My Therapist on ${s.name}`}
                  className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-[24px] bg-white p-5 text-ink shadow-[0_18px_40px_-18px_rgb(19_18_74/0.55)] transition-all duration-300 hover:-translate-y-1.5 hover:rotate-[-1deg] lg:flex-row lg:items-center xl:flex-col xl:items-stretch"
                >
                  {/* brand colour sweeps in on hover */}
                  <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-[var(--brand)] transition-transform duration-300 ease-out group-hover:scale-y-100" />
                  <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--brand)] text-white transition-colors duration-300 group-hover:bg-white group-hover:text-[var(--brand)]">
                    <SocialIcon id={s.id} className="h-6 w-6" />
                  </span>
                  <span className="relative min-w-0 flex-1 transition-colors duration-300 group-hover:text-white">
                    <span className="block font-display text-lg font-semibold leading-tight">{s.name}</span>
                    <span className="block truncate text-sm text-ink-3 transition-colors duration-300 group-hover:text-white/80">{s.handle}</span>
                    <span className="mt-2 block text-[14px] leading-snug text-ink-2 transition-colors duration-300 group-hover:text-white/90">{s.blurb}</span>
                  </span>
                  <span className="relative inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] transition-colors duration-300 group-hover:text-white">
                    Follow
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
