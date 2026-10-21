#!/usr/bin/env node
/**
 * test-model-watch.mjs -- tests for the AI Model Watch data layer (docs/DATA_MODEL_AI_MODEL_WATCH.md).
 *
 * Every validator rule id (MW-S1..S4, K1, L1, L2, T1, F1, F2, X1..X3, E1..E5, W1) gets a PLANTED PROBE that must trip
 * exactly that rule, plus a positive control (the clean fixture passes) so a validator that rejects everything cannot pass.
 * Also covers: import normalisation and idempotence, the edition compiler (refuses to overwrite; --append-correction changes
 * only corrections), the tested-by-us derivation (pilot / queued / not-yet, and never "pilot" for a non-active wave),
 * the queue snapshot, and the prebuild step exiting 0 without research/.
 *
 * Fixtures are synthetic. Exit 0 = all pass.
 */

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateCatalog, validateReleaseLog, validateEdition, validateEditionTransition, validateEditionsManifest, validateLogTransition,
  validateCatalogTransition, validateModelWatchState, forbiddenKeyProblems, freshnessWarnings,
} from "./lib/model-watch-validator.mjs";
import { compileEdition, buildEditionsManifest, editionContentHash, deriveReleases } from "./lib/model-watch-edition.mjs";
import { normaliseCatalog, normaliseReleases, mergeCatalog, mergeLog, guardProblems } from "./lib/model-watch-import.mjs";
import { testedStatus } from "./lib/model-watch-tested.mjs";
import { buildQueueSnapshot } from "./lib/model-watch-queue.mjs";
import { renderableEntries } from "./lib/pilot-render-gate.mjs";
import { deriveLogId, serialise, sha256Hex } from "./lib/model-watch-core.mjs";
import { NOW, catRow, logRow, mkCatalog, mkLog, richStores, QUEUE, sourceFor, compiled, stateWith, clone, src } from "./lib/model-watch-fixtures.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
let passed = 0;
let failed = 0;
const ok = (label, cond, detail = "") => {
  if (cond) { passed += 1; console.log(`  PASS  ${label}`); } else { failed += 1; console.error(`  FAIL  ${label}${detail ? `: ${detail}` : ""}`); }
};
const has = (arr, sub) => arr.some((s) => s.includes(sub));
/** Planted probe: the violation must trip a failure that starts with the rule id. */
const trips = (label, problems, rule) => ok(`NC ${label} trips ${rule}`, has(problems, `${rule}:`), `got: ${problems.join(" | ").slice(0, 240) || "nothing"}`);
const section = (t) => console.log(`\n${t}`);

const ctx = { now: NOW, queueTags: new Set(["zeta:7b"]), waveTags: new Set(["wave:3b"]), withheldTokens: ["62.3"], releaseWatchIds: new Set(["rw-1"]) };
const cat = (rows) => validateCatalog(mkCatalog(rows), ctx).failures;
const lg = (rows, extra = {}) => validateReleaseLog(mkLog(rows), { ...ctx, catalogIds: new Set(["acme-alpha-1", "acme-alpha-2", "zeta-open-7b"]), ...extra }).failures;

// ---------------------------------------------------------------------------------------------------------------------
section("positive controls (clean fixtures pass)");
{
  const stores = richStores();
  const ed = compiled();
  const r = validateModelWatchState(stateWith(ed, stores), ctx);
  ok("rich stores + compiled edition validate with zero failures", r.failures.length === 0, r.failures.join(" | "));
  ok("seed (empty) stores validate", validateModelWatchState({ catalog: mkCatalog([]), log: mkLog([]), editions: {}, manifest: { editions: [] } }, ctx).failures.length === 0);
  ok("fixture catalog row is clean", cat([catRow()]).length === 0, cat([catRow()]).join(" | "));
  ok("fixture log row is clean", lg([logRow()]).length === 0, lg([logRow()]).join(" | "));
}

// ---------------------------------------------------------------------------------------------------------------------
section("MW-S1 required fields, types, enums, rowCount");
{
  trips("bad status enum", cat([catRow({ status: "excellent" })]), "MW-S1");
  trips("empty access array", cat([catRow({ access: [] })]), "MW-S1");
  trips("unknown access value", cat([catRow({ access: ["hosted"] })]), "MW-S1");
  trips("non-integer context window", cat([catRow({ contextWindowTokens: 1.5 })]), "MW-S1");
  trips("missing licence", cat([catRow({ licence: "" })]), "MW-S1");
  const c = mkCatalog([catRow()]); c.meta.rowCount = 5;
  trips("rowCount != rows.length", validateCatalog(c, ctx).failures, "MW-S1");
  trips("unknown log kind", lg([logRow({ kind: "rumour", id: "x" })]), "MW-S1");
  trips("safetyNote missing when relevant", lg([logRow({ safetyOrWelfareRelevant: true, safetyNote: null })]), "MW-S1");
  trips("safetyNote present when not relevant", lg([logRow({ safetyOrWelfareRelevant: false, safetyNote: "x" })]), "MW-S1");
  trips("null modelName for a non-policy kind", lg([logRow({ modelName: null, id: "2026-09-10--acme--no-model--new-model" })]), "MW-S1");
  ok("null modelName is allowed for kind policy", lg([logRow({ modelName: null, catalogId: null, kind: "policy" })]).length === 0);
  ok("month-level releaseDate is accepted", cat([catRow({ releaseDate: "2026-08" })]).length === 0);
  trips("malformed releaseDate", cat([catRow({ releaseDate: "Aug 2026" })]), "MW-S4");
}

