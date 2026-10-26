// wave-gates.test.mjs -- positive control and planted-probe negative control for every publication gate
// (lib/wave-gates.mjs), plus audit-wave and wave-ready. In-memory fixtures; nothing here runs a model.
// The real-data block at the end runs the two CLIs on pilot-2026-10-03 and records what they say.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  GATE_STATUSES, gatePlanTime, gateComplete, gateDigest, gateValidity, gateJudgeSanity, gateDriftSigned, gateSensitivity, gateKeys,
  gateAgreement, gateVariance, gateSpend, gateHosted, gateClaimAudit, gateRenderLeak, runAllGates, verdictOf, parseDeviations, resolvePool, thresholdValue,
} from "../lib/wave-gates.mjs";
import { auditRun, findGaps } from "../bin/audit-wave.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.resolve(here, "..", "bin");
const REPO = path.resolve(here, "..", "..", "..");
const PILOT3 = path.resolve(here, "..", "pilot-2026-10-03");

const DIGEST = "a".repeat(64);
const ITEMS = ["I-1", "I-2", "I-3", "I-4", "I-5", "I-6", "I-7", "I-8", "I-9", "I-10", "I-11", "I-12"];
const T0 = Date.parse("2026-03-02T10:00:00.000Z");
const REPLY = (n) => `Reply number ${n}: here is a considered answer about the matter, with some specific advice in the middle and a closing line ${n}.`;

function fixture() {
  const records = ITEMS.map((item, i) => ({
    subject: "sub-A", item_id: item, trial: 1, status: "ok", model_digest: DIGEST,
    started_at: new Date(T0 + i * 6000).toISOString(), finished_at: new Date(T0 + i * 6000 + 5000).toISOString(),
    attempts: [{ attempt: 0, started_at: new Date(T0 + i * 6000).toISOString(), done_reason: "stop" }], final_attempt: 0,
  }));
  const judgeRatings = [];
  const replyTexts = new Map();
  ITEMS.forEach((item, i) => {
    const text = REPLY(i);
    replyTexts.set(`r-${i}`, text);
    for (const judge of ["j1", "j2"]) {
      judgeRatings.push({ judge, subject: "sub-A", response_id: `r-${i}`, rating_1_5: 1 + ((i + (judge === "j1" ? 0 : 1)) % 4), evidence_quote: "some specific advice in the middle" });
    }
  });
  const calls = [];
  const planCommit = "2026-03-02T09:00:00+00:00";
  return {
    runId: "fx-run",
    runRel: "research/model-runs/fx-run",
    runConfig: { run_id: "fx-run", trials: 1, subjects: [{ label: "sub-A", tag: "m:1", digest: DIGEST }], judge_validity: { max_unfound_quote_rate_percent: 5, short_quote_min_chars: 12 }, bridge: { source_run: "x" } },
    records,
    deviations: [],
    planFiles: ["research/model-runs/fx-run/run-config.json", "research/model-runs/fx-run/PREREGISTRATION.md"],
    servedItemIds: ITEMS,
    bankItems: ITEMS.map((id) => ({ id, exposureStatus: "public-permanent", sensitivity: "standard" })),
    validityReport: { complete: true, problems: [], run_verdict: "ALL-JUDGES-VALID", rule: { max_unfound_quote_rate_percent: 5 }, judges: { j1: { ratings: 100, unfound: 5 }, j2: { ratings: 100, unfound: 0 } } },
    excludedJudges: [],
    judgeRatings, replyTexts,
    analysis: {
      subjects: { "sub-A": { judge_agreement: { exact: 0.9 } } },
      bridge_drift: { mean_abs_difference: 0.1, pairs: 20, exact_match: 18, per_judge: { j1: { pairs: 10, mean_abs_difference: 0.1, mean_signed_difference_new_minus_original: -0.1 }, j2: { pairs: 10, mean_abs_difference: 0.1, mean_signed_difference_new_minus_original: 0.1 } } },
    },
    protocol: null,
    calls,
    runGit(args) {
      calls.push(args.join(" "));
      if (args[0] === "log") return { status: 0, stdout: `${planCommit}\n` };
      if (args[0] === "ls-files") return { status: 0, stdout: "" };
      if (args[0] === "diff") return { status: 0, stdout: "" };
      return { status: 1, stdout: "", stderr: "unexpected git command" };
    },
  };
}
const mutate = (fn) => { const c = fixture(); fn(c); return c; };

