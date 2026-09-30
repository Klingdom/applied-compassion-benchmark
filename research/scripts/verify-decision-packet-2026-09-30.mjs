#!/usr/bin/env node
/**
 * verify-decision-packet-2026-09-30.mjs
 *
 * Re-derives every figure in docs/FOUNDER_DECISION_PACKET_2026-09-30.md from
 * the data, so the packet can be checked rather than believed.
 *
 * WHY A PACKET NEEDS THIS
 *   The packet asks for six decisions on the strength of about forty numbers
 *   that I typed. Two were already wrong when this first ran: the ahead-count
 *   had moved from 149 to 150 because I committed in between, and the claim
 *   that "Deviation: appears zero times" had falsified itself, because the
 *   iteration entry reporting the finding quotes the token. Both were caught
 *   here and corrected in the packet.
 *
 *   It is also a staleness check. The ahead-count grows with every commit and
 *   the proposal statuses change as research runs, so a failure here does not
 *   mean the packet was wrong — it may mean the packet has aged. Read the
 *   failure before believing either.
 *
 * Usage:
 *   node research/scripts/verify-decision-packet-2026-09-30.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Derived, not hard-coded: an absolute path from one machine is not a script.
const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..") + "/";
const doc = readFileSync(REPO + "docs/FOUNDER_DECISION_PACKET_2026-09-30.md", "utf8");

let ok = 0;
const bad = [];
function check(label, cond, detail = "") {
  if (cond) {
    ok += 1;
    console.log(`  ok  ${label}`);
  } else {
    bad.push(label);
    console.log(`  BAD ${label} ${detail}`);
  }
}

// ---- index data ----
const idx = {};
for (const f of readdirSync(REPO + "site/src/data/indexes")) {
  idx[f.replace(".json", "")] = JSON.parse(readFileSync(REPO + "site/src/data/indexes/" + f, "utf8")).rankings || [];
}
const find = (index, name, state) =>
  idx[index].find((r) => (r.name || "") === name && (state === undefined || r.state === state));

// Rethink
const rr = find("robotics-labs", "Rethink Robotics");
check("Rethink: rank 22", rr && rr.rank === 22, rr ? `got ${rr.rank}` : "not found");
check("Rethink: composite 60.9", rr && rr.composite === 60.9, rr ? `got ${rr.composite}` : "");
check("Rethink: band established", rr && rr.band === "established", rr ? `got ${rr.band}` : "");
check("robotics-labs has 92 rows", idx["robotics-labs"].length === 92, `got ${idx["robotics-labs"].length}`);

// Every composite pair asserted in the D-49 table
const pairs = [
  ["1X Technologies", "ai-labs", 50.0, "robotics-labs", 81.4],
  ["Figure AI", "ai-labs", 31.3, "robotics-labs", 48.4],
  ["Houston", "us-cities", 35.2, "global-cities", 43.8],
  ["New York City", "global-cities", 48.4, "us-cities", 56.3],
  ["Singapore", "global-cities", 56.2, "countries", 62.2],
  ["Georgia", "us-states", 26.9, "countries", 34.4],
  ["Seattle", "us-cities", 54.7, "global-cities", 53.1],
  ["Philadelphia", "us-cities", 42.2, "global-cities", 43.8],
];
for (const [name, ia, va, ib, vb] of pairs) {
  const a = find(ia, name);
  const b = find(ib, name);
  check(
    `${name}: ${ia} ${va} / ${ib} ${vb}`,
    a && b && a.composite === va && b.composite === vb,
    `got ${a ? a.composite : "?"} / ${b ? b.composite : "?"}`
  );
  check(`${name}: the doc states both figures`, doc.includes(String(va)) && doc.includes(String(vb)));
}

// 1X gap arithmetic
const x1a = find("ai-labs", "1X Technologies");
const x1b = find("robotics-labs", "1X Technologies");
check("1X gap is 31.4", Math.abs(Math.round((x1b.composite - x1a.composite) * 10) / 10 - 31.4) < 0.001);

// intra-index duplicates
const pME = find("us-cities", "Portland", "ME");
const pOR = find("us-cities", "Portland", "OR");
check("Portland ME rank 8", pME && pME.rank === 8, pME ? `got ${pME.rank}` : "");
check("Portland OR rank 22", pOR && pOR.rank === 22, pOR ? `got ${pOR.rank}` : "");
check("Portland ME 57.8 / OR 48.4", pME.composite === 57.8 && pOR.composite === 48.4, `${pME.composite}/${pOR.composite}`);
const sIL = find("us-cities", "Springfield", "IL");
const sMO = find("us-cities", "Springfield", "MO");
check("Springfield IL rank 93, MO rank 94", sIL && sMO && sIL.rank === 93 && sMO.rank === 94);

// duplicate counts
const byName = {};
for (const [k, rows] of Object.entries(idx))
  for (const r of rows) {
    const n = (r.name || "").trim();
    if (n) (byName[n] = byName[n] || []).push({ k, c: r.composite });
  }
const dupes = Object.entries(byName).filter(([, v]) => v.length > 1);
const contradictory = dupes.filter(([, v]) => new Set(v.map((x) => x.c)).size > 1);
check("19 names in more than one index", dupes.length === 19, `got ${dupes.length}`);
check("9 publish different composites", contradictory.length === 9, `got ${contradictory.length}`);

// ---- proposal statuses ----
const counts = {};
for (const f of readdirSync(REPO + "research/change-proposals").filter((f) => f.endsWith(".json"))) {
  const j = JSON.parse(readFileSync(REPO + "research/change-proposals/" + f, "utf8"));
  const s = j.status || j.decision || "unknown";
  counts[s] = (counts[s] || 0) + 1;
}
const total = Object.values(counts).reduce((a, b) => a + b, 0);
check("728 proposal files", total === 728, `got ${total}`);
for (const [k, v] of [["applied", 346], ["superseded", 137], ["approved", 37], ["pending", 29], ["auto-confirm-eligible", 69], ["documented", 56], ["confirmed-no-change", 23], ["requires-human-review", 12], ["band-crossing-proposed", 6]]) {
  check(`status ${k} = ${v}`, counts[k] === v, `got ${counts[k]}`);
}

// ---- git / repo facts ----
const g = (args) => execFileSync("git", args, { cwd: REPO, encoding: "utf8" }).trim();
const ahead = Number(g(["rev-list", "--count", "main..HEAD"]));
check("the doc states the current ahead-count", doc.includes(`**${ahead} commits ahead`), `actual ${ahead}`);
check("0 commits behind main", g(["rev-list", "--count", "HEAD..main"]) === "0");
const applied = readFileSync(REPO + "research/APPLIED_CHANGES.md", "utf8");
const dates = [...applied.matchAll(/^## (2026-\d\d-\d\d)/gm)].map((m) => m[1]).sort();
check("last APPLIED_CHANGES entry is 2026-09-16", dates[dates.length - 1] === "2026-09-16", dates[dates.length - 1]);
const log = readFileSync(REPO + "ITERATION_LOG.md", "utf8");
const devCount = (log.match(/Deviation:/g) || []).length;
check("the doc does not claim a present-tense zero for Deviation:", !/`Deviation:` appears \*\*zero times\*\*/.test(doc), `token now occurs ${devCount}x`);
check("positive control: Selected: appears many times", (log.match(/Selected:/g) || []).length >= 20);
const pkg = JSON.parse(readFileSync(REPO + "site/package.json", "utf8"));
check("chain is 53 steps as the doc says", pkg.scripts.test.split("&&").length === 53 && doc.includes("53-step"));
const wf = readFileSync(REPO + ".github/workflows/deploy.yml", "utf8").split("\n");
check("deploy.yml line 228 is the workflow_dispatch guard", /workflow_dispatch/.test(wf[227]), wf[227]);

console.log(`\n${ok} verified, ${bad.length} wrong`);
if (bad.length) {
  console.log("WRONG: " + bad.join(" | "));
  process.exit(1);
}
