import type { MetadataRoute } from "next";
import { KIND_CONFIG, getAllSlugs } from "@/data/entities";
import { INDEX_REGISTRY, ALL_ENTITY_KINDS } from "@/data/indexRegistry";
import manifest from "@/data/updates/manifest.json";
import { getHistoryManifest } from "@/data/history";

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
    // Daily briefing archive pages — one URL per date in the manifest.
    // changeFrequency: "never" — a published briefing is immutable.
    ...manifest.dates.map((date: string) => ({
      url: `${BASE}/updates/${date}`,
      lastModified: date,
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
