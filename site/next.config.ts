import type { NextConfig } from "next";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderableEntries } from "./scripts/lib/pilot-render-gate.mjs";

/**
 * The unofficial pilot report route lives in `page.pilot.tsx`, which Next only
 * treats as a page when "pilot.tsx" is a page extension. It is added exactly
 * when at least one wave renders (pilot-render-gate.mjs: ratified, or the local
 * CB_PREVIEW_PILOT_REPORTS=1 founder preview). In the default build the route
 * does not exist at all, so no /ai-models/reports/** HTML can be emitted
 * (an empty generateStaticParams is rejected by `output: "export"`, so the
 * route cannot simply render nothing).
 */
const manifestPath = join(process.cwd(), "src", "data", "model-benchmark", "waves", "manifest.json");
const manifest: Parameters<typeof renderableEntries>[0] = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : [];
const pilotRoutes = renderableEntries(manifest).length > 0;

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  pageExtensions: pilotRoutes ? ["tsx", "ts", "jsx", "js", "pilot.tsx"] : ["tsx", "ts", "jsx", "js"],
};

export default nextConfig;
