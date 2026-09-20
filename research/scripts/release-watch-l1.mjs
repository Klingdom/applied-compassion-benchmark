#!/usr/bin/env node

/**
 * release-watch-l1.mjs — L1 declared-source-registry fetcher AND parser
 * (`docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §2.7, degradation ladder
 * level L1: "Source-registry fetch. Enumerate release-sources-v1.json and
 * retrieve each declared URL directly. No search tool at all.").
 *
 * ── What this script does ────────────────────────────────────────────────
 * Enumerates `site/src/data/model-benchmark/release-sources-v1.json`,
 * HTTP-GETs each declared source URL, hashes the retrieved bytes
 * (`sha256:<64 hex>`, the same `archive_or_hash` format
 * scripts/lib/model-releases-validator.mjs enforces on evidence), and
 * writes ONE scan record to
 * `research/model-index/release-watch/<scan_id>.json` per §2.6's schema.
 *
 * As of this revision it ALSO reads what it fetches. Parsing is delegated
 * entirely to `lib/release-watch-parse.mjs` (RSS 2.0, Atom, JSON Feed, and
 * a conservative HTML-listing fallback — all pure functions over a string,
 * tested offline against fixtures in `fixtures/release-watch/`) and
 * `lib/release-watch-state.mjs` (per-source dedupe and "already promoted"
 * filtering, also pure). This file's own job stays orchestration only: it
 * fetches, calls the pure parse/dedupe functions, and writes the result.
 * Previously this script's header said plainly: "does not parse retrieved
 * bytes." That limitation is what this revision removes.
 *
 * ── What this script still does NOT do (by design, not by omission) ─────
 * It STILL NEVER writes a row to `releases-v1.json`. Every parsed,
 * extracted, recognised item lands in the scan record's `candidates[]`
 * array — annotated with the recognition rule's confidence — for a human
 * to review. Promoting a scan observation into a confirmed release remains
 * a separate, human-gated step (§2.5's state machine, transitions T1/T3:
 * evidence meeting the registry's five-field bar, `confirmation_status:
 * confirmed`, and — for T3 — a second independent source or a primary
 * provider source). That step is not implemented by this file, and nothing
 * added in this revision changes that: the recognition rule reports a
 * confidence, it never promotes.
 *
 * It NEVER invents a source. The registry it reads is the only legal input;
 * if it is empty (as it is today — §2.7, R6/R11 not yet done by a human),
 * this script has nothing to fetch and says so as data, not as a crash.
 *
 * It NEVER invents a candidate. Extraction is fail-closed: an item with no
 * parseable date, no title, or no link is dropped into
 * `dropped_candidates[]` with a named reason — never guessed into being. A
 * dropped item this run stays dropped on the next run too (dedupe applies
 * to drops as well as candidates), so a source that is mostly noise does
 * not get re-triaged by a human every single day.
 *
 * ── The honest-emptiness contract this script exists to uphold ──────────
 * `.benchmark-ops/RELEASE_WATCH.md` invariant 3: "A scan that did not run
 * is not a scan that found nothing." With zero declared sources (or when
 * run in the default dry-run mode), this script cannot claim coverage, so
 * it writes `status: "not-run"` naming the blocker in `blocked_by` — never
 * a false `"completed"`. If a fetch is attempted (`--live`, sources > 0)
 * and something throws before the scan can finish, it writes `status:
 * "aborted"` naming `abort_reason` instead. One of these three outcomes
 * (not-run / aborted / completed) is always written — this script never
 * exits without producing a scan record.
 *
 * A `--fixture-run` (new in this revision) proves the entire fetch → parse
 * → extract → recognise → dedupe path end to end against committed
 * fixtures, with zero live sources and zero network calls. It reuses the
 * exact same `runL1Scan` core as a real `--live` run (a fixture fetch
 * implementation stands in for `globalThis.fetch`), so the proof is of the
 * real code path, not a separate mock. Its scan record is written to
 * `research/model-index/release-watch/fixture-runs/`, carries
 * `fixture_run: true`, and never touches the live per-source dedupe state
 * — see the CLI section below.
 *
 * Usage:
 *   node research/scripts/release-watch-l1.mjs               (dry run, default)
 *   node research/scripts/release-watch-l1.mjs --dry-run      (explicit, same as above)
 *   node research/scripts/release-watch-l1.mjs --live         (PERFORMS OUTBOUND HTTP
 *                                                               REQUESTS to every URL
 *                                                               declared in
 *                                                               release-sources-v1.json)
 *   node research/scripts/release-watch-l1.mjs --fixture-run   (no network; runs the
 *                                                               real pipeline against
 *                                                               committed fixtures)
 *   node research/scripts/release-watch-l1.mjs --help
 *
 * --dry-run (the default) performs NO network I/O at all — not even to
 * check reachability. It still writes a legal scan record (status
 * "not-run", naming the dry-run as the reason coverage was not attempted),
 * because a run that produced no record would be indistinguishable from a
 * run that never happened.
 *
 * --live performs outbound HTTP GET requests to every URL declared in
 * release-sources-v1.json. Only pass this flag when you intend to make
 * those requests.
 *
 * --fixture-run performs NO network I/O. It runs the same `runL1Scan` core
 * used by --live, against a small in-memory source registry pointing at
 * files under fixtures/release-watch/, read from local disk. It is a demo
 * and a proof, not coverage: the record it writes is never counted toward
 * `releases-v1.json`'s `scanState`/`coverageClaim` (release-watch-l1.mjs
 * never writes that file at all, in any mode), and it is written to a
 * separate directory precisely so it is never mistaken for a real scan by
 * `validate-model-releases.mjs`'s scan-record count.
 *
 * Exit code 0 = a scan record was written (regardless of status — writing
 *   an honest "not-run"/"aborted" record is success for this script).
 * Exit code 1 = the script could not even write a scan record (fatal I/O
 *   error reading the source registry or writing the output file).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseSourceBytes, extractCandidates, recognizeRelease } from "./lib/release-watch-parse.mjs";
import { emptySourceState, dedupeAgainstState, filterAlreadyPromoted, extractPromotedLinks, updateStateFromScanRecord } from "./lib/release-watch-state.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");
export const SOURCES_PATH = join(REPO_ROOT, "site", "src", "data", "model-benchmark", "release-sources-v1.json");
export const RELEASES_PATH = join(REPO_ROOT, "site", "src", "data", "model-benchmark", "releases-v1.json");
export const SCAN_RECORD_DIR = join(REPO_ROOT, "research", "model-index", "release-watch");
// A subdirectory, deliberately: validate-model-releases.mjs treats every
// *top-level* ".json" file directly in SCAN_RECORD_DIR as a scan record
// (`readdirSync(SCAN_RECORD_DIR).filter(f => f.endsWith(".json"))`). Nesting
// state and fixture-run output one level down keeps both invisible to that
// scan, which is a correctness requirement, not a tidiness preference.
export const SOURCE_STATE_DIR = join(SCAN_RECORD_DIR, "state");
export const SOURCE_STATE_PATH = join(SOURCE_STATE_DIR, "source-state.json");
export const FIXTURE_SCAN_RECORD_DIR = join(SCAN_RECORD_DIR, "fixture-runs");
export const FIXTURE_SOURCE_STATE_PATH = join(FIXTURE_SCAN_RECORD_DIR, "source-state.json");
export const FIXTURE_DIR = join(__dirname, "fixtures", "release-watch");

const HELP_TEXT = `
release-watch-l1.mjs — L1 declared-source-registry fetcher AND parser (see file header for full design notes)

Usage:
  node research/scripts/release-watch-l1.mjs [--dry-run | --live | --fixture-run] [--help]

Options:
  --dry-run      (default) Perform NO network I/O. Writes a "not-run" scan
                 record naming the dry-run as the reason. Safe to run any time.
  --live         Perform outbound HTTP GET requests to every URL declared in
                 release-sources-v1.json, then parse, extract, recognise, and
                 dedupe what was fetched. Makes real network calls.
  --fixture-run  Perform NO network I/O. Runs the identical pipeline against
                 committed fixtures (fixtures/release-watch/) via a local-file
                 fetch shim. Writes its scan record to
                 research/model-index/release-watch/fixture-runs/, marked
                 fixture_run: true. Proves the path; claims no coverage.
  --help         Print this message and exit 0.

This script never writes a row to releases-v1.json. It writes exactly one
scan record to research/model-index/release-watch/<scan_id>.json (or, for
--fixture-run, to the fixture-runs/ subdirectory) describing what it saw,
what it extracted, what it dropped and why, and the coverage it actually
achieved. Per-source dedupe state lives in
research/model-index/release-watch/state/source-state.json (live) or
research/model-index/release-watch/fixture-runs/source-state.json (fixture).
`.trim();

// ── Pure helpers (exported for the no-network test suite) ──────────────────

/**
 * @param {ArrayBuffer|Buffer} bytes
 * @returns {string} "sha256:<64 hex>" — the same format
 *   scripts/lib/model-releases-validator.mjs's isValidArchiveOrHash accepts.
 */