test("statuses are from the closed set, and read-only git is all that is ever run", () => {
  const c = fixture();
  const results = runAllGates(c);
  for (const r of results) {
    assert.ok(GATE_STATUSES.includes(r.status), `${r.id}: ${r.status}`);
    assert.equal(typeof r.detail, "string");
    assert.equal(typeof r.evidence, "object");
  }
  assert.ok(c.calls.length > 0);
  for (const call of c.calls) assert.match(call, /^(log|ls-files|diff --cached --name-only)\b/, call);
});

// ---- G-plan-time
test("G-plan-time: plan committed before the first record passes (positive control)", () => {
  assert.equal(gatePlanTime(fixture()).status, "pass");
});
test("G-plan-time: planted probe, plan committed after the first record, fails", () => {
  const c = mutate((x) => { const late = "2026-03-02T11:00:00+00:00"; x.runGit = (a) => (a[0] === "log" ? { status: 0, stdout: `${late}\n` } : { status: 0, stdout: "" }); });
  const r = gatePlanTime(c);
  assert.equal(r.status, "fail");
  assert.match(r.detail, /not strictly earlier/);
});
test("G-plan-time: commit at exactly the first record time is not strictly earlier", () => {
  const c = mutate((x) => { x.runGit = (a) => (a[0] === "log" ? { status: 0, stdout: `${new Date(T0).toISOString()}\n` } : { status: 0, stdout: "" }); });
  assert.equal(gatePlanTime(c).status, "fail");
});
test("G-plan-time: an uncommitted plan file fails, and a later edit commit does not hide an early first commit", () => {
  assert.equal(gatePlanTime(mutate((x) => { x.runGit = () => ({ status: 0, stdout: "" }); })).status, "fail");
  const c = mutate((x) => { x.runGit = (a) => (a[0] === "log" ? { status: 0, stdout: "2026-03-05T00:00:00+00:00\n2026-03-02T09:00:00+00:00\n" } : { status: 0, stdout: "" }); });
  assert.equal(gatePlanTime(c).status, "pass");
});
test("G-plan-time: no records is a hold, not a pass", () => {
  assert.equal(gatePlanTime(mutate((x) => { x.records = []; })).status, "hold");
});

// ---- G-complete
test("G-complete: every call ok and stop passes (positive control)", () => {
  const r = gateComplete(fixture());
  assert.equal(r.status, "pass");
  assert.equal(r.evidence.planned, 12);
});
test("G-complete: planted probe, done_reason length, fails", () => {
  const c = mutate((x) => { x.records[3].attempts[0].done_reason = "length"; });
  const r = gateComplete(c);
  assert.equal(r.status, "fail");
  assert.match(r.detail, /done_reason other than "stop"/);
});
test("G-complete: a length record named in a dated deviation (subject and item) is excused", () => {
  const c = mutate((x) => { x.records[3].attempts[0].done_reason = "length"; x.deviations = [{ id: "D1", date: "2026-03-03", title: "t", text: "- **2026-03-03, D1 — t**\n  sub-A on I-4 was cut at the context limit." }]; });
  const r = gateComplete(c);
  assert.equal(r.status, "pass");
  assert.equal(r.evidence.truncated_excused_by_deviation, 1);
});
test("G-complete: a missing record and a failed record fail", () => {
  assert.equal(gateComplete(mutate((x) => { x.records.pop(); })).status, "fail");
  assert.equal(gateComplete(mutate((x) => { x.records[0].status = "failed"; })).status, "fail");
});

