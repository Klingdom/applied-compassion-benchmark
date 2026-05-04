import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHead from "@/components/ui/SectionHead";
import TrackedEntityLink from "@/components/updates/TrackedEntityLink";
import { getEntityBySlug } from "@/data/entities";
import type { EntityKind } from "@/data/entities";
import { DIMENSIONS } from "@/data/dimensions";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * TopSignals — the briefing's lead intelligence section.
 *
 * Surfaces 3–5 highest-severity cross-entity signals from the day's research.
 * Primary source is `sectorAlerts` (already cross-entity by construction).
 * If a day ships zero sector alerts, falls back to highest-magnitude score
 * changes reformatted as signals so the briefing always leads with substance.
 *
 * SCHEMA DRIFT DEFENSE:
 * The overnight digest has shipped at least three sectorAlerts shapes:
 *   v1 (≤2026-04-20): { sector, alert, affected_entities, sources }
 *   v2 (≈2026-04-21): { sector, alert, affected_entities, sources, watchDate }
 *   v3 (≥2026-04-28): { sector, severity, summary | headline, affectedEntities,
 *                        actionRequired?, date? }
 * `normalizeAlert` coerces all three into a single render-safe shape.
 *
 * SEVERITY ORDERING:
 * critical > high > medium > low; missing severity defaults to "medium" so
 * older alerts still render in a sensible position relative to v3 alerts.
 *
 * CATEGORY TAGGING:
 * `categorize()` is a deterministic keyword classifier over the sector string.
 * It runs over the *normalized* sector and is the single source of truth for
 * the category badge. New categories should be added here, not in render code.
 */

interface TopSignalsProps {
  updates: any;
}

type Severity = "critical" | "high" | "medium" | "low";

interface NormalizedAlert {
  sector: string;
  severity: Severity;
  body: string;
  affectedEntities: string[];
  actionRequired: string | null;
  sources: string[];
  watchDate: string | null;
  /** 3-letter dimension codes implicated by this signal (e.g. ["SYS", "INT"]). */
  dimensions: string[];
}

/**
 * Dimension lookup: code → { name, color }.
 * Built from the canonical 8-dimension catalog so chip styling stays in sync
 * with the rest of the site (dimension landing pages, methodology, entity
 * detail pages).
 */
const DIMENSION_LOOKUP: Record<string, { name: string; color: string }> =
  DIMENSIONS.reduce(
    (acc, d) => {
      acc[d.code] = { name: d.name, color: d.color };
      return acc;
    },
    {} as Record<string, { name: string; color: string }>,
  );

/**
 * Build a prefix-keyed lookup from `sectorTrends` for joining onto
 * `sectorAlerts`. The two arrays use related-but-not-identical sector strings
 * (alerts: "AI Labs — Safety Incident Cluster"; trends: "AI Labs"), so we
 * key by the lowercased parent prefix (everything before " — ") on both
 * sides and accept any prefix match.
 *
 * Methodology-only clusters (e.g. "Floor-Limitation Cluster — CRITICAL") have
 * no equivalent trend and intentionally produce zero dimensions — chips are
 * simply omitted, since the floor-limitation gap is structural, not sector-
 * specific.
 */
