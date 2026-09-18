/**
 * lint-rules.mjs — Shared rule set for daily-briefing linting.
 *
 * SINGLE SOURCE OF TRUTH for the PUBLIC DAILY JSON RULES enforced by
 * `lint-daily-briefings.mjs` and tested by `test-lint-briefings.mjs`.
 *
 * If you change a rule here, both consumers pick it up automatically
 * — no manual sync needed.
 *
 * The canonical authoring rules (BAD/GOOD examples, observer-voice
 * guidance, status taxonomy) live in `.claude/agents/overnight-digest.md`
 * under "PUBLIC DAILY JSON RULES (NON-NEGOTIABLE)". This file is the
 * machine-readable enforcement layer.
 *
 * Added: Improvement Loop 6, 2026-05-22.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { computeCompositeFromDimensions, DIMENSION_CODES, BAND_RANGES } from "./scoring.mjs";
import { slugifyUnfolded } from "./slug.mjs";

// slugifySimple used to duplicate slugifyUnfolded's body here, plus a
// `String(name)` coercion this file's original copy had (the other 8
// unfolded-convention scripts assume `name` is already a string). Preserved
// as a one-line wrapper — not a reimplementation — so behaviour on any
// non-string input this file was ever passed is unchanged.
function slugifySimple(name) {
  return slugifyUnfolded(String(name));
}

// ──────────────────────────────────────────────────────────────────────────
// Reviewer-facing phrases (case-insensitive substring match against any string).
// ──────────────────────────────────────────────────────────────────────────

export const FORBIDDEN_PHRASES = [
  "human review required",
  "requires human review",
  "pending human review",
  "human review",                       // catches all variants
  "founder decision",
  "founder review",
  "requires founder review",
  "requires founder",
  "flagged for review",
  "needs review",
  "requires editorial judgment",
  "requires editorial sign-off",
  "requires editorial",
  "apply requires human review",
  "warrants human review",
  "review queue",
  "requires reviewer",
  "awaiting reviewer",
  "pending baseline reconciliation",
  "flagged for human review",
  "pending founder",
  "awaiting founder",
];

// ──────────────────────────────────────────────────────────────────────────
// Forbidden status/actionType/cycleType string values.
// ──────────────────────────────────────────────────────────────────────────

export const FORBIDDEN_STATUS_VALUES = new Set([
  "requires-human-review",
  "band-crossing-human-review-pending",
  "human-review-methodology-ambiguity",
  "human-review-band-crossing",
  "held",
  "pending-review",
  "requires-review",
  "flagged",
  "escalated",
]);

// ──────────────────────────────────────────────────────────────────────────
// Forbidden top-level keys inside the `pipeline` object.
// ──────────────────────────────────────────────────────────────────────────

export const FORBIDDEN_PIPELINE_KEYS = new Set([
  "scoreChangesPendingHumanReview",
  "bandChangesPendingReview",
  "humanReviewFlags",
  "mathHygieneFlags",
  "baselineCorrections",
  "holdsReleased",
  "holdsActive",
  "priorityAssessments",
  "rotationAssessments",
]);

// ──────────────────────────────────────────────────────────────────────────
// unapplied-score-movement rule.
//
// Added: Improvement Loop 13, item D-1, 2026-09-14. Coordinator-verified
// problem (RISK-020): public daily briefings narrated unapplied score
// proposals as if the published score had already moved (see
// site/src/data/updates/daily/2026-07-30.json "Portugal's face-covering
// ban cuts its score 5 points..." and 2026-09-14.json "Hong Kong falls
// 5.9 points...", both with pipeline.scoreChangesApplied === 0).
//
// Only enforced (fails the build) for briefings whose top-level `date` is
// >= UNAPPLIED_SCORE_MOVEMENT_CUTOFF, compared as the JSON date string —
// never the wall clock. Per AUTONOMY.md §1c (no retro-editing published
// briefings), briefings dated before the cutoff are NEVER failed by this
// rule; the linter instead prints them in a REPORT-ONLY section.
//
// Reworked: Improvement Loop 13, item D-1 REWORK, 2026-09-14. The original
// design flagged any sentence containing a movement verb AND score-noun/
// number context ANYWHERE in the sentence. On the real corpus that
// sentence-level co-occurrence was far too loose (~half the REPORT-ONLY
// matches were false positives — e.g. "Venezuela's ... death toll rose to
// 3,899" or "Bolivia's score holds steady, but its case raises a new
// question ..."), which would have blocked routine, unrelated briefings
// from publishing. The rule now BINDS the verb directly to a score subject
// or a score-shaped object, via five explicit binding patterns, instead of
// loose sentence co-occurrence. See BINDING_PATTERNS below.
// ──────────────────────────────────────────────────────────────────────────

export const UNAPPLIED_SCORE_MOVEMENT_CUTOFF = "2026-09-15";

// Movement verbs (case-insensitive, word-boundary). Used by the
// verb-quantity, verb-score-value, and verb-band binding patterns (b, c, d
// below). Flagging still requires one of the explicit BINDING_PATTERNS to
// match — a bare verb is never sufficient.
export const MOVEMENT_VERBS = [
  "falls", "fell",
  "drops", "dropped",
  "cuts", "cut",
  "slips", "slipped",
  "sinks", "sank",
  "declines", "declined",
  "lowers", "lowered",
  "loses", "lost",
  "rises", "rose",
  "climbs", "climbed",
  "gains", "gained",
  "jumps", "jumped",
  "raises", "raised",
  "downgraded", "upgraded",
];

// Verbs allowed to bind directly to a "score"/"composite" SUBJECT (binding
// pattern (a) below). Deliberately excludes gains/gained, cuts/cut,
// lost/loses, and raises/raised: "zero score gained confirmed evidence" and
// "a real score cut" are legitimate observer-voice sentences, not movement
// claims, and must pass.
const BINDING_A_VERBS = [
  "falls", "fell",
  "drops", "dropped",
  "slips", "slipped",
  "sinks", "sank",
  "declines", "declined",
  "rises", "rose",
  "climbs", "climbed",
  "jumps", "jumped",
];

// Allowed qualifiers: when present anywhere in the sentence, the sentence
// passes outright (it reads as proposed / pending / already-applied /
// historical, not as a newly-asserted movement), before any binding
// pattern is evaluated.
export const ALLOWED_QUALIFIERS = [
  "would", "could",
  "proposed", "proposal", "proposes", "propose",
  "filed",
  "measured",
  "recommended", "recommends",
  "pending",
  "not yet",
  "awaiting",
  "if applied",
  "assessment finds", "assessment found",
  "already", "previously",
  "has not been applied", "not been applied", "not applied",
  "was applied", "were applied",
  "has been applied", "had been applied",
];

const ALLOWED_QUALIFIER_PATTERN = new RegExp(
  `\\b(${ALLOWED_QUALIFIERS.filter((q) => !q.includes(" ")).join("|")})\\b|` +
  ALLOWED_QUALIFIERS.filter((q) => q.includes(" ")).map((q) => q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "i"
);

// Negation words: a binding match is discarded when one of these occurs
// within the 3 tokens immediately before the bound verb (e.g. "Neither
// Ukraine nor Kyiv lost points ...", "confirms, not lowers, the published
// ... score").
const NEGATION_WORDS = new Set(["not", "never", "no", "neither", "nor"]);

function tokenize(text) {
  return text.split(/\s+/).filter(Boolean);
}

function hasNegationBefore(sentence, verbIndex) {
  const before = sentence.slice(0, verbIndex);
  const tokens = tokenize(before).slice(-3);
  return tokens.some((t) => NEGATION_WORDS.has(t.replace(/[^a-zA-Z]/g, "").toLowerCase()));
}

const MOVEMENT_VERB_ALT = MOVEMENT_VERBS.join("|");

// ──────────────────────────────────────────────────────────────────────────
// BINDING_PATTERNS — the verb must be bound to a score subject or a
// score-shaped object, not merely co-occur in the same sentence.
//
// (a) score subject → verb:      "Hong Kong's score falls 5.9 points"
// (b) verb → point quantity:     "falls 5.9 points" / "Fell 8 Points"
// (c) verb → score value:        "falls to 28.4" (never "rose to 3,899")
// (d) verb → band:                "climbs into the Functional band"
// (e) verb → its score:           "cuts its score 5 points"
//
// Each entry's `verbAtEnd` tells findBindingMatches() whether the captured
// verb group ends the match (pattern a) or starts it (b–e), so the verb's
// character offset in the sentence can be computed for the negation check.
// ──────────────────────────────────────────────────────────────────────────

export const BINDING_PATTERNS = [
  {
    name: "score-subject-verb",
    regex: new RegExp(`\\b(?:score|composite)\\b(?:\\s+\\S+){0,2}\\s+(${BINDING_A_VERBS.join("|")})\\b`, "gi"),
    verbAtEnd: true,
  },
  {
    name: "verb-point-quantity",
    regex: new RegExp(`\\b(${MOVEMENT_VERB_ALT})\\s+(?:by\\s+)?\\d{1,3}(?:\\.\\d+)?\\s*(?:points?|pts)\\b`, "gi"),
    verbAtEnd: false,
  },
  {
    name: "verb-score-value",
    // The value must look like a score, not a bare count: either a
    // one-decimal number ("falls to 28.4", "from 12.5 to 6.3") or an
    // integer immediately followed by "of 100" / "out of 100" ("falls to
    // 18 of 100"). A bare integer ("rose to 12", "Jumps From 600 to 702
    // Deaths") no longer matches — those are casualty/count sentences, not
    // score movements. Improvement Loop 13, item D-1 second precision fix,
    // 2026-09-14.
    regex: new RegExp(
      `\\b(${MOVEMENT_VERB_ALT})\\s+(?:to|from)\\s+(?:\\d{1,3}\\.\\d(?![\\d,])|\\d{1,3}(?![\\d,])\\s+(?:out\\s+of\\s+|of\\s+)100\\b)`,
      "gi"
    ),
    verbAtEnd: false,
  },
  {
    name: "verb-band",
    regex: new RegExp(
      `\\b(${MOVEMENT_VERB_ALT})\\s+(?:into|out of|from|to|below|above)\\s+(?:the\\s+)?(?:Critical|Developing|Functional|Established|Exemplary|top|lower|higher)\\b`,
      "gi"
    ),
    verbAtEnd: false,
  },
  {
    name: "verb-its-score",
    regex: /\b(cuts|cut|lowers|lowered|raises|raised)\s+(?:its|the|their)\s+(?:published\s+)?score\b/gi,
    verbAtEnd: false,
  },
];

// Returns all non-negated binding-pattern matches in a sentence:
// { pattern, verb, index, match }[]. Exported so tests can exercise the
// binding logic directly, independent of the full scanUnappliedScoreMovement
// pipeline, guaranteeing the tests and the linter cannot drift apart.
export function findBindingMatches(sentence) {
  const hits = [];
  for (const { name, regex, verbAtEnd } of BINDING_PATTERNS) {
    // Fresh instance per call: shared `g`-flagged regexes carry lastIndex
    // state across calls, which would corrupt repeated invocations.
    const re = new RegExp(regex.source, regex.flags);
    let m;
    while ((m = re.exec(sentence))) {
      const verb = m[1];
      const verbIndex = verbAtEnd ? m.index + m[0].length - verb.length : m.index;
      if (!hasNegationBefore(sentence, verbIndex)) {
        hits.push({ pattern: name, verb, index: verbIndex, match: m[0] });
      }
      if (m.index === re.lastIndex) re.lastIndex += 1; // guard against zero-length matches
    }
  }
  return hits;
}

// Evaluates one sentence against the qualifier gate, then the binding
// patterns. Exported for direct use in tests alongside the full-briefing
// path in scanUnappliedScoreMovement.
export function evaluateMovementSentence(sentence) {
  if (ALLOWED_QUALIFIER_PATTERN.test(sentence)) {
    return { flagged: false, matches: [] };
  }
  const matches = findBindingMatches(sentence);
  return { flagged: matches.length > 0, matches };
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Scans a single string field for unqualified movement-language sentences.
// Returns an array of { sentence } for each offending sentence.
function findUnappliedMovementSentences(text) {
  if (typeof text !== "string" || !text) return [];
  const hits = [];
  for (const sentence of splitSentences(text)) {
    if (evaluateMovementSentence(sentence).flagged) {
      hits.push({ sentence });
    }
  }
  return hits;
}

// TOP_LEVEL_TEXT_FIELDS + topSignals "headline-like" fields checked per the
// rule spec: headline, title, summary at top level; title and whyItMatters
// (the short, front-loaded fields) on each topSignals[] item. `description`
// is the long narrative field and is intentionally excluded — it is where
// qualifying caveats typically live in full, and including it produced
// excessive false positives in the real corpus.
const TOP_SIGNAL_HEADLINE_FIELDS = ["title", "whyItMatters"];

// Scans one parsed daily-briefing document for the unapplied-score-movement
// rule. Returns { violations, reportOnly } — `violations` is populated only
// when the briefing's `date` is >= UNAPPLIED_SCORE_MOVEMENT_CUTOFF;
// otherwise matches land in `reportOnly` (informational, non-failing).
export function scanUnappliedScoreMovement(data) {
  const result = { violations: [], reportOnly: [] };
  if (!data || typeof data !== "object" || Array.isArray(data)) return result;

  const scoreChangesApplied = data?.pipeline?.scoreChangesApplied;
  const isZeroOrAbsent =
    scoreChangesApplied === undefined ||
    scoreChangesApplied === null ||
    scoreChangesApplied === 0;
  if (!isZeroOrAbsent) return result;

  const date = typeof data.date === "string" ? data.date : "";
  const isPostCutoff = date >= UNAPPLIED_SCORE_MOVEMENT_CUTOFF;
  const target = isPostCutoff ? result.violations : result.reportOnly;

  const pushMovementHits = (path, value) => {
    for (const hit of findUnappliedMovementSentences(value)) {
      target.push({
        path,
        rule: "unapplied-score-movement",
        detail: "movement verb + score context without an allowed qualifier",
        sentence: hit.sentence,
        snippet: hit.sentence.slice(0, 160),
      });
    }
  };

  pushMovementHits("headline", data.headline);
  pushMovementHits("title", data.title);
  pushMovementHits("summary", data.summary);

  if (Array.isArray(data.topSignals)) {
    data.topSignals.forEach((signal, i) => {
      if (!signal || typeof signal !== "object") return;
      for (const key of TOP_SIGNAL_HEADLINE_FIELDS) {
        pushMovementHits(`topSignals[${i}].${key}`, signal[key]);
      }
      if (signal.status === "applied") {
        target.push({
          path: `topSignals[${i}].status`,
          rule: "unapplied-score-movement-status",
          detail: "status is 'applied' while pipeline.scoreChangesApplied is 0 or absent",
          snippet: "applied",
        });
      }
    });
  }

  return result;
}

// ──────────────────────────────────────────────────────────────────────────
// Reusable recursive scanner.
// Returns an array of violation objects: { path, rule, detail, snippet }
// ──────────────────────────────────────────────────────────────────────────

export function scanForViolations(node, path = "") {
  const violations = [];
  scan(node, path, violations);
  return violations;
}

function scan(node, path, violations) {
  if (node === null || node === undefined) return;

  if (typeof node === "string") {
    const lower = node.toLowerCase();
    for (const phrase of FORBIDDEN_PHRASES) {
      if (lower.includes(phrase)) {
        violations.push({
          path,
          rule: "forbidden-phrase",
          detail: phrase,
          snippet: node.slice(0, 160),
        });
      }
    }
    if (lower.includes("(human review required)")) {
      violations.push({
        path,
        rule: "forbidden-cycle-type-parenthetical",
        detail: "(human review required)",
        snippet: node.slice(0, 160),
      });
    }
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((child, i) => scan(child, `${path}[${i}]`, violations));
    return;
  }

  if (typeof node === "object") {
    for (const key of Object.keys(node)) {
      const childPath = path ? `${path}.${key}` : key;
      const value = node[key];

      // Forbidden status/actionType/cycleType values
      if ((key === "status" || key === "actionType" || key === "cycleType") &&
          typeof value === "string" &&
          FORBIDDEN_STATUS_VALUES.has(value)) {
        violations.push({
          path: childPath,
          rule: "forbidden-status-value",
          detail: value,
          snippet: value,
        });
      }

      // Forbidden top-level pipeline keys
      if (path === "pipeline" && FORBIDDEN_PIPELINE_KEYS.has(key)) {
        violations.push({
          path: childPath,
          rule: "forbidden-pipeline-key",
          detail: key,
          snippet: `pipeline.${key}`,
        });
      }

      // Empty pendingReview arrays at any level
      if (key === "pendingReview" && Array.isArray(value) && value.length === 0) {
        violations.push({
          path: childPath,
          rule: "empty-pendingReview-array",
          detail: "pendingReview=[]",
          snippet: "[]",
        });
      }

      scan(value, childPath, violations);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────
// CLAIM-TO-SOURCE GATE (DC-04 / RISK-020).
//
// Added: Improvement Loop 16, item CS-1, 2026-09-16. Public daily briefings
// have twice carried claims their own sources contradict (2026-09-14: 4
// errors; 2026-09-15: 12 errors), and every one of them passed both
// scanForViolations (phrase/status/pipeline-key checks) and
// scanUnappliedScoreMovement — neither compares a claim to its source.
//
// Four narrow, source-checked claim classes, each reusing the briefing's own
// structured fields (recentAssessments[], topSignals[], boundaryWatch[]) or
// the published index JSONs as the source of truth — never free-form prose
// vs. free-form truth:
//   1. checkSuperlativeClaims  — rank superlatives ("bottom of the
//      benchmark", "top of the index", ...) vs. the entity's actual rank.
//   2. checkNumberClaims       — NN.N figures tightly bound to score
//      language vs. the briefing's own recentAssessments values or the
//      published index composite.
//   3. checkPriorBriefingReferences — "last night's briefing said X" vs.
//      whether X actually appears in that date's published daily JSON.
//   4. checkFormulaClaims      — methodologyNotes[] statements about the
//      integration-bonus mechanic, verified by recomputing
//      computeCompositeFromDimensions (mirrors test-method-claims.mjs's
//      recompute-don't-parse approach, rather than a second prose parser).
//
// Design is precision-first: every binding requires the sentence's subject
// to resolve to exactly one entity drawn from the briefing's own structured
// fields (collectEntityMentions / resolveSentenceSubject) — ambiguous or
// unresolvable sentences are skipped, never guessed at. Where a class of
// claim cannot be checked this way (e.g. an entity-specific "gets an N-point
// bonus" narration, which would require the entity's exact proposed
// dimension vector that briefings do not publish), it is left unchecked
// entirely rather than approximated — see HANDOFF notes for what remains
// out of mechanical reach.
//
// Forward-dated only, exactly like unapplied-score-movement: enforced (fails
// the build) only for briefings dated >= CLAIM_TO_SOURCE_CUTOFF. Earlier
// briefings are reported, never failed, never retro-edited (AUTONOMY §1c).
// ──────────────────────────────────────────────────────────────────────────

export const CLAIM_TO_SOURCE_CUTOFF = "2026-09-17";

// ── Published-index lookup ──────────────────────────────────────────────
//
// File list + slug convention mirrors export-public-data.mjs's INDEX_FILES /
// slugify(). Deliberately re-declared rather than imported — this project's
// existing convention (see build-entity-history.mjs's slugifyCurrent module
// comment) is to copy small slug helpers across independent scripts rather
// than couple unrelated build steps together.

export const CLAIM_INDEX_FILES = [
  { file: "fortune-500.json", indexSlug: "fortune-500" },
  { file: "countries.json", indexSlug: "countries" },
  { file: "us-states.json", indexSlug: "us-states" },
  { file: "ai-labs.json", indexSlug: "ai-labs" },
  { file: "robotics-labs.json", indexSlug: "robotics-labs" },
  { file: "global-cities.json", indexSlug: "global-cities" },
  { file: "us-cities.json", indexSlug: "us-cities" },
  { file: "universities.json", indexSlug: "universities" },
];

/**
 * Build a slug/index lookup from parsed index JSON. Pure function so tests
 * can pass fixture index data directly — never touches disk.
 *
 * @param {Record<string, {rankings: Array<object>}>} indexDataBySlug
 *   e.g. { "fortune-500": <parsed fortune-500.json> }.
 * @returns {{ byKey: Map<string, object> }} byKey keyed `${indexSlug}::${slug}`
 *   -> { name, slug, indexSlug, rank, total, composite, band }.
 */
