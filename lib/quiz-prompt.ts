import { SESSION_PRICE_RANGE } from "./pricing";
import { answerLabel, topSignals, type Answer, type Band, type Concern } from "./quiz";

/**
 * Prompt for the quiz results. The answers are written out as plain sentences
 * (not a bare Q/A list), with the person's own words and their strongest
 * answers called out, so the model has something real to respond to and
 * doesn't fall back on generic advice.
 */
export function buildPrompt(concern: Concern, answers: Answer[], band: Band) {
  const own = concern.questions
    .map((q, i) => ({ q: q.q, a: typeof answers[i] === "string" ? (answers[i] as string).trim() : "" }))
    .filter((x) => x.a);
  const strongest = topSignals(concern, answers, 6);
  const all = concern.questions
    .filter((q) => q.k !== "text")
    .map((q) => `- "${q.q}" → ${answerLabel(q, answers[concern.questions.indexOf(q)])}`)
    .join("\n");

  const system = `You are a warm, thoughtful counselling-intake assistant for Where's My Therapist, an online therapy platform in India. You write like a kind, experienced counsellor talking to one person, not like a leaflet.

The person has just completed a 20-question self-check about "${concern.title}". Overall, it seems to be affecting them at a ${band.label.toLowerCase()} level.

Write a reflection that is clearly about THIS person:
- Refer to specific things they told you (their strongest answers and, above all, anything they wrote in their own words). If they wrote something, mention it naturally.
- Speak directly to them as "you", in warm, plain English suited to India. No jargon, no lists inside sentences, no markdown, no emojis.
- Never diagnose or say they "have" a condition. Use "it sounds like", "this may be".
- Never mention medicines or doses.
- Steps must be safe, concrete and doable this week, with a short "how" for each.
- "how_we_help" connects THEIR situation to what a therapist on Where's My Therapist would actually work on with them. You may mention: private ${SESSION_PRICE_RANGE} video sessions of 50 minutes, therapists in 10 Indian languages, and the app's AI companion, mood check-ins and breathing exercises (3-week free trial). Don't invent other features or promise results.
- If anything suggests risk of self-harm, suicide or harming someone, set "crisis" to true.

Return ONLY this JSON object, nothing before or after it:
{"summary": "3 to 4 sentences that reflect back what they shared, with empathy",
 "causes": [{"title": "up to 8 words", "detail": "2 to 3 sentences linking this possible reason to their answers"}],
 "steps": [{"title": "up to 8 words", "detail": "2 to 3 sentences: what to do and how"}],
 "how_we_help": ["one or two sentences each"],
 "therapist_focus": "one sentence on the kind of therapist or approach that may suit them, e.g. CBT",
 "crisis": false}
Give 2 to 3 causes, 3 to 4 steps and 2 to 3 how_we_help items.`;

  const user = [
    `Self-check: ${concern.title}. Overall level: ${band.label}.`,
    own.length
      ? `In their own words:\n${own.map((x) => `- Asked "${x.q}" they wrote: "${x.a}"`).join("\n")}`
      : "They didn't write anything in their own words.",
    strongest.length
      ? `Their strongest answers:\n${strongest.map((s) => `- "${s.question}" → ${s.answer}`).join("\n")}`
      : "",
    `All their answers:\n${all}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { system, user };
}
