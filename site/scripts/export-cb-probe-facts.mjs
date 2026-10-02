#!/usr/bin/env node
/**
 * export-cb-probe-facts.mjs -- the single source of every cb-probe fact the site pages state.
 *
 * Writes site/src/data/model-benchmark/cb-probe-facts.generated.json (committed).
 *
 *   node scripts/export-cb-probe-facts.mjs           regenerate the file
 *   node scripts/export-cb-probe-facts.mjs --check   exit 1 if regenerating would change the file
 *
 * Why a committed file and not a build-time import: the Docker build context is site/ only, so the
 * Node build cannot import ../tools/cb-probe. This runs where the whole repository is present
 * (a developer machine or CI) and commits its output, like the wave export.
 * Spec: docs/MCP_AND_MODEL_BENCHMARK_PAGES_SPEC_2026-10-02.md section 6.
 *
 * Rules this file keeps:
 *  - Every number, threshold and name is IMPORTED from cb-probe or computed from the bank. The only
 *    hand-written content is TOOL_SUMMARIES (prose) and the distribution flag, both guarded below.
 *  - Byte-deterministic: no timestamps, no absolute paths, stable key order.
 *  - A missing cb-probe source is a loud failure, never a silent skip. FAIL is the default, in
 *    CI and everywhere else (CI checks out the whole repository, so it never hits this path).
 *    The one opt-out is explicit: ALLOW_MISSING_CB_PROBE_SOURCE=1 makes --check print a SKIPPED
 *    (not verified) notice and exit 0, for a deliberate site-only checkout. Nothing sets it by default.
 */
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");
const NL = String.fromCharCode(10);
const CR = String.fromCharCode(13);

const OUT_REL = "site/src/data/model-benchmark/cb-probe-facts.generated.json";
const OUT_PATH = join(repoRoot, ...OUT_REL.split("/"));

const CB = "tools/cb-probe";
const SOURCES = {
  toolDefinitions: CB + "/lib/tool-definitions.mjs",
  scoredRun: CB + "/lib/scored-run.mjs",
  validateScorecard: CB + "/lib/validate-scorecard.mjs",
  exposureProbe: CB + "/lib/exposure-probe.mjs",
  identificationProbe: CB + "/lib/identification-probe.mjs",
  canonical: CB + "/lib/canonical.mjs",
  bankLoader: CB + "/lib/bank.mjs",
  sensitivity: CB + "/lib/sensitivity.mjs",
  subdimensions: CB + "/lib/subdimensions.mjs",
  separationStatement: CB + "/lib/separation-statement.mjs",
  tools: CB + "/lib/tools.mjs",
  packageJson: CB + "/package.json",
  taskBank: "site/src/data/model-benchmark/tasks-v1.json",
};

/**
 * HAND-SET, deliberately. Flipping this to true is a reviewed commit made when the package is
 * actually on npm (spec H8). Pages must not show an npx install while this is false.
 */
const NPM_PUBLISHED = false;

/**
 * One-line purposes for the pages' tool table. Prose, written here and not in tool-definitions.mjs
 * because adding a field there would change the tools/list payload hosts see (spec 6.4). `group`
 * is which artifact the tool belongs to. The keys must equal the set of TOOL_DEFINITIONS names;
 * assertSameToolSet() fails loudly otherwise, so a tool can be neither added nor removed unseen.
 */
const TOOL_SUMMARIES = {
  list_probe_items: {
    group: "shared",
    summary: "List the published probe items (id, dimension, construct, prompt); crisis-adjacent items are left out unless asked for.",
  },
  get_anchors: {
    group: "shared",
    summary: "Return the five published 1-5 rubric anchors for one item.",
  },
  explain_what_this_is_not: {
    group: "shared",
    summary: "Return the separation statement: what this tool's output is not.",
  },
  open_judge_session: {
    group: "JudgeEstimate",
    summary: "Open an unscored judge session and get a session id.",
  },
  record_item_estimate: {
    group: "JudgeEstimate",
    summary: "Record one 1-5 rating with a rationale for one item in a judge session.",
  },
  summarise_judge_session: {
    group: "JudgeEstimate",
    summary: "Summarise a judge session into a JudgeEstimate, with no score of any kind.",
  },
  start_scored_run: {
    group: "SelfRunScorecard",
    summary: "Start a scored run with a plan of items and repeated trials, and get a run id.",
  },
  next_item: {
    group: "SelfRunScorecard",
    summary: "Serve the next planned trial's prompt, without the rubric anchors.",
  },
  run_status: {
    group: "SelfRunScorecard",
    summary: "Read-only progress report for a run: planned, recorded and remaining trials, and probe phase.",
  },
  record_item_rating: {
    group: "SelfRunScorecard",
    summary: "Record one or a batch of ratings, each with the matched anchor and a verbatim evidence quote.",
  },
  run_exposure_probe: {
    group: "SelfRunScorecard",
    summary: "Run the two contamination checks (recall overlap and forced-choice identification) that a run must complete before finishing.",
  },
  finish_scored_run: {
    group: "SelfRunScorecard",
    summary: "Re-validate the whole run and write the SelfRunScorecard.",
  },
};

