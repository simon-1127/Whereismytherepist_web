import Link from "next/link";
import { CITIES, CONCERNS, LANGUAGES } from "../../lib/site";
import { QUIZ_BY_CHIP } from "../../lib/quiz";

/** "What / which language / where" — real, useful copy that also carries
 * the search terms people use (therapist in Delhi, counselling in Hindi…). */
export default function ReachSection({ signedIn }: { signedIn: boolean }) {
  const href = signedIn ? "/therapists" : "/login?mode=signup&next=/therapists";
  const groups = [
    {
      title: "Help with what you're going through",
      hint: "Tap one for a free 20-question self-check, no sign-up.",
      items: CONCERNS.map((c) => ({ label: `${c} counselling`, href: QUIZ_BY_CHIP[c] ? `/quiz/${QUIZ_BY_CHIP[c].slug}` : href, quiz: !!QUIZ_BY_CHIP[c] })),
    },
    { title: "Therapy in your language", items: LANGUAGES.map((l) => ({ label: `Therapist who speaks ${l}`, href, quiz: false })) },
    { title: "Online therapy wherever you are in India", items: CITIES.map((c) => ({ label: `Therapist in ${c}`, href, quiz: false })) },
  ];
  return (
    <section className="shell pb-16 md:pb-24" aria-labelledby="reach-title">
      <div data-reveal className="sheet p-6 md:p-12">
        <h2 id="reach-title" className="max-w-3xl text-4xl font-bold md:text-5xl">
          Online counselling and therapy across India
        </h2>
        <p className="mt-4 max-w-3xl text-lg text-ink-2">
          Talk to a licensed psychologist or counsellor online from any city or town, by video, in the language you&rsquo;re most
          comfortable in. Compare therapists by speciality and price per session, then book and pay with UPI.
        </p>
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="text-xl font-semibold">{g.title}</h3>
              {"hint" in g && <p className="mt-1 text-sm text-ink-3">{g.hint}</p>}
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`chip transition-colors hover:bg-lilac hover:text-brand-violet ${item.quiz ? "bg-white ring-1 ring-line hover:ring-brand-violet/40" : ""}`}
                    >
                      {item.label}
                      {item.quiz && (
                        <svg className="h-3 w-3 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                        </svg>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