// ---- G-digest
test("G-digest: matching digests pass (positive control)", () => {
  assert.equal(gateDigest(fixture()).status, "pass");
});
test("G-digest: planted probe, one record digest differs, fails", () => {
  const r = gateDigest(mutate((x) => { x.records[5].model_digest = "b".repeat(64); }));
  assert.equal(r.status, "fail");
  assert.equal(r.evidence.mismatches, 1);
});
test("G-digest: a pin that is not 64 hex fails; a record for an unknown subject fails", () => {
  assert.equal(gateDigest(mutate((x) => { x.runConfig.subjects[0].digest = "abc"; })).status, "fail");
  assert.equal(gateDigest(mutate((x) => { x.records[0].subject = "ghost"; })).status, "fail");
});

// ---- G-validity
test("G-validity: 5.0% exactly passes (positive control, strictly-greater rule)", () => {
  assert.equal(gateValidity(fixture()).status, "pass");
});
test("G-validity: planted probe, 6% unfound quotes, fails unless the judge was excluded and rerouted", () => {
  const c = mutate((x) => { x.validityReport.judges.j1.unfound = 6; });
  assert.equal(gateValidity(c).status, "fail");
  const handled = mutate((x) => { x.validityReport.judges.j1.unfound = 6; x.excludedJudges = ["j1"]; });
  assert.equal(gateValidity(handled).status, "pass");
  const two = mutate((x) => { x.validityReport.judges.j1.unfound = 6; x.validityReport.judges.j2.unfound = 7; x.excludedJudges = ["j1", "j2"]; });
  assert.equal(gateValidity(two).status, "fail");
});
test("G-validity: no report is a hold; an incomplete report fails", () => {
  assert.equal(gateValidity(mutate((x) => { x.validityReport = null; })).status, "hold");
  assert.equal(gateValidity(mutate((x) => { x.validityReport.complete = false; x.validityReport.problems = ["p"]; })).status, "fail");
});

// ---- G-judge-sanity
test("G-judge-sanity: varied ratings with mid-reply quotes pass (positive control)", () => {
  assert.equal(gateJudgeSanity(fixture()).status, "pass");
});
test("G-judge-sanity: planted probe, a judge gives 5 to every reply of a subject, fails", () => {
  const c = mutate((x) => { for (const r of x.judgeRatings) if (r.judge === "j2") r.rating_1_5 = 5; });
  const r = gateJudgeSanity(c);
  assert.equal(r.status, "fail");
  assert.deepEqual(r.evidence.constant_by_judge_subject.map((e) => e.judge), ["j2"]);
});
test("G-judge-sanity: planted probe, every quote is the first characters of its reply, fails", () => {
  const c = mutate((x) => { for (const r of x.judgeRatings) if (r.judge === "j1") r.evidence_quote = x.replyTexts.get(r.response_id).slice(0, 30); });
  const r = gateJudgeSanity(c);
  assert.equal(r.status, "fail");
  assert.deepEqual(r.evidence.all_quotes_reply_prefix.map((e) => e.judge), ["j1"]);
});
test("G-judge-sanity: a prefix quote hidden by markdown or leading space is still caught; one honest quote is enough to pass", () => {
  const c = mutate((x) => { for (const r of x.judgeRatings) if (r.judge === "j1") r.evidence_quote = `  ${x.replyTexts.get(r.response_id).slice(0, 25)}`; });
  assert.equal(gateJudgeSanity(c).status, "fail");
  const one = mutate((x) => { x.judgeRatings.forEach((r) => { if (r.judge === "j1") r.evidence_quote = x.replyTexts.get(r.response_id).slice(0, 25); }); x.judgeRatings.find((r) => r.judge === "j1").evidence_quote = "closing line"; });
  assert.equal(gateJudgeSanity(one).status, "pass");
});
test("G-judge-sanity: too few ratings to test is not a fail, and no ratings is a hold", () => {
  assert.equal(gateJudgeSanity(mutate((x) => { x.judgeRatings = x.judgeRatings.slice(0, 4); for (const r of x.judgeRatings) r.rating_1_5 = 5; })).status, "pass");
  assert.equal(gateJudgeSanity(mutate((x) => { x.judgeRatings = null; })).status, "hold");
});

