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

import { DIMENSIONS, BAND_DESCS } from "@/data/dimensions";

const SITE_URL = "https://compassionbenchmark.com";
const METHODOLOGY_URL = `${SITE_URL}/methodology`;

// ── Score band definitions ─────────────────────────────────────────────────
// Ranges match the band constants used in BandPositionStrip.tsx and
// DimensionProfileBar.tsx. Names mirror the normalizeBand() values in entities.ts.
const SCORE_BANDS: Array<{ name: string; range: string; bandKey: string }> = [
  { name: "Critical",    range: "0–20",   bandKey: "Critical" },
  { name: "Developing",  range: "20–40",  bandKey: "Developing" },
  { name: "Functional",  range: "40–60",  bandKey: "Functional" },
  { name: "Established", range: "60–80",  bandKey: "Established" },
  { name: "Exemplary",   range: "80–100", bandKey: "Exemplary" },
];

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

  // ── DefinedTermSet 2: 5 score bands ─────────────────────────────────────
  const bandsTermSet = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Compassion Benchmark Score Bands",
    url: METHODOLOGY_URL,
    hasDefinedTerm: SCORE_BANDS.map((band) => ({
      "@type": "DefinedTerm",
      name: `${band.name} (${band.range})`,
      termCode: band.name,
      description: BAND_DESCS[band.bandKey] ?? "",
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
