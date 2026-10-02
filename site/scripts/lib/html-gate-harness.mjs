/**
 * html-gate-harness.mjs -- tiny shared harness for the built-tree HTML gates
 * (test-model-report-html, test-model-html-leak, test-model-report-seo).
 *
 * Every gate: (1) proves its rule on synthetic input with planted probes
 * (a clean page passes, each planted violation trips the SPECIFIC rule id),
 * (2) runs the rule over the real built tree in site/out when it exists, and
 * fails on zero (a scan that examined nothing proves nothing).
 *
 * `out/` is a build product. When it is absent the real-tree half prints SKIP and
 * exits 0 (the chain runs before a build); `--require-out` (used in the build
 * chain right after `next build`) makes absence a failure.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const SITE = join(HERE, "..", "..");
export const OUT_DIR = join(SITE, "out");
export const WAVES_DIR = join(SITE, "src", "data", "model-benchmark", "waves");
export const REQUIRE_OUT = process.argv.includes("--require-out");
/** Build-chain mode (Node 20 in Docker has no TypeScript stripping): skip the planted-probe controls, scan the real tree only. */
export const TREE_ONLY = process.argv.includes("--tree-only");

export function harness(name) {
  let passed = 0;
  const failures = [];
  const log = (s) => console.log(s);
  const check = async (label, fn) => {
    try { await fn(); passed += 1; log(`  ok   ${label}`); } catch (e) { failures.push(`${label}: ${e.message}`); log(`  FAIL ${label}: ${e.message}`); }
  };
  const assert = (c, m) => { if (!c) throw new Error(m); };
  /** A clean input yields no problems. */
  const clean = (label, problems) => check(label, () => assert(problems.length === 0, `expected no problems, got: ${problems.join(" | ").slice(0, 400)}`));
  /** A planted violation trips a problem whose text starts with / contains `rule`. */
  const trips = (label, problems, rule) => check(`NC ${label}`, () => assert(problems.some((p) => p.includes(rule)), `planted probe not caught (wanted ${rule}); got: ${problems.join(" | ").slice(0, 300) || "nothing"}`));
  const section = (t) => log(`\n${t}`);
  const finish = () => {
    log(`\n${name}: ${passed} passed, ${failures.length} failed`);
    if (failures.length) { log("\n" + failures.join("\n")); process.exit(1); }
  };
  return { check, assert, clean, trips, section, finish, log };
}

/** Returns true when the real tree can be scanned; prints SKIP (or fails) otherwise. */
export function haveOut(h) {
  if (existsSync(join(OUT_DIR, "ai-models.html"))) return true;
  if (REQUIRE_OUT) {
    h.check("site/out exists (--require-out)", () => { throw new Error("site/out/ai-models.html is absent; run the build first"); });
    return false;
  }
  h.log("  SKIP real-tree scan: site/out/ai-models.html not found (build first, or pass --require-out in the build chain)");
  return false;
}
