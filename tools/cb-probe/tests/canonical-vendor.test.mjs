// tests/canonical-vendor.test.mjs
//
// cb-probe's central claim is that its composite comes from the same function
// that scores every published country and company — imported, not
// reimplemented. Publishing to npm requires shipping a copy of that function,
// and a copy can drift. These tests make drift a failing build rather than a
// silent falsehood.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import {
  VENDORED_MODULES,
  sourcePathFor,
  vendorPathFor,
  splitVendored,
} from "../scripts/vendor-canonical.mjs";

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const PKG = path.resolve(HERE, "..");

test("every vendored module is byte-identical to its source", () => {
  assert.ok(VENDORED_MODULES.length >= 3, "the vendor list should not be empty — a vacuous pass proves nothing");

  for (const name of VENDORED_MODULES) {
    const src = sourcePathFor(name);
    const dest = vendorPathFor(name);
    assert.ok(existsSync(src), `source missing: ${name}`);
    assert.ok(existsSync(dest), `vendored copy missing: lib/vendor/${name} — run scripts/vendor-canonical.mjs`);

    const { body } = splitVendored(readFileSync(dest, "utf8"));
    const source = readFileSync(src, "utf8");
    assert.equal(
      body,
      source,
      `lib/vendor/${name} has DRIFTED from site/scripts/lib/${name}. The published package would score ` +
        `differently from the site. Run: node tools/cb-probe/scripts/vendor-canonical.mjs`
    );
  }
});

test("the vendored copy carries a do-not-edit header naming its source", () => {
  for (const name of VENDORED_MODULES) {
    const { header } = splitVendored(readFileSync(vendorPathFor(name), "utf8"));
    assert.match(header, /GENERATED FILE — DO NOT EDIT/);
    assert.ok(header.includes(`site/scripts/lib/${name}`), `${name}: header does not name its source`);
  }
});

test("both canonical surfaces export exactly the same names", async () => {
  const repoSurface = await import("../lib/canonical.mjs");
  const publishedPath = path.join(PKG, "lib", "canonical.published.mjs");
  assert.ok(existsSync(publishedPath), "lib/canonical.published.mjs missing — run scripts/vendor-canonical.mjs");
  const publishedSurface = await import(`file://${publishedPath}`);

  const a = Object.keys(repoSurface).sort();
  const b = Object.keys(publishedSurface).sort();
  assert.deepEqual(
    b,
    a,
    "the published canonical surface exports different names from the repo one, so the package would break " +
      "on an import that works here"
  );
  assert.ok(a.includes("computeCompositeFromDimensions"), "the scorer itself must be exported");
  assert.ok(a.includes("DIMENSIONS_MAP"), "the dimension canon must be exported");
});

test("the two surfaces compute the SAME composite, not merely the same names", async () => {
  const repoSurface = await import("../lib/canonical.mjs");
  const publishedSurface = await import(`file://${path.join(PKG, "lib", "canonical.published.mjs")}`);

  // Several shapes, including an uneven one and one that triggers the weakness
  // factor, so agreement is not an artifact of one easy input.
  const cases = [
    Object.fromEntries(repoSurface.DIMENSION_CODES.map((c) => [c, 4])),
    Object.fromEntries(repoSurface.DIMENSION_CODES.map((c, i) => [c, 1 + (i % 5)])),
    Object.fromEntries(repoSurface.DIMENSION_CODES.map((c, i) => [c, i === 0 ? 2 : 4.5])),
    Object.fromEntries(repoSurface.DIMENSION_CODES.map((c) => [c, 5])),
  ];

  for (const dims of cases) {
    const here = repoSurface.computeCompositeFromDimensions(dims);
    const there = publishedSurface.computeCompositeFromDimensions(dims);
    assert.deepEqual(
      there,
      here,
      `the published scorer disagrees with the repo scorer on ${JSON.stringify(dims)} — ` +
        `a published score would not match a site score`
    );
  }
});

test("no module outside canonical.mjs reaches across the package boundary", () => {
  // The whole point of canonical.mjs is that exactly one file knows the path.
  // If a second one appears, packing breaks in a way tests would not otherwise
  // catch, because in-repo everything resolves fine.
  const dirs = ["lib", "bin", "tests", "scripts"];
  const offenders = [];
  for (const dir of dirs) {
    const full = path.join(PKG, dir);
    if (!existsSync(full)) continue;
    for (const entry of readdirRecursive(full)) {
      if (!/\.mjs$/.test(entry)) continue;
      const rel = path.relative(PKG, entry).replace(/\\/g, "/");
      if (rel === "lib/canonical.mjs" || rel === "scripts/vendor-canonical.mjs") continue;
      const text = readFileSync(entry, "utf8");
      if (/from ["']\.\.\/\.\.\/\.\.\/site\//.test(text)) offenders.push(rel);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `these files import across the package boundary directly instead of via lib/canonical.mjs, so the ` +
      `published package would break: ${offenders.join(", ")}`
  );
});

function readdirRecursive(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...readdirRecursive(full));
    else out.push(full);
  }
  return out;
}

test("lib/canonical.mjs still imports the REAL modules, not the vendored copies", () => {
  // Safety net for a failed `postpack`. If a pack is interrupted, canonical.mjs
  // can be left as the published variant reading lib/vendor/ — and because the
  // vendored copies are byte-identical, every other test would still pass while
  // the repository silently scored through a copy. This fails loudly instead.
  const text = readFileSync(path.join(PKG, "lib", "canonical.mjs"), "utf8");
  assert.match(
    text,
    /from "\.\.\/\.\.\/\.\.\/site\/scripts\/lib\/scoring\.mjs"/,
    "lib/canonical.mjs is not importing the real scorer — a pack may have been interrupted. " +
      "Restore it from lib/canonical.repo.bak or from git."
  );
  assert.ok(
    !/from "\.\/vendor\//.test(text),
    "lib/canonical.mjs is reading the vendored copies. In the repository it must import the real modules."
  );
  assert.ok(!existsSync(path.join(PKG, "canonical.repo.bak")), "a leftover canonical.repo.bak means postpack did not run");
});

test("the task bank is vendored and byte-identical — without it the package cannot start", async () => {
  const { VENDORED_DATA, dataSourcePathFor, dataVendorPathFor } = await import("../scripts/vendor-canonical.mjs");
  assert.ok(VENDORED_DATA.length >= 1, "the task bank must be vendored; it IS the instrument");
  for (const entry of VENDORED_DATA) {
    const src = dataSourcePathFor(entry);
    const dest = dataVendorPathFor(entry);
    assert.ok(existsSync(dest), `lib/vendor/${entry.to} missing — run scripts/vendor-canonical.mjs`);
    assert.equal(
      readFileSync(dest, "utf8"),
      readFileSync(src, "utf8"),
      `lib/vendor/${entry.to} has DRIFTED. A published package would serve different items from the site.`
    );
  }
});

test("inside the repository the REAL bank is used, never the vendored copy", async () => {
  const { TASK_BANK_PATH, USING_VENDORED_BANK } = await import("../lib/paths.mjs");
  assert.equal(USING_VENDORED_BANK, false, "the repo must read the live bank, not a copy");
  assert.ok(TASK_BANK_PATH.includes("site"), `expected the site bank, got ${TASK_BANK_PATH}`);
});
