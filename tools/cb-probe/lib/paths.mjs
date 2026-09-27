// lib/paths.mjs
//
// Central path resolution for cb-probe. Every other module that needs to know
// "where is the repo" or "where is the task bank" imports from here, so there
// is exactly one place that encodes the relative position of this package
// inside applied-compassion-benchmark.
//
// No network, no child_process. Pure path arithmetic over import.meta.url.

import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

// This file lives at tools/cb-probe/lib/paths.mjs.
// Repo root is three directories up: lib -> cb-probe -> tools -> <repo root>.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PACKAGE_ROOT = path.resolve(__dirname, "..");
export const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

// The task bank. Inside the repository this resolves to the real, live file —
// so our own runs and the website can never disagree about what the bank says.
//
// A published npm package has no repository above it, so the bank is also
// vendored into lib/vendor/ at pack time and used as the fallback. Without
// that, `npm i cb-probe` installs a server that cannot start: the bank IS the
// instrument. Verified by a standalone smoke test that extracts the tarball and
// boots the server with no repo anywhere in the path.
//
// Repo first, always: the fallback only engages when the real file is absent,
// and tests/canonical-vendor.test.mjs asserts the vendored copy is
// byte-identical to the source, so the two cannot silently diverge.
const REPO_TASK_BANK = path.resolve(REPO_ROOT, "site", "src", "data", "model-benchmark", "tasks-v1.json");
const VENDORED_TASK_BANK = path.resolve(PACKAGE_ROOT, "lib", "vendor", "tasks-v1.json");

export const TASK_BANK_PATH = existsSync(REPO_TASK_BANK) ? REPO_TASK_BANK : VENDORED_TASK_BANK;

/** True when running from a published package rather than the repository. */
export const USING_VENDORED_BANK = TASK_BANK_PATH === VENDORED_TASK_BANK;

// This package's own version, read from ITS OWN package.json (resolved
// relative to this module, same as every other path here -- never a copied
// or hand-typed string), so every artifact can record which cb-probe build
// produced it (provenance, alongside the task bank's own bankVersion).
export const PACKAGE_JSON_PATH = path.resolve(PACKAGE_ROOT, "package.json");
export const PACKAGE_VERSION = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf8")).version;
