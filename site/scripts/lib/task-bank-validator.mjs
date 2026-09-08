/**
 * task-bank-validator.mjs — Core validation logic for the AI evaluation task
 * bank, shared by validate-task-bank.mjs (CLI, runs against the real
 * tasks-v1.json) and test-task-bank.mjs (fixture-based tests, exercises this
 * exact logic against synthetic banks). Mirrors the scoring.mjs pattern:
 * one canonical implementation, no drift between "what ships" and "what is
 * tested".
 *
 * validateTaskBank(bank) takes a parsed task-bank object ({ meta, items })
 * and returns { failures, warnings, checksRun, dimCounts, unfilledItemIds }.
 * It has no side effects (no console output, no process.exit) so it is safe
 * to call repeatedly against fixtures in a test loop.
 */

// Canonical 8 dimensions + 40 subdimension codes, mirrored from
// site/src/data/dimensions.ts (same pattern used by validate-indexes.mjs /
// test-entity-records.mjs for their DIMENSIONS_MAP mirrors).
export const DIMENSIONS_MAP = [
  { code: "AWR", subdims: ["A1", "A2", "A3", "A4", "A5"] },
  { code: "EMP", subdims: ["E1", "E2", "E3", "E4", "E5"] },
  { code: "ACT", subdims: ["AC1", "AC2", "AC3", "AC4", "AC5"] },
  { code: "EQU", subdims: ["EQ1", "EQ2", "EQ3", "EQ4", "EQ5"] },
  { code: "BND", subdims: ["B1", "B2", "B3", "B4", "B5"] },
  { code: "ACC", subdims: ["AB1", "AB2", "AB3", "AB4", "AB5"] },
  { code: "SYS", subdims: ["S1", "S2", "S3", "S4", "S5"] },
  { code: "INT", subdims: ["I1", "I2", "I3", "I4", "I5"] },
];
export const DIMENSION_CODES = DIMENSIONS_MAP.map((d) => d.code);

const SUBDIM_TO_DIM = {};
for (const d of DIMENSIONS_MAP) for (const sd of d.subdims) SUBDIM_TO_DIM[sd] = d.code;

export const EXPECTED_LABELS = ["1.0 Critical", "2.0 Developing", "3.0 Functional", "4.0 Established", "5.0 Exemplary"];

// Coverage-balance thresholds: warn if a dimension's share of items is more
// than 2x or less than 0.5x the even-split share. This flags gross imbalance
// without pretending there is a single "correct" count — coverage is a
// design decision, not a defect, so this check never fails, only warns.
export const IMBALANCE_HIGH_MULT = 2.0;
export const IMBALANCE_LOW_MULT = 0.5;

// A bracket/brace/angle-bracket span counts as "filled" if it contains a
// quoted concrete value. Confirmed by hand against the real 33-item bank:
// AWR-2-A's "[made-up drug name: 'Veltraxomine']" is filled (has a quoted
// value); ACC-1-A / INT-1-B / INT-1-C / INT-3-A are not (no quoted value —
// they are either a stage-direction note or a bare description of what
// content belongs there).
const PLACEHOLDER_RE = /\[([^\]]*)\]|\{\{([^}]*)\}\}|<([A-Z_][A-Z0-9_ ]*)>/g;

export function scanForUnfilledPlaceholders(text) {
  const spans = [];
  let m;
  const re = new RegExp(PLACEHOLDER_RE);
  while ((m = re.exec(text))) {
    const whole = m[0];
    const inner = m[1] ?? m[2] ?? m[3] ?? "";
    const hasQuotedValue = /['"][^'"]+['"]/.test(inner);
    spans.push({ span: whole, filled: hasQuotedValue });
  }
  return spans;
}

// A validationStatus that means "not yet fit to publish or score" — an item
// carrying one of these may have an unfilled placeholder without failing the
// check below, and is excluded from the scorable denominator by
// src/lib/evaluation-scorer.ts / EvaluationScorer.tsx exactly as "draft" is.
// "draft-authored-unreviewed" (added in bankVersion v1.1) marks an item an
// AI agent repaired but no human has reviewed yet — see AGENTS/CLAUDE
// authorship-conflict notes in docs/MODEL_EVALUATION_HARNESS_DESIGN.md §5.2
// (C3). It must never be silently promoted to "validated" or "active".
export const NON_SCORABLE_VALIDATION_STATUSES = ["draft", "draft-authored-unreviewed", "retired"];

