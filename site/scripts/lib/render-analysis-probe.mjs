/**
 * render-analysis-probe.mjs -- renders the methodology page's AnalysisSection to static HTML on stdout.
 *
 * The section reads the published waves through process.cwd() (src/data/model-benchmark/{waves,reports}), so a test can point it at a
 * scratch directory that holds a copy of the waves and a stub narrative for a wave that has none yet, and see how the section describes
 * that wave without writing anything into the repository. Tests only.
 */
import { register, createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..", "..");
register(pathToFileURL(join(HERE, "tsx-render-loader.mjs")).href);
const req = createRequire(join(SITE, "package.json"));
const React = req("react");
const { renderToStaticMarkup } = req("react-dom/server");
const Analysis = (await import("@/components/model-benchmark/AnalysisSection.tsx")).default;
process.stdout.write(renderToStaticMarkup(React.createElement(Analysis)));
