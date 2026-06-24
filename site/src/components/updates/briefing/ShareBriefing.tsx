"use client";

/**
 * ShareBriefing — Phase 2, Item #2
 *
 * Small "share this briefing" client island. Uses navigator.share when
 * available (mobile/desktop native), falls back to navigator.clipboard.
 * Tracks EVENTS.SHARE_CLICK {date, method} via Umami.
 *
 * Pre-built share text carries the independence line outward so every share
 * includes the editorial independence statement.
 */

import { useState } from "react";
import { trackEvent, EVENTS } from "@/lib/analytics";

interface Props {
  /** YYYY-MM-DD briefing date. */
  date: string;
  /** The briefing headline (updates.headline). */
  headline: string;
  /** Visual variant — "compact" for the 30s block, "primary" for CompletionBlock. */
  variant?: "compact" | "primary";
}

function buildShareText(headline: string, date: string): string {
  const url = `https://compassionbenchmark.com/updates/${date}`;
  return [
    headline,
    url,
    "— Compassion Benchmark · independent: entities never pay for inclusion.",
  ].join("\n");
}

export default function ShareBriefing({ date, headline, variant = "compact" }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  if (!date || !headline) return null;

  async function handleShare() {
    const text = buildShareText(headline, date);
    const url = `https://compassionbenchmark.com/updates/${date}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: headline, text, url });
        trackEvent(EVENTS.SHARE_CLICK, { date, method: "native" });
      } catch {
        // User cancelled or share failed — do not surface an error.
      }
      return;
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(text);
      trackEvent(EVENTS.SHARE_CLICK, { date, method: "copy" });
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2200);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2200);
    }
  }

  const label =
    status === "copied" ? "Copied" : status === "error" ? "Failed" : "Share";

  if (variant === "primary") {
    return (
      <button
        onClick={handleShare}
        aria-label="Share this briefing"
        className={[
          "inline-flex items-center gap-2 px-4 py-2 rounded-[10px] border text-[0.82rem] font-semibold transition-colors",
          status === "copied"
            ? "border-[rgba(134,239,172,0.45)] bg-[rgba(134,239,172,0.1)] text-[#86efac]"
            : status === "error"
              ? "border-[rgba(248,113,113,0.45)] bg-[rgba(248,113,113,0.08)] text-[#f87171]"
              : "border-[rgba(125,211,252,0.35)] bg-[rgba(125,211,252,0.06)] text-[#7dd3fc] hover:border-[rgba(125,211,252,0.55)] hover:bg-[rgba(125,211,252,0.1)]",
        ].join(" ")}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          {status === "copied" ? (
            <path
              d="M2.5 7.5l3 3 6-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M10.5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM3.5 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10.5 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM5 7l4-2.5M5 7l4 2"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
        {label}
      </button>
    );
  }

  // compact variant
  return (
    <button
      onClick={handleShare}
      aria-label="Share this briefing"
      className={[
        "inline-flex items-center gap-1.5 text-[0.75rem] font-semibold transition-colors px-2.5 py-1 rounded-[8px] border",
        status === "copied"
          ? "border-[rgba(134,239,172,0.4)] text-[#86efac] bg-[rgba(134,239,172,0.07)]"
          : status === "error"
            ? "border-[rgba(248,113,113,0.4)] text-[#f87171]"
            : "border-[rgba(125,211,252,0.25)] text-[#7dd3fc] bg-transparent hover:border-[rgba(125,211,252,0.45)] hover:bg-[rgba(125,211,252,0.05)]",
      ].join(" ")}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        {status === "copied" ? (
          <path
            d="M2.5 7.5l3 3 6-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M10.5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM3.5 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10.5 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM5 7l4-2.5M5 7l4 2"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      {label}
    </button>
  );
}
