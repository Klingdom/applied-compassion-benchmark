"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Report analytics (template I): report_section_view (each section, once, when
 * half visible) and report_cite_copy (copy from the cite section). Every event
 * carries report_id. No personal data. report_open, report_artifacts_click,
 * report_run_it_click and report_reply_click are fired by the links themselves
 * (data-umami-event attributes and Button trackAs).
 */
export default function ReportEvents({ reportId }: { reportId: string }) {
  useEffect(() => {
    const seen = new Set<string>();
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-report-section]"));
    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const e of entries) {
                const id = (e.target as HTMLElement).dataset.reportSection ?? "";
                if (e.isIntersecting && id && !seen.has(id)) {
                  seen.add(id);
                  trackEvent("report_section_view", { report_id: reportId, section: id });
                }
              }
            },
            { threshold: 0.5 },
          );
    sections.forEach((s) => io?.observe(s));
    const cite = document.querySelector<HTMLElement>("[data-report-section='cite-record-corrections']");
    const onCopy = () => trackEvent("report_cite_copy", { report_id: reportId });
    cite?.addEventListener("copy", onCopy);
    return () => {
      io?.disconnect();
      cite?.removeEventListener("copy", onCopy);
    };
  }, [reportId]);
  return null;
}