function buildTrendDimensionsMap(
  trends: any[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  if (!Array.isArray(trends)) return map;
  for (const t of trends) {
    const sector = String(t?.sector ?? "");
    const dims = Array.isArray(t?.dimensionsAffected) ? t.dimensionsAffected : [];
    if (!sector || dims.length === 0) continue;
    const key = sector.toLowerCase().split(" — ")[0].trim();
    // First write wins — preserves digest authoring order for ties.
    if (!map.has(key)) map.set(key, dims);
  }
  return map;
}

function lookupDimensionsForSector(
  alertSector: string,
  trendMap: Map<string, string[]>,
): string[] {
  if (trendMap.size === 0) return [];
  const key = alertSector.toLowerCase().split(" — ")[0].trim();
  return trendMap.get(key) ?? [];
}

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const SEVERITY_THEME: Record<Severity, {
  label: string;
  color: string;
  border: string;
  background: string;
  dotShadow: string;
}> = {
  critical: {
    label: "Critical",
    color: "#f87171",
    border: "rgba(248,113,113,0.45)",
    background:
      "linear-gradient(160deg, rgba(248,113,113,0.10) 0%, rgba(251,146,60,0.04) 100%)",
    dotShadow: "0 0 0 6px rgba(248,113,113,0.18)",
  },
  high: {
    label: "High",
    color: "#fb923c",
    border: "rgba(251,146,60,0.40)",
    background:
      "linear-gradient(160deg, rgba(251,146,60,0.09) 0%, rgba(252,211,77,0.04) 100%)",
    dotShadow: "0 0 0 6px rgba(251,146,60,0.16)",
  },
  medium: {
    label: "Medium",
    color: "#fcd34d",
    border: "rgba(252,211,77,0.35)",
    background:
      "linear-gradient(160deg, rgba(252,211,77,0.07) 0%, rgba(125,211,252,0.03) 100%)",
    dotShadow: "0 0 0 6px rgba(252,211,77,0.14)",
  },
  low: {
    label: "Low",
    color: "#7dd3fc",
    border: "rgba(125,211,252,0.30)",
    background:
      "linear-gradient(160deg, rgba(125,211,252,0.06) 0%, rgba(255,255,255,0.02) 100%)",
    dotShadow: "0 0 0 6px rgba(125,211,252,0.12)",
  },
};

function isSeverity(s: unknown): s is Severity {
  return s === "critical" || s === "high" || s === "medium" || s === "low";
}

function normalizeAlert(
  raw: any,
  trendMap: Map<string, string[]>,
): NormalizedAlert {
  const sector = String(raw.sector ?? "Signal");

  // Dimensions resolution order:
  //   1. Direct field on the alert (future schema).
  //   2. Prefix-key join into sectorTrends.dimensionsAffected.
  //   3. None (chips omitted) — methodology-only clusters land here.
  const directDims = Array.isArray(raw.dimensionsAffected)
    ? raw.dimensionsAffected
    : null;
  const joinedDims = directDims ?? lookupDimensionsForSector(sector, trendMap);
  // Filter to recognized dimension codes only — guards against typos in
  // upstream digest authoring that would otherwise render unknown chips.
  const dimensions = (joinedDims as string[]).filter(
    (code) => Boolean(DIMENSION_LOOKUP[code]),
  );

  return {
    sector,
    severity: isSeverity(raw.severity) ? raw.severity : "medium",
    body: String(raw.summary ?? raw.headline ?? raw.alert ?? ""),
    affectedEntities: Array.isArray(raw.affectedEntities)
      ? raw.affectedEntities
      : Array.isArray(raw.affected_entities)
        ? raw.affected_entities
        : [],
    actionRequired: raw.actionRequired ? String(raw.actionRequired) : null,
    sources: Array.isArray(raw.sources) ? raw.sources : [],
    watchDate: raw.watchDate ?? raw.date ?? null,
    dimensions,
  };
}

/**
 * Severity → directional pressure indicator for dimension chips.
 * Sector alerts are by construction *concerning patterns*, so dimension
 * impact is interpreted as negative. Indicator strength scales with severity.
 */
function pressureIndicator(severity: Severity): { glyph: string; aria: string } {
  switch (severity) {
    case "critical":
      return { glyph: "↓↓", aria: "severe negative pressure" };
    case "high":
      return { glyph: "↓", aria: "negative pressure" };
    case "medium":
      return { glyph: "⚠", aria: "warning" };
    case "low":
    default:
      return { glyph: "·", aria: "watch" };
  }
}

/**
 * Heuristic category classifier — deterministic, ordered. First match wins.
 * Keep narrow → broad. Editorial categories surfaced as colored badges.
 */
function categorize(sector: string): string {
  const s = sector.toLowerCase();
  if (s.includes("floor-limit") || s.includes("methodology")) return "Methodology";
  if (s.includes("ai lab") || s.includes("ai safety") || s.includes("ai —")) return "AI";
  if (s.includes("labor") || s.includes("layoff") || s.includes("buyout")) return "Labor";
  if (s.includes("conflict") || s.includes("sudan") || s.includes("gaza") || s.includes("israel")) return "Conflict";
  if (s.includes("regulator") || s.includes("eu ") || s.includes("ftc") || s.includes("doj")) return "Regulatory";
  if (s.includes("litigation") || s.includes("trial") || s.includes("court")) return "Legal";
  if (s.includes("fortune") || s.includes("corporate")) return "Corporate";
  if (s.includes("countries") || s.includes("sovereign") || s.includes("rotation")) return "Sovereign";
  if (s.includes("state") || s.includes("cities") || s.includes("city ") || s.includes("us ")) return "Subnational";
  if (s.includes("immigration") || s.includes("ice")) return "Civil Rights";
  if (s.includes("governance")) return "Governance";
  return "Signal";
}

function categoryStyle(cat: string): { color: string; bg: string; border: string } {
  switch (cat) {
    case "AI":
      return { color: "#a78bfa", bg: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.32)" };
    case "Labor":
      return { color: "#fcd34d", bg: "rgba(252,211,77,0.10)", border: "rgba(252,211,77,0.32)" };
    case "Methodology":
      return { color: "#94a3b8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.32)" };
    case "Conflict":
      return { color: "#f87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.32)" };
    case "Regulatory":
      return { color: "#7dd3fc", bg: "rgba(125,211,252,0.10)", border: "rgba(125,211,252,0.32)" };
    case "Legal":
      return { color: "#f472b6", bg: "rgba(244,114,182,0.10)", border: "rgba(244,114,182,0.32)" };
    case "Corporate":
      return { color: "#86efac", bg: "rgba(134,239,172,0.10)", border: "rgba(134,239,172,0.32)" };
    case "Sovereign":
      return { color: "#34d399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.32)" };
    case "Subnational":
      return { color: "#fb923c", bg: "rgba(251,146,60,0.10)", border: "rgba(251,146,60,0.32)" };
    case "Civil Rights":
      return { color: "#c084fc", bg: "rgba(192,132,252,0.10)", border: "rgba(192,132,252,0.32)" };
    case "Governance":
      return { color: "#7dd3fc", bg: "rgba(125,211,252,0.10)", border: "rgba(125,211,252,0.32)" };
    default:
      return { color: "#94a3b8", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" };
  }
}

const SLUG_LOOKUP_KINDS: EntityKind[] = [
  "ai-lab",
  "company",
  "robotics-lab",
  "country",
  "city",
  "us-city",
  "us-state",
];

const SLUG_LOOKUP_PREFIXES: Record<EntityKind, string> = {
  "ai-lab": "ai-lab",
  company: "company",
  "robotics-lab": "robotics-lab",
  country: "country",
  city: "city",
  "us-city": "us-city",
  "us-state": "us-state",
};

const KIND_TO_INDEX_SLUG: Record<EntityKind, string> = {
  "ai-lab": "ai-labs",
  company: "fortune-500",
  "robotics-lab": "robotics-labs",
  country: "countries",
  city: "global-cities",
  "us-city": "us-cities",
  "us-state": "us-states",
};

function resolveSlugHref(
  entitySlug: string,
): { href: string; index: string; entity: any } | null {
  for (const kind of SLUG_LOOKUP_KINDS) {
    const entity = getEntityBySlug(kind, entitySlug);
    if (entity) {
      return {
        href: `/${SLUG_LOOKUP_PREFIXES[kind]}/${entitySlug}`,
        index: KIND_TO_INDEX_SLUG[kind],
        entity,
      };
    }
  }
  return null;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Split a long body into "What happened" / "Why it matters" by sentence.
 * If body has ≤1 sentence we return only `what` and let render skip `why`.
 */
function splitBody(body: string): { what: string; why: string } {
  const sentences = body.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length === 0) return { what: body, why: "" };
  if (sentences.length === 1) return { what: sentences[0], why: "" };
  // First 1–2 sentences = what happened; remainder = why it matters.
  const splitAt = sentences.length >= 4 ? 2 : 1;
  return {
    what: sentences.slice(0, splitAt).join(" "),
    why: sentences.slice(splitAt).join(" "),
  };
}

/**
 * Fallback: when a day has no sectorAlerts, synthesize signals from
 * highest-magnitude score changes so the briefing always leads with substance.
 */
function fallbackSignalsFromScoreChanges(scoreChanges: any[]): NormalizedAlert[] {
  const ranked = [...scoreChanges]
    .sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0))
    .slice(0, 5);
  return ranked.map((c) => ({
    sector: `${c.entity ?? "Entity"} — Score ${c.delta < 0 ? "downgrade" : "upgrade"}`,
    severity: (Math.abs(c.delta ?? 0) >= 15
      ? "critical"
      : Math.abs(c.delta ?? 0) >= 8
        ? "high"
        : Math.abs(c.delta ?? 0) >= 3
          ? "medium"
          : "low") as Severity,
    body: c.headline ?? "",
    affectedEntities: c.slug ? [c.slug] : [],
    actionRequired: null,
    sources: [],
    watchDate: c.date ?? null,
    // Score-change fallbacks have no sector context to join, so dimensions
    // stay empty by design.
    dimensions: [],
  }));
}

