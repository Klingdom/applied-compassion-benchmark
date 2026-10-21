#!/usr/bin/env node
/**
 * test-markdown-lite.mjs -- pins the behaviour of scripts/lib/markdown-lite.mjs, the renderer extracted from
 * build-special-briefings.mjs (docs/ARCHITECTURE_AI_MODEL_WATCH.md decision A4, build item 1).
 *
 * The renderer is shared by special briefings (whose committed JSON must regenerate byte-identically) and Insights posts, so its
 * output is pinned to golden strings. A change to the renderer that alters any construct fails here and must be paired with a
 * regeneration of site/src/data/special-briefings (git diff must be empty) before it can land.
 *
 * Also checks that build-special-briefings.mjs imports the shared module and no longer carries its own copy.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { escHtml, renderInline, renderTable, mdToHtml } from "./lib/markdown-lite.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
let passed = 0;
let failed = 0;
const eq = (label, got, want) => {
  if (got === want) { passed += 1; console.log(`  PASS  ${label}`); } else { failed += 1; console.error(`  FAIL  ${label}\n    want: ${JSON.stringify(want)}\n    got:  ${JSON.stringify(got)}`); }
};
const ok = (label, cond) => eq(label, !!cond, true);

eq("escHtml escapes & < > and double quotes", escHtml('a & <b> "c"'), "a &amp; &lt;b&gt; &quot;c&quot;");
eq("renderInline: bold, italic, code", renderInline("**b** and *i* and `c`"), "<strong>b</strong> and <em>i</em> and <code>c</code>");
eq("renderInline: link opens in a new tab", renderInline("[t](https://example.com/x)"), '<a href="https://example.com/x" target="_blank" rel="noopener noreferrer">t</a>');
eq("renderInline: raw HTML is escaped before markup", renderInline("<script>alert(1)</script> **x**"), "&lt;script&gt;alert(1)&lt;/script&gt; <strong>x</strong>");
eq("heading offset: ## with offset 1 is h3", mdToHtml("## Title", 1), "<h3>Title</h3>");
eq("heading offset 0: ## is h2", mdToHtml("## Title", 0), "<h2>Title</h2>");
eq("heading level is capped at 6", mdToHtml("#### Deep", 5), "<h6>Deep</h6>");
eq("paragraphs, one per non-blank line", mdToHtml("First line.\n\nSecond line."), "<p>First line.</p>\n<p>Second line.</p>");
eq("unordered list", mdToHtml("- a\n- b"), "<ul>\n<li>a</li>\n<li>b</li>\n</ul>");
eq("ordered list", mdToHtml("1. a\n2. b"), "<ol>\n<li>a</li>\n<li>b</li>\n</ol>");
eq("blockquote", mdToHtml("> quoted **x**"), "<blockquote><p>quoted <strong>x</strong></p></blockquote>");
eq("horizontal rule", mdToHtml("---"), "<hr>");
eq("fenced code is dropped", mdToHtml("before\n\n```\ncode here\n```\n\nafter"), "<p>before</p>\n<p>after</p>");
eq("pipe table (header cells th, separator skipped)", mdToHtml("| a | b |\n|---|---|\n| 1 | 2 |"),
  "<div class='sb-table-wrap'><table>\n<tr><th>a</th><th>b</th></tr>\n<tr><td>1</td><td>2</td></tr>\n</table></div>");
eq("renderTable matches mdToHtml for the same rows", renderTable(["| a |", "|---|", "| 1 |"]), "<div class='sb-table-wrap'><table>\n<tr><th>a</th></tr>\n<tr><td>1</td></tr>\n</table></div>");
eq("a list ends at a blank line and a paragraph follows", mdToHtml("- a\n\ntext"), "<ul>\n<li>a</li>\n</ul>\n<p>text</p>");
eq("tokens such as {{X}} pass through untouched", mdToHtml("Count: {{DIMENSION_COUNT}}."), "<p>Count: {{DIMENSION_COUNT}}.</p>");
eq("two tokens with underscores in one paragraph survive intact (H1)", mdToHtml("We break that into {{DIMENSION_COUNT}} dimensions and {{SUBDIMENSION_COUNT}} subdimensions."), "<p>We break that into {{DIMENSION_COUNT}} dimensions and {{SUBDIMENSION_COUNT}} subdimensions.</p>");
eq("real _italic_ still works next to tokens", renderInline("{{A_B}} is _real_ and {{C_D}}"), "{{A_B}} is <em>real</em> and {{C_D}}");
eq("real _italic_ still works without tokens", renderInline("an _emphasised_ word"), "an <em>emphasised</em> word");
eq("a token inside bold is kept intact", renderInline("**{{X_Y}} total**"), "<strong>{{X_Y}} total</strong>");
eq("citation markers [1] are left for the post renderer", mdToHtml("Claim [1]."), "<p>Claim [1].</p>");

const briefings = readFileSync(join(HERE, "build-special-briefings.mjs"), "utf8");
ok("build-special-briefings.mjs imports the shared renderer", /from "\.\/lib\/markdown-lite\.mjs"/.test(briefings));
const INLINED = /^function (escHtml|renderInline|renderTable|mdToHtml)\b/m;
ok("negative control: the detector flags a planted re-inlined renderer", INLINED.test("const x = 1;\nfunction mdToHtml(markdown) {\n  return markdown;\n}\n"));
ok("negative control: the detector ignores an import of the shared module", !INLINED.test('import { mdToHtml } from "./lib/markdown-lite.mjs";'));
ok("build-special-briefings.mjs no longer carries its own copy", !INLINED.test(briefings));

console.log(`\ntest-markdown-lite: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
