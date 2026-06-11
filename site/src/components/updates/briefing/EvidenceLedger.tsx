/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "@/components/ui/Container";
import { extractDomain } from "./utils";
import {
  type EvidenceItem,
  TIER_LABELS,
  TIER_COLORS,
  ExternalLinkIcon,
  SourceChip,
  EvidenceQuote,
} from "./evidence";

interface Props {
  updates: any;
}

// Enrich with display context when aggregating from parent objects
interface RichEvidenceItem extends EvidenceItem {
  entity?: string;
  entitySlug?: string;
  index?: string;
}

// ─── Legacy source-URL row (for the existing table fallback) ─────────────────

type SourceType = "news" | "ngo" | "government" | "academic" | "legal" | "unknown";

function inferSourceType(domain: string): SourceType {
  const d = domain.toLowerCase();
  if (/gov|state\.gov|europa\.eu|un\.org|unicef|who\.int|ocha/i.test(d))
    return "government";
  if (/amnesty|hrw|icj\.org|icc|oxfam|msf|redcross/i.test(d))
    return "ngo";
  if (/arxiv|scholar|academic|ssrn|pubmed|jstor|edu(?:$|\.)/i.test(d))
    return "academic";
  if (/court|ecj|echr|law|legal|litigation|justice/i.test(d))
    return "legal";
  if (/reuters|bbc|nytimes|washingtonpost|guardian|ap\.|apnews|aljazeera|euronews|ft\.|bloomberg|wsj/i.test(d))
    return "news";
  return "unknown";
}

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  news: "News",
  ngo: "NGO",
  government: "Government",
  academic: "Academic",
  legal: "Legal",
  unknown: "Source",
};

const SOURCE_TYPE_COLORS: Record<SourceType, string> = {
  news: "#7dd3fc",
  ngo: "#86efac",
  government: "#fcd34d",
  academic: "#a78bfa",
  legal: "#fb923c",
  unknown: "#94a3b8",
};

interface LegacySourceRow {
  url: string;
  domain: string;
  sourceType: SourceType;
  entity: string;
  entitySlug?: string;
  index?: string;
  dimension?: string;
  tier?: string;
}

// ─── Structured evidence extraction ──────────────────────────────────────────

function extractStructuredEvidence(updates: any): RichEvidenceItem[] {
  const items: RichEvidenceItem[] = [];
  const seenUrls = new Set<string>();

  function addItem(raw: any, entity?: string, entitySlug?: string, index?: string) {
    if (!raw || typeof raw !== "object") return;
    const url = raw.url ?? raw.archivedUrl ?? "";
    if (url && seenUrls.has(url)) return;
    if (url) seenUrls.add(url);
    items.push({ ...raw, entity, entitySlug, index } as RichEvidenceItem);
  }

  const topSignals: any[] = Array.isArray(updates.topSignals) ? updates.topSignals : [];
  for (const s of topSignals) {
    if (!Array.isArray(s.evidence)) continue;
    for (const ev of s.evidence) {
      addItem(ev, s.entity ?? s.slug ?? "", s.slug, s.index);
    }
  }

  const recentAssessments: any[] = Array.isArray(updates.recentAssessments) ? updates.recentAssessments : [];
  for (const a of recentAssessments) {
    if (!Array.isArray(a.evidence)) continue;
    for (const ev of a.evidence) {
      addItem(ev, a.entity ?? a.slug ?? "", a.slug, a.index);
    }
  }

  return items;
}

// ─── Legacy source-URL extraction (fallback when no structured evidence[]) ───

function extractLegacySources(updates: any): LegacySourceRow[] {
  const rows: LegacySourceRow[] = [];
  const seenUrls = new Set<string>();

  const topSignals: any[] = Array.isArray(updates.topSignals) ? updates.topSignals : [];
  const sectorAlerts: any[] = Array.isArray(updates.sectorAlerts) ? updates.sectorAlerts : [];
  const scoreChanges: any[] = Array.isArray(updates.scoreChanges) ? updates.scoreChanges : [];
  const recentAssessments: any[] = Array.isArray(updates.recentAssessments) ? updates.recentAssessments : [];

  function addUrl(url: string, entity: string, index?: string, dimension?: string, tier?: string) {
    if (!url || seenUrls.has(url)) return;
    seenUrls.add(url);
    const domain = extractDomain(url);
    rows.push({ url, domain, sourceType: inferSourceType(domain), entity, index, dimension, tier });
  }

  for (const s of topSignals) {
    if (Array.isArray(s.sources)) {
      for (const src of s.sources) {
        if (typeof src === "string") addUrl(src, s.entity ?? s.slug ?? "", s.index);
        else if (typeof src === "object" && src?.url) addUrl(src.url, s.entity ?? s.slug ?? "", s.index, src.dimension, src.tier);
      }
    }
  }

  for (const a of recentAssessments) {
    if (typeof a.primaryEvidenceUrl === "string" && a.primaryEvidenceUrl) {
      addUrl(a.primaryEvidenceUrl, a.entity ?? a.slug ?? "", a.index);
    }
  }

  for (const a of sectorAlerts) {
    if (Array.isArray(a.sources)) {
      for (const src of a.sources) {
        if (typeof src === "string") addUrl(src, a.sector ?? "", a.index);
      }
    }
  }

  for (const c of scoreChanges) {
    if (Array.isArray(c.evidence)) {
      for (const ev of c.evidence) {
        if (typeof ev === "object" && ev?.url) addUrl(ev.url, c.entity ?? "", c.index, ev.dimensionsAffected?.[0]);
      }
    }
    if (Array.isArray(c.sources)) {
      for (const src of c.sources) {
        if (typeof src === "string") addUrl(src, c.entity ?? "", c.index);
      }
    }
  }

  return rows;
}

