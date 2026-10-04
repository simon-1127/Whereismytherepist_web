/**
 * Server env check. Next bakes NEXT_PUBLIC_* values in at BUILD time, but
 * plain server vars (service role key, Razorpay secret, Daily key) are read
 * at RUNTIME from the host — on cPanel that's the Node app's
 * "Environment variables" panel. A var that exists in your local
 * .env.local but not on cPanel works in `npm run dev` and fails in prod.
 */
export const BOOKING_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
] as const;

// NEXT_PUBLIC_* values are inlined at build time only when written out
// literally (process.env.NEXT_PUBLIC_X), so they can't be looked up by name.
const BUILD_TIME: Record<string, string | undefined> = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export function missingEnv(names: readonly string[]): string[] {
  return names.filter((n) => !(n in BUILD_TIME ? BUILD_TIME[n] : process.env[n]));
}

export function assertEnv(names: readonly string[]) {
  const missing = missingEnv(names);
  if (missing.length) {
    throw new Error(
      `The server is missing ${missing.join(", ")}. Add ${missing.length > 1 ? "them" : "it"} to the Node app's environment variables and restart it.`
    );
  }
}
