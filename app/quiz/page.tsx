import Link from "next/link";
import Footer from "../../components/Footer";
import { CONCERN_QUIZZES } from "../../lib/quiz";
import { Contours } from "../../components/PageHeader";

export const metadata = {
  title: "Free Mental Health Self-Check Quizzes",
  description:
    "Free, private self-checks for anxiety, depression, stress, OCD, panic attacks, sleep, burnout and more. 20 questions, no sign-up, with an AI-written summary of what might help.",
  alternates: { canonical: "/quiz" },
};

const ACCENTS = ["#00b8bc", "#0077c6", "#522cad", "#ff5266"];

export default function QuizIndex() {
  return (
    <>
      <main className="flex-1">
        <section className="shell pt-8 md:pt-12">
          <div className="relative overflow-hidden sheet px-6 py-12 md:px-14 md:py-16">
            <Contours className="pointer-events-none absolute -right-24 -top-10 h-[130%] w-auto md:right-0" />
            <div className="relative max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-mist px-3.5 py-1.5 text-sm font-semibold text-ink-2">
                <span className="h-2 w-2 rounded-full bg-teal" /> Free · private · no sign-up
              </p>
              <h1 className="mt-5 text-[2.4rem] font-bold md:text-[3.6rem]">What are you going through?</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">
                Pick what feels closest. Answer 20 short questions and get a summary of what might be behind it, what you can try
                this week, and how a therapist could help.
              </p>
            </div>
          </div>
        </section>

        <section className="shell py-12 md:py-16">
          <ul data-reveal-group className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONCERN_QUIZZES.map((c, i) => (
              <li key={c.slug}>
                <Link href={`/quiz/${c.slug}`} className="card card-hover group flex h-full flex-col p-6">
                  <span
                    aria-hidden
                    className="h-1.5 w-10 rounded-full transition-all duration-300 group-hover:w-16"
                    style={{ background: ACCENTS[i % ACCENTS.length] }}
                  />
                  <h2 className="mt-5 text-2xl font-semibold">{c.title}</h2>
                  <p className="mt-2 flex-1 text-[15px] text-ink-2">{c.intro}</p>
                  <p className="mt-5 flex items-center justify-between text-sm font-semibold text-brand-violet">
                    <span className="font-medium text-ink-3">20 questions</span>
                    <span className="inline-flex items-center gap-1">
                      Start
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                      </svg>
                    </span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-10 max-w-2xl text-center text-[13px] leading-relaxed text-ink-3">
            These self-checks are for reflection, not diagnosis. If you are in crisis, call Tele MANAS on{" "}
            <a href="tel:14416" className="link">14416</a> or KIRAN on <a href="tel:18005990019" className="link">1800-599-0019</a>, free and open 24/7.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
