import Link from "next/link";
import { CONCERN_QUIZZES } from "../../lib/quiz";

const POPULAR = ["anxiety", "stress", "depression", "sleep", "burnout", "relationships", "exam-stress", "loneliness"];

/** Home page tile for the free AI self-check. */
export default function SelfCheckPromo() {
  const chips = POPULAR.map((s) => CONCERN_QUIZZES.find((c) => c.slug === s)).filter(Boolean) as typeof CONCERN_QUIZZES;

  return (
    <section className="shell pb-16 md:pb-24" aria-labelledby="selfcheck-title">
      <div data-reveal className="relative isolate overflow-hidden rounded-[var(--radius-sheet)] bg-ink px-6 py-10 text-white md:px-12 md:py-14">
        {/* glow */}
        <div aria-hidden className="absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-[#00b8bc]/30 blur-[100px]" />
        <div aria-hidden className="absolute -bottom-32 right-10 -z-10 h-96 w-96 rounded-full bg-[#522cad]/50 blur-[110px]" />
        <div aria-hidden className="absolute right-1/3 top-10 -z-10 h-48 w-48 rounded-full bg-[#ff5266]/25 blur-[90px]" />

        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20">
                <svg className="h-3.5 w-3.5 text-[#5fe3e6]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2zm6 12l.9 2.6 2.6.9-2.6.9L18 21l-.9-2.6-2.6-.9 2.6-.9L18 14z" />
                </svg>
                Powered by Sarvam AI
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20">
                Free · no sign-up
              </span>
            </div>
            <h2 id="selfcheck-title" className="mt-5 text-4xl font-bold leading-[1.05] md:text-5xl">
              Not sure what you&rsquo;re feeling? <span className="selfcheck-grad">Check in with yourself.</span>
            </h2>
            <p className="mt-4 max-w-xl text-lg text-white/75">
              Answer 20 gentle questions in about 4 minutes. Our AI reads your answers and writes a personal summary: what might be
              behind it, what you can try this week, and how a therapist could help.
            </p>

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/15">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#5fe3e6]/15 text-[#5fe3e6]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <p className="text-[15px] leading-relaxed text-white/85">
                <strong className="text-white">We don&rsquo;t store your answers.</strong> Nothing is saved on our side or linked to
                you. Your answers are used once, to write your summary.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/quiz" className="btn btn-primary btn-lg btn-shine">Start a free self-check</Link>
              <span className="text-sm text-white/55">16 topics to choose from</span>
            </div>
          </div>

          {/* A peek at the experience */}
          <div className="relative mx-auto w-full max-w-md" aria-hidden>
            <div className="selfcheck-card relative rotate-[-2deg] rounded-[24px] bg-white p-6 text-ink shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)]">
              <div className="flex items-center justify-between text-xs font-semibold text-ink-3">
                <span className="uppercase tracking-[0.14em] text-brand-violet">Anxiety</span>
                <span>Question 4 of 20</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mist">
                <div className="h-full w-1/5 rounded-full bg-[linear-gradient(90deg,#00b8bc,#522cad,#ff5266)]" />
              </div>
              <p className="mt-5 font-display text-xl font-semibold leading-snug">Do you find yourself overthinking situations repeatedly?</p>
              <div className="mt-4 space-y-2">
                {["Never", "Sometimes", "Often", "Almost always"].map((o) => (
                  <div
                    key={o}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold ring-1 ${o === "Often" ? "bg-lilac ring-2 ring-brand-violet" : "ring-line text-ink-2"}`}
                  >
                    <span className={`grid h-4 w-4 place-items-center rounded-full ring-2 ${o === "Often" ? "bg-brand-violet ring-brand-violet" : "ring-line"}`}>
                      {o === "Often" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    {o}
                  </div>
                ))}
              </div>
            </div>
            <div className="selfcheck-chip absolute -bottom-6 -right-2 rotate-[3deg] rounded-2xl bg-brand px-4 py-3 shadow-xl sm:-right-6">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2z" /></svg>
                Your summary
              </p>
              <p className="mt-0.5 text-sm font-semibold">&ldquo;It sounds like your mind rarely gets a break&hellip;&rdquo;</p>
            </div>
          </div>
        </div>

        <ul className="mt-12 flex flex-wrap gap-2" aria-label="Popular self-checks">
          {chips.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/quiz/${c.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3.5 py-1.5 text-sm font-medium text-white/85 ring-1 ring-white/15 transition-colors hover:bg-white hover:text-ink"
              >
                {c.title}
                <svg className="h-3 w-3 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
