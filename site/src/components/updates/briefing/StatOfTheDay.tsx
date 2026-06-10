"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * StatOfTheDay — Wave E1, Item #1 (densification pass)
 *
 * Rewritten from a padded bordered card (~160px) to a single horizontal strip
 * (~40–48px). Layout:
 *   [TODAY'S NUMBER eyebrow] · [figure ~1.5rem bold] · [label] · [entity link] · [icon-only copy-citation]
 *
 * Preserves Wave C: briefing_citation_copied trackEvent fires unchanged.
 * Preserves: entityHref link, graceful fallback when stat is sparse.
 */

import { useState } from "react";
import Link from "next/link";
import { entityHref } from "@/lib/entityHref";
import { trackEvent, EVENTS } from "@/lib/analytics";
import type { StatOfTheDay } from "./utils";

interface Props {
  stat: StatOfTheDay;
  date: string;
  pageUrl: string;
}

export default function StatOfTheDayStrip({ stat, date, pageUrl }: Props) {
  const [copied, setCopied] = useState(false);

  // Build the entity href when slug + index are both present
  const href =
    stat.slug && stat.index ? entityHref(stat.index, stat.slug) : null;

  // Citation format: "<number> — <label> — Compassion Benchmark, <date> — <url>"
  const citation = `${stat.number} — ${stat.label} — Compassion Benchmark, ${date} — ${pageUrl}`;

  function handleCopy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(citation).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        trackEvent(EVENTS.BRIEFING_CITATION_COPIED, {
          date: date ?? null,
          stat_label: stat.label,
          entity: stat.entity ?? null,
        });
      });
    }
  }

  return (
    <div
      className="flex items-center gap-3 flex-wrap border-b border-line pb-3 mb-4"
      role="region"
      aria-label="Today's number"
    >
      {/* Eyebrow */}
      <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#7dd3fc] shrink-0">
        Today&apos;s number
      </span>

      {/* Separator dot */}
      <span className="text-muted text-[0.7rem] shrink-0" aria-hidden="true">·</span>

      {/* Figure */}
      <span
        className="text-[1.55rem] font-bold leading-none tabular-nums shrink-0"
        aria-label={`${stat.number} — ${stat.label}`}
      >
        {stat.number}
      </span>

      {/* Label */}
      <span className="text-[0.88rem] text-muted leading-none shrink-0">
        {stat.label}
      </span>

      {/* Entity link or plain name */}
      {stat.entity && stat.entity !== "all indexed entities" && (
        <>
          <span className="text-muted text-[0.75rem] shrink-0" aria-hidden="true">—</span>
          {href ? (
            <Link
              href={href}
              className="text-[0.88rem] font-semibold text-[#7dd3fc] hover:text-text transition-colors underline decoration-dotted underline-offset-2 shrink-0"
            >
              {stat.entity}
            </Link>
          ) : (
            <span className="text-[0.88rem] font-semibold text-text shrink-0">
              {stat.entity}
            </span>
          )}
        </>
      )}
      {stat.entity === "all indexed entities" && (
        <span className="text-muted text-[0.88rem] shrink-0">— {stat.entity}</span>
      )}

      {/* Icon-only copy-citation button */}
      <button
        type="button"
        onClick={handleCopy}
        className="ml-auto shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-[8px] border border-line bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.07)] text-muted hover:text-text transition-colors"
        aria-label={copied ? "Citation copied" : "Copy citation to clipboard"}
        title={copied ? "Copied!" : "Copy citation"}
      >
        {copied ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M1.5 6.5l3 3 6-7"
              stroke="#86efac"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <rect
              x="4.5"
              y="4.5"
              width="7"
              height="7"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M4.5 8.5H2.5A1 1 0 0 1 1.5 7.5v-5A1 1 0 0 1 2.5 1.5h5a1 1 0 0 1 1 1v2"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
