#!/usr/bin/env node
/**
 * build-og-images.mjs — Wave H2, Item #8
 *
 * Generates 1200×630 OG card PNGs for:
 *   - Special Briefings: site/public/og/special-<slug>.png
 *   - Daily Briefings:   site/public/og/updates-<date>.png
 *
 * Card design: dark-theme background, "COMPASSION BENCHMARK" eyebrow,
 * title, dek/date, small geometric own-data motif (no third-party imagery).
 *
 * SAFETY RULES (must never break the Docker build):
 *   - All imports in optionalDependencies — wrapped in try/catch.
 *   - Font path checked at startup — missing font → warn + exit(0).
 *   - Any render error → console.warn + continue to next card (never throw).
 *   - process.exit(0) on any fatal skip condition.
 *
 * Font: Inter OFL — site/assets/fonts/Inter-Regular.ttf + Inter-Bold.ttf
 *
 * Run via: node site/scripts/build-og-images.mjs
 * Wired into npm run prebuild after build-special-briefings.mjs.
 */

import { readFileSync, mkdirSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SITE_ROOT = join(__dirname, "..");
const FONT_DIR = join(SITE_ROOT, "assets", "fonts");
const OUT_DIR = join(SITE_ROOT, "public", "og");
const DATA_DIR = join(SITE_ROOT, "src", "data");
const SPECIAL_DIR = join(DATA_DIR, "special-briefings");
const UPDATES_MANIFEST = join(DATA_DIR, "updates", "manifest.json");
const DAILY_DIR = join(DATA_DIR, "updates", "daily");

const OG_W = 1200;
const OG_H = 630;

// ─── 1. Load optional dependencies ──────────────────────────────────────────

let satori;
let Resvg;

try {
  const satoriMod = await import("satori");
  satori = satoriMod.default ?? satoriMod.satori ?? satoriMod;
} catch (e) {
  console.warn("[build-og-images] satori not available (optionalDependency):", e.message);
  console.warn("[build-og-images] Skipping OG image generation. Install satori if you want OG images locally.");
  process.exit(0);
}

try {
  const resvgMod = await import("@resvg/resvg-js");
  Resvg = resvgMod.Resvg ?? resvgMod.default?.Resvg;
} catch (e) {
  console.warn("[build-og-images] @resvg/resvg-js not available (optionalDependency):", e.message);
  console.warn("[build-og-images] Skipping OG image generation.");
  process.exit(0);
}

if (typeof satori !== "function") {
  console.warn("[build-og-images] satori import resolved but is not a function — skipping.");
  process.exit(0);
}
if (typeof Resvg !== "function") {
  console.warn("[build-og-images] Resvg import resolved but is not a constructor — skipping.");
  process.exit(0);
}

// ─── 2. Load fonts ───────────────────────────────────────────────────────────

const fontRegularPath = join(FONT_DIR, "Inter-Regular.ttf");
const fontBoldPath = join(FONT_DIR, "Inter-Bold.ttf");

if (!existsSync(fontRegularPath) || !existsSync(fontBoldPath)) {
  console.warn(
    `[build-og-images] Font file(s) missing in ${FONT_DIR}.\n` +
    `  Expected: Inter-Regular.ttf + Inter-Bold.ttf (OFL from rsms/inter).\n` +
    `  Skipping OG generation — committed PNGs remain available.`,
  );
  process.exit(0);
}

let fontRegular;
let fontBold;
try {
  fontRegular = readFileSync(fontRegularPath);
  fontBold = readFileSync(fontBoldPath);
} catch (e) {
  console.warn("[build-og-images] Failed to read font files:", e.message, "— skipping.");
  process.exit(0);
}

const fonts = [
  { name: "Inter", data: fontRegular, weight: 400, style: "normal" },
  { name: "Inter", data: fontBold,    weight: 700, style: "normal" },
];

// ─── 3. Ensure output directory exists ───────────────────────────────────────

try {
  mkdirSync(OUT_DIR, { recursive: true });
} catch (e) {
  console.warn("[build-og-images] Could not create output dir:", e.message, "— skipping.");
  process.exit(0);
}

// ─── 4. Card renderer ────────────────────────────────────────────────────────

/**
 * Truncate text to maxChars, appending "…" if needed.
 */
function trunc(text, maxChars) {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + "…";
}

/**
 * Render a single OG card to a PNG Buffer.
 *
 * Uses React.createElement-style element descriptors for satori.
 * All layout must use display:flex (satori constraint).
 * Leaf nodes must NOT have children:[].
 *
 * @param {object} opts
 * @param {string} opts.title      — main headline
 * @param {string} opts.dek        — subtitle / dek line
 * @param {string} opts.label      — eyebrow label (e.g. "Special Briefing")
 * @param {string} opts.date       — formatted date string
 * @returns {Promise<Buffer|null>}
 */
async function renderCard({ title, dek, label, date }) {
  // Background: dark gradient matching the site's globals.css body gradient.
  // Accent: rgba(125,211,252,…) — the site's --color-accent / --color-band-cyan.
  // All visual elements are geometric primitives — no third-party imagery.

  const titleText = trunc(title, 80);
  const dekText   = trunc(dek,   160);

  // Band bar motif: 5 colored bars (own-data visual motif, no external imagery)
  const BAND_BARS = [
    { color: "#f87171", h: 18 },
    { color: "#fb923c", h: 26 },
    { color: "#fcd34d", h: 34 },
    { color: "#86efac", h: 26 },
    { color: "#7dd3fc", h: 20 },
  ];

  // Build the element tree using plain objects (satori's React.createElement format).
  // Rule: every container div needs display:flex. Leaf divs/spans omit children key.
  const element = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "row",
        width: OG_W,
        height: OG_H,
        background: "linear-gradient(160deg, #0d1629 0%, #0b1220 60%, #09101d 100%)",
        fontFamily: "Inter",
      },
      children: [
        // Left accent bar (narrow vertical strip)
        {
          type: "div",
          props: {
            style: {
              width: 6,
              height: OG_H,
              background: "rgba(125,211,252,0.5)",
              flexShrink: 0,
            },
          },
        },
        // Main content column
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "60px 72px 60px 72px",
              justifyContent: "space-between",
            },
            children: [
              // ── Row 1: Eyebrow / label row ──
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "row", alignItems: "center", gap: 12 },
                  children: [
                    {
                      type: "span",
                      props: {
                        style: {
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: 3,
                          color: "#7dd3fc",
                        },
                        children: "COMPASSION BENCHMARK",
                      },
                    },
                    {
                      type: "span",
                      props: {
                        style: { color: "rgba(125,211,252,0.4)", fontSize: 13, fontWeight: 400 },
                        children: "·",
                      },
                    },
                    {
                      type: "span",
                      props: {
                        style: {
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: 2,
                          color: "rgba(184,198,222,0.65)",
                        },
                        children: label,
                      },
                    },
                  ],
                },
              },
              // ── Row 2: Title + dek ──
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    maxWidth: 960,
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: titleText.length > 55 ? 38 : 46,
                          fontWeight: 700,
                          color: "#e8eefb",
                          lineHeight: 1.08,
                          letterSpacing: -1,
                        },
                        children: titleText,
                      },
                    },
                    ...(dekText
                      ? [
                          {
                            type: "div",
                            props: {
                              style: {
                                fontSize: 22,
                                color: "#b8c6de",
                                lineHeight: 1.45,
                                maxWidth: 820,
                                fontWeight: 400,
                              },
                              children: dekText,
                            },
                          },
                        ]
                      : []),
                  ],
                },
              },
              // ── Row 3: Date + band bar motif ──
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                  },
                  children: [
                    // Date label
                    {
                      type: "span",
                      props: {
                        style: {
                          fontSize: 14,
                          color: "rgba(184,198,222,0.55)",
                          fontWeight: 400,
                          letterSpacing: 0.5,
                        },
                        children: date,
                      },
                    },
                    // Band bar motif (5 colored rectangles)
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexDirection: "row",
                          gap: 5,
                          alignItems: "flex-end",
                        },
                        children: BAND_BARS.map(({ color, h }) => ({
                          type: "div",
                          props: {
                            style: {
                              width: 8,
                              height: h,
                              borderRadius: 3,
                              background: color,
                              opacity: 0.7,
                            },
                          },
                        })),
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };

  try {
    const svg = await satori(element, {
      width: OG_W,
      height: OG_H,
      fonts,
    });

    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: OG_W },
    });
    const pngData = resvg.render();
    return Buffer.from(pngData.asPng());
  } catch (e) {
    console.warn("  [render-error]", e.message);
    return null; // Caller handles null → skips this card
  }
}

