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
