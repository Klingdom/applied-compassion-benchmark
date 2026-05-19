/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "@/components/ui/Container";
import SectionHead from "@/components/ui/SectionHead";
import { formatDateLabel } from "./utils";

interface Props {
  updates: any;
}

/**
 * TodaysAnalysisSection — extracted from the inline HighlightsSection in
 * DailyBriefing.tsx. Reads `updates.highlights` (string[]) and renders a
 * numbered card list under the heading "Today's analysis".
 *
 * Each highlight is rendered as a claim line. If the highlight is a rich object
 * with a `relevance` or `whyItMatters` field (future digest shape), that is
 * rendered as a labeled second line. Older briefings (string-only) degrade
 * gracefully to the current bullet style.
 *
 * Returns null when highlights is empty or absent.
 */
export default function TodaysAnalysisSection({ updates }: Props) {
  const highlights: any[] = Array.isArray(updates.highlights)
    ? updates.highlights
    : [];
  const date: string = updates.date ?? "";

  if (highlights.length === 0) return null;

  return (
    <section id="highlights" className="py-[30px] scroll-mt-24">
      <Container>
        <SectionHead
          title="Today's analysis"
          description={`The most significant editorial findings in the ${formatDateLabel(date)} briefing.`}
        />
        <div className="grid grid-cols-1 gap-3">
          {highlights.map((h: any, i: number) => {
            // Support both plain strings and rich objects with relevance/whyItMatters
            const isObject =
              h !== null && typeof h === "object" && !Array.isArray(h);
            const claimText: string = isObject
              ? (h.claim ?? h.text ?? String(h))
              : typeof h === "string"
                ? h
                : String(h);
            const whyText: string | null = isObject
              ? (h.whyItMatters ?? h.relevance ?? null)
              : null;

            return (
              <div
                key={i}
                className="rounded-[20px] border border-[rgba(125,211,252,0.18)] bg-[rgba(125,211,252,0.05)] p-5"
              >
                <div className="flex gap-3 items-start">
                  <span className="text-[0.78rem] font-bold text-accent shrink-0 mt-[3px] uppercase tracking-wider">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.95rem] leading-relaxed">{claimText}</p>
                    {whyText && (
                      <p className="text-[0.82rem] text-muted leading-relaxed mt-2">
                        <span className="text-[0.72rem] font-bold uppercase tracking-wider text-accent mr-1.5">
                          Why it matters
                        </span>
                        {whyText}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
