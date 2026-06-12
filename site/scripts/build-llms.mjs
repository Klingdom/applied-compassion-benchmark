#!/usr/bin/env node
/**
 * build-llms.mjs — Generate site/public/llms.txt
 *
 * Generates the llms.txt file from the canonical index list so it can never
 * drift from the actual site structure. Follows the emerging llms.txt standard
 * for AI crawler orientation.
 *
 * Run: node site/scripts/build-llms.mjs
 * Also wired into npm run prebuild (runs before next build).
 *
 * All URLs listed must be real 200 pages in the static export.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SITE_ROOT = resolve(__dirname, "..");
const OUTPUT_PATH = join(SITE_ROOT, "public", "llms.txt");
const BASE_URL = "https://compassionbenchmark.com";

// Canonical index list — kept in sync with KIND_CONFIG in entities.ts.
// Every URL here must resolve to a real 200 page in the static export.
const CORE_INDEXES = [
  { label: "World Countries Index 2026",         url: `${BASE_URL}/countries` },
  { label: "U.S. States Index 2026",             url: `${BASE_URL}/us-states` },
  { label: "Fortune 500 Index 2026",             url: `${BASE_URL}/fortune-500` },
  { label: "AI Labs Index 2026",                 url: `${BASE_URL}/ai-labs` },
  { label: "Humanoid Robotics Labs Index 2026",  url: `${BASE_URL}/robotics-labs` },
  { label: "U.S. Cities Index 2026",             url: `${BASE_URL}/us-cities` },
  { label: "Global Cities Index 2026",           url: `${BASE_URL}/global-cities` },
];

function buildLlmsTxt() {
  const indexLines = CORE_INDEXES.map(
    (idx) => `- ${idx.label}: ${idx.url}`,
  ).join("\n");

  const content = `# Compassion Benchmark — llms.txt
# Independent benchmark institution measuring how institutions recognize,
# respond to, and reduce suffering. Free to cite with attribution.

> Compassion Benchmark publishes comparative compassion rankings across
> 1,160+ entities in 7 indexes (countries, US states, Fortune 500 companies,
> AI labs, robotics labs, US cities, global cities), scored on 8 dimensions
> of institutional compassion. Methodology and primary-source evidence are public.

## Core indexes (datasets)
${indexLines}

## Methodology & framework
- Methodology (8 dimensions, 40 subdimensions, 5 bands): ${BASE_URL}/methodology

## Freshness
- Daily research briefings: ${BASE_URL}/updates
- RSS feed: ${BASE_URL}/updates/feed.xml
- JSON feed: ${BASE_URL}/updates/feed.json

## Attribution
Cite as: "Compassion Benchmark (compassionbenchmark.com)". Scores are dated;
always include the assessment date and that scores are out of 100.
`;

  mkdirSync(join(SITE_ROOT, "public"), { recursive: true });
  writeFileSync(OUTPUT_PATH, content, "utf-8");
  console.log(`[build-llms] Written site/public/llms.txt (${CORE_INDEXES.length} indexes)`);
}

buildLlmsTxt();
