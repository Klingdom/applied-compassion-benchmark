"use client";

/**
 * CopyCiteButton — Wave G0
 *
 * Client sub-component rendered inside ChartFrame's cite <details>.
 * Copies the citation text to the clipboard and fires the embed_cited
 * analytics event. Gracefully degrades when the clipboard API is
 * unavailable (the selectable plaintext citation still works in that case).
 *
 * ChartFrame itself remains a server component — this file is the only
 * client boundary introduced in the chart stack.
 */

import { useState, useCallback } from "react";
import { trackEvent, EVENTS } from "@/lib/analytics";

interface CopyCiteButtonProps {
  /** The full citation string to copy. */
  citeText: string;
  /**
   * Page-type label forwarded to the analytics payload
   * (e.g. "countries", "fortune500", "home").
   */
  page_type?: string;
  /**
   * URL path forwarded to the analytics payload (e.g. "/countries").
   */
  path?: string;
}

export default function CopyCiteButton({
  citeText,
  page_type,
  path,
}: CopyCiteButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    // Graceful degradation: if clipboard API is absent, do nothing —
    // the selectable text in the parent <details> is still copyable manually.
    if (!navigator?.clipboard?.writeText) return;

    try {
      await navigator.clipboard.writeText(citeText);
      setCopied(true);
      // Fire the analytics event after a successful copy.
      trackEvent(EVENTS.EMBED_CITED, {
        page_type: page_type ?? "unknown",
        path: path ?? "",
        format: "citation",
      });
      // Reset the button label after 2 s.
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write can fail (e.g. permissions denied).
      // The selectable text fallback still works — no error surface needed.
    }
  }, [citeText, page_type, path]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy citation to clipboard"
      className={[
        "mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px]",
        "text-[0.72rem] font-medium transition-colors",
        copied
          ? "bg-[rgba(134,239,172,0.15)] text-[rgba(134,239,172,0.9)] border border-[rgba(134,239,172,0.25)]"
          : "bg-[rgba(255,255,255,0.05)] text-[rgba(148,163,184,0.7)] border border-[rgba(255,255,255,0.08)]",
        "hover:bg-[rgba(255,255,255,0.08)] hover:text-[rgba(148,163,184,0.9)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(148,163,184,0.5)]",
      ].join(" ")}
    >
      {copied ? "Copied ✓" : "Copy citation"}
    </button>
  );
}
