/** Only same-site paths — never "//evil.com" or "https://…" (open redirect). */
export function safeNext(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (next.startsWith("/login") || next.startsWith("/auth")) return fallback;
  return next;
}