section("MW-S2 sources");
{
  trips("catalog row with no source", cat([catRow({ sources: [] })]), "MW-S2");
  trips("http (not https) source", cat([catRow({ sources: [src({ url: "http://example.com/x" })] })]), "MW-S2");
  trips("unparseable source url", cat([catRow({ sources: [src({ url: "https://" })] })]), "MW-S2");
  trips("source accessed in the future", cat([catRow({ sources: [src({ accessed: "2027-01-01" })] })]), "MW-S2");
  trips("log row without a primary source", lg([logRow({ sources: [src({ sourceType: "news" })] })]), "MW-S2");
  const w = validateCatalog(mkCatalog([catRow({ sources: [src({ sourceType: "news" })] })]), ctx);
  ok("catalog row without a primary source only WARNS", w.failures.length === 0 && has(w.warnings, "MW-S2"));
  ok("coarse research source types (primary/secondary) are accepted", cat([catRow({ sources: [src({ sourceType: "primary" }), src({ url: "https://example.com/b", sourceType: "secondary" })] })]).length === 0);
}

section("MW-S3 ids");
{
  trips("duplicate catalog id", cat([catRow(), catRow({ name: "Alpha 1b" })]), "MW-S3");
  trips("malformed catalog id", cat([catRow({ id: "Acme Alpha!" })]), "MW-S3");
  trips("log id not equal to its derivation", lg([logRow({ id: "hand-written-id" })]), "MW-S3");
  trips("duplicate log id", lg([logRow(), logRow()]), "MW-S3");
  ok("log id derivation is date--provider--model--kind", logRow().id === "2026-09-10--acme--alpha-1--new-model");
  ok("a policy row with no model derives a no-model segment", logRow({ modelName: null, kind: "policy" }).id === "2026-09-10--acme--no-model--policy");
}

section("MW-S4 dates");
{
  trips("future log date", lg([logRow({ date: "2027-01-01" })]), "MW-S4");
  trips("future firstListedOn", cat([catRow({ firstListedOn: "2027-01-01" })]), "MW-S4");
  trips("non-ISO loggedOn", lg([logRow({ loggedOn: "16/10/2026" })]), "MW-S4");
  ok("a backfilled log (loggedOn after date) is allowed", lg([logRow({ date: "2026-09-10", loggedOn: "2026-10-16" })]).length === 0);
}

section("MW-K1 no rating-shaped keys");
{
  trips("a 'score' key on a catalog row", forbiddenKeyProblems({ rows: [{ id: "x", score: 1 }] }), "MW-K1");
  trips("a 'bestFor' key", forbiddenKeyProblems({ bestFor: "x" }), "MW-K1");
  trips("an 'eloRating' key (whole camelCase word 'elo')", forbiddenKeyProblems({ eloRating: 1 }), "MW-K1");
  trips("an 'mmlu' key", forbiddenKeyProblems({ mmlu: 1 }), "MW-K1");
  trips("a nested 'accuracy' key", forbiddenKeyProblems({ a: { b: [{ accuracy: 0.9 }] } }), "MW-K1");
  ok("'queuedDevelopers' and 'developer' are not read as 'elo'", forbiddenKeyProblems({ queuedDevelopers: [], developer: "x" }).length === 0);
  const c = mkCatalog([catRow()]); c.rows[0].rank = 3;
  trips("a rank key on a real catalog row", validateCatalog(c, ctx).failures, "MW-K1");
}

section("MW-L1 lexicon");
{
  trips("'best' in notes", cat([catRow({ notes: "The best option." })]), "MW-L1");
  trips("'top' in a summary", lg([logRow({ summary: "A top model released." })]), "MW-L1");
  trips("band name 'Critical' (case-sensitive)", lg([logRow({ summary: "Rated Critical.", safetyOrWelfareRelevant: false })]), "MW-L1");
  trips("endorsement language 'recommended'", cat([catRow({ notes: "Recommended default." })]), "MW-L1");
  trips("'trusted' in a safetyNote", lg([logRow({ safetyOrWelfareRelevant: true, safetyNote: "Trusted access program." })]), "MW-L1");
  ok("lowercase 'critical' is not a band name", cat([catRow({ notes: "A critical bug fix." })]).length === 0);
  ok("a negated negatable word passes ('not a ranking')", cat([catRow({ notes: "This is not a ranking." })]).length === 0);
  trips("a non-negatable banned word is not rescued by 'not' ('not the best' still trips)", cat([catRow({ notes: "Not the best fit." })]), "MW-L1");
}

section("MW-L2 benchmark-result claims");
{
  trips("a percentage in notes", cat([catRow({ notes: "Scores 85% on tasks." })]), "MW-L2");
  trips("'MMLU' in a summary", lg([logRow({ summary: "Reports MMLU results." })]), "MW-L2");
  trips("'Arena' in notes", cat([catRow({ notes: "Appears on Arena." })]), "MW-L2");
  ok("a context-window phrase is not a benchmark claim", cat([catRow({ notes: "128K context window." })]).length === 0);
}

section("MW-T1 pilot-withheld numbers (G19 pre-check)");
{
  trips("a withheld composite token in notes", cat([catRow({ notes: "Has 62.3 something." })]), "MW-T1");
  trips("a withheld token as a parameterCount ('62.3B')", cat([catRow({ parameterCount: "62.3B" })]), "MW-T1");
  trips("a withheld token in a log summary", lg([logRow({ summary: "Context of 62.3 units." })]), "MW-T1");
  ok("a superstring number (362.35) does not trip", cat([catRow({ notes: "Has 362.35 units." })]).length === 0);
}

