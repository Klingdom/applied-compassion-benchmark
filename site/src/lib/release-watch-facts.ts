/**
 * release-watch-facts.ts — the single source of truth for every number the
 * /ai-models release-watch section states about itself.
 *
 * Mirrors the pattern (and the reason for the pattern) in
 * `model-index-facts.ts`: hardcoded counts in prose have already caused a
 * real defect on this site (six stale "50" claims left behind when the
 * Humanoid Robotics Labs Index grew to 92 entities). Every number here is
 * derived from `site/src/data/model-benchmark/releases-v1.json` — never
 * typed into a page — and, where a scan-record tree does not yet exist, from
 * an honest, defensively-read absence.
 *
 * The distinction this module exists to preserve (DECISIONS.md D-30,
 * docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md §2.4, `.benchmark-ops/RELEASE_WATCH.md`
 * invariant 3): "A scan that did not run is not a scan that found nothing."
 * `releases-v1.json` may not exist at all points in this repo's history (it
 * is authored by a separate track of work) — every read below is defensive
 * and falls back to the same honest "never-scanned" state the file itself
 * ships with when empty, so this module never fabricates a scan that never
 * happened just because its own data file is temporarily missing.
 *
 * See DECISIONS.md D-29, D-30.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { MODEL_INDEX_FACTS } from "./model-index-facts";

type ReleaseMeta = {
  releaseCount?: number;
  lastScanId?: string | null;
  lastScanCompletedAt?: string | null;
  coverageThrough?: string | null;
  scanState?: "never-scanned" | "current" | "stale" | "degraded";
  staleAfterDays?: number | null;
  coverageClaim?: "none" | "partial" | "declared-sources";
  coverageClaimNote?: string;
  note?: string;
};

type ReleaseRecord = {
  release_id?: string;
  lifecycle?: string;
  confirmation_status?: string;
  registry_id?: string | null;
};

type ReleaseStore = {
  meta?: ReleaseMeta;
  releases?: ReleaseRecord[];
};

type ScanRecord = {
  scan_id?: string;
  status?: "started" | "completed" | "aborted" | "not-run";
  started_at?: string;
  ended_at?: string;
  candidates?: unknown[];
};

/**
 * Read releases-v1.json defensively. Returns `null` — never a fabricated
 * empty-but-scanned state — if the file cannot be found or parsed, so a
 * missing data file reads honestly as "no data available" rather than as
 * "confirmed zero".
 */
function readReleaseStore(): ReleaseStore | null {
  try {
    const raw = readFileSync(
      join(process.cwd(), "src", "data", "model-benchmark", "releases-v1.json"),
      "utf-8",
    );
    return JSON.parse(raw) as ReleaseStore;
  } catch {
    return null;
  }
}

/**
 * Read every scan record under research/model-index/release-watch/, if that
 * tree exists yet (Track R7, docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md §2.6
 * — not built as of this module's authoring). Tolerant of the directory not
 * existing, of individual files failing to parse, and of the tree being
 * empty. Never throws, never silently invents a record.
 */