function fail(message) {
  console.error("export-cb-probe-facts: " + message);
  process.exit(1);
}

function assertSameToolSet(definitionNames) {
  const summaryNames = Object.keys(TOOL_SUMMARIES);
  const missingSummary = definitionNames.filter((n) => !summaryNames.includes(n));
  const staleSummary = summaryNames.filter((n) => !definitionNames.includes(n));
  if (missingSummary.length || staleSummary.length) {
    fail(
      "TOOL_SUMMARIES and TOOL_DEFINITIONS disagree." +
        NL + "  tools with no summary: " + (missingSummary.join(", ") || "(none)") +
        NL + "  summaries with no tool: " + (staleSummary.join(", ") || "(none)") +
        NL + "Edit TOOL_SUMMARIES in site/scripts/export-cb-probe-facts.mjs."
    );
  }
  if (new Set(definitionNames).size !== definitionNames.length) fail("TOOL_DEFINITIONS contains a duplicate tool name.");
}

function imp(rel) {
  return import(pathToFileURL(join(repoRoot, ...rel.split("/"))).href);
}

async function buildFacts() {
  const [tools, scoredRun, scorecard, exposure, ident, canon, bankMod, sens, subdims, sepMod, toolsImpl] = await Promise.all([
    imp(SOURCES.toolDefinitions),
    imp(SOURCES.scoredRun),
    imp(SOURCES.validateScorecard),
    imp(SOURCES.exposureProbe),
    imp(SOURCES.identificationProbe),
    imp(SOURCES.canonical),
    imp(SOURCES.bankLoader),
    imp(SOURCES.sensitivity),
    imp(SOURCES.subdimensions),
    imp(SOURCES.separationStatement),
    imp(SOURCES.tools),
  ]);

  const pkg = JSON.parse(readFileSync(join(repoRoot, ...SOURCES.packageJson.split("/")), "utf8"));
  const bank = bankMod.loadBank({ forceReload: true });

  const names = tools.TOOL_DEFINITIONS.map((t) => t.name);
  assertSameToolSet(names);

  // The default served set: the same predicate start_scored_run uses for its default plan
  // (scorable, i.e. not a draft, and not sensitive). Cross-checked against the real
  // start_scored_run below, so the two cannot drift apart unseen.
  const scorable = bankMod.getScorableItems(bank);
  const isDefaultServed = (item) => bankMod.isScorableItem(item) && !sens.isSensitiveItem(item);
  const served = bank.items.filter(isDefaultServed);
  const crisisExcluded = scorable.filter((i) => sens.isSensitiveItem(i)).length;

  const dimensionCodes = [...canon.DIMENSION_CODES];
  const perDimensionDefaultItems = {};
  for (const code of dimensionCodes) perDimensionDefaultItems[code] = served.filter((i) => i.dimension === code).length;
  const minItems = scorecard.MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE;
  const floorReachable = dimensionCodes.every((code) => perDimensionDefaultItems[code] >= minItems);
  const itemsInUnknownDimension = served.filter((i) => !dimensionCodes.includes(i.dimension)).length;
  if (itemsInUnknownDimension > 0) fail(itemsInUnknownDimension + " default-served item(s) have a dimension outside DIMENSION_CODES.");

  crossCheckAgainstStartScoredRun({ scoredRun, bank, expectedItems: served.length, expectedTrials: served.length * scoredRun.MIN_TRIALS, expectedWithSensitive: served.length + crisisExcluded });

  const sub = subdims.computeSubdimensionsStatus(bank, isDefaultServed);

  return {
    generatedFrom: Object.values(SOURCES),
    distribution: { npmPublished: NPM_PUBLISHED },
    version: pkg.version,
    license: pkg.license,
    repository: String(pkg.repository && pkg.repository.url ? pkg.repository.url : ""),
    // The exact text explain_what_this_is_not returns: the tool handler itself is called, so this
    // cannot drift from what a host receives. Asserted equal to FULL_STATEMENT as a second check.
    separationStatement: separationStatement(sepMod, toolsImpl),
    toolCount: names.length,
    tools: names.map((name) => ({ name, group: TOOL_SUMMARIES[name].group, summary: TOOL_SUMMARIES[name].summary })),
    bankVersion: bank.meta.bankVersion,
    dimensionCount: dimensionCodes.length,
    bank: {
      itemsTotal: bank.items.length,
      itemsScorable: scorable.length,
      itemsServedByDefault: served.length,
      itemsSensitive: bank.items.filter((i) => sens.isSensitiveItem(i)).length,
      itemsDraft: bank.items.length - scorable.length,
    },
    itemsTotal: bank.items.length,
    itemsServedDefault: served.length,
    crisisItemsExcludedByDefault: crisisExcluded,
    trialsInDefaultRun: served.length * scoredRun.MIN_TRIALS,
    minTrials: scoredRun.MIN_TRIALS,
    minItemsPerDimension: minItems,
    floorReachable,
    perDimensionDefaultItems,
    defaultJudgeConfiguration: scoredRun.DEFAULT_JUDGE_CONFIGURATION,
    judgeConfigurations: [...scorecard.JUDGE_CONFIGURATIONS],
    recallThreshold: exposure.EXPOSURE_FLAG_THRESHOLD,
    identificationCount: ident.IDENTIFICATION_COUNT,
    identificationOptions: ident.IDENTIFICATION_OPTIONS,
    identificationAlpha: ident.IDENTIFICATION_ALPHA,
    defaultBootstrapIterations: canon.THRESHOLDS.DEFAULT_BOOTSTRAP_ITERATIONS,
    subdimensions: {
      available: sub.available,
      covered: sub.subdimensionsCovered,
      total: sub.subdimensionsTotal,
      uncovered: sub.uncovered,
      perSubdimensionDefaultItems: sub.perSubdimension,
      itemsCarryingASubdimensionCode: sub.itemsCarryingASubdimensionCode,
      unknownCodes: sub.unknownCodes,
      reason: sub.reason,
    },
  };
}