export default function TopSignals({ updates }: TopSignalsProps) {
  const rawAlerts: any[] = Array.isArray(updates.sectorAlerts) ? updates.sectorAlerts : [];
  const scoreChanges: any[] = Array.isArray(updates.scoreChanges) ? updates.scoreChanges : [];
  const rawTrends: any[] = Array.isArray(updates.sectorTrends) ? updates.sectorTrends : [];

  // Build the prefix-keyed trend → dimensions lookup once per render.
  const trendMap = buildTrendDimensionsMap(rawTrends);

  // Normalize, sort by severity, cap at 5.
  let signals: NormalizedAlert[] = rawAlerts.map((a) => normalizeAlert(a, trendMap));

  // If no sector alerts shipped, synthesize from score changes.
  if (signals.length === 0 && scoreChanges.length > 0) {
    signals = fallbackSignalsFromScoreChanges(scoreChanges);
  }

  signals.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
  signals = signals.slice(0, 5);

  // No signals at all (no alerts AND no score changes) — render nothing rather
  // than an empty section. This is rare but possible on a sparse confirmation
  // night with schema drift; the rest of the page still renders.
  if (signals.length === 0) return null;

  return (
    <section id="top-signals" className="py-[30px] scroll-mt-24">
      <Container>
        <SectionHead
          title="Top findings"
          description="The most material cross-entity intelligence in this briefing. Each finding is grounded in primary-source evidence."
        />

        <div className="grid grid-cols-1 gap-4">
          {signals.map((signal, i) => {
            const theme = SEVERITY_THEME[signal.severity];
            const category = categorize(signal.sector);
            const catStyle = categoryStyle(category);
            const { what, why } = splitBody(signal.body);
            const visibleEntities = signal.affectedEntities.slice(0, 6);
            const overflowCount = Math.max(0, signal.affectedEntities.length - visibleEntities.length);

            return (
              <article
                key={`${signal.sector}-${i}`}
                className="rounded-[20px] border p-6 relative"
                style={{ borderColor: theme.border, background: theme.background }}
              >
                {/* Header strip: severity dot + category + watch date */}
                <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-widest" style={{ color: theme.color }}>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: theme.color, boxShadow: theme.dotShadow }}
                      aria-hidden="true"
                    />
                    {theme.label} severity
                  </span>
                  <span
                    className="text-[0.74rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{ color: catStyle.color, background: catStyle.bg, borderColor: catStyle.border }}
                  >
                    {category}
                  </span>
                  <span className="text-muted text-[0.78rem]">·</span>
                  <span className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider">
                    Signal {String(i + 1).padStart(2, "0")}
                  </span>
                  {signal.watchDate && (
                    <>
                      <span className="text-muted text-[0.78rem]">·</span>
                      <time
                        dateTime={signal.watchDate}
                        className="text-muted text-[0.78rem] font-semibold"
                      >
                        Watch: {signal.watchDate}
                      </time>
                    </>
                  )}
                </div>

                {/* Headline */}
                <h3 className="text-[1.25rem] sm:text-[1.4rem] font-bold leading-tight mb-3 tracking-tight">
                  {signal.sector}
                </h3>

                {/* Dimensions implicated — chip row, color-coded per dimension,
                    direction inferred from severity (sector alerts are by
                    construction concerning patterns; severity scales the
                    pressure indicator). */}
                {signal.dimensions.length > 0 && (() => {
                  const pressure = pressureIndicator(signal.severity);
                  return (
                    <div className="mb-4">
                      <div className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mb-1.5">
                        Dimensions implicated
                      </div>
                      <div
                        className="flex flex-wrap gap-1.5"
                        role="list"
                        aria-label="Dimensions implicated by this signal"
                      >
                        {signal.dimensions.map((code) => {
                          const meta = DIMENSION_LOOKUP[code];
                          if (!meta) return null;
                          return (
                            <span
                              key={code}
                              role="listitem"
                              title={`${meta.name} — ${pressure.aria}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.78rem] font-bold tabular-nums"
                              style={{
                                color: meta.color,
                                background: `${meta.color}1a`,
                                borderColor: `${meta.color}55`,
                              }}
                            >
                              <span className="leading-none">{code}</span>
                              <span
                                className="leading-none text-[0.7rem] opacity-90"
                                aria-hidden="true"
                              >
                                {pressure.glyph}
                              </span>
                              <span className="sr-only">{pressure.aria}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* What happened */}
                <div className="mb-3">
                  <div className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mb-1.5">
                    What happened
                  </div>
                  <p className="text-[0.95rem] text-text leading-relaxed">{what}</p>
                </div>

                {/* Why it matters (only if there's a separable second clause) */}
                {why && (
                  <div className="mb-3">
                    <div className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mb-1.5">
                      Why it matters
                    </div>
                    <p className="text-[0.92rem] text-muted leading-relaxed">{why}</p>
                  </div>
                )}

                {/* Action required */}
                {signal.actionRequired && (
                  <div className="mb-4 p-3 rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.18)]">
                    <div className="text-[0.72rem] font-bold uppercase tracking-widest mb-1" style={{ color: theme.color }}>
                      What's next
                    </div>
                    <p className="text-[0.88rem] text-text leading-relaxed">{signal.actionRequired}</p>
                  </div>
                )}

                {/* Affected entities */}
                {visibleEntities.length > 0 && (
                  <div>
                    <div className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mb-2">
                      Affected entities
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {visibleEntities.map((slug) => {
                        const resolved = resolveSlugHref(slug);
                        if (resolved) {
                          return (
                            <TrackedEntityLink
                              key={slug}
                              href={resolved.href}
                              slug={slug}
                              index={resolved.index}
                              source="topSignal"
                              className="text-[0.82rem] font-semibold px-2.5 py-1 rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] text-text hover:border-[rgba(125,211,252,0.45)] hover:bg-[rgba(125,211,252,0.10)] hover:text-[#7dd3fc] transition-colors"
                            >
                              {resolved.entity?.entity ?? slug}
                            </TrackedEntityLink>
                          );
                        }
                        return (
                          <span
                            key={slug}
                            className="text-[0.82rem] font-semibold px-2.5 py-1 rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] text-muted"
                          >
                            {slug}
                          </span>
                        );
                      })}
                      {overflowCount > 0 && (
                        <span className="text-[0.82rem] font-semibold px-2.5 py-1 rounded-full border border-[rgba(255,255,255,0.06)] text-muted">
                          +{overflowCount} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Sources */}
                {signal.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <div className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mb-2">
                      Primary sources
                    </div>
                    <ol className="space-y-1">
                      {signal.sources.slice(0, 3).map((src, j) => (
                        <li key={j} className="flex items-baseline gap-2">
                          <span className="text-[0.74rem] font-bold shrink-0" style={{ color: theme.color }}>
                            {j + 1}.
                          </span>
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[0.82rem] underline underline-offset-2 break-all transition-colors"
                            style={{ color: theme.color }}
                          >
                            {extractDomain(src)}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Anchor down to the deeper sections */}
        <div className="mt-6 flex items-center gap-2 text-muted text-[0.85rem]">
          <span>Continue to</span>
          {scoreChanges.length > 0 && (
            <>
              <Link href="#score-movements" className="text-[#7dd3fc] hover:text-text font-semibold transition-colors">
                Score movements ({scoreChanges.length})
              </Link>
              <span>·</span>
            </>
          )}
          <Link href="#highlights" className="text-[#7dd3fc] hover:text-text font-semibold transition-colors">
            Today&apos;s analysis
          </Link>
          <span>·</span>
          <Link href="#emerging-risks" className="text-[#7dd3fc] hover:text-text font-semibold transition-colors">
            Risk signals
          </Link>
        </div>
      </Container>
    </section>
  );
}