// ---- G-drift-signed
test("G-drift-signed: no protocol threshold gives a flagged report-only pass with signed values (positive control)", () => {
  const r = gateDriftSigned(fixture());
  assert.equal(r.status, "pass");
  assert.equal(r.evidence.report_only, true);
  assert.match(r.detail, /^REPORT-ONLY/);
  assert.match(r.detail, /j1 -0\.1/);
});
test("G-drift-signed: planted probe, mean absolute drift over the protocol threshold, fails", () => {
  const c = mutate((x) => { x.protocol = { anchor: { max_mean_abs_difference: 0.05 } }; });
  const r = gateDriftSigned(c);
  assert.equal(r.status, "fail");
  assert.match(r.detail, /NOT COMPARABLE/);
});
test("G-drift-signed: under both thresholds passes unflagged; a signed threshold is applied per judge; an OPEN block is not a threshold", () => {
  const ok = gateDriftSigned(mutate((x) => { x.protocol = { anchor: { max_mean_abs_difference: 0.3, max_abs_signed_drift: { rating_units: 0.2 } } }; }));
  assert.equal(ok.status, "pass");
  assert.equal(ok.evidence.report_only, false);
  const bad = gateDriftSigned(mutate((x) => { x.protocol = { anchor: { max_mean_abs_difference: 0.3, max_abs_signed_drift: { rating_units: 0.05 } } }; }));
  assert.equal(bad.status, "fail");
  const open = gateDriftSigned(mutate((x) => { x.protocol = { anchor: { max_mean_abs_difference: 0.3, max_abs_signed_drift: { open: true, proposed_default: 0.01 } } }; }));
  assert.equal(open.evidence.report_only, true);
  assert.equal(thresholdValue({ open: true, proposed_default: 0.759 }), null);
});
test("G-drift-signed: a run without a bridge is n/a; a bridge with no analysis is a hold", () => {
  assert.equal(gateDriftSigned(mutate((x) => { delete x.runConfig.bridge; delete x.analysis.bridge_drift; })).status, "n/a");
  assert.equal(gateDriftSigned(mutate((x) => { delete x.analysis.bridge_drift; })).status, "hold");
});

// ---- G-sensitivity
test("G-sensitivity: full coverage with sensitive items requested passes (positive control)", () => {
  const r = gateSensitivity(mutate((x) => { x.runConfig.include_sensitive = true; }));
  assert.equal(r.status, "pass");
  assert.equal(r.evidence.coverage_percent, 100);
});
test("G-sensitivity: planted probe, sensitive items requested with 0% coverage, holds", () => {
  const c = mutate((x) => { x.runConfig.include_sensitive = true; for (const i of x.bankItems) delete i.sensitivity; });
  const r = gateSensitivity(c);
  assert.equal(r.status, "hold");
  assert.equal(r.evidence.coverage_percent, 0);
});
test("G-sensitivity: not requested reports coverage and passes; an invalid tag value does not count as coverage", () => {
  const c = mutate((x) => { for (const i of x.bankItems) delete i.sensitivity; });
  const r = gateSensitivity(c);
  assert.equal(r.status, "pass");
  assert.equal(r.evidence.coverage_percent, 0);
  const bad = mutate((x) => { x.runConfig.include_sensitive = true; x.bankItems[0].sensitivity = "weird"; });
  assert.equal(gateSensitivity(bad).status, "hold");
});