/**
 * Detects the AWR-2-A class of defect: a bracket span in model-facing text
 * that carries a filled, quoted value (so scanForUnfilledPlaceholders would
 * call it "filled" and the plain unfilled-placeholder check would wave it
 * through) but ALSO carries unquoted label/annotation text alongside that
 * value. "[made-up drug name: 'Veltraxomine']" is exactly this shape: the
 * quoted 'Veltraxomine' is a legitimate value, but the unquoted label
 * "made-up drug name:" leaks the answer key to the model regardless.
 *
 * Deliberately scoped to FILLED brackets only. A bare unfilled placeholder
 * like "[some unfilled position]" has no quoted value at all — that case is
 * already the plain unfilled-placeholder check's job (with its draft/
 * draft-authored-unreviewed/retired exception), and is not re-flagged here.
 * A bracket containing ONLY a quoted value with no other text (e.g.
 * "['Veltraxomine']") is not a leak either — it is a real, if oddly
 * punctuated, editorial artifact, not evaluator guidance.
 */
export function scanForLabeledBracketLeaks(text) {
  const leaks = [];
  let m;
  const re = new RegExp(PLACEHOLDER_RE);
  while ((m = re.exec(text))) {
    const whole = m[0];
    const inner = m[1] ?? m[2] ?? m[3] ?? "";
    const hasQuotedValue = /['"][^'"]+['"]/.test(inner);
    if (!hasQuotedValue) continue; // bare unfilled placeholder — not this check's job
    const withoutQuoted = inner.replace(/['"][^'"]*['"]/g, "");
    const label = withoutQuoted.replace(/^[\s:,\-]+|[\s:,\-]+$/g, "");
    if (label.length > 0) {
      leaks.push({ span: whole, label });
    }
  }
  return leaks;
}

/**
 * Validate a parsed task-bank object. Pure function: no I/O, no process
 * exit, safe to call against real data or synthetic fixtures.
 *
 * @param {{meta?: object, items?: Array<object>}} bank
 * @returns {{
 *   failures: string[],
 *   warnings: string[],
 *   checksRun: number,
 *   dimCounts: Record<string, number>,
 *   unfilledItemIds: string[],
 * }}
 */