// ─── Structured evidence card (ledger-specific: includes entity metadata row) ─

interface EvidenceCardProps {
  item: RichEvidenceItem;
}

function EvidenceCard({ item }: EvidenceCardProps) {
  const tierColor = item.sourceTier ? TIER_COLORS[item.sourceTier] : null;
  const tierLabel = item.sourceTier ? TIER_LABELS[item.sourceTier] : null;

  return (
    <div className="py-3 px-4 border-b border-line last:border-b-0">
      {/* Entity + tier + date meta row */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {item.entity && (
          <span className="text-[0.72rem] font-bold uppercase tracking-wider text-muted">
            {item.entity}
          </span>
        )}
        {tierLabel && tierColor && (
          <span
            className="text-[0.65rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
            style={{ color: tierColor, borderColor: `${tierColor}44`, background: `${tierColor}12` }}
          >
            {tierLabel}
          </span>
        )}
        {item.publishedDate && (
          <span className="text-[0.72rem] text-muted">{item.publishedDate}</span>
        )}
      </div>

      {/* Verbatim quote + source chip — use shared EvidenceQuote */}
      <EvidenceQuote item={item} />

      {/* Claim this quote supports */}
      {typeof item.claim === "string" && item.claim.trim() && (
        <p className="text-[0.82rem] text-muted mt-2 leading-snug">{item.claim}</p>
      )}
    </div>
  );
}

// ─── Legacy URL table row ─────────────────────────────────────────────────────

interface LegacyRowProps {
  row: LegacySourceRow;
}

function LegacyRow({ row }: LegacyRowProps) {
  const typeColor = SOURCE_TYPE_COLORS[row.sourceType];
  return (
    <tr className="border-b border-line last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
      <td className="py-2.5 px-4 font-mono text-[0.82rem] text-text">{row.domain}</td>
      <td className="py-2.5 px-4">
        <span
          className="text-[0.7rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
          style={{ color: typeColor, borderColor: `${typeColor}44`, background: `${typeColor}12` }}
        >
          {SOURCE_TYPE_LABELS[row.sourceType]}
        </span>
      </td>
      <td className="py-2.5 px-4 text-muted text-[0.85rem]">{row.entity || "—"}</td>
      <td className="py-2.5 px-4 text-muted text-[0.82rem] font-mono">
        {row.dimension ?? row.tier ?? "—"}
      </td>
      <td className="py-2.5 px-4">
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[0.78rem] text-[#7dd3fc] hover:text-text transition-colors underline underline-offset-2 decoration-[rgba(125,211,252,0.35)]"
          aria-label={`Open source: ${row.domain} (opens in new tab)`}
        >
          Open
          <ExternalLinkIcon />
        </a>
      </td>
    </tr>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function EvidenceLedger({ updates }: Props) {
  const structuredItems = extractStructuredEvidence(updates);
  const hasStructured = structuredItems.length > 0;

  const legacyRows = hasStructured ? [] : extractLegacySources(updates);
  const hasLegacy = legacyRows.length > 0;

  if (!hasStructured && !hasLegacy) return null;

  const totalCount = hasStructured ? structuredItems.length : legacyRows.length;

  return (
    <section
      id="evidence-ledger"
      className="py-[30px] scroll-mt-24"
      aria-label="Evidence ledger: primary sources reviewed"
    >
      <Container>
        <div className="mb-4">
          <h2 className="text-[1.25rem] font-bold mb-1">Evidence ledger</h2>
          <p className="text-muted text-[0.88rem]">
            Primary sources reviewed in this briefing cycle.{" "}
            {totalCount} source{totalCount !== 1 ? "s" : ""} linked.
          </p>
        </div>

        {/* Structured evidence cards */}
        {hasStructured && (
          <div className="rounded-[16px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden">
            {structuredItems.map((item, i) => (
              <EvidenceCard key={`${item.url ?? item.source}-${i}`} item={item} />
            ))}
          </div>
        )}

        {/* Legacy URL table — fallback when only primaryEvidenceUrl / sources[] present */}
        {hasLegacy && (
          <div className="rounded-[16px] border border-line bg-[rgba(255,255,255,0.02)] overflow-x-auto">
            <table className="w-full border-collapse text-[0.85rem]">
              <caption className="sr-only">
                Primary sources reviewed in this briefing: domain, source type, entity linked, dimension, and external link.
              </caption>
              <thead>
                <tr className="border-b border-line">
                  {["Source", "Type", "Entity", "Dimension", "Link"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="text-left text-[0.72rem] font-bold uppercase tracking-wider text-muted py-3 px-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {legacyRows.map((row, i) => (
                  <LegacyRow key={`${row.url}-${i}`} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </section>
  );
}
