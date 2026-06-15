/**
 * DefinedTermSetJsonLd — schema.org DefinedTermSet JSON-LD for /methodology.
 *
 * Emits two DefinedTermSet objects:
 *  1. "Compassion Benchmark Dimensions" — the 8 scoring dimensions derived
 *     from the real data in dimensions.ts.
 *  2. "Compassion Benchmark Score Bands" — the 5 composite score bands with
 *     their ranges and descriptions from BAND_DESCS in dimensions.ts.
 *
 * Teaching these vocabularies to answer engines lets them reuse our framing
 * (e.g. "AWR / Awareness / Suffering Detection") as citable vocabulary
 * rather than paraphrasing it.
 *
 * No fabricated data — every field traces to real values in dimensions.ts.
 */

import { DIMENSIONS, BANDS } from "@/data/dimensions";

const SITE_URL = "https://compassionbenchmark.com";
const METHODOLOGY_URL = `${SITE_URL}/methodology`;

export default function DefinedTermSetJsonLd() {
  // ── DefinedTermSet 1: 8 dimensions ──────────────────────────────────────
  const dimensionsTermSet = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Compassion Benchmark Dimensions",
    url: METHODOLOGY_URL,
    hasDefinedTerm: DIMENSIONS.map((dim) => ({
      "@type": "DefinedTerm",
      name: dim.name,
      termCode: dim.code,
      alternateName: dim.code,
      description: dim.desc,
      inDefinedTermSet: METHODOLOGY_URL,
    })),
  };

  // ── DefinedTermSet 2: 5 score bands (from canonical BANDS in dimensions.ts) ─
  const bandsTermSet = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Compassion Benchmark Score Bands",
    url: METHODOLOGY_URL,
    hasDefinedTerm: BANDS.map((band) => ({
      "@type": "DefinedTerm",
      name: `${band.name} (${band.range})`,
      termCode: band.name,
      description: band.desc,
      inDefinedTermSet: METHODOLOGY_URL,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dimensionsTermSet) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bandsTermSet) }}
      />
    </>
  );
}