// ─── 5. Generate special briefing cards ──────────────────────────────────────

let specialCount = 0;
let specialSkipped = 0;

try {
  const manifestPath = join(SPECIAL_DIR, "manifest.json");
  if (!existsSync(manifestPath)) {
    console.warn("[build-og-images] Special briefings manifest not found — skipping special cards.");
  } else {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const briefings = manifest.briefings ?? [];

    for (const b of briefings) {
      const outPath = join(OUT_DIR, `special-${b.slug}.png`);
      try {
        const dateLabel = (() => {
          const m = b.date?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (!m) return b.date ?? "";
          const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
          return d.toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
          });
        })();

        const png = await renderCard({
          title: b.title ?? "",
          dek:   b.dek ?? "",
          label: "Special Briefing",
          date:  dateLabel,
        });

        if (!png) {
          console.warn(`  [skip] special-${b.slug} — render returned null`);
          specialSkipped++;
          continue;
        }

        writeFileSync(outPath, png);
        console.log(`  [ok] special-${b.slug}.png (${png.length} bytes)`);
        specialCount++;
      } catch (e) {
        console.warn(`  [skip] special-${b.slug} — error: ${e.message}`);
        specialSkipped++;
      }
    }
  }
} catch (e) {
  console.warn("[build-og-images] Error processing special briefings:", e.message);
}