function readScanRecords(): ScanRecord[] {
  const dir = join(process.cwd(), "..", "research", "model-index", "release-watch");
  let filenames: string[] = [];
  try {
    filenames = readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const records: ScanRecord[] = [];
  for (const filename of filenames) {
    try {
      const raw = readFileSync(join(dir, filename), "utf-8");
      records.push(JSON.parse(raw) as ScanRecord);
    } catch {
      // A single unreadable scan record does not invalidate the others —
      // and is not reported here as a completed or aborted scan either way.
    }
  }
  return records;
}

const store = readReleaseStore();
const meta: ReleaseMeta = store?.meta ?? {};
const releaseRows: ReleaseRecord[] = store?.releases ?? [];
const scanRecords = readScanRecords();

/** Every count below is derived, never hand-typed. See D-29's rule, applied here identically. */
export const RELEASE_WATCH_FACTS = {
  /** Whether releases-v1.json was found and parsed at all. */
  dataFileFound: store !== null,

  /**
   * `never-scanned` | `current` | `stale` | `degraded`. This is the field
   * that distinguishes "we have not looked" from "we looked and found
   * nothing" — read as data from the store, never inferred from an empty
   * array. Falls back to `never-scanned` (the maximally honest default) if
   * the data file is unavailable.
   */
  scanState: meta.scanState ?? "never-scanned",

  /** ISO datetime of the most recently *completed* scan, or null. */
  lastScanCompletedAt: meta.lastScanCompletedAt ?? null,

  /**
   * The end of the last fully-covered scan window. Advances only on a
   * completed scan that met its source quorum — never on an aborted one.
   * `null` means no coverage claim can be made for any point in time.
   */
  coverageThrough: meta.coverageThrough ?? null,

  /** `none` | `partial` | `declared-sources` — the coverage claim as data, never as copy. */
  coverageClaim: meta.coverageClaim ?? "none",

  coverageClaimNote:
    meta.coverageClaimNote ??
    "No release scan has ever run. This store's emptiness is evidence about Compassion Benchmark's monitoring, not about the AI industry.",

  staleAfterDays: meta.staleAfterDays ?? null,

  /**
   * Whether a scan has EVER completed. Distinct from `confirmedReleaseCount
   * === 0`, which is true regardless of whether anyone ever looked.
   */
  hasEverScanned: (meta.scanState ?? "never-scanned") !== "never-scanned",

  /**
   * Confirmed, sourced releases in the published store. `releases-v1.json`
   * never holds rumours or unconfirmed candidates (K10) — every row here
   * met the registry's five-field evidence bar.
   */
  confirmedReleaseCount: releaseRows.length,

  /**
   * Releases that have reached the `evaluated` or `published` lifecycle
   * stage. Always <= MODEL_INDEX_FACTS.evaluatedModelCount, and today
   * exactly equal to it, because a model can only leave the queue by being
   * evaluated (PRD §3) — there is no other exit.
   */
  evaluatedReleaseCount: releaseRows.filter(
    (r) => r.lifecycle === "evaluated" || r.lifecycle === "published",
  ).length,

  /** The load-bearing fact this section must never contradict: how many models the Model Index has ever scored. */
  evaluatedModelCount: MODEL_INDEX_FACTS.evaluatedModelCount,

  /**
   * Scans that ran to completion (status "completed"), counted from the raw
   * scan-record tree if it exists. `research/model-index/release-watch/`
   * does not exist as of this writing, so this is honestly 0 — not because
   * the number is hardcoded, but because there is nothing to count.
   */
  completedScanCount: scanRecords.filter((s) => s.status === "completed").length,

  /** Scans that were started but aborted or never ran, from the same tree. */
  abortedOrSkippedScanCount: scanRecords.filter(
    (s) => s.status === "aborted" || s.status === "not-run",
  ).length,

  /**
   * Every candidate event any scan has ever logged — confirmed releases,
   * rejected candidates, and rumours alike (rumours never leave the raw
   * scan record; see K10). This is deliberately a *wider* count than
   * `confirmedReleaseCount`: it is "how much did we look at", not "how much
   * did we publish".
   */
  candidateEventCount: scanRecords.reduce(
    (sum, s) => sum + (Array.isArray(s.candidates) ? s.candidates.length : 0),
    0,
  ),

  /**
   * `"completed" | "skipped" | null`. `null` means no scan has ever been
   * attempted — distinct from `"skipped"`, which means an attempt started
   * and did not finish (budget exhaustion, etc.). Never fabricates
   * `"completed"` when the underlying evidence is absent.
   */
  lastScanAttemptOutcome: ((): "completed" | "skipped" | null => {
    if (!meta.lastScanId && scanRecords.length === 0) return null;
    if (meta.scanState === "degraded") return "skipped";
    return meta.lastScanId || meta.lastScanCompletedAt ? "completed" : null;
  })(),
} as const;

export type ReleaseWatchFacts = typeof RELEASE_WATCH_FACTS;
