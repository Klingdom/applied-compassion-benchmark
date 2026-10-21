import { INSIGHTS, getInsight, substituteTokens } from "@/lib/insights";
import type { InsightAudience, InsightManifestEntry, InsightPost } from "@/components/model-watch/types";

/** Page-side helpers for Insights posts. Data and token substitution live in src/lib/insights.ts. */

export const insightEntries: InsightManifestEntry[] = INSIGHTS;

/** The compiled post with {{TOKEN}} placeholders resolved (an unknown token throws and fails the build). */
export async function loadInsight(slug: string): Promise<InsightPost | null> {
  const post = getInsight(slug);
  if (!post) return null;
  return {
    ...post,
    html: substituteTokens(post.html),
    claimLedger: post.claimLedger.map((c) => ({ ...c, sentence: substituteTokens(c.sentence) })),
    corrections: post.corrections.map((c) => ({ ...c, text: substituteTokens(c.text) })),
  };
}

export const AUDIENCE_LABEL: Record<InsightAudience, string> = {
  "ai-labs": "AI labs",
  "agent-builders": "Agent builders",
  both: "Labs and agent builders",
};

/** Add anchor ids to h2 headings and return the list for the on-this-page rail. */
export function withHeadingIds(html: string): { html: string; headings: { id: string; text: string }[] } {
  const headings: { id: string; text: string }[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_m, inner: string) => {
    const text = inner
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    let id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
    while (used.has(id)) id += "-x";
    used.add(id);
    headings.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, headings };
}

/** Related posts: same audience (or a post for both), then recency. At most three. */
export function relatedInsights(slug: string, audience: InsightAudience): InsightManifestEntry[] {
  const compatible = (a: InsightAudience) => a === audience || a === "both" || audience === "both";
  return insightEntries.filter((p) => p.slug !== slug && compatible(p.audience)).slice(0, 3);
}
