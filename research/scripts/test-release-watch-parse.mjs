#!/usr/bin/env node
/**
 * test-release-watch-parse.mjs — unit tests for release-watch-parse.mjs and
 * release-watch-state.mjs (parsing, fail-closed extraction, the release
 * recognition rule, and per-source dedupe/already-promoted filtering).
 *
 * NO NETWORK ACCESS ANYWHERE IN THIS FILE. Every case reads a small, hand
 * authored fixture file from ./fixtures/release-watch/ — synthetic
 * documents authored for this suite, never a live page. Every function
 * under test here is pure (string/object in, object out), so nothing in
 * this file needs a fake fetch at all.
 *
 * Run: node research/scripts/test-release-watch-parse.mjs
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseRss, parseAtom, parseJsonFeed, parseHtmlListing, parseSourceBytes, detectFormat, extractCandidates, recognizeRelease, ANNOUNCEMENT_KEYWORD_PATTERNS, VERSION_OR_NAME_TOKEN_RE } from "./lib/release-watch-parse.mjs";
import { emptySourceState, dedupeAgainstState, nextSourceState, updateStateFromScanRecord, extractPromotedLinks, filterAlreadyPromoted, candidateKey } from "./lib/release-watch-state.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = join(__dirname, "fixtures", "release-watch");

function fixture(name) {
  return readFileSync(join(FIXTURE_DIR, name), "utf8");
}

let passed = 0;
let failed = 0;

function assert(cond, message) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

// ── RSS 2.0 ────────────────────────────────────────────────────────────────

console.log("Test RSS-1: feed-rss.xml — dated+titled+linked item produces exactly one candidate with an ISO date");
{
  const text = fixture("feed-rss.xml");
  assert(detectFormat(text) === "rss", `expected detectFormat to say "rss", got "${detectFormat(text)}"`);
  const rawItems = parseRss(text);
  assert(rawItems.length === 3, `expected 3 raw <item> blocks extracted, got ${rawItems.length}`);
  const { candidates, dropped } = extractCandidates(rawItems, "src-fixture-labs-news");
  assert(candidates.length === 1, `expected exactly 1 candidate (the other two are missing date / missing title), got ${candidates.length}`);
  const c = candidates[0];
  assert(c.title === "Fixture Labs announces Fixture-4.2, a new frontier model", `unexpected candidate title: "${c.title}"`);
  assert(c.link === "https://fixturelabs.example/news/fixture-4-2-release", `unexpected candidate link: "${c.link}"`);
  assert(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(c.published_at), `published_at "${c.published_at}" is not ISO-8601`);
  assert(c.published_at.startsWith("2026-09-17"), `expected published_at to fall on 2026-09-17, got "${c.published_at}"`);
  assert(typeof c.snippet === "string" && c.snippet.length > 0, "candidate must carry a non-empty verbatim snippet");
  assert(dropped.length === 2, `expected 2 dropped items (no-date, no-title), got ${dropped.length}`);
  assert(dropped.some((d) => d.reason.startsWith("no-date")), "expected one dropped item with reason starting 'no-date'");
  assert(dropped.some((d) => d.reason.startsWith("no-title")), "expected one dropped item with reason starting 'no-title'");
}

// ── Atom ───────────────────────────────────────────────────────────────────

console.log("\nTest ATOM-1: feed-atom.xml — dated entry produces one candidate; undated entry is dropped, not guessed");
{
  const text = fixture("feed-atom.xml");
  assert(detectFormat(text) === "atom", `expected detectFormat to say "atom", got "${detectFormat(text)}"`);
  const rawItems = parseAtom(text);
  assert(rawItems.length === 2, `expected 2 raw <entry> blocks, got ${rawItems.length}`);
  const { candidates, dropped } = extractCandidates(rawItems, "src-fixture-ai-atom");
  assert(candidates.length === 1, `expected exactly 1 candidate, got ${candidates.length}`);
  assert(candidates[0].title === "Introducing FixtureModel v3.0", `unexpected title: "${candidates[0].title}"`);
  assert(candidates[0].link === "https://fixtureai.example/blog/fixturemodel-v3", `unexpected link: "${candidates[0].link}"`);
  assert(dropped.length === 1 && dropped[0].reason.startsWith("no-date"), `expected 1 dropped item with reason "no-date", got ${JSON.stringify(dropped)}`);
}

// ── JSON Feed ──────────────────────────────────────────────────────────────

console.log("\nTest JSONFEED-1: feed-jsonfeed.json — dated item produces one candidate; item with no date_published is dropped");
{
  const text = fixture("feed-jsonfeed.json");
  assert(detectFormat(text) === "json-feed", `expected detectFormat to say "json-feed", got "${detectFormat(text)}"`);
  const rawItems = parseJsonFeed(text);
  assert(rawItems.length === 2, `expected 2 raw items, got ${rawItems.length}`);
  const { candidates, dropped } = extractCandidates(rawItems, "src-fixture-robotics-changelog");
  assert(candidates.length === 1, `expected exactly 1 candidate, got ${candidates.length}`);
  assert(candidates[0].title === "FixtureBot 2.1 now available", `unexpected title: "${candidates[0].title}"`);
  assert(candidates[0].link === "https://fixturerobotics.example/changelog/fixturebot-2-1", `unexpected link: "${candidates[0].link}"`);
  assert(dropped.length === 1 && dropped[0].reason.startsWith("no-date"), `expected 1 dropped item with reason "no-date", got ${JSON.stringify(dropped)}`);
}

console.log("\nTest JSONFEED-2: malformed JSON body never throws — parseJsonFeed and parseSourceBytes degrade to zero items");
{
  const malformed = '{"version": "https://jsonfeed.org/version/1.1", "items": [ { "title": "unterminated';
  assert(parseJsonFeed(malformed).length === 0, "parseJsonFeed must return [] on malformed JSON, not throw");
  const result = parseSourceBytes(malformed);
  assert(result.items.length === 0, "parseSourceBytes must yield zero items for a malformed JSON Feed body");
}

// ── HTML listing fallback ────────────────────────────────────────────────

console.log("\nTest HTML-1: listing-dated.html — a link with an adjacent ISO date on the same line produces a candidate; a same-line-undated link does not");
{
  const text = fixture("listing-dated.html");
  assert(detectFormat(text) === "html", `expected detectFormat to say "html", got "${detectFormat(text)}"`);
  const rawItems = parseHtmlListing(text);
  assert(rawItems.length === 2, `expected 2 raw dated-link items (the undated <li> must be invisible to this fallback), got ${rawItems.length}`);
  const { candidates, dropped } = extractCandidates(rawItems, "src-fixture-provider-press");
  assert(candidates.length === 2, `expected 2 candidates, got ${candidates.length}`);
  assert(candidates.some((c) => c.link === "https://fixtureprovider.example/press/fixture-x1-launch" && c.published_at.startsWith("2026-09-15")), "expected the Fixture X1 launch candidate with published_at on 2026-09-15");
  assert(!candidates.some((c) => c.link.includes("undated-item")), "the undated item must never appear as a candidate — the HTML fallback must fail closed on it, not guess a date");
  assert(dropped.length === 0, `no dropped items expected here — the undated link never became a raw item at all (fails closed at parse time, not at extraction time), got ${JSON.stringify(dropped)}`);
}

console.log("\nTest HTML-2: listing-no-dates.html — a page with links but ZERO dates anywhere yields ZERO candidates (fail-closed positive control, V8)");
{
  const text = fixture("listing-no-dates.html");
  const rawItems = parseHtmlListing(text);
  assert(rawItems.length === 0, `expected 0 raw items from a page with no dates at all, got ${rawItems.length} — this is the fail-closed guarantee the HTML fallback exists to uphold`);
  const { candidates, dropped } = extractCandidates(rawItems, "src-fixture-provider-blog");
  assert(candidates.length === 0, "expected 0 candidates");
  assert(dropped.length === 0, "expected 0 dropped items too — nothing was ever extracted to drop, which is the correct absence, not a silently-passed check (V8)");
}

// ── Malformed / empty bodies ──────────────────────────────────────────────

console.log("\nTest MALFORMED-1: feed-malformed.xml (truncated RSS) never throws");
{
  const text = fixture("feed-malformed.xml");
  let threw = false;
  let result;
  try {
    result = parseSourceBytes(text);
  } catch {
    threw = true;
  }
  assert(threw === false, "parseSourceBytes must never throw on malformed XML");
  assert(Array.isArray(result?.items), "parseSourceBytes must return an items array even for malformed input");
  assert(result.parseError === null, "the tolerant regex extractor should degrade to a partial/empty result, not report a hard parseError, for malformed XML (it is not a real XML parser and does not detect malformedness directly — see file header)");
}

console.log("\nTest EMPTY-1: an empty body yields format 'empty' and zero items, never a crash");
{
  const text = fixture("feed-empty.txt");
  assert(text === "", "fixture file should be empty for this test to be meaningful");
  assert(detectFormat(text) === "empty", `expected detectFormat "empty" for an empty string, got "${detectFormat(text)}"`);
  const result = parseSourceBytes(text);
  assert(result.items.length === 0, "an empty body must yield zero items");
}

console.log("\nTest EMPTY-2: an unrecognised, non-empty body (plain prose) yields format 'unknown' and zero items, never a guess");
{
  const text = "Just some plain prose with no feed markup and no dates. Nothing to see here.";
  assert(detectFormat(text) === "unknown", `expected detectFormat "unknown", got "${detectFormat(text)}"`);
  const result = parseSourceBytes(text);
  assert(result.items.length === 0, "unrecognised prose must yield zero items — fail closed, never a guess at structure");
}

// ── Recognition rule ─────────────────────────────────────────────────────

console.log("\nTest RECOGNIZE-1: positive — a title with both an announcement keyword and a version-or-name token");
{
  const candidate = { title: "Fixture Labs announces Fixture-4.2, a new frontier model", snippet: "Today we are announcing the release of Fixture-4.2." };
  const r = recognizeRelease(candidate);
  assert(r.isReleaseCandidate === true, "expected isReleaseCandidate true for a clear announce+version title");
  assert(r.confidence > 0 && r.confidence <= 0.9, `expected confidence in (0, 0.9], got ${r.confidence}`);
  assert(r.matchedVersionToken !== null, "expected a matched version-or-name token");
  assert(r.matchedKeywords.length > 0, "expected at least one matched keyword");
}

console.log("\nTest RECOGNIZE-2: negative — keyword present, but no version-or-name token (fails closed on the required token)");
{
  const candidate = { title: "Fixture Labs announces a new safety initiative", snippet: "No version, no model name, just a policy announcement." };
  const r = recognizeRelease(candidate);
  assert(r.isReleaseCandidate === false, "expected isReleaseCandidate false with no version-or-name token");
  assert(r.confidence === 0, `expected confidence 0, got ${r.confidence}`);
  assert(r.matchedVersionToken === null, "expected no matched version token");
  assert(r.reasons.some((x) => x.includes("no version-or-name token")), "expected a reason naming the missing version token");
}

console.log("\nTest RECOGNIZE-3: negative — version-shaped token present, but no announcement keyword (fails closed on the required keyword)");
{
  const candidate = { title: "Fixture Labs Q3 2026 investor letter", snippet: "Revenue grew 4.2 percent this quarter." };
  const r = recognizeRelease(candidate);
  assert(r.isReleaseCandidate === false, "expected isReleaseCandidate false with no announcement keyword");
  assert(r.reasons.some((x) => x.includes("no announcement/release keyword")), "expected a reason naming the missing keyword");
}

console.log("\nTest RECOGNIZE-4: documented false-positive mode — a retrospective post reusing release vocabulary reads positive");
{
  // This is the documented false-positive mode from the file header: a
  // comparison/retrospective post is indistinguishable from a genuine
  // announcement by this rule. Asserted here so the mode is pinned by a
  // test, not just prose.
  const candidate = { title: "Looking back at how GPT-4 launched two years ago", snippet: "A retrospective on the original launch." };
  const r = recognizeRelease(candidate);
  assert(r.isReleaseCandidate === true, "documented false-positive: retrospective text with an announcement verb and a version-shaped token is scored positive by this rule");
}

console.log("\nTest RECOGNIZE-5: sanity — the keyword and token constants are non-empty and exported");
{
  assert(Array.isArray(ANNOUNCEMENT_KEYWORD_PATTERNS) && ANNOUNCEMENT_KEYWORD_PATTERNS.length > 0, "ANNOUNCEMENT_KEYWORD_PATTERNS must be a non-empty exported array");
  assert(VERSION_OR_NAME_TOKEN_RE instanceof RegExp, "VERSION_OR_NAME_TOKEN_RE must be an exported RegExp");
}

// ── Dedupe / state ────────────────────────────────────────────────────────

console.log("\nTest DEDUPE-1: a candidate not previously seen is fresh; the same candidate on a second run is dropped as already-seen");
{
  const state0 = emptySourceState();
  const candidate = { source_id: "src-x", title: "X announces Y-1.0", link: "https://x.example/y-1-0", published_at: "2026-09-17T00:00:00.000Z", snippet: "…" };

  const round1 = dedupeAgainstState([candidate], state0, "src-x");
  assert(round1.fresh.length === 1, "first time seeing this candidate, it must be fresh");
  assert(round1.dropped.length === 0, "nothing to drop on the first run");

  const state1 = nextSourceState(state0, "src-x", round1.fresh, { retrievedAt: "2026-09-17T00:05:00.000Z" });
  assert(Array.isArray(state1.sources["src-x"].seenKeys) && state1.sources["src-x"].seenKeys.includes(candidateKey(candidate)), "the candidate's dedupe key must be recorded in the advanced state");

  const round2 = dedupeAgainstState([candidate], state1, "src-x");
  assert(round2.fresh.length === 0, "the same candidate on a second run must NOT be reported again");
  assert(round2.dropped.length === 1 && round2.dropped[0].reason.startsWith("already-seen"), `expected 1 dropped item with reason starting "already-seen", got ${JSON.stringify(round2.dropped)}`);
}

console.log("\nTest DEDUPE-2: updateStateFromScanRecord advances state for every source touched, from candidates AND dropped_candidates");
{
  const state0 = emptySourceState();
  const now = new Date("2026-09-18T00:00:00Z");
  const record = {
    sources_reached: ["src-a", "src-b"],
    candidates: [{ source_id: "src-a", title: "A announces B-2.0", link: "https://a.example/b-2-0", published_at: "2026-09-17T00:00:00.000Z", snippet: "…" }],
    dropped_candidates: [{ source_id: "src-b", reason: "no-date: …", title: "Some post", link: "https://b.example/post" }],
  };
  const state1 = updateStateFromScanRecord(state0, record, now);
  assert(state1.sources["src-a"] && state1.sources["src-a"].seenKeys.length === 1, "src-a must have exactly one remembered key");
  assert(state1.sources["src-b"] && state1.sources["src-b"].seenKeys.length === 1, "src-b's dropped item must also be remembered so it is not re-reported next run");
  assert(state1.sources["src-a"].lastCheckedAt === now.toISOString(), "lastCheckedAt must be stamped from `now`");
}

console.log("\nTest DEDUPE-3: state is never mutated in place — nextSourceState returns a new object");
{
  const state0 = emptySourceState();
  const candidate = { source_id: "src-z", title: "Z", link: "https://z.example/1", published_at: "2026-09-17T00:00:00.000Z" };
  const state1 = nextSourceState(state0, "src-z", [candidate]);
  assert(state0.sources["src-z"] === undefined, "the original (prior) state object must not be mutated by nextSourceState");
  assert(state1 !== state0, "nextSourceState must return a new object, not the same reference");
}

// ── Already-promoted filtering ──────────────────────────────────────────

console.log("\nTest PROMOTED-1: a candidate whose link already appears as evidence on a confirmed release is not re-offered");
{
  const releaseStore = {
    releases: [{ release_id: "fixture--model--1-0", evidence: [{ source_url: "https://fixturelabs.example/news/fixture-4-2-release", publisher: "Fixture Labs", published_at: "2026-09-17", retrieved_at: "2026-09-17T14:31:00Z", archive_or_hash: "sha256:" + "a".repeat(64) }] }],
  };
  const promotedLinks = extractPromotedLinks(releaseStore);
  assert(promotedLinks.has("https://fixturelabs.example/news/fixture-4-2-release"), "extractPromotedLinks must collect the evidence source_url");

  const candidates = [
    { source_id: "src-fixture-labs-news", title: "Fixture Labs announces Fixture-4.2, a new frontier model", link: "https://fixturelabs.example/news/fixture-4-2-release", published_at: "2026-09-17T14:30:00.000Z", snippet: "…" },
    { source_id: "src-fixture-labs-news", title: "Fixture Labs announces Fixture-4.3", link: "https://fixturelabs.example/news/fixture-4-3-release", published_at: "2026-09-18T14:30:00.000Z", snippet: "…" },
  ];
  const { fresh, dropped } = filterAlreadyPromoted(candidates, promotedLinks);
  assert(fresh.length === 1 && fresh[0].link.endsWith("fixture-4-3-release"), "only the not-yet-promoted candidate should remain fresh");
  assert(dropped.length === 1 && dropped[0].reason.startsWith("already-promoted"), `expected 1 dropped item with reason starting "already-promoted", got ${JSON.stringify(dropped)}`);
}

console.log("\nTest PROMOTED-2: extractPromotedLinks on an empty/absent release store returns an empty Set, never throws");
{
  assert(extractPromotedLinks(undefined).size === 0, "extractPromotedLinks(undefined) must return an empty Set");
  assert(extractPromotedLinks({ releases: [] }).size === 0, "extractPromotedLinks({releases: []}) must return an empty Set");
}

// ── Summary ─────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(70)}`);
console.log(`TOTAL: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.error(`\nFAILED — ${failed} test(s) did not pass\n`);
  process.exit(1);
} else {
  console.log(`\nAll ${passed} tests passed\n`);
  process.exit(0);
}