export function validateTaskBank(bank) {
  const failures = [];
  const warnings = [];
  let checksRun = 0;
  const fail = (msg) => failures.push(msg);
  const warn = (msg) => warnings.push(msg);
  const check = () => checksRun++;

  const dimCounts = Object.fromEntries(DIMENSION_CODES.map((c) => [c, 0]));
  const unfilledItemIds = [];

  if (!bank || typeof bank !== "object") {
    fail("Task bank is not an object");
    return { failures, warnings, checksRun, dimCounts, unfilledItemIds };
  }

  if (!bank.meta || typeof bank.meta !== "object") fail("Missing top-level 'meta' object");

  const items = Array.isArray(bank.items) ? bank.items : [];
  if (!Array.isArray(bank.items) || bank.items.length === 0) {
    fail("Missing or empty top-level 'items' array");
    return { failures, warnings, checksRun, dimCounts, unfilledItemIds };
  }

  // ── 2. Unique, immutable, non-empty IDs ─────────────────────────────────
  const idCounts = new Map();
  for (const it of items) {
    check();
    if (typeof it.id !== "string" || it.id.trim() === "") {
      fail(`Item with missing/empty id (dimension=${it.dimension ?? "?"})`);
      continue;
    }
    idCounts.set(it.id, (idCounts.get(it.id) ?? 0) + 1);
  }
  for (const [id, count] of idCounts) {
    if (count > 1) fail(`Duplicate item id "${id}" appears ${count} times`);
  }

  // ── 3. Dimension / subdimension mapping ─────────────────────────────────
  for (const it of items) {
    check();
    if (!DIMENSION_CODES.includes(it.dimension)) {
      fail(`Item "${it.id}": dimension "${it.dimension}" is not one of the 8 canonical codes (${DIMENSION_CODES.join(", ")})`);
    } else {
      dimCounts[it.dimension]++;
    }

    // A subdimension is only "claimed" if item.indicator is a non-null string.
    if (it.indicator != null) {
      check();
      const parentDim = SUBDIM_TO_DIM[it.indicator];
      if (!parentDim) {
        fail(`Item "${it.id}": indicator "${it.indicator}" is not a real subdimension code`);
      } else if (parentDim !== it.dimension) {
        fail(`Item "${it.id}": indicator "${it.indicator}" belongs to dimension "${parentDim}", not declared dimension "${it.dimension}"`);
      }
    }
  }

  // ── 4. Anchors complete and ordered ─────────────────────────────────────
  for (const it of items) {
    check();
    const anchors = it.anchors;
    if (!Array.isArray(anchors) || anchors.length !== 5) {
      fail(`Item "${it.id}": expected exactly 5 anchors, got ${anchors?.length ?? 0}`);
      continue;
    }

    let orderOk = true;
    const seenDescriptions = new Set();
    for (let i = 0; i < 5; i++) {
      const a = anchors[i] ?? {};
      const expectedLevel = i + 1;
      if (a.level !== expectedLevel) {
        fail(`Item "${it.id}": anchor at index ${i} has level ${a.level}, expected ${expectedLevel} (anchors must be ordered 1..5)`);
        orderOk = false;
      }
      if (a.label !== EXPECTED_LABELS[i]) {
        warn(`Item "${it.id}": anchor level ${expectedLevel} label "${a.label}" does not match expected "${EXPECTED_LABELS[i]}"`);
      }
      if (typeof a.description !== "string" || a.description.trim() === "") {
        fail(`Item "${it.id}": anchor level ${expectedLevel} has empty description`);
      } else if (seenDescriptions.has(a.description)) {
        fail(`Item "${it.id}": anchor level ${expectedLevel} description duplicates another anchor in the same item (anchors must be distinct)`);
      } else {
        seenDescriptions.add(a.description);
      }
    }
    if (orderOk) check();
  }

  // ── 5. Unfilled template slots ──────────────────────────────────────────
  for (const it of items) {
    check();
    if (typeof it.prompt !== "string") {
      fail(`Item "${it.id}": prompt is not a string`);
      continue;
    }

    const spans = scanForUnfilledPlaceholders(it.prompt);
    const unfilledSpans = spans.filter((s) => !s.filled);
    const observedHasUnfilled = unfilledSpans.length > 0;

    if (observedHasUnfilled) unfilledItemIds.push(it.id);

    // Cross-check declared promptIntegrity against the independent scan.
    const declared = it.promptIntegrity?.hasUnfilledPlaceholder;
    if (declared !== null && declared !== undefined && declared !== observedHasUnfilled) {
      fail(`Item "${it.id}": promptIntegrity.hasUnfilledPlaceholder=${declared} but independent scan found hasUnfilledPlaceholder=${observedHasUnfilled} (${unfilledSpans.map((s) => s.span).join(", ") || "none"})`);
    }

    if (observedHasUnfilled) {
      const isDeclaredDraft = NON_SCORABLE_VALIDATION_STATUSES.includes(it.validationStatus);
      const detail = unfilledSpans.map((s) => s.span).join(", ");
      if (isDeclaredDraft) {
        warn(`Item "${it.id}": unfilled placeholder(s) present [${detail}] — declared and expected (validationStatus="${it.validationStatus}")`);
      } else {
        fail(`Item "${it.id}": unfilled placeholder(s) present [${detail}] but validationStatus="${it.validationStatus ?? "null"}" (must be one of ${NON_SCORABLE_VALIDATION_STATUSES.map((s) => `"${s}"`).join("/")} to publish an item with an unexecutable prompt)`);
      }
    }
  }

  // ── 5b. No evaluator-facing annotation reachable from the prompt ────────
  // Structural fix for the AWR-2-A class of defect (bankVersion v1): a
  // bracket in `prompt` can carry a filled, quoted value AND still leak
  // evaluator/authoring guidance via an unquoted label alongside it (e.g.
  // "[made-up drug name: 'Veltraxomine']" tells the model the name is
  // fictional even though 'Veltraxomine' itself is a legitimate value).
  // This check is UNCONDITIONAL — it applies to every item regardless of
  // validationStatus, because a leak in prompt text is a defect whether or
  // not the item is currently scorable; a human could still copy a
  // "draft-authored-unreviewed" prompt into a model by hand. It also
  // applies to every `variants[].prompt` arm, checked in section 9 below.
  for (const it of items) {
    check();
    if (typeof it.prompt !== "string") continue;
    const leaks = scanForLabeledBracketLeaks(it.prompt);
    for (const leak of leaks) {
      fail(`Item "${it.id}": prompt contains a bracketed annotation "${leak.span}" (unquoted label: "${leak.label}") — evaluator/authoring guidance must never be reachable from model-facing prompt text, even alongside a quoted concrete value (this is the AWR-2-A defect class)`);
    }
  }

  // ── 6. Dimension coverage balance (warn-only) ───────────────────────────
  const totalItems = items.length;
  const evenShare = totalItems / DIMENSION_CODES.length;
  for (const code of DIMENSION_CODES) {
    check();
    const n = dimCounts[code];
    if (n > evenShare * IMBALANCE_HIGH_MULT) {
      warn(`Dimension coverage imbalance: "${code}" has ${n} items, more than ${IMBALANCE_HIGH_MULT}x the even split (${evenShare.toFixed(2)})`);
    } else if (n < evenShare * IMBALANCE_LOW_MULT) {
      warn(`Dimension coverage imbalance: "${code}" has ${n} items, less than ${IMBALANCE_LOW_MULT}x the even split (${evenShare.toFixed(2)})`);
    }
  }

  // ── 7. Prompt text non-empty and not duplicated ─────────────────────────
  const promptToIds = new Map();
  for (const it of items) {
    check();
    if (typeof it.prompt !== "string" || it.prompt.trim() === "") {
      fail(`Item "${it.id}": prompt text is empty`);
      continue;
    }
    const list = promptToIds.get(it.prompt) ?? [];
    list.push(it.id);
    promptToIds.set(it.prompt, list);
  }
  for (const [, ids] of promptToIds) {
    if (ids.length > 1) fail(`Duplicate prompt text shared by items: ${ids.join(", ")}`);
  }

  // ── 8. Pool / exposure status declared on every item ────────────────────
  for (const it of items) {
    check();
    if (it.pool !== "core-public") {
      fail(`Item "${it.id}": pool="${it.pool}", expected "core-public"`);
    }
    if (it.exposureStatus !== "public-permanent") {
      fail(`Item "${it.id}": exposureStatus="${it.exposureStatus}", expected "public-permanent"`);
    }
  }

  // ── 9. Matched-pair `variants` arrays: well-formed and length-symmetric ──
  // A required task family per 03-BENCHMARK-BATTERY (e.g. INT-1-B). The
  // symmetry IS the measurement for a counterfactual pair — if the arms
  // differ in more than the variable under test (e.g. word count), the item
  // measures the confound instead. This check enforces the mechanical half
  // of symmetry (well-formedness, length parity); substantive equivalence
  // (tone, specificity, real-world salience) is a human reviewer's job,
  // recorded per-item as `reviewRequired`, not something code can certify.
  const VARIANT_LENGTH_RATIO_TOLERANCE = 1.25;
  for (const it of items) {
    if (it.variants == null) continue;
    check();
    if (!Array.isArray(it.variants) || it.variants.length < 2) {
      fail(`Item "${it.id}": variants must be an array of at least 2 matched arms, got ${Array.isArray(it.variants) ? it.variants.length : typeof it.variants}`);
      continue;
    }

    const wordCounts = [];
    const variantIds = [];
    for (const v of it.variants) {
      check();
      const vid = typeof v?.variantId === "string" ? v.variantId : null;
      if (!vid || vid.trim() === "") {
        fail(`Item "${it.id}": a variant is missing a non-empty variantId`);
      } else {
        variantIds.push(vid);
      }

      if (typeof v?.prompt !== "string" || v.prompt.trim() === "") {
        fail(`Item "${it.id}": variant "${vid ?? "?"}" has empty or missing prompt text`);
        continue;
      }

      const leaks = scanForLabeledBracketLeaks(v.prompt);
      for (const leak of leaks) {
        fail(`Item "${it.id}": variant "${vid}" prompt contains a bracketed annotation "${leak.span}" (unquoted label: "${leak.label}") — same rule as the top-level prompt (section 5b)`);
      }

      const vSpans = scanForUnfilledPlaceholders(v.prompt);
      const vUnfilled = vSpans.filter((s) => !s.filled);
      if (vUnfilled.length > 0) {
        const detail = vUnfilled.map((s) => s.span).join(", ");
        if (NON_SCORABLE_VALIDATION_STATUSES.includes(it.validationStatus)) {
          warn(`Item "${it.id}": variant "${vid}" has unfilled placeholder(s) [${detail}] — declared and expected (validationStatus="${it.validationStatus}")`);
        } else {
          fail(`Item "${it.id}": variant "${vid}" has unfilled placeholder(s) [${detail}] but validationStatus="${it.validationStatus ?? "null"}"`);
        }
      }

      wordCounts.push(v.prompt.trim().split(/\s+/).length);
    }

    const dupVariantId = variantIds.find((id, i) => variantIds.indexOf(id) !== i);
    if (dupVariantId) fail(`Item "${it.id}": duplicate variantId "${dupVariantId}" among variants`);

    if (wordCounts.length >= 2) {
      check();
      const max = Math.max(...wordCounts);
      const min = Math.min(...wordCounts);
      const ratio = min > 0 ? max / min : Infinity;
      if (ratio > VARIANT_LENGTH_RATIO_TOLERANCE) {
        fail(`Item "${it.id}": variants are not length-symmetric — word counts [${wordCounts.join(", ")}] give a max/min ratio of ${ratio.toFixed(2)}, exceeding the ${VARIANT_LENGTH_RATIO_TOLERANCE}x tolerance. Symmetry is the measurement for a matched counterfactual pair; a length mismatch is itself a confound.`);
      }
    }
  }

  // ── 10. `supersedes`: version, never mutate ──────────────────────────────
  // Any item carrying `supersedes` is declaring "I replaced a prior prompt
  // string" — the prior string and the version it shipped in must both be
  // preserved so a reader can see exactly what changed, per bankVersion
  // v1.1's changelog policy. This is what makes "silently mutate an item in
  // place" structurally impossible rather than merely discouraged.
  for (const it of items) {
    if (it.supersedes == null) continue;
    check();
    if (typeof it.supersedes.prompt !== "string" || it.supersedes.prompt.trim() === "") {
      fail(`Item "${it.id}": supersedes.prompt must preserve the exact prior prompt string verbatim`);
    }
    if (typeof it.supersedes.priorBankVersion !== "string" || it.supersedes.priorBankVersion.trim() === "") {
      fail(`Item "${it.id}": supersedes.priorBankVersion must record which bank version the prior prompt shipped in`);
    }
    if (it.supersedes.prompt === it.prompt) {
      fail(`Item "${it.id}": supersedes.prompt is identical to the current prompt — a supersedes record with no actual change is not a repair`);
    }
  }

  // ── 11. `draft-authored-unreviewed` items must name what a reviewer checks ──
  // Enforces "excluded from scoring by data, not by memory" for AI-authored
  // repairs: an item cannot carry this validationStatus without saying, in
  // the data itself, what a human must verify before it can be promoted.
  for (const it of items) {
    check();
    if (it.validationStatus === "draft-authored-unreviewed") {
      if (typeof it.reviewRequired !== "string" || it.reviewRequired.trim() === "") {
        fail(`Item "${it.id}": validationStatus="draft-authored-unreviewed" but reviewRequired is empty — must name what a human reviewer must check before this item can be marked validated`);
      }
      if (typeof it.author !== "string" || it.author.trim() === "") {
        fail(`Item "${it.id}": validationStatus="draft-authored-unreviewed" but author is missing — AI-authored content must carry honest provenance, not join the undocumented author:null population`);
      }
    }
    // An item may never claim to be validated/active while also being
    // unreviewed by construction — these two states are mutually exclusive
    // by definition, so a bank that asserts both is internally inconsistent.
    if (
      (it.validationStatus === "validated" || it.validationStatus === "active") &&
      it.reviewers == null
    ) {
      warn(`Item "${it.id}": validationStatus="${it.validationStatus}" but reviewers is null — a validated/active item should record who reviewed it`);
    }
  }

  return { failures, warnings, checksRun, dimCounts, unfilledItemIds };
}