/** Run the real start_scored_run on the real bank in a scratch folder and require it to agree. */
function crossCheckAgainstStartScoredRun({ scoredRun, bank, expectedItems, expectedTrials, expectedWithSensitive }) {
  const root = mkdtempSync(join(tmpdir(), "cb-probe-facts-"));
  try {
    mkdirSync(root, { recursive: true });
    const ctx = { bank, artifactRoot: root, sessions: new Map(), runs: new Map() };
    const base = { subject_label: "facts-export", judge_label: "facts-export", judgeConfiguration: "cross" };
    const def = scoredRun.startScoredRun({ ...base }, ctx);
    if (def.item_count !== expectedItems || def.total_planned_trials !== expectedTrials) {
      fail(
        "default-served predicate disagrees with start_scored_run: exporter says " + expectedItems + " items / " +
          expectedTrials + " trials, start_scored_run planned " + def.item_count + " / " + def.total_planned_trials + "."
      );
    }
    const withSens = scoredRun.startScoredRun({ ...base, include_sensitive: true }, ctx);
    if (withSens.item_count !== expectedWithSensitive) {
      fail("sensitive-item count disagrees with start_scored_run(include_sensitive: true): " + expectedWithSensitive + " vs " + withSens.item_count + ".");
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function separationStatement(sepMod, toolsImpl) {
  const text = toolsImpl.explainWhatThisIsNot().statement;
  if (typeof text !== "string" || text.length === 0) fail("explain_what_this_is_not returned no statement text.");
  if (text !== sepMod.FULL_STATEMENT) fail("explain_what_this_is_not no longer returns separation-statement.mjs FULL_STATEMENT.");
  return text;
}

function serialise(facts) {
  return JSON.stringify(facts, null, 2) + NL;
}

function sourceMissing() {
  return Object.values(SOURCES).filter((rel) => !existsSync(join(repoRoot, ...rel.split("/"))));
}

async function main() {
  const check = process.argv.includes("--check");
  const missing = sourceMissing();
  if (missing.length > 0) {
    const detail =
      "cb-probe source not found (this script needs a full repository checkout, not the site/ build context):" +
      NL + missing.map((m) => "  missing: " + m).join(NL) +
      NL + "To skip this check deliberately on a site-only checkout, set ALLOW_MISSING_CB_PROBE_SOURCE=1.";
    if (check && process.env.ALLOW_MISSING_CB_PROBE_SOURCE === "1") {
      console.warn("export-cb-probe-facts --check SKIPPED (not verified) because ALLOW_MISSING_CB_PROBE_SOURCE=1. " + detail);
      process.exit(0);
    }
    fail(detail);
  }

  const next = serialise(await buildFacts());

  if (!check) {
    writeFileSync(OUT_PATH, next);
    console.log("wrote " + OUT_REL + " (" + next.length + " bytes)");
    return;
  }

  if (!existsSync(OUT_PATH)) fail(OUT_REL + " does not exist. Run: node scripts/export-cb-probe-facts.mjs");
  // Tolerate CRLF from a Windows autocrlf checkout; the content, not the line ending, is the contract.
  const current = readFileSync(OUT_PATH, "utf8").split(CR + NL).join(NL);
  if (current !== next) {
    fail(
      OUT_REL + " is stale: regenerating would change it." + NL +
        "Run: node scripts/export-cb-probe-facts.mjs   (from site/), review the diff, and commit it."
    );
  }
  console.log("ok   " + OUT_REL + " matches a fresh export");
}

main().catch((err) => fail(err && err.stack ? err.stack : String(err)));
