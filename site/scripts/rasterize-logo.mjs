#!/usr/bin/env node
/**
 * rasterize-logo.mjs
 *
 * One-shot script to rasterize the Calibrated Arc SVG into:
 *   - site/public/logo.png            (512×512, dark #0b1220 background)
 *   - site/src/app/apple-icon.png     (180×180, opaque dark background)
 *
 * Usage (from site/ directory):
 *   node scripts/rasterize-logo.mjs
 *
 * Requires @resvg/resvg-js (already an optional dep in package.json).
 * Run manually once and commit the generated PNGs.
 */

import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = join(__dirname, "..");

// ---------------------------------------------------------------------------
// SVG source: Calibrated Arc mark on a dark background square.
// Uses fixed hex colors so the PNG reads on both light and dark surfaces.
// Padding: ~12% of the square (so the mark occupies ~76% of the canvas).
// ---------------------------------------------------------------------------
function buildSvg(size) {
  // The mark lives in a 36×36 coordinate space. We want ~12% padding on each
  // side, so the mark occupies 76% of `size`.
  const markSize = size * 0.76;
  const padding = (size - markSize) / 2;
  // Scale factor from 36×36 viewBox to markSize
  const scale = markSize / 36;

  // Arc center in mark-space: cx=18, cy=22 → scaled
  const cx = padding + 18 * scale;
  const cy = padding + 22 * scale;
  const arcR = 14 * scale;

  // Arc path endpoints
  const arcX1 = padding + 4 * scale;
  const arcY = padding + 22 * scale;
  const arcX2 = padding + 32 * scale;

  // Tick helper
  function tickCoords(angleDeg, outerR, innerR) {
    const radTrig = ((180 - angleDeg) * Math.PI) / 180;
    const x1 = cx + outerR * Math.cos(radTrig);
    const y1 = cy - outerR * Math.sin(radTrig);
    const x2 = cx + innerR * Math.cos(radTrig);
    const y2 = cy - innerR * Math.sin(radTrig);
    return { x1, y1, x2, y2 };
  }

  const shortInner = arcR - 3 * scale;
  const longInner = arcR - 6 * scale;
  const tickAngles = [0, 30, 60, 90, 120, 150, 180];

  const ticks = tickAngles.map((angleDeg) => {
    const isMidpoint = angleDeg === 90;
    const innerR = isMidpoint ? longInner : shortInner;
    const { x1, y1, x2, y2 } = tickCoords(angleDeg, arcR, innerR);
    const sw = isMidpoint ? 2 * scale : 1.5 * scale;
    return `<line x1="${x1.toFixed(3)}" y1="${y1.toFixed(3)}" x2="${x2.toFixed(3)}" y2="${y2.toFixed(3)}" stroke="url(#g)" stroke-width="${sw.toFixed(3)}" stroke-linecap="round"/>`;
  }).join("\n  ");

  const strokeWidth = 2.5 * scale;
  const dotR = 2.5 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
  <rect width="${size}" height="${size}" fill="#0b1220"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <path d="M${arcX1.toFixed(3)},${arcY.toFixed(3)} A${arcR.toFixed(3)},${arcR.toFixed(3)} 0 0 1 ${arcX2.toFixed(3)},${arcY.toFixed(3)}" stroke="url(#g)" stroke-width="${strokeWidth.toFixed(3)}" stroke-linecap="round"/>
  ${ticks}
  <circle cx="${cx.toFixed(3)}" cy="${cy.toFixed(3)}" r="${dotR.toFixed(3)}" fill="url(#g)"/>
</svg>`;
}

async function rasterize(svgString, outputPath, size) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: "width", value: size },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  // Ensure output directory exists
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, pngBuffer);
  console.log(`  Written: ${outputPath} (${pngBuffer.length} bytes)`);
}

async function main() {
  console.log("Rasterizing Calibrated Arc logo...");

  // 512×512 for schema.org Organization.logo + social
  const svg512 = buildSvg(512);
  await rasterize(svg512, join(siteDir, "public", "logo.png"), 512);

  // 180×180 for apple-touch-icon (opaque background required)
  const svg180 = buildSvg(180);
  await rasterize(svg180, join(siteDir, "src", "app", "apple-icon.png"), 180);

  console.log("Done.");
}

main().catch((err) => {
  console.error("rasterize-logo failed:", err);
  process.exit(1);
});
