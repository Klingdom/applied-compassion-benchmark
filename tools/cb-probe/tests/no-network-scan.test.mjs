// tests/no-network-scan.test.mjs
//
// A no-network scan of cb-probe's own source: fetch(, http, https, net, and
// child_process must not appear outside comments in bin/ or lib/. This is
// the mechanical proof that the "zero network I/O" claim in the README and
// every tool description is true, not aspirational.

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["bin", "lib"];

function listSourceFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listSourceFiles(full));
    } else if (entry.endsWith(".mjs")) {
      out.push(full);
    }
  }
  return out;
}

/** Strip /* ... *\/ block comments, then // line comments, conservatively. */
function stripComments(source) {
  const noBlockComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  return noBlockComments
    .split("\n")
    .map((line) => {
      const idx = line.indexOf("//");
      return idx === -1 ? line : line.slice(0, idx);
    })
    .join("\n");
}

const FORBIDDEN_PATTERNS = [
  { name: "fetch(", re: /\bfetch\s*\(/ },
  { name: "child_process", re: /child_process/ },
  { name: "node:http import/require", re: /(from\s+|require\(\s*)['"]node:?http['"]/ },
  { name: "node:https import/require", re: /(from\s+|require\(\s*)['"]node:?https['"]/ },
  { name: "node:net import/require", re: /(from\s+|require\(\s*)['"]node:?net['"]/ },
  { name: "node:dgram import/require", re: /(from\s+|require\(\s*)['"]node:?dgram['"]/ },
  { name: "node:tls import/require", re: /(from\s+|require\(\s*)['"]node:?tls['"]/ },
];

test("bin/ and lib/ contain no fetch, http, https, net, or child_process outside comments", () => {
  const files = SCAN_DIRS.flatMap((dir) => listSourceFiles(path.join(PACKAGE_ROOT, dir)));
  assert.ok(files.length > 0, "expected to find source files to scan");

  const violations = [];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const codeOnly = stripComments(source);
    for (const { name, re } of FORBIDDEN_PATTERNS) {
      if (re.test(codeOnly)) {
        violations.push(`${path.relative(PACKAGE_ROOT, file)}: contains forbidden token "${name}"`);
      }
    }
  }

  assert.deepEqual(violations, [], `network-capable code found:\n${violations.join("\n")}`);
});

test("package.json declares zero dependencies", () => {
  const pkg = JSON.parse(readFileSync(path.join(PACKAGE_ROOT, "package.json"), "utf8"));
  assert.deepEqual(pkg.dependencies ?? {}, {});
});
