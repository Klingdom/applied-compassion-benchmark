import type { MetadataRoute } from "next";
import { EntityKind, KIND_CONFIG, getAllSlugs } from "@/data/entities";

export const dynamic = "force-static";

const BASE = "https://compassionbenchmark.com";

const ENTITY_KINDS: EntityKind[] = [
  "company",
  "country",
  "us-state",
  "ai-lab",
  "robotics-lab",
  "city",
  "us-city",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const indexPages = [
    "/countries",
    "/us-states",
    "/fortune-500",
    "/ai-labs",
    "/robotics-labs",
    "/us-cities",
    "/global-cities",
  ];

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
  ];
}
