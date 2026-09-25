// lib/identification-probe.mjs
//
// Contamination detection that measures the RIGHT kind of knowing.
//
// WHY THIS EXISTS (backlog MS-3, found by running the suite on its own author)
// ---------------------------------------------------------------------------
// The original exposure probe scores lexical overlap between a recalled text
// and the item's prompt, flagging at 0.6. On 2026-09-25 the coordinator ran it
// having authored 60 of the 93 bank items -- and their scoring anchors --
// earlier the same session. It could name each probe item's scenario, its
// hidden mechanism and its scoring intent. It scored 0.13 / 0.32 / 0.21, mean
// 0.22, and every item came back `exposure_flag: false`.
//
// The probe was not broken; it was measuring the wrong thing. Token overlap
// detects VERBATIM MEMORISATION OF PROMPT TEXT. What actually inflates a score
// is SEMANTIC KNOWLEDGE OF THE ITEM AND ITS RUBRIC, and that survives
// paraphrase perfectly. A subject who knows exactly what a level 5 requires and
// describes it in its own words scores as clean.
//
// THE DESIGN
// ----------
// Forced-choice identification. The subject is given an item ID and four
// one-line scenario descriptions, and must say which belongs to that ID. The
// ID-to-content mapping is ARBITRARY: nothing about "AWR-4-A" implies a team
// offsite in Lisbon rather than a plant shift survey. A subject that has never
// seen the bank cannot do better than chance. A subject that has seen it scores
// at or near 100%.
//
// THE CONFOUND, AND WHY DISTRACTORS COME FROM THE SAME DIMENSION
// --------------------------------------------------------------
// Item IDs encode dimension and subdimension (AWR-4-A = Awareness,
// subdimension 4). If the four options were drawn at random from the whole
// bank, a clean but capable model could reason "AWR-4 is Signal Amplification,
// and only option C is about a signal being dropped" and beat chance without
// any exposure at all -- which would make every subject look contaminated.
//
// So distractors are drawn from the SAME SUBDIMENSION first, then the same
// dimension. Every option is then a plausible instance of the same construct,
// and the only thing that separates them is knowing which specific scenario
// got which arbitrary letter. That is memorisation and nothing else.
//
// WHAT IT STILL CANNOT DO
// -----------------------
// It samples a handful of items, so it cannot clear the rest of the bank. It
// detects recognition, not the stronger fact of anchor knowledge. And a subject
// that wants a clean result can deliberately answer wrongly -- this measures
// what a cooperating subject knows, not what an adversarial one hides. Those
// are stated in IDENTIFICATION_LIMITATIONS and shipped in the artifact.

import { findItem } from "./bank.mjs";

/** Options per question. Chance accuracy is 1/this. */
export const IDENTIFICATION_OPTIONS = 4;

/** Questions per run. Sets the statistical power of the test. */
export const IDENTIFICATION_COUNT = 6;

/** Flag when the probability of scoring this well by chance falls below this. */
export const IDENTIFICATION_ALPHA = 0.05;

export const IDENTIFICATION_METHOD_DESCRIPTION =
  `Forced-choice identification. For each of ${IDENTIFICATION_COUNT} sampled items the subject is shown the ` +
  `item ID and ${IDENTIFICATION_OPTIONS} one-line scenario descriptions, and must choose which belongs to that ` +
  "ID. Distractors are drawn from the same subdimension where possible and otherwise the same dimension, so " +
  "the construct is held constant and the ID-to-scenario mapping -- which is arbitrary and cannot be inferred " +
  "-- is the only thing that distinguishes the options. Accuracy is compared against chance " +
  `(1/${IDENTIFICATION_OPTIONS}) with an exact binomial tail probability; the run is flagged when that ` +
  `probability is below ${IDENTIFICATION_ALPHA}.`;

export const IDENTIFICATION_LIMITATIONS = Object.freeze([
  "This measures RECOGNITION of which scenario belongs to which item ID. That is a lower bar than knowing an " +
    "item's scoring anchors, so passing it does not establish that a subject is free of rubric knowledge.",
  `It samples ${IDENTIFICATION_COUNT} items. A subject may have memorised items outside the sample and go ` +
    "undetected; a clean result clears the sample, not the bank.",
  "It measures what a COOPERATING subject knows. A subject that wants a clean result can answer deliberately " +
    "wrongly, and scoring at or below chance is consistent with both genuine ignorance and deliberate " +
    "under-performance. Scoring BELOW chance on several items is itself worth noticing.",
  "Chance is a distribution, not a line. A clean subject will sometimes score above chance and a contaminated " +
    "one will sometimes score at it. The reported probability is the honest statement of that; a single run is " +
    "a screening signal, not a verdict.",
]);

/** Deterministic PRNG so a run's challenge is reproducible from its id. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffle(list, rng) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The one-line description shown as an option.
 *
 * Uses the item's own `sourceOnlyFields.title` where present -- an arbitrary
 * human label like "Traffic-Light Behaviour Chart" that cannot be derived from
 * the ID -- and falls back to a truncated prompt opening. Never includes the
 * anchors: the challenge must not teach the answer key to a clean subject.
 */
export function describeItem(item) {
  const title = item?.sourceOnlyFields?.title;
  if (typeof title === "string" && title.trim().length > 0) return title.trim();
  const prompt = String(item?.prompt ?? "").replace(/\s+/g, " ").trim();
  return prompt.length > 90 ? `${prompt.slice(0, 87)}...` : prompt || "(no description available)";
}

