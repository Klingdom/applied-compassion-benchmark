#!/usr/bin/env node
/**
 * test-self-description-claims.mjs -- DC-25 (public copy misdescribes our own publications), backlog DC25-GATE.
 *
 * Fact derived from data: any non-null `pilot_composite` in site/public/data/model-waves/*.json means pilot reports DO show
 * a point estimate (decision D-29a). Public copy must then not say they show only ranges / no composite / no point estimates.
 * Detection, patterns and the (minimal) exemptions live in scripts/lib/self-description-claims.mjs -- read its header.
 *
 * Scanned (enumerated by readdir, never a hand list): research/insights/*.md, src/data/insights/*.json (string values),
 * research/ai-model-cycle/*.md, src/app/ai-models/** and src/app/insights/** (.ts/.tsx), src/lib/model-*.ts,
 * public/llms.txt, public/llms-full.txt. Floor: MIN_FILES scanned, else VACUOUS and FAIL.
 *
 * Controls run every time: positive (original + 2026-10-21 sentences must trip; corrected sentence and a quoted citation in a
 * Corrections section must not), negative control on the real tree (plant the original sentence into an in-memory copy of the
 * article; real files are never written), and N/A when the wave data has no composites.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { findClaims, hasPilotComposite, jsonStrings, checkSources } from "./lib/self-description-claims.mjs";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(SITE, "..");
const MIN_FILES = 20;
const ARTICLE = "research/insights/why-we-do-not-rank-ai-models-yet.md";

let failed = 0;
const pass = (m) => console.log(`PASS  ${m}`);
const fail = (m) => { failed++; console.log(`FAIL  ${m}`); };
const check = (ok, m) => (ok ? pass(m) : fail(m));
const rel = (p) => relative(ROOT, p).replace(/\\/g, "/");

function listFiles(dir, test, recursive = false) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (recursive) out.push(...listFiles(p, test, true)); }
    else if (test(name)) out.push(p);
  }
  return out;
}

// ---- 1. derive the fact from data ------------------------------------------------------------------------------------
const waveFiles = listFiles(join(SITE, "public", "data", "model-waves"), (n) => n.endsWith(".json"));
let compositeExists = false;
for (const f of waveFiles) {
  try { if (hasPilotComposite(JSON.parse(readFileSync(f, "utf8")))) compositeExists = true; }
  catch (e) { fail(`wave file does not parse: ${rel(f)} (${e.message})`); }
}
console.log(`INFO  wave files: ${waveFiles.length}; non-null pilot_composite present: ${compositeExists}`);

// ---- 2. enumerate public-copy sources --------------------------------------------------------------------------------
const tsLike = (n) => /\.(ts|tsx)$/.test(n);
const mdFiles = [
  ...listFiles(join(ROOT, "research", "insights"), (n) => n.endsWith(".md")),
  ...listFiles(join(ROOT, "research", "ai-model-cycle"), (n) => n.endsWith(".md")),
];
const jsonFiles = listFiles(join(SITE, "src", "data", "insights"), (n) => n.endsWith(".json"));
const codeFiles = [
  ...listFiles(join(SITE, "src", "app", "ai-models"), tsLike, true),
  ...listFiles(join(SITE, "src", "app", "insights"), tsLike, true),
  ...listFiles(join(SITE, "src", "lib"), (n) => /^model-.*\.ts$/.test(n)),
];
const txtFiles = ["llms.txt", "llms-full.txt"].map((n) => join(SITE, "public", n)).filter(existsSync);

const sources = [];
for (const f of mdFiles) sources.push({ path: rel(f), text: readFileSync(f, "utf8"), markdown: true });
for (const f of jsonFiles) {
  try { sources.push({ path: rel(f), text: jsonStrings(JSON.parse(readFileSync(f, "utf8"))).join("\n") }); }
  catch (e) { fail(`insights JSON does not parse: ${rel(f)} (${e.message})`); }
}
for (const f of [...codeFiles, ...txtFiles]) sources.push({ path: rel(f), text: readFileSync(f, "utf8") });

check(sources.length >= MIN_FILES, sources.length >= MIN_FILES
  ? `scanned ${sources.length} public-copy files (floor ${MIN_FILES})`
  : `VACUOUS: only ${sources.length} public-copy files scanned (floor ${MIN_FILES})`);

// ---- 3. the real-tree check ------------------------------------------------------------------------------------------
const real = checkSources(sources, compositeExists);
if (real.status === "N/A") {
  console.log("N/A   claim check not applicable: no non-null pilot_composite in the wave data");
} else {
  for (const f of real.findings) fail(`${f.path}:${f.line} [${f.id}] "${f.snippet}" -- pilot reports DO show a point estimate (D-29a)`);
  if (!real.findings.length) pass(`0 forbidden self-description claims in ${sources.length} files`);
}

// ---- 4. controls (always run) ----------------------------------------------------------------------------------------
const ORIGINAL = "Pilot reports show ranges rather than single numbers.";
const DRAFT_1 = "No composite is published for any model.";
const DRAFT_2 = "Pilot results are ranges, not scores.";
const CORRECTED = "Two pilot reports also show a point estimate inside the range for the one model the test separated from the others.";
const mustTrip = [["original 2026-10-16 sentence", ORIGINAL], ["2026-10-21 draft 'no composite is published'", DRAFT_1],
  ["2026-10-21 draft 'ranges, not scores'", DRAFT_2],
  ["line-wrapped original", "Pilot reports show ranges\n   rather   than\nsingle numbers."],
  ["JSX-entity variant", "No pilot composite has been published, and there&apos;s just ranges for pilot results."],
  ["'no point estimates'", "The pilot has no point estimates."],
  ["'ranges only' about pilot", "Pilot results are ranges only."]];
for (const [name, s] of mustTrip) {
  const f = findClaims(s, { markdown: true });
  check(f.length > 0, `positive control trips: ${name}${f.length ? ` [${f.map((x) => x.id).join(",")}]` : ""}`);
}
const mustPass = [["corrected sentence", CORRECTED, true],
  ["'ranges, not official scores'", "Pilot results are ranges, not official scores.", true],
  ["'single number' headline rule", "A single number for a model in any headline, title or summary.", true],
  ["'no composite should imply otherwise'", "Nothing here is official, and no composite should imply otherwise.", true],
  ["secondary-arm 'shows ranges only' (true by design)", "In the pilot, the secondary arm shows ranges only.", true],
  ["'ranges only' with no pilot context", "The chart shows ranges only.", true],
  ["quoted citation in Corrections section",
    `# T\n\nBody.\n\n## Corrections\n- 2026-10-21: This article first said pilot reports "show ranges rather than single numbers". Fixed.\n`, true],
  ["quoted citation after 'said' (curly quotes, body)", "It first said “pilot reports show ranges rather than single numbers”.", false]];
for (const [name, s, md] of mustPass) {
  const f = findClaims(s, { markdown: md });
  check(f.length === 0, `negative control passes: ${name}${f.length ? ` -> ${f.map((x) => x.snippet).join("; ")}` : ""}`);
}
// An assertion placed AFTER a Corrections section's end (next ## heading) must still be caught.
check(findClaims("## Corrections\n- fixed.\n\n## Notes\nPilot reports show ranges rather than single numbers.\n", { markdown: true }).length === 1,
  "exemption is scoped: claim under a later ## heading still trips");

// Negative control on the real tree: plant the original sentence into an in-memory copy of the article.
const art = sources.find((s) => s.path === ARTICLE);
if (!art) fail(`negative control: ${ARTICLE} not among scanned sources`);
else {
  const planted = sources.map((s) => (s === art
    ? { ...s, text: s.text.replace(/^## Corrections/m, `${ORIGINAL}\n\n## Corrections`) } : s));
  check(planted.find((s) => s.path === ARTICLE).text.includes(ORIGINAL), "planted probe present in in-memory article copy");
  const r = checkSources(planted, true);
  check(r.findings.some((f) => f.path === ARTICLE), `real-tree plant: gate fails on planted original sentence (${r.findings.length} finding)`);
  const baseline = checkSources(sources, true).findings.length;
  console.log(`INFO  baseline findings if composite exists: ${baseline}`);
}
// N/A control: wave data without composites.
const na = checkSources(sources, hasPilotComposite({ pilot_composite: null, rows: [{ pilot_composite: null }, { keys: ["pilot_composite"] }] }));
check(na.status === "N/A" && na.findings.length === 0, "no-composite wave data -> claim check reported N/A (planted probes above still ran)");
check(hasPilotComposite({ a: [{ pilot_composite: 40.2 }] }) === true, "composite detector sees a non-null pilot_composite");
check(hasPilotComposite({ pilot_composite_interval95: [1, 2], list: ["pilot_composite"] }) === false, "composite detector ignores similarly named keys and string mentions");

console.log(failed ? `\n${failed} FAILURE(S)` : "\nAll self-description claim checks passed.");
process.exit(failed ? 1 : 0);
