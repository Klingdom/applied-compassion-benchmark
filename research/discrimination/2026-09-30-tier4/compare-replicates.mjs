#!/usr/bin/env node
/**
 * compare-replicates.mjs — TRI-10.
 *
 * Four of this run's 40 items were already tested in Iteration 60 with a
 * different writer and a different rater: ACT-2-A (+4), AWR-2-A (+3),
 * EQU-2-A (+2) and EMP-1-A (-1, the known inversion). They were re-run blind,
 * indistinguishable from the other 36.
 *
 * WHY THEY ARE IN THE RUN
 *   Without them, 36 new numbers would arrive with no way to tell whether this
 *   run's rater behaves like the last one's. If the replicates reproduce, the
 *   two runs can be read together. If they do not, the new numbers describe
 *   this rater rather than the bank, and saying so is the finding.
 *
 *   This is the positive control the absence rule (V8) asks for, applied to a
 *   measurement rather than a search: a result that has never reproduced a
 *   known value is not yet evidence.
 *
 * PRIOR VALUES ARE PARSED FROM THE PUBLISHED TABLE, NOT TYPED
 *   docs/DISCRIMINATION_TEST_2026-09-30.md §3 is the record. Retyping four
 *   numbers out of it is exactly the DC-20 move that has already produced two
 *   false findings in this project, and four numbers are small enough to get
 *   wrong without noticing.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..", "..");
const PRIOR_DOC = join(REPO, "docs", "DISCRIMINATION_TEST_2026-09-30.md");
const REPLICATES = ["ACT-2-A", "AWR-2-A", "EQU-2-A", "EMP-1-A"];

/** Rows look like: | `ACT-2-A` | 1 | 5 | **+4** | discriminates | */
function priorResults() {
  const text = readFileSync(PRIOR_DOC, "utf8");
  const out = new Map();
  for (const m of text.matchAll(/^\|\s*`([A-Z]{3}-\d-[A-Z])`\s*\|\s*(\d)\s*\|\s*(\d)\s*\|/gm)) {
    out.set(m[1], { warm: Number(m[2]), blunt: Number(m[3]), gap: Number(m[3]) - Number(m[2]) });
  }
  if (out.size === 0) throw new Error(`REFUSED: parsed no rows from ${PRIOR_DOC} — the table format changed`);
  const missing = REPLICATES.filter((id) => !out.has(id));
  if (missing.length > 0) throw new Error(`REFUSED: prior table has no row for ${missing.join(", ")}`);
  return out;
}

const prior = priorResults();
const now = new Map();
for (const r of JSON.parse(readFileSync(join(HERE, "results.json"), "utf8"))) {
  now.set(r.item_id, r);
}

console.log("Replicates — Iteration 60 vs this run (different writer, different rater)\n");
console.log("| item | prior warm/blunt (gap) | now warm/blunt (gap) | gap drift | same verdict? |");
console.log("|---|---|---|---|---|");
let reproduced = 0;
for (const id of REPLICATES) {
  const p = prior.get(id);
  const n = now.get(id);
  if (!n) throw new Error(`REFUSED: ${id} is not in results.json — the replicate was not scored`);
  const nGap = n.blunt_right - n.warm_hollow;
  const sameVerdict = nGap >= 1 === p.gap >= 1;
  if (sameVerdict) reproduced += 1;
  console.log(
    `| \`${id}\` | ${p.warm}/${p.blunt} (${p.gap >= 0 ? "+" : ""}${p.gap}) | ${n.warm_hollow}/${n.blunt_right} ` +
      `(${nGap >= 0 ? "+" : ""}${nGap}) | ${nGap - p.gap >= 0 ? "+" : ""}${nGap - p.gap} | ${sameVerdict ? "yes" : "**NO**"} |`
  );
}
console.log(`\n${reproduced} of ${REPLICATES.length} replicates reached the same verdict as Iteration 60.`);
if (reproduced < REPLICATES.length) {
  console.log("\nAt least one replicate flipped. The two runs cannot be pooled without saying so:");
  console.log("a number that does not reproduce under a different rater is a fact about the rater.");
}
