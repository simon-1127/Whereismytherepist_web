/**
 * Tiny per-key sliding-window limiter for public forms (contact, waitlist).
 * In-memory: right for the single Node process on cPanel; it resets on
 * restart, which is fine for spam damping (the DB has its own uniqueness).
 */
const buckets = new Map<string, number[]>();

export function rateLimited(key: string, max = 5, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) buckets.clear(); // never grows without bound
  return recent.length > max;
}

/** Best-effort client IP behind the cPanel / Passenger proxy. */
export function clientIp(request: Request): string {
  return (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}
