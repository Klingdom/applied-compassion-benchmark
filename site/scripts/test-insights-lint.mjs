#!/usr/bin/env node
/**
 * test-insights-lint.mjs -- tests for scripts/lib/insights-lint.mjs, build-insights.mjs and lint-insights.mjs.
 *
 * Every lint rule IL-1..IL-8 gets a PLANTED PROBE that must trip exactly that rule; a clean fixture post must pass (so a lint that
 * rejects everything cannot pass); the model matcher is checked to be non-empty (a gate that examined nothing proves nothing);
 * the CLIs are run in a scratch site tree (fail-closed, idempotent, FACT_CHECK files skipped, absent research/ exits 0).
 * Fixtures are synthetic ("Alpha One" is a fictional model).
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parsePostSource, buildPost, lintPost, renderPostHtml, claimLedgerOf, buildInsightsManifest, isPostCandidate, makeModelMatcher,
  manifestProblems, allowListProblems, INSIGHT_TOKENS, sentencesOf, splitSentences,
} from "./lib/insights-lint.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
let passed = 0;
let failed = 0;
const ok = (label, cond, detail = "") => {
  if (cond) { passed += 1; console.log(`  PASS  ${label}`); } else { failed += 1; console.error(`  FAIL  ${label}${detail ? `: ${detail}` : ""}`); }
};
const has = (arr, sub) => arr.some((s) => s.includes(sub));
const trips = (label, problems, rule) => ok(`NC ${label} trips ${rule}`, has(problems, `${rule}:`), `got: ${problems.join(" | ").slice(0, 260) || "nothing"}`);
const section = (t) => console.log(`\n${t}`);

const NOW = new Date("2026-10-16T12:00:00Z");
const matcher = makeModelMatcher({ catalogRows: [{ name: "Alpha One", family: "Alpha" }, { name: "Zeta Open", family: null }] });

const FM = (over = {}) => {
  const f = { title: "A clean fixture post", dek: "A short dek that states no figure.", date: "2026-10-16", audience: "both", tags: "[fixtures, testing]", readingMinutes: "1", ...over };
  return `---\ntitle: ${f.title}\ndek: ${f.dek}\ndate: ${f.date}\naudience: ${f.audience}\ntags: ${f.tags}\nreadingMinutes: ${f.readingMinutes}\n---\n`;
};
const BODY = [
  "This opening paragraph states no figure at all. A cited claim follows [1]. A repo-derived claim follows: {{DIMENSION_COUNT}} dimensions exist.",
  "",
  "## A section",
  "",
  "- A list item that mentions D-29a and the date 2026-10-16.",
  "- Another item with a link to [the methodology](/ai-models/methodology) and to [a source](https://example.com/b) [2].",
  "",
  "Plain closing words.",
].join("\n");
const SOURCES = ["## Sources", "1. Fixture Source One — Example Publisher, 2025-01-02. https://example.com/a", "2. Fixture Source Two — Another Publisher, 2024-05-06. https://example.com/b"].join("\n");

const source = ({ fm = {}, body = BODY, sources = SOURCES, tail = "" } = {}) => `${FM(fm)}\n${body}\n\n${sources}\n${tail}`;
const compile = (md, slug = "clean-fixture") => {
  const parsed = parsePostSource(md, slug);
  return { parsed, post: parsed.fm ? buildPost(slug, parsed, { generatedAt: "2026-10-16T00:00:00.000Z" }) : null };
};
const lintMd = (md, ctx = {}) => {
  const { parsed, post } = compile(md);
  return [...parsed.errors, ...(post ? lintPost(post, { now: NOW, matcher, ...ctx }) : [])];
};

section("positive controls");
{
  const f = lintMd(source());
  ok("the clean fixture post parses and lints with zero findings", f.length === 0, f.join(" | "));
  ok("the model matcher is non-empty (the IL-5 gate examines something)", matcher.formCount >= 3 && matcher.mentions("Alpha One shipped").length === 1);
  const { post } = compile(source());
  ok("html: [n] becomes a superscript anchor to #src-n", post.html.includes('<sup><a href="#src-1" aria-label="Source 1">[1]</a></sup>'));
  ok("html: tokens are left as {{X}} for the page to substitute", post.html.includes("{{DIMENSION_COUNT}}"));
  ok("html: root-relative links stay in the same tab, https links open new", post.html.includes('<a href="/ai-models/methodology">') && post.html.includes('href="https://example.com/b" target="_blank"'));
  const led = compile(source({ body: `${BODY}

There are 17 widgets in the warehouse [1].` })).post.claimLedger;
  ok("claim ledger lists digit/token sentences with their citations and tokens (markers alone are not figures)", led.some((c) => c.tokens.includes("DIMENSION_COUNT")) && led.some((c) => c.sentence.startsWith("There are 17") && c.citations.join() === "1") && !led.some((c) => c.sentence.startsWith("This opening paragraph") && c.tokens.length === 0 && !/d/.test(c.sentence)));
  ok("sources parse into {n, title, publisher, date, url}", post.sources.length === 2 && post.sources[0].publisher === "Example Publisher" && post.sources[0].date === "2025-01-02");
  ok("generatedAt, tags and fields are carried over", post.tags.join() === "fixtures,testing" && post.generatedAt.startsWith("2026-10-16"));
  const m = buildInsightsManifest([post, { ...post, slug: "older", date: "2026-10-01", corrections: [{ date: "2026-10-05", text: "x" }] }]);
  ok("manifest is newest-first with lastCorrected", m.posts[0].slug === "clean-fixture" && m.posts[1].lastCorrected === "2026-10-05" && m.posts[0].lastCorrected === null);
  ok("manifestProblems accepts the derived manifest and rejects a stale one", manifestProblems(m, [post, { ...post, slug: "older", date: "2026-10-01", corrections: [{ date: "2026-10-05", text: "x" }] }]).length === 0 && manifestProblems({ posts: [] }, [post]).length === 1);
}

section("post candidates (FACT_CHECK and non-post files are skipped)");
{
  ok("a slug-named file with front matter is a candidate", isPostCandidate("good-post.md", "---\ntitle: x\n---\nbody"));
  ok("FACT_CHECK_2026-10-16.md is skipped", !isPostCandidate("FACT_CHECK_2026-10-16.md", "---\ntitle: x\n---\n"));
  ok("a file with no front matter is skipped", !isPostCandidate("notes.md", "# Notes\nno front matter"));
  ok("a non-slug filename is skipped", !isPostCandidate("Bad_Name.md", "---\ntitle: x\n---\n"));
  ok("a non-markdown file is skipped", !isPostCandidate("lint-allow.json", "---\n"));
}

section("IL-1 frontmatter");
{
  trips("front matter keys out of order", lintMd(source().replace("title: A clean fixture post\ndek: A short dek that states no figure.", "dek: A short dek that states no figure.\ntitle: A clean fixture post")), "IL-1");
  trips("a missing key (no readingMinutes)", lintMd(source().replace("readingMinutes: 1\n", "")), "IL-1");
  trips("an extra key", lintMd(source().replace("readingMinutes: 1\n", "readingMinutes: 1\nauthor: x\n")), "IL-1");
  trips("an audience outside the enum", lintMd(source({ fm: { audience: "everyone" } })), "IL-1");
  trips("a two-value audience", lintMd(source({ fm: { audience: "ai-labs, agent-builders" } })), "IL-1");
  trips("a future date", lintMd(source({ fm: { date: "2027-01-01" } })), "IL-1");
  trips("a non-ISO date", lintMd(source({ fm: { date: "16 Oct 2026" } })), "IL-1");
  trips("a non-kebab tag", lintMd(source({ fm: { tags: "[Not Kebab, ok]" } })), "IL-1");
  trips("readingMinutes far from ceil(words/230)", lintMd(source({ fm: { readingMinutes: "9" } })), "IL-1");
  ok("readingMinutes within 1 of the estimate passes", lintMd(source({ fm: { readingMinutes: "2" } })).length === 0);
  trips("a body with no front matter block", parsePostSource("just text\n\n## Sources\n", "x").errors, "IL-1");
  trips("an invalid slug", parsePostSource(source(), "Bad Slug").errors, "IL-1");
}

section("IL-2 citations and numbering");
{
  trips("a citation [3] with only two sources", lintMd(source({ body: BODY.replace("[2]", "[3]") })), "IL-2");
  trips("a source that is never cited", lintMd(source({ body: BODY.replace(" [2]", "") })), "IL-2");
  trips("duplicate source URLs", lintMd(source({ sources: SOURCES.replace("https://example.com/b", "https://example.com/a") })), "IL-2");
  trips("sources numbered 1 and 3", lintMd(source({ sources: SOURCES.replace("2. Fixture Source Two", "3. Fixture Source Two"), body: BODY.replace("[2]", "[3]") })), "IL-2");
  trips("no Sources section at all", parsePostSource(`${FM()}\n${BODY}\n`, "x").errors, "IL-2");
  ok("a citation inside a fenced code block is not counted", lintMd(source({ body: `${BODY}\n\n\`\`\`\n[9]\n\`\`\`` })).length === 0);
}

section("IL-3 Sources and Corrections lines");
{
  for (const d of ["2025", "2025-01", "2025-01-02"]) ok(`a Sources date of ${d} is accepted`, lintMd(source({ sources: SOURCES.replace("2025-01-02", d) })).length === 0, lintMd(source({ sources: SOURCES.replace("2025-01-02", d) })).join(" | "));
  for (const d of ["2025-13", "2025-00", "Oct 2025", "2025-02-30", "25", "2025-1", "2025-01-02 (last updated)"]) trips(`a malformed Sources date "${d}"`, lintMd(source({ sources: SOURCES.replace("2025-01-02", d) })), "IL-3");
  ok("a title with commas and parentheses parses intact", (() => { const t = "Article 5, Prohibited Practices, Regulation (EU) 2024/1689"; const r = parsePostSource(source({ sources: SOURCES.replace("Fixture Source One", t) }), "x"); return r.errors.length === 0 && r.sources[0].title === t && r.sources[0].publisher === "Example Publisher" && r.sources[0].date === "2025-01-02"; })());
  ok("a precision-year source keeps its date as written", parsePostSource(source({ sources: SOURCES.replace("2025-01-02", "2025") }), "x").sources[0].date === "2025");
  trips("a Sources line with the URL in angle brackets", lintMd(source({ sources: SOURCES.replace("https://example.com/a", "<https://example.com/a>") })), "IL-3");
  trips("a Sources line with an http URL", lintMd(source({ sources: SOURCES.replace("https://example.com/a", "http://example.com/a") })), "IL-3");
  trips("a Sources line missing the em dash publisher", lintMd(source({ sources: SOURCES.replace(" — Example Publisher", ", Example Publisher") })), "IL-3");
  trips("a source title containing an em dash", lintMd(source({ sources: SOURCES.replace("Fixture Source One", "Fixture — Source One") })), "IL-3");
  trips("a malformed Corrections line", lintMd(source({ tail: "\n## Corrections\n- yesterday: fixed" })), "IL-3");
  ok("a well-formed Corrections section parses (append-only order)", lintMd(source({ tail: "\n## Corrections\n- 2026-10-17: Fixed a link.\n- 2026-10-18: Another fix." }), { now: new Date("2026-10-30T00:00:00Z") }).length === 0);
  trips("Corrections out of date order", (() => { const { post } = compile(source({ tail: "\n## Corrections\n- 2026-10-18: a.\n- 2026-10-17: b." })); return lintPost(post, { now: NOW, matcher }); })(), "IL-3");
}

section("IL-4 digits need a citation or a token");
{
  trips("an uncited digit sentence", lintMd(source({ body: `${BODY}\n\nThere are 17 widgets in the warehouse.` })), "IL-4");
  trips("a digit in a heading", lintMd(source({ body: `${BODY}\n\n## The 8 dimensions` })), "IL-4");
  trips("a digit in a table cell", lintMd(source({ body: `${BODY}\n\n| a | b |\n|---|---|\n| 17 widgets | text |` })), "IL-4");
  trips("a digit in a list item", lintMd(source({ body: `${BODY}\n\n- Seventeen is 17.` })), "IL-4");
  ok("a digit sentence with a [n] marker passes", lintMd(source({ body: `${BODY}\n\nThere are 17 widgets in the warehouse [1].` })).length === 0);
  ok("a digit sentence with a {{TOKEN}} passes", lintMd(source({ body: `${BODY}\n\nWe score {{SCORED_ENTITY_COUNT}} entities.` })).length === 0);
  ok("a marker placed after the full stop still counts", lintMd(source({ body: `${BODY}\n\nThere are 17 widgets in the warehouse. [1]` })).length === 0);
  ok("an ISO date, a decision id and a list ordinal are not figures", lintMd(source({ body: `${BODY}\n\nDecision D-29a was recorded on 2026-10-16.\n\n1. First ordinal item.\n2. Second ordinal item.` })).length === 0);
  const allow = [{ slug: "clean-fixture", sentencePrefix: "There are 17 widgets", reason: "Fixture exemption for the test." }];
  ok("an exemption in lint-allow.json clears exactly that sentence", lintMd(source({ body: `${BODY}\n\nThere are 17 widgets in the warehouse.` }), { allow }).length === 0);
  trips("an exemption for another slug does not apply", lintMd(source({ body: `${BODY}\n\nThere are 17 widgets in the warehouse.` }), { allow: [{ ...allow[0], slug: "other" }] }), "IL-4");
  trips("an exemption prefix that does not match does not apply", lintMd(source({ body: `${BODY}\n\nThere are 18 widgets in the warehouse.` }), { allow }), "IL-4");
  ok("a malformed allow-list entry is rejected (reason is mandatory)", allowListProblems([{ slug: "x", sentencePrefix: "short" }]).length === 1 && allowListProblems(allow).length === 0);
  ok("splitSentences keeps decimals together", splitSentences("Version 5.5 shipped. Next sentence here.").length === 2);
  ok("sentencesOf drops fenced code", sentencesOf("Real sentence.\n\n```\nCode 123.\n```").length === 1);
}

section("IL-5 model mentions and ranking language");
{
  const withBody = (s) => source({ body: `${BODY}\n\n${s}` });
  trips("'best' beside a model name", lintMd(withBody("Alpha One is the best assistant for this.")), "IL-5");
  trips("'leaderboard' beside a model name", lintMd(withBody("Alpha One tops the leaderboard.")), "IL-5");
  trips("'beats' beside a model name", lintMd(withBody("Zeta Open beats the others.")), "IL-5");
  trips("'ranked' within 60 characters after the model name", lintMd(withBody("Alpha One was ranked by an outside group.")), "IL-5");
  ok("a negated ranking phrase passes ('not a ranking')", lintMd(withBody("This is not a ranking and Alpha One is only listed.")).length === 0);
  ok("a ranking word more than 60 characters from the model passes", lintMd(withBody("Alpha One is listed alphabetically in a long table of providers and their models, and separately the best practice for reading it is to check sources.")).length === 0);
  ok("a ranking word with no model in the sentence passes", lintMd(withBody("The best way to read a model card is to start with the limits.")).length === 0);
  trips("a band name in a sentence that names a model", lintMd(withBody("Alpha One was labelled Critical by the provider.")), "IL-5");
  ok("lowercase 'critical' is not a band name", lintMd(withBody("Alpha One had a critical bug fix.")).length === 0);
  trips("endorsement language in a sentence that names a model", lintMd(withBody("Alpha One is a reliable choice.")), "IL-5");
  trips("'trusted' in a sentence that names a model", lintMd(withBody("Alpha One is trusted by many teams.")), "IL-5");
  const waveM = makeModelMatcher({ waves: [{ run_id: "w", subjects: { "gemma2-9b": {}, "llama3.2-3b": {} } }] });
  ok("wave makeNaming forms are matched too", waveM.mentions("Gemma2 9B is fast").length === 1);
  const { post } = compile(withBody("Gemma2-9B is the best model."));
  trips("a wave model name beside 'best'", lintPost(post, { now: NOW, matcher: waveM }), "IL-5");
}

section("IL-6 efficacy and revenue claims need a citation");
{
  const withBody = (s) => source({ body: `${BODY}\n\n${s}` });
  trips("'raises revenue' uncited", lintMd(withBody("Compassion-first design raises revenue for every team.")), "IL-6");
  trips("'retention' uncited", lintMd(withBody("Teams see better retention.")), "IL-6");
  trips("'proven' uncited", lintMd(withBody("The approach is proven.")), "IL-6");
  trips("'reduces harm' uncited", lintMd(withBody("This reduces harm in practice.")), "IL-6");
  ok("the same claim with a citation passes", lintMd(withBody("Compassion-first design raises revenue for teams [1].")).length === 0);
  ok("an allow-list entry exempts a disclaimer sentence", lintMd(withBody("We do not claim that this raises revenue."), { allow: [{ slug: "clean-fixture", sentencePrefix: "We do not claim that this", reason: "A disclaimer, not a claim." }] }).length === 0);
}

section("IL-7 links, tokens in title/dek, figures in the dek");
{
  const withBody = (s) => source({ body: `${BODY}\n\n${s}` });
  trips("an http:// link", lintMd(withBody("See [here](http://example.com/x).")), "IL-7");
  trips("a javascript: link", lintMd(withBody("See [here](javascript:alert(1)).")), "IL-7");
  trips("a protocol-relative link", lintMd(withBody("See [here](//evil.example/x).")), "IL-7");
  trips("a mailto link", lintMd(withBody("See [here](mailto:a@example.com).")), "IL-7");
  trips("a gumroad.com link", lintMd(withBody("Buy [it](https://example.gumroad.com/l/x).")), "IL-7");
  trips("a /score-watch link", lintMd(withBody("See [it](/score-watch).")), "IL-7");
  trips("a plain http:// URL in the text", lintMd(withBody("Visit http://example.com for more.")), "IL-7");
  trips("a token in the title", lintMd(source({ fm: { title: "All {{DIMENSION_COUNT}} dimensions" } })), "IL-7");
  trips("a token in the dek", lintMd(source({ fm: { dek: "Covers {{DIMENSION_COUNT}} things." } })), "IL-7");
  trips("a figure in the dek", lintMd(source({ fm: { dek: "A dek that mentions 8 things." } })), "IL-7");
  ok("https and root-relative links pass", lintMd(withBody("See [a](https://example.com/ok) and [b](/ai-labs).")).length === 0);
}

section("IL-8 unknown tokens and drift");
{
  trips("an unknown {{TOKEN}}", lintMd(source({ body: `${BODY}\n\nWe count {{ENTITY_TOTAL}} things.` })), "IL-8");
  trips("a lower-case token name", lintMd(source({ body: `${BODY}\n\nWe count {{entity_total}} things.` })), "IL-8");
  const { post } = compile(source());
  trips("html edited after compile (drift)", lintPost({ ...post, html: `${post.html}<p>injected</p>` }, { now: NOW, matcher }), "IL-8");
  trips("bodyMarkdown edited after compile (html no longer matches)", lintPost({ ...post, bodyMarkdown: `${post.bodyMarkdown}\n\nExtra words here.` }, { now: NOW, matcher }), "IL-8");
  ok("NC a mangled token in compiled html trips the brace-survival check", has(lintPost({ ...post, html: post.html.replace("{{DIMENSION_COUNT}}", "{{DIMENSION<em>COUNT}}") }, { now: NOW, matcher }), "still contains {{"));
  ok("a clean compiled html does not trip the brace-survival check", !has(lintPost(post, { now: NOW, matcher }), "still contains {{"));
  ok("two underscore tokens in one paragraph compile to intact tokens", renderPostHtml("Counts {{DIMENSION_COUNT}} and {{SUBDIMENSION_COUNT}} here.").includes("{{DIMENSION_COUNT}} and {{SUBDIMENSION_COUNT}}"));
  trips("claim ledger edited after compile", lintPost({ ...post, claimLedger: [] }, { now: NOW, matcher }), "IL-8");
  ok("every INSIGHT_TOKEN is accepted", INSIGHT_TOKENS.every((t) => lintMd(source({ body: `${BODY}\n\nWe use {{${t}}} here.` })).length === 0));
  ok("renderPostHtml escapes raw HTML", !renderPostHtml("A <script>alert(1)</script> tag.").includes("<script>"));
  ok("claimLedgerOf is deterministic", JSON.stringify(claimLedgerOf(post.bodyMarkdown)) === JSON.stringify(claimLedgerOf(post.bodyMarkdown)));
}

section("token list parity with src/lib/insights.ts");
{
  const ts = readFileSync(join(HERE, "..", "src", "lib", "insights.ts"), "utf8");
  const block = ts.slice(ts.indexOf("INSIGHT_TOKEN_VALUES"));
  const keys = [...block.slice(0, block.indexOf("};")).matchAll(/^\s+([A-Z_]+):/gm)].map((m) => m[1]);
  ok("insights.ts defines exactly the tokens the lint accepts", JSON.stringify([...keys].sort()) === JSON.stringify([...INSIGHT_TOKENS].sort()), keys.join(","));
}

section("CLIs in a scratch tree");
{
  const tmp = mkdtempSync(join(tmpdir(), "cb-ins-"));
  try {
    const site = join(tmp, "site");
    const research = join(tmp, "research-insights");
    mkdirSync(join(site, "src", "data", "model-benchmark", "waves"), { recursive: true });
    mkdirSync(join(site, "src", "data", "model-watch"), { recursive: true });
    mkdirSync(research, { recursive: true });
    writeFileSync(join(site, "src", "data", "model-benchmark", "waves", "manifest.json"), "[]\n");
    writeFileSync(join(site, "src", "data", "model-watch", "catalog-v1.json"), JSON.stringify({ meta: {}, rows: [{ name: "Alpha One", family: "Alpha" }] }));
    const run = (script, args) => spawnSync(process.execPath, [join(HERE, script), "--site-dir", site, ...args], { encoding: "utf8" });
    const build = (extra = []) => run("build-insights.mjs", ["--research-dir", research, ...extra]);
    const outDir = join(site, "src", "data", "insights");

    writeFileSync(join(research, "clean-fixture.md"), source());
    writeFileSync(join(research, "FACT_CHECK_2026-10-16.md"), "# Fact check\n\nNot a post. It has 99 figures and no front matter.\n");
    writeFileSync(join(research, "notes.md"), "No front matter here either.\n");
    const b1 = build();
    ok("build-insights compiles the clean post and skips FACT_CHECK and non-post files", b1.status === 0 && existsSync(join(outDir, "clean-fixture.json")) && /\[skip\] FACT_CHECK/.test(b1.stdout) && /\[skip\] notes.md/.test(b1.stdout), b1.stderr + b1.stdout);
    const files1 = readdirSync(outDir).sort();
    ok("it wrote the post JSON and manifest.json only", files1.join() === "clean-fixture.json,manifest.json", files1.join());
    const bytes = readFileSync(join(outDir, "clean-fixture.json"), "utf8");
    const b2 = build();
    ok("a second build writes nothing (idempotent)", b2.status === 0 && / 0 file\(s\) written/.test(b2.stdout) && readFileSync(join(outDir, "clean-fixture.json"), "utf8") === bytes, b2.stdout);
    ok("build-insights --check passes on matching output", build(["--check"]).status === 0);
    const l1 = run("lint-insights.mjs", ["--require-posts"]);
    ok("lint-insights passes on the compiled post and reports it examined 1", l1.status === 0 && /1 post\(s\) examined/.test(l1.stdout) && /model name form\(s\) loaded/.test(l1.stdout), l1.stderr + l1.stdout);

    // fail closed
    writeFileSync(join(research, "bad-post.md"), source({ body: `${BODY}\n\nThere are 17 widgets in the warehouse.` }));
    const bad = build();
    ok("a post with a finding fails the build (exit 1) naming the rule", bad.status === 1 && /IL-4: bad-post/.test(bad.stderr), bad.stderr);
    ok("fail closed: the failing post is not published", !existsSync(join(outDir, "bad-post.json")));
    ok("fail closed: the existing manifest is untouched", JSON.parse(readFileSync(join(outDir, "manifest.json"), "utf8")).posts.length === 1);
    rmSync(join(research, "bad-post.md"));

    // planted corruption of the committed JSON
    const post = JSON.parse(bytes);
    writeFileSync(join(outDir, "clean-fixture.json"), JSON.stringify({ ...post, html: `${post.html}<p>x</p>` }, null, 2) + "\n");
    const l2 = run("lint-insights.mjs", []);
    ok("lint-insights catches a hand-edited committed post (IL-8 drift)", l2.status === 1 && /IL-8/.test(l2.stderr));
    ok("build-insights --check catches the same drift", build(["--check"]).status === 1);
    writeFileSync(join(outDir, "clean-fixture.json"), bytes);
    writeFileSync(join(outDir, "manifest.json"), JSON.stringify({ posts: [] }));
    ok("lint-insights catches a stale manifest", run("lint-insights.mjs", []).status === 1);
    build();
    ok("rebuilding restores a clean lint", run("lint-insights.mjs", ["--require-posts"]).status === 0);

    // planted lint-allow.json misuse
    writeFileSync(join(research, "lint-allow.json"), JSON.stringify([{ slug: "clean-fixture", sentencePrefix: "x", reason: "" }]));
    ok("a malformed lint-allow.json fails the build", build().status === 1);
    rmSync(join(research, "lint-allow.json"));

    // staging mode: --skip-unpublished
    writeFileSync(join(research, "draft-post.md"), source({ body: `${BODY}\n\nThere are 17 widgets in the warehouse.` }));
    const stage = build(["--skip-unpublished"]);
    ok("--skip-unpublished holds back a never-published failing post (exit 0, not written, named in a WARN)", stage.status === 0 && !existsSync(join(outDir, "draft-post.json")) && /NOT PUBLISHED: draft-post/.test(stage.stderr), stage.stderr);
    ok("... while the clean post stays published and the manifest lists only it", existsSync(join(outDir, "clean-fixture.json")) && JSON.parse(readFileSync(join(outDir, "manifest.json"), "utf8")).posts.map((p) => p.slug).join() === "clean-fixture");
    ok("strict mode (no flag) still fails on the same draft", build().status === 1);
    writeFileSync(join(research, "clean-fixture.md"), source({ body: `${BODY}\n\nThere are 17 widgets in the warehouse.` }));
    const regress = build(["--skip-unpublished"]);
    ok("--skip-unpublished still fails closed for an already-published post that regresses", regress.status === 1 && /IL-4: clean-fixture/.test(regress.stderr));
    ok("... and the published JSON is left untouched", readFileSync(join(outDir, "clean-fixture.json"), "utf8") === bytes);
    writeFileSync(join(research, "clean-fixture.md"), source());
    rmSync(join(research, "draft-post.md"));

    // absent research dir
    const absent = run("build-insights.mjs", ["--research-dir", join(tmp, "nope")]);
    ok("build-insights exits 0 without research/ and keeps the committed posts", absent.status === 0 && /Skipping regeneration/.test(absent.stdout) && existsSync(join(outDir, "clean-fixture.json")));

    // zero posts
    rmSync(join(outDir, "clean-fixture.json"));
    writeFileSync(join(outDir, "manifest.json"), JSON.stringify({ posts: [] }));
    const z1 = run("lint-insights.mjs", []);
    const z2 = run("lint-insights.mjs", ["--require-posts"]);
    ok("lint-insights with zero posts warns (exit 0) by default", z1.status === 0 && /no posts published yet/.test(z1.stderr));
    ok("lint-insights --require-posts fails when it examined nothing", z2.status === 1 && /examined nothing/.test(z2.stderr));
    rmSync(join(research, "clean-fixture.md"));
    const none = build();
    ok("build-insights fails when it examines no posts", none.status === 1 && /examined nothing/.test(none.stderr));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

section("committed posts");
{
  const run = spawnSync(process.execPath, [join(HERE, "lint-insights.mjs")], { encoding: "utf8" });
  ok("lint-insights passes on the committed site/src/data/insights", run.status === 0, run.stderr + run.stdout);
  ok("lint-insights reports what it examined", /post\(s\) examined/.test(run.stdout));
}

console.log(`\ntest-insights-lint: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