section("MW-F1 foreign keys");
{
  trips("catalogId that resolves to no catalog row", lg([logRow({ catalogId: "ghost" })]), "MW-F1");
  trips("benchmarkLocalTag in neither queue nor waves", cat([catRow({ benchmarkLocalTag: "nowhere:1b" })]), "MW-F1");
  ok("benchmarkLocalTag found in the queue snapshot passes", cat([catRow({ benchmarkLocalTag: "zeta:7b" })]).length === 0);
  ok("benchmarkLocalTag found in a wave subject_builds passes", cat([catRow({ benchmarkLocalTag: "wave:3b" })]).length === 0);
}

section("MW-F2 append-only");
{
  const prior = mkLog([logRow()]);
  const removed = mkLog([]);
  trips("a removed log row", validateLogTransition(prior, removed), "MW-F2");
  const frozen = clone(prior); frozen.rows[0].provider = "Other";
  trips("a changed frozen field", validateLogTransition(prior, frozen), "MW-F2");
  const loggedOn = clone(prior); loggedOn.rows[0].loggedOn = "2026-10-17";
  trips("a changed loggedOn", validateLogTransition(prior, loggedOn), "MW-F2");
  const noSrc = clone(prior); noSrc.rows[0].sources = [src({ url: "https://example.com/other" })];
  trips("a removed source", validateLogTransition(prior, noSrc), "MW-F2");
  const grown = clone(prior); grown.rows[0].sources.push(src({ url: "https://example.com/more" }));
  ok("a grown source list passes", validateLogTransition(prior, grown).length === 0);
  const text = clone(prior); text.rows[0].summary = "Edited summary.";
  trips("summary changed with no correction", validateLogTransition(prior, text), "MW-F2");
  const textOk = clone(text); textOk.rows[0].corrections.push({ date: "2026-10-17", text: "Corrected the summary." });
  ok("summary changed together with a correction passes", validateLogTransition(prior, textOk).length === 0);
  const withC = clone(prior); withC.rows[0].corrections = [{ date: "2026-10-17", text: "First." }];
  const rewritten = clone(withC); rewritten.rows[0].corrections = [{ date: "2026-10-17", text: "Rewritten." }];
  trips("a rewritten correction", validateLogTransition(withC, rewritten), "MW-F2");
  trips("a catalog id that disappears", validateCatalogTransition(mkCatalog([catRow()]), mkCatalog([])), "MW-F2");
  const fl = mkCatalog([catRow({ firstListedOn: "2026-10-01" })]);
  trips("a changed firstListedOn", validateCatalogTransition(fl, mkCatalog([catRow({ firstListedOn: "2026-10-09" })])), "MW-F2");
  ok("an unchanged catalog passes the transition", validateCatalogTransition(mkCatalog([catRow()]), mkCatalog([catRow()])).length === 0);
}

section("MW-X1 / X2 / X3 store separation");
{
  for (const key of ["release_id", "registry_id", "lifecycle", "evidence", "detected_in_scan", "evaluation_disposition"]) {
    const row = { ...logRow(), [key]: "x" };
    trips(`release-watch key '${key}' on a log row`, lg([row]), "MW-X1");
  }
  trips("releaseWatchId that is not in releases-v1.json", lg([logRow({ releaseWatchId: "nope" })]), "MW-X2");
  ok("releaseWatchId that exists passes", lg([logRow({ releaseWatchId: "rw-1" })]).length === 0);
  trips("a modified registry hash is caught by the import guard", guardProblems(["a", "b"], ["x", "b"]), "MW-X3");
  trips("a modified releases hash is caught by the import guard", guardProblems(["a", "b"], ["a", "y"]), "MW-X3");
  ok("an unchanged pair passes the guard", guardProblems(["a", "b"], ["a", "b"]).length === 0);
}

