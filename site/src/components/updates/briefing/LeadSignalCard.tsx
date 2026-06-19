/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "@/components/ui/Container";
import Band from "@/components/ui/Band";
import TrackedEntityLink from "@/components/updates/TrackedEntityLink";
import { entityHref, ALL_ENTITY_KINDS } from "@/lib/entityHref";
import { getEntityBySlug } from "@/data/entities";
import { normalizeBand, formatIndex, SEVERITY_COLORS, pickLeadSignal, deltaColor } from "./utils";
import { extractDomain } from "./utils";
import { DIMENSIONS } from "@/data/dimensions";
import {
  type EvidenceItem,
  SourceChip,
  EvidenceQuote,
  SourcesDisclosure,
} from "./evidence";
import BandPositionStrip from "@/components/charts/BandPositionStrip";

interface Props {
  updates: any;
}

/**
 * Synthesize a minimal lead signal from the highest-magnitude scoreChange when
 * topSignals is absent. Mirrors the fallback pattern in TopSignals.tsx
 * (`fallbackSignalsFromScoreChanges`) so the briefing always leads with substance.
 */
function synthesizeLeadFromScoreChanges(scoreChanges: any[]): any | null {
  if (!Array.isArray(scoreChanges) || scoreChanges.length === 0) return null;
  const ranked = [...scoreChanges]
    .filter((c) => typeof c.delta === "number" || (c.headline && c.headline.trim()))
    .sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0));
  const top = ranked[0];
  if (!top) return null;
  const absDelta = Math.abs(top.delta ?? 0);

  // #14 — human-readable title instead of code-like "(Δ −6.2)"
  const scoreNotation = (() => {
    if (typeof top.delta !== "number") return "";
    const pub = top.publishedScore;
    const ass = top.assessedScore;
    const arrow = top.delta < 0 ? "▼" : top.delta > 0 ? "▲" : "—";
    const absVal = Math.abs(top.delta);
    const ptsStr = `${arrow} ${absVal % 1 === 0 ? absVal : absVal.toFixed(1)} points`;
    if (typeof pub === "number" && typeof ass === "number") {
      return `: Published ${pub} → Assessed ${ass} · ${ptsStr}`;
    }
    return `: ${ptsStr}`;
  })();

  return {
    slug: top.slug,
    index: top.index,
    title: top.entity
      ? `${top.entity}${scoreNotation}`
      : top.headline ?? "Score movement",
    description: top.headline ?? "",
    severity: (absDelta >= 15 ? "critical" : absDelta >= 8 ? "high" : absDelta >= 3 ? "medium" : "low"),
    band: top.assessedBand ?? top.publishedBand ?? "",
    confidence: top.confidence ?? null,
    _synthesized: true,
  };
}

// ─── Evidence helpers ─────────────────────────────────────────────────────────

/** Pull the top EvidenceItem (the one with a quote, or first item). */
function pickTopEvidence(evidence: EvidenceItem[]): EvidenceItem | null {
  if (!evidence.length) return null;
  const withQuote = evidence.find(
    (e) => typeof e.quote === "string" && e.quote.trim().length > 0
  );
  return withQuote ?? evidence[0];
}

/**
 * True when the signal warrants a pull-quote (#9 spec):
 * band-crossing-finding or critical/high severity.
 */
function shouldShowPullQuote(lead: any): boolean {
  return (
    lead.actionType === "band-crossing-finding" ||
    lead.severity === "critical" ||
    lead.severity === "high"
  );
}

