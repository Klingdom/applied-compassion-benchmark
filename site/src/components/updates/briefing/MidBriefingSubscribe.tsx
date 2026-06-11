"use client";
/**
 * MidBriefingSubscribe — Wave E2, Item #10.
 *
 * A subtle single-line subscribe prompt shown after the editorial lead
 * (after BrutalInsightCard, before HighCompassionContrast). Reads
 * localStorage.cb_newsletter on mount and renders nothing if the reader
 * is already subscribed, preventing over-asking.
 *
 * Accepts a minor post-hydration mount delay — renders null until hydrated
 * to avoid a flash for already-subscribed readers.
 */

import { useEffect, useState } from "react";
import NewsletterSignup from "@/components/ui/NewsletterSignup";

export default function MidBriefingSubscribe() {
  const [ready, setReady] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    try {
      const val = localStorage.getItem("cb_newsletter");
      setIsSubscribed(Boolean(val));
    } catch {
      setIsSubscribed(false);
    }
    setReady(true);
  }, []);

  // Render nothing until hydrated (avoids flash for subscribers)
  if (!ready || isSubscribed) return null;

  return (
    <div className="py-[10px]">
      <div className="max-w-[var(--container-width,1200px)] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-[14px] border border-[rgba(125,211,252,0.1)] bg-[rgba(125,211,252,0.03)] px-5 py-3.5">
          <p className="text-[0.85rem] text-muted flex-1 min-w-0">
            If this is useful, get the next briefing — Fridays, free.
          </p>
          <div className="shrink-0">
            <NewsletterSignup variant="inline-compact" source="updates-midbriefing" />
          </div>
        </div>
      </div>
    </div>
  );
}
