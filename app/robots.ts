import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

const PRIVATE = ["/welcome", "/reset-password", "/api/", "/auth/", "/sessions", "/profile", "/provider/", "/login"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      // GEO: let AI answer engines read public pages so they can cite us.
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Bingbot", "Applebot-Extended"], allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
