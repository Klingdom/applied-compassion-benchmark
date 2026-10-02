"use client";

import { useEffect } from "react";

/**
 * Progressive enhancement for the report's <details> data tables.
 *   - On print, every <details> in the report opens (disclosures are content),
 *     and closes again afterwards.
 *   - At 480px and below the SVG is hidden by CSS and the table replaces it
 *     (template E), so the data tables open there too.
 * Without JavaScript the tables stay one click away and CSS (::details-content)
 * opens them in browsers that support it.
 */
export default function PrintOpenDetails() {
  useEffect(() => {
    const all = () => Array.from(document.querySelectorAll<HTMLDetailsElement>(".pilot-report details"));
    let opened: HTMLDetailsElement[] = [];
    const before = () => {
      opened = all().filter((d) => !d.open);
      opened.forEach((d) => (d.open = true));
    };
    const after = () => {
      opened.forEach((d) => (d.open = false));
      opened = [];
    };
    const mq = window.matchMedia("(max-width: 480px)");
    const narrow = () => {
      if (mq.matches) all().filter((d) => d.classList.contains("pf-data")).forEach((d) => (d.open = true));
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    mq.addEventListener("change", narrow);
    narrow();
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
      mq.removeEventListener("change", narrow);
    };
  }, []);
  return null;
}