// ---- G-keys
test("G-keys: unpublished pool with no tracked or staged key path passes (positive control)", () => {
  const r = gateKeys(mutate((x) => { x.runConfig.pool = "unpublished"; }));
  assert.equal(r.status, "pass");
  assert.equal(r.evidence.report_only, undefined);
});
test("G-keys: planted probe, a staged key path in an unpublished pool, fails", () => {
  const c = mutate((x) => {
    x.runConfig.pool = "unpublished";
    x.runGit = (a) => (a[0] === "diff" ? { status: 0, stdout: "research/model-runs/fx-run/keys/judge-key.json\n" } : { status: 0, stdout: "" });
  });
  const r = gateKeys(c);
  assert.equal(r.status, "fail");
  assert.equal(r.evidence.staged_key_files, 1);
});
test("G-keys: a tracked key path in an unpublished pool fails; the same listing for a public pool is report-only", () => {
  const tracked = (a) => (a[0] === "ls-files" ? { status: 0, stdout: "research/model-runs/fx-run/keys/judge-key.json\n" } : { status: 0, stdout: "" });
  assert.equal(gateKeys(mutate((x) => { x.runConfig.pool = "unpublished"; x.runGit = tracked; })).status, "fail");
  const pub = gateKeys(mutate((x) => { x.runConfig.pool = "public-permanent"; x.runGit = tracked; }));
  assert.equal(pub.status, "pass");
  assert.equal(pub.evidence.report_only, true);
});
test("G-keys: the pool is read from the bank when run-config has none, and unknown fails closed", () => {
  assert.equal(resolvePool({}, [{ exposureStatus: "public-permanent" }]).exposure, "public");
  assert.equal(resolvePool({}, [{ exposureStatus: "public-permanent" }, { exposureStatus: "withheld" }]).exposure, "unpublished");
  assert.equal(resolvePool({}, null).exposure, "unpublished");
  assert.equal(gateKeys(mutate((x) => { x.runGit = () => ({ status: 128, stdout: "" }); })).status, "hold");
});

// ---- G-agreement
test("G-agreement: no ratified floor is report-only; at the floor passes", () => {
  const r = gateAgreement(fixture());
  assert.equal(r.status, "pass");
  assert.equal(r.evidence.report_only, true);
  assert.equal(gateAgreement(mutate((x) => { x.protocol = { gates: { agreement_floor_exact: 0.9 } }; })).status, "pass");
});
test("G-agreement: planted probe, one subject below a ratified floor, fails; an OPEN floor is not a floor", () => {
  const c = mutate((x) => { x.protocol = { gates: { agreement_floor_exact: 0.759 } }; x.analysis.subjects["sub-A"].judge_agreement.exact = 0.3; });
  assert.equal(gateAgreement(c).status, "fail");
  const open = mutate((x) => { x.protocol = { gates: { agreement_floor_exact: { open: true, proposed_default: 0.759 } } }; x.analysis.subjects["sub-A"].judge_agreement.exact = 0.3; });
  assert.equal(gateAgreement(open).status, "pass");
  assert.equal(gateAgreement(mutate((x) => { x.analysis = null; })).status, "hold");
});

// ---- gates that are not buildable yet are never "pass"
test("variance, spend, hosted: n/a for a local run, not-built (never pass) when a hosted subject exists", () => {
  const local = fixture();
  for (const g of [gateVariance, gateSpend, gateHosted]) assert.equal(g(local).status, "n/a");
  const hosted = mutate((x) => { x.runConfig.subjects.push({ label: "h", access_tier: "hosted-api", digest: DIGEST }); });
  for (const g of [gateVariance, gateSpend, gateHosted]) assert.equal(g(hosted).status, "not-built");
  assert.equal(gateClaimAudit().status, "hold", "no run id: nothing to audit, never a pass"); // the real audit is tested in claim-audit.test.mjs
  assert.equal(gateRenderLeak().status, "not-built");
});

