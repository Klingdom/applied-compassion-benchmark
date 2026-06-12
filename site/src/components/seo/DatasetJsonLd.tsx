/**
 * DatasetJsonLd — schema.org Dataset structured data for each index page.
 *
 * License gate: DATA_LICENSE is null until the founder confirms CC-BY applies
 * to the public rankings data (separate from paid PDF reports). Set to
 * "https://creativecommons.org/licenses/by/4.0/" ONLY after that decision.
 * When null, the license field is omitted entirely from the emitted JSON-LD.
 */

// FOUNDER DECISION REQUIRED before setting this:
// CC-BY on the rankings data must be confirmed as compatible with the
// commercial paid-report model. Set to the CC-BY URL only after confirmation.
const DATA_LICENSE: string | null = null;

const SITE_URL = "https://compassionbenchmark.com";

type Props = {
  name: string;
  description: string;
  url: string;          // relative URL, e.g. "/countries"
  indexSlug: string;    // e.g. "countries" — used for identifier + JSON DataDownload URL
  entityCount: number;
  keywords: string[];
};

export default function DatasetJsonLd({ name, description, url, indexSlug, entityCount, keywords }: Props) {
  // identifier: stable IRI for this dataset edition
  const identifier = `${SITE_URL}${url}#dataset-2026`;

  // JSON DataDownload: points at the real per-index aggregate file generated
  // by export-public-data.mjs into site/public/data/indexes/<slug>.json.
  // This URL must exist in out/ — the build script is responsible for writing
  // the file; if it fails to generate, the distribution entry is dropped.
  const jsonDownloadUrl = `${SITE_URL}/data/indexes/${indexSlug}.json`;

  const distribution: unknown[] = [
    {
      "@type": "DataDownload",
      encodingFormat: "text/html",
      contentUrl: `${SITE_URL}${url}`,
    },
    {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: jsonDownloadUrl,
    },
  ];

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url: `${SITE_URL}${url}`,
    identifier,
    keywords,
    temporalCoverage: "2026-01-01/2026-12-31",
    isAccessibleForFree: true,
    variableMeasured: [
      "Awareness (AWR)",
      "Empathy (EMP)",
      "Action (ACT)",
      "Equity (EQU)",
      "Boundaries (BND)",
      "Accountability (ACC)",
      "Systemic Impact (SYS)",
      "Integrity (INT)",
      "Composite Compassion Score",
    ],
    measurementTechnique: "Compassion Benchmark institutional assessment framework — 8 dimensions, 40 subdimensions",
    spatialCoverage: {
      "@type": "Place",
      name: "Global",
    },
    creator: {
      "@type": "Organization",
      name: "Compassion Benchmark",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Compassion Benchmark",
      url: SITE_URL,
    },
    distribution,
    size: `${entityCount} entities`,
    // license: omitted until DATA_LICENSE is set by founder decision
    ...(DATA_LICENSE ? { license: DATA_LICENSE } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
