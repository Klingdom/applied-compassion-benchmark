#!/usr/bin/env node
/**
 * test-feed-freshness.mjs — PUB-1.
 *
 * The committed feed and OG images are BUILD ARTIFACTS that live in git. The
 * nightly research pipeline adds an update or a briefing and commits it without
 * running the build, so the artifacts rot silently while every route keeps
 * working.
 *
 * WHAT ROTTED, 2026-09-25
 *   `site/public/updates/feed.json` and `feed.xml` topped out at 2026-09-15
 *   while six newer briefings existed, and six OG preview images were missing
 *   from the repo entirely. **Reader impact: RSS and JSON subscribers would not
 *   have seen four of the most recent briefings even after a deploy, and their
 *   social previews would 404.** It was fixed by committing the regenerated
 *   artifacts, and explicitly NOT gated at the time.
 *
 * WHY THE EXISTING DRIFT CHECKER DOES NOT CATCH IT
 *   `check-publication-drift.mjs` (It. 36) asks the ROUTES whether a briefing is
 *   served. The routes were fine. The feed was not. A check aimed at one
 *   artifact says nothing about a sibling generated from the same inputs.
 *
 * WHAT IS ASSERTED
 *   1. HEAD FRESHNESS. The newest date in the manifest must be the newest in
 *      feed.json, and must appear in feed.xml. This is the invariant that
 *      actually broke — not total coverage, because the feed is deliberately
 *      capped at its most recent items and older dates dropping off is correct.
 *   2. NO PHANTOMS. Every date in the feed must be a real manifest date, so a
 *      hand-edited or half-regenerated feed fails too.
 *   3. OG COVERAGE. Every special briefing and every date the feed advertises
 *      must have its committed preview image, because a 404 preview is the part
 *      a reader sees on someone else's timeline.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const MANIFEST = join(REPO, "site", "src", "data", "updates", "manifest.json");
const FEED_JSON = join(REPO, "site", "public", "updates", "feed.json");
const FEED_XML = join(REPO, "site", "public", "updates", "feed.xml");
const SPECIAL_DIR = join(REPO, "site", "src", "data", "special-briefings");
const OG_DIR = join(REPO, "site", "public", "og");

let failed = 0;
let passed = 0;
const assert = (label, cond, detail = "") => {
  if (cond) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
};

for (const f of [MANIFEST, FEED_JSON, FEED_XML]) {
  if (!existsSync(f)) {
    console.log(`FAIL: required file missing: ${f}`);
    process.exit(1);
  }
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const manifestDates = Array.isArray(manifest.dates) ? [...manifest.dates].sort() : [];
const feedJson = JSON.parse(readFileSync(FEED_JSON, "utf8"));
const feedXml = readFileSync(FEED_XML, "utf8");
const feedDates = (feedJson.items ?? []).map((i) => String(i.url ?? "").split("/").pop()).filter(Boolean);
const ogFiles = new Set(readdirSync(OG_DIR));

// ---- Check A: not vacuous (V8) ----------------------------------------
console.log("\nCheck A — the inputs are real");
assert(`manifest holds dates (${manifestDates.length})`, manifestDates.length > 20, "too few to be the real manifest");
assert(`feed.json holds items (${feedDates.length})`, feedDates.length > 5);
assert(`og directory holds images (${ogFiles.size})`, ogFiles.size > 50);
assert("every feed date looks like an ISO date", feedDates.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)), feedDates.find((d) => !/^\d{4}-\d{2}-\d{2}$/.test(d)));

// ---- Check B: head freshness — the invariant that broke ---------------
console.log("\nCheck B — the feed head keeps up with the manifest head");
const newestManifest = manifestDates[manifestDates.length - 1];
const newestFeed = [...feedDates].sort()[feedDates.length - 1];
assert(
  `feed.json's newest entry (${newestFeed}) is the manifest's newest (${newestManifest})`,
  newestFeed === newestManifest,
  "the committed feed is STALE. Run `npm run build` and commit the regenerated artifacts — subscribers see the feed, not the routes."
);
assert(
  `feed.xml contains ${newestManifest}`,
  feedXml.includes(newestManifest),
  "feed.xml is stale even if feed.json is current — they are generated together and must be committed together"
);

// ---- Check C: no phantom entries --------------------------------------
console.log("\nCheck C — the feed advertises nothing that does not exist");
const phantom = feedDates.filter((d) => !manifestDates.includes(d));
assert(
  "every feed date is a real manifest date",
  phantom.length === 0,
  `${phantom.join(", ")} appear in the feed but not the manifest — a hand-edited or half-regenerated feed`
);

// ---- Check D: OG previews exist --------------------------------------
console.log("\nCheck D — every advertised page has its committed preview image");
const specialBriefings = readdirSync(SPECIAL_DIR)
  .filter((f) => f.endsWith(".json") && f !== "manifest.json");
const missingSpecial = specialBriefings
  .map((f) => `special-${f.replace(/\.json$/, "")}.png`)
  .filter((n) => !ogFiles.has(n));
assert(
  `all ${specialBriefings.length} special briefings have an OG image`,
  missingSpecial.length === 0,
  `${missingSpecial.join(", ")} missing — the social preview would 404`
);

const missingUpdates = feedDates.filter((d) => !ogFiles.has(`updates-${d}.png`));
assert(
  `all ${feedDates.length} feed dates have an OG image`,
  missingUpdates.length === 0,
  `${missingUpdates.join(", ")} missing`
);

// ---- report ----------------------------------------------------------
console.log("");
if (failed > 0) {
  console.log(`FAIL — ${failed} failure(s). These are tracked build artifacts: regenerate with \`npm run build\` and commit them.`);
  process.exit(1);
}
console.log(`PASS — feed head current at ${newestManifest}; ${passed} checks.`);
