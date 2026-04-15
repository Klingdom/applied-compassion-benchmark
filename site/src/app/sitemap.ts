import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE = "https://compassionbenchmark.com";

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
  ];
}
