const TOP_CARDS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3a6 6 0 00-6 6c0 1.887.454 2.87 1.5 4.5.523.815 1.5 1.5 1.5 3v.5h6V16.5c0-1.5.977-2.185 1.5-3C17.546 11.87 18 10.887 18 9a6 6 0 00-6-6z" />
      </svg>
    ),
    title: "Understand Anxiety",
    description: "Identify triggers and patterns that fuel your anxiety.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Manage Symptoms",
    description: "Evidence-based strategies to manage worry, fear and panic.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3c-1.5 3-4 5-4 8.5A4 4 0 0012 16a4 4 0 004-4.5C16 8 13.5 6 12 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 16.5C7 18 6 19.5 6 21h12c0-1.5-1-3-2.5-4.5" />
      </svg>
    ),
    title: "Build Confidence",
    description: "Develop self-esteem and emotional resilience.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Improve Well-being",
    description: "Create healthier habits and a balanced mindset.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Long-term Support",
    description: "Ongoing guidance to help you stay in control.",
  },
];

const COMMON_SIGNS = [
  {
    label: "Excessive worry",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3a6 6 0 00-6 6c0 1.887.454 2.87 1.5 4.5.523.815 1.5 1.5 1.5 3v.5h6V16.5c0-1.5.977-2.185 1.5-3C17.546 11.87 18 10.887 18 9a6 6 0 00-6-6z" />
      </svg>
    ),
  },
  {
    label: "Racing thoughts",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: "Restlessness",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    label: "Fatigue",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Difficulty sleeping",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
  {
    label: "Panic attacks",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    label: "Muscle tension",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: "Avoidance",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
];

const THERAPY_APPROACHES = [
  "Cognitive Behaviour Therapy (CBT)",
  "Mindfulness & Relaxation Techniques",
  "Stress Management Strategies",
  "Exposure Therapy",
  "Personalised Coping Tools",
];

export default function AnxietyInfoSection() {
  return (
    <section className="shell pb-16 md:pb-24">
      <div data-reveal-group className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="sheet p-6 md:p-10">
          <h2 className="text-4xl font-bold md:text-[2.8rem]">Is it anxiety?</h2>
          <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-ink-2">
            Anxiety is a normal response to stress. When it&rsquo;s frequent, overwhelming or gets in the way of daily life, it may be
            an anxiety disorder, and therapy can help you understand where it comes from and what to do about it.
          </p>
          <h3 className="mt-8 text-lg font-semibold">Common signs</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {COMMON_SIGNS.map((s) => (
              <li key={s.label} className="inline-flex items-center gap-2 rounded-full bg-mist px-3.5 py-2 text-[15px]">
                <span className="text-rose">{s.icon}</span>
                {s.label}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-ink-3">
            Recognising a few of these doesn&rsquo;t mean you have a disorder. A therapist can help you make sense of it.
          </p>
        </div>

        <div className="rounded-[var(--radius-sheet)] bg-lilac p-6 md:p-10">
          <h2 className="text-3xl font-bold">What therapy works on</h2>
          <ul className="mt-6 space-y-5">
            {TOP_CARDS.map((c) => (
              <li key={c.title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-paper text-ink">{c.icon}</span>
                <div>
                  <p className="font-display text-lg font-semibold">{c.title}</p>
                  <p className="text-ink-2">{c.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-8 border-t border-ink/10 pt-5 text-[15px] text-ink-2">
            Common approaches: {THERAPY_APPROACHES.join(", ")}.
          </p>
        </div>
      </div>
    </section>
  );
}
