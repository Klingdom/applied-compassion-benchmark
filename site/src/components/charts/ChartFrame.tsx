/**
 * ChartFrame — S3.7 / S3.2
 *
 * Reusable wrapper for every chart on the site.
 * Provides:
 *   - Optional title + dek above the chart
 *   - The chart (children)
 *   - Canonical CC-BY caption below
 *   - "Cite this chart" <details> affordance exposing a selectable citation line
 *     (OWID attributed-backlink model — no runtime JS needed)
 *   - A "Copy citation" button (Wave G0) — client sub-component (CopyCiteButton)
 *     that copies the citation text and fires the embed_cited analytics event
 *   - A stable anchor id for deep-linking
 *
 * Server component — the client boundary is isolated in CopyCiteButton.tsx.
 * The cite <details> still contains selectable text as a clipboard-API fallback.
 *
 * Usage:
 *   <ChartFrame
 *     id="home-all-bands"
 *     title="The state of institutional compassion"
 *     dek="Across all 1,156 benchmarked entities."
 *     path="/countries"
 *     page_type="home"
 *   >
 *     <BandDistributionBar index="all" />
 *   </ChartFrame>
 */

import { CC_BY_CAPTION } from "./chartTokens";
import CopyCiteButton from "./CopyCiteButton";

interface ChartFrameProps {
  /** Stable HTML id for in-page anchor linking (e.g. "home-all-bands"). */
  id?: string;
  /** Optional chart title rendered above the chart. */
  title?: string;
  /** Optional one-line dek under the title. */
  dek?: string;
  /**
   * The page path for the cite affordance URL, e.g. "/countries".
   * If omitted, the cite affordance is not shown.
   */
  path?: string;
  /**
   * Page-type label forwarded to the embed_cited analytics event,
   * e.g. "home", "countries", "fortune500". Defaults to "unknown".
   */
  page_type?: string;
  /** Caption override — defaults to CC_BY_CAPTION. */
  caption?: string;
  /** The chart component(s). */
  children: React.ReactNode;
  /** Extra class on the outer figure element. */
  className?: string;
}

export default function ChartFrame({
  id,
  title,
  dek,
  path,
  page_type,
  caption,
  children,
  className,
}: ChartFrameProps) {
  // Build cite text: "Compassion Benchmark — <title>. compassionbenchmark.com<path>. CC-BY 4.0."
  const citeTitle = title ?? "Chart";
  const citePath = path ?? "";
  const citeText = `Compassion Benchmark — ${citeTitle}. compassionbenchmark.com${citePath}. CC-BY 4.0.`;

  return (
    <figure
      id={id}
      className={[
        "w-full",
        // scroll-margin so anchor links land below any sticky nav
        id ? "scroll-mt-20" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Title + dek */}
      {(title || dek) && (
        <figcaption className="mb-3">
          {title && (
            <h3 className="text-[1.05rem] font-bold leading-snug text-text">
              {title}
            </h3>
          )}
          {dek && (
            <p className="text-muted text-[0.88rem] mt-0.5">{dek}</p>
          )}
        </figcaption>
      )}

      {/* Chart */}
      <div className="w-full">{children}</div>

      {/* CC-BY caption + cite affordance */}
      <figcaption className="mt-2 space-y-1">
        <p className="text-[0.72rem] text-[rgba(148,163,184,0.55)] text-right">
          {caption ?? CC_BY_CAPTION}
        </p>

        {/* Cite this chart — native <details>, no JS, text is selectable */}
        {path && (
          <details className="group text-right">
            <summary
              className={[
                "inline cursor-pointer select-none list-none",
                "[&::-webkit-details-marker]:hidden",
                "text-[0.72rem] text-[rgba(148,163,184,0.4)]",
                "hover:text-[rgba(148,163,184,0.7)] transition-colors",
              ].join(" ")}
            >
              Cite this chart
            </summary>
            <div className="mt-1 text-left bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[8px] px-3 py-2">
              <p className="text-[0.75rem] text-muted font-semibold mb-1">
                Citation
              </p>
              {/* Selectable plaintext fallback — works with or without clipboard API */}
              <p
                className="text-[0.78rem] text-[rgba(184,198,222,0.8)] leading-relaxed break-all select-all font-mono"
                aria-label={`Citation text: ${citeText}`}
              >
                {citeText}
              </p>
              {/* Copy-citation button (Wave G0): client component, fires embed_cited */}
              <CopyCiteButton
                citeText={citeText}
                page_type={page_type}
                path={path}
              />
            </div>
          </details>
        )}
      </figcaption>
    </figure>
  );
}