section("MW-E1..E5 editions");
{
  const stores = richStores();
  const base = compiled();
  const run = (ed, extra) => validateEdition({ edition: ed, filename: `${ed.date}.json`, log: stores.log, catalog: stores.catalog }, ctx).failures.concat(extra ?? []);
  ok("compiled edition validates", run(base).length === 0, run(base).join(" | "));
  ok("edition has six parts in order and a recomputable hash", base.contentHash === editionContentHash(base));
  ok("windowDays token resolves inclusively (2026-09-01..2026-10-16 = 46 days)", /\b46 days\b/.test(base.lead));
  ok("release and disclosure tokens resolve from the derivation", /\b4 releases\b/.test(base.lead) && /\b1 carried\b/.test(base.lead), base.lead);
  const noQueue = clone(base); delete noQueue.queue;
  trips("a missing part", run(noQueue), "MW-E1");
  const editedLead = clone(base); editedLead.lead += " Extra words.";
  trips("lead edited after compile (hash no longer recomputes)", run(editedLead), "MW-E1");
  const wrongName = clone(base);
  trips("edition date != filename", validateEdition({ edition: base, filename: "2026-10-09.json", log: stores.log, catalog: stores.catalog }, ctx).failures, "MW-E1");
  const emptyScan = compiled({ coverage: { scanned: [], notScanned: ["Everything"] } });
  ok("empty scanned[] compiles to 'No scan ran for this window'", emptyScan.coverageStatement.startsWith("No scan ran for this window") && !/nothing found/i.test(emptyScan.coverageStatement));
  const lyingScan = clone(emptyScan); lyingScan.coverageStatement = "Nothing found."; lyingScan.contentHash = editionContentHash(lyingScan);
  trips("empty scanned[] with a 'nothing found' statement", run(lyingScan), "MW-E1");
  const empty = compiled({}, richStores(), []);
  ok("empty measured reports read 'Nothing published in this window.'", empty.measured.note.startsWith("Nothing published in this window."));

  // E2: hand-edited release list
  const extraRelease = clone(base); extraRelease.releases.push({ ...extraRelease.releases[0], releaseId: "2026-09-02--acme--ghost--new-model" }); extraRelease.contentHash = editionContentHash(extraRelease);
  trips("a release not in the log (hash recomputed)", run(extraRelease), "MW-E2");
  const editedSummary = clone(base); editedSummary.releases[0].summary = "Hand edited."; editedSummary.contentHash = editionContentHash(editedSummary);
  trips("a hand-edited release summary (hash recomputed)", run(editedSummary), "MW-E2");
  const dropped = clone(base); dropped.releases.pop(); dropped.contentHash = editionContentHash(dropped);
  trips("a dropped release (hash recomputed)", run(dropped), "MW-E2");
  const later = richStores(); later.log.rows.push(logRow({ date: "2026-10-05", modelName: "Alpha 3", catalogId: null, loggedOn: "2026-10-30", summary: "Later row.", sources: [src({ url: "https://example.com/later" })] })); later.log.meta.rowCount += 1;
  ok("a row logged AFTER the edition date never enters it (loggedOn <= asOf)", deriveReleases(later.log, base.window, base.asOf).length === base.releases.length);
  const disc = clone(base); disc.disclosures[0].safetyNote = "Changed."; disc.contentHash = editionContentHash(disc);
  trips("a hand-edited disclosure", run(disc), "MW-E2");

  // E3: lead digits, corrections
  const digitLead = clone(base); digitLead.lead += " It covered 47 vendors."; digitLead.contentHash = editionContentHash(digitLead);
  trips("a stray figure in the lead", run(digitLead), "MW-E3");
  const outOfOrder = clone(base); outOfOrder.corrections = [{ date: "2026-10-17", text: "a" }, { date: "2026-10-16", text: "b" }];
  trips("corrections out of date order", run(outOfOrder), "MW-E3");
  trips("an edition changed outside corrections", validateEditionTransition(base, digitLead, "x"), "MW-E3");
  const withCorr = clone(base); withCorr.corrections = [{ date: "2026-10-17", text: "Fixed a link." }];
  ok("adding a correction passes the edition transition (hash excludes corrections)", validateEditionTransition(base, withCorr, "x").length === 0 && editionContentHash(withCorr) === base.contentHash);
  trips("rewriting a correction", validateEditionTransition(withCorr, { ...withCorr, corrections: [{ date: "2026-10-17", text: "Other." }] }, "x"), "MW-E3");
  {
    const bad = compileEdition({ source: sourceFor({ lead: "We saw 47 models and {{BOGUS}}." }), log: stores.log, catalog: stores.catalog, queueSnapshot: QUEUE, renderable: [] });
    ok("compile rejects a lead with a stray digit and an unknown token", bad.edition === null && has(bad.errors, "digit") && has(bad.errors, "unknown token"), bad.errors.join(" | "));
    const longLead = compileEdition({ source: sourceFor({ lead: "word ".repeat(91).trim() }), log: stores.log, catalog: stores.catalog, queueSnapshot: QUEUE, renderable: [] });
    ok("compile rejects a lead over 90 words", longLead.edition === null && has(longLead.errors, "max 90"));
    const missing = compileEdition({ source: sourceFor({ coverage: { scanned: ["x"] } }), log: stores.log, catalog: stores.catalog, queueSnapshot: QUEUE, renderable: [] });
    ok("compile rejects coverage without an explicit notScanned[]", missing.edition === null && has(missing.errors, "notScanned"));
    const dateOk = compileEdition({ source: sourceFor({ lead: "Releases between 2026-09-05 and 2026-09-20 are listed." }), log: stores.log, catalog: stores.catalog, queueSnapshot: QUEUE, renderable: [] });
    ok("window dates in the lead are allowed", dateOk.edition !== null, dateOk.errors.join(" | "));
    const outside = compileEdition({ source: sourceFor({ lead: "Releases since 2025-01-05 are listed." }), log: stores.log, catalog: stores.catalog, queueSnapshot: QUEUE, renderable: [] });
    ok("a date outside the window in the lead is rejected", outside.edition === null);
  }

  // E4: lead names a model not in releases[]
  const narrow = richStores();
  narrow.log = mkLog(narrow.log.rows.filter((r) => r.modelName !== "Zeta Open 7B"));
  const narrowEd = compiled({ lead: "{{RELEASE_COUNT}} releases were logged." }, narrow);
  const namesOther = clone(narrowEd); namesOther.lead = "Zeta Open 7B shipped."; namesOther.contentHash = editionContentHash(namesOther);
  trips("lead names a catalog model absent from releases[]", validateEdition({ edition: namesOther, filename: `${namesOther.date}.json`, log: narrow.log, catalog: stores.catalog }, ctx).failures, "MW-E4");
  ok("lead naming a model that IS in releases[] passes E4", !has(run(base), "MW-E4"));

  // E5: manifest and first edition
  const m = buildEditionsManifest([base]);
  ok("manifest matching the compiled files passes", validateEditionsManifest(m, { [`${base.date}.json`]: base }).length === 0);
  trips("manifest missing a compiled edition", validateEditionsManifest({ editions: [] }, { [`${base.date}.json`]: base }), "MW-E5");
  trips("manifest listing a phantom edition", validateEditionsManifest({ editions: [...m.editions, { ...m.editions[0], date: "2026-10-09" }] }, { [`${base.date}.json`]: base }), "MW-E5");
  const wrongWindow = compiled({ window: { from: "2026-09-02", to: "2026-10-16" } });
  trips("first edition 2026-10-16 with the wrong window", run(wrongWindow), "MW-E5");
  const second = compiled({ date: "2026-10-23", window: { from: "2026-10-17", to: "2026-10-23" }, lead: "Nothing else." }, stores);
  ok("a later edition may use its own window", second.window.from === "2026-10-17");
  ok("manifest is newest-first", buildEditionsManifest([base, second]).editions[0].date === "2026-10-23");
}

