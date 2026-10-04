#!/usr/bin/env node
/**
 * export-wave.mjs -- export an assessment wave from its analysis artifact.
 *
 *   node research/model-runs/bin/export-wave.mjs --run-id pilot-2026-10-01
 *   node research/model-runs/bin/export-wave.mjs --check [--run-id <id>]
 *
 * Reads  research/model-runs/<run_id>/analysis.json (A), the item bank facts
 *        (imported from site/src/lib/model-index-facts.ts, not re-derived) and
 *        the status of D-29a in DECISIONS.md. For a run with pinned local subjects
 *        (A has design.subject_builds) it also reads, beside A, the run's
 *        PREREGISTRATION.md (subject table and runtime line) and run-config.json
 *        (model families of subjects and judges, and preregistration.as_written_sha256
 *        when the run recorded it); neither is edited.
 * Writes site/src/data/model-benchmark/waves/<run_id>.json and
 *        site/src/data/model-benchmark/waves/manifest.json (committed output).
 *
 * Publishing is a deliberate act, so this is run by hand and its output is
 * committed; it is not a build side effect. The Docker build context is site/
 * only, so the committed wave file is what the site builds from.
 *
 * --check regenerates in memory and byte-compares with the committed files.
 * Without research/ (Docker) it prints SKIP and exits 0; with
 * CB_REQUIRE_RESEARCH=1 a skip is a FAILURE (CI and pre-commit).
 *
 * --force is required to overwrite an existing wave file with different
 * content (for instance after D-29a is ratified and the status flips).
 *
 * Rules and projection: site/scripts/lib/model-wave.mjs. Spec:
 * docs/AI_MODEL_ASSESSMENT_TEMPLATE.md sections A and J.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SITE = join(ROOT, "site");
const RUNS = join(ROOT, "research", "model-runs");
// CB_WAVES_DIR points the exporter at a scratch copy of waves/ (tests plant defects there, never in the committed files).
const WAVES = process.env.CB_WAVES_DIR ? resolve(process.env.CB_WAVES_DIR) : join(SITE, "src", "data", "model-benchmark", "waves");
const MANIFEST = join(WAVES, "manifest.json");

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
const CHECK = flag("--check");
const FORCE = flag("--force");
const RUN = opt("--run-id");
const DECISION_REF = opt("--decision", "D-29a");

function fail(msg) {
  console.error(`export-wave: ${msg}`);
  process.exit(1);
}

// CB_FAKE_NO_RESEARCH=1 simulates the Docker context in tests (the real thing has no research/ at all).
if (process.env.CB_FAKE_NO_RESEARCH === "1" || !existsSync(RUNS) || !existsSync(join(ROOT, "DECISIONS.md"))) {
  const msg = "research/model-runs or DECISIONS.md not present (Docker build context is site/ only)";
  if (CHECK && process.env.CB_REQUIRE_RESEARCH !== "1") {
    console.log(`export-wave --check: SKIP (${msg}). Set CB_REQUIRE_RESEARCH=1 to make a skip fail.`);
    process.exit(0);
  }
  fail(`${msg}${CHECK ? "; CB_REQUIRE_RESEARCH=1 makes a skip a failure" : ""}`);
}

const lib = await import(pathToFileURL(join(SITE, "scripts", "lib", "model-wave.mjs")).href);
const { importSiteModule } = await import(pathToFileURL(join(SITE, "scripts", "lib", "ts-alias-loader.mjs")).href);
const { MODEL_INDEX_FACTS } = await importSiteModule("src/lib/model-index-facts.ts");
const tasks = JSON.parse(readFileSync(join(SITE, "src", "data", "model-benchmark", "tasks-v1.json"), "utf8"));

// The serving rule is cb-probe's own: getScorableItems(bank) minus isSensitiveItem(item). Imported, not re-implemented
// (research/model-runs/lib/common.mjs servedItems() composes the same two functions).
const { getScorableItems } = await import(pathToFileURL(join(ROOT, "tools", "cb-probe", "lib", "bank.mjs")).href);
const { isSensitiveItem } = await import(pathToFileURL(join(ROOT, "tools", "cb-probe", "lib", "sensitivity.mjs")).href);
const scorable = getScorableItems(tasks);
const served = scorable.filter((i) => !isSensitiveItem(i));
const bank = {
  items_total: MODEL_INDEX_FACTS.itemCount,
  items_validated: MODEL_INDEX_FACTS.itemsWithTwoReviews,
  items_served: served.length,
  items_not_served: tasks.items.length - served.length,
  // Sensitive items that the unreviewed filter did not already remove, and the unreviewed ones; the two are disjoint by construction.
  items_not_served_sensitive: scorable.length - served.length,
  items_not_served_unreviewed: tasks.items.length - scorable.length,
  version: tasks.meta.bankVersion,
};
if (bank.items_total !== tasks.items.length) fail(`MODEL_INDEX_FACTS.itemCount ${bank.items_total} != tasks-v1.json items ${tasks.items.length}`);
const decision = { ref: DECISION_REF, status: lib.parseDecisionStatus(readFileSync(join(ROOT, "DECISIONS.md"), "utf8"), DECISION_REF) };

/** The date a run reports under: the trailing YYYY-MM-DD of its run id (deterministic, no clock). */
function reportDateOf(runId) {
  const m = runId.match(/(\d{4}-\d{2}-\d{2})$/);
  if (!m) fail(`cannot derive a report date from run id "${runId}"; it must end in YYYY-MM-DD`);
  return m[1];
}

