/**
 * entity-history-helpers.mjs — Pure functions extracted from build-entity-history.mjs
 * for testability.
 *
 * These functions contain no I/O side effects. They are imported by both
 * build-entity-history.mjs (via re-export) and by the test suite.
 *
 * All tier classification, citation URL extraction, ruling resolution, and
 * compaction logic lives here so it can be unit-tested against synthetic
 * fixtures without reading any disk files.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Events with subThreshold=true whose date is older than this many days
 * are eligible for Tier-D compaction. See architect §3.3 and PRD §8.1.
 */
export const COMPACTION_AGE_DAYS = 90;

// ─── URL extraction ───────────────────────────────────────────────────────────

/**
 * Regex matching http/https URLs.
 * Used for best-effort citationUrl back-fill from free-text fields.
 */
const URL_RE = /https?:\/\/[^\s)<>"]+/g;

/**
 * URL patterns to skip when extracting citationUrl.
 * Internal links and social-media share URLs are not citations.
 */
const SKIP_URL_PATTERNS = [
  "compassionbenchmark.com",
  "twitter.com/intent",
  "linkedin.com/share",
  "t.co/",
  "facebook.com/sharer",
];

/**
 * Hosts that are accepted only as a last resort (fallback-only).
 */
const FALLBACK_ONLY_HOSTS = ["wikipedia.org"];

/**
 * Future briefings should populate `citationUrl` natively on
 * recentAssessments[].citationUrl or topSignals[].citationUrl.
 * This extractor provides best-effort back-fill for existing data by
 * scanning whyHeadline and description text for http/https URLs.
 *
 * @param {string|null|undefined} structuredUrl  Forward-compatible: direct field on entry
 * @param {string[]} textFields                  Free-text fields to scan for URLs
 * @returns {string|null}
 */
export function extractCitationUrl(structuredUrl, textFields) {
  // Pathway 1 — structured field (forward-compatible)
  if (structuredUrl && typeof structuredUrl === "string") {
    const trimmed = structuredUrl.trim();
    if (!_shouldSkipUrl(trimmed)) {
      return trimmed;
    }
  }

  // Pathway 2 — best-effort URL extraction from free text
  const candidates = [];
  const fallbacks = [];

  for (const text of textFields) {
    if (!text) continue;
    const matches = text.match(URL_RE) || [];
    for (const url of matches) {
      if (_shouldSkipUrl(url)) continue;
      if (FALLBACK_ONLY_HOSTS.some((h) => url.includes(h))) {
        fallbacks.push(url);
      } else {
        candidates.push(url);
      }
    }
  }

  if (candidates.length > 0) return candidates[0];
  if (fallbacks.length > 0) return fallbacks[0];
  return null;
}

function _shouldSkipUrl(url) {
  return SKIP_URL_PATTERNS.some((pattern) => url.includes(pattern));
}

// ─── Direction label ──────────────────────────────────────────────────────────

/**
 * Compute directionLabel from event fields.
 *
 * @param {object} event
 * @returns {"upward"|"downward"|"hold"|null}
 */
export function computeDirectionLabel(event) {
  if (event.delta !== null && event.delta !== undefined) {
    if (event.delta > 0) return "upward";
    if (event.delta < 0) return "downward";
    return "hold";
  }
  // boundary-watch events without delta — no deterministic direction from event alone
  if (event.type === "boundary-watch") {
    return null;
  }
  return null;
}

// ─── Tier classification ──────────────────────────────────────────────────────

/**
 * Classify a single event into a retention tier.
 * Rules applied in order — first match wins. See architect §3.2.
 *
 * Returns an object with { tier, subThreshold }.
 * Throws if event shape is so unexpected that classification is impossible.
 *
 * @param {object} event  HistoryEvent (pre-tier fields)
 * @returns {{ tier: "A"|"B"|"C"|"D", subThreshold: boolean }}
 */
