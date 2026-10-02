#!/usr/bin/env node
/**
 * assemble-run.mjs -- step 4. Unblind, then drive cb-probe's scorer: one `panel` scored run per
 * subject, every judge rating recorded through recordItemRating, probe completed, run finished,
 * scorecard validated and written. No scoring arithmetic is performed here.
 *
 * Two passes (see lib/assemble.mjs):
 *   1st: --ratings <dir> ...        records all ratings, issues probe briefs, exits 3 if probe answers absent
 *   2nd: --probe-answers <dir> ...  completes the probes, finishes the runs, writes scorecards
 *
 *   node research/model-runs/bin/assemble-run.mjs --run-id <id> --artifact-root <dir-outside-repo>
 *        [--ratings <dir>[,<dir>...] | --ratings <dir> --ratings <dir> ...] [--routing <amended-key.json>] [--probe-answers <dir>] [--out <dir>] [--keys <dir>] [--bank <file>] [--run-root <dir>]
 *
 * --routing keys/judge-key.reroute.json (from reroute-judges.mjs) makes the amended key authoritative: ratings of an
 * excluded judge are ignored only if that key says so, every response must end with exactly two ratings from two
 * distinct non-self judges matching it, and every evidence_quote must still be a verbatim substring. --ratings
 * then takes judge-answers/, judge-answers-reroute/ and (with keys/judge-key.reroute-2.json) judge-answers-reroute-2/ (repeat the flag or comma-separate).
 *
 * [--validity <file>] (default <run>/operations/judge-validity.json) is REQUIRED for runs whose judge key says
 * validity_required (an explicit judge set): the report from bin/judge-validity.mjs must exist, cover exactly the answer
 * files being assembled, and agree with the exclusions in --routing. First-pilot runs ignore it.
 *
 * --artifact-root must be outside the repository (cb-probe refuses to write run data inside it).
 * Exit codes: 0 complete, 1 refused, 2 usage, 3 awaiting probe answers.
 */
import path from "node:path";
import { parse, runRoot, main } from "../lib/cli.mjs";
import { loadBankFile, DEFAULT_BANK_PATH } from "../lib/common.mjs";
import { assembleRun, EXIT_AWAITING_PROBE } from "../lib/assemble.mjs";

main(() => {
  const v = parse({
    "run-id": { type: "string" },
    "artifact-root": { type: "string" },
    ratings: { type: "string", multiple: true },
    routing: { type: "string" },
    "probe-answers": { type: "string" },
    out: { type: "string" },
    keys: { type: "string" },
    bank: { type: "string" },
    "run-root": { type: "string" },
    validity: { type: "string" },
  });
  if (!v["run-id"] || !v["artifact-root"]) {
    console.error("usage: assemble-run.mjs --run-id <id> --artifact-root <dir> [--ratings <dir>] [--probe-answers <dir>] [--out <dir>]");
    return 2;
  }
  const root = runRoot(v);
  const bank = loadBankFile(path.resolve(v.bank ?? DEFAULT_BANK_PATH));
  const result = assembleRun({
    keysDir: path.resolve(v.keys ?? path.join(root, "keys")),
    ratingsDirs: (v.ratings ?? []).flatMap((x) => x.split(",")).filter(Boolean).map((x) => path.resolve(x)),
    routingFile: v.routing ? path.resolve(v.routing) : null,
    artifactRoot: path.resolve(v["artifact-root"]),
    outDir: path.resolve(v.out ?? path.join(root, "scorecards")),
    probeAnswersDir: v["probe-answers"] ? path.resolve(v["probe-answers"]) : null,
    // Runs with an explicit judge set (pilot-2026-10-02) refuse without a fresh report from bin/judge-validity.mjs.
    validityFile: path.resolve(v.validity ?? path.join(root, "operations", "judge-validity.json")),
    bank,
    log: (m) => console.log(m),
  });

  if (result.status === "awaiting-probe") {
    console.log(`AWAITING PROBE ANSWERS for: ${result.missing_probe_answers.join(", ")}`);
    console.log(`Probe briefs: ${result.probe_briefs_dir}`);
    console.log("Send each subject its probe brief in a FRESH context, save its reply as <subject>.probe-answers.json,");
    console.log("then re-run this command with --probe-answers <dir>. Ratings are already recorded and are not repeated.");
    return EXIT_AWAITING_PROBE;
  }
  for (const r of result.results) {
    console.log(`${r.subject}: scorer run ${r.scorer_run_id} -> ${r.scorecard_path} (composite ${r.composite}, band ${r.band})`);
  }
  console.log("All scorecards passed validateSelfRunScorecard; official:false, comparability:none.");
  return 0;
});
