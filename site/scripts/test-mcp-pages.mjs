#!/usr/bin/env node
/**
 * test-mcp-pages.mjs -- gates on the BUILT HTML for the cb-probe MCP section
 * (/ai-evaluation-suite#mcp-server) and the analysis section (/ai-models/methodology#analysis).
 *
 * Spec: docs/MCP_AND_MODEL_BENCHMARK_PAGES_SPEC_2026-10-02.md section 8 (T1, T2, T4-T6, T8, T10).
 *
 * V8 (a check that cannot fail is not a check):
 *  - with --require-out (as `npm run build` runs it) the test fails if site/out is missing; inside
 *    `npm test` a missing out/ prints SKIPPED. Either way a built page older than the facts file fails;
 *  - every assertion runs twice: against the real HTML (must pass) and against a copy mutated in
 *    memory to contain exactly the defect the assertion exists to catch (must fail). If the planted
 *    probe is not caught, the assertion is broken and the test fails.
 *  - sections are extracted with fail-on-zero: an empty or missing section is a failure.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(here, "..");
const OUT = join(SITE, "out");
const FACTS_PATH = join(SITE, "src", "data", "model-benchmark", "cb-probe-facts.generated.json");
const WAVES_DIR = join(SITE, "src", "data", "model-benchmark", "waves");

const PAGES = {
  suite: join(OUT, "ai-evaluation-suite.html"),
  methodology: join(OUT, "ai-models", "methodology.html"),
  models: join(OUT, "ai-models.html"),
};

let failures = 0;
let passes = 0;
const fail = (msg) => {
  failures += 1;
  console.error("FAIL " + msg);
};
const ok = (msg) => {
  passes += 1;
  console.log("  ok   " + msg);
};

// ---- V8: freshness and presence -----------------------------------------------------------
if (!existsSync(FACTS_PATH)) {
  console.error("FAIL facts file missing: " + FACTS_PATH);
  process.exit(1);
}
// Two modes, matching test-model-report-html / test-model-html-leak:
//  - `npm run build` runs this with --require-out right after `next build`, so the built tree is
//    ALWAYS checked on every build, CI and Docker included: a missing out/ is a failure there;
//  - inside `npm test` (which CI runs BEFORE the build) a missing out/ is reported as SKIPPED,
//    loudly, never as a pass. If out/ exists it is checked in full, freshness included.
const REQUIRE_OUT = process.argv.includes("--require-out");
if (!existsSync(OUT)) {
  if (REQUIRE_OUT) {
    console.error("FAIL site/out is missing (--require-out). This test reads the built HTML.");
    process.exit(1);
  }
  console.warn("test-mcp-pages SKIPPED (not verified): site/out does not exist yet. `npm run build` runs this gate with --require-out.");
  process.exit(0);
}
const factsMtime = statSync(FACTS_PATH).mtimeMs;
for (const [k, p] of Object.entries(PAGES)) {
  if (!existsSync(p)) {
    console.error(`FAIL built page missing (${k}): ${p}`);
    process.exit(1);
  }
  if (statSync(p).mtimeMs < factsMtime) {
    console.error(
      `FAIL built page ${k} is older than the facts file. The build is stale relative to cb-probe-facts.generated.json; rebuild.`,
    );
    process.exit(1);
  }
}

const facts = JSON.parse(readFileSync(FACTS_PATH, "utf8"));
// React inserts <!-- --> between adjacent text nodes; strip them so text assertions see what a reader sees.
const html = Object.fromEntries(
  Object.entries(PAGES).map(([k, p]) => [k, readFileSync(p, "utf8").replace(/<!--[\s\S]*?-->/g, "")]),
);

// ---- helpers -------------------------------------------------------------------------------
/** The <section> whose id is `id`, through its closing tag. Fails on zero. */
function sectionOf(page, id) {
  const marker = `id="${id}"`;
  const at = page.indexOf(marker);
  if (at < 0) return "";
  const start = page.lastIndexOf("<section", at);
  const end = page.indexOf("</section>", at);
  if (start < 0 || end < 0) return "";
  return page.slice(start, end + "</section>".length);
}
const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
const textOf = (fragment) =>
  decode(fragment.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const codeTokens = (fragment) => [...fragment.matchAll(/<code[^>]*>([\s\S]*?)<\/code>/g)].map((m) => decode(m[1].replace(/<[^>]+>/g, "")).trim());

const mcp = sectionOf(html.suite, "mcp-server");
const analysis = sectionOf(html.methodology, "analysis");
if (!mcp) fail("T1: #mcp-server section not found in out/ai-evaluation-suite.html");
if (!analysis) fail("T1: #analysis section not found in out/ai-models/methodology.html");
if (!mcp || !analysis) process.exit(1);

/** Run `assertion` on the real input (must return no problems) and on a planted-defect input (must return some). */
function gate(name, assertion, realInput, plant) {
  const real = assertion(realInput);
  if (real.length > 0) {
    fail(`${name}: ${real.length} problem(s) on the real build`);
    for (const p of real.slice(0, 10)) console.error("       - " + p);
  } else {
    ok(`${name} (real build)`);
  }
  const planted = plant(realInput);
  if (planted === realInput) {
    fail(`${name}: negative control did not mutate the input (control is vacuous)`);
    return;
  }
  const caught = assertion(planted);
  if (caught.length === 0) fail(`${name}: planted-probe negative control was NOT caught; the assertion cannot fail`);
  else ok(`${name} (negative control caught: ${caught[0].slice(0, 70)})`);
}

// ---- T1 anchors and heading order ----------------------------------------------------------
const EXPECTED_MCP_ANCHORS = [
  "mcp-status", "mcp-what", "mcp-artifacts", "mcp-tools", "mcp-install", "mcp-walkthrough", "mcp-contamination",
  "mcp-judges", "mcp-floor", "mcp-refuses", "mcp-data", "mcp-sensitive", "mcp-docs",
];
const hasSeparation = typeof facts.separationStatement === "string" && facts.separationStatement.trim() !== "";
gate(
  "T1 mcp sub-anchors present and in order",
  (frag) => {
    const ids = [...frag.matchAll(/<div id="(mcp-[a-z-]+)"/g)].map((m) => m[1]);
    const expected = hasSeparation
      ? [...EXPECTED_MCP_ANCHORS.slice(0, -1), "mcp-not", "mcp-docs"]
      : EXPECTED_MCP_ANCHORS;
    return JSON.stringify(ids) === JSON.stringify(expected)
      ? []
      : [`anchors ${JSON.stringify(ids)} != expected ${JSON.stringify(expected)}`];
  },
  mcp,
  (frag) => frag.replace('<div id="mcp-floor">', '<div id="mcp-floorx">'),
);
gate(
  "T1 headings do not skip levels",
  (frag) => {
    const levels = [...frag.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    const problems = [];
    if (levels.length === 0) problems.push("no headings");
    for (let i = 0; i < levels.length; i++) {
      const prev = i === 0 ? 1 : levels[i - 1];
      if (levels[i] > prev + 1) problems.push(`h${levels[i]} follows h${prev}`);
    }
    return problems;
  },
  mcp + analysis,
  (frag) => frag + "<h5>skipped</h5>",
);
gate(
  "T1 #analysis exists on methodology and #pipeline is not defined there",
  (page) => (page.includes('id="analysis"') && !page.includes('id="pipeline"') ? [] : ["anchor state wrong"]),
  html.methodology,
  (page) => page + '<section id="pipeline"></section>',
);
gate(
  "T1 tables use <th scope>",
  (frag) => {
    const tables = frag.match(/<table[\s\S]*?<\/table>/g) ?? [];
    const problems = tables.length === 0 ? ["no tables"] : [];
    for (const t of tables) {
      const ths = t.match(/<th[\s>][^>]*>/g) ?? [];
      if (ths.length === 0 || ths.some((x) => !/scope="(col|row)"/.test(x))) problems.push("table with a <th> lacking scope");
    }
    return problems;
  },
  mcp + analysis,
  (frag) => frag + "<table><tr><th>no scope</th></tr></table>",
);
gate(
  "T1 code blocks are <pre><code>",
  (frag) => {
    const pres = frag.match(/<pre[\s\S]*?<\/pre>/g) ?? [];
    if (pres.length === 0) return ["no <pre> blocks in install section"];
    return pres.filter((p) => !/<pre[^>]*><code/.test(p)).map(() => "<pre> without <code>");
  },
  mcp,
  (frag) => frag + "<pre>bare</pre>",
);

// ---- T2 tool-name set equality -------------------------------------------------------------
const FACT_TOOLS = facts.tools.map((t) => t.name);
// Non-tool snake_case identifiers the section may legitimately render in <code> (parameters and fields).
const ALLOWED_FIELDS = new Set([
  "run_id", "subject_label", "judge_label", "include_sensitive", "recall_attempts", "identification_answers",
  "item_id", "option_id", "anchor_matched", "evidence_quote", "composite_withheld_reason",
  "judge_configuration_notice",
]);
gate(
  "T2 tool names in #mcp-tools equal the facts tool list (set and order)",
  (frag) => {
    const sec = frag.slice(frag.indexOf('id="mcp-tools"'), frag.indexOf('id="mcp-install"'));
    const rendered = [...sec.matchAll(/<code data-tool-row="">([^<]*)<\/code>/g)].map((m) => decode(m[1]));
    const problems = [];
    const missing = FACT_TOOLS.filter((t) => !rendered.includes(t));
    const extra = rendered.filter((t) => !FACT_TOOLS.includes(t));
    if (missing.length) problems.push("missing from table: " + missing.join(", "));
    if (extra.length) problems.push("not in facts: " + extra.join(", "));
    if (!missing.length && !extra.length && JSON.stringify(rendered) !== JSON.stringify(FACT_TOOLS)) problems.push("order differs from facts");
    if (rendered.length !== facts.toolCount) problems.push(`rendered ${rendered.length} tools, facts toolCount ${facts.toolCount}`);
    return problems;
  },
  mcp,
  (frag) => frag.replace(`<code data-tool-row="">${FACT_TOOLS[0]}</code>`, '<code data-tool-row="">bogus_tool</code>'),
);
gate(
  "T2 every snake_case <code> token in #mcp-server is a facts tool or a known field",
  (frag) => {
    const problems = [];
    for (const tok of new Set(codeTokens(frag))) {
      if (!/^[a-z]+(_[a-z]+)+$/.test(tok)) continue;
      if (!FACT_TOOLS.includes(tok) && !ALLOWED_FIELDS.has(tok)) problems.push(`unknown identifier <code>${tok}</code>`);
    }
    const inline = new Set([...frag.matchAll(/<code data-tool="">([^<]*)<\/code>/g)].map((m) => decode(m[1])));
    for (const t of inline) if (!FACT_TOOLS.includes(t)) problems.push(`data-tool ${t} not in facts`);
    return problems;
  },
  mcp,
  (frag) => frag.replace("</section>", "<code>invented_tool_name</code></section>"),
);
gate(
  "T2 tool count in the install text matches facts",
  (frag) => (textOf(frag).includes(`lists the server’s tools; expect ${facts.toolCount}.`) ? [] : [`"expect ${facts.toolCount}." not found`]),
  mcp,
  (frag) => frag.replace(`expect ${facts.toolCount}.`, "expect 99."),
);
gate(
  "T2 floor sentence agrees with facts.floorReachable",
  (frag) => {
    const m = frag.match(/data-floor-reachable="(true|false)"/);
    if (!m) return ["floor sentence missing"];
    const t = textOf(frag);
    const reachable = t.includes("the floor is reachable");
    const notReachable = t.includes("the floor is not reachable");
    const problems = [];
    if (m[1] !== String(facts.floorReachable)) problems.push(`rendered branch ${m[1]} != facts ${facts.floorReachable}`);
    if (facts.floorReachable && !reachable) problems.push("reachable sentence absent");
    if (!facts.floorReachable && !notReachable) problems.push("not-reachable sentence absent");
    return problems;
  },
  mcp,
  (frag) => frag.replace(/data-floor-reachable="(true|false)"/, `data-floor-reachable="${facts.floorReachable ? "false" : "true"}"`),
);

// ---- T4 no npx while npmPublished false ----------------------------------------------------
if (facts.distribution?.npmPublished === false) {
  gate(
    "T4 no `npx` or scoped package name on the three pages while npmPublished is false",
    (pages) => {
      const problems = [];
      for (const [k, h] of Object.entries(pages)) {
        if (/\bnpx\b/i.test(h)) problems.push(`npx found in ${k}`);
        if (/@compassionbenchmark\//i.test(h)) problems.push(`@compassionbenchmark found in ${k}`);
      }
      return problems;
    },
    { suite: html.suite, methodology: html.methodology, models: html.models },
    (pages) => ({ ...pages, suite: pages.suite.replace("</section>", "<pre><code>npx cb-probe</code></pre></section>") }),
  );
  gate(
    "T4 install block uses the repo path",
    (frag) => (frag.includes("tools/cb-probe/bin/server.mjs") ? [] : ["tools/cb-probe/bin/server.mjs absent"]),
    mcp,
    (frag) => frag.replaceAll("tools/cb-probe/bin/server.mjs", "x"),
  );
} else {
  ok("T4 skipped: npmPublished is true (no npx assertion applies)");
}

// ---- T5 no sales / pricing / contact-sales hrefs in the new sections -----------------------
const SALES_HREF = /href="[^"]*(contact-sales|gumroad|pricing|\/buy\b|checkout|\/store|\/pricing)[^"]*"/i;
gate(
  "T5 no sales, pricing or contact-sales href inside #mcp-server or #analysis",
  (frags) => Object.entries(frags).filter(([, f]) => SALES_HREF.test(f)).map(([k]) => `${k} contains a sales/pricing href`),
  { mcp, analysis },
  (frags) => ({ ...frags, analysis: frags.analysis + '<a href="/contact-sales">License</a>' }),
);
gate(
  "T5 sections contain no sales button copy",
  (frags) => Object.entries(frags).filter(([, f]) => /license the platform|contact sales|buy now|get a quote/i.test(textOf(f))).map(([k]) => `${k} has sales copy`),
  { mcp, analysis },
  (frags) => ({ ...frags, mcp: frags.mcp + "<p>License the Platform</p>" }),
);

// ---- T6 lexicon (ranking language, band names, contamination wording) ----------------------
const LEXICON = [
  /\bbest\b/i, /\bworst\b/i, /\btop\b/i, /\bleads?\b/i, /\bbeats?\b/i, /\boutperform\w*/i, /\bwins?\b/i,
  /\brank\w*/i, /\bleaderboards?\b/i, /#1\b/, /\btied\b/i, /\bahead\b/i, /\bbehind\b/i,
  /\b(most|least) compassionate\b/i, /\b(critical|developing|functional|established|exemplary)\b/i,
  /\bclean(s|ed)?\b/i, /\bclear(s|ed)?\b/i,
];
gate(
  "T6 no ranking language, band names or clean/cleared wording outside the negation list",
  (frags) => {
    const problems = [];
    for (const [k, f] of Object.entries(frags)) {
      const stripped = f.replace(/<(ul|blockquote)[^>]*data-negation-list=""[^>]*>[\s\S]*?<\/\1>/g, " ");
      const t = textOf(stripped);
      for (const re of LEXICON) {
        const m = t.match(re);
        if (m) problems.push(`${k}: "${m[0]}"`);
      }
    }
    return problems;
  },
  { mcp, analysis },
  (frags) => ({ ...frags, analysis: frags.analysis + "<p>this model is ahead of the rest</p>" }),
);
// Dedicated planted probe for the contamination-wording stems (audit B6: "A pass clears the sample only" slipped
// through when the pattern matched only clean/cleared).
gate(
  "T6 no clear/clears/cleared/clean/cleaned wording in the new sections",
  (frags) => {
    const problems = [];
    for (const [k, f] of Object.entries(frags)) {
      const m = textOf(f).match(/\b(clear|clears|cleared|clean|cleaned)\b/i);
      if (m) problems.push(`${k}: "${m[0]}"`);
    }
    return problems;
  },
  { mcp, analysis },
  (frags) => ({ ...frags, analysis: frags.analysis + "<p>A pass clears the sample only.</p>" }),
);
// Audit B5: a pilot trial is not one fresh context; each PART is.
gate(
  "T6 pilot design is not described as one fresh context per trial",
  (frag) => (/trials?,? each in a fresh context|each trial in a fresh context/i.test(textOf(frag)) ? ["fresh-context-per-trial wording"] : []),
  analysis,
  (frag) => frag + "<p>3 trials, each in a fresh context.</p>",
);
// Audit B1 (enforced state): both contamination checks are stated as required to finish, with no unenforced-fallback wording.
gate(
  "B1 both contamination checks are stated as required to finish",
  (frags) => {
    const problems = [];
    if (!/complete both checks before it can finish/.test(textOf(frags.mcp))) problems.push("mcp: 'both checks' sentence missing");
    if (/does not currently refuse|not block the run/i.test(textOf(frags.mcp) + " " + textOf(frags.analysis))) problems.push("fallback (unenforced) wording present");
    return problems;
  },
  { mcp, analysis },
  (frags) => ({ ...frags, mcp: frags.mcp.replace("complete both checks", "complete the recall check") }),
);
gate(
  "T6 the negation-list exemption exists and is the only place rank/official appear negated",
  (frag) => (/<ul[^>]*data-negation-list=""[^>]*>[\s\S]*?rank[\s\S]*?<\/ul>/.test(frag) ? [] : ["negation list with rank wording not found"]),
  mcp,
  (frag) => frag.replaceAll('data-negation-list=""', ""),
);

// ---- T8 no model names ---------------------------------------------------------------------
const subjects = new Set();
// A token shared by EVERY subject of one wave is that wave's vendor prefix (for example the CLI that is also named in the
// install command), covered by the full-subject match. It is worked out per wave: with several waves from different
// vendors no token is common to all subjects, and the prefix of one wave must not become a banned term for the others.
const commonTokens = new Set();
for (const f of existsSync(WAVES_DIR) ? readdirSync(WAVES_DIR) : []) {
  if (!f.endsWith(".json") || f === "manifest.json") continue;
  const w = JSON.parse(readFileSync(join(WAVES_DIR, f), "utf8"));
  const waveSubjects = [...new Set([...(w.design?.subjects ?? []), ...Object.keys(w.subjects ?? {})].map((s) => String(s).toLowerCase()))];
  for (const s of waveSubjects) subjects.add(s);
  const waveParts = waveSubjects.map((s) => s.split(/[^a-z0-9]+/).filter(Boolean));
  if (waveParts.length > 1) for (const p of waveParts[0]) if (waveParts.every((ps) => ps.includes(p))) commonTokens.add(p);
}
if (subjects.size === 0) {
  fail("T8: no wave subjects found in waves/*.json (fail-on-zero); cannot assert against model names");
}
// Distinguishing tokens: parts of a subject id that are not shared by every subject. A shared vendor prefix
// (the CLI is also called by that name in the install command) is covered by the full-subject match.
const parts = [...subjects].map((s) => s.split(/[^a-z0-9]+/).filter(Boolean));
const common = [...commonTokens];
const modelTerms = new Set([...subjects]);
for (const ps of parts) for (const p of ps) if (!common.includes(p) && p.length >= 3) modelTerms.add(p);
for (const generic of ["gpt", "gemini", "llama", "opus", "sonnet", "haiku", "fable"]) modelTerms.add(generic);
gate(
  "T8 no model names from wave subjects in #mcp-server or #analysis",
  (frags) => {
    const problems = [];
    for (const [k, f] of Object.entries(frags)) {
      const t = textOf(f).toLowerCase();
      for (const term of modelTerms) {
        if (new RegExp(`(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(t)) problems.push(`${k}: "${term}"`);
      }
    }
    return problems;
  },
  { mcp, analysis },
  (frags) => ({ ...frags, mcp: frags.mcp + `<p>${[...subjects][0] ?? "claude-opus"}</p>` }),
);

// ---- T5/T10 duty of care -------------------------------------------------------------------
const DUTY =
  "Nothing here is guidance about which AI system to turn to when you or someone else is struggling. " +
  "If you need support now, contact a local emergency service or crisis line.";
const dutyIn = (page) => {
  const found = [...page.matchAll(/<(?:p|span)[^>]*data-duty-of-care=""[^>]*>([\s\S]*?)<\/(?:p|span)>/g)].map((m) => textOf(m[1]));
  return found.length && found.every((x) => x === DUTY) ? [] : [`duty-of-care sentence missing or altered (found ${found.length})`];
};
gate("T10 duty-of-care sentence verbatim in #mcp-server", dutyIn, mcp, (f) => f.replace("emergency service", "ambulance"));
gate("T10 duty-of-care sentence verbatim in #analysis", dutyIn, analysis, (f) => f.replace('data-duty-of-care=""', ""));

// ---- values from facts appear ---------------------------------------------------------------
gate(
  "values: minTrials, itemsServedDefault, trialsInDefaultRun, minItemsPerDimension appear in #mcp-server",
  (frag) => {
    const t = textOf(frag);
    const must = [
      `Fewer than ${facts.minTrials} trials per item`,
      `at least ${facts.minTrials} trials per item`,
      `${facts.itemsServedDefault} items × ${facts.minTrials} trials`,
      `${facts.trialsInDefaultRun} ratings`,
      `at least ${facts.minItemsPerDimension} rated items`,
      `${facts.itemsServedDefault}`,
      `Node 20`,
    ];
    return must.filter((s) => !t.includes(s)).map((s) => `missing "${s}"`);
  },
  mcp,
  (frag) => frag.replace(`Fewer than ${facts.minTrials} trials per item`, "Fewer than 9 trials per item"),
);
gate(
  "values: itemsServedDefault appears in the #analysis local-run column",
  (frag) => (textOf(frag).includes(`${facts.itemsServedDefault} items served by default`) ? [] : ["itemsServedDefault missing"]),
  analysis,
  (frag) => frag.replace(`${facts.itemsServedDefault} items served by default`, "x items served by default"),
);
gate(
  "values: contamination constants appear in #mcp-server",
  (frag) => {
    const t = textOf(frag);
    const must = [
      `flagged at ${facts.recallThreshold}`,
      `${facts.identificationCount} items, ${facts.identificationOptions} options each`,
      `flagged below ${facts.identificationAlpha}`,
    ];
    return must.filter((s) => !t.includes(s)).map((s) => `missing "${s}"`);
  },
  mcp,
  (frag) => frag.replace(`flagged at ${facts.recallThreshold}`, "flagged at 0.99"),
);
gate(
  "values: every dimension's default item count appears in the floor table",
  (frag) => {
    const sec = frag.slice(frag.indexOf('id="mcp-floor"'), frag.indexOf('id="mcp-refuses"'));
    const rows = [...sec.matchAll(/<tr><th[^>]*>([A-Z]+) · [^<]*<\/th><td[^>]*>(\d+)<\/td>/g)].map((m) => [m[1], Number(m[2])]);
    const problems = [];
    for (const [code, n] of Object.entries(facts.perDimensionDefaultItems)) {
      const row = rows.find((r) => r[0] === code);
      if (!row) problems.push(`row ${code} missing`);
      else if (row[1] !== n) problems.push(`${code}: ${row[1]} != ${n}`);
    }
    return problems;
  },
  mcp,
  (frag) => frag.replace(/(<th[^>]*>AWR · [^<]*<\/th><td[^>]*>)\d+/, "$1999"),
);

// ---- M12: separation statement verbatim, when present ---------------------------------------
if (hasSeparation) {
  gate(
    "M12 separationStatement rendered verbatim in #mcp-not",
    (frag) => {
      const m = frag.match(/<blockquote[^>]*data-separation-statement=""[^>]*>([\s\S]*?)<\/blockquote>/);
      if (!m) return ["#mcp-not blockquote missing"];
      const norm = (s) => s.replace(/\s+/g, " ").trim();
      return norm(textOf(m[1])) === norm(facts.separationStatement) ? [] : ["rendered statement differs from facts"];
    },
    mcp,
    (frag) => frag.replace(/(<blockquote[^>]*data-separation-statement=""[^>]*>)/, "$1Altered. "),
  );
} else {
  console.log("  note M12: facts has no separationStatement; asserting the #mcp-not block is not rendered");
  gate(
    "M12 absent statement renders no #mcp-not block",
    (frag) => (frag.includes('id="mcp-not"') ? ["#mcp-not rendered without a statement"] : []),
    mcp,
    (frag) => frag + '<div id="mcp-not"></div>',
  );
}

console.log(`\ntest-mcp-pages: ${passes} passed, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
