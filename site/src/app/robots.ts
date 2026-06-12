import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      // Explicit, reasoned ALLOW — citation visibility is the growth engine.
      // For a benchmark institution, being cited by AI answer engines (ChatGPT,
      // Perplexity, Claude, Google AI Overviews) is equivalent to organic search
      // ranking. Restricting these bots would directly harm discovery.
      // Revisit only if a specific bot is found to extract without driving
      // attribution (i.e., scrapes data without citing compassionbenchmark.com).
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "anthropic-ai",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
        ],
        allow: "/",
      },
    ],
    sitemap: "https://compassionbenchmark.com/sitemap.xml",
  };
}
