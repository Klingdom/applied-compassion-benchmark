/**
 * ScoreLegend — Wave H1, Item #7
 *
 * Shared <details> disclosure: "How to read the scores"
 * - 0–100 → 5-band scale (with band colors + short descriptions)
 * - 8-dimension glossary (DIMENSIONS name+desc from dimensions.ts)
 *
 * Closed by default. In DOM always (accessible, crawlable, Pagefind-indexable).
 * Reusable on special reports, /updates, and anywhere else.
 * Server component — no client JS.
 */

import { DIMENSIONS, BANDS } from "@/data/dimensions";

interface Props {
  /** If true, render as a full section (with outer padding / divider). Default false. */
  asSection?: boolean;
}

export default function ScoreLegend({ asSection = false }: Props) {
  const inner = (
    <details className="group w-full">
      <summary
        className={[
          "cursor-pointer select-none",
          "flex items-center gap-2",
          "text-[0.82rem] font-semibold text-muted hover:text-text transition-colors",
          "list-none [&::-webkit-details-marker]:hidden",
          "py-1",
        ].join(" ")}
      >
        {/* Chevron rotates open */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          aria-hidden="true"
          className="transition-transform group-open:rotate-90 shrink-0"
        >
          <path
            d="M4.5 2.5l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        How to read the scores
      </summary>

      <div className="mt-4 space-y-6">
        {/* ── Band scale ── */}
        <section aria-labelledby="legend-bands-heading">
          <h4
            id="legend-bands-heading"
            className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-muted mb-3"
          >
            The 0–100 scale — five bands
          </h4>
          <p className="text-muted text-[0.82rem] leading-relaxed mb-3 max-w-[60ch]">
            Every entity — state, corporation, AI lab, robotics lab, or city — is scored
            0–100 across 8 dimensions and 40 subdimensions. The composite score places the
            entity in one of five bands:
          </p>
          <div className="space-y-2">
            {BANDS.map((b) => (
              <div key={b.name} className="flex gap-3 items-start">
                {/* Color chip */}
                <span
                  className="shrink-0 mt-0.5 inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: b.color }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <span
                    className="font-bold text-[0.85rem] mr-1.5"
                    style={{ color: b.color }}
                  >
                    {b.name}
                  </span>
                  <span className="text-muted-subtle text-[0.78rem] mr-2">
                    {b.range}
                  </span>
                  <span className="text-muted text-[0.82rem] leading-relaxed">
                    {b.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Dimension glossary ── */}
        <section aria-labelledby="legend-dims-heading">
          <h4
            id="legend-dims-heading"
            className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-muted mb-3"
          >
            The 8 dimensions
          </h4>
          <p className="text-muted text-[0.82rem] leading-relaxed mb-3 max-w-[60ch]">
            Each dimension is scored 1–5 across 5 subdimensions (40 subdimensions total),
            then converted to a 0–100 composite. A score of 1.0 on a subdimension represents
            the minimum anchor; 5.0 is exemplary conduct.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {DIMENSIONS.map((dim) => (
              <div
                key={dim.code}
                className="flex gap-2.5 items-start rounded-[10px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5"
              >
                {/* Dimension color dot */}
                <span
                  className="shrink-0 mt-1 w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: dim.color }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <span
                    className="font-bold text-[0.82rem] mr-1"
                    style={{ color: dim.color }}
                  >
                    {dim.code}
                  </span>
                  <span className="font-semibold text-[0.82rem] text-text mr-1">
                    {dim.name}
                  </span>
                  <span className="text-muted text-[0.78rem] leading-relaxed">
                    {dim.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Scoring note ── */}
        <p className="text-[0.75rem] text-muted-subtle leading-relaxed border-t border-[rgba(255,255,255,0.07)] pt-3">
          Scores are based on public evidence — government reports, regulatory filings,
          independent audits, judicial findings, and verifiable third-party records. Entities
          never pay for inclusion, score changes, or suppression of findings.{" "}
          <a
            href="/about"
            className="text-accent underline underline-offset-2 decoration-dotted hover:text-text transition-colors"
          >
            Full methodology
          </a>
        </p>
      </div>
    </details>
  );

  if (!asSection) return inner;

  return (
    <div className="border-t border-line py-6">
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-8">
        {inner}
      </div>
    </div>
  );
}