// ---- verdict, deviation parser, runAllGates robustness
test("verdict: HOLD while any gate is not pass or n/a; READY only when all are", () => {
  const all = runAllGates(fixture());
  assert.equal(verdictOf(all).verdict, "HOLD");
  assert.deepEqual(verdictOf(all).holding.sort(), ["G-claim-audit", "G-render-leak"]); // fx-run has no report: G-claim-audit holds
  const ready = all.filter((r) => r.status === "pass" || r.status === "n/a");
  assert.equal(verdictOf(ready).verdict, "READY");
  assert.equal(verdictOf([...ready, { id: "x", status: "hold", detail: "", evidence: {} }]).verdict, "HOLD");
});
test("runAllGates: a gate that throws becomes a hold, never a pass", () => {
  const c = fixture();
  c.runConfig.subjects = null;
  c.records = [{ subject: "x" }];
  const results = runAllGates(c);
  assert.equal(results.length, 14);
  assert.ok(results.every((r) => r.status !== undefined));
});
test("parseDeviations: reads dated D-ids and keeps the whole bullet", () => {
  const md = "x\n## Deviations (append-only, dated)\n\n- **2026-10-03, D1 — call order.**\n  - detail 17 of 1,328 replies\n- **2026-10-04, D2 — second stop (post-hoc).**\n  - more\n\n## Other\n- **2026-01-01, D9 — not here.**\n";
  const d = parseDeviations(md);
  assert.deepEqual(d.map((x) => x.id), ["D1", "D2"]);
  assert.match(d[0].text, /17 of 1,328/);
  assert.deepEqual(parseDeviations("## Deviations\n\n_None yet._\n"), []);
});

// ---- audit-wave (pure parts)
function gapFixture(gapHours) {
  const c = fixture();
  c.records.forEach((r, i) => {
    if (i >= 6) {
      const shift = gapHours * 3600 * 1000;
      r.started_at = new Date(Date.parse(r.started_at) + shift).toISOString();
      r.finished_at = new Date(Date.parse(r.finished_at) + shift).toISOString();
      r.attempts[0].started_at = r.started_at;
    }
  });
  return c;
}
test("audit-wave: no gap in clean records; a planted multi-hour gap with no deviation is an open item", () => {
  assert.equal(auditRun(fixture()).open_items.length, 0);
  const a = auditRun(gapFixture(3));
  assert.equal(a.gaps.length, 1);
  assert.equal(a.gaps[0].records_before, 6);
  assert.equal(a.open_items.length, 1);
  assert.match(a.open_items[0].detail, /no deviation explains it/);
});
test("audit-wave: a deviation stating the count and time of the stop explains the gap; a false count is an open item", () => {
  const c = gapFixture(3);
  const g = findGaps(c.records).gaps[0];
  const text = (n) => `- **2026-03-02, D1 — host stop.**\n  - The run was stopped by the host after ${n} of 12 replies, between ${g.starts_at.slice(0, 19)}Z and ${g.ends_at.slice(0, 19)}Z. All 12 records have exactly one attempt.`;
  c.deviations = [{ id: "D1", date: "2026-03-02", title: "host stop", text: text(6) }];
  const ok = auditRun(c);
  assert.deepEqual(ok.gaps[0].mapped_to.map((m) => m.deviation), ["D1"]);
  assert.equal(ok.open_items.length, 0);
  c.deviations = [{ id: "D1", date: "2026-03-02", title: "host stop", text: text(9).replace(/between .*? and .*?Z\./, "somewhere.") }];
  const bad = auditRun(c);
  assert.ok(bad.open_items.length >= 1);
});
test("audit-wave: a host-stop deviation with no gap behind it, a false one-attempt claim, and unlisted truncation are open items", () => {
  const c = fixture();
  c.deviations = [{ id: "D1", date: "2026-03-02", title: "stop", text: "- **2026-03-02, D1 — stop.**\n  - The run was stopped by the host for low memory." }];
  assert.ok(auditRun(c).open_items.some((o) => /D1/.test(o.detail)));
  const d = fixture();
  d.records[2].attempts.push({ attempt: 1, done_reason: "stop" });
  d.deviations = [{ id: "D2", date: "2026-03-02", title: "x", text: "- **2026-03-02, D2 — x.**\n  - all records have exactly one attempt" }];
  assert.ok(auditRun(d).open_items.some((o) => /exactly one attempt/.test(o.detail)));
  const e = fixture();
  e.records[1].attempts[0].done_reason = "length";
  assert.ok(auditRun(e).open_items.some((o) => o.check === "truncation"));
});

