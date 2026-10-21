/**
 * insights.ts -- data accessors for the /insights pages (docs/DATA_MODEL_AI_MODEL_WATCH.md section 8).
 *
 * Posts are compiled from research/insights/<slug>.md by scripts/build-insights.mjs (lint fails closed) into
 * site/src/data/insights/<slug>.json. The compiled `html` and `bodyMarkdown` keep repo-derived numbers as {{TOKEN}}
 * placeholders; `substituteTokens` fills them from the facts modules at render time, so no count is ever typed into a post.
 * An unknown token throws: a post that names a figure this module cannot derive must not render.
 *
 * Server-side (build time) only.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import manifest from "@/data/insights/manifest.json";
import { DIMENSIONS } from "@/data/dimensions";
import { SCORED_ENTITY_COUNT_FORMATTED, getIndexEntityCount } from "@/data/entityCount";
import { INDEX_COUNT } from "@/data/indexRegistry";
import { MODEL_INDEX_FACTS } from "@/lib/model-index-facts";
import { MODEL_WATCH_FACTS } from "@/lib/model-watch-facts";

export type InsightAudience = "ai-labs" | "agent-builders" | "both";

export interface InsightSummary {
  slug: string;
  title: string;
  dek: string;
  date: string;
  audience: InsightAudience;
  tags: string[];
  readingMinutes: number;
  /** Date of the newest correction, or null. */
  lastCorrected: string | null;
}

export interface InsightSource {
  n: number;
  title: string;
  publisher: string;
  /** YYYY-MM-DD */
  date: string;
  url: string;
}

export interface InsightPost {
  slug: string;
  title: string;
  dek: string;
  date: string;
  audience: InsightAudience;
  tags: string[];
  readingMinutes: number;
  bodyMarkdown: string;
  /** markdown-lite output; [n] already rendered as <sup><a href="#src-n">; tokens still {{X}} (use substituteTokens). */
  html: string;
  sources: InsightSource[];
  claimLedger: { sentence: string; citations: number[]; tokens: string[] }[];
  corrections: { date: string; text: string }[];
  generatedAt: string;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Newest first (the manifest is stored that way). */
export const INSIGHTS: InsightSummary[] = (manifest as unknown as { posts: InsightSummary[] }).posts;

export const INSIGHT_SLUGS: string[] = INSIGHTS.map((p) => p.slug);

/** The compiled post for a slug, or null (also null for a malformed slug, so a path can never escape the data directory). */
export function getInsight(slug: string): InsightPost | null {
  if (!SLUG_RE.test(slug)) return null;
  const p = join(process.cwd(), "src", "data", "insights", `${slug}.json`);
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as InsightPost) : null;
}

/** Every compiled post on disk, newest first. Prefer INSIGHTS for listings. */
export function allInsights(): InsightPost[] {
  const dir = join(process.cwd(), "src", "data", "insights");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json") && f !== "manifest.json" && f !== "lint-allow.json")
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as InsightPost)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? -1 : 1));
}

/** The latest of a post's date and its newest correction (sitemap `lastModified`). */
export function lastModifiedOf(p: Pick<InsightSummary, "date" | "lastCorrected">): string {
  return p.lastCorrected && p.lastCorrected > p.date ? p.lastCorrected : p.date;
}

/** Values for every {{TOKEN}} a post may use. Derived from the facts modules, never typed. */
export const INSIGHT_TOKEN_VALUES: Record<string, string> = {
  SCORED_ENTITY_COUNT: SCORED_ENTITY_COUNT_FORMATTED,
  INDEX_COUNT: String(INDEX_COUNT),
  DIMENSION_COUNT: String(DIMENSIONS.length),
  SUBDIMENSION_COUNT: String(DIMENSIONS.reduce((n, d) => n + d.subdims.length, 0)),
  AI_LABS_COUNT: String(getIndexEntityCount("ai-labs")),
  CATALOG_MODEL_COUNT: String(MODEL_WATCH_FACTS.catalogModelCount),
  TASK_ITEM_COUNT: String(MODEL_INDEX_FACTS.itemCount),
};

/** Replace {{TOKEN}} placeholders. Throws on an unknown token. */
export function substituteTokens(text: string): string {
  return text.replace(/\{\{([A-Za-z0-9_]+)\}\}/g, (_m, name: string) => {
    const v = INSIGHT_TOKEN_VALUES[name];
    if (v === undefined) throw new Error(`insights: unknown token {{${name}}}`);
    return v;
  });
}