export function hashBytes(bytes) {
  const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  return `sha256:${createHash("sha256").update(buf).digest("hex")}`;
}

/**
 * Deterministic scan_id, sequenced per day so multiple runs on the same
 * date never collide. Default format "scan-YYYY-MM-DD-NNN" (§2.6); a
 * caller may supply a different `prefixLabel` (e.g. "fixture-scan") to
 * sequence a separate, clearly-labelled id space — used by --fixture-run
 * so a fixture scan_id can never be mistaken for a real one.
 *
 * @param {Date} now
 * @param {string[]} existingScanIds scan_ids already present on disk (or,
 *   in tests, an in-memory fixture list)
 * @param {string} [prefixLabel]
 * @returns {string}
 */
export function computeScanId(now, existingScanIds = [], prefixLabel = "scan") {
  const datePart = now.toISOString().slice(0, 10);
  const prefix = `${prefixLabel}-${datePart}-`;
  const usedSeqs = existingScanIds.filter((id) => typeof id === "string" && id.startsWith(prefix)).map((id) => Number.parseInt(id.slice(prefix.length), 10)).filter((n) => Number.isInteger(n));
  const nextSeq = (usedSeqs.length > 0 ? Math.max(...usedSeqs) : 0) + 1;
  return `${prefix}${String(nextSeq).padStart(3, "0")}`;
}