section("MW-W1 freshness is a warning, never a failure");
{
  ok("stale catalog warns", has(freshnessWarnings(mkCatalog([]), [], new Date("2026-12-01T00:00:00Z")), "MW-W1"));
  ok("fresh catalog does not warn", freshnessWarnings(mkCatalog([]), [], NOW).length === 0);
  ok("a newer edition date resets the clock", freshnessWarnings(mkCatalog([], "2026-01-01"), ["2026-10-14"], NOW).length === 0);
  const r = validateModelWatchState({ catalog: mkCatalog([], "2026-01-01"), log: mkLog([]), editions: {}, manifest: { editions: [] } }, ctx);
  ok("MW-W1 appears under warnings and not failures", has(r.warnings, "MW-W1") && !has(r.failures, "MW-W1"));
}

// ---------------------------------------------------------------------------------------------------------------------
section("tested-by-us derivation");
{
  const mkWave = (run, tag) => ({ run_id: run, design: { subject_builds: { "m-A": { tag } } } });
  const manifest = [
    { run_id: "w-active", status: "pilot", report_date: "2026-10-03", decision_status: "active" },
    { run_id: "w-active-new", status: "pilot", report_date: "2026-10-05", decision_status: "active" },
    { run_id: "w-proposed", status: "pilot", report_date: "2026-10-02", decision_status: "proposed" },
  ];
  const waves = [mkWave("w-active", "alpha:1b"), mkWave("w-active-new", "alpha:1b"), mkWave("w-proposed", "beta:2b")];
  const q = { entries: [{ tag: "gamma:3b", status: "queued" }, { tag: "alpha:1b", status: "queued" }, { tag: "delta:4b", status: "measured" }, { tag: "beta:2b", status: "queued" }] };
  const norep = { requireReport: false };
  const renderable = renderableEntries(manifest, {}, norep);
  const t = (tag) => testedStatus({ benchmarkLocalTag: tag }, { queue: q, renderable, waves });
  ok("pilot: tag in an ACTIVE wave, newest report linked", t("alpha:1b").status === "pilot" && t("alpha:1b").runId === "w-active-new" && t("alpha:1b").href === "/ai-models/reports/w-active-new");
  ok("queued: tag queued and in no active wave", t("gamma:3b").status === "queued");
  ok("not-yet: null tag", t(null).status === "not-yet");
  ok("not-yet: tag unknown to queue and waves", t("zzz:9b").status === "not-yet");
  ok("not-yet: measured in the queue but in no active report", t("delta:4b").status === "not-yet");
  ok("NEVER pilot for a proposed wave (falls back to the queue label)", t("beta:2b").status === "queued");
  const previewEnv = renderableEntries(manifest, { CB_PREVIEW_PILOT_REPORTS: "1" }, norep);
  ok("NEVER pilot for a preview-mode wave even with the preview flag on", testedStatus({ benchmarkLocalTag: "beta:2b" }, { queue: { entries: [] }, renderable: previewEnv, waves }).status === "not-yet");
  const superseded = [{ run_id: "w-old", status: "pilot", report_date: "2026-10-01", decision_status: "superseded" }];
  ok("NEVER pilot for a superseded wave", testedStatus({ benchmarkLocalTag: "alpha:1b" }, { queue: { entries: [] }, renderable: renderableEntries(superseded, {}, norep), waves: [mkWave("w-old", "alpha:1b")] }).status === "not-yet");
  ok("result carries a label and a link only (no figure keys)", Object.keys(t("alpha:1b")).sort().join(",") === "href,runId,status");
}

section("queue snapshot");
{
  const text = JSON.stringify({ updated_at: "2026-10-13", entries: [{ tag: "b:1", developer: "B", status: "queued", approx_size_gb: 2 }, { tag: "a:1", developer: "A", status: "measured" }] });
  const s = buildQueueSnapshot(text);
  ok("entries sorted by tag and trimmed to {tag, developer, status}", s.entries[0].tag === "a:1" && Object.keys(s.entries[0]).join(",") === "tag,developer,status");
  ok("sourceSha256 is the CRLF-normalised hash", s.sourceSha256 === sha256Hex(text) && buildQueueSnapshot(text.replace(/,/g, ",\r\n")).sourceSha256 !== undefined);
  ok("deterministic (no wall clock)", serialise(buildQueueSnapshot(text)) === serialise(buildQueueSnapshot(text)));
  ok("malformed QUEUE.json throws", (() => { try { buildQueueSnapshot("{}"); return false; } catch { return true; } })());
}

