import type { MetadataRoute } from "next";
import { KIND_CONFIG, getAllSlugs } from "@/data/entities";
import { INDEX_REGISTRY, ALL_ENTITY_KINDS } from "@/data/indexRegistry";
import manifest from "@/data/updates/manifest.json";
import specialBriefingsManifest from "@/data/special-briefings/manifest.json";
import { DIMENSIONS } from "@/data/dimensions";
import { getHistoryManifest } from "@/data/history";

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