export function classifyEventTier(event) {
  const { type, delta, status } = event;

  // Rule 1a: Tier A — scored with |delta| >= 0.5
  if (type === "scored" && delta !== null && Math.abs(delta) >= 0.5) {
    return { tier: "A", subThreshold: false };
  }

  // Rule 2: Tier A — any formal apply (first-baselines with artifactual delta included).
  // Handles legacy null-headline events (PRD A2) with status="applied".
  if (type === "scored" && status === "applied") {
    return { tier: "A", subThreshold: false };
  }

  // Rule 3: Tier B — boundary-watch cycle data (real monitoring evidence)
  if (type === "boundary-watch") {
    return { tier: "B", subThreshold: false };
  }

  // Rule 4: Tier B — scored sub-threshold (0 < |delta| < 0.5)
  if (type === "scored" && delta !== null && Math.abs(delta) > 0 && Math.abs(delta) < 0.5) {
    return { tier: "B", subThreshold: true };
  }

  // Rule 5: Tier C — scored with delta=0 or delta=null and non-apply status.
  // Handles legacy null-headline events (PRD A2) with delta=null and status in
  // {documented, null, pending} — these are "no delta computed yet" stubs.
  if (type === "scored") {
    const isHoldStatus =
      status === "documented" ||
      status === null ||
      status === "pending" ||
      status === "boundary-watch" ||
      status === "band-crossing-proposed" ||
      status === "band-crossing-finding" ||
      status === "floor-confirmed";
    const isZeroOrNull = delta === null || delta === 0;

    if (isZeroOrNull && isHoldStatus) {
      return { tier: "C", subThreshold: false };
    }

    // Any other scored event not caught by rules 1-2 (e.g. sub-threshold hold
    // with unusual status) defaults to Tier C
    return { tier: "C", subThreshold: false };
  }

  // Rule 5b: Legacy "score-change" type — treat as Tier A if delta meets threshold
  if (type === "score-change") {
    if (delta !== null && Math.abs(delta) >= 0.5) {
      return { tier: "A", subThreshold: false };
    }
    return { tier: "C", subThreshold: false };
  }

  // Should not reach here. Fail loud to avoid silent mis-classification.
  throw new Error(
    `[entity-history-helpers] Cannot classify event — unrecognised type "${type}" with delta=${delta} status=${status}`
  );
}

// ─── Methodology ruling helpers ───────────────────────────────────────────────

/**
 * Parse a ruling number from the ruling name string.
 * e.g. "EU-PARLIAMENTARY-URGING-OF-CONDITIONALITY-MECHANISM — New Category Established (Ruling 5, v1.6)"
 * → 5
 *
 * Returns null if not parseable.
 * @param {string} name
 * @returns {number|null}
 */
export function parseRulingNumber(name) {
  if (!name) return null;
  const m = name.match(/Ruling[\s-](\d+)/i);
  if (m) return parseInt(m[1], 10);
  return null;
}

/**
 * Parse a version string from the ruling name or description.
 * @param {string} name
 * @param {string} description
 * @returns {string}
 */
export function parseRulingVersion(name, description) {
  for (const text of [name, description]) {
    if (!text) continue;
    const m = text.match(/\bv\d+\.\d+\b/);
    if (m) return m[0];
  }
  return "v1.0";
}

/**
 * Parse the short ruling name (part before " —" or " -" separator).
 * @param {string} name
 * @returns {string}
 */
export function parseRulingShortName(name) {
  if (!name) return "";
  const dash = name.indexOf(" —");
  const hyphen = name.indexOf(" - ");
  const cut = dash > 0 ? dash : hyphen > 0 ? hyphen : -1;
  if (cut > 0) return name.slice(0, cut).trim();
  return name.slice(0, 80).trim();
}

/**
 * Build a MethodologyRulingRef from a raw methodologyNote entry and briefing date.
 *
 * @param {object} note    methodologyNotes[] entry
 * @param {string} date    briefing date string (YYYY-MM-DD)
 * @returns {object|null}  MethodologyRulingRef or null if ruling number not parseable
 */
export function buildRulingRef(note, date) {
  const rulingNumber = parseRulingNumber(note.name || "");
  if (rulingNumber === null) return null;

  return {
    rulingNumber,
    name: parseRulingShortName(note.name || ""),
    version: parseRulingVersion(note.name || "", note.description || ""),
    establishedDate: date,
    briefingPath: `/updates/${date}`,
    summary: (note.description || "").slice(0, 200).trim(),
  };
}

// ─── Compaction helpers ───────────────────────────────────────────────────────

/**
 * Compute the cutoff date string for compaction (generatedAt - COMPACTION_AGE_DAYS).
 *
 * @param {string} generatedAt  ISO timestamp string
 * @returns {string}  YYYY-MM-DD cutoff date
 */
