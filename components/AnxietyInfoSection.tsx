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
    <section className="px-4 sm:px-8 py-6 md:py-10 max-w-7xl mx-auto w-full space-y-6">
      {/* Top 5 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {TOP_CARDS.map((card) => (
          <div key={card.title} className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
              {card.icon}
            </div>
            <p className="font-bold text-[#1E1B4B] text-sm mb-1">{card.title}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What is Anxiety? */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
          <h3 className="text-xl font-extrabold text-[#1E1B4B] mb-3">What is Anxiety?</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Anxiety is a natural response to stress or danger. But when it becomes frequent,
            overwhelming, or interferes with daily life, it may be an anxiety disorder. Therapy can
            help you understand the root causes and build tools to manage it effectively.
          </p>

          <h4 className="font-bold text-[#1E1B4B] mb-4">Common Signs of Anxiety</h4>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {COMMON_SIGNS.map((sign) => (
              <div key={sign.label} className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700">
                <span className="text-indigo-500 shrink-0">{sign.icon}</span>
                {sign.label}
              </div>
            ))}
          </div>
          <a href="#" className="text-sm font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1.5">
            View all symptoms <span>→</span>
          </a>
        </div>

        {/* Therapy Can Help You */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
          <h3 className="text-xl font-extrabold text-[#1E1B4B] mb-3">Therapy Can Help You</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            Our anxiety therapists use proven approaches to help you feel calmer and in control.
          </p>
          <ul className="space-y-3">
            {THERAPY_APPROACHES.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-700">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
