/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "@/components/ui/Container";
import { extractDomain } from "./utils";

interface Props {
  updates: any;
}

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

interface EvidenceRow {
  url: string;
  domain: string;
  sourceType: SourceType;
  entity: string;
  entitySlug?: string;
  index?: string;
  dimension?: string;
  tier?: string;
}

function extractSourcesFromSignals(updates: any): EvidenceRow[] {
  const rows: EvidenceRow[] = [];
  const seenUrls = new Set<string>();

  const topSignals: any[] = Array.isArray(updates.topSignals) ? updates.topSignals : [];
  const sectorAlerts: any[] = Array.isArray(updates.sectorAlerts) ? updates.sectorAlerts : [];
  const scoreChanges: any[] = Array.isArray(updates.scoreChanges) ? updates.scoreChanges : [];

  function addUrl(url: string, entity: string, index?: string, dimension?: string, tier?: string) {
    if (!url || seenUrls.has(url)) return;
    seenUrls.add(url);
    const domain = extractDomain(url);
    rows.push({
      url,
      domain,
      sourceType: inferSourceType(domain),
      entity,
      index,
      dimension,
      tier,
    });
  }

  // topSignals.sources
  for (const s of topSignals) {
    if (Array.isArray(s.sources)) {
      for (const src of s.sources) {
        if (typeof src === "string") {
          addUrl(src, s.entity ?? s.slug ?? "", s.index);
        } else if (typeof src === "object" && src.url) {
          addUrl(src.url, s.entity ?? s.slug ?? "", s.index, src.dimension, src.tier);
        }
      }
    }
  }

  // sectorAlerts.sources
  for (const a of sectorAlerts) {
    if (Array.isArray(a.sources)) {
      for (const src of a.sources) {
        if (typeof src === "string") {
          addUrl(src, a.sector ?? "", a.index);
        }
      }
    }
  }

  // scoreChanges evidence
  for (const c of scoreChanges) {
    if (Array.isArray(c.evidence)) {
      for (const ev of c.evidence) {
        if (typeof ev === "object" && ev.url) {
          addUrl(ev.url, c.entity ?? "", c.index, ev.dimensionsAffected?.[0]);
        }
      }
    }
    if (Array.isArray(c.sources)) {
      for (const src of c.sources) {
        if (typeof src === "string") {
          addUrl(src, c.entity ?? "", c.index);
        }
      }
    }
  }

  return rows;
}

export default function EvidenceLedger({ updates }: Props) {
  const rows = extractSourcesFromSignals(updates);
  if (rows.length === 0) return null;

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
            {rows.length} source{rows.length !== 1 ? "s" : ""} linked.
          </p>
        </div>

        <div className="rounded-[16px] border border-line bg-[rgba(255,255,255,0.02)] overflow-x-auto">
          <table className="w-full border-collapse text-[0.85rem]">
            <caption className="sr-only">
              Primary sources reviewed in this briefing: domain, source type, entity linked, dimension, and external link.
            </caption>
            <thead>
              <tr className="border-b border-line">
                <th
                  scope="col"
                  className="text-left text-[0.72rem] font-bold uppercase tracking-wider text-muted py-3 px-4"
                >
                  Source
                </th>
                <th
                  scope="col"
                  className="text-left text-[0.72rem] font-bold uppercase tracking-wider text-muted py-3 px-4"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="text-left text-[0.72rem] font-bold uppercase tracking-wider text-muted py-3 px-4"
                >
                  Entity
                </th>
                <th
                  scope="col"
                  className="text-left text-[0.72rem] font-bold uppercase tracking-wider text-muted py-3 px-4"
                >
                  Dimension
                </th>
                <th
                  scope="col"
                  className="text-left text-[0.72rem] font-bold uppercase tracking-wider text-muted py-3 px-4"
                >
                  Link
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const typeColor = SOURCE_TYPE_COLORS[row.sourceType];
                return (
                  <tr
                    key={`${row.url}-${i}`}
                    className="border-b border-line last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono text-[0.82rem] text-text">
                      {row.domain}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className="text-[0.7rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                        style={{
                          color: typeColor,
                          borderColor: `${typeColor}44`,
                          background: `${typeColor}12`,
                        }}
                      >
                        {SOURCE_TYPE_LABELS[row.sourceType]}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-muted text-[0.85rem]">
                      {row.entity || "—"}
                    </td>
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
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1.5 8.5L8.5 1.5M4.5 1.5H8.5V5.5"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