export function computeCompactionCutoff(generatedAt) {
  const d = new Date(generatedAt);
  d.setUTCDate(d.getUTCDate() - COMPACTION_AGE_DAYS);
  return d.toISOString().slice(0, 10);
}

/**
 * Compute integer days between two YYYY-MM-DD date strings (a - b).
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function daysBetween(a, b) {
  const da = new Date(a + "T00:00:00Z");
  const db = new Date(b + "T00:00:00Z");
  return Math.round((da - db) / (1000 * 60 * 60 * 24));
}

/**
 * Group compaction-eligible events into CompactedRun entries.
 * Adjacent events with the same directionLabel within a 30-day rolling window
 * are merged into a single run.
 *
 * Returns an array of CompactedRun objects augmented with _sourceEvents (internal
 * field stripped before JSON serialization in the build script).
 *
 * @param {object[]} eligible  Events (any order — sorted internally)
 * @returns {object[]}
 */
export function groupIntoCompactedRuns(eligible) {
  if (eligible.length === 0) return [];

  // Sort oldest-first for grouping
  const sorted = [...eligible].sort((a, b) => a.date.localeCompare(b.date));

  const runs = [];
  let currentRun = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = currentRun[currentRun.length - 1];
    const curr = sorted[i];

    const dayGap = daysBetween(curr.date, prev.date);
    const sameDirection = curr.directionLabel === prev.directionLabel;

    if (sameDirection && dayGap <= 30) {
      currentRun.push(curr);
    } else {
      runs.push(buildCompactedRun(currentRun));
      currentRun = [curr];
    }
  }
  runs.push(buildCompactedRun(currentRun));

  return runs;
}

/**
 * Build a single CompactedRun from a group of eligible events.
 * Augmented with _sourceEvents for the build script's folding logic
 * (stripped before writing JSON).
 *
 * @param {object[]} group  Events sorted oldest-first
 * @returns {object}
 */
export function buildCompactedRun(group) {
  const sortedDates = group.map((e) => e.date).sort();
  const netDelta = group.reduce((sum, e) => sum + (e.delta !== null ? e.delta : 0), 0);
  const netDirection = netDelta >= 0 ? "upward" : "downward";
  const uniquePaths = [...new Set(group.map((e) => e.briefingPath))];

  return {
    type: "compacted-sub-threshold",
    tier: "D",
    fromDate: sortedDates[0],
    toDate: sortedDates[sortedDates.length - 1],
    count: group.length,
    netDirection,
    netMagnitude: Math.round(netDelta * 100) / 100,
    briefingPaths: uniquePaths,
    _sourceEvents: group, // stripped before writing JSON in build script
  };
}

// ─── Derived field helpers ────────────────────────────────────────────────────

/**
 * Find the latest score-change event (Tier A, scored, non-zero delta).
 * Events are expected in newest-first order.
 *
 * @param {object[]} events
 * @returns {object|null}
 */
export function computeLatestScoreChange(events) {
  return (
    events.find(
      (ev) => ev.tier === "A" && ev.type === "scored" && ev.delta !== null && ev.delta !== 0
    ) || null
  );
}

/**
 * Compute integer days between generatedAtDate and latestScoreChange.date.
 *
 * @param {object|null} latestScoreChange
 * @param {string} generatedAtDate  YYYY-MM-DD
 * @returns {number|null}
 */
export function computeDaysSinceLastChange(latestScoreChange, generatedAtDate) {
  if (!latestScoreChange) return null;
  const d = daysBetween(generatedAtDate, latestScoreChange.date);
  return d < 0 ? 0 : d;
}

/**
 * Count events by tier post-compaction, adding D counts from compacted runs.
 *
 * @param {object[]} events         Events after compaction
 * @param {object[]} compactedRuns  CompactedRun entries (each has .count)
 * @returns {{ A: number, B: number, C: number, D: number }}
 */
export function computeTierCounts(events, compactedRuns) {
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  for (const ev of events) {
    if (ev.tier === "A") counts.A++;
    else if (ev.tier === "B") counts.B++;
    else if (ev.tier === "C") counts.C++;
    else if (ev.tier === "D") counts.D++;
  }
  for (const run of compactedRuns) {
    counts.D += run.count;
  }
  return counts;
}