/**
 * Decodes fetched bytes as UTF-8 text for parsing. Documented limitation:
 * this does not honour an `encoding="…"` attribute inside an XML prolog or
 * a `charset=` in a Content-Type header — it always decodes as UTF-8. A
 * feed genuinely served in a legacy encoding will parse as mojibake, which
 * degrades gracefully (the parser below simply will not match tag/date
 * patterns in the corrupted text and drops those items) rather than
 * crashing or fabricating a date/title from garbled bytes.
 *
 * @param {ArrayBuffer|Buffer} bytes
 * @returns {string}
 */
export function bytesToText(bytes) {
  const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  return buf.toString("utf8");
}

/**
 * Retrieve one declared source. Never called at all in dry-run mode — the
 * caller (runL1Scan) short-circuits before this function is reached.
 *
 * @param {{source_id: string, url: string}} source
 * @param {(url: string) => Promise<{ok: boolean, status: number, arrayBuffer: () => Promise<ArrayBuffer>}>} fetchImpl
 *   injected fetch dependency — production passes globalThis.fetch, tests
 *   inject a fake with no network access at all.
 * @param {Date} now
 * @returns {Promise<{source_id: string, reached: boolean, archive_or_hash?: string, retrieved_at?: string, status?: number, reason?: string, bodyText?: string}>}
 *   `bodyText` is present only on a reached source — it is the decoded
 *   response body handed to the parser, and is NEVER written into the scan
 *   record itself (only the hash and the parsed/extracted results are).
 */
