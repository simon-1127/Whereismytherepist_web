"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CRISIS_LINES,
  OPTIONS,
  isSafetyTrigger,
  score,
  textSuggestsCrisis,
  type Answer,
  type Band,
  type Concern,
  type Insight,
} from "../../lib/quiz";

type Result = {
  summary: string;
  causes: Insight[];
  steps: Insight[];
  howWeHelp: string[];
  therapistFocus: string;
  source: "ai" | "fallback";
};
type Payload = {
  band: Band;
  flags: { medical: boolean; harm: boolean };
  signals: { question: string; answer: string }[];
  result: Result;
};

type Stage =
  | { s: "intro" }
  | { s: "q"; i: number; dir: 1 | -1 }
  | { s: "confirm" }
  | { s: "loading" }
  | { s: "result"; data: Payload }
  | { s: "safety"; from: number | null }
  | { s: "error"; msg: string };

const LOADING_LINES = ["Reading your answers…", "Looking for patterns…", "Writing your summary…"];

export default function QuizRunner({ concern }: { concern: Concern }) {
  const total = concern.questions.length;
  const storeKey = `wmt-quiz:${concern.slug}`;
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [stage, setStage] = useState<Stage>({ s: "intro" });
  const [draft, setDraft] = useState("");
  const [loadLine, setLoadLine] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resume an unfinished quiz after a refresh (this tab only).
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storeKey) || "null");
      if (Array.isArray(saved) && saved.length) setAnswers(saved);
    } catch {}
  }, [storeKey]);
  useEffect(() => {
    try {
      sessionStorage.setItem(storeKey, JSON.stringify(answers));
    } catch {}
  }, [answers, storeKey]);

  useEffect(() => {
    if (stage.s !== "loading") return;
    const t = setInterval(() => setLoadLine((n) => (n + 1) % LOADING_LINES.length), 1800);
    return () => clearInterval(t);
  }, [stage.s]);

  // window.scrollTo, not scrollIntoView: the latter also scrolls clipped
  // ancestors sideways, which shifted the whole quiz off-centre.
  const scrollTop = () => {
    const el = topRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 110;
    if (window.scrollY > y) window.scrollTo({ top: Math.max(y, 0), behavior: "smooth" });
  };

  const go = useCallback(
    (i: number, dir: 1 | -1 = 1) => {
      if (i >= total) return setStage({ s: "confirm" });
      const q = concern.questions[i];
      setDraft(q.k === "text" && typeof answers[i] === "string" ? (answers[i] as string) : "");
      setStage({ s: "q", i, dir });
      scrollTop();
    },
    [answers, concern.questions, total]
  );

  function answer(i: number, a: Answer) {
    const next = [...answers];
    next[i] = a;
    setAnswers(next);
    const q = concern.questions[i];
    if (isSafetyTrigger(q, a) || (typeof a === "string" && textSuggestsCrisis(a))) {
      setStage({ s: "safety", from: i });
      scrollTop();
      return;
    }
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (q.k === "text") return go(i + 1);
    advanceTimer.current = setTimeout(() => {
      if (i + 1 >= total) setStage({ s: "confirm" });
      else {
        setDraft("");
        setStage({ s: "q", i: i + 1, dir: 1 });
        scrollTop();
      }
    }, 260);
  }

  // Number keys pick options; Enter continues.
  useEffect(() => {
    if (stage.s !== "q") return;
    const q = concern.questions[stage.i];
    if (q.k === "text") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= OPTIONS[q.k].length) answer(stage.i, n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function submit() {
    setStage({ s: "loading" });
    setLoadLine(0);
    scrollTop();
    try {
      const res = await fetch("/api/quiz/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: concern.slug, answers }),
      });
      const j = await res.json();
      if (j.safety) return setStage({ s: "safety", from: null });
      if (!res.ok) throw new Error(j.error || "Something went wrong.");
      setStage({ s: "result", data: j });
      try {
        sessionStorage.removeItem(storeKey);
      } catch {}
    } catch (e: any) {
      setStage({ s: "error", msg: e?.message || "We couldn't reach the server. Check your connection and try again." });
    }
  }

  function restart() {
    setAnswers([]);
    setDraft("");
    setStage({ s: "intro" });
    scrollTop();
  }

  const answeredCount = answers.filter((a, i) => (concern.questions[i]?.k === "text" ? typeof a === "string" : typeof a === "number")).length;
  const progress =
    stage.s === "q" ? stage.i / total : stage.s === "confirm" || stage.s === "loading" || stage.s === "result" ? 1 : 0;

  return (
    <div ref={topRef} className="scroll-mt-28">
      {/* ---------- INTRO ---------- */}
      {stage.s === "intro" && (
        <div className="quiz-step mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-ink-2 ring-1 ring-line">
            <span className="h-2 w-2 rounded-full bg-teal" /> Free self-check · no sign-up
          </p>
          <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.05] md:text-6xl">
            {concern.title} <span className="text-brand">self-check</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-2 md:text-xl">{concern.intro}</p>
          <ul className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-2 text-sm">
            {[
              [String(total), "questions"],
              ["~4", "minutes"],
              ["AI", "summary at the end"],
            ].map(([a, b]) => (
              <li key={b} className="rounded-2xl bg-white px-3 py-3 ring-1 ring-line">
                <span className="text-brand block font-display text-2xl font-bold leading-none">{a}</span>
                <span className="mt-1 block text-ink-3">{b}</span>
              </li>
            ))}
          </ul>
          {concern.slug === "panic-attacks" && <MedicalNote className="mx-auto mt-8 max-w-xl text-left" />}
          <div className="mt-9 flex flex-col items-center gap-3">
            <button onClick={() => go(0)} className="btn btn-primary btn-lg btn-shine min-w-[220px]">
              {answeredCount > 0 && answeredCount < total ? "Start over" : "Start"}
            </button>
            {answeredCount > 0 && answeredCount < total && (
              <button onClick={() => go(Math.min(answeredCount, total - 1))} className="link text-[15px]">
                Continue where you left off (question {Math.min(answeredCount + 1, total)})
              </button>
            )}
          </div>
          <p className="mx-auto mt-8 max-w-md text-[13px] leading-relaxed text-ink-3">
            This is a self-check, not a diagnosis. Answer for the last two weeks or so. Nothing is saved to an account.
          </p>
        </div>
      )}

      {/* ---------- QUESTIONS ---------- */}
      {(stage.s === "q" || stage.s === "confirm") && (
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between gap-4 text-sm font-semibold text-ink-3">
            <button
              onClick={() => (stage.s === "confirm" ? go(total - 1, -1) : stage.i === 0 ? setStage({ s: "intro" }) : go(stage.i - 1, -1))}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 hover:bg-white hover:text-ink"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </button>
            <span aria-live="polite">
              {stage.s === "q" ? `Question ${stage.i + 1} of ${total}` : "All done"}
            </span>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-white ring-1 ring-line"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={stage.s === "q" ? stage.i : total}
            aria-label="Progress"
          >
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#00b8bc,#0077c6_40%,#522cad_75%,#ff5266)] transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(progress * 100, 3)}%` }}
            />
          </div>

          {stage.s === "q" && (
            <QuestionCard
              key={stage.i}
              dir={stage.dir}
              index={stage.i}
              concern={concern}
              value={answers[stage.i]}
              draft={draft}
              setDraft={setDraft}
              onAnswer={(a) => answer(stage.i, a)}
            />
          )}

          {stage.s === "confirm" && (
            <div className="quiz-step sheet mt-8 p-7 text-center md:p-10">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-soft">
                <svg className="h-8 w-8 text-brand-violet" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-5 text-3xl font-bold md:text-4xl">That&rsquo;s everything</h2>
              <p className="mx-auto mt-3 max-w-md text-ink-2">
                Thank you for being honest with yourself. Your summary covers what might be behind this, what you can try, and how a
                therapist could help.
              </p>
              <button onClick={submit} className="btn btn-primary btn-lg btn-shine mt-7 min-w-[220px]">
                See my results
              </button>
              <p className="mx-auto mt-6 max-w-md text-[13px] leading-relaxed text-ink-3">
                To write your summary, your answers are sent to Sarvam AI, an Indian AI company. We don&rsquo;t save them or link
                them to you.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ---------- LOADING ---------- */}
      {stage.s === "loading" && (
        <div className="quiz-step mx-auto max-w-2xl">
          <div className="sheet p-8 text-center md:p-12">
            <div className="mx-auto flex h-16 items-end justify-center gap-2" aria-hidden>
              {[0, 1, 2, 3].map((n) => (
                <span key={n} className="quiz-bar w-3 rounded-full bg-[linear-gradient(180deg,#522cad,#00b8bc)]" style={{ animationDelay: `${n * 0.14}s` }} />
              ))}
            </div>
            <p className="mt-6 font-display text-2xl font-semibold" aria-live="polite">{LOADING_LINES[loadLine]}</p>
            <p className="mt-2 text-ink-3">This usually takes 10 to 20 seconds.</p>
            <div className="mt-8 space-y-3 text-left" aria-hidden>
              {[92, 78, 85, 60].map((w, i) => (
                <div key={i} className="h-3.5 animate-pulse rounded-full bg-mist-2" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {stage.s === "error" && (
        <div className="quiz-step sheet mx-auto max-w-xl p-8 text-center">
          <h2 className="text-3xl font-bold">We couldn&rsquo;t get your results</h2>
          <p className="mt-3 text-ink-2">{stage.msg}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={submit} className="btn btn-primary">Try again</button>
            <button onClick={() => setStage({ s: "confirm" })} className="btn btn-quiet">Back</button>
          </div>
        </div>
      )}

      {stage.s === "safety" && (
        <SafetyScreen onMistake={stage.from !== null ? () => go(stage.from as number, -1) : undefined} />
      )}

      {stage.s === "result" && <Results concern={concern} data={stage.data} answers={answers} onRestart={restart} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function QuestionCard({
  index,
  concern,
  value,
  draft,
  setDraft,
  onAnswer,
  dir,
}: {
  index: number;
  concern: Concern;
  value: Answer | undefined;
  draft: string;
  setDraft: (s: string) => void;
  onAnswer: (a: Answer) => void;
  dir: 1 | -1;
}) {
  const q = concern.questions[index];
  const [picked, setPicked] = useState<number | null>(typeof value === "number" ? value : null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (q.k === "text") textRef.current?.focus({ preventScroll: true });
  }, [q.k]);

  return (
    <div className={`sheet mt-8 p-6 md:p-10 ${dir === 1 ? "quiz-in-right" : "quiz-in-left"}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-violet">{concern.title}</p>
      <h2 id={`q-${index}`} className="mt-3 text-[1.65rem] font-semibold leading-snug md:text-[2.1rem]">
        {q.q}
      </h2>

      {q.k === "text" ? (
        <form
          className="mt-7"
          onSubmit={(e) => {
            e.preventDefault();
            onAnswer(draft.trim());
          }}
        >
          <label htmlFor={`a-${index}`} className="sr-only">Your answer</label>
          <textarea
            ref={textRef}
            id={`a-${index}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={600}
            rows={4}
            placeholder="A sentence or two is plenty. Optional."
            className="field min-h-[130px] resize-y text-[16px] leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onAnswer(draft.trim());
            }}
          />
          <div className="mt-2 flex justify-between text-[12px] text-ink-3">
            <span>Please leave out names, phone numbers and addresses.</span>
            <span>{draft.length}/600</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary">{draft.trim() ? "Continue" : "Skip"}</button>
          </div>
        </form>
      ) : (
        <div role="radiogroup" aria-labelledby={`q-${index}`} className={`mt-7 grid gap-2.5 ${OPTIONS[q.k].length === 3 ? "sm:grid-cols-3" : ""}`}>
          {OPTIONS[q.k].map((o, n) => {
            const on = picked === n;
            return (
              <button
                key={o.l}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setPicked(n);
                  onAnswer(n);
                }}
                className={`quiz-opt group flex items-center gap-4 rounded-2xl px-4 py-4 text-left text-[16px] font-semibold ring-1 transition-all md:px-5 ${
                  on
                    ? "bg-lilac text-ink ring-2 ring-brand-violet"
                    : "bg-white text-ink-2 ring-line hover:-translate-y-0.5 hover:bg-mist hover:text-ink hover:shadow-sm"
                }`}
                style={{ animationDelay: `${60 + n * 45}ms` }}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ring-2 transition-colors ${
                    on ? "bg-brand-violet ring-brand-violet" : "ring-line group-hover:ring-ink-3"
                  }`}
                  aria-hidden
                >
                  {on && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                <span className="flex-1">{o.l}</span>
                <kbd className="hidden rounded-md bg-mist px-1.5 py-0.5 font-sans text-[11px] text-ink-3 md:inline">{n + 1}</kbd>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function MedicalNote({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-rose-soft px-5 py-4 text-[15px] leading-relaxed text-rose-deep ${className}`}>
      <p className="font-semibold">Chest pain, trouble breathing or fainting?</p>
      <p className="mt-1">
        Don&rsquo;t assume it&rsquo;s a panic attack. These can have physical causes, so please get a medical check-up. If it&rsquo;s
        sudden or severe, call <a href="tel:112" className="font-bold underline underline-offset-4">112</a> or go to the nearest
        hospital.
      </p>
    </div>
  );
}

function SafetyScreen({ onMistake }: { onMistake?: () => void }) {
  return (
    <div className="quiz-step mx-auto max-w-2xl">
      <div className="sheet overflow-hidden">
        <div aria-hidden className="h-1.5 bg-[linear-gradient(90deg,#00b8bc,#0077c6_35%,#522cad_70%,#ff5266)]" />
        <div className="p-7 md:p-10">
          <h2 className="text-3xl font-bold md:text-4xl">You don&rsquo;t have to carry this alone</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-2">
            Thank you for telling us. What you shared matters more than a quiz result, so we&rsquo;d like you to talk to someone
            now. These helplines are free, confidential and open all day and night.
          </p>
          <ul className="mt-7 grid gap-3">
            {CRISIS_LINES.map((l) => (
              <li key={l.name}>
                <a
                  href={`tel:${l.tel}`}
                  className={`flex items-center justify-between gap-4 rounded-2xl px-5 py-4 ring-1 transition-transform hover:-translate-y-0.5 ${
                    l.name === "Tele MANAS" ? "bg-brand text-white ring-transparent" : "bg-white text-ink ring-line"
                  }`}
                >
                  <span>
                    <span className="block font-display text-xl font-semibold">{l.name}</span>
                    <span className={`block text-sm ${l.name === "Tele MANAS" ? "text-white/80" : "text-ink-3"}`}>{l.note}</span>
                  </span>
                  <span className="flex items-center gap-2 font-display text-2xl font-bold">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.49a1 1 0 01-.5 1.21l-2.26 1.13a11.04 11.04 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.49 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" />
                    </svg>
                    {l.number}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-7 space-y-3 rounded-2xl bg-mist px-5 py-4 text-[15px] leading-relaxed text-ink-2">
            <p><strong className="text-ink">If you might act on these thoughts soon,</strong> call 112 or go to the nearest hospital emergency department now.</p>
            <p>If you can, tell someone you trust who is nearby, and stay with them for now.</p>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/login?mode=signup&next=/therapists" className="btn btn-primary">Talk to a therapist</Link>
            <Link href="/" className="btn btn-quiet">Go home</Link>
          </div>
          {onMistake && (
            <button onClick={onMistake} className="mt-6 text-sm text-ink-3 underline underline-offset-4 hover:text-ink">
              I chose that answer by mistake
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Results({
  concern,
  data,
  answers,
  onRestart,
}: {
  concern: Concern;
  data: Payload;
  answers: Answer[];
  onRestart: () => void;
}) {
  const { score: s } = score(concern, answers);
  const { band, flags, signals, result } = data;
  const pct = Math.round(Math.min(Math.max(s, 0.03), 0.97) * 100);

  return (
    <div className="quiz-step mx-auto max-w-5xl space-y-6">
      <section className="relative overflow-hidden rounded-[var(--radius-sheet)] bg-brand p-7 text-white md:p-10">
        <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00b8bc]/30 blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Your {concern.title.toLowerCase()} self-check</p>
            <h1 className="mt-3 text-[2.2rem] font-bold leading-tight md:text-5xl">{band.label} impact</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">{result.summary}</p>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-white/60">
              <span>Light</span>
              <span>Moderate</span>
              <span>Heavy</span>
            </div>
            <div className="relative mt-2 h-3 rounded-full bg-[linear-gradient(90deg,#5fe3e6,#a78bfa_50%,#ff8597)]">
              <span
                className="quiz-marker absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg ring-4 ring-white/30"
                style={{ left: `${pct}%` }}
                aria-label={`${band.label}`}
              />
            </div>
            <p className="mt-4 text-sm text-white/65">Based on {concern.questions.length} answers. Not a diagnosis.</p>
          </div>
        </div>
      </section>

      {flags.medical && <MedicalNote />}
      {flags.harm && (
        <div className="rounded-2xl bg-rose-soft px-5 py-4 text-[15px] leading-relaxed text-rose-deep">
          <p className="font-semibold">You mentioned acting aggressively or worrying about losing control.</p>
          <p className="mt-1">
            That&rsquo;s exactly what a therapist can help with, and it&rsquo;s worth starting soon. If anyone is in danger right now,
            call <a href="tel:112" className="font-bold underline underline-offset-4">112</a>.
          </p>
        </div>
      )}

      {signals.length > 0 && (
        <section className="sheet p-6 md:p-8">
          <h2 className="text-2xl font-bold">What stood out in your answers</h2>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {signals.map((x) => (
              <li key={x.question} className="flex items-start gap-3 rounded-2xl bg-mist px-4 py-3">
                <span className="mt-0.5 shrink-0 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-brand-violet ring-1 ring-line">
                  {x.answer}
                </span>
                <span className="text-[15px] text-ink-2">{x.question}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="sheet p-6 md:p-8">
          <h2 className="text-2xl font-bold">What might be behind it</h2>
          <ul className="mt-5 space-y-5">
            {result.causes.map((c) => (
              <li key={c.title} className="border-l-[3px] border-[#00b8bc] pl-4">
                <p className="font-display text-lg font-semibold leading-snug">{c.title}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-ink-2">{c.detail}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="sheet p-6 md:p-8">
          <h2 className="text-2xl font-bold">Things you can try this week</h2>
          <ol className="mt-5 space-y-5">
            {result.steps.map((c, i) => (
              <li key={c.title} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand font-display text-sm font-bold text-white">{i + 1}</span>
                <span>
                  <span className="block font-display text-lg font-semibold leading-snug">{c.title}</span>
                  <span className="mt-1 block text-[15px] leading-relaxed text-ink-2">{c.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="grid gap-8 rounded-[var(--radius-sheet)] bg-ink p-7 text-white md:grid-cols-[1.4fr_1fr] md:items-center md:p-10">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">How we can help</h2>
          {result.therapistFocus && <p className="mt-3 text-lg text-white/80">{result.therapistFocus}</p>}
          <ul className="mt-6 space-y-3">
            {result.howWeHelp.map((h) => (
              <li key={h} className="flex gap-3 text-[15px] text-white/85">
                <svg className="mt-1 h-4 w-4 shrink-0 text-[#5fe3e6]" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {h}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3 md:items-stretch">
          <Link href="/login?mode=signup&next=/therapists" className="btn btn-primary btn-lg btn-shine">
            Find a therapist for {concern.title.toLowerCase()}
          </Link>
          <Link href="/quiz" className="btn btn-lg bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20">
            Take another self-check
          </Link>
          <button onClick={onRestart} className="mt-1 text-sm text-white/60 underline underline-offset-4 hover:text-white">
            Retake this one
          </button>
        </div>
      </section>

      <p className="mx-auto max-w-2xl text-center text-[13px] leading-relaxed text-ink-3">
        This self-check is for reflection and isn&rsquo;t a diagnosis.
        {result.source === "ai" ? " Your summary was written by Sarvam AI from your answers, which we don't store." : ""} In a
        crisis, call Tele MANAS on <a href="tel:14416" className="link">14416</a>, free and open 24/7.
      </p>
    </div>
  );
}
