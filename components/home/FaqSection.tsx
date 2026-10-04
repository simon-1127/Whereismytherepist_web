import { FAQS, faqJsonLd, jsonLd } from "../../lib/site";

/** Visible Q&A (with matching FAQPage schema) — written as direct answers so
 * search snippets and AI answer engines can quote them as-is. */
export default function FaqSection() {
  return (
    <section className="shell pb-16 md:pb-24" aria-labelledby="faq-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqJsonLd())} />
      <div data-reveal-group className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <h2 id="faq-title" className="text-4xl font-bold md:text-5xl">Questions people ask before starting therapy</h2>
          <p className="mt-4 text-lg text-ink-2">Straight answers about cost, privacy, languages and how online sessions work.</p>
        </div>
        <div className="card divide-y divide-line px-6">
          {FAQS.map((f, i) => (
            <details key={f.q} className="group py-5" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lilac text-brand-violet transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-[64ch] text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
