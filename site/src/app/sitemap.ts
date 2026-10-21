import type { MetadataRoute } from "next";
import { KIND_CONFIG, getAllSlugs } from "@/data/entities";
import { INDEX_REGISTRY, ALL_ENTITY_KINDS } from "@/data/indexRegistry";
import manifest from "@/data/updates/manifest.json";
import specialBriefingsManifest from "@/data/special-briefings/manifest.json";
import { DIMENSIONS } from "@/data/dimensions";
import { getHistoryManifest } from "@/data/history";
import { renderableEntries, reportsIndexRenders } from "@/lib/model-report-gate";
import { reportPath } from "@/lib/model-report-facts";
import { DASHBOARD_PATH } from "../../scripts/lib/model-dashboard-core.mjs";
import { waveLinks } from "@/lib/model-dashboard-facts";
import { MODEL_WATCH_FACTS } from "@/lib/model-watch-facts";
import { INSIGHTS, lastModifiedOf } from "@/lib/insights";

// G4 (organic-growth Wave 1, safe-subset additions only): dimension-name
// slugs for the /dimensions/<slug> pages. Matches the dimension `name`
// slugified (lowercase, spaces to hyphens) — coordinate with the pages
// actually generating these routes.
function slugifyDimensionName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export const dynamic = "force-static";

const BASE = "https://compassionbenchmark.com";

// Entity-detail-page iteration order — KIND_TABLE's declaration order
// (company-first). Has no user-visible effect on the generated sitemap.
const ENTITY_KINDS = ALL_ENTITY_KINDS;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Index-page list — display order, sourced from the canonical registry.
  const indexPages = INDEX_REGISTRY.map((entry) => entry.indexRoute);

  const servicePages = [
    "/purchase-research",
    "/data-licenses",
    "/advisory",
    "/certified-assessments",
    "/enterprise",
    "/contact-sales",
  ];

  const toolPages = [
    "/self-assessment",
    "/prompting-suite-for-humans",
    "/ai-evaluation-suite",
    "/assess-your-organization",
  ];

  // AI Model Compassion Benchmark — pre-registration pages. Per DECISIONS.md
  // D-29, exactly these two routes ship before any model is evaluated; no
  // per-model or leaderboard route exists. Unofficial pilot reports
  // (/ai-models/reports/<run_id>, D-29a) are added below from the wave manifest
  // and only while they render.
  // The 2026-10-16 founder directive added the tracker, the weekly watch and the leaderboards explainer
  // (docs/ARCHITECTURE_AI_MODEL_WATCH.md section 4; still no per-model route, anchor or ranking). Editions and
  // Insights posts are added below from their manifests.
  const aiModelPages = [
    "/ai-models",
    "/ai-models/methodology",
    "/ai-models/tracker",
    "/ai-models/watch",
    "/ai-models/leaderboards",
    "/ai-models/cycle",
  ];
  const editions = MODEL_WATCH_FACTS.editions;
  const insightPosts = INSIGHTS;

  const infoPages = [
    "/methodology",
    "/research",
    "/about",
    "/contact",
    "/services",
    "/data",
    "/media",
  ];

  // G4: vocabulary/citation pages landing in the same wave (built by a
  // parallel agent). Dimension slugs are the dimension `name`, slugified.
  const vocabularyPages = [
    "/glossary",
    "/dimensions",
    ...DIMENSIONS.map((d) => `/dimensions/${slugifyDimensionName(d.name)}`),
    "/cite",
  ];

  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/indexes`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/updates`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE}/updates/archive`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ...indexPages.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...servicePages.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...toolPages.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // Unofficial pilot reports: one URL per RENDERED wave (empty in the default build while
    // D-29a is proposed). A published report is immutable (corrections are new dated records).
    ...renderableEntries().map(({ entry }) => ({
      url: `${BASE}${reportPath(entry.run_id)}`,
      lastModified: entry.report_date,
      changeFrequency: "never" as const,
      priority: 0.7,
    })),
    // The reports index (D-29a item 1: only once two reports render). lastmod is the newest report's date, never "now".
    ...(reportsIndexRenders()
      ? [{
          url: `${BASE}/ai-models/reports`,
          lastModified: renderableEntries().map((x) => x.entry.report_date).sort().slice(-1)[0],
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }]
      : []),
    // AI Model Compassion Dashboard (proposed D-29b). The route exists only while a wave renders, so the entries do too.
    // /ai-models/dashboard MOVES whenever a newer wave publishes (the weekly wave program), so it is "weekly" and its lastmod is the
    // newest wave's report date, never "now". Each wave also has a permanent page /ai-models/dashboard/<run_id> that never changes
    // (a published wave is immutable; corrections are new dated records): "never", lastmod = that wave's report date, like the reports.
    // The newest wave's permanent page is canonical to /ai-models/dashboard, so it is not listed separately.
    ...(waveLinks().length > 0
      ? [
          {
            url: `${BASE}${DASHBOARD_PATH}`,
            lastModified: waveLinks()[0].reportDate,
            changeFrequency: "weekly" as const,
            priority: 0.75,
          },
          ...waveLinks().slice(1).map((l) => ({
            url: `${BASE}${DASHBOARD_PATH}/${l.runId}`,
            lastModified: l.reportDate,
            changeFrequency: "never" as const,
            priority: 0.6,
          })),
        ]
      : []),
    ...aiModelPages.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    // AI Model Watch editions: one URL per compiled edition. A published edition is immutable (corrections are appended).
    ...editions.map((e) => ({
      url: `${BASE}/ai-models/watch/${e.date}`,
      lastModified: e.date,
      changeFrequency: "never" as const,
      priority: 0.7,
    })),
    // Insights: the listing, then each post (lastmod = the later of its date and its latest correction).
    { url: `${BASE}/insights`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 },
    ...insightPosts.map((p) => ({
      url: `${BASE}/insights/${p.slug}`,
      lastModified: lastModifiedOf(p),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...infoPages.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...vocabularyPages.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // Daily briefing archive pages — one URL per date in the manifest.
    // changeFrequency: "never" — a published briefing is immutable.
    ...manifest.dates.map((date: string) => ({
      url: `${BASE}/updates/${date}`,
      lastModified: date,
      changeFrequency: "never" as const,
      priority: 0.7,
    })),
    // Special briefings — thematic deep-dives outside the daily cycle.
    // One URL per slug in the manifest (all slugs generate a static route via
    // generateStaticParams in updates/special/[slug]/page.tsx, regardless of
    // internal editorial "DRAFT" notes in the edition field).
    // changeFrequency: "never" — a published briefing is immutable.
    ...specialBriefingsManifest.briefings.map((b: { slug: string; date: string }) => ({
      url: `${BASE}/updates/special/${b.slug}`,
      lastModified: b.date,
      changeFrequency: "never" as const,
      priority: 0.7,
    })),
    // Entity detail pages — one URL per assessed entity across every index.
    ...ENTITY_KINDS.flatMap((kind) => {
      const route = KIND_CONFIG[kind].route;
      return getAllSlugs(kind).map((slug) => ({
        url: `${BASE}/${route}/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }),
    // Per-entity history pages — generated for all slugs with at least one event.
    ...(() => {
      const historyManifest = getHistoryManifest();
      if (!historyManifest) return [];
      return ENTITY_KINDS.flatMap((kind) => {
        const route = KIND_CONFIG[kind].route;
        const kindKey = kind as keyof typeof historyManifest.byKind;
        const slugs = historyManifest.byKind[kindKey] || [];
        return slugs.map((slug) => ({
          url: `${BASE}/${route}/${slug}/history`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.5,
        }));
      });
    })(),
  ];
}
