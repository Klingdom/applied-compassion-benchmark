// lib/paths.mjs
//
// Central path resolution for cb-probe. Every other module that needs to know
// "where is the repo" or "where is the task bank" imports from here, so there
// is exactly one place that encodes the relative position of this package
// inside applied-compassion-benchmark.
//
// No network, no child_process. Pure path arithmetic over import.meta.url.

import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import path from "node:path";

// This file lives at tools/cb-probe/lib/paths.mjs.
// Repo root is three directories up: lib -> cb-probe -> tools -> <repo root>.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PACKAGE_ROOT = path.resolve(__dirname, "..");
export const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

export const TASK_BANK_PATH = path.resolve(
  REPO_ROOT,
  "site",
  "src",
  "data",
  "model-benchmark",
  "tasks-v1.json"
);

// This package's own version, read from ITS OWN package.json (resolved
// relative to this module, same as every other path here -- never a copied
// or hand-typed string), so every artifact can record which cb-probe build
// produced it (provenance, alongside the task bank's own bankVersion).
export const PACKAGE_JSON_PATH = path.resolve(PACKAGE_ROOT, "package.json");
export const PACKAGE_VERSION = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf8")).version;
