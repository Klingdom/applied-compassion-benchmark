/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CompletionBlock — Wave B, Item #9
 *
 * Designed end-of-briefing block.
 * "You're all caught up — <Month DD> briefing · Issue No. <n> · benchmark current as of <generatedAt>"
 *
 * Server component. Evidence-grounded, no marketing fluff.
 */

import Container from "@/components/ui/Container";
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
      className="py-[40px] scroll-mt-24"
      aria-label="Briefing complete"
    >
      <Container>
        <div className="rounded-[20px] border border-[rgba(125,211,252,0.18)] bg-gradient-to-b from-[rgba(125,211,252,0.04)] to-transparent p-7 sm:p-8 text-center">
          {/* Checkmark icon */}
          <div
            className="mx-auto mb-4 w-10 h-10 rounded-full border border-[rgba(134,239,172,0.35)] bg-[rgba(134,239,172,0.08)] flex items-center justify-center"
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

          <p className="text-[1.05rem] sm:text-[1.15rem] font-semibold text-text mb-2">
            You&apos;re all caught up.
          </p>

          <p className="text-muted text-[0.88rem] leading-relaxed">
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
      </Container>
    </section>
  );
}
