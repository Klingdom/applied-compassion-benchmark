/**
 * HowToReadBriefing — Item 4
 *
 * Collapsed-by-default <details> disclosure explaining the briefing's schema:
 * band ladder, two scales, and a micro-glossary of ~6 key terms.
 *
 * Styling matches the audit-trail <details> in DailyBriefing.tsx exactly
 * (same border, bg, chevron, motion-safe rotation).
 *
 * Static — no props, no data fetching. CHART_BANDS is the single source of truth
 * for band colors. Band chip uses the Band UI component for visual consistency.
 */

import Band from "@/components/ui/Band";
import { CHART_BANDS } from "@/components/charts/chartTokens";
import type { BandLevel } from "@/components/ui/Band";

// Map CHART_BANDS key → BandLevel prop (lowercase)
function toBandLevel(key: string): BandLevel {
  return key.toLowerCase() as BandLevel;
}

const GLOSSARY: { term: string; definition: string }[] = [
  {
    term: "Band crossing",
    definition:
      "A score change large enough to move an entity from one performance band into an adjacent one — the most structurally significant finding in a given cycle.",
  },
  {
    term: "Boundary watch",
    definition:
      "An entity whose current score is within 3 points of a band threshold, flagged for priority reassessment in the next cycle.",
  },
  {
    term: "Carry-forward",
    definition:
      "A dimensional credit retained from a prior assessment when new evidence is insufficient to revise a specific dimension; disclosed explicitly.",
  },
  {
    term: "First baseline",
    definition:
      "An entity's inaugural composite score — no published score exists to compare against, so delta is not shown.",
  },
  {
    term: "Floor designation",
    definition:
      "The most serious finding: all 8 dimensions resolve at the lowest behavioral anchor (1.0/5.0) across multiple cycles, yielding a composite of 0.",
  },
  {
    term: "Forward trigger",
    definition:
      "A scheduled future reassessment event (e.g., a policy implementation date or legislative deadline) that may materially change an entity's score.",
  },
];

export default function HowToReadBriefing() {
  return (
    <details className="group rounded-[18px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden">
      <summary
        className={[
          "flex items-center justify-between gap-3 px-5 py-4",
          "cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden",
          "hover:bg-[rgba(255,255,255,0.025)] transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(125,211,252,0.5)] focus-visible:ring-inset",
        ].join(" ")}
      >
        <div className="flex items-center gap-2.5">
          {/* Chevron — rotates when open, matches audit-trail style */}
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="text-muted shrink-0 motion-safe:transition-transform group-open:rotate-90"
          >
            <path
              d="M5 2l4.5 5L5 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[0.88rem] font-semibold text-muted">
            How to read this briefing
          </span>
          <span className="text-[0.78rem] text-muted-subtle" aria-hidden="true">
            — Bands, scores, and terms
          </span>
        </div>
        <span className="text-[0.72rem] uppercase tracking-widest font-bold text-muted shrink-0">
          Schema guide
        </span>
      </summary>

      {/* Content — always in DOM for a11y + Pagefind */}
      <div className="border-t border-line px-5 py-5 space-y-6">

        {/* (a) Band ladder */}
        <div>
          <div className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-muted mb-3">
            The 5 performance bands
          </div>
          <div className="flex flex-col gap-2">
            {CHART_BANDS.map((band) => (
              <div key={band.key} className="flex items-center gap-3">
                <Band level={toBandLevel(band.key)} />
                <span className="text-[0.82rem] text-muted tabular-nums">
                  {band.range}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* (b) Two scales */}
        <div>
          <div className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-muted mb-2">
            Two scales
          </div>
          <p className="text-[0.88rem] text-muted leading-relaxed">
            Each of the 8 dimensions is scored{" "}
            <span className="text-text font-medium">1.0–5.0</span>; these
            combine into a{" "}
            <span className="text-text font-medium">0–100 composite score</span>
            , mapped to the 5 bands above.
          </p>
        </div>

        {/* (c) Micro-glossary */}
        <div>
          <div className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-muted mb-3">
            Key terms
          </div>
          <dl className="space-y-3">
            {GLOSSARY.map(({ term, definition }) => (
              <div key={term}>
                <dt className="text-[0.82rem] font-semibold text-text">
                  {term}
                </dt>
                <dd className="text-[0.82rem] text-muted leading-relaxed mt-0.5">
                  {definition}
                </dd>
              </div>
            ))}
          </dl>
        </div>

      </div>
    </details>
  );
}