export function buildIndexLookup(indexDataBySlug) {
  const byKey = new Map();

  for (const [indexSlug, indexData] of Object.entries(indexDataBySlug || {})) {
    const rankings = Array.isArray(indexData?.rankings) ? indexData.rankings : [];
    const total = rankings.length;
    const composites = rankings.map((r) => r.composite).filter((c) => typeof c === "number");
    const indexMin = composites.length ? Math.min(...composites) : null;
    const indexMax = composites.length ? Math.max(...composites) : null;

    // Disambiguate collisions the same way export-public-data.mjs does:
    // explicit row.slug wins outright; otherwise slugify(name), with
    // "-<rank>" appended to every occurrence after the first.
    const slugCounts = new Map();
    for (const row of rankings) {
      const base = row.slug ?? slugifySimple(row.name ?? "");
      slugCounts.set(base, (slugCounts.get(base) ?? 0) + 1);
    }
    const slugUsage = new Map();

    for (const row of rankings) {
      const baseSlug = row.slug ?? slugifySimple(row.name ?? "");
      let slug = baseSlug;
      if ((slugCounts.get(baseSlug) ?? 0) > 1) {
        const used = slugUsage.get(baseSlug) ?? 0;
        slugUsage.set(baseSlug, used + 1);
        slug = used === 0 ? baseSlug : `${baseSlug}-${row.rank}`;
      }
      byKey.set(`${indexSlug}::${slug}`, {
        name: row.name,
        slug,
        indexSlug,
        rank: row.rank,
        total,
        composite: row.composite,
        band: row.band,
        indexMin,
        indexMax,
      });
    }
  }

  return { byKey };
}