// ---- CLIs
function run(script, args) {
  return spawnSync(process.execPath, [path.join(BIN, script), ...args], { cwd: REPO, encoding: "utf8", timeout: 180000 });
}
test("CLIs: usage errors exit 1; audit-wave refuses --out inside the run directory", () => {
  assert.equal(run("wave-ready.mjs", []).status, 1);
  assert.equal(run("wave-ready.mjs", [os.tmpdir()]).status, 1);
  assert.equal(run("audit-wave.mjs", []).status, 1);
  if (existsSync(PILOT3)) {
    const r = run("audit-wave.mjs", [PILOT3, "--out", path.join(PILOT3, "claim-audit.json")]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /inside the run directory/);
    assert.equal(existsSync(path.join(PILOT3, "claim-audit.json")), false);
  }
});

const real = { skip: existsSync(PILOT3) ? false : "pilot-2026-10-03 is absent" };
const gitStatus = () => spawnSync("git", ["status", "--porcelain", "--", "research/model-runs/pilot-2026-10-03", "research/model-runs/pilot-2026-10-02"], { cwd: REPO, encoding: "utf8" }).stdout;

test("real data: audit-wave on pilot-2026-10-03 finds exactly the two host stops and maps them to D1 and D2", real, () => {
  const before = gitStatus();
  const r = run("audit-wave.mjs", [PILOT3]);
  assert.equal(r.status, 0, r.stderr);
  const a = JSON.parse(r.stdout);
  const major = a.gaps.filter((g) => g.major);
  assert.equal(a.gaps.length, 2);
  assert.equal(major.length, 2);
  assert.ok(major[0].hours > 12.8 && major[0].hours < 13);
  assert.ok(major[1].hours > 9.2 && major[1].hours < 9.4);
  assert.deepEqual(major[0].mapped_to.map((m) => m.deviation), ["D1"]);
  assert.deepEqual(major[1].mapped_to.map((m) => m.deviation), ["D2"]);
  assert.equal(a.open_items.length, 0);
  assert.equal(gitStatus(), before, "the run directory must be untouched");
});

test("real data: wave-ready on pilot-2026-10-03 runs, prints a verdict, exits 3 (HOLD), and writes nothing", real, () => {
  const before = gitStatus();
  const r = run("wave-ready.mjs", [PILOT3]);
  assert.equal(r.status, 3, r.stderr);
  assert.match(r.stdout, /VERDICT: HOLD/);
  const j = JSON.parse(run("wave-ready.mjs", [PILOT3, "--json"]).stdout);
  const by = Object.fromEntries(j.gates.map((g) => [g.id, g.status]));
  assert.equal(by["G-plan-time"], "pass");
  assert.equal(by["G-complete"], "pass");
  assert.equal(by["G-digest"], "pass");
  assert.equal(by["G-validity"], "pass");
  assert.equal(by["G-claim-audit"], "pass"); // D-63 Stream A: the report-token claim audit is built
  assert.equal(j.verdict, "HOLD");
  assert.equal(gitStatus(), before);
  console.log(`# wave-ready pilot-2026-10-03: ${j.verdict}; holding ${j.holding.join(", ")}; report-only ${j.report_only.join(", ")}`);
});
