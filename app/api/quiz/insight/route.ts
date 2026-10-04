import { NextResponse } from "next/server";
import {
  QUIZ_BY_SLUG,
  flags,
  isComplete,
  needsSafetyScreen,
  score,
  topSignals,
  type Answer,
  type Insight,
} from "../../../../lib/quiz";
import { SESSION_PRICE_RANGE } from "../../../../lib/pricing";
import { callSarvam } from "../../../../lib/sarvam";
import { buildPrompt } from "../../../../lib/quiz-prompt";

/**
 * Turns quiz answers into a short, kind summary using Sarvam AI.
 * Public (no login). Answers are not stored anywhere; they are sent to
 * Sarvam only to write this summary.
 *
 * Env: SARVAM_API_KEY (required for AI text), SARVAM_MODEL (optional,
 * default sarvam-105b). Without a key, or if Sarvam fails, a written
 * fallback for the concern is returned so the page always works.
 */

export const runtime = "nodejs";

// Light per-IP throttle so the endpoint can't be used to burn API credit.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 12;
}

type Result = {
  summary: string;
  causes: Insight[];
  steps: Insight[];
  howWeHelp: string[];
  therapistFocus: string;
  source: "ai" | "fallback";
};

function clean(s: unknown, max: number) {
  return typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, max) : "";
}
function cleanList(v: unknown, n: number): Insight[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x: any) => ({ title: clean(x?.title, 90), detail: clean(x?.detail, 360) }))
    .filter((x) => x.title && x.detail)
    .slice(0, n);
}

function howWeHelpDefault(title: string): string[] {
  return [
    `Match with a licensed therapist who works with ${title.toLowerCase()} and speaks your language, from 10 Indian languages.`,
    `Private video sessions from your phone or laptop, ${SESSION_PRICE_RANGE} a session, paid with UPI.`,
    "Between sessions, the app gives you an AI companion, mood check-ins and breathing exercises, free for the first 3 weeks.",
  ];
}

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many requests. Please try again in a while." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const concern = QUIZ_BY_SLUG[body?.slug];
  const answers: Answer[] = Array.isArray(body?.answers)
    ? body.answers.slice(0, 40).map((a: unknown) => (typeof a === "number" ? a : typeof a === "string" ? a.slice(0, 600) : ""))
    : [];
  if (!concern || !isComplete(concern, answers)) {
    return NextResponse.json({ error: "Please answer every question first." }, { status: 400 });
  }

  // Safety comes first and never depends on the AI.
  if (needsSafetyScreen(concern, answers)) return NextResponse.json({ safety: true });

  const { band } = score(concern, answers);
  const fl = flags(concern, answers);
  const fallback: Result = {
    summary: `From your answers, ${concern.title.toLowerCase()} ${band.line}. That's worth taking seriously, and it's very workable with the right support.`,
    causes: concern.fallback.causes,
    steps: concern.fallback.steps,
    howWeHelp: howWeHelpDefault(concern.title),
    therapistFocus: "",
    source: "fallback",
  };

  if (!process.env.SARVAM_API_KEY) {
    console.error("quiz insight: SARVAM_API_KEY is not set, using fallback");
    return NextResponse.json({ band, flags: fl, signals: topSignals(concern, answers), result: { ...fallback, reason: "SARVAM_API_KEY is not set" } });
  }

  const { system, user } = buildPrompt(concern, answers, band);

  const call = await callSarvam(system, user);
  const debug = process.env.NODE_ENV !== "production" ? { sarvam: { ok: call.ok, ms: call.ms, attempts: call.attempts, error: call.error } } : {};
  if (!call.ok) {
    console.error("quiz insight failed:", call.error, JSON.stringify(call.attempts));
    return NextResponse.json({ band, flags: fl, signals: topSignals(concern, answers), result: { ...fallback, reason: call.error }, ...debug });
  }
  console.log(`quiz insight: sarvam ok in ${call.ms}ms (${concern.slug})`);

  try {
    const json = call.json;
    if (json.crisis === true) return NextResponse.json({ safety: true });

    const result: Result = {
      summary: clean(json.summary, 600) || fallback.summary,
      causes: cleanList(json.causes, 3),
      steps: cleanList(json.steps, 4),
      howWeHelp: Array.isArray(json.how_we_help) ? json.how_we_help.map((s: unknown) => clean(s, 260)).filter(Boolean).slice(0, 3) : [],
      therapistFocus: clean(json.therapist_focus, 260),
      source: "ai",
    };
    if (result.causes.length < 2) result.causes = fallback.causes;
    if (result.steps.length < 2) result.steps = fallback.steps;
    if (!result.howWeHelp.length) result.howWeHelp = fallback.howWeHelp;

    return NextResponse.json({ band, flags: fl, signals: topSignals(concern, answers), result, ...debug });
  } catch (err) {
    console.error("quiz insight failed:", err);
    return NextResponse.json({ band, flags: fl, signals: topSignals(concern, answers), result: fallback, ...debug });
  }
}