/**
 * Largest number of items one subject conversation (a "part") was asked, from the operations manifest:
 * column 6 is the item count of each planned part. The manifest lists the standard parts; parts that were
 * later re-delivered in smaller pieces (two Fable parts as 14-item halves in the pilot) are not rows in it, so
 * this is the maximum over the standard parts, and the smaller pieces cannot raise it.
 */
function itemsPerConversationMax(runId, design) {
  const p = join(RUNS, runId, "operations", "subject-parts.manifest.tsv");
  // A run whose design is "a fresh conversation per (item, trial)" has no parts manifest: every conversation holds one item.
  if (!existsSync(p) && typeof design?.conversation_per_item === "string" && /^fresh conversation per \(item, trial\)/.test(design.conversation_per_item)) return 1;
  if (!existsSync(p)) fail(`${p} not found (needed for design.items_per_conversation_max)`);
  const TAB = String.fromCharCode(9);
  const counts = readFileSync(p, "utf8").split(String.fromCharCode(10)).map((l) => l.replace(/\s+$/, "")).filter(Boolean).map((l) => Number(l.split(TAB)[5]));
  if (counts.length === 0 || counts.some((n) => !Number.isInteger(n) || n < 1)) fail(`${p}: column 6 must be a positive integer item count on every row`);
  return Math.max(...counts);
}

/**
 * Build provenance for a run with local subjects: the subject table and runtime line of its PREREGISTRATION.md
 * (parsed, not retyped) and the model families in its run-config.json. Both are inputs beside analysis.json; neither
 * is edited here. The pre-registration was not committed before the data existed (see PREREGISTRATION_NOTE in the library).
 */
function provenanceOf(runId, { arms = false } = {}) {
  const prereg = join(RUNS, runId, "PREREGISTRATION.md");
  const cfg = join(RUNS, runId, "run-config.json");
  if (!existsSync(prereg)) fail(`${prereg} not found (needed for subject provenance)`);
  if (!existsSync(cfg)) fail(`${cfg} not found (needed for the judge and subject model families)`);
  const text = readFileSync(prereg, "utf8").replace(/\r\n?/g, "\n");
  const runtime = lib.parsePreregRuntime(text);
  if (!runtime) fail(`${prereg}: no "- Runtime: <name> <version>" line`);
  const config = JSON.parse(readFileSync(cfg, "utf8"));
  const families = {
    judges: Object.fromEntries((config.judges ?? []).map((j) => [j.label, j.family])),
    subjects: Object.fromEntries((config.subjects ?? []).map((s) => [s.label, s.family])),
  };
  const prov = { subjects: lib.parsePreregSubjects(text), runtime, families, preregistration_committed_before_data: false };
  // A run whose plan was committed and pushed before any reply existed says so in run-config.json (preregistration.committed_before_data).
  // Absent or false, the exporter keeps the default (not committed before the data), so a wave exported before this field existed does not change.
  if (config.preregistration?.committed_before_data === true) prov.preregistration_committed_before_data = true;
  // An arms run publishes its system messages verbatim (each variant's own text, else the run-wide one); the exporter checks each against its hash.
  if (arms) {
    prov.system_messages = Object.fromEntries((config.subjects ?? []).map((s) => [s.label, s.system_message ?? config.system_message]));
    for (const [label, m] of Object.entries(prov.system_messages)) if (typeof m !== "string") fail(`${cfg}: no system message for subject ${label} (neither subjects[].system_message nor system_message)`);
  }
  // The hash of the plan as written (before any deviation was appended), when the run recorded it. Optional, so a run
  // without it exports exactly as before.
  const asWritten = config.preregistration?.as_written_sha256;
  if (asWritten !== undefined) {
    if (typeof asWritten !== "string" || !/^[0-9a-f]{64}$/.test(asWritten)) fail(`${cfg}: preregistration.as_written_sha256 is not a sha256`);
    prov.preregistration_as_written_sha256 = asWritten;
  }
  return prov;
}