export async function retrieveSource(source, fetchImpl, now) {
  try {
    const response = await fetchImpl(source.url);
    if (!response || response.ok !== true) {
      return { source_id: source.source_id, reached: false, reason: `http-${response?.status ?? "unknown"}` };
    }
    const bytes = await response.arrayBuffer();
    return {
      source_id: source.source_id,
      reached: true,
      archive_or_hash: hashBytes(bytes),
      retrieved_at: now.toISOString(),
      status: response.status,
      bodyText: bytesToText(bytes),
    };
  } catch (err) {
    return { source_id: source.source_id, reached: false, reason: `fetch-error: ${err?.message ?? String(err)}` };
  }
}

/**
 * Core orchestration. Pure with respect to the filesystem and the network —
 * every external effect (HTTP, wall clock) is passed in, so this is what
 * the no-network test suite exercises directly.
 *
 * @param {{sources?: Array<object>, meta?: {quorumRequired?: number|null}}} sourceRegistry
 *   parsed contents of release-sources-v1.json
 * @param {{now: Date, live: boolean, fetchImpl?: (url: string) => Promise<any>, existingScanIds?: string[],
 *   sourceState?: object, promotedLinks?: Set<string>, fixtureRun?: boolean, scanIdPrefix?: string}} opts
 *   `sourceState` (default: empty) and `promotedLinks` (default: empty Set)
 *   are pure DATA inputs — this function does not read them from disk; the
 *   CLI does that and passes the parsed result in, which is what keeps this
 *   function itself free of filesystem/network side effects.
 * @returns {Promise<object>} a complete scan record per §2.6's schema, now
 *   also carrying real `candidates[]`/`dropped_candidates[]` when parsing
 *   ran (previously both were always empty — see the file header).
 */
