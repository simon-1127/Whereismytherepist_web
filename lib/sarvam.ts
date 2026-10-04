/**
 * Sarvam AI chat call shared by the quiz results API and the check page.
 * Env: SARVAM_API_KEY (required), SARVAM_MODEL (optional, default sarvam-105b).
 *
 * If Sarvam rejects the optional settings (JSON mode, reasoning effort) with
 * a 400/422, it retries once without them, since not every model accepts them.
 */
export const SARVAM_URL = "https://api.sarvam.ai/v1/chat/completions";
export const sarvamModel = () => process.env.SARVAM_MODEL || "sarvam-105b";

export type SarvamCall = {
  ok: boolean;
  status: number | null;
  ms: number;
  attempts: { status: number | null; ms: number; options: string; error?: string; finish?: string; chars?: number; tokens?: unknown }[];
  raw: string; // model text, think-blocks removed
  json: any | null;
  error?: string;
};

export async function callSarvam(system: string, user: string, timeoutMs = 45_000): Promise<SarvamCall> {
  const key = process.env.SARVAM_API_KEY;
  const out: SarvamCall = { ok: false, status: null, ms: 0, attempts: [], raw: "", json: null };
  if (!key) return { ...out, error: "SARVAM_API_KEY is not set on the server." };

  const base = {
    model: sarvamModel(),
    temperature: 0.3,
    max_tokens: 2000,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };
  const strict = {
    ...base,
    messages: [
      { role: "system", content: system },
      { role: "user", content: `${user}\n\nReply with the JSON object only. No preamble, no markdown, no code fences.` },
    ],
  };
  // sarvam-105b thinks by default (effort "medium"), and the thinking counts
  // toward max_tokens: at 4096 it used the whole budget and returned nothing.
  // A short JSON summary doesn't need it, so reasoning is switched off
  // (null). The last variant keeps light reasoning with a bigger budget.
  const variants = [
    { label: "no reasoning, json mode", body: { ...base, reasoning_effort: null, response_format: { type: "json_object" } } },
    { label: "no reasoning, plain", body: { ...strict, reasoning_effort: null } },
    { label: "low reasoning, 8k tokens", body: { ...strict, reasoning_effort: "low", max_tokens: 8192 } },
  ];


  const started = Date.now();
  for (const v of variants) {
    const t0 = Date.now();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(SARVAM_URL, {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json", "api-subscription-key": key },
        body: JSON.stringify(v.body),
      });
      out.status = res.status;
      if (!res.ok) {
        const body = (await res.text()).slice(0, 400);
        out.attempts.push({ status: res.status, ms: Date.now() - t0, options: v.label, error: body });
        out.error = `Sarvam ${res.status}: ${body}`;
        if (res.status === 400 || res.status === 422) continue; // try without the optional settings
        break;
      }
      const data = await res.json();
      const choice = data?.choices?.[0];
      const content: string = choice?.message?.content || "";
      out.raw = content;
      const attempt = {
        status: res.status,
        ms: Date.now() - t0,
        options: v.label,
        finish: choice?.finish_reason,
        chars: content.length,
        tokens: data?.usage,
      };
      const parsed = extractJson(content);
      if (parsed) {
        out.attempts.push(attempt);
        out.json = parsed;
        out.ok = true;
        out.error = undefined;
        break;
      }
      out.error = !content
        ? `Sarvam returned an empty reply (finish_reason: ${choice?.finish_reason ?? "?"}).`
        : choice?.finish_reason === "length"
          ? "Sarvam's reply was cut off by the token limit before the JSON finished."
          : "Sarvam replied, but the reply wasn't valid JSON.";
      out.attempts.push({ ...attempt, error: out.error });
      continue; // try the next variant
    } catch (e: any) {
      const msg = e?.name === "AbortError" ? `Timed out after ${timeoutMs / 1000}s` : `Network error: ${e?.message || e}`;
      out.attempts.push({ status: null, ms: Date.now() - t0, options: v.label, error: msg });
      out.error = msg;
      break;
    } finally {
      clearTimeout(timer);
    }
  }
  out.ms = Date.now() - started;
  return out;
}

/**
 * Pulls the JSON object out of a model reply: drops <think> blocks (closed
 * or cut off), code fences and any text around it, then tries each balanced
 * {...} candidate, longest first.
 */
export function extractJson(text: string): any | null {
  if (!text) return null;
  let t = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
  const open = t.search(/<think>/i);
  if (open !== -1) t = t.slice(0, open); // unclosed think block
  t = t.replace(/```(?:json)?/gi, "").trim();

  const candidates: string[] = [];
  for (let i = 0; i < t.length; i++) {
    if (t[i] !== "{") continue;
    let depth = 0, inStr = false, esc = false;
    for (let j = i; j < t.length; j++) {
      const c = t[j];
      if (inStr) {
        if (esc) esc = false;
        else if (c === "\\") esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') inStr = true;
      else if (c === "{") depth++;
      else if (c === "}" && --depth === 0) {
        candidates.push(t.slice(i, j + 1));
        i = j;
        break;
      }
    }
  }
  candidates.sort((a, b) => b.length - a.length);
  for (const c of candidates) {
    try {
      const v = JSON.parse(c);
      if (v && typeof v === "object" && !Array.isArray(v)) return v;
    } catch {}
  }
  return null;
}
