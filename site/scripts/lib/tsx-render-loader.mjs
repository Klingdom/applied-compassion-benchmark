/**
 * tsx-render-loader.mjs -- a module-customisation hook that lets plain Node import and RENDER the site's
 * .ts/.tsx modules (the pilot figures, the status banner, the /ai-models card) without a bundler.
 *
 *   register(pathToFileURL(".../tsx-render-loader.mjs"))     // once, before the first import
 *   const figs = await import("@/components/model-benchmark/pilot/PilotFigures.tsx");
 *
 * "@/x" resolves to site/src/x, extensionless relative imports probe .tsx/.ts/.json, `next/link` style
 * specifiers get ".js" (Next ships CommonJS), and TypeScript's own transpiler turns .ts/.tsx into ESM with the
 * automatic JSX runtime. It exists for tests only: the production build is `next build`, which this does not replace.
 * Types are erased, not checked (`npx tsc --noEmit` checks them).
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ts = createRequire(join(SITE, "package.json"))("typescript");
const isFile = (p) => existsSync(p) && statSync(p).isFile();

export async function resolve(specifier, context, next) {
  let target = null;
  if (specifier.startsWith("@/")) target = join(SITE, "src", specifier.slice(2));
  else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) target = join(dirname(fileURLToPath(context.parentURL)), specifier);
  if (target) {
    for (const ext of ["", ".tsx", ".ts", ".json", "/index.tsx", "/index.ts"]) {
      const p = target + ext;
      if (isFile(p)) return { url: pathToFileURL(p).href, shortCircuit: true };
    }
  }
  if (/^next\/[a-z-]+$/.test(specifier)) return next(`${specifier}.js`, context);
  return next(specifier, context);
}

export async function load(url, context, next) {
  if (url.startsWith("file:") && /\.(tsx|ts)$/.test(url)) {
    const file = fileURLToPath(url);
    const out = ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: file,
    });
    return { format: "module", source: out.outputText, shortCircuit: true };
  }
  if (url.startsWith("file:") && url.endsWith(".json")) return { format: "module", source: `export default ${readFileSync(fileURLToPath(url), "utf8")};`, shortCircuit: true };
  return next(url, context);
}
