#!/usr/bin/env node
/**
 * rasterize-logo.mjs
 *
 * Rasterizes the "Ascending Band Arc" mark into:
 *   - site/public/logo.png            (512×512, opaque navy #0b1220 background)
 *   - site/src/app/apple-icon.png     (180×180, opaque navy #0b1220 background)
 *
 * Usage (from site/ directory):
 *   node scripts/rasterize-logo.mjs
 *
 * Requires @resvg/resvg-js (optional dep in package.json).
 * Run manually once and commit the generated PNGs.
 *
 * Geometry: 5-segment ascending arc, lower-left (Critical/red) → upper-right
 * (Exemplary/cyan). Total sweep 150°, start 210°, end 60°, CCW in screen.
 * 4 gaps of 3.5° between the 5 segments. cx=24, cy=28, r=18 in 48×48 space.
 */

import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = join(__dirname, "..");

// Band colors low→high (Critical → Exemplary), matching dimensions.ts BANDS.
const BAND_COLORS = [
  "#f87171", // Critical
  "#fb923c", // Developing
  "#fcd34d", // Functional
  "#86efac", // Established
  "#7dd3fc", // Exemplary
];

// Convert polar math angle (degrees, 0°=right, CCW) to SVG coordinates.
function polarToSvg(angleDeg, r, cx, cy) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  };
}

// Build a single SVG arc path (sweep-flag=0, CCW in screen, large-arc-flag=0).
function arcPath(startAngle, endAngle, r, cx, cy) {
  const start = polarToSvg(startAngle, r, cx, cy);
  const end = polarToSvg(endAngle, r, cx, cy);
  return `M${start.x.toFixed(3)},${start.y.toFixed(3)} A${r.toFixed(3)},${r.toFixed(3)} 0 0 0 ${end.x.toFixed(3)},${end.y.toFixed(3)}`;
}

/**
 * Build an SVG string for the Ascending Band Arc mark on a dark background.
 * @param {number} size — output canvas size in px (both width and height)
 */
function buildSvg(size) {
  // The mark lives in a 48×48 coordinate space.
  // We want ~12% padding on each side → mark occupies 76% of `size`.
  const markSize = size * 0.76;
  const padding = (size - markSize) / 2;
  // Scale factor from 48×48 viewBox to markSize.
  const scale = markSize / 48;

  // Arc parameters (48×48 space → scaled).
  const cx = padding + 24 * scale;
  const cy = padding + 28 * scale;
  const r = 18 * scale;

  // 5 segments, 4 gaps of 3.5° each, 150° total sweep.
  const numSegments = 5;
  const gapDeg = 3.5;
  const totalSweep = 150;
  const segSweep = (totalSweep - gapDeg * (numSegments - 1)) / numSegments; // ~27.2°
  const startAngle = 210;

  const paths = BAND_COLORS.map((color, i) => {
    const segStart = startAngle - i * (segSweep + gapDeg);
    const segEnd = segStart - segSweep;
    const sw = 5 * scale;
    return `  <path d="${arcPath(segStart, segEnd, r, cx, cy)}" stroke="${color}" stroke-width="${sw.toFixed(3)}" stroke-linecap="round" fill="none"/>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
  <rect width="${size}" height="${size}" fill="#0b1220"/>
${paths}
</svg>`;
}

async function rasterize(svgString, outputPath, size) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: "width", value: size },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, pngBuffer);
  console.log(`  Written: ${outputPath} (${pngBuffer.length} bytes)`);
}

async function main() {
  console.log("Rasterizing Ascending Band Arc logo...");

  // 512×512 for schema.org Organization.logo + social.
  const svg512 = buildSvg(512);
  await rasterize(svg512, join(siteDir, "public", "logo.png"), 512);

  // 180×180 for apple-touch-icon (opaque background required by spec).
  const svg180 = buildSvg(180);
  await rasterize(svg180, join(siteDir, "src", "app", "apple-icon.png"), 180);

  console.log("Done.");
}

main().catch((err) => {
  console.error("rasterize-logo failed:", err);
  process.exit(1);
});