function regenerate(runId) {
  const aPath = join(RUNS, runId, "analysis.json");
  if (!existsSync(aPath)) fail(`${aPath} not found`);
  const analysis = JSON.parse(readFileSync(aPath, "utf8"));
  if (analysis.run_id !== runId) fail(`analysis.run_id "${analysis.run_id}" != --run-id "${runId}"`);
  const ctx = { bank: { ...bank }, decision, reportDate: reportDateOf(runId), items_per_conversation_max: itemsPerConversationMax(runId, analysis.design) };
  if (analysis.design?.subject_builds) ctx.provenance = provenanceOf(runId, { arms: lib.isArmsDesign(analysis.design) });
  const wave = lib.projectWave(analysis, ctx);
  return { wave, text: lib.serialiseWave(wave) };
}

function readManifest() {
  return existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : [];
}

if (!CHECK) {
  if (!RUN) fail("usage: export-wave.mjs --run-id <id> [--force] | --check [--run-id <id>]");
  const { wave, text } = regenerate(RUN);
  const target = join(WAVES, `${RUN}.json`);
  if (existsSync(target) && readFileSync(target, "utf8") !== text && !FORCE) {
    fail(`${target} exists with different content. A published wave must not change silently; re-run with --force if this is deliberate (for example D-29a status changed).`);
  }
  mkdirSync(WAVES, { recursive: true });
  writeFileSync(target, text);
  const entries = readManifest().filter((e) => e.run_id !== RUN);
  entries.push(lib.manifestEntry(wave));
  writeFileSync(MANIFEST, lib.serialiseManifest(entries));
  const d = wave.derived;
  console.log(`wrote ${target}`);
  console.log(`wrote ${MANIFEST}`);
  console.log(`status: ${wave.official ? "official" : "pilot"} comparability:${wave.comparability} decision ${wave.publication.decision_ref}: ${wave.publication.decision_status}`);
  // Point-valued derived fields are not printed for an arms wave: the console is not a place amendment 16's withheld points belong.
  console.log(`derived: groups=${JSON.stringify(d.not_separated_groups)} separated=${JSON.stringify(d.separated_subjects)}${d.display_rule ? ` range_only=${JSON.stringify(d.range_only_subjects)} display_rule=amendment ${d.display_rule.amendment}` : ` range=${JSON.stringify(d.not_separated_group_range)}`}`);
  console.log(`sensitivity: pattern_unchanged=${wave.sensitivity.separation_pattern_unchanged} level_shift_group_range=${JSON.stringify(d.sensitivity_level_shift_group_range)} level_shift=${JSON.stringify(d.sensitivity_level_shift)}`);
  console.log(`bank: served=${wave.bank.items_served} not_served=${wave.bank.items_not_served} (sensitive ${wave.bank.items_not_served_sensitive}, unreviewed ${wave.bank.items_not_served_unreviewed}); items_per_conversation_max=${wave.design.items_per_conversation_max}`);
  process.exit(0);
}

// ----- --check -------------------------------------------------------------
const problems = [];
const manifest = readManifest();
const wanted = RUN ? [RUN] : manifest.map((e) => e.run_id);
if (wanted.length === 0) problems.push("no waves in manifest.json: a check over zero waves proves nothing");
const regenerated = [];
for (const id of wanted) {
  const target = join(WAVES, `${id}.json`);
  if (!existsSync(target)) {
    problems.push(`${id}: committed wave file missing`);
    continue;
  }
  const { wave, text } = regenerate(id);
  regenerated.push(wave);
  if (readFileSync(target, "utf8") !== text) problems.push(`${id}: committed wave differs from regeneration (run export-wave.mjs --run-id ${id} --force after reviewing the diff)`);
  const entry = manifest.find((e) => e.run_id === id);
  if (!entry) problems.push(`${id}: not listed in manifest.json`);
  else if (JSON.stringify(entry) !== JSON.stringify(lib.manifestEntry(wave))) problems.push(`${id}: manifest entry differs from the wave`);
}
if (!RUN) {
  const onDisk = readdirSync(WAVES).filter((f) => f.endsWith(".json") && f !== "manifest.json").map((f) => f.replace(/\.json$/, ""));
  for (const id of onDisk) if (!manifest.some((e) => e.run_id === id)) problems.push(`${id}: wave file exists but is not in manifest.json`);
  if (readFileSync(MANIFEST, "utf8") !== lib.serialiseManifest(manifest)) problems.push("manifest.json is not in canonical order or format");
}
if (problems.length) {
  console.error(`export-wave --check FAILED (${problems.length}):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`export-wave --check: ${regenerated.length} wave(s) regenerate byte-identically (${wanted.join(", ")}); decision ${decision.ref} is ${decision.status}`);
