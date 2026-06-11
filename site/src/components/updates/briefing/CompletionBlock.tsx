/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CompletionBlock — Wave E1 / Wave E2, Item #6 (completion-block CTA).
 *
 * Adds a benefit-led email capture INSIDE the completion card at the peak-intent
 * moment (reader just finished the briefing). Uses NewsletterSignup
 * variant="inline-compact" source="updates-completion".
 *
 * Copy rationale: "Don't come back to find out — get the next briefing in your
 * inbox. One email, Fridays. Free." — honest cadence, no dark patterns.
 *
 * The standalone SubscribeCTA block that previously followed this component in
 * DailyBriefing.tsx has been removed (see Wave E1 change #6). This completion
 * block is now the single end-of-briefing subscribe ask.
 */

import Container from "@/components/ui/Container";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import { heroDateLabel, issueNumber, formatDateLabel } from "./utils";

interface Props {
  updates: any;
}

export default function CompletionBlock({ updates }: Props) {
  const dateStr: string = updates.date ?? "";
  if (!dateStr) return null;

  const issueNo = issueNumber(dateStr);
  const heroDate = heroDateLabel(dateStr);
  const generatedAt: string = updates.generatedAt ?? "";

  // Format the generatedAt timestamp to a human-readable form
  let currentAsOf = "";
  if (generatedAt) {
    try {
      const d = new Date(generatedAt);
      currentAsOf = d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
      });
    } catch {
      currentAsOf = generatedAt;
    }
  } else {
    currentAsOf = formatDateLabel(dateStr);
  }

  // Entity count from pipeline
  const pipeline = updates.pipeline ?? {};
  const entitiesScanned = pipeline.entitiesScanned?.toLocaleString() ?? "1,160";

  return (
    <section
      id="completion"
      className="py-[32px] scroll-mt-24"
      aria-label="Briefing complete"
    >
      <Container>
        <div className="rounded-[20px] border border-[rgba(125,211,252,0.18)] bg-gradient-to-b from-[rgba(125,211,252,0.04)] to-transparent p-6 sm:p-8">
          {/* Checkmark + "You're all caught up" */}
          <div className="flex flex-col items-center text-center mb-5">
            <div
              className="mb-3 w-10 h-10 rounded-full border border-[rgba(134,239,172,0.35)] bg-[rgba(134,239,172,0.08)] flex items-center justify-center"
              aria-hidden="true"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M3.5 9.5l4 4 7-8"
                  stroke="#86efac"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="text-[1.05rem] sm:text-[1.12rem] font-semibold text-text mb-1">
              You&apos;re all caught up.
            </p>

            <p className="text-muted text-[0.85rem] leading-relaxed">
              {heroDate} briefing
              <span className="mx-2 text-[rgba(255,255,255,0.25)]" aria-hidden="true">
                ·
              </span>
              Issue No.&nbsp;{issueNo}
              <span className="mx-2 text-[rgba(255,255,255,0.25)]" aria-hidden="true">
                ·
              </span>
              {entitiesScanned} entities reviewed
              <span className="mx-2 text-[rgba(255,255,255,0.25)]" aria-hidden="true">
                ·
              </span>
              benchmark current as of {currentAsOf}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-[rgba(125,211,252,0.12)] mb-5" />

          {/* Email capture — peak-intent moment, single end-of-briefing ask */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[0.92rem] font-semibold text-text leading-snug mb-0.5">
                Don&apos;t come back to find out — get the next briefing in your inbox.
              </p>
              <p className="text-muted text-[0.82rem]">
                Read by analysts, journalists, and policy researchers tracking institutional
                accountability — {entitiesScanned} entities, scored every day, free.
              </p>
            </div>
            <div className="shrink-0">
              <NewsletterSignup
                variant="inline-compact"
                source="updates-completion"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
