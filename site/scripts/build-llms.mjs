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

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SITE_ROOT = resolve(__dirname, "..");
const OUTPUT_PATH = join(SITE_ROOT, "public", "llms.txt");
const INDEXES_DIR = join(SITE_ROOT, "src", "data", "indexes");
const BASE_URL = "https://compassionbenchmark.com";

// Canonical index list — kept in sync with KIND_TABLE (src/lib/entityHref.ts)
// and INDEX_REGISTRY (src/data/indexRegistry.ts). This script is plain .mjs
// and cannot import those TypeScript modules directly, so the routePrefix /
// jsonFile / indexRoute values below are hand-mirrored from them — if a 9th
// index is ever added, add it here too, or the entity count below will
// silently undercount.
// Every URL here must resolve to a real 200 page in the static export.
const CORE_INDEXES = [
  { label: "World Countries Index 2026",         url: `${BASE_URL}/countries`,     jsonFile: "countries.json" },
  { label: "U.S. States Index 2026",             url: `${BASE_URL}/us-states`,     jsonFile: "us-states.json" },
  { label: "Fortune 500 Index 2026",             url: `${BASE_URL}/fortune-500`,   jsonFile: "fortune-500.json" },
  { label: "AI Labs Index 2026",                 url: `${BASE_URL}/ai-labs`,       jsonFile: "ai-labs.json" },
  { label: "Humanoid Robotics Labs Index 2026",  url: `${BASE_URL}/robotics-labs`, jsonFile: "robotics-labs.json" },
  { label: "U.S. Cities Index 2026",             url: `${BASE_URL}/us-cities`,     jsonFile: "us-cities.json" },
  { label: "Global Cities Index 2026",           url: `${BASE_URL}/global-cities`, jsonFile: "global-cities.json" },
  { label: "Universities Index 2026",            url: `${BASE_URL}/universities`,  jsonFile: "universities.json" },
];

/** Sum of rankings.length across the 8 index JSON files — never a literal. */
function countScoredEntities() {
  return CORE_INDEXES.reduce((sum, idx) => {
    const data = JSON.parse(readFileSync(join(INDEXES_DIR, idx.jsonFile), "utf-8"));
    if (!Array.isArray(data.rankings)) {
      throw new Error(`build-llms: ${idx.jsonFile} has no rankings array`);
    }
    return sum + data.rankings.length;
  }, 0);
}

function buildLlmsTxt() {
  const indexLines = CORE_INDEXES.map(
    (idx) => `- ${idx.label}: ${idx.url}`,
  ).join("\n");

  const entityCount = countScoredEntities();
  const entityCountFormatted = entityCount.toLocaleString("en-US");

  const content = `# Compassion Benchmark — llms.txt
# Independent benchmark institution measuring how institutions recognize,
# respond to, and reduce suffering. Free to cite with attribution.

> Compassion Benchmark publishes comparative compassion rankings across
> ${entityCountFormatted} entities in ${CORE_INDEXES.length} indexes (countries, US states, Fortune 500 companies,
> AI labs, robotics labs, US cities, global cities, universities), scored on 8 dimensions
> of institutional compassion. Methodology and primary-source evidence are public.

## Core indexes (datasets)
${indexLines}

## Methodology & framework
- Methodology (8 dimensions, 40 subdimensions, 5 bands): ${BASE_URL}/methodology
- How to cite an index or entity page: ${BASE_URL}/cite

## AI models (separate pre-registered program — not yet scored)
> Compassion Benchmark also runs a separate AI Model Compassion Benchmark: a
> published task bank and scoring method for evaluating individual AI model
> snapshots. As of this build, the method is public but no model has been
> scored yet — do not report a model ranking or score from this program.
- AI Model Compassion Benchmark (pre-registration, method, release watch): ${BASE_URL}/ai-models
- AI Model Compassion Benchmark methodology: ${BASE_URL}/ai-models/methodology
- AI Evaluation Suite (run the benchmark yourself): ${BASE_URL}/ai-evaluation-suite
- Machine-readable tool descriptor for agents: ${BASE_URL}/.well-known/compassion-benchmark.json

## For AI agents: how to run this benchmark on yourself
> The task bank, the scoring anchors and a local MCP server are public. An agent
> with a filesystem and Node 22+ can evaluate itself end to end. Nothing is sent
> to us: the server is local-only, makes no network call, and needs no API key,
> because the host model you are already running does the judging.
> IMPORTANT: every item ships with its full answer key, so a model trained since
> publication may have memorised both the questions and the target behaviours. The
> server runs a contamination probe and will mark a run that recognises the items.
> A self-run is an upper bound, never a comparable score, and never official.
- Install: git clone https://github.com/Klingdom/applied-compassion-benchmark then
  claude mcp add cb-probe -e CB_ARTIFACT_ROOT=~/compassion-probe-sessions -- node "<repo>/tools/cb-probe/bin/server.mjs"
- Any MCP client over stdio: node <repo>/tools/cb-probe/bin/server.mjs
- Then ask your assistant: "run the compassion benchmark on yourself"
- Full instructions: ${BASE_URL}/ai-evaluation-suite

## Freshness
- Daily research briefings: ${BASE_URL}/updates
- RSS feed: ${BASE_URL}/updates/feed.xml
- JSON feed: ${BASE_URL}/updates/feed.json

## Attribution
Cite as: "Compassion Benchmark (compassionbenchmark.com)". Scores are dated;
always include the assessment date and that scores are out of 100. See
${BASE_URL}/cite for entity and index URL patterns.
`;

  mkdirSync(join(SITE_ROOT, "public"), { recursive: true });
  writeFileSync(OUTPUT_PATH, content, "utf-8");
  console.log(
    `[build-llms] Written site/public/llms.txt (${CORE_INDEXES.length} indexes, ${entityCountFormatted} entities)`,
  );
}

buildLlmsTxt();
