#!/usr/bin/env node

/**
 * release-watch-l1.mjs — L1 declared-source-registry fetcher
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
 * ── What this script does NOT do (by design, not by omission) ───────────
 * It NEVER writes a row to `releases-v1.json`. Detection produces a scan
 * record only — `candidates` and `promoted_release_ids` are always empty
 * arrays here, because this script does not parse retrieved bytes into
 * release claims. Promoting a scan observation into a confirmed release is
 * a separate, human-gated step (§2.5's state machine, transitions T1/T3:
 * evidence meeting the registry's five-field bar, `confirmation_status:
 * confirmed`, and — for T3 — a second independent source or a primary
 * provider source). That step is not implemented by this file.
 *
 * It NEVER invents a source. The registry it reads is the only legal input;
 * if it is empty (as it is today — §2.7, R6/R11 not yet done by a human),
 * this script has nothing to fetch and says so as data, not as a crash.
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
 * Usage:
 *   node research/scripts/release-watch-l1.mjs             (dry run, default)
 *   node research/scripts/release-watch-l1.mjs --dry-run    (explicit, same as above)
 *   node research/scripts/release-watch-l1.mjs --live       (PERFORMS OUTBOUND HTTP
 *                                                             REQUESTS to every URL
 *                                                             declared in
 *                                                             release-sources-v1.json)
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
 * Exit code 0 = a scan record was written (regardless of status — writing
 *   an honest "not-run"/"aborted" record is success for this script).
 * Exit code 1 = the script could not even write a scan record (fatal I/O
 *   error reading the source registry or writing the output file).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");
export const SOURCES_PATH = join(REPO_ROOT, "site", "src", "data", "model-benchmark", "release-sources-v1.json");
export const SCAN_RECORD_DIR = join(REPO_ROOT, "research", "model-index", "release-watch");

const HELP_TEXT = `
release-watch-l1.mjs — L1 declared-source-registry fetcher (see file header for full design notes)

Usage:
  node research/scripts/release-watch-l1.mjs [--dry-run | --live] [--help]

Options:
  --dry-run   (default) Perform NO network I/O. Writes a "not-run" scan
              record naming the dry-run as the reason. Safe to run any time.
  --live      Perform outbound HTTP GET requests to every URL declared in
              release-sources-v1.json. This flag makes real network calls.
  --help      Print this message and exit 0.

This script never writes a row to releases-v1.json. It writes exactly one
scan record to research/model-index/release-watch/<scan_id>.json describing
what it saw and the coverage it actually achieved.
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
 * Deterministic scan_id in the §2.6 format "scan-YYYY-MM-DD-NNN", sequenced
 * per day so multiple runs on the same date never collide.
 *
 * @param {Date} now
 * @param {string[]} existingScanIds scan_ids already present on disk (or,
 *   in tests, an in-memory fixture list)
 * @returns {string}
 */
export function computeScanId(now, existingScanIds = []) {
  const datePart = now.toISOString().slice(0, 10);
  const prefix = `scan-${datePart}-`;
  const usedSeqs = existingScanIds.filter((id) => typeof id === "string" && id.startsWith(prefix)).map((id) => Number.parseInt(id.slice(prefix.length), 10)).filter((n) => Number.isInteger(n));
  const nextSeq = (usedSeqs.length > 0 ? Math.max(...usedSeqs) : 0) + 1;
  return `${prefix}${String(nextSeq).padStart(3, "0")}`;
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
 * @returns {Promise<{source_id: string, reached: boolean, archive_or_hash?: string, retrieved_at?: string, status?: number, reason?: string}>}
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
 * @param {{now: Date, live: boolean, fetchImpl?: (url: string) => Promise<any>, existingScanIds?: string[]}} opts
 * @returns {Promise<object>} a complete scan record per §2.6's schema
 */
export async function runL1Scan(sourceRegistry, opts) {
  const now = opts.now instanceof Date ? opts.now : new Date();
  const live = opts.live === true;
  const existingScanIds = Array.isArray(opts.existingScanIds) ? opts.existingScanIds : [];
  const sources = Array.isArray(sourceRegistry?.sources) ? sourceRegistry.sources : [];
  const scan_id = computeScanId(now, existingScanIds);
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
    promoted_release_ids: [],
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

    return {
      ...baseRecord,
      window: { from: todayDate, to: todayDate },
      status: "completed",
      ended_at: new Date().toISOString(),
      sources_reached,
      sources_failed,
      quorum: { required, reached: reachedPrimaryCount, met },
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
  const live = argv.includes("--live");
  const dryRun = argv.includes("--dry-run") || !live; // dry-run is the default
  return { help, live, dryRun };
}

function loadSourceRegistry() {
  return JSON.parse(readFileSync(SOURCES_PATH, "utf8"));
}

function listExistingScanIds() {
  if (!existsSync(SCAN_RECORD_DIR)) return [];
  return readdirSync(SCAN_RECORD_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -".json".length));
}

function writeScanRecord(record) {
  if (!existsSync(SCAN_RECORD_DIR)) mkdirSync(SCAN_RECORD_DIR, { recursive: true });
  const outPath = join(SCAN_RECORD_DIR, `${record.scan_id}.json`);
  writeFileSync(outPath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  return outPath;
}

async function main() {
  const argv = process.argv.slice(2);
  const { help, live } = parseArgs(argv);

  if (help) {
    console.log(HELP_TEXT);
    return 0;
  }

  if (live) {
    console.log("release-watch-l1: --live requested — this run WILL perform outbound HTTP GET requests to every URL declared in release-sources-v1.json.");
  } else {
    console.log("release-watch-l1: dry run (default) — no network request will be made. Pass --live to actually fetch.");
  }

  let sourceRegistry;
  try {
    sourceRegistry = loadSourceRegistry();
  } catch (e) {
    console.error(`FATAL: cannot read/parse ${SOURCES_PATH}: ${e.message}`);
    return 1;
  }

  const existingScanIds = listExistingScanIds();
  const record = await runL1Scan(sourceRegistry, {
    now: new Date(),
    live,
    fetchImpl: live ? globalThis.fetch?.bind(globalThis) : undefined,
    existingScanIds,
  });

  let outPath;
  try {
    outPath = writeScanRecord(record);
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
