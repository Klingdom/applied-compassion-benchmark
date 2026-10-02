// tests/skill-copies.test.mjs
//
// The run-compassion-benchmark skill exists in three places: the repository's own .claude/skills
// copy (canonical), the copy shipped inside the npm package (skills/), and the copy bundled in
// plugins/compassion-benchmark/. The first two must stay byte-identical; the plugin copy must be
// the canonical text followed only by its trailing "Bundled copy" note. None may carry a typed bank
// figure or a claim that the composite floor is unreachable, because that rots the moment the bank
// changes (the old text said "23 items", "69 ratings" and "SYS and INT carry only 2" long after
// bank v2.0 made all three false; the plugin copy was missed by the first fix, claim audit S15).
// Every copy must also tell the host to supply identification_answers (claim audit B1), or the
// walkthrough produces a refused probe.
//
// Copies are DISCOVERED, not listed: the test walks the repository for every SKILL.md whose
// frontmatter says `name: run-compassion-benchmark`, so a fourth copy cannot be missed. A positive
// control proves the walker finds the three known copies.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(HERE, "..", "..", "..");
const REPO_COPY = path.join(REPO_ROOT, ".claude", "skills", "run-compassion-benchmark", "SKILL.md");
const PACKAGE_COPY = path.join(HERE, "..", "skills", "run-compassion-benchmark", "SKILL.md");
const PLUGIN_COPY = path.join(REPO_ROOT, "plugins", "compassion-benchmark", "skills", "run-compassion-benchmark", "SKILL.md");

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "out", ".preflight"]);

export function findSkillCopies(root) {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = path.join(dir, entry);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(full);
      else if (entry === "SKILL.md" && /^name:\s*run-compassion-benchmark\s*$/m.test(readFileSync(full, "utf8"))) found.push(full);
    }
  };
  walk(root);
  return found.sort();
}

const STALE = [
  [/\b23 (non-sensitive|items)/i, "a typed item count"],
  [/\b69 (ratings|trials)|69-(rating|trial)/i, "a typed rating count"],
  [/not reachable|unreachable|never clear/i, "a claim that the composite floor is unreachable"],
  [/carry only 2 non-sensitive/i, "the old SYS/INT item count"],
  [/will NOT produce a composite/i, "the old 'will not produce a composite' claim"],
];

export function staleClaimsIn(text) {
  return STALE.filter(([re]) => re.test(text)).map(([, what]) => what);
}

const norm = (p) => path.resolve(p).toLowerCase();

test("positive control: the discovery walk finds the three known copies (and no others unexpectedly)", () => {
  const found = findSkillCopies(REPO_ROOT).map(norm);
  for (const known of [REPO_COPY, PACKAGE_COPY, PLUGIN_COPY]) {
    assert.ok(found.includes(norm(known)), "discovery walk missed a known copy: " + known);
  }
  assert.deepEqual(
    found.filter((f) => ![REPO_COPY, PACKAGE_COPY, PLUGIN_COPY].map(norm).includes(f)),
    [],
    "a new copy of the skill exists; give it the same checks (add it above)"
  );
});

test("the repo and package copies of the run-compassion-benchmark skill are byte-identical", () => {
  assert.equal(readFileSync(REPO_COPY, "utf8"), readFileSync(PACKAGE_COPY, "utf8"));
});

test("the plugin copy is the canonical text followed only by its 'Bundled copy' note", () => {
  const canonical = readFileSync(REPO_COPY, "utf8");
  const plugin = readFileSync(PLUGIN_COPY, "utf8");
  assert.ok(plugin.startsWith(canonical), "plugin copy body differs from the canonical skill; re-copy it");
  const tail = plugin.slice(canonical.length);
  assert.match(tail, /^\s*---\s*\*\*Bundled copy\.\*\*/, "only the trailing Bundled copy note may follow the canonical text");
});

test("no discovered skill copy carries a typed bank count or an unreachable-floor claim", () => {
  for (const file of findSkillCopies(REPO_ROOT)) {
    assert.deepEqual(staleClaimsIn(readFileSync(file, "utf8")), [], file);
  }
});

test("every discovered skill copy tells the host to supply identification_answers", () => {
  const copies = findSkillCopies(REPO_ROOT);
  assert.ok(copies.length >= 3, "positive control: expected at least the three known copies");
  for (const file of copies) {
    const text = readFileSync(file, "utf8");
    assert.match(text, /identification_answers/, file + " never mentions identification_answers");
    assert.match(text, /run_exposure_probe\(\{ run_id, recall_attempts: \[\.\.\.\], identification_answers: \[\.\.\.\] \}\)/, file + " step 2 must show both fields in one call");
  }
});

test("positive control: the detector fires on the stale text the skill used to carry", () => {
  const old =
    "covers all 8 dimensions x 23 non-sensitive scorable items x 3 trials = 69 ratings. SYS and INT carry only 2 non-sensitive scorable items; a composite is not reachable at all today. A run will NOT produce a composite";
  assert.equal(staleClaimsIn(old).length, STALE.length);
});
