"use client";

import { useState, useCallback } from "react";
import { trackEvent } from "@/lib/analytics";
import type { EntityKind } from "@/data/entities";

interface Props {
  slug: string;
  entityKind: EntityKind;
  /**
   * Entity detail route segment (e.g. "company", "country", "us-city").
   * This is the URL prefix used by entity DETAIL pages — NOT the index slug
   * (which is the URL prefix used by ranking LIST pages like "/fortune-500").
   * Pass `KIND_CONFIG[entity.kind].route` from the calling page.
   */
  entityRoute: string;
}

/**
 * Collapsible embed-badge code-copy widget shown below the Score-Watch CTA
 * on entity detail pages. Free to use — badge auto-updates when scores change.
 *
 * Tracks `badge_embed_copy` on clipboard copy.
 */
export default function BadgeEmbedWidget({ slug, entityKind, entityRoute }: Props) {
  const [copied, setCopied] = useState(false);

  const badgeUrl = `https://api.compassionbenchmark.com/badge/${slug}.svg`;
  const entityUrl = `https://compassionbenchmark.com/${entityRoute}/${slug}`;

  const snippet = `<a href="${entityUrl}"><img src="${badgeUrl}" alt="Compassion Benchmark score" /></a>`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      trackEvent("badge_embed_copy", {
        entity_slug: slug,
        entity_kind: entityKind,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — select text as fallback
    }
  }, [snippet, slug, entityKind]);

  return (
    <details className="group rounded-[16px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden">
      <summary className="flex items-center gap-2 px-5 py-3 cursor-pointer list-none select-none text-[0.88rem] text-muted hover:text-text transition-colors">
        {/* Arrow indicator */}
        <svg
          className="w-3.5 h-3.5 shrink-0 transition-transform group-open:rotate-90"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-medium">Embed this score on your site</span>
      </summary>

      <div className="px-5 pb-5 pt-3 border-t border-line space-y-4">
        {/* Live badge preview */}
        <div>
          <p className="text-[0.78rem] uppercase tracking-[0.1em] text-muted mb-2 font-semibold">
            Preview
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={badgeUrl}
            alt="Compassion Benchmark score badge preview"
            className="h-10"
            loading="lazy"
          />
        </div>

        {/* Code snippet + copy */}
        <div>
          <p className="text-[0.78rem] uppercase tracking-[0.1em] text-muted mb-2 font-semibold">
            Embed code
          </p>
          <div className="relative">
            <pre className="bg-[rgba(0,0,0,0.3)] border border-line rounded-[10px] p-3 text-[0.78rem] text-[#94a3b8] overflow-x-auto whitespace-pre-wrap break-all leading-relaxed font-mono">
              {snippet}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 px-2.5 py-1 rounded-[8px] text-[0.72rem] font-bold border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7dd3fc]"
              style={{
                background: copied ? "rgba(125,211,252,0.18)" : "rgba(255,255,255,0.06)",
                borderColor: copied ? "rgba(125,211,252,0.45)" : "rgba(255,255,255,0.12)",
                color: copied ? "#7dd3fc" : "#94a3b8",
              }}
              aria-label="Copy embed code to clipboard"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <p className="text-[0.8rem] text-muted">
          Free. The badge auto-updates when scores change.
        </p>
      </div>
    </details>
  );
}