export async function runL1Scan(sourceRegistry, opts) {
  const now = opts.now instanceof Date ? opts.now : new Date();
  const live = opts.live === true;
  const existingScanIds = Array.isArray(opts.existingScanIds) ? opts.existingScanIds : [];
  const sources = Array.isArray(sourceRegistry?.sources) ? sourceRegistry.sources : [];
  const sourceState = opts.sourceState && typeof opts.sourceState === "object" ? opts.sourceState : emptySourceState();
  const promotedLinks = opts.promotedLinks instanceof Set ? opts.promotedLinks : new Set(Array.isArray(opts.promotedLinks) ? opts.promotedLinks : []);
  const fixtureRun = opts.fixtureRun === true;
  const scan_id = computeScanId(now, existingScanIds, opts.scanIdPrefix ?? (fixtureRun ? "fixture-scan" : "scan"));
  const started_at = now.toISOString();
  const todayDate = now.toISOString().slice(0, 10);

  const baseRecord = {
    scan_id,
    started_at,
    window: { from: null, to: null },
    method: "source_fetch",
    budget: { tool: "http-get", calls_allowed: null, calls_used: 0, exhausted: false },
    sources_planned: sources.map((s) => s?.source_id).filter((id) => typeof id === "string"),
    sources_reached: [],
    sources_failed: [],
    quorum: { required: sourceRegistry?.meta?.quorumRequired ?? null, reached: 0, met: false },
    candidates: [],
    dropped_candidates: [],
    promoted_release_ids: [],
    // A fixture run proves the pipeline; it is never coverage. §2.4's
    // coverageClaim/scanState live in releases-v1.json, which this script
    // never writes in any mode — but the field is asserted here too, on
    // the scan record itself, so a reader of the record alone (without
    // cross-referencing which directory it came from) still sees it named.
    fixture_run: fixtureRun,
  };

  // ── Zero declared sources: the honest today-state. Cannot claim coverage
  // over an empty registry — write "not-run" naming the blocker, never a
  // false "completed". This is the DEFAULT path until a human completes
  // R6/R11 (populating release-sources-v1.json from verified URLs).
  if (sources.length === 0) {
    return {
      ...baseRecord,
      status: "not-run",
      ended_at: now.toISOString(),
      abort_reason: null,
      blocked_by: "no-sources-registered: release-sources-v1.json has 0 entries — a human must add a verified source (§2.7 R6/R11) before L1 can run",
    };
  }

  // ── Dry run (the default, even with sources declared): perform NO
  // network I/O. A dry run that fetched nothing cannot claim it retrieved
  // anything, so it is also "not-run", not a false "completed".
  if (!live) {
    return {
      ...baseRecord,
      status: "not-run",
      ended_at: now.toISOString(),
      abort_reason: null,
      blocked_by: "dry-run: no network request was made — re-run with --live to fetch the declared sources",
    };
  }

  // ── Live fetch against a non-empty registry.
  const fetchImpl = opts.fetchImpl;
  if (typeof fetchImpl !== "function") {
    return {
      ...baseRecord,
      status: "aborted",
      ended_at: now.toISOString(),
      abort_reason: "internal error: --live requested but no fetch implementation was supplied",
      blocked_by: null,
    };
  }

  try {
    const results = [];
    for (const source of sources) {
      // eslint-disable-next-line no-await-in-loop -- sources are fetched
      // sequentially and deliberately, not in parallel: this is a small,
      // human-curated list, not a search sweep, and sequential fetches keep
      // per-source failures cleanly attributable.
      results.push(await retrieveSource(source, fetchImpl, now));
    }

    const sources_reached = results.filter((r) => r.reached).map((r) => r.source_id);
    const sources_failed = results.filter((r) => !r.reached).map((r) => ({ source_id: r.source_id, reason: r.reason ?? "unknown" }));
    const reachedPrimaryCount = sources.filter((s) => s?.tier === "primary" && sources_reached.includes(s.source_id)).length;
    const required = sourceRegistry?.meta?.quorumRequired ?? null;
    const met = required !== null && reachedPrimaryCount >= required;

    // ── Read what was fetched (task requirement 1). For every reached
    // source: parse its bytes into raw dated items, apply the fail-closed
    // extraction bar (date + title + link, all required), drop anything
    // already promoted into a confirmed release, drop anything already
    // reported in a previous scan (dedupe, requirement 4), then annotate
    // every surviving candidate with the recognition rule's verdict
    // (requirement 3) — never dropping a candidate for a low/negative
    // recognition result. Every branch below is defensive: a parse error
    // on one source degrades to zero candidates for that source and is
    // itemised in dropped_candidates, never a thrown exception that aborts
    // the whole scan (a malformed byte stream from one source must not
    // cost coverage on every other source).
    const candidates = [];
    const droppedCandidates = [];
    for (const result of results) {
      if (!result.reached || typeof result.bodyText !== "string") continue;
      const { format, items, parseError } = parseSourceBytes(result.bodyText);
      if (parseError) {
        droppedCandidates.push({ source_id: result.source_id, reason: `parse-error: ${parseError} — no candidates could be extracted from this source this run`, title: null, link: null, snippet: null });
      }
      const extracted = extractCandidates(items, result.source_id);
      droppedCandidates.push(...extracted.dropped);

      const promotedFiltered = filterAlreadyPromoted(extracted.candidates, promotedLinks);
      droppedCandidates.push(...promotedFiltered.dropped);

      const deduped = dedupeAgainstState(promotedFiltered.fresh, sourceState, result.source_id);
      droppedCandidates.push(...deduped.dropped);

      for (const c of deduped.fresh) {
        const recognition = recognizeRelease(c);
        candidates.push({
          ...c,
          format,
          is_release_candidate: recognition.isReleaseCandidate,
          confidence: recognition.confidence,
          matched_keywords: recognition.matchedKeywords,
          matched_version_token: recognition.matchedVersionToken,
          recognition_reasons: recognition.reasons,
        });
      }
    }

    return {
      ...baseRecord,
      window: { from: todayDate, to: todayDate },
      status: "completed",
      ended_at: new Date().toISOString(),
      sources_reached,
      sources_failed,
      quorum: { required, reached: reachedPrimaryCount, met },
      candidates,
      dropped_candidates: droppedCandidates,
      abort_reason: null,
      blocked_by: null,
    };
  } catch (err) {
    return {
      ...baseRecord,
      status: "aborted",
      ended_at: new Date().toISOString(),
      abort_reason: `unexpected error during live fetch: ${err?.message ?? String(err)}`,
      blocked_by: null,
    };
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const help = argv.includes("--help") || argv.includes("-h");
  const fixtureRun = argv.includes("--fixture-run");
  const live = argv.includes("--live") && !fixtureRun;
  const dryRun = !live && !fixtureRun; // dry-run is the default when neither --live nor --fixture-run is given
  return { help, live, dryRun, fixtureRun };
}

function loadSourceRegistry() {
  return JSON.parse(readFileSync(SOURCES_PATH, "utf8"));
}

/**
 * Read-only. Returns the set of evidence source_urls already recorded on
 * confirmed releases, so this run does not re-offer them as candidates.
 * Tolerates a missing/unparseable file (returns an empty Set) — this
 * script must never fail a scan because the (separately-owned) releases
 * store could not be read.
 */
function loadPromotedLinks() {
  try {
    return extractPromotedLinks(JSON.parse(readFileSync(RELEASES_PATH, "utf8")));
  } catch {
    return new Set();
  }
}

function loadSourceState(statePath) {
  try {
    return JSON.parse(readFileSync(statePath, "utf8"));
  } catch {
    return emptySourceState();
  }
}

function writeSourceState(statePath, state) {
  const dir = dirname(statePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function listExistingScanIds(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -".json".length));
}

function writeScanRecord(dir, record) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const outPath = join(dir, `${record.scan_id}.json`);
  writeFileSync(outPath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  return outPath;
}

/**
 * The fixture-run source registry: NOT release-sources-v1.json (that file
 * stays untouched — 0 entries, human-owned). A small, clearly-synthetic
 * in-memory registry whose "URLs" are local fixture file paths, read via a
 * fetch-shaped shim (`fetchImpl`) that performs a local `readFileSync`
 * instead of a network request. `runL1Scan` cannot tell the difference —
 * which is exactly the point: this exercises the REAL pipeline, not a
 * parallel mock of it.
 */
function buildFixtureSourceRegistry() {
  return {
    meta: { quorumRequired: null },
    sources: [
      { source_id: "fixture-rss", url: "fixture://feed-rss.xml", tier: "primary" },
      { source_id: "fixture-atom", url: "fixture://feed-atom.xml", tier: "primary" },
      { source_id: "fixture-jsonfeed", url: "fixture://feed-jsonfeed.json", tier: "primary" },
      { source_id: "fixture-html-dated", url: "fixture://listing-dated.html", tier: "secondary" },
      { source_id: "fixture-html-no-dates", url: "fixture://listing-no-dates.html", tier: "secondary" },
      { source_id: "fixture-malformed", url: "fixture://feed-malformed.xml", tier: "secondary" },
      { source_id: "fixture-empty", url: "fixture://feed-empty.txt", tier: "secondary" },
    ],
  };
}

function fixtureFileNameFromUrl(url) {
  return url.replace(/^fixture:\/\//, "");
}

/**
 * A fetch-shaped function reading local fixture files instead of the
 * network — see buildFixtureSourceRegistry. Mirrors the real fetch
 * contract (`{ ok, status, arrayBuffer() }`) exactly so `retrieveSource`
 * and `runL1Scan` require no special-casing to accept it.
 */
async function fixtureFetch(url) {
  const fileName = fixtureFileNameFromUrl(url);
  const filePath = join(FIXTURE_DIR, fileName);
  try {
    const buf = readFileSync(filePath);
    return { ok: true, status: 200, arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) };
  } catch (e) {
    return { ok: false, status: 404, arrayBuffer: async () => { throw e; } };
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const { help, live, fixtureRun } = parseArgs(argv);

  if (help) {
    console.log(HELP_TEXT);
    return 0;
  }

  if (fixtureRun) {
    console.log("release-watch-l1: --fixture-run — no network I/O. Running the real fetch->parse->extract->recognise->dedupe pipeline against committed fixtures under fixtures/release-watch/. This is a proof, not coverage: the record is written to research/model-index/release-watch/fixture-runs/ and carries fixture_run: true.");

    const sourceRegistry = buildFixtureSourceRegistry();
    const existingScanIds = listExistingScanIds(FIXTURE_SCAN_RECORD_DIR);
    const sourceState = loadSourceState(FIXTURE_SOURCE_STATE_PATH);
    const now = new Date();

    const record = await runL1Scan(sourceRegistry, {
      now,
      live: true,
      fetchImpl: fixtureFetch,
      existingScanIds,
      sourceState,
      promotedLinks: new Set(), // fixture releases-v1.json cross-check is meaningless against synthetic fixture links
      fixtureRun: true,
    });

    let outPath;
    try {
      outPath = writeScanRecord(FIXTURE_SCAN_RECORD_DIR, record);
      const nextState = updateStateFromScanRecord(sourceState, record, now);
      writeSourceState(FIXTURE_SOURCE_STATE_PATH, nextState);
    } catch (e) {
      console.error(`FATAL: could not write fixture-run scan record or state: ${e.message}`);
      return 1;
    }

    console.log(`release-watch-l1: wrote ${outPath}`);
    console.log(`release-watch-l1: fixture-run summary — sources_planned=${record.sources_planned.length} sources_reached=${record.sources_reached.length} sources_failed=${record.sources_failed.length} candidates=${record.candidates.length} dropped_candidates=${record.dropped_candidates.length} status=${record.status}`);
    console.log(JSON.stringify(record, null, 2));
    return 0;
  }

  if (live) {
    console.log("release-watch-l1: --live requested — this run WILL perform outbound HTTP GET requests to every URL declared in release-sources-v1.json.");
  } else {
    console.log("release-watch-l1: dry run (default) — no network request will be made. Pass --live to actually fetch, or --fixture-run to prove the pipeline against local fixtures.");
  }

  let sourceRegistry;
  try {
    sourceRegistry = loadSourceRegistry();
  } catch (e) {
    console.error(`FATAL: cannot read/parse ${SOURCES_PATH}: ${e.message}`);
    return 1;
  }

  const existingScanIds = listExistingScanIds(SCAN_RECORD_DIR);
  const sourceState = loadSourceState(SOURCE_STATE_PATH);
  const promotedLinks = loadPromotedLinks();
  const now = new Date();
  const record = await runL1Scan(sourceRegistry, {
    now,
    live,
    fetchImpl: live ? globalThis.fetch?.bind(globalThis) : undefined,
    existingScanIds,
    sourceState,
    promotedLinks,
  });

  let outPath;
  try {
    outPath = writeScanRecord(SCAN_RECORD_DIR, record);
    // Advance per-source dedupe state whenever the scan actually reached
    // sources — a not-run/aborted scan with no sources_reached leaves
    // state untouched (nothing new was seen to remember).
    if (record.sources_reached.length > 0 || record.candidates.length > 0 || record.dropped_candidates.length > 0) {
      const nextState = updateStateFromScanRecord(sourceState, record, now);
      writeSourceState(SOURCE_STATE_PATH, nextState);
    }
  } catch (e) {
    console.error(`FATAL: could not write scan record: ${e.message}`);
    return 1;
  }

  console.log(`release-watch-l1: wrote ${outPath}`);
  console.log(JSON.stringify(record, null, 2));
  return 0;
}

// Only run the CLI when this file is executed directly (not when imported by tests).
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().then((code) => process.exit(code));
}
