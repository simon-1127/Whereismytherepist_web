import Link from "next/link";
import { Contours } from "../PageHeader";
import Icon from "../icons/Icon";

/** Home page: home physiotherapy, coming soon. The hero's "Physiotherapy at home" button scrolls here. */
export default function PhysioPromo() {
  return (
    <section id="physiotherapy" className="shell scroll-mt-28 py-16 md:py-24" aria-labelledby="physio-title">
      <div data-reveal className="relative overflow-hidden sheet px-6 py-10 md:px-12 md:py-14">
        <Contours className="pointer-events-none absolute -right-24 -top-10 h-[130%] w-auto opacity-70" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-ink-2 shadow-sm ring-1 ring-line">
              <span className="h-2 w-2 rounded-full bg-teal live-dot" />
              Coming soon
            </p>
            <h2 id="physio-title" className="mt-5 text-4xl font-bold leading-[1.05] md:text-5xl">
              Physiotherapy, <span className="text-brand">right at home.</span>
            </h2>
            <p className="mt-4 max-w-xl text-lg text-ink-2">
              We&rsquo;re planning home visits by physiotherapists, for you or for elderly parents. Tell us your city and what you
              need, and we&rsquo;ll let you know when it reaches you.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link href="/physiotherapy" className="btn btn-primary btn-lg btn-shine">Join the waitlist →</Link>
              <span className="text-sm text-ink-3">Free to join, takes a minute.</span>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              ["Planned from ₹1,000", "per home session, confirmed before you book"],
              ["Mobility & strength", "balance, stiffness and everyday movement"],
              ["Recovery", "after an injury or surgery"],
              ["Care for parents", "gentle, regular support for elderly family"],
            ].map(([title, sub]) => (
              <li key={title} className="card flex gap-3 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-soft text-teal" aria-hidden>
                  <Icon name="heart" className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="text-sm text-ink-3">{sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
