/**
 * ts-alias-loader.mjs -- lets plain Node import a site/src TypeScript module.
 *
 * The wave exporter and the isolation gate must read the SAME numbers the
 * pages read (MODEL_INDEX_FACTS), not a second implementation of them. That
 * module is TypeScript, imports through the "@/" alias and imports JSON
 * without an import attribute, none of which bare Node accepts. This hook
 * resolves "@/x" to site/src/x (probing .ts, .json, /index.ts) and serves
 * JSON as an ES module. Types are stripped by Node itself.
 *
 * Usage:  import { importSiteModule } from "./ts-alias-loader.mjs";
 *         const { MODEL_INDEX_FACTS } = await importSiteModule("src/lib/model-index-facts.ts");
 */
import { register } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
export const SITE_ROOT = join(HERE, "..", "..");

let registered = false;
function ensureRegistered() {
  if (registered) return;
  const hooks = "data:text/javascript," + encodeURIComponent(HOOKS_SOURCE);
  register(hooks, import.meta.url, { data: { srcRoot: pathToFileURL(join(SITE_ROOT, "src") + "/").href } });
  registered = true;
}

const HOOKS_SOURCE = `
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
let srcRoot = "";
export async function initialize(data) { srcRoot = data.srcRoot; }
export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const base = new URL(specifier.slice(2), srcRoot);
    for (const ext of ["", ".ts", ".tsx", ".json", "/index.ts"]) {
      const candidate = base.href + ext;
      const p = fileURLToPath(candidate);
      if (existsSync(p) && !p.endsWith("/") ) {
        try { if (readFileSync(p, "utf8") !== undefined) return { url: candidate, shortCircuit: true }; } catch { /* directory */ }
      }
    }
    throw new Error("ts-alias-loader: cannot resolve " + specifier);
  }
  return next(specifier, context);
}
export async function load(url, context, next) {
  if (url.endsWith(".json") && url.startsWith("file:")) {
    const text = readFileSync(fileURLToPath(url), "utf8");
    return { format: "module", source: "export default " + text + ";", shortCircuit: true };
  }
  return next(url, context);
}
`;

/** Import a module under site/ (path relative to site/), with the "@/" alias active. */
export async function importSiteModule(relPath, cacheBust = "") {
  ensureRegistered();
  const url = pathToFileURL(join(SITE_ROOT, relPath)).href + (cacheBust ? `?${cacheBust}` : "");
  try {
    return await import(url);
  } catch (e) {
    if (e?.code === "ERR_UNKNOWN_FILE_EXTENSION") throw new Error(`${relPath}: this Node cannot load TypeScript (needs Node 22.18 or newer, or --experimental-strip-types). The Docker build image (Node 20) must not call importSiteModule; ${e.message}`);
    throw e;
  }
}