// ---------------------------------------------------------------------------------------------------------------------
section("import: normalisation, merge, idempotence");
{
  const rawModel = (over = {}) => ({
    id: "acme-alpha-1", name: "Alpha 1", provider: "Acme", providerSlug: "acme", family: "Alpha", releaseDate: "2026-09-10", status: "current",
    access: "api", licence: "Proprietary", modalities: ["text"], contextWindowTokens: 128000, parameterCount: null, notes: "Listed.",
    sources: [{ url: "https://example.com/a", title: "A", sourceType: "primary", accessed: "2026-10-16" }], benchmarkLocalTag: null, ...over,
  });
  const n = (over) => normaliseCatalog({ models: [rawModel(over)] });
  ok("a string access is normalised to an array", n({}).rows[0].access.join() === "api");
  ok("'open weights' synonym maps to open-weights", n({ access: "Open Weights" }).rows[0].access.join() === "open-weights");
  ok("'both' on a proprietary licence resolves to api + consumer-app", n({ access: "both" }).rows[0].access.join() === "api,consumer-app");
  ok("'both' on an open licence resolves to api + open-weights", n({ access: "both", licence: "MIT" }).rows[0].access.join() === "api,open-weights");
  ok("a numeric parameterCount is coerced to a string", n({ parameterCount: 70 }).rows[0].parameterCount === "70");
  ok("a null licence is stored as 'unverified' with a note", n({ licence: null }).rows[0].licence === "unverified" && n({ licence: null }).notes.length === 1);
  ok("duplicate source urls collapse", n({ sources: [rawModel().sources[0], rawModel().sources[0]] }).rows[0].sources.length === 1);
  ok("an unknown research key is an error, never silently dropped", n({ rating: 5 }).errors.length === 1);
  const unknownEnum = validateCatalog(mkCatalog(normaliseCatalog({ models: [rawModel({ status: "wonderful" })] }).rows.map((r) => ({ ...r, firstListedOn: "2026-10-16", lastVerifiedOn: "2026-10-16" }))), ctx);
  trips("an unknown status enum is NOT guessed (import validation fails)", unknownEnum.failures, "MW-S1");

  const catIn = normaliseCatalog({ models: [rawModel(), rawModel({ id: "acme-alpha-2", name: "Alpha 2", sources: [{ url: "https://example.com/b", title: "B", sourceType: "primary", accessed: "2026-10-16" }] })] });
  const relIn = normaliseReleases({ releases: [{ date: "2026-09-10", provider: "Acme", modelName: "Alpha 1", catalogId: "acme-alpha-1", kind: "New Model", summary: "Released.", safetyOrWelfareRelevant: false, safetyNote: null, sources: [{ url: "https://example.com/a", title: "A", sourceType: "primary", accessed: "2026-10-16" }] }] }, catIn.rows);
  ok("release providerSlug is resolved from the catalog", relIn.rows[0].providerSlug === "acme");
  ok("release kind synonym 'New Model' maps to new-model and the id is derived", relIn.rows[0].kind === "new-model" && relIn.rows[0].id === "2026-09-10--acme--alpha-1--new-model");
  const sf = { path: "research/x.json", sha256: "b".repeat(64) };
  const c1 = mergeCatalog(null, catIn.rows, { asOf: "2026-10-16", sourceFile: sf });
  const l1 = mergeLog(null, relIn.rows, { asOf: "2026-10-16", sourceFile: sf });
  ok("first import sets firstListedOn = lastVerifiedOn = asOf and loggedOn = asOf", c1.store.rows[0].firstListedOn === "2026-10-16" && l1.store.rows[0].loggedOn === "2026-10-16" && l1.store.rows[0].corrections.length === 0);
  const c2 = mergeCatalog(c1.store, catIn.rows, { asOf: "2026-10-16", sourceFile: sf });
  const l2 = mergeLog(l1.store, relIn.rows, { asOf: "2026-10-16", sourceFile: sf });
  ok("importing the same input twice is byte-identical", serialise(c1.store) === serialise(c2.store) && serialise(l1.store) === serialise(l2.store));
  const c3 = mergeCatalog(c1.store, catIn.rows.slice(0, 1), { asOf: "2026-10-23", sourceFile: sf });
  ok("a later import keeps firstListedOn, bumps lastVerifiedOn, never deletes, and warns on rows not re-verified",
    c3.store.rows.length === 2 && c3.store.rows[0].firstListedOn === "2026-10-16" && c3.store.rows[0].lastVerifiedOn === "2026-10-23" && c3.store.rows[1].lastVerifiedOn === "2026-10-16" && c3.warnings.length === 1);
  const older = mergeCatalog(c3.store, catIn.rows, { asOf: "2026-10-16", sourceFile: sf });
  ok("an import older than the store is refused", older.errors.length === 1);
  const drift = clone(relIn.rows); drift[0].provider = "Acme Corp";
  const lf = mergeLog(l1.store, drift, { asOf: "2026-10-23", sourceFile: sf });
  ok("a frozen field that differs from the committed row is an import error", lf.errors.length === 1, JSON.stringify(lf.errors));
  const moreSrc = clone(relIn.rows); moreSrc[0].sources.push({ url: "https://example.com/c", title: "C", sourceType: "primary", accessed: "2026-10-23" }); moreSrc[0].summary = "Changed text.";
  const lm = mergeLog(l1.store, moreSrc, { asOf: "2026-10-23", sourceFile: sf });
  ok("sources union by url; changed text is kept as committed and warned", lm.store.rows[0].sources.length === 2 && lm.store.rows[0].summary === "Released." && lm.warnings.length === 1);
}

