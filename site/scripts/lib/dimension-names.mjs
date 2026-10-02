/**
 * dimension-names.mjs -- display names of the dimensions (EMP -> "Empathy"),
 * read from src/data/dimensions.ts by pattern.
 *
 * Plain text, not an import: the Docker build runs Node 20, which cannot load
 * TypeScript, and build-model-reports.mjs runs in prebuild there. Used only so a
 * "lowest" claim can name a dimension in words and still be checked against the
 * wave. If nothing is found the compiler falls back to dimension codes.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function readDimensionNames() {
  const text = readFileSync(join(SITE, "src", "data", "dimensions.ts"), "utf8");
  const out = {};
  for (const m of text.matchAll(/code:\s*"([A-Z]{3})",\s*name:\s*"([^"]+)"/g)) out[m[1]] = m[2];
  return out;
}
