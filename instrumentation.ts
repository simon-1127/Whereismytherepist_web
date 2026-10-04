/**
 * Runs once when the server starts. The Node-only part lives in its own
 * file so it's never bundled for the edge runtime (middleware).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/load-env-file");
  }
}