/**
 * Load the published index JSON files from disk and build the lookup. Used
 * only by lint-daily-briefings.mjs — tests use buildIndexLookup() directly
 * with in-memory fixtures.
 *
 * FAILS LOUD by design (throws) when the claim-to-source gate would
 * otherwise silently do nothing: Improvement Loop 16 CS-1 follow-up,
 * 2026-09-16 (defect 2) found that a wrong/moved `indexesDir` — every index
 * file failing to load — produced an EMPTY lookup, which the superlative and
 * number checks then treat as "nothing published to check against" and
 * silently skip every entity, while the linter still reports PASS. A moved
 * `site/src/data/indexes` path in CI would disable this whole gate with a
 * green build. A PARTIAL load (some index files missing, most present) is a
 * real but lesser problem — most entities are still checkable — so it warns
 * loudly (naming the missing indexes) rather than throwing outright.
 *
 * @param {string} indexesDir - absolute path to site/src/data/indexes
 * @throws {Error} if zero of the expected index files could be read/parsed,
 *   or the resulting lookup ends up with no entities at all.
 */
export function loadPublishedIndexLookup(indexesDir) {
  const indexDataBySlug = {};
  const loaded = [];
  const failed = [];
  for (const { file, indexSlug } of CLAIM_INDEX_FILES) {
    try {
      indexDataBySlug[indexSlug] = JSON.parse(readFileSync(join(indexesDir, file), "utf8"));
      loaded.push(file);
    } catch (e) {
      failed.push({ file, message: e.message });
    }
  }

  if (loaded.length === 0) {
    throw new Error(
      `loadPublishedIndexLookup: could not read ANY of the ${CLAIM_INDEX_FILES.length} expected published index ` +
      `files from "${indexesDir}" (tried: ${CLAIM_INDEX_FILES.map((f) => f.file).join(", ")}). The claim-to-source ` +
      `superlative/number checks have nothing to verify against and would otherwise silently pass every claim — ` +
      `refusing to continue. Check that the directory path is correct and the index files exist.`
    );
  }

  const lookup = buildIndexLookup(indexDataBySlug);

  if (lookup.byKey.size === 0) {
    throw new Error(
      `loadPublishedIndexLookup: loaded ${loaded.length} index file(s) from "${indexesDir}" but the resulting ` +
      `lookup contains zero entities (empty or malformed rankings[] in every loaded file). The claim-to-source ` +
      `superlative/number checks have nothing to verify against and would otherwise silently pass every claim — ` +
      `refusing to continue.`
    );
  }

  if (failed.length > 0) {
    console.error(
      `[loadPublishedIndexLookup] WARNING: ${failed.length} of ${CLAIM_INDEX_FILES.length} published index files ` +
      `failed to load from "${indexesDir}" — entities in these indexes cannot be verified this run: ` +
      failed.map((f) => `${f.file} (${f.message})`).join("; ")
    );
  }

  return lookup;
}

// ── Entity-mention resolution ───────────────────────────────────────────

/**
 * Collect this briefing's own entity mentions: name + slug + index, drawn
 * only from places a briefing structurally declares "this is about entity X
 * in index Y" (recentAssessments[], topSignals[], boundaryWatch[]). This is
 * what lets free-text claims bind to a specific, resolvable entity instead
 * of matching bare strings anywhere in the document.
 */
