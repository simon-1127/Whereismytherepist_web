import { createClient } from "./supabase/server";
import { BACKEND_ENV, missingEnv } from "./env";

/**
 * Server-side call to the Railway backend as the signed-in user: forwards
 * their Supabase access token, so the backend derives the user from the
 * verified JWT exactly as it does for the app. Payment secrets (RazorpayX,
 * subscriptions) stay on the backend.
 *
 * Returns { status, data, error }: `error` is a user-facing line — the
 * backend's own message for 4xx (written for users), a generic one for
 * 5xx / unreachable.
 */
export async function callBackend(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; timeoutMs?: number; fallbackError?: string } = {}
): Promise<{ status: number; data: any; error?: string }> {
  const fallback = init.fallbackError || "Something went wrong. Please try again.";
  if (missingEnv(BACKEND_ENV).length) {
    console.error("Backend calls disabled, missing env: API_BASE_URL");
    return { status: 503, data: null, error: "This is temporarily unavailable. Please try again shortly." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!user || !session) return { status: 401, data: null, error: "Please sign in again." };

  let res: Response;
  try {
    res = await fetch(`${process.env.API_BASE_URL!.replace(/\/+$/, "")}${path}`, {
      method: init.method || "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: AbortSignal.timeout(init.timeoutMs ?? 30_000),
      cache: "no-store",
    });
  } catch (e) {
    console.error(`Backend ${path} unreachable:`, e);
    return { status: 502, data: null, error: "We couldn't reach our servers. Please try again in a minute." };
  }

  const data = await res.json().catch(() => ({}));
  if (res.ok) return { status: res.status, data };
  // Nest errors: { message: string | string[] }.
  const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
  console.error(`Backend ${path} error:`, res.status, msg);
  return {
    status: res.status < 500 ? res.status : 502,
    data,
    error: res.status < 500 && typeof msg === "string" ? msg : fallback,
  };
}
