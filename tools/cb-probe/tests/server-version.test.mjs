// tests/server-version.test.mjs
//
// `initialize` must report the version the package actually is. lib/rpc-handler.mjs used to
// hard-code "0.1.0" while package.json had moved on to 0.3.0, so every host was told a version
// that no release had. The version is now read from package.json, which sits one level above
// lib/ in the repository and in the packed tarball alike.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { handleMessage } from "../lib/rpc-handler.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PKG = JSON.parse(readFileSync(path.join(HERE, "..", "package.json"), "utf8"));

test("initialize returns package.json's version as serverInfo.version", () => {
  const response = handleMessage({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }, {});
  assert.equal(response.result.serverInfo.name, "cb-probe");
  assert.equal(typeof PKG.version, "string");
  assert.equal(response.result.serverInfo.version, PKG.version);
});

test("the packed layout keeps package.json one level above lib/ (npm always packs package.json)", () => {
  // npm always includes package.json in a tarball regardless of the "files" field. This pins the
  // layout the runtime read depends on: lib/ is a top-level directory shipped next to it.
  assert.ok(PKG.files.includes("lib/"), "lib/ must be shipped so rpc-handler.mjs and package.json stay siblings-of-parent");
});
