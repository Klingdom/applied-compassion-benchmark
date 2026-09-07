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
      const isDeclaredDraft = it.validationStatus === "draft" || it.validationStatus === "retired";
      const detail = unfilledSpans.map((s) => s.span).join(", ");
      if (isDeclaredDraft) {
        warn(`Item "${it.id}": unfilled placeholder(s) present [${detail}] — declared and expected (validationStatus="${it.validationStatus}")`);
      } else {
        fail(`Item "${it.id}": unfilled placeholder(s) present [${detail}] but validationStatus="${it.validationStatus ?? "null"}" (must be "draft" or "retired" to publish an item with an unexecutable prompt)`);
      }
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

  return { failures, warnings, checksRun, dimCounts, unfilledItemIds };
}