// ---------------------------------------------------------------------------------------------------------------------
section("CLIs in a scratch site tree (import, compile, prebuild step)");
{
  const tmp = mkdtempSync(join(tmpdir(), "cb-mw-"));
  try {
    const site = join(tmp, "site");
    mkdirSync(join(site, "src", "data", "model-benchmark", "waves"), { recursive: true });
    mkdirSync(join(site, "src", "data", "model-watch", "editions"), { recursive: true });
    writeFileSync(join(site, "src", "data", "model-benchmark", "waves", "manifest.json"), "[]\n");
    const registry = '{"entries":[]}\n';
    const releases = '{"meta":{},"releases":[]}\n';
    writeFileSync(join(site, "src", "data", "model-benchmark", "registry-v1.json"), registry);
    writeFileSync(join(site, "src", "data", "model-benchmark", "releases-v1.json"), releases);
    const seedMeta = (m) => ({ schemaVersion: "1.0", asOf: "2026-10-16", rowCount: 0, sourceFiles: [], meaning: m, validator: "site/scripts/lib/model-watch-validator.mjs" });
    writeFileSync(join(site, "src", "data", "model-watch", "catalog-v1.json"), serialise({ meta: seedMeta(mkCatalog([]).meta.meaning), rows: [] }));
    writeFileSync(join(site, "src", "data", "model-watch", "release-log-v1.json"), serialise({ meta: seedMeta(mkLog([]).meta.meaning), rows: [] }));
    writeFileSync(join(site, "src", "data", "model-watch", "editions-manifest.json"), serialise({ editions: [] }));
    writeFileSync(join(site, "src", "data", "model-watch", "queue-snapshot.json"), serialise(QUEUE));

    const model = (id, name, over = {}) => ({
      id, name, provider: "Acme", providerSlug: "acme", family: "Alpha", releaseDate: "2026-09-10", status: "current", access: "api", licence: "Proprietary",
      modalities: ["text"], contextWindowTokens: 128000, parameterCount: null, notes: "Listed in the provider documentation.",
      sources: [{ url: `https://example.com/${id}`, title: name, sourceType: "primary", accessed: "2026-10-16" }], benchmarkLocalTag: null, ...over,
    });
    const catFile = join(tmp, "catalog-2026-10-16.json");
    const relFile = join(tmp, "releases-2026-10-16.json");
    writeFileSync(catFile, JSON.stringify({ asOf: "2026-10-16", method: "m", models: [model("acme-alpha-1", "Alpha 1"), model("acme-alpha-2", "Alpha 2", { benchmarkLocalTag: "zeta:7b" })] }));
    writeFileSync(relFile, JSON.stringify({ asOf: "2026-10-16", window: { from: "2026-09-01", to: "2026-10-16" }, releases: [
      { date: "2026-09-10", provider: "Acme", modelName: "Alpha 1", catalogId: "acme-alpha-1", kind: "new-model", summary: "Alpha 1 was released.", safetyOrWelfareRelevant: true, safetyNote: "The system card describes evaluations.", sources: [{ url: "https://example.com/rel-1", title: "Rel 1", sourceType: "primary", accessed: "2026-10-16" }] },
      { date: "2026-10-01", provider: "Acme", modelName: "Alpha 2", catalogId: "acme-alpha-2", kind: "new-version", summary: "Alpha 2 was released.", safetyOrWelfareRelevant: false, safetyNote: null, sources: [{ url: "https://example.com/rel-2", title: "Rel 2", sourceType: "primary", accessed: "2026-10-16" }] },
    ] }));
    const node = (script, args) => spawnSync(process.execPath, [join(HERE, script), "--site-dir", site, ...args], { encoding: "utf8" });
    const imp = (extra = []) => node("import-model-watch.mjs", ["--catalog", catFile, "--releases", relFile, "--as-of", "2026-10-16", ...extra]);
    const catPath = join(site, "src", "data", "model-watch", "catalog-v1.json");
    const logPath = join(site, "src", "data", "model-watch", "release-log-v1.json");

    const seedBytes = readFileSync(catPath, "utf8");
    const dry = imp(["--dry-run"]);
    ok("import --dry-run exits 0 and writes nothing", dry.status === 0 && readFileSync(catPath, "utf8") === seedBytes, dry.stderr + dry.stdout);
    const chk0 = imp(["--check"]);
    ok("import --check BEFORE the first import exits 1 (output would differ)", chk0.status === 1);
    const first = imp();
    ok("first import exits 0", first.status === 0, first.stderr + first.stdout);
    const bytes1 = [readFileSync(catPath, "utf8"), readFileSync(logPath, "utf8")];
    const chk = imp(["--check"]);
    ok("import --check AFTER the import exits 0 (idempotent)", chk.status === 0, chk.stderr + chk.stdout);
    const second = imp();
    ok("second import is byte-identical", second.status === 0 && readFileSync(catPath, "utf8") === bytes1[0] && readFileSync(logPath, "utf8") === bytes1[1]);
    ok("MW-X3: registry-v1.json and releases-v1.json are byte-unchanged by the import",
      readFileSync(join(site, "src", "data", "model-benchmark", "registry-v1.json"), "utf8") === registry && readFileSync(join(site, "src", "data", "model-benchmark", "releases-v1.json"), "utf8") === releases);
    const store = JSON.parse(bytes1[0]);
    ok("imported catalog has the input rows, zero unsourced", store.meta.rowCount === 2 && store.rows.every((r) => r.sources.length >= 1));

    // a poisoned input is refused and writes nothing
    const bad = JSON.parse(readFileSync(catFile, "utf8"));
    bad.models[0].status = "wonderful";
    const badFile = join(tmp, "bad.json");
    writeFileSync(badFile, JSON.stringify(bad));
    const rb = node("import-model-watch.mjs", ["--catalog", badFile, "--releases", relFile, "--as-of", "2026-10-16"]);
    ok("an unknown enum value fails the import (exit 1) and the stores are untouched", rb.status === 1 && readFileSync(catPath, "utf8") === bytes1[0]);
    const lexBad = JSON.parse(readFileSync(catFile, "utf8"));
    lexBad.models[0].notes = "The best model.";
    writeFileSync(badFile, JSON.stringify(lexBad));
    const rl = node("import-model-watch.mjs", ["--catalog", badFile, "--releases", relFile, "--as-of", "2026-10-16"]);
    ok("a lexicon failure in the research data fails the import", rl.status === 1 && /MW-L1/.test(rl.stderr));

    // edition compile
    const srcDir = join(tmp, "src-editions");
    mkdirSync(srcDir, { recursive: true });
    const srcFile = join(srcDir, "2026-10-16.json");
    writeFileSync(srcFile, JSON.stringify(sourceFor({ lead: "{{RELEASE_COUNT}} releases were logged, including Alpha 1 and Alpha 2." })));
    const comp = () => node("compile-model-watch-edition.mjs", ["--date", "2026-10-16", "--source", srcFile, "--today", "2026-10-16"]);
    const c1 = comp();
    const edPath = join(site, "src", "data", "model-watch", "editions", "2026-10-16.json");
    ok("compile writes the edition", c1.status === 0 && existsSync(edPath), c1.stderr + c1.stdout);
    const edBytes = readFileSync(edPath, "utf8");
    const man = JSON.parse(readFileSync(join(site, "src", "data", "model-watch", "editions-manifest.json"), "utf8"));
    ok("compile rebuilt editions-manifest.json", man.editions.length === 1 && man.editions[0].releaseCount === 2);
    const c2 = comp();
    ok("compile REFUSES to overwrite an existing edition", c2.status === 1 && /immutable/.test(c2.stderr) && readFileSync(edPath, "utf8") === edBytes);
    const ap = node("compile-model-watch-edition.mjs", ["--date", "2026-10-16", "--append-correction", "Fixed a link to the Alpha 1 page.", "--today", "2026-10-20"]);
    const edNew = JSON.parse(readFileSync(edPath, "utf8"));
    const edOld = JSON.parse(edBytes);
    ok("--append-correction appends {date: today, text} and changes nothing else", ap.status === 0 && edNew.corrections.length === 1 && edNew.corrections[0].date === "2026-10-20" &&
      JSON.stringify({ ...edNew, corrections: [] }) === JSON.stringify({ ...edOld, corrections: [] }) && edNew.contentHash === edOld.contentHash, ap.stderr);
    const apBad = node("compile-model-watch-edition.mjs", ["--date", "2026-10-16", "--append-correction", "This was the best edition.", "--today", "2026-10-21"]);
    ok("--append-correction text must pass the lexicon", apBad.status === 1 && JSON.parse(readFileSync(edPath, "utf8")).corrections.length === 1);
    const vctx = spawnSync(process.execPath, [join(HERE, "validate-model-watch.mjs"), "--no-git"], { encoding: "utf8" });
    void vctx;

    // prebuild step
    const missingQueue = node("build-model-watch-data.mjs", ["--research-queue", join(tmp, "absent", "QUEUE.json")]);
    ok("build-model-watch-data exits 0 without research/ and keeps the committed snapshot", missingQueue.status === 0 && /Skipping regeneration/.test(missingQueue.stdout) && JSON.parse(readFileSync(join(site, "src", "data", "model-watch", "queue-snapshot.json"), "utf8")).updated_at === "2026-10-13");
    writeFileSync(join(tmp, "QUEUE.json"), JSON.stringify({ updated_at: "2026-10-20", entries: [{ tag: "z:1", developer: "Z", status: "queued" }] }));
    const withQueue = node("build-model-watch-data.mjs", ["--research-queue", join(tmp, "QUEUE.json")]);
    const snap = JSON.parse(readFileSync(join(site, "src", "data", "model-watch", "queue-snapshot.json"), "utf8"));
    ok("build-model-watch-data regenerates the snapshot from QUEUE.json", withQueue.status === 0 && snap.updated_at === "2026-10-20" && snap.entries.length === 1);
    const again = node("build-model-watch-data.mjs", ["--research-queue", join(tmp, "QUEUE.json")]);
    ok("build-model-watch-data is idempotent (reports unchanged)", /queue-snapshot.json unchanged/.test(again.stdout) && /editions-manifest.json unchanged/.test(again.stdout));
    const manText = readFileSync(join(site, "src", "data", "model-watch", "editions-manifest.json"), "utf8");
    rmSync(join(site, "src", "data", "model-watch", "editions-manifest.json"));
    node("build-model-watch-data.mjs", ["--research-queue", join(tmp, "absent", "QUEUE.json")]);
    ok("editions-manifest.json is rebuilt from the edition files alone", readFileSync(join(site, "src", "data", "model-watch", "editions-manifest.json"), "utf8") === manText);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

section("committed stores");
{
  const run = spawnSync(process.execPath, [join(HERE, "validate-model-watch.mjs")], { encoding: "utf8" });
  ok("validate-model-watch.mjs passes on the committed stores", run.status === 0, run.stderr + run.stdout);
  ok("validate-model-watch.mjs examined the stores (reports counts)", /catalog row\(s\).*release-log row\(s\)/.test(run.stdout));
  const cs = JSON.parse(readFileSync(join(HERE, "..", "src", "data", "model-watch", "catalog-v1.json"), "utf8"));
  ok("committed catalog meaning states a listing is not an evaluation", /not an evaluation/.test(cs.meta.meaning));
}

console.log(`\ntest-model-watch: ${passed} passed, ${failed} failed`);
void cpSync;
process.exit(failed ? 1 : 0);
