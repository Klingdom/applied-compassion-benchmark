#!/usr/bin/env node

/**
 * test-nginx-redirect-parity.mjs — guard for the LC-1a defect class.
 *
 * THE DEFECT. The Docker image bakes `nginx.conf` in at build time
 * (`Dockerfile`: `COPY nginx.conf /etc/nginx/conf.d/default.conf`), and CI
 * deploys with `docker compose up -d --build`. That means `nginx.conf` — not
 * `nginx-ssl.conf` — is the file production actually serves from on every CI
 * rebuild. `deploy.sh` separately does `docker compose cp nginx-ssl.conf
 * web:/etc/nginx/conf.d/default.conf` at runtime during a *manual* deploy,
 * which overwrites the shipped config in the running container — until the
 * next CI rebuild silently reverts it back to whatever `nginx.conf` says.
 *
 * The two files had drifted: as of 2026-09-17, `nginx-ssl.conf` carried 26
 * `rewrite` directives (25 `/robotics-lab/<legal-name>` slug corrections plus
 * `/us-state/georgia`) that `nginx.conf` did not. Any of those 26 legacy URLs
 * hit in production 404'd, because the CI-shipped config never carried the
 * redirect — no matter how many times someone "fixed" nginx-ssl.conf.
 *
 * WHAT THIS CHECKS
 *   1. Both files parse — every physical `rewrite` line must match the
 *      expected `rewrite <pattern> <target> <flag>;` shape, or the test
 *      fails loudly naming the file and line rather than silently skipping
 *      it.
 *   2. Non-vacuity — each file must contain at least one parsed rewrite.
 *      A parser that silently found zero directives (e.g. because someone
 *      changed the directive's leading whitespace or comment style) must
 *      fail the suite, not pass it vacuously. This repo already has one
 *      self-declared "VACUOUS PASS" (validate-product-separation.mjs); that
 *      is a bug to avoid repeating, not a pattern to copy.
 *   3. Superset — every (pattern, target) pair that exists in
 *      nginx-ssl.conf must also exist in nginx.conf, because nginx.conf is
 *      the file the image ships and production actually runs. A pair
 *      present only in nginx-ssl.conf is a redirect that works during a
 *      manual deploy and silently disappears on the next CI rebuild.
 *
 * Deliberately NOT checked: that nginx.conf has no *extra* rewrites beyond
 * nginx-ssl.conf (nginx.conf is allowed to be a strict superset), and the
 * exact `permanent`/`redirect` flag on each pair (the risk this guards
 * against is a missing redirect, not a wrong status code on a redirect that
 * exists in both).
 *
 * Run: node site/scripts/test-nginx-redirect-parity.mjs
 * Exit code 0 = pass, 1 = fail.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
// site/scripts -> site -> repo root
const REPO_ROOT = join(__dirname, "..", "..");
const NGINX_CONF_PATH = join(REPO_ROOT, "nginx.conf");
const NGINX_SSL_CONF_PATH = join(REPO_ROOT, "nginx-ssl.conf");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.log(`  FAIL: ${message}`);
  }
}

// A line is a candidate rewrite directive if, once comments and blank space
// are accounted for, it starts with the bare word "rewrite". This catches
// both real directives AND near-misses (e.g. the word "rewrite" appearing
// inside a prose comment), so we can tell the two apart explicitly instead
// of a regex silently skipping something that should have counted.
const REWRITE_LINE_RE = /^\s*rewrite\s+(\S+)\s+(\S+)\s+(\S+);\s*$/;
const REWRITE_WORD_RE = /^\s*rewrite\b/;

/**
 * Parses every `rewrite <pattern> <target> <flag>;` directive out of an
 * nginx config file. Throws (fails loudly) if a line starts with the bare
 * word "rewrite" but does not match the expected directive shape — e.g. a
 * comment mentioning "rewrite" that isn't prefixed with "#" for some reason,
 * or a directive whose syntax changed. This function must never silently
 * drop a line it doesn't understand.
 *
 * @param {string} filePath absolute path, used only for error messages
 * @returns {{pattern: string, target: string, flag: string, line: number}[]}
 */
function parseRewrites(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const rewrites = [];

  lines.forEach((rawLine, idx) => {
    const lineNo = idx + 1;
    const trimmed = rawLine.trim();

    // Real comment lines (start with #) never count, even if they mention
    // "rewrite" in prose (e.g. nginx.conf:62's "This rewrite moves...").
    if (trimmed.startsWith("#")) return;

    if (!REWRITE_WORD_RE.test(rawLine)) return;

    const match = rawLine.match(REWRITE_LINE_RE);
    if (!match) {
      throw new Error(
        `${filePath}:${lineNo}: line starts with "rewrite" but does not match ` +
          `the expected "rewrite <pattern> <target> <flag>;" shape: ${JSON.stringify(rawLine)}`
      );
    }

    const [, pattern, target, flag] = match;
    rewrites.push({ pattern, target, flag, line: lineNo });
  });

  return rewrites;
}

function pairKey(r) {
  return `${r.pattern} -> ${r.target}`;
}

// ─── Parse both files (fail loudly, not silently, on any parse error) ──────

console.log("\nParsing nginx.conf and nginx-ssl.conf...");

let shippedRewrites;
let sslRewrites;
let parseError = null;

try {
  shippedRewrites = parseRewrites(NGINX_CONF_PATH);
} catch (err) {
  parseError = err;
  shippedRewrites = [];
}

try {
  sslRewrites = parseRewrites(NGINX_SSL_CONF_PATH);
} catch (err) {
  parseError = parseError || err;
  sslRewrites = [];
}

assert(
  parseError === null,
  parseError ? `parse error: ${parseError.message}` : "parse error"
);

if (parseError) {
  // Cannot meaningfully continue — parsing is a prerequisite for every
  // other assertion below, and asserting against empty arrays would produce
  // misleading pass/fail noise on top of the real error.
  console.log(`\ntest-nginx-redirect-parity: ${passed} passed, ${failed} failed\n`);
  process.exit(1);
}

console.log(
  `  nginx.conf: ${shippedRewrites.length} rewrite directives`
);
console.log(
  `  nginx-ssl.conf: ${sslRewrites.length} rewrite directives`
);

// ─── Case 1: non-vacuity — neither file may parse to zero rewrites ─────────

console.log("\nCase 1: non-vacuity (parsed rewrite count must not be zero)");
assert(
  shippedRewrites.length > 0,
  `nginx.conf parsed to 0 rewrite directives — parser likely broken (VACUOUS PASS risk), not "no redirects configured"`
);
assert(
  sslRewrites.length > 0,
  `nginx-ssl.conf parsed to 0 rewrite directives — parser likely broken (VACUOUS PASS risk), not "no redirects configured"`
);

// ─── Case 2: superset — every ssl pair must exist in the shipped config ────

console.log(
  "Case 2: nginx.conf (shipped by the Docker image) is a superset of nginx-ssl.conf"
);
{
  const shippedPairs = new Set(shippedRewrites.map(pairKey));
  const missing = sslRewrites.filter((r) => !shippedPairs.has(pairKey(r)));

  assert(
    missing.length === 0,
    `${missing.length} rewrite(s) exist in nginx-ssl.conf but not in nginx.conf (the file the image ships) — ` +
      `these legacy URLs will 404 in production even though nginx-ssl.conf carries the redirect:\n` +
      missing.map((r) => `    nginx-ssl.conf:${r.line}: ${pairKey(r)}`).join("\n")
  );
}

// ─── Summary ─────────────────────────────────────────────────────────────

console.log(`\ntest-nginx-redirect-parity: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
