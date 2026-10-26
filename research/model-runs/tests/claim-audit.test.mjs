// claim-audit.test.mjs -- G-claim-audit (lib/claim-audit.mjs, gateClaimAudit in lib/wave-gates.mjs).
//
// Must-pass fixtures are the REAL pilot reports 1 to 3 (source + wave + analysis + compiled JSON when present).
// Planted probes are in-memory edits of those real inputs; each must fail with its own check id, and with the probe
// removed (the untouched inputs audited again) the audit passes again. Nothing is written to disk.

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auditReport, loadReportInputs, swappedRanges, checkOfRule, CHECKS } from "../lib/claim-audit.mjs";
import { gateClaimAudit, runAllGates } from "../lib/wave-gates.mjs";
import { compileReport } from "../../../site/scripts/lib/model-report.mjs";
import { readDimensionNames } from "../../../site/scripts/lib/dimension-names.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..", "..", "..");
const RUNS = ["pilot-2026-10-01", "pilot-2026-10-02", "pilot-2026-10-03"];
const clone = (x) => JSON.parse(JSON.stringify(x));
const nl = (s) => s.replace(/\r\n/g, "\n");

function real(runId) {
  const inputs = loadReportInputs(runId, { repoRoot: REPO });
  const analysisFile = path.join(REPO, "research", "model-runs", runId, "analysis.json");
  const analysis = existsSync(analysisFile) ? JSON.parse(readFileSync(analysisFile, "utf8")) : null;
  return { runId, inputs, md: nl(inputs.md), wave: inputs.wave, compiled: inputs.compiled, analysis };
}
const FX = Object.fromEntries(RUNS.map((r) => [r, real(r)]));
const P3 = FX["pilot-2026-10-03"];
const audit = (fx, over = {}) => auditReport({ md: fx.md, wave: fx.wave, analysis: fx.analysis, compiled: fx.compiled, repoRoot: REPO, ...over });
const checks = (r) => [...new Set(r.mismatches.map((m) => m.check))];
/** Puts a line of text under the first H2 of the report. */
const plant = (md, line) => md.replace(/(^## [^\n]+\n)/m, `$1\n${line}\n`);
const compiledOf = (fx) => compileReport({ md: fx.md, wave: fx.wave, dimensionNames: readDimensionNames() }).report;

// ---------------------------------------------------------------------------
// Positive controls: the fixtures are real and the audit is not vacuous
// ---------------------------------------------------------------------------
for (const runId of RUNS) {
  test(`must pass: the real report of ${runId} (every token recomputed from its wave, wave tied to analysis.json)`, () => {
    const fx = FX[runId];
    assert.equal(fx.inputs.shape, "token-report", `${runId}: report source and wave must exist`);
    assert.ok(fx.analysis, `${runId}: analysis.json must exist so the stale-wave check runs`);
    const r = audit(fx);
    assert.deepEqual(r.mismatches, []);
    assert.equal(r.ok, true);
    assert.equal(r.summary.analysis_checked, true);
    // Positive control for the absence claim "no mismatches": the audit actually looked at figures.
    assert.ok(r.summary.figures >= 50, `${runId}: only ${r.summary.figures} figures audited`);
  });
}

test("must pass: the compiled report on disk is verified too when present, and a fresh compile gives the same verdict", () => {
  let verified = 0;
  for (const runId of RUNS) {
    const fx = FX[runId];
    if (!fx.compiled) continue; // gitignored build output: absent on a clean checkout
    verified += 1;
    assert.equal(audit(fx).summary.compiled_checked, true);
    assert.deepEqual(audit(fx, { compiled: null }).mismatches, []);
  }
  if (verified === 0) assert.ok(compiledOf(P3), "a fresh compile must exist when no compiled file does");
});

test("the audit uses the build's own code: its figure count equals the compiled ledger's, token for token", () => {
  const fresh = compiledOf(P3);
  assert.equal(audit(P3).summary.figures, fresh.figure_ledger.filter((e) => e.kind === "fig").length);
});

// ---------------------------------------------------------------------------
// Planted probes. Each: { name, check, plant(fx) -> over }. Removing the probe passes again.
// ---------------------------------------------------------------------------
const member = P3.wave.derived.not_separated_groups[0][0];
const memberPoint = P3.wave.subjects[member].pilot_composite;
const realRange = (() => { const e = compiledOf(P3).figure_ledger.find((x) => x.kind === "fig" && x.format === "range"); return e; })();

const PROBES = [
  {
    name: "a wrong figure: one digit of a printed figure changed in the compiled report",
    check: "wrong-figure",
    plant: (fx) => {
      const c = clone(compiledOf(fx));
      const e = c.figure_ledger.find((x) => x.kind === "fig" && x.format === "n1" && x.offset >= 0);
      const changed = e.rendered.replace(/\d(?!.*\d)/, (d) => String((Number(d) + 1) % 10));
      assert.notEqual(changed, e.rendered);
      const section = c.sections.find((s) => s.markdown.includes(e.rendered));
      assert.ok(section, "the figure must be in a section's markdown");
      section.markdown = section.markdown.replace(e.rendered, changed);
      e.rendered = changed;
      return { compiled: c };
    },
  },
  {
    name: "a wrong figure: the same digit changed in the printed text only (ledger left as built)",
    check: "wrong-figure",
    plant: (fx) => {
      const c = clone(compiledOf(fx));
      const e = c.figure_ledger.find((x) => x.kind === "fig" && x.format === "n1" && x.offset >= 0);
      const section = c.sections.find((s) => s.markdown.includes(e.rendered));
      section.markdown = section.markdown.replace(e.rendered, e.rendered.replace(/\d(?!.*\d)/, (d) => String((Number(d) + 1) % 10)));
      return { compiled: c };
    },
  },
  {
    name: "a figure with no source: a token whose path is not in the wave",
    check: "no-source",
    plant: (fx) => ({ md: plant(fx.md, "The pilot also measured {{subjects.not-a-model.pilot_composite|n1}} for a model that is not in the wave.") }),
  },
  {
    name: "a figure with no source: a number typed into the prose with no token",
    check: "no-source",
    plant: (fx) => ({ md: plant(fx.md, "The pilot scored 42.7 on the typed-in measure.") }),
  },
  {
    name: "a figure with no source: a literal with no |source:",
    check: "literal",
    plant: (fx) => ({ md: plant(fx.md, "A literal {{lit:12 of 40}} with no stated source.") }),
  },
  {
    name: "a figure with no source: a literal whose cited file does not hold it",
    check: "literal",
    plant: (fx) => ({ md: plant(fx.md, "A literal {{lit:913 of 4,001|source:research/model-assessments/pilot-2026-10-03.md}} that its file never says.") }),
  },
  {
    name: "a range printed with swapped bounds: a literal range, high first",
    check: "swapped-bounds",
    plant: (fx) => ({ md: plant(fx.md, "The corrected range was {{lit:7.6 to 2.3|source:research/model-assessments/pilot-2026-10-03.md}}.") }),
  },
  {
    name: "a range printed with swapped bounds: the ledger and text of a real range token reversed",
    check: "swapped-bounds",
    plant: (fx) => {
      const c = clone(compiledOf(fx));
      const e = c.figure_ledger.find((x) => x.kind === "fig" && x.format === "range" && x.offset >= 0);
      const [lo, hi] = e.value;
      e.value = [hi, lo];
      const swapped = `${hi.toFixed(1)} to ${lo.toFixed(1)}`;
      const section = c.sections.find((s) => s.markdown.includes(e.rendered));
      section.markdown = section.markdown.replace(e.rendered, swapped);
      e.rendered = swapped;
      return { compiled: c };
    },
  },
  {
    name: "a point tick for a model that is not separated (D-29a): its pilot_composite as a token",
    check: "point-display",
    plant: (fx) => ({ md: plant(fx.md, `A tick at {{subjects.${member}.pilot_composite|n1}} marks ${member}.`) }),
  },
  {
    name: "a point tick for a model that is not separated (D-29a): its point typed inside a literal",
    check: "point-display",
    plant: (fx) => ({ md: plant(fx.md, `The tick sat at {{lit:${memberPoint.toFixed(1)}|source:research/model-assessments/pilot-2026-10-03.md}}.`) }),
  },
  {
    name: "a stale wave: the wave does not hash to the run's analysis.json",
    check: "stale-wave",
    plant: (fx) => { const a = clone(fx.analysis); a.__probe = "changed after export"; return { analysis: a }; },
  },
  {
    name: "a compiled report that differs from a fresh compile of its source",
    check: "compiled-drift",
    plant: (fx) => { const c = clone(compiledOf(fx)); c.word_count += 1; return { compiled: c }; },
  },
];

for (const probe of PROBES) {
  test(`probe fails: ${probe.name} -> ${probe.check}; removed, the audit passes again`, () => {
    const baseline = audit(P3);
    assert.equal(baseline.ok, true, `baseline must pass before the probe: ${JSON.stringify(baseline.mismatches).slice(0, 300)}`);
    const over = probe.plant(P3);
    const hit = audit(P3, over);
    assert.equal(hit.ok, false, "the probe was not detected");
    assert.ok(checks(hit).includes(probe.check), `expected ${probe.check}, got ${checks(hit).join(", ")}: ${JSON.stringify(hit.mismatches).slice(0, 400)}`);
    for (const c of checks(hit)) assert.ok(CHECKS.includes(c), `unknown check id ${c}`);
    const removed = audit(P3);
    assert.equal(removed.ok, true, "with the probe removed the audit must pass again");
    assert.deepEqual(removed.mismatches, []);
  });
}

test("probes also fail on the other two real reports (not tuned to pilot 3)", () => {
  for (const runId of ["pilot-2026-10-01", "pilot-2026-10-02"]) {
    const fx = FX[runId];
    assert.equal(audit(fx).ok, true);
    assert.ok(checks(audit(fx, { md: plant(fx.md, "The pilot scored 42.7 on the typed-in measure.") })).includes("no-source"), runId);
    assert.ok(checks(audit(fx, { md: plant(fx.md, "Range {{lit:9.9 to 1.1|source:research/model-assessments/x.md}}.") })).includes("swapped-bounds"), runId);
    assert.equal(audit(fx).ok, true, `${runId}: passes again once the probe is removed`);
  }
});

test("a wave whose own range is stored high-first is a mismatch, not a quiet pass", () => {
  const wave = clone(P3.wave);
  const e = realRange;
  assert.ok(e);
  const m = e.path.match(/^(comparisons)\[a=([^,]+),b=([^\]]+)\]\.interval95$/);
  assert.ok(m, `unexpected path shape ${e.path}`);
  const q = wave.comparisons.find((x) => x.a === m[2] && x.b === m[3]);
  q.interval95 = [q.interval95[1], q.interval95[0]];
  const r = audit(P3, { wave, analysis: null });
  assert.equal(r.ok, false);
  assert.ok(checks(r).some((c) => ["swapped-bounds", "wave-invalid", "report-rule"].includes(c)), checks(r).join(", "));
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
test("swappedRanges: finds a high-first range, ignores ordered ranges, negatives and the typographic minus", () => {
  assert.equal(swappedRanges("from 7.6 to 2.3 here").length, 1);
  assert.equal(swappedRanges("from 2.3 to 7.6 here").length, 0);
  assert.equal(swappedRanges("from -2.0 to 5.4").length, 0);
  assert.equal(swappedRanges("from 5.4 to -2.0").length, 1);
  assert.equal(swappedRanges("from −2.0 to 5.4").length, 0);
  assert.equal(swappedRanges("from 1,200 to 900").length, 1);
  assert.equal(swappedRanges("no numbers to compare").length, 0);
});

test("checkOfRule maps build rules to audit checks", () => {
  assert.equal(checkOfRule("R-bare-digit"), "no-source");
  assert.equal(checkOfRule("R-token-unresolved"), "no-source");
  assert.equal(checkOfRule("R-lit-source"), "literal");
  assert.equal(checkOfRule("R-group-point"), "point-display");
  assert.equal(checkOfRule("R-wave-invalid"), "wave-invalid");
  assert.equal(checkOfRule("R-word-count"), "report-rule");
});

// ---------------------------------------------------------------------------
// The gate
// ---------------------------------------------------------------------------
test("gate: pass on the real pilot-3 report with its analysis; the verdict names how it was checked", () => {
  const g = gateClaimAudit({ runId: "pilot-2026-10-03", repoRoot: REPO, analysis: P3.analysis });
  assert.equal(g.status, "pass", g.detail);
  assert.equal(g.id, "G-claim-audit");
  assert.ok(g.evidence.figures >= 150);
});

test("gate: fail (never pass) for each probe, with the mismatches in the evidence", () => {
  for (const probe of PROBES.slice(0, 11)) {
    const over = probe.plant(P3);
    const claimAudit = { shape: "token-report", md: over.md ?? P3.md, wave: over.wave ?? P3.wave, compiled: over.compiled ?? null };
    const g = gateClaimAudit({ runId: "pilot-2026-10-03", repoRoot: REPO, analysis: over.analysis ?? P3.analysis, claimAudit });
    assert.equal(g.status, "fail", `${probe.name}: ${g.detail}`);
    assert.ok(g.evidence.mismatch_count >= 1);
    assert.ok(g.evidence.mismatches.some((s) => s.includes(`[${probe.check}`)), `${probe.name}: ${g.evidence.mismatches.join(" / ")}`);
  }
});

test("gate: hold when there is no analysis.json to tie the wave to, even if every token resolves", () => {
  const g = gateClaimAudit({ runId: "pilot-2026-10-03", repoRoot: REPO, analysis: null });
  assert.equal(g.status, "hold");
});

test("gate: hold with no run id, hold with a run that has no report, fail when the wave is missing", () => {
  assert.equal(gateClaimAudit().status, "hold");
  assert.equal(gateClaimAudit({ runId: "fx-run", repoRoot: REPO }).status, "hold");
  assert.equal(gateClaimAudit({ runId: "x", claimAudit: { shape: "wave-missing", waveFile: "w.json" } }).status, "fail");
});

test("gate: a hand-written assessment with literal numbers is not-built (not auditable), never pass", () => {
  const g = gateClaimAudit({ runId: "x", claimAudit: { shape: "literal-assessment" } });
  assert.equal(g.status, "not-built");
  assert.match(g.detail, /literal numbers/);
});

test("gate: runAllGates reports G-claim-audit as a verdict-bearing gate (pass/fail), not not-built, for a real run", () => {
  const out = runAllGates({ runId: "pilot-2026-10-03", repoRoot: REPO, analysis: P3.analysis, runConfig: { subjects: [] } });
  const g = out.find((r) => r.id === "G-claim-audit");
  assert.equal(g.status, "pass", g.detail);
});
