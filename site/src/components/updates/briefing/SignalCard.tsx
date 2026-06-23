/* eslint-disable @typescript-eslint/no-explicit-any */
import TrackedEntityLink from "@/components/updates/TrackedEntityLink";
import { entityHref } from "@/lib/entityHref";
import { formatIndex, SEVERITY_COLORS } from "./utils";
import {
  type EvidenceItem,
  SourceChip,
  EvidenceQuote,
  SourcesDisclosure,
} from "./evidence";

interface SignalCardProps {
  signal: any;
}

/**
 * Build a complete, human-readable takeaway: the leading whole sentences of
 * `text` up to ~maxChars, never cut mid-sentence. Returns the full text when it
 * is already short. The remainder (if any) is revealed via the card's
 * "Read the full signal" disclosure, so nothing trails off into an ellipsis.
 */
function leadTakeaway(text: string, maxChars = 300): string {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  const sentences = text.split(/(?<=[.!?])\s+/);
  let out = "";
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (out && next.length > maxChars) break;
    out = next;
  }
  // Fallback for a single very long sentence: cut at the last word boundary.
  if (!out) {
    const slice = text.slice(0, maxChars);
    out = slice.slice(0, slice.lastIndexOf(" ")) || slice;
  }
  return out.trim();
}

/**
 * SignalCard - a single compact signal row in the SignalStack.
 *
 * Wave F2 additions (all gracefully degrade when evidence[] absent):
 *   #8  — named SourceChip on the top source (replaces nothing; no prior icon)
 *   #9  — verbatim pull-quote for critical/high severity when evidence[0].quote present
 *   #11 — "Sources (N)" <details> disclosure for ≥2 evidence items
 */
export default function SignalCard({ signal }: SignalCardProps) {
  const severity: string = signal.severity ?? "medium";
  const color = SEVERITY_COLORS[severity] ?? "#94a3b8";
  const href =
    signal.index && signal.slug ? entityHref(signal.index, signal.slug) : null;

  const description: string = signal.description ?? signal.body ?? signal.alert ?? "";
  const bullets: string[] = Array.isArray(signal.bullets)
    ? signal.bullets.filter((b: unknown): b is string => typeof b === "string" && b.trim().length > 0)
    : [];
  const takeaway = leadTakeaway(description);
  const remainder = description.slice(takeaway.length).trim();
  const hasMore = remainder.length > 0 || bullets.length > 0;

  const category = signal.index ? formatIndex(signal.index) : null;

  // Guard: safe even when evidence[] is absent or undefined
  const evidence: EvidenceItem[] = Array.isArray(signal.evidence) ? signal.evidence : [];

  // #8: show the top source chip (first evidence item, or nothing)
  const topEvidence: EvidenceItem | null = evidence.length > 0 ? evidence[0] : null;

  // #9: show pull-quote only for critical/high severity with a quote present
  const isHighSeverity = severity === "critical" || severity === "high";
  const topQuote =
    isHighSeverity && topEvidence && typeof topEvidence.quote === "string" && topEvidence.quote.trim().length > 0
      ? topEvidence
      : null;

  return (
    <article
      className="rounded-[14px] border p-4 transition-colors hover:bg-[rgba(255,255,255,0.02)] flex flex-col gap-2"
      style={{
        borderColor: `${color}33`,
        background: `${color}07`,
      }}
      aria-label={signal.title ?? takeaway}
    >
      {/* Top row: category + severity */}
      <div className="flex items-center gap-2 flex-wrap">
        {category && (
          <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted">
            {category}
          </span>
        )}
        <span className="text-muted text-[0.65rem]" aria-hidden="true">·</span>
        <span
          className="text-[0.65rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
          style={{
            color,
            borderColor: `${color}44`,
            background: `${color}12`,
          }}
          aria-label={`Severity: ${severity}`}
        >
          {severity}
        </span>
        {signal.actionRequired && (
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#f87171] px-1.5 py-0.5 rounded border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)]">
            Action required
          </span>
        )}
      </div>

      {/* Title / entity link */}
      <h3 className="text-[0.92rem] font-semibold leading-snug">
        {href ? (
          <TrackedEntityLink
            href={href}
            slug={signal.slug}
            index={signal.index}
            source="topSignal"
            className="hover:text-accent transition-colors"
          >
            {signal.title ?? signal.entity ?? signal.slug}
          </TrackedEntityLink>
        ) : (
          <span>{signal.title ?? signal.entity ?? signal.slug}</span>
        )}
      </h3>

      {/* Complete, human-readable takeaway — whole sentences, never cut mid-thought */}
      {takeaway && (
        <p className="text-[0.85rem] text-muted leading-relaxed">{takeaway}</p>
      )}

      {/* Full signal on demand — the complete analysis + observations, in place.
          No ellipsis truncation; everything the briefing wrote is readable here. */}
      {hasMore && (
        <details className="mt-0.5">
          <summary className="cursor-pointer list-none text-[0.75rem] font-semibold text-[#7dd3fc] hover:text-text transition-colors [&::-webkit-details-marker]:hidden">
            Read the full signal
          </summary>
          <div className="mt-2 space-y-2 text-[0.85rem] text-muted leading-relaxed">
            {remainder && <p>{remainder}</p>}
            {bullets.length > 0 && (
              <ul className="list-disc pl-[18px] space-y-1.5">
                {bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        </details>
      )}

      {/* #9: verbatim pull-quote for high/critical signals with evidence */}
      {topQuote && (
        <div className="mt-1">
          <EvidenceQuote item={topQuote} />
        </div>
      )}

      {/* #8: named source chip when there's evidence but no pull-quote shown
           (low/medium severity, or evidence without a quote) */}
      {topEvidence && !topQuote && topEvidence.url && (
        <SourceChip
          url={topEvidence.url}
          source={topEvidence.source}
          tier={topEvidence.sourceTier}
          className="inline-flex items-center gap-1 text-[0.73rem] text-muted hover:text-text transition-colors underline underline-offset-2 decoration-[rgba(255,255,255,0.2)] font-medium"
        />
      )}

      {/* #11: Sources (N) disclosure for ≥2 items */}
      <SourcesDisclosure evidence={evidence} withQuotes={false} />

      {/* Footer: entity profile link */}
      {href && (
        <div className="mt-auto pt-1 flex justify-end">
          <TrackedEntityLink
            href={href}
            slug={signal.slug}
            index={signal.index}
            source="topSignal"
            className="text-[0.75rem] font-semibold text-muted hover:text-accent transition-colors"
          >
            View profile &rarr;
          </TrackedEntityLink>
        </div>
      )}
    </article>
  );
}