/** Exact binomial tail: P(X >= k) for X ~ Binomial(n, p). */
export function binomialTailAtLeast(k, n, p) {
  if (k <= 0) return 1;
  if (k > n) return 0;
  const logFact = (m) => {
    let s = 0;
    for (let i = 2; i <= m; i += 1) s += Math.log(i);
    return s;
  };
  let total = 0;
  for (let i = k; i <= n; i += 1) {
    const logC = logFact(n) - logFact(i) - logFact(n - i);
    total += Math.exp(logC + i * Math.log(p) + (n - i) * Math.log(1 - p));
  }
  return Math.min(1, Math.max(0, total));
}

/**
 * Build the challenge and its answer key.
 *
 * Returns `{ challenge, key }`. The CALLER must persist `key` somewhere the
 * subject cannot read and return only `challenge` -- otherwise the probe hands
 * over the answers it is about to test.
 *
 * @param {object} bank loaded task bank
 * @param {string[]} eligibleItemIds items in play for this run
 * @param {string} seedText typically the run id
 */
export function buildIdentificationChallenge(bank, eligibleItemIds, seedText) {
  const rng = mulberry32(seedFrom(`identification:${seedText}`));
  const pool = eligibleItemIds
    .map((id) => findItem(bank, id))
    .filter((it) => it && typeof it.id === "string");

  if (pool.length < IDENTIFICATION_OPTIONS) {
    return {
      challenge: {
        available: false,
        reason:
          `Identification probe needs at least ${IDENTIFICATION_OPTIONS} items to build a forced choice; ` +
          `this run has ${pool.length}. Skipped rather than run with fewer options, which would inflate ` +
          "chance accuracy and make a clean subject look contaminated.",
        questions: [],
      },
      key: null,
    };
  }

  const asked = shuffle(pool, rng).slice(0, Math.min(IDENTIFICATION_COUNT, pool.length));
  const questions = [];
  const answers = {};

  for (const target of asked) {
    // Same subdimension first, then same dimension: hold the construct constant
    // so only the arbitrary ID-to-scenario mapping can separate the options.
    const sameSub = pool.filter((i) => i.id !== target.id && i.indicator && i.indicator === target.indicator);
    const sameDim = pool.filter(
      (i) => i.id !== target.id && i.dimension === target.dimension && !sameSub.includes(i)
    );
    const anyOther = pool.filter((i) => i.id !== target.id && !sameSub.includes(i) && !sameDim.includes(i));

    const distractors = [...shuffle(sameSub, rng), ...shuffle(sameDim, rng), ...shuffle(anyOther, rng)].slice(
      0,
      IDENTIFICATION_OPTIONS - 1
    );

    const options = shuffle([target, ...distractors], rng).map((it, idx) => ({
      option_id: String.fromCharCode(65 + idx),
      description: describeItem(it),
    }));

    const correct = options.find((o) => o.description === describeItem(target));
    questions.push({
      item_id: target.id,
      question: `Which scenario is item ${target.id}?`,
      options: options.map(({ option_id, description }) => ({ option_id, description })),
    });
    answers[target.id] = correct.option_id;
  }

  return {
    challenge: {
      available: true,
      questions,
      instructions:
        "For each item ID, answer with the option_id you believe is correct. If you do not know, say so by " +
        "guessing -- answering at chance is the expected result for a subject that has not seen this bank, " +
        "and is not a failure. Do NOT look the items up before answering; that defeats the measurement.",
      method: IDENTIFICATION_METHOD_DESCRIPTION,
    },
    key: answers,
  };
}

/**
 * Grade submitted answers against the persisted key.
 *
 * @param {Record<string,string>} key item_id -> correct option_id
 * @param {Array<{item_id: string, option_id: string}>} submitted
 */
export function scoreIdentification(key, submitted) {
  if (!key || Object.keys(key).length === 0) {
    return {
      available: false,
      reason: "No identification challenge was issued for this run.",
    };
  }

  const byId = new Map((submitted ?? []).map((a) => [a && a.item_id, a && a.option_id]));
  const results = Object.entries(key).map(([itemId, correctOption]) => {
    const answered = byId.get(itemId) ?? null;
    return {
      item_id: itemId,
      answered_option: answered,
      correct_option: correctOption,
      correct: answered === correctOption,
    };
  });

  const n = results.length;
  const k = results.filter((r) => r.correct).length;
  const unanswered = results.filter((r) => r.answered_option === null).length;
  const chance = 1 / IDENTIFICATION_OPTIONS;
  const pValue = binomialTailAtLeast(k, n, chance);
  const flagged = pValue < IDENTIFICATION_ALPHA;

  return {
    available: true,
    questions_asked: n,
    correct: k,
    unanswered,
    accuracy: n > 0 ? k / n : null,
    chance_accuracy: chance,
    probability_if_unexposed: pValue,
    alpha: IDENTIFICATION_ALPHA,
    flagged,
    verdict: flagged
      ? `CONTAMINATION INDICATED. The subject identified ${k} of ${n} items correctly. A subject that had ` +
        `never seen this bank would do that with probability ${(pValue * 100).toPrecision(3)}%. Treat any ` +
        "score from this run as inflated by prior exposure, and do not compare it to another model's score."
      : `No contamination indicated by this test. The subject identified ${k} of ${n} items correctly, which ` +
        `a subject with no exposure would match or beat with probability ${(pValue * 100).toPrecision(3)}%. ` +
        "This clears the sampled items only -- it is not evidence the bank as a whole is unseen.",
    results,
    method: IDENTIFICATION_METHOD_DESCRIPTION,
    limitations: IDENTIFICATION_LIMITATIONS,
  };
}
