const STATS = [
  { value: "500+", label: "verified therapists" },
  { value: "25+", label: "cities across India" },
  { value: "4.9", label: "average session rating" },
  { value: "10", label: "Indian languages" },
];

export default function TrustFooterBar() {
  return (
    <section className="shell pb-16 md:pb-24" aria-label="Where's My Therapist in numbers">
      <dl data-reveal className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-sheet)] border border-line bg-brand-soft md:grid-cols-4">
        {STATS.map((s, i) => (
          <div key={s.label} className={`px-6 py-8 md:px-10 md:py-10 ${i % 2 ? "border-l border-white" : ""} ${i > 1 ? "border-t border-white md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}>
            <dt className="sr-only">{s.label}</dt>
            <dd className="text-brand font-display text-5xl font-bold leading-none md:text-6xl">{s.value}</dd>
            <dd className="mt-2 text-ink-2">{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
