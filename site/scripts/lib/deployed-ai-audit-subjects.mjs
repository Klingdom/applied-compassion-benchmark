/**
 * deployed-ai-audit-subjects.mjs — MAINTAINED LIST, not an inference.
 *
 * Why this is a list and not a heuristic
 * ---------------------------------------
 * `validate-product-separation.mjs` check 3 asks: "is this row a configured product
 * in real use (a Deployed AI Audit subject) rather than a developer organisation
 * (an AI Labs Index subject)?"
 *
 * There is no reliable mechanical signal for that distinction in the data we have.
 * Candidate heuristics were considered and rejected:
 *   - "Consumer-facing name" — Anthropic, OpenAI and Mistral AI are also consumer-
 *     facing (chat products) but are unambiguously developer organisations.
 *   - "Composite below some threshold" — conflates product-vs-org classification
 *     with score, which is exactly the confound this validator exists to prevent.
 *   - "Contains a common product-suffix word" — Harvey AI and Typeface don't share
 *     a lexical pattern with Replika or Waymo; no regex produces this set without
 *     also catching or missing real organisations (e.g. it would misfire on
 *     "Anthropic" or "Perplexity AI" differently depending on which token it keys
 *     on, and "Waymo" and "Abridge" have no shared suffix with anything).
 *
 * So this is a **founder/editorial judgment call**, recorded here as data because
 * the judgment has already been made in `docs/CB_MODEL_INTEGRATION_2026-09-06.md`
 * §2.3 and `.benchmark-ops/CURRENT_STATE.md` ("Broken" table). It is not re-derived
 * on every run — it is asserted, and the assertion is visible and editable here.
 *
 * This list does not delist, rename, or rescore anything. The validator that
 * consumes it only WARNs (see SEVERITY in the task brief and
 * `.benchmark-ops/WORK_QUEUE.md` WQ-P3-01: "Needs a product decision, not code").
 *
 * Maintenance rule: adding or removing a name here is a taxonomy decision, not a
 * data-quality fix. Do not add an entity here to "make a warning go away" — that
 * inverts the purpose of the list. Only add an entity whose product classification
 * has actually been decided.
 *
 * Matched by exact case-insensitive name against `ai-labs.json` rows. Deliberately
 * NOT fuzzy-matched or normalized the way company-alias duplicate detection is —
 * a maintained list should match literally, so a near-miss doesn't silently attach
 * itself to an entry nobody reviewed.
 */

export const DEPLOYED_AI_AUDIT_SUBJECTS = [
  { name: "Replika", note: "Consumer companion app product, not a developer organisation." },
  { name: "Character AI", note: "Consumer chatbot product/platform." },
  { name: "Perplexity AI", note: "Consumer/enterprise search product built on third-party models." },
  { name: "Midjourney", note: "Consumer image-generation product." },
  { name: "Clearview AI", note: "A single deployed facial-recognition product/service, not a model developer." },
  { name: "Waymo", note: "A deployed autonomous-driving product/service." },
  { name: "Abridge", note: "A deployed clinical-documentation product." },
  { name: "Harvey AI", note: "A deployed legal-vertical product built on third-party models." },
  { name: "Typeface", note: "A deployed enterprise content-generation product." },
  { name: "Pika Labs", note: "A deployed video-generation product." },
];

export const DEPLOYED_AI_AUDIT_SUBJECT_NAMES = new Set(
  DEPLOYED_AI_AUDIT_SUBJECTS.map((e) => e.name.toLowerCase())
);