export function collectEntityMentions(data, indexLookup) {
  const mentions = new Map(); // `${index}::${slug}` -> mention

  const add = (name, slug, index) => {
    if (typeof slug !== "string" || !slug || typeof index !== "string" || !index) return;
    const key = `${index}::${slug}`;
    const existing = mentions.get(key);
    if (existing) {
      if (!existing.name && name) {
        existing.name = name;
        addNameVariant(existing, name);
      }
      return;
    }
    const published = indexLookup?.byKey?.get(key) ?? null;
    const mention = {
      name: name || published?.name || null,
      slug,
      index,
      published,
      // nameVariants: every distinct textual form this entity might be
      // referred to by in prose, beyond `.name` alone. Starts with the
      // briefing's own declared name (may be a shorthand, e.g. "DRC") and
      // the published index's canonical name (may be the fuller form, e.g.
      // "Democratic Republic of the Congo") when the two differ — either
      // form is legitimate prose usage and both must be recognized, not
      // just whichever happened to be chosen as `.name`. Callers may push
      // additional variants (document-declared abbreviations, first-word
      // shorthands) — see augmentMentionsForNumberCheck.
      nameVariants: [],
      _regexCache: null,
    };
    addNameVariant(mention, name);
    addNameVariant(mention, published?.name);
    mentions.set(key, mention);
  };

  for (const a of Array.isArray(data.recentAssessments) ? data.recentAssessments : []) {
    if (a && typeof a === "object") add(a.entity, a.slug, a.index);
  }
  for (const s of Array.isArray(data.topSignals) ? data.topSignals : []) {
    if (s && typeof s === "object") add(null, s.slug, s.index);
  }
  for (const b of Array.isArray(data.boundaryWatch) ? data.boundaryWatch : []) {
    if (b && typeof b === "object") add(b.entity, b.slug, b.index);
  }

  return [...mentions.values()];
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function addNameVariant(mention, name) {
  if (typeof name !== "string" || !name.trim()) return;
  if (!mention.nameVariants.includes(name)) {
    mention.nameVariants.push(name);
    mention._regexCache = null; // invalidate — variant set changed
  }
}

/**
 * Builds a name-matching regex that tolerates two real-corpus mismatches
 * between a structured entity name and how prose actually refers to it:
 *
 *  1. Trailing punctuation before a word boundary never asserts (`\bInc.\b`
 *     never matches "Inc.'s" — the "." and "'" are both non-word characters,
 *     so no boundary exists between them). Fixed with lookaround assertions
 *     keyed on alphanumerics instead of `\b`.
 *  2. Optional/movable "the" ("Democratic Republic of Congo" in structured
 *     data vs. "Democratic Republic of the Congo" in prose, or a leading
 *     article prose adds that the structured name omits). Fixed by dropping
 *     "the" from the name's own words, then allowing it back in, optionally,
 *     before any word (including a leading one).
 */
function buildFlexibleNameRegex(name) {
  if (typeof name !== "string") return null;
  const words = name.trim().split(/\s+/).filter((w) => w.toLowerCase() !== "the");
  if (words.length === 0) return null;
  const core = words.map(escapeRegExp).join("(?:\\s+the)?\\s+");
  return new RegExp(`(?<![A-Za-z0-9])(?:the\\s+)?${core}(?![A-Za-z0-9])`, "i");
}

/** Cached array of flexible regexes for every one of a mention's nameVariants. */
function mentionRegexes(mention) {
  if (!mention._regexCache) {
    mention._regexCache = (mention.nameVariants || [])
      .map(buildFlexibleNameRegex)
      .filter(Boolean);
  }
  return mention._regexCache;
}

/** Mentions any of whose name variants appears in `sentence`. */
function namedMentionsInSentence(sentence, mentions) {
  const found = [];
  for (const m of mentions) {
    const variants = m.nameVariants && m.nameVariants.length ? mentionRegexes(m) : (m.name ? [buildFlexibleNameRegex(m.name)].filter(Boolean) : []);
    if (variants.some((re) => re.test(sentence))) found.push(m);
  }
  return found;
}

/**
 * Resolve the single entity a sentence is "about", combining an optional
 * default (the mention owning the field being scanned, e.g. topSignals[i]'s
 * own slug — handles pronoun references like "its score") with any other
 * mentions explicitly named in the sentence. Returns null when the subject
 * is ambiguous (0 or >1 distinct entities) — callers must skip ambiguous
 * sentences rather than guess (precision over recall).
 */
export function resolveSentenceSubject(sentence, mentions, defaultMention) {
  const named = namedMentionsInSentence(sentence, mentions);
  const candidates = new Map();
  if (defaultMention) candidates.set(`${defaultMention.index}::${defaultMention.slug}`, defaultMention);
  for (const m of named) candidates.set(`${m.index}::${m.slug}`, m);
  if (candidates.size !== 1) return null;
  return [...candidates.values()][0];
}

/**
 * Enumerates the { text, own } fields the claim-to-source checks scan:
 * headline/title/summary at top level (own=null — no single owning entity),
 * each topSignal's title/whyItMatters/description, and each recentAssessment's
 * whyHeadline (own=that item's own mention, for both — handles pronoun
 * references like "its score"). Shared by forEachClaimSentence (per-sentence,
 * used by the superlative/prior-briefing checks) and forEachClaimField
 * (per-field, used by checkNumberClaims — it needs sentences in original
 * field order, with state carried across them; see resolveNumberSubjects).
 */
function collectClaimFields(data, mentions) {
  const mentionByKey = new Map(mentions.map((m) => [`${m.index}::${m.slug}`, m]));
  const fields = [];
  const push = (text, own) => {
    if (typeof text === "string" && text) fields.push({ text, own: own ?? null });
  };

  push(data.headline, null);
  push(data.title, null);
  push(data.summary, null);

  if (Array.isArray(data.topSignals)) {
    for (const s of data.topSignals) {
      if (!s || typeof s !== "object") continue;
      const own = typeof s.slug === "string" && typeof s.index === "string"
        ? mentionByKey.get(`${s.index}::${s.slug}`)
        : undefined;
      push(s.title, own);
      push(s.whyItMatters, own);
      push(s.description, own);
    }
  }

  if (Array.isArray(data.recentAssessments)) {
    for (const a of data.recentAssessments) {
      if (!a || typeof a !== "object") continue;
      const own = typeof a.slug === "string" && typeof a.index === "string"
        ? mentionByKey.get(`${a.index}::${a.slug}`)
        : undefined;
      push(a.whyHeadline, own);
    }
  }

  return fields;
}

/**
 * Walk the fields the claim-to-source checks scan and call
 * `visit(sentence, defaultMention)` for each sentence. `defaultMention` is
 * null for top-level fields (headline/title/summary — no single owning
 * entity) and the item's own mention for per-item fields.
 */
function forEachClaimSentence(data, mentions, visit) {
  for (const { text, own } of collectClaimFields(data, mentions)) {
    for (const sentence of splitSentences(text)) visit(sentence, own);
  }
}

/**
 * Like forEachClaimSentence, but calls `visitField(text, own)` once per
 * FIELD rather than once per sentence — used by checkNumberClaims, which
 * needs to walk a field's sentences in order, carrying a "running subject"
 * across sentences that don't restate it (see resolveNumberSubjects).
 */
function forEachClaimField(data, mentions, visitField) {
  for (const { text, own } of collectClaimFields(data, mentions)) {
    visitField(text, own);
  }
}

// ── Check 1: superlative / rank claims ──────────────────────────────────

// Compound phrases are unambiguous claims about rank/score position on their
// own. Deliberately does NOT include bare "worst"/"highest" as standalone
// words: even gated on a same-sentence context word ("score"/"index"/
// "benchmark"), those produced systematic domain-mismatch false positives
// against this corpus's own style — e.g. "the world's worst atrocities...
// so today's grim milestones cannot push either score down any further"
// (worst atrocities, not worst score), "the highest-probability near-term
// band-crossing candidate in the Fortune 500 index" (highest probability,
// not highest score), "the next-highest scoring tier" (a comparative
// neighbor, not a claim of being highest). A same-sentence context-word gate
// cannot distinguish these from genuine score superlatives without deeper
// parsing; left uncovered rather than approximated (see HANDOFF).
export const SUPERLATIVE_PATTERNS = [
  { regex: /\bbottom of (?:the )?(?:benchmark|index)(?:'s)?\b/gi, direction: "low", label: "bottom of the benchmark/index" },
  { regex: /\blowest[- ]scor(?:e|ing|ed)\b/gi, direction: "low", label: "lowest score/scoring" },
  { regex: /\bworst[- ]scor(?:e|ing|ed)\b/gi, direction: "low", label: "worst score/scoring" },
  { regex: /\btop of (?:the )?(?:benchmark|index)(?:'s)?\b/gi, direction: "high", label: "top of the benchmark/index" },
  { regex: /\bhighest[- ]scor(?:e|ing|ed)\b/gi, direction: "high", label: "highest score/scoring" },
  { regex: /\bbest[- ]scor(?:e|ing|ed)\b/gi, direction: "high", label: "best score/scoring" },
];

// A hedge/comparative word immediately before the match ("near the bottom",
// "among the highest-scoring", "the next-highest scoring tier", "the
// second-worst score") means the sentence is not asserting the literal
// extreme — skip rather than flag a claim that was never made.
const SUPERLATIVE_HEDGE_BEFORE_RE =
  /\b(?:near|nearly|almost|approaching|one of|among|close to)\s+(?:the\s+)?$|\b(?:next|second|third)[\s-]*$/i;

function hasHedgeImmediatelyBefore(sentence, matchIndex) {
  return SUPERLATIVE_HEDGE_BEFORE_RE.test(sentence.slice(0, matchIndex));
}

/**
 * Superlative/rank claims about an entity with a slug must agree with the
 * published indexes. Flags when the entity is not in fact at that extreme,
 * reporting its actual rank/position. Catches the real 2026-09-15 Oracle
 * error ("Oracle's score is confirmed at the bottom of the benchmark's
 * scale" — Oracle ranks 413 of 447 in fortune-500, not last).
 *
 * Extreme is checked by composite value (tied with the index min/max), not
 * literal rank===1/rank===total — several countries' indexes have multi-way
 * ties at the score floor (e.g. 12 countries tied at composite 0 in
 * countries.json), and each one genuinely holds "the lowest score the
 * benchmark gives" even though only one of them displays the highest rank
 * number.
 */
export function checkSuperlativeClaims(data, indexLookup) {
  const violations = [];
  const mentions = collectEntityMentions(data, indexLookup);
  if (mentions.length === 0) return violations;

  forEachClaimSentence(data, mentions, (sentence, defaultMention) => {
    const hits = [];
    for (const p of SUPERLATIVE_PATTERNS) {
      const re = new RegExp(p.regex.source, p.regex.flags);
      let m;
      while ((m = re.exec(sentence))) {
        if (!hasHedgeImmediatelyBefore(sentence, m.index)) hits.push(p);
        if (m.index === re.lastIndex) re.lastIndex += 1;
      }
    }
    if (hits.length === 0) return;

    const subject = resolveSentenceSubject(sentence, mentions, defaultMention);
    if (!subject || !subject.published) return; // ambiguous or unverifiable — skip, don't guess

    const published = subject.published;
    for (const hit of hits) {
      const isLow = hit.direction === "low";
      const extreme = isLow ? published.indexMin : published.indexMax;
      const isAtExtreme = extreme !== null && published.composite === extreme;
      if (isAtExtreme) continue;

      violations.push({
        path: "claim-to-source:superlative",
        rule: "claim-to-source-superlative",
        detail: `"${hit.label}" claimed for ${subject.name || subject.slug} (${subject.index}), but it ranks ` +
          `${published.rank} of ${published.total} in the published ${subject.index} index (composite ${published.composite}; ` +
          `${isLow ? "lowest" : "highest"} in that index is ${extreme}) — not ${isLow ? "last" : "first"}.`,
        snippet: sentence.slice(0, 200),
      });
    }
  });

  return violations;
}

// ── Check 2: numeric score claims ───────────────────────────────────────
//
// Two independent problems have to be solved for this check to be precise:
//
//   (1) EXTRACTION — which numbers in a sentence are score claims at all,
//       as opposed to distances-to-boundary, delta magnitudes, dimension
//       (0-5) values, formula-arithmetic components, or figures the
//       sentence itself marks as not-the-real-score. Numbers are extracted
//       via tight capture patterns rather than "does the sentence contain a
//       score-ish word, then check every decimal in it" for exactly this
//       reason. See the EXCLUSION KINDS below extractClaimedScoreNumbers.
//
//   (2) BINDING — once a number IS a score claim, which entity it is a
//       claim ABOUT. A sentence can name more than one entity (a
//       correction notice naming two countries; "N of 100 for X and M of
//       100 for Y"), or name none at all and rely on the surrounding
//       narrative ("Corrected to the published 25.0 of 100" two sentences
//       after "Palestine holds at..."). Binding a number to "whichever
//       entity this whole SENTENCE resolves to" (the old design) silently
//       misattributes in both of those shapes. See resolveNumberSubject
//       below checkNumberClaims for the fix: each number is bound to the
//       nearest textually-adjacent entity name (following "for X" first,
//       then nearest preceding name), falling back to a "running subject"
//       carried across a field's own sentences (starting from the field's
//       structural owner, updated whenever a later sentence unambiguously
//       names someone new) — never to "any name anywhere in the sentence."
//
// Improvement Loop 16 CS-1 follow-up, 2026-09-16: coordinator verification
// found 28 report-only false positives, all traceable to gaps in (1) or (2)
// above (a distance/boundary/delta/formula-component value swept in by (1),
// or a number correctly extracted but bound to the wrong entity by (2)) —
// never a genuine claim-to-source defect. See HANDOFF / ITERATION_LOG for
// the full before/after count and the residuals kept (with rationale).

// Dimension codes (AWR/EMP/ACT/EQU/BND/ACC/SYS/INT) are scored 0-5, not the
// composite's 0-100 scale — "INT rises from 3.0 to 3.2" is a true, correctly
// -formed claim about a sub-dimension that will never match a composite/
// published/assessed/delta value and must not be swept into this check.
const DIMENSION_CODE_NEARBY_RE = /\b(?:AWR|EMP|ACT|EQU|BND|ACC|SYS|INT)\b/;
const DIMENSION_LOOKBACK_CHARS = 40;

// EXCLUSION KIND — band-boundary values. The five canonical band edges,
// derived from scoring.mjs's BAND_RANGES (never hardcoded, so this can't
// drift from the real formula), quoted next to "boundary"/"threshold" are
// naming the BOUNDARY's value, not the entity's own score — "Anthropic sits
// 0.9 points below the Functional-to-Established boundary (60.0 of 100)"
// is 60.0 = the boundary; Anthropic's real score is 59.1.
const BAND_BOUNDARY_VALUES = new Set(
  Object.values(BAND_RANGES).map((range) => parseFloat(range.split("-")[1]))
);
const BOUNDARY_WORD_NEARBY_RE = /\b(?:boundary|threshold)\b/i;
const BOUNDARY_LOOKBACK_CHARS = 60;

// EXCLUSION KIND — figures the sentence itself marks as stale/superseded
// ("Scan reported stale score of 41.8" — 41.8 is the very thing the
// sentence says is wrong).
const STALE_WORD_NEARBY_RE = /\b(?:stale|outdated|superseded)\b/i;
const STALE_LOOKBACK_CHARS = 20;

// EXCLUSION KIND — formula-arithmetic components. "a base score of 75.0
// plus an integration premium of 8.0" — the pre-bonus base is a formula
// COMPONENT scoring.mjs adds the integration premium on top of, never the
// composite the benchmark actually publishes.
const BASE_COMPONENT_NEARBY_RE = /\bbase\b/i;
const BASE_COMPONENT_LOOKBACK_CHARS = 25;

// EXCLUSION KIND — dated/historical references. "unchanged from the 26
// August review, at 36.2 of 100" is a snapshot of what the score was on
// that earlier date; this single-cycle briefing's own recentAssessments
// (one published/assessed pair, for THIS date) cannot verify a different
// date's value, and the published index lookup is a live, current-day
// snapshot that will have drifted from any past date too.
const MONTH_NAME_NEARBY_RE = /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b/i;
const MONTH_LOOKBACK_CHARS = 40;

// EXCLUSION KIND — figures marked as NOT the published score. "dimension
// scores add up to 12.5 out of 100, not its published 6.6" — 12.5 is
// explicitly disclaimed by the sentence itself; the number AFTER "not" is
// left to be checked normally (if IT'S wrong, that's a real error).
const NOT_PUBLISHED_FOLLOWING_RE = /^\s*(?:,|;)?\s*not\s+(?:its\s+|the\s+)?(?:published\s+)?\d/i;
const NOT_PUBLISHED_LOOKAHEAD_CHARS = 60;

function lookback(sentence, pos, chars) {
  return sentence.slice(Math.max(0, pos - chars), pos);
}
function lookahead(sentence, pos, chars) {
  return sentence.slice(pos, pos + chars);
}

/**
 * Extracts every number in `sentence` that is structurally confident to be a
 * claimed SCORE value, applying the exclusion kinds documented above each
 * constant. Returns each surviving occurrence's own text position
 * (`numStart`/`numEnd` bound the number token itself; `matchEnd` bounds the
 * whole pattern match, e.g. through "... out of 100") so checkNumberClaims
 * can bind each one to the specific entity it is textually adjacent to,
 * rather than to "whichever entity the sentence resolves to."
 */
export function extractClaimedScoreNumbers(sentence) {
  // EXCLUSION KIND — explicit deltas. A literal delta symbol marks the
  // sentence as before/after or trajectory notation ("Δ -5.5, from 39.1 to
  // 33.6") describing a different assessment cycle than the single
  // published/assessed pair this briefing's recentAssessments records for
  // today — nothing in a Δ-bearing sentence is safely checkable here.
  if (sentence.includes("Δ")) return [];

  const byPosition = new Map(); // numStart -> { value, numStart, numEnd, matchEnd }
  const record = (value, numStart, matchEnd) => {
    if (byPosition.has(numStart)) return; // same literal number, matched by >1 pattern
    byPosition.set(numStart, { value, numStart, numEnd: numStart + value.length, matchEnd });
  };

  // "NN.N out of 100" / "NN.N of 100"
  {
    const re = /\b(\d{1,3}\.\d)\s*(?:out of|of)\s*100\b/gi;
    let m;
    while ((m = re.exec(sentence))) {
      const numStart = m.index;
      const value = m[1];
      const matchEnd = m.index + m[0].length;
      // EXCLUSION KIND — the "from" leg of a stated transition ("move El
      // Salvador from 20.3 of 100 ... to 15.0 of 100 ... was applied on July
      // 5") names the PRIOR, now-superseded value; only the resulting/"to"
      // value is the current claim. Same rationale as the dedicated
      // "from N to N" pattern below, for the case where other text (a band
      // name, a parenthetical) sits between "from N" and "of 100".
      const isFromLeg = /\bfrom\s*$/i.test(lookback(sentence, numStart, 10));
      const isBoundary = BAND_BOUNDARY_VALUES.has(round1(parseFloat(value))) &&
        BOUNDARY_WORD_NEARBY_RE.test(lookback(sentence, numStart, BOUNDARY_LOOKBACK_CHARS));
      const isStale = STALE_WORD_NEARBY_RE.test(lookback(sentence, numStart, STALE_LOOKBACK_CHARS));
      const isDated = MONTH_NAME_NEARBY_RE.test(lookback(sentence, numStart, MONTH_LOOKBACK_CHARS));
      const isMarkedNotPublished = NOT_PUBLISHED_FOLLOWING_RE.test(lookahead(sentence, matchEnd, NOT_PUBLISHED_LOOKAHEAD_CHARS));
      if (!isFromLeg && !isBoundary && !isStale && !isDated && !isMarkedNotPublished) {
        record(value, numStart, matchEnd);
      }
      if (m.index === re.lastIndex) re.lastIndex += 1;
    }
  }

  // "score is/was/remains/stands at/holds at/confirmed at/measured at/assessed at/of NN.N"
  {
    const re = /\bscore\s+(?:is|was|remains|stands at|holds at|confirmed at|measured at|assessed at|of)\s+(\d{1,3}\.\d)\b/gi;
    let m;
    while ((m = re.exec(sentence))) {
      const value = m[1];
      const numStart = m.index + m[0].lastIndexOf(value);
      const matchEnd = m.index + m[0].length;
      const isBaseComponent = BASE_COMPONENT_NEARBY_RE.test(lookback(sentence, m.index, BASE_COMPONENT_LOOKBACK_CHARS));
      const isStale = STALE_WORD_NEARBY_RE.test(lookback(sentence, m.index, STALE_LOOKBACK_CHARS));
      const isMarkedNotPublished = NOT_PUBLISHED_FOLLOWING_RE.test(lookahead(sentence, matchEnd, NOT_PUBLISHED_LOOKAHEAD_CHARS));
      if (!isBaseComponent && !isStale && !isMarkedNotPublished) record(value, numStart, matchEnd);
      if (m.index === re.lastIndex) re.lastIndex += 1;
    }
  }

  // "composite (score) is/was/remains/of NN.N"
  {
    const re = /\bcomposite\s+(?:score\s+)?(?:is|was|remains|of)\s+(\d{1,3}\.\d)\b/gi;
    let m;
    while ((m = re.exec(sentence))) {
      const value = m[1];
      const numStart = m.index + m[0].lastIndexOf(value);
      const matchEnd = m.index + m[0].length;
      const isMarkedNotPublished = NOT_PUBLISHED_FOLLOWING_RE.test(lookahead(sentence, matchEnd, NOT_PUBLISHED_LOOKAHEAD_CHARS));
      if (!isMarkedNotPublished) record(value, numStart, matchEnd);
      if (m.index === re.lastIndex) re.lastIndex += 1;
    }
  }

  // movement verb + "to" + NN.N ("falls to 28.4"). Deliberately does NOT
  // accept "from" here (unlike the pre-Loop-16-follow-up version) — "fell
  // from N" states the PRIOR value in a transition, the same excluded kind
  // as the "from N of 100" leg above.
  {
    const re = /\b(?:falls?|fell|drops?|dropped|declin\w*|slips?|slipped|sinks?|sank|rises?|rose|climbs?|climbed|jumps?|jumped)\s+to\s+(\d{1,3}\.\d)\b/gi;
    let m;
    while ((m = re.exec(sentence))) {
      const value = m[1];
      const numStart = m.index + m[0].lastIndexOf(value);
      const matchEnd = m.index + m[0].length;
      const skipDim = DIMENSION_CODE_NEARBY_RE.test(lookback(sentence, m.index, DIMENSION_LOOKBACK_CHARS));
      if (!skipDim) record(value, numStart, matchEnd);
      if (m.index === re.lastIndex) re.lastIndex += 1;
    }
  }

  // "from NN.N to NN.N" — only the SECOND ("to") leg is a current-state
  // claim; the first ("from") leg is the prior/alternate-basis value in the
  // transition (same rationale as the "from N of 100" guard above). This is
  // exactly the documented "Known false-positive vector" this function has
  // always carried: an intermediate/historical number with no matching
  // structured field in THIS briefing's recentAssessments.
  {
    const re = /\bfrom\s+(\d{1,3}\.\d)\s+to\s+(\d{1,3}\.\d)\b/gi;
    let m;
    while ((m = re.exec(sentence))) {
      const value = m[2];
      const numStart = m.index + m[0].lastIndexOf(value);
      const matchEnd = m.index + m[0].length;
      const skipDim = DIMENSION_CODE_NEARBY_RE.test(lookback(sentence, m.index, DIMENSION_LOOKBACK_CHARS));
      if (!skipDim) record(value, numStart, matchEnd);
      if (m.index === re.lastIndex) re.lastIndex += 1;
    }
  }

  // Note: the former "NN.N-point drop/decline/..." pattern is gone. It
  // captured DELTA MAGNITUDES ("a 11.7-point decline over three cycles"),
  // a fundamentally different kind of quantity than a score value — the
  // EXCLUSION KIND named directly in the Loop 16 follow-up brief
  // ("explicit deltas (Δ, 'N-point decline/drop')"). Delta magnitudes
  // describing more than one cycle's movement can't be checked against a
  // briefing's single published/assessed pair without guessing which two
  // cycles are being differenced.

  return [...byPosition.values()].sort((a, b) => a.numStart - b.numStart);
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

// ── Number-to-subject binding ───────────────────────────────────────────
//
// Everything below exists to answer one question precisely: for a NUMBER
// that extractClaimedScoreNumbers already decided is a genuine score claim,
// which entity is it a claim ABOUT? See the module-level comment at the top
// of "Check 2" for the two failure shapes this replaces
// (resolveSentenceSubject's "any name anywhere in the sentence, plus the
// field's static owner" — both of which co-occurrence, not attachment).

// A small, generic stopword list for first-word short-form aliasing (below)
// — words too generic to safely stand in for "the whole entity" on their
// own (many entities/countries/cities start with one of these).
const FIRST_WORD_ALIAS_STOPWORDS = new Set([
  "the", "united", "american", "national", "global", "international", "general",
  "first", "second", "third", "new", "north", "south", "east", "west", "san",
  "saint", "el", "la", "los", "royal", "central", "greater", "bank", "group",
  "democratic", "republic", "state", "states",
]);

/**
 * Local mentions structurally present in THIS briefing sometimes get a
 * shortened first-word reference later in the same document ("Meta
 * Platforms" → "Meta", the real 2026-07-09 corpus shape: "Confirmed at 59.1
 * of 100 for Anthropic and 7.8 of 100 for Meta"). Scoped to LOCAL mentions
 * only (never the full global index) to keep the blast radius small — only
 * entities this specific briefing already structurally declared can gain a
 * first-word alias, and only when that first word is long enough and not a
 * generic stopword (many entity names start with "United"/"New"/"Bank"/etc.,
 * which would be ambiguous stand-ins on their own).
 */
function addFirstWordAliases(mentions) {
  for (const mention of mentions) {
    const base = mention.nameVariants[0];
    if (typeof base !== "string") continue;
    const words = base.trim().split(/\s+/);
    if (words.length < 2) continue;
    const first = words[0];
    if (first.length < 4 || FIRST_WORD_ALIAS_STOPWORDS.has(first.toLowerCase())) continue;
    addNameVariant(mention, first);
  }
}

// A briefing that introduces an entity by its full name and then switches to
// a bare abbreviation for the rest of the item ("The Democratic Republic of
// the Congo (DRC) holds at 2.3 of 100 ... Confirmed at 2.3 of 100 for DRC")
// is declaring that abbreviation itself, in-document. This harvests exactly
// those self-declared aliases (never an external dictionary) for whichever
// already-known mention the declared full name matches, so later
// bare-abbreviation sentences in the same briefing resolve correctly.
const ABBREVIATION_DECLARATION_RE = /([A-Z][A-Za-z.'-]*(?:\s+[A-Za-z.'-]+){0,6})\s*\(([A-Z]{2,6})\)/g;

function harvestDocumentAbbreviations(data, mentions) {
  const text = JSON.stringify(data);
  const re = new RegExp(ABBREVIATION_DECLARATION_RE.source, "g");
  let m;
  while ((m = re.exec(text))) {
    const candidateName = m[1].trim();
    const abbr = m[2];
    for (const mention of mentions) {
      if (mention.nameVariants.includes(abbr)) continue;
      if (mentionRegexes(mention).some((r) => r.test(candidateName))) {
        addNameVariant(mention, abbr);
      }
    }
    if (m.index === re.lastIndex) re.lastIndex += 1;
  }
}

/** One-time-per-check augmentation of this briefing's local mentions with
 * document-declared aliases, ahead of walking any sentences. Mutates and
 * returns `mentions` (never touches collectEntityMentions's own output
 * shape, so the superlative/prior-briefing checks — which call
 * collectEntityMentions fresh themselves — are unaffected). */
function augmentMentionsForNumberCheck(data, mentions) {
  harvestDocumentAbbreviations(data, mentions);
  addFirstWordAliases(mentions);
  return mentions;
}

// Global entity name index — for numbers whose true subject isn't one of
// THIS briefing's own structured mentions (e.g. a second country named only
// in passing: "Mali (12.5 of 100) and Burkina Faso (6.3 of 100)" when only
// Mali has its own recentAssessments entry in this file). Memoized per
// indexLookup instance (stable for the lifetime of one lint run / one test
// file's fixture) so the ~1,000+ published entities are only scanned and
// regex-compiled once, not per sentence.
const globalEntityCandidatesCache = new WeakMap();

function getGlobalEntityCandidates(indexLookup) {
  if (!indexLookup?.byKey) return [];
  if (globalEntityCandidatesCache.has(indexLookup)) return globalEntityCandidatesCache.get(indexLookup);
  const seen = new Set();
  const candidates = [];
  for (const entry of indexLookup.byKey.values()) {
    if (!entry?.name || typeof entry.name !== "string" || seen.has(entry.name)) continue;
    if (!entry.name.includes(" ") && entry.name.length < 4) continue; // too short/generic to search globally
    const regex = buildFlexibleNameRegex(entry.name);
    if (!regex) continue;
    seen.add(entry.name);
    candidates.push({ name: entry.name, indexSlug: entry.indexSlug, slug: entry.slug, entry, regex });
  }
  globalEntityCandidatesCache.set(indexLookup, candidates);
  return candidates;
}

/** Every name occurrence (local mention or global-only entity) in `sentence`,
 * sorted by position, as { start, end, ref }. `ref` is either
 * { kind: "local", mention } or { kind: "global", candidate }. */
function findNameOccurrences(sentence, mentions, indexLookup) {
  const occurrences = [];
  const localKeys = new Set(mentions.map((m) => `${m.index}::${m.slug}`));

  for (const mention of mentions) {
    for (const re of mentionRegexes(mention)) {
      const r = new RegExp(re.source, "gi");
      let mm;
      while ((mm = r.exec(sentence))) {
        occurrences.push({ start: mm.index, end: mm.index + mm[0].length, ref: { kind: "local", mention } });
        if (mm.index === r.lastIndex) r.lastIndex += 1;
      }
    }
  }

  for (const candidate of getGlobalEntityCandidates(indexLookup)) {
    if (localKeys.has(`${candidate.indexSlug}::${candidate.slug}`)) continue; // covered above, with richer data
    const r = new RegExp(candidate.regex.source, "gi");
    let mm;
    while ((mm = r.exec(sentence))) {
      occurrences.push({ start: mm.index, end: mm.index + mm[0].length, ref: { kind: "global", candidate } });
      if (mm.index === r.lastIndex) r.lastIndex += 1;
    }
  }

  occurrences.sort((a, b) => a.start - b.start);
  return occurrences;
}

/** Converts an occurrence's ref into a uniform subject shape ({ name, slug,
 * index, published, _global? }) that allowedValuesFor can check either kind
 * against identically. `_global: true` marks a GLOBAL-only entity — one this
 * briefing never structurally declared its own recentAssessments/topSignal
 * record for — so checkNumberClaims knows never to validate its number
 * against the published index (see the comment on that flag for why). */
function subjectFromRef(ref) {
  if (ref.kind === "local") return ref.mention;
  const c = ref.candidate;
  return { name: c.name, slug: c.slug, index: c.indexSlug, published: c.entry, _global: true };
}

// A number can be governed by a name that follows it just as often as one
// that precedes it in this corpus's style ("Confirmed at 2.3 of 100 for
// DRC"; "59.1 of 100 for Anthropic and 7.8 of 100 for Meta") — but ONLY when
// the two are directly, tightly adjacent, with nothing but this filler text
// between the number and the name.
const FOR_NAME_GAP_RE = /^(?:\s*(?:out\s+of|of)\s*100)?[\s,;]*for\s*$/i;

// If a number is explicitly attributed via "for <Name>" but <Name> isn't one
// this check recognizes (no local mention, no global index entry, no
// document-declared alias — e.g. a bare abbreviation this specific briefing
// never spelled out anywhere), that is itself informative: the sentence is
// saying "this number belongs to someone", just not someone this check can
// identify. Falling through to the nearest preceding name or the running
// subject in that situation actively MISattributes (the real 2026-07-07
// shape: "... for Sudan and Afghanistan; 2.3 of 100 for DRC" — this file
// never declares "(DRC)", so with the explicit "for DRC" unresolved, 2.3
// must NOT fall back to "Afghanistan", the nearest OTHER real name).
const UNRESOLVED_FOR_NAME_RE = /^\s*(?:(?:out\s+of|of)\s*100)?[\s,;]*for\s+[A-Z]/;
const UNRESOLVED_FOR_NAME_LOOKAHEAD_CHARS = 40;

/**
 * Binds one extracted number to the entity it is textually adjacent to:
 *   1. an immediately-following "for <Name>" (tight adjacency only);
 *   2. else, if the number IS explicitly attributed via "for <Name>" but
 *      <Name> isn't recognized, skip rather than guess (see
 *      UNRESOLVED_FOR_NAME_RE above);
 *   3. else the nearest name occurring anywhere BEFORE the number — never a
 *      name that only appears AFTER it elsewhere in the sentence, which is
 *      exactly the shape of the real error this replaces ("Its published
 *      score of 17.5 was set on June 9 ... before a US strike campaign
 *      against Iran began" — Iran is an unrelated object in a later clause,
 *      not the number's subject; the true subject, the United States, was
 *      named in the PREVIOUS sentence and arrives here via runningSubject);
 *   4. else runningSubject — the entity the surrounding narrative is
 *      currently about (see checkNumberClaims for how it's carried and
 *      updated sentence-by-sentence within a field).
 * Returns null (skip this number — advisory, never guess) when none of the
 * tiers has anything to offer, or tier 2 explicitly applies.
 */
function resolveNumberSubject(sentence, num, occurrences, runningSubject) {
  const following = occurrences.find((o) => o.start >= num.matchEnd);
  if (following && FOR_NAME_GAP_RE.test(sentence.slice(num.matchEnd, following.start))) {
    return subjectFromRef(following.ref);
  }

  if (UNRESOLVED_FOR_NAME_RE.test(lookahead(sentence, num.matchEnd, UNRESOLVED_FOR_NAME_LOOKAHEAD_CHARS))) {
    return null;
  }

  let nearestPreceding = null;
  for (const o of occurrences) {
    if (o.end <= num.numStart && (!nearestPreceding || o.end > nearestPreceding.end)) nearestPreceding = o;
  }
  if (nearestPreceding) return subjectFromRef(nearestPreceding.ref);

  return runningSubject || null;
}

/**
 * For sentences with no qualifying numbers: the running subject moves on to
 * a newly-named entity only when that entity is named LOCALLY (a mention
 * this briefing structurally declared, not an incidental global reference)
 * AND its name occurrence starts the sentence (position 0) — i.e. the
 * sentence's own grammatical subject, not an entity mentioned in passing
 * partway through it. Both restrictions matter: dropping the "local" one
 * would let the running subject drift onto e.g. "the United States" from a
 * list of countries that sent aid; dropping the "sentence-initial" one
 * would let it drift onto e.g. "Pakistan" from "Four rotation-state
 * integrity corrections were applied: China rank (...), ... and Pakistan
 * composite (...)" — a correction LOG entry embedding several unrelated
 * entities, not a topic change. A real topic change in this corpus's style
 * consistently opens its sentence with the entity's own name ("Washington
 * University in St. Louis was also measured individually for the first
 * time.", "Palestine's rotation-state composite had drifted to 20.0...").
 */
// Anchored at the very start of the sentence. A single-word name allows NO
// leading "the" (unlike buildFlexibleNameRegex's general matching) — a
// leading "The" in front of a one-word match is otherwise indistinguishable
// from the sentence's own ordinary "The <name> <description>..."
// construction ("The Pakistan composite correction of 2.0 points..." would
// otherwise register as position 0, since "The " satisfies the
// optional-article group used everywhere else). A multi-word name DOES
// allow it — several of this corpus's recurring entities are conventionally
// referred to with a leading article as part of ordinary usage ("The
// Democratic Republic of the Congo's Ebola outbreak...", "The United
// States..."), and a multi-word name is specific enough that "The <its full
// multi-word name>" is not plausibly some OTHER unrelated construction the
// way a single common word can be.
function sentenceStartsWithName(sentence, mention) {
  for (const variant of mention.nameVariants) {
    const words = variant.trim().split(/\s+/).filter((w) => w.toLowerCase() !== "the");
    if (words.length === 0) continue;
    const core = words.map(escapeRegExp).join("(?:\\s+the)?\\s+");
    const prefix = words.length >= 2 ? "(?:the\\s+)?" : "";
    if (new RegExp(`^${prefix}${core}(?![A-Za-z0-9])`, "i").test(sentence)) return true;
  }
  return false;
}

// A second, narrower way a sentence can legitimately launch a new topic
// without leading with the entity's name: this corpus's recurring
// "A second/separate finding/question/development involves/concerns <Name>"
// construction (the real 2026-07-18 shape: "A second major finding involves
// the United States." — introducing the paragraph's second entity after
// "Ukraine holds at 50 of 100..." established the first). The entity must be
// the direct object of the launching verb — not merely present somewhere
// later in the sentence — so this doesn't reopen the door to incidental
// mentions the position-0 rule above was designed to exclude.
const TOPIC_LAUNCH_VERB_BEFORE_RE = /\b(?:involves?|concerns?|centers?\s+on|centres?\s+on)\s+(?:the\s+)?$/i;

function isTopicLaunchObject(sentence, mention) {
  for (const re of mentionRegexes(mention)) {
    const m = re.exec(sentence);
    if (m && TOPIC_LAUNCH_VERB_BEFORE_RE.test(sentence.slice(0, m.index))) return true;
  }
  return false;
}

function singleNamedLocalMention(sentence, mentions) {
  const named = namedMentionsInSentence(sentence, mentions);
  const distinct = new Map();
  for (const m of named) distinct.set(`${m.index}::${m.slug}`, m);
  if (distinct.size !== 1) return null;
  const only = [...distinct.values()][0];
  if (sentenceStartsWithName(sentence, only)) return only;
  if (isTopicLaunchObject(sentence, only)) return only;
  return null;
}

/**
 * Numbers quoted about an entity must match the briefing's own structured
 * values (recentAssessments[].published/assessed/delta for that entity, in
 * this same briefing) or the published index composite. Tolerance: exact
 * match on one decimal. See the "Number-to-subject binding" section above
 * for how each number's entity is determined, and the EXCLUSION KIND
 * comments above extractClaimedScoreNumbers for which numbers are checked
 * at all.
 *
 * Known false-positive vector (accepted, bounded by forward-dating): a
 * sentence can legitimately quote an intermediate/unpublished number (e.g.
 * a pre-adjustment formula value distinct from the published or assessed
 * figure) that has no matching structured field. This lands as a violation
 * only for briefings dated >= CLAIM_TO_SOURCE_CUTOFF; pre-cutoff briefings
 * only ever see it in the report-only list. See HANDOFF for detail.
 */
export function checkNumberClaims(data, indexLookup) {
  const violations = [];
  const mentions = collectEntityMentions(data, indexLookup);
  if (mentions.length === 0) return violations;
  augmentMentionsForNumberCheck(data, mentions);

  const recentAssessments = Array.isArray(data.recentAssessments) ? data.recentAssessments : [];

  const allowedValuesFor = (subject, ownMention) => {
    const allowed = new Set();
    // A GLOBAL-only subject — recognized only via the published index
    // search, never one of THIS briefing's own structured mentions — is
    // used purely to correctly ATTACH a number away from the wrong local
    // entity (e.g. "Burkina Faso (6.3 of 100)" no longer landing on Mali).
    // Its own number is deliberately never validated against today's
    // published composite: see the "no dated ra" rationale immediately
    // below, which applies doubly here since a global-only entity can never
    // have one.
    const ra = subject._global
      ? undefined
      : recentAssessments.find((a) => a && a.slug === subject.slug && a.index === subject.index);

    // A bare `published` (today's live index snapshot) is trusted as a
    // fallback source ONLY for the field's own structural owner — the
    // entity this specific item is actively about this cycle. For any OTHER
    // entity a number binds to (a comparison mention, a boundaryWatch aside
    // inside someone else's topSignal — "Turkey (17.6 of 100)" inside
    // Tunisia's own item, "Burkina Faso (6.3 of 100)" inside Mali's),
    // `published` is a CURRENT snapshot with no guarantee it matches what
    // was true on this (possibly months-old) briefing's date; without that
    // entity's OWN dated recentAssessments record for this exact cycle,
    // there is nothing that actually confirms the claim, one way or the
    // other. Real regression this guards against: 2026-07-10's Turkey
    // comparison (17.6, true on July 10) no longer matches Turkey's current
    // published composite (10.3) — Turkey has no ra in that briefing.
    const isOwnMention = Boolean(ownMention) && subject.index === ownMention.index && subject.slug === ownMention.slug;
    const trustPublished = isOwnMention || Boolean(ra);
    if (trustPublished && subject.published && typeof subject.published.composite === "number") {
      allowed.add(round1(subject.published.composite));
    }
    if (ra) {
      for (const field of ["published", "assessed", "delta"]) {
        if (typeof ra[field] === "number") {
          allowed.add(round1(ra[field]));
          allowed.add(round1(Math.abs(ra[field])));
        }
      }
    }
    return { allowed, hasSource: allowed.size > 0 };
  };

  forEachClaimField(data, mentions, (text, ownMention) => {
    // The running subject starts as the field's own structural owner (may
    // be undefined/null for top-level fields with no single owning entity)
    // and is updated as sentences within this SAME field explicitly name
    // someone new — see resolveNumberSubject / singleNamedLocalMention.
    let runningSubject = ownMention || null;

    for (const sentence of splitSentences(text)) {
      const numbers = extractClaimedScoreNumbers(sentence);

      if (numbers.length === 0) {
        const single = singleNamedLocalMention(sentence, mentions);
        if (single) runningSubject = single;
        continue;
      }

      const occurrences = findNameOccurrences(sentence, mentions, indexLookup);
      const boundByKey = new Map(); // `${index}::${slug}` -> subject, across this sentence's numbers

      for (const num of numbers) {
        const subject = resolveNumberSubject(sentence, num, occurrences, runningSubject);
        if (!subject) continue; // no anchor at all — advisory, skip, never guess

        boundByKey.set(`${subject.index}::${subject.slug}`, subject);
        const { allowed, hasSource } = allowedValuesFor(subject, ownMention);
        if (!hasSource) continue; // nothing to verify against — advisory, skip

        const val = round1(parseFloat(num.value));
        if (allowed.has(val)) continue;

        violations.push({
          path: "claim-to-source:number",
          rule: "claim-to-source-number",
          detail: `"${num.value}" quoted for ${subject.name || subject.slug} (${subject.index}) matches none of this ` +
            `briefing's own recentAssessments values or the published index composite for this entity ` +
            `(allowed: ${[...allowed].sort((a, b) => a - b).join(", ") || "none on record"}).`,
          snippet: sentence.slice(0, 200),
        });
      }

      // Only carry the subject forward into the NEXT sentence when this one
      // was unambiguously about a single entity. A sentence whose numbers
      // bound to several different entities is a comparison/listing
      // ("places El Salvador above Bahrain (9.4 of 100) and Mali (12.5 of
      // 100) while below Venezuela (18.0 of 100) and China (19.5 of 100)")
      // — the field's real topic hasn't changed, and blindly carrying
      // forward "whichever entity's number came last" (China, here) is
      // exactly the real 2026-07-02 regression this guards against ("The
      // published score of 20.3 of 100 remains the operative score..." is
      // about El Salvador, not China).
      if (boundByKey.size === 1) runningSubject = [...boundByKey.values()][0];
    }
  });

  return violations;
}

// ── Check 3: cross-references to prior briefings ────────────────────────

export const PRIOR_BRIEFING_REFERENCE_PATTERN = /\b(?:last night'?s|yesterday'?s|the previous|the prior)\s+(?:daily\s+)?briefing\b/i;

/**
 * A claim that a *published briefing* said or did something (e.g. "last
 * night's briefing", "yesterday's briefing reported") must be satisfiable
 * from that date's site/src/data/updates/daily/<date>.json — the named
 * entity or subject must actually appear in it. Catches the real
 * 2026-09-14→09-15 Lesotho error ("Last Night's Briefing Wrongly Dropped a
 * Real Finding About Lesotho" — the published 09-14 briefing never
 * mentioned Lesotho; the drop happened in the internal research scan).
 *
 * @param {object} data - parsed current briefing
 * @param {{priorDate: string|null, priorBriefingRaw: object|null}} context -
 *   priorDate is the date string of the immediately preceding *published*
 *   daily briefing this repo has on disk (null if there isn't one, or it
 *   has rolled off the retained window); priorBriefingRaw is that briefing's
 *   parsed JSON (null if unavailable).
 * @param {object} indexLookup
 */
export function checkPriorBriefingReferences(data, context, indexLookup) {
  const violations = [];
  const mentions = collectEntityMentions(data, indexLookup);
  if (mentions.length === 0) return violations;

  const { priorDate, priorBriefingRaw } = context || {};
  const haystack = priorBriefingRaw ? JSON.stringify(priorBriefingRaw).toLowerCase() : null;

  forEachClaimSentence(data, mentions, (sentence, defaultMention) => {
    if (!PRIOR_BRIEFING_REFERENCE_PATTERN.test(sentence)) return;

    const subject = resolveSentenceSubject(sentence, mentions, defaultMention);
    if (!subject) return; // can't identify what the claim says the prior briefing covered — advisory

    if (!priorDate || haystack === null) return; // no prior published briefing on disk to check against

    const nameHit = subject.name ? haystack.includes(subject.name.toLowerCase()) : false;
    const slugHit = haystack.includes(subject.slug.toLowerCase());
    if (nameHit || slugHit) return; // subject genuinely present in that date's briefing

    violations.push({
      path: "claim-to-source:prior-briefing",
      rule: "claim-to-source-prior-briefing",
      detail: `Claims the prior briefing (dated ${priorDate}) covered ${subject.name || subject.slug}, but neither ` +
        `"${subject.name || subject.slug}" nor slug "${subject.slug}" appears anywhere in ` +
        `site/src/data/updates/daily/${priorDate}.json. If this refers to the internal research scan/digest ` +
        `rather than the published briefing, say "the research scan" or "the previous research cycle" instead of "briefing."`,
      snippet: sentence.slice(0, 200),
    });
  });

  return violations;
}

// ── Check 4: formula statements ─────────────────────────────────────────

function recomputePremium(vals) {
  const dimScores = {};
  DIMENSION_CODES.forEach((c, i) => (dimScores[c] = vals[i]));
  return computeCompositeFromDimensions(dimScores).integrationPremium;
}

/**
 * Derives the formula constants prose is checked against by recomputing
 * computeCompositeFromDimensions (site/scripts/lib/scoring.mjs) — mirrors
 * the recompute-don't-hardcode approach in test-method-claims.mjs, so this
 * stays correct if the formula ever changes, and self-checks its own
 * "4.0 out of 5" assumption rather than trusting it blindly.
 */
export function getFormulaConstants() {
  const maxBonus = recomputePremium(Array(8).fill(4.5)); // 0 weak dims, low variance -> full bonus

  let weakDimsToZero = null;
  for (let k = 1; k <= 8; k++) {
    const vals = Array(8).fill(4.5);
    for (let i = 0; i < k; i++) vals[i] = 3.9; // just below the weak-dim threshold
    if (recomputePremium(vals) === 0) {
      weakDimsToZero = k;
      break;
    }
  }

  const oneWeakPremium = recomputePremium([3.9, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5]);
  const shrinkPerWeakDim = maxBonus > 0 ? Math.round(((maxBonus - oneWeakPremium) / maxBonus) * 1000) / 1000 : null;

  // Self-check the "4.0 out of 5" line: 4.0 itself must NOT count as weak,
  // and 3.9 must. If scoring.mjs's threshold ever moves, this throws rather
  // than silently comparing prose to a stale constant.
  const atThresholdIsFullBonus = recomputePremium([4.0, 5, 5, 5, 5, 5, 5, 5]) === maxBonus;
  const belowThresholdIsReduced = recomputePremium([3.9, 5, 5, 5, 5, 5, 5, 5]) < maxBonus;
  if (!atThresholdIsFullBonus || !belowThresholdIsReduced) {
    throw new Error(
      "getFormulaConstants: the dimensionThreshold=4.0 assumption no longer matches scoring.mjs's " +
      "computeCompositeFromDimensions — update the claim-to-source formula constants in lint-rules.mjs."
    );
  }

  return {
    maxBonus,
    dimensionThreshold: 4.0,
    dimensionThresholdOutOf: 5,
    weakDimsToZero,
    shrinkPerWeakDim,
  };
}

const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };

const FRACTION_WORDS = {
  "a fifth": 0.2, "one-fifth": 0.2, "one fifth": 0.2, "1/5": 0.2,
  "a quarter": 0.25, "one-quarter": 0.25, "one quarter": 0.25,
  "a third": 1 / 3, "one-third": 1 / 3,
  "a tenth": 0.1, "one-tenth": 0.1,
  "a half": 0.5,
};

function parseFractionOrPercent(text) {
  const pct = text.match(/(\d{1,3}(?:\.\d+)?)\s*(?:%|percent)/i);
  if (pct) return parseFloat(pct[1]) / 100;
  const lower = text.toLowerCase();
  for (const [k, v] of Object.entries(FRACTION_WORDS)) {
    if (lower.includes(k)) return v;
  }
  return null;
}

/**
 * Prose asserting how the composite/integration premium behaves, when it
 * states a rule with numbers (a threshold, a point cap, a shrink fraction,
 * a "gone once N categories" claim), is checked by recomputation against
 * scoring.mjs rather than a second prose parser (reuses the approach in
 * test-method-claims.mjs). Scoped to methodologyNotes[] — the field
 * structurally reserved for describing the general mechanic, not a specific
 * entity's specific cycle (see HANDOFF for why entity-specific bonus
 * narration is left unchecked as mechanically infeasible).
 */
export function checkFormulaClaims(data) {
  const violations = [];
  const notes = Array.isArray(data.methodologyNotes) ? data.methodologyNotes : [];
  if (notes.length === 0) return violations;

  let constants;
  try {
    constants = getFormulaConstants();
  } catch {
    // Self-check failed — the formula-claim gate is unreliable right now.
    // Degrade to advisory (no violations) rather than fail the whole build
    // over a self-check mismatch unrelated to this specific briefing.
    return violations;
  }

  notes.forEach((note, i) => {
    if (!note || typeof note !== "object") return;
    const text = [note.name, note.description].filter((s) => typeof s === "string").join(". ");
    if (!text) return;
    const base = `methodologyNotes[${i}]`;

    for (const sentence of splitSentences(text)) {
      // (a) "bonus of/is up to N points" / "maximum of N points" — claims the cap.
      const capMatch = sentence.match(/\b(?:bonus|premium)\s+(?:is\s+|of\s+)?(?:up to|a maximum of|as much as)\s+(\d{1,2}(?:\.\d)?)\s*points?\b/i);
      if (capMatch) {
        const claimed = parseFloat(capMatch[1]);
        if (Math.round(claimed * 10) !== Math.round(constants.maxBonus * 10)) {
          violations.push({
            path: base,
            rule: "claim-to-source-formula",
            detail: `Claims the integration bonus caps at ${claimed} points; recomputing computeCompositeFromDimensions ` +
              `(site/scripts/lib/scoring.mjs) gives a maximum reachable bonus of ${constants.maxBonus} points.`,
            snippet: sentence.slice(0, 200),
          });
        }
      }

      // (b) "(N out of M)" dimension threshold, only in bonus/line/threshold context.
      const thresholdMatch = sentence.match(/\((\d(?:\.\d)?)\s*out of\s*(\d(?:\.\d)?)\)/i);
      if (thresholdMatch && /\b(line|threshold|bonus|premium)\b/i.test(sentence)) {
        const n = parseFloat(thresholdMatch[1]);
        const outOf = parseFloat(thresholdMatch[2]);
        if (n !== constants.dimensionThreshold || outOf !== constants.dimensionThresholdOutOf) {
          violations.push({
            path: base,
            rule: "claim-to-source-formula",
            detail: `Claims the per-category line is ${n} out of ${outOf}; scoring.mjs's computeCompositeFromDimensions ` +
              `treats a dimension as "weak" only below ${constants.dimensionThreshold} out of ${constants.dimensionThresholdOutOf}.`,
            snippet: sentence.slice(0, 200),
          });
        }
      }

      // (c) "gone/erased/removed once N categories are below" the line. N may
      // be a digit or a spelled-out number word (both appear in this
      // corpus's authored prose).
      const zeroMatch = sentence.match(/\b(\d+|one|two|three|four|five|six|seven|eight)\s*(?:categories|dimensions|of (?:the )?(?:eight|8) categories)\b[^.]*?\bbelow\b/i);
      if (zeroMatch && /\b(gone|erased|erasing|removes?|removed|disappears?|zero(?:es)? out|wipes? out)\b/i.test(sentence)) {
        const n = NUMBER_WORDS[zeroMatch[1].toLowerCase()] ?? parseInt(zeroMatch[1], 10);
        if (n !== constants.weakDimsToZero) {
          violations.push({
            path: base,
            rule: "claim-to-source-formula",
            detail: `Claims the bonus is fully gone once ${n} categories are below the line; recomputing ` +
              `computeCompositeFromDimensions shows it reaches zero at ${constants.weakDimsToZero} weak categories ` +
              `(out of 8), not ${n}.`,
            snippet: sentence.slice(0, 200),
          });
        }
      }

      // (d) "shrinks by <fraction>" per weak category.
      const shrinkMatch = sentence.match(/\bshrinks?\s+by\s+([^,.;]+?)(?:\s+for each|\s+per|,|\.|$)/i);
      if (shrinkMatch) {
        const frac = parseFractionOrPercent(shrinkMatch[1]);
        if (frac !== null && Math.abs(frac - constants.shrinkPerWeakDim) > 1e-6) {
          violations.push({
            path: base,
            rule: "claim-to-source-formula",
            detail: `Claims the bonus shrinks by "${shrinkMatch[1].trim()}" (${frac}) per weak category; recomputing ` +
              `computeCompositeFromDimensions shows a shrink of ${constants.shrinkPerWeakDim} (one fifth) per weak category.`,
            snippet: sentence.slice(0, 200),
          });
        }
      }
    }
  });

  return violations;
}

// ── Combined entry point ────────────────────────────────────────────────

/**
 * Scans one parsed daily-briefing document for all four claim-to-source
 * checks. Returns { violations, reportOnly } — `violations` is populated
 * only when the briefing's `date` is >= CLAIM_TO_SOURCE_CUTOFF; otherwise
 * matches land in `reportOnly` (informational, non-failing), exactly like
 * scanUnappliedScoreMovement.
 *
 * @param {object} data - parsed briefing JSON
 * @param {{indexLookup?: object, priorDate?: string|null, priorBriefingRaw?: object|null}} context
 */
export function scanClaimToSource(data, context = {}) {
  const result = { violations: [], reportOnly: [] };
  if (!data || typeof data !== "object" || Array.isArray(data)) return result;

  const indexLookup = context.indexLookup ?? { byKey: new Map() };
  const date = typeof data.date === "string" ? data.date : "";
  const isPostCutoff = date >= CLAIM_TO_SOURCE_CUTOFF;
  const target = isPostCutoff ? result.violations : result.reportOnly;

  target.push(
    ...checkSuperlativeClaims(data, indexLookup),
    ...checkNumberClaims(data, indexLookup),
    ...checkPriorBriefingReferences(
      data,
      { priorDate: context.priorDate ?? null, priorBriefingRaw: context.priorBriefingRaw ?? null },
      indexLookup
    ),
    ...checkFormulaClaims(data)
  );

  return result;
}