// ─── 6. Generate daily briefing cards ────────────────────────────────────────

let dailyCount = 0;
let dailySkipped = 0;

try {
  if (!existsSync(UPDATES_MANIFEST)) {
    console.warn("[build-og-images] Updates manifest not found — skipping daily cards.");
  } else {
    const updatesManifest = JSON.parse(readFileSync(UPDATES_MANIFEST, "utf8"));
    // Bound OG-card generation to the recent window (manifest.recent); the full
    // archive isn't regenerated every build, keeping build time + PNG churn bounded.
    const dates = updatesManifest.recent ?? updatesManifest.dates ?? [];

    for (const date of dates) {
      const outPath = join(OUT_DIR, `updates-${date}.png`);
      try {
        // Load daily data for a richer card title
        const dailyPath = join(DAILY_DIR, `${date}.json`);
        let title = `Compassion Benchmark — ${date}`;
        let dek = "";

        if (existsSync(dailyPath)) {
          try {
            const daily = JSON.parse(readFileSync(dailyPath, "utf8"));
            const leadHeadline =
              daily?.scoreChanges?.[0]?.headline ??
              daily?.topSignals?.[0]?.title ??
              daily?.headline ??
              `Daily Briefing — ${date}`;
            title = leadHeadline;
            const summary = daily?.summary ?? "";
            dek = summary.split(/(?<=[.!?])\s+/)[0] ?? "";
            if (dek.length < 20) dek = "";
          } catch {
            // Daily file unreadable — use defaults
          }
        }

        const dateLabel = (() => {
          const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (!m) return date;
          const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
          return d.toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
          });
        })();

        const png = await renderCard({
          title,
          dek,
          label: "Daily Briefing",
          date:  dateLabel,
        });

        if (!png) {
          console.warn(`  [skip] updates-${date} — render returned null`);
          dailySkipped++;
          continue;
        }

        writeFileSync(outPath, png);
        dailyCount++;
      } catch (e) {
        console.warn(`  [skip] updates-${date} — error: ${e.message}`);
        dailySkipped++;
      }
    }

    if (dailyCount > 0) {
      console.log(`  [ok] ${dailyCount} daily OG cards generated (${dailySkipped} skipped)`);
    }
  }
} catch (e) {
  console.warn("[build-og-images] Error processing daily updates:", e.message);
}

console.log(
  `[build-og-images] Done. Special: ${specialCount} generated` +
  (specialSkipped ? `, ${specialSkipped} skipped` : "") +
  `. Daily: ${dailyCount} generated` +
  (dailySkipped ? `, ${dailySkipped} skipped` : "") +
  `.`,
);
