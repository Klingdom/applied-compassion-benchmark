"use client";
/**
 * MidBriefingSubscribe — Wave E2, Item #10 / Item #19.
 *
 * A subtle single-line subscribe prompt shown after the editorial lead.
 * Reads localStorage.cb_newsletter on mount and renders nothing if the reader
 * is already subscribed, preventing over-asking.
 *
 * #19: Accepts optional `soonestTriggerDays` to tie subscribe copy to a real
 * upcoming scoring trigger (message-matched). When provided, copy reads
 * "The next scored trigger is in X days — get it in your inbox."
 *
 * Degrades gracefully when no forward-trigger data is available.
 */

import { useEffect, useState } from "react";
import NewsletterSignup from "@/components/ui/NewsletterSignup";

interface Props {
  /** #19 — days until the soonest forward trigger; undefined = no triggers */
  soonestTriggerDays?: number | null;
}

export default function MidBriefingSubscribe({ soonestTriggerDays }: Props = {}) {
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

  // #19 — message-matched copy
  const copyText: string = (() => {
    if (typeof soonestTriggerDays === "number" && soonestTriggerDays > 0 && soonestTriggerDays <= 90) {
      return `The next scored trigger is in ${soonestTriggerDays} day${soonestTriggerDays !== 1 ? "s" : ""} — get it in your inbox when it lands.`;
    }
    if (typeof soonestTriggerDays === "number" && soonestTriggerDays === 0) {
      return "A scored trigger lands today — get tomorrow's findings in your inbox.";
    }
    return "If this is useful, get the next briefing — Fridays, free.";
  })();

  return (
    <div className="py-[10px]">
      <div className="max-w-[var(--container-width,1200px)] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-[14px] border border-[rgba(125,211,252,0.1)] bg-[rgba(125,211,252,0.03)] px-5 py-3.5">
          <p className="text-[0.85rem] text-muted flex-1 min-w-0">
            {copyText}
          </p>
          <div className="shrink-0">
            <NewsletterSignup variant="inline-compact" source="updates-midbriefing" />
          </div>
        </div>
      </div>
    </div>
  );
}