export default function LeadSignalCard({ updates }: Props) {
  const topSignals: any[] = Array.isArray(updates.topSignals) ? updates.topSignals : [];
  const scoreChanges: any[] = Array.isArray(updates.scoreChanges) ? updates.scoreChanges : [];

  const lead = pickLeadSignal(topSignals) ?? synthesizeLeadFromScoreChanges(scoreChanges);

  // Always render the #lead-signal anchor to prevent dead hero CTA links.
  if (!lead) {
    return (
      <section
        id="lead-signal"
        className="py-[30px] scroll-mt-24"
        aria-label="Lead signal"
      />
    );
  }

  const severity: string = lead.severity ?? "medium";
  const color = SEVERITY_COLORS[severity] ?? "#94a3b8";
  const href = lead.index && lead.slug ? entityHref(lead.index, lead.slug) : null;
  const band = normalizeBand(lead.band ?? "");

  // ── BandPositionStrip score resolution (ITEM 3) ───────────────────────────
  // Resolution order: (a) scoreChanges/recentAssessments numeric score by slug;
  // (b) entity registry composite score. Graceful — null if nothing resolves.
  const bandStripScore: number | null = (() => {
    if (!lead.slug) return null;
    // (a) try updates arrays (passed via updates prop — not available here;
    //     fall through to registry lookup which is always available statically)
    // (b) cross-kind registry lookup
    try {
      for (const kind of ALL_ENTITY_KINDS) {
        const entity = getEntityBySlug(kind, lead.slug);
        if (entity && typeof entity.composite === "number" && entity.composite >= 0 && entity.composite <= 100) {
          return entity.composite;
        }
      }
    } catch {
      // Never crash prerender
    }
    return null;
  })();
  const bandStripEntityName: string | undefined =
    lead.title ?? lead.slug ?? undefined;

  // ── Evidence (#8, #9, #11) ─────────────────────────────────────────────────
  // Guard: always safe even when evidence[] is absent
  const evidence: EvidenceItem[] = Array.isArray(lead.evidence) ? lead.evidence : [];
  const topEvidence = pickTopEvidence(evidence);
  const primaryEvidenceUrl: string | undefined =
    typeof lead.primaryEvidenceUrl === "string" && lead.primaryEvidenceUrl
      ? lead.primaryEvidenceUrl
      : undefined;

  // For the meta-row source chip: prefer the top evidence item's url/source,
  // fall back to primaryEvidenceUrl, fall back to nothing.
  const metaChipUrl = topEvidence?.url ?? primaryEvidenceUrl ?? null;
  const metaChipSource = topEvidence?.source ?? (primaryEvidenceUrl ? extractDomain(primaryEvidenceUrl) : undefined);
  const metaChipTier = topEvidence?.sourceTier;

  // Pull-quote: only when there's a quote AND the signal warrants it (#9)
  const showPullQuote =
    shouldShowPullQuote(lead) &&
    topEvidence !== null &&
    typeof topEvidence?.quote === "string" &&
    topEvidence.quote.trim().length > 0;

  // ── Description split (#10 evidence/interpretation separation) ─────────────
  // When evidence[] exists: keep existing description as "What we found"
  // (benchmark conclusion), and surface the evidence separately.
  // When no evidence[]: fall back to the original sentence-split behavior.
  const description: string = lead.description ?? "";
  const sentences = description.split(/(?<=[.!?])\s+/);
  const whatHappened = sentences.slice(0, 2).join(" ");
  const whyMatters = sentences.slice(2, 4).join(" ") || "";

  return (
    <section
      id="lead-signal"
      className="py-[30px] scroll-mt-24"
      aria-label="Lead signal"
    >
      <Container>
        <div className="mb-4 flex items-center gap-2">
          <span
            className="text-[0.7rem] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded border"
            style={{
              color,
              borderColor: `${color}55`,
              background: `${color}14`,
            }}
          >
            {lead._synthesized ? "Top score change" : "Lead signal"}
          </span>
          {severity && (
            <span
              className="text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
              style={{
                color,
                borderColor: `${color}44`,
                background: `${color}10`,
              }}
            >
              {severity}
            </span>
          )}
          {lead.actionType === "methodology-evolution" && (
            <span className="text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[rgba(167,139,250,0.4)] bg-[rgba(167,139,250,0.1)] text-[#a78bfa]">
              Methodology evolution
            </span>
          )}
          {lead.actionType === "band-crossing-finding" && (
            <span className="text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[rgba(251,146,60,0.4)] bg-[rgba(251,146,60,0.1)] text-[#fb923c]">
              Band crossing
            </span>
          )}
        </div>

        <article
          className="rounded-[22px] border p-6 sm:p-8"
          style={{
            borderColor: `${color}55`,
            background: `linear-gradient(160deg, ${color}12 0%, ${color}04 100%)`,
          }}
          aria-label={`Lead signal: ${lead.title}`}
        >
          <h2 className="text-[1.3rem] sm:text-[1.55rem] font-bold leading-snug mb-5">
            {href ? (
              <TrackedEntityLink
                href={href}
                slug={lead.slug}
                index={lead.index}
                source="topSignal"
                className="hover:text-accent transition-colors"
              >
                {lead.title}
              </TrackedEntityLink>
            ) : (
              lead.title
            )}
          </h2>

          {/* ITEM 3: BandPositionStrip — only when a numeric score is resolved */}
          {bandStripScore !== null && (
            <div className="mb-5 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-3 inline-block">
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
                Where this sits
              </div>
              <BandPositionStrip
                score={bandStripScore}
                entityName={bandStripEntityName}
                compact
              />
            </div>
          )}

          {/* #17 — Dominant dimension micro-bar ("why it moved")
              Only renders when dominantDimension is present in the lead signal;
              degrades gracefully — no invented data. */}
          {(() => {
            const dd = lead.dominantDimension;
            if (!dd || typeof dd.code !== "string" || typeof dd.delta !== "number") return null;
            const dim = DIMENSIONS.find((d) => d.code === dd.code);
            const dimName = dim?.name ?? dd.code;
            const dimColor = dim?.color ?? "#94a3b8";
            const dc = deltaColor(dd.delta);
            const absDelta = Math.abs(dd.delta);
            // Scale bar to a max of 5.0 (dimensional scale is 1–5)
            const barPct = Math.min(100, Math.round((absDelta / 5.0) * 100));
            const sign = dd.delta > 0 ? "+" : dd.delta < 0 ? "−" : "";
            const absStr = absDelta % 1 === 0 ? absDelta : absDelta.toFixed(2);
            return (
              <div className="mb-5 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
                  Why it moved — dominant dimension
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-[0.78rem] font-semibold shrink-0"
                    style={{ color: dimColor }}
                  >
                    {dimName}
                  </span>
                  <div className="flex-1 h-[6px] rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${barPct}%`, background: dc, opacity: 0.8 }}
                    />
                  </div>
                  <span
                    className="text-[0.78rem] font-bold tabular-nums shrink-0"
                    style={{ color: dc }}
                  >
                    {sign}{absStr}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* #10 Evidence / interpretation separation ─────────────────────── */}
          {evidence.length > 0 ? (
            <div className="space-y-5 mb-6">
              {/* What the evidence shows — verbatim pull-quote zone (#9) */}
              {showPullQuote && topEvidence && (
                <div>
                  <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
                    What the evidence shows
                  </div>
                  <EvidenceQuote item={topEvidence} />
                  {/* Sources (N) disclosure for ≥2 items (#11) */}
                  <SourcesDisclosure evidence={evidence} withQuotes />
                </div>
              )}

              {/* What we found — benchmark conclusion */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {whatHappened && (
                  <div>
                    <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
                      What we found
                    </div>
                    <p className="text-[0.95rem] text-text leading-relaxed">
                      {whatHappened}
                    </p>
                  </div>
                )}
                {whyMatters && (
                  <div>
                    <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
                      Why it matters
                    </div>
                    <p className="text-[0.95rem] text-muted leading-relaxed">
                      {whyMatters}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* No evidence[] — original two-column layout */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {whatHappened && (
                <div>
                  <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
                    What happened
                  </div>
                  <p className="text-[0.95rem] text-text leading-relaxed">
                    {whatHappened}
                  </p>
                </div>
              )}
              {whyMatters && (
                <div>
                  <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
                    Why it matters
                  </div>
                  <p className="text-[0.95rem] text-muted leading-relaxed">
                    {whyMatters}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Meta row — #8: named SourceChip replaces the anonymous icon ─── */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[rgba(255,255,255,0.07)]">
            {lead.index && (
              <span className="text-[0.78rem] text-muted">
                {formatIndex(lead.index)}
              </span>
            )}
            {band && <Band level={band} />}
            {lead.confidence && (
              <span
                className="text-[0.75rem] font-semibold px-2 py-0.5 rounded border border-line text-muted"
                aria-label={`Confidence: ${lead.confidence}`}
              >
                {lead.confidence} confidence
              </span>
            )}

            {/* #8: named source chip (evidence url → primaryEvidenceUrl → nothing) */}
            {metaChipUrl && (
              <SourceChip
                url={metaChipUrl}
                source={metaChipSource}
                tier={metaChipTier}
                className="inline-flex items-center gap-1 text-[0.75rem] text-muted hover:text-text transition-colors underline underline-offset-2 decoration-[rgba(255,255,255,0.2)] font-medium"
              />
            )}

            {href && (
              <div className="ml-auto">
                <TrackedEntityLink
                  href={href}
                  slug={lead.slug}
                  index={lead.index}
                  source="topSignal"
                  className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-[#7dd3fc] hover:text-text transition-colors group"
                >
                  {lead.entity ? `See ${lead.entity}'s full history & 8 dimensions` : "See the full breakdown"}
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                    aria-hidden="true"
                    className="group-hover:translate-x-0.5 transition-transform"
                  >
                    <path
                      d="M2.5 6.5h8M7 3l3.5 3.5L7 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </TrackedEntityLink>
              </div>
            )}
          </div>
        </article>
      </Container>
    </section>
  );
}
