type Props = {
  name: string;
  description: string;
  url: string;
  entityCount: number;
  keywords: string[];
};

export default function DatasetJsonLd({ name, description, url, entityCount, keywords }: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url,
    keywords,
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
    spatialCoverage: "Global",
    temporalCoverage: "2026",
    creator: {
      "@type": "Organization",
      name: "Compassion Benchmark",
      url: "https://compassionbenchmark.com",
    },
    distribution: {
      "@type": "DataDownload",
      contentUrl: `https://compassionbenchmark.com${url}`,
      encodingFormat: "text/html",
    },
    size: `${entityCount} entities`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
