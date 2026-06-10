"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * StatOfTheDay — Wave B, Item #1
 *
 * Renders one large hero number + label + linked entity name, with a
 * "Copy citation" button that copies a formatted citation string to
 * the clipboard.  This is a client component for the copy interaction.
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

export default function StatOfTheDayCard({ stat, date, pageUrl }: Props) {
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
    <div className="rounded-[18px] border border-[rgba(125,211,252,0.22)] bg-[rgba(125,211,252,0.05)] p-5 sm:p-6">
      {/* Label */}
      <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#7dd3fc] mb-2">
        Stat of the Day
      </div>

      {/* Hero number */}
      <div
        className="text-[clamp(2rem,5vw,3rem)] font-bold leading-none tabular-nums mb-1"
        aria-label={`${stat.number} — ${stat.label}`}
      >
        {stat.number}
      </div>

      {/* Label + entity row */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-4">
        <span className="text-muted text-[0.9rem]">{stat.label}</span>
        {stat.entity && stat.entity !== "all indexed entities" && (
          <>
            <span className="text-muted text-[0.78rem]" aria-hidden="true">
              —
            </span>
            {href ? (
              <Link
                href={href}
                className="text-[0.9rem] font-semibold text-[#7dd3fc] hover:text-text transition-colors underline decoration-dotted underline-offset-2"
              >
                {stat.entity}
              </Link>
            ) : (
              <span className="text-[0.9rem] font-semibold text-text">
                {stat.entity}
              </span>
            )}
          </>
        )}
        {stat.entity === "all indexed entities" && (
          <span className="text-muted text-[0.9rem]">— {stat.entity}</span>
        )}
      </div>

      {/* Copy citation button */}
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-muted hover:text-text transition-colors border border-line bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] rounded-[10px] px-3 py-1.5"
        aria-label={copied ? "Citation copied" : "Copy citation to clipboard"}
      >
        {copied ? (
          <>
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 7l3.5 3.5L11 3"
                stroke="#86efac"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ color: "#86efac" }}>Copied</span>
          </>
        ) : (
          <>
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              aria-hidden="true"
            >
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
            Copy citation
          </>
        )}
      </button>
    </div>
  );
}
