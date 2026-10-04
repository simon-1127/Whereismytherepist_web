import fs from "node:fs";
import path from "node:path";

/**
 * Loads server secrets from `.env.production` or `.env` in the folder the
 * app runs from (the one with server.js), at startup.
 *
 * Why: on shared cPanel hosting, saving a variable in the Node.js app's
 * "Environment variables" panel restarts the app, and that restart can fail
 * with "cagefs_enter: Unable to fork" when the account is at its process
 * limit. Putting the variable in this file and restarting once avoids the
 * panel entirely.
 *
 * Anything the host already set (the cPanel panel) wins; this only fills
 * in what's missing. Keep the file out of public/.
 */
for (const name of [".env.production", ".env"]) {
  const file = path.join(process.cwd(), name);
  let text: string;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[m[1]] === undefined || process.env[m[1]] === "") process.env[m[1]] = value;
  }
}
