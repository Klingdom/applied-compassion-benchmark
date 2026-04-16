import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import Pill from "@/components/ui/Pill";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";
import Band from "@/components/ui/Band";
import type { BandLevel } from "@/components/ui/Band";
import NewsletterSignup from "@/components/ui/NewsletterSignup";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface DailyBriefingProps {
  updates: any;
  showNewsletter?: boolean;
  /** Date navigation tabs: array of { date, label, isCurrent } */
  dateNav?: { date: string; label: string; isCurrent: boolean }[];
}

function normalizeBand(band: string): BandLevel | null {
  const normalized = band?.toLowerCase() as BandLevel;
  const valid: BandLevel[] = ["critical", "developing", "functional", "established", "exemplary"];
  return valid.includes(normalized) ? normalized : null;
}

function bandColor(band: string): string {
  const map: Record<string, string> = {
    critical: "#f87171",
    developing: "#fb923c",
    functional: "#fcd34d",
    established: "#86efac",
    exemplary: "#7dd3fc",
  };
  return map[band?.toLowerCase()] ?? "#94a3b8";
}

function deltaColor(delta: number): string {
  if (delta <= -10) return "#f87171";
  if (delta < 0) return "#fb923c";
  if (delta >= 10) return "#86efac";
  if (delta > 0) return "#34d399";
  return "#94a3b8";
}

function formatIndex(index: string): string {
  return index?.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
}

/** Format a YYYY-MM-DD string to "Apr 16" */
function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DailyBriefing({
  updates,
  showNewsletter = true,
  dateNav,
}: DailyBriefingProps) {
  const {
    pipeline,
    scoreChanges,
    confirmations,
    sectorTrends,
    emergingRisks,
    insights,
    highlights,
    recentAssessments,
  } = updates;

  const bandChanges = (scoreChanges as any[]).filter((c: any) => c.bandChange);

  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          {/* Date navigation tabs */}
          {dateNav && dateNav.length > 0 && (
            <nav
              aria-label="Browse previous briefings"
              className="flex flex-wrap gap-2 mb-8"
            >
              {dateNav.map(({ date, label, isCurrent }) =>
                isCurrent ? (
                  <span
                    key={date}
                    aria-current="page"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] border border-[rgba(125,211,252,0.4)] bg-[rgba(125,211,252,0.12)] text-[#7dd3fc] text-[0.88rem] font-semibold"
                  >
                    {label}
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#7dd3fc] shrink-0"
                      aria-hidden="true"
                    />
                  </span>
                ) : (
                  <Link
                    key={date}
                    href={`/updates/${date}`}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-[10px] border border-line bg-[rgba(255,255,255,0.04)] text-muted text-[0.88rem] font-medium hover:border-[rgba(125,211,252,0.3)] hover:text-text hover:bg-[rgba(125,211,252,0.06)] transition-colors"
                  >
                    {label}
                  </Link>
                )
              )}
            </nav>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Daily evidence briefing &middot; {updates.date}</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                Daily Evidence Briefing
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Evidence-linked score assessments, sector intelligence, and emerging risks from overnight research across all published benchmark indexes. Each finding is sourced from primary evidence — litigation records, regulatory filings, investigative reporting, and international legal instruments.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat value={pipeline.entitiesScanned.toLocaleString()} label="Entities scanned" />
                <Stat value={String(pipeline.entitiesAssessed)} label="Entities assessed" />
                <Stat value={String(pipeline.proposalsGenerated)} label="Score changes" />
                <Stat value={String(pipeline.confirmations)} label="Scores confirmed" />
              </div>
              {bandChanges.length > 0 && (
                <div className="mt-4 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.07)]">
                  <span className="w-2 h-2 rounded-full bg-[#f87171] shrink-0" />
                  <span className="text-[0.9rem] font-semibold text-[#f87171]">
                    {bandChanges.length} band {bandChanges.length === 1 ? "change" : "changes"} proposed tonight
                  </span>
                </div>
              )}
            </div>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">How this works</h3>
              <p className="text-muted mb-2 text-[0.94rem]">
                Every night, research agents scan all 1,155 benchmarked entities for new evidence across litigation, regulatory filings, investigative reporting, and international legal instruments. Flagged entities receive full 40-subdimension assessments.
              </p>
              <p className="text-muted mb-3 text-[0.9rem]">
                Score changes are proposals, not automatic updates. A human analyst reviews all proposals before published scores change. Confirmations — where research affirms the published score is accurate — are documented alongside changes.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button href="/methodology">Read Methodology</Button>
                <Button href="/indexes">View Indexes</Button>
              </div>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Score Changes — Centerpiece */}
      {scoreChanges.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
              <SectionHead
                title="Score movements"
                description="Entities with significant evidence-based score movement from overnight research. Each card is a dossier entry."
              />
            </div>
            <div className="grid grid-cols-1 gap-5">
              {(scoreChanges as any[]).map((change: any) => {
                const isDowngrade = change.delta < 0;
                const cardBorderColor = isDowngrade
                  ? "rgba(248,113,113,0.35)"
                  : "rgba(134,239,172,0.35)";
                const cardBg = isDowngrade
                  ? "linear-gradient(160deg, rgba(248,113,113,0.07) 0%, rgba(251,146,60,0.03) 100%)"
                  : "linear-gradient(160deg, rgba(134,239,172,0.07) 0%, rgba(125,211,252,0.03) 100%)";
                const pubBand = normalizeBand(change.publishedBand);
                const assBand = normalizeBand(change.assessedBand);

                return (
                  <div
                    key={change.slug}
                    className="rounded-[20px] p-6 border"
                    style={{ borderColor: cardBorderColor, background: cardBg }}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                      <div className="flex items-start gap-3 flex-wrap">
                        <div>
                          <h3 className="text-[1.4rem] font-bold leading-tight">{change.entity}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Pill>{formatIndex(change.index)}</Pill>
                            <span
                              className="text-[0.82rem] font-semibold px-2.5 py-1 rounded-full border"
                              style={{
                                color: change.status === "applied" ? "#86efac" : "#fcd34d",
                                borderColor: change.status === "applied" ? "rgba(134,239,172,0.3)" : "rgba(252,211,77,0.3)",
                                background: change.status === "applied" ? "rgba(134,239,172,0.08)" : "rgba(252,211,77,0.08)",
                              }}
                            >
                              {change.status === "applied" ? "Applied" : "Pending review"}
                            </span>
                            <span className="text-muted text-[0.82rem]">
                              {change.confidence} confidence
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score display */}
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <span className="text-muted text-[1.1rem] font-semibold">{change.publishedScore}</span>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span
                            className="text-[1.5rem] font-bold leading-none"
                            style={{ color: deltaColor(change.delta) }}
                          >
                            {change.assessedScore}
                          </span>
                        </div>
                        <div
                          className="text-[0.9rem] font-bold mb-2"
                          style={{ color: deltaColor(change.delta) }}
                        >
                          {change.delta > 0 ? "+" : ""}{change.delta} pts
                        </div>
                        {change.bandChange && pubBand && assBand && (
                          <div className="flex items-center gap-1.5 justify-end flex-wrap">
                            <Band level={pubBand} />
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted">
                              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <Band level={assBand} />
                          </div>
                        )}
                        {!change.bandChange && pubBand && (
                          <div className="flex justify-end">
                            <Band level={pubBand} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Headline */}
                    <p className="text-[0.97rem] text-text mb-4 font-medium leading-relaxed border-l-2 pl-3" style={{ borderColor: deltaColor(change.delta) }}>
                      {change.headline}
                    </p>

                    {/* Evidence trail */}
                    {(change.evidence as string[])?.length > 0 && (
                      <div>
                        <div className="text-[0.78rem] font-bold uppercase tracking-widest text-muted mb-3">
                          Evidence record
                        </div>
                        <ol className="space-y-2.5">
                          {(change.evidence as string[]).map((ev: string, i: number) => (
                            <li key={i} className="flex gap-3">
                              <span
                                className="text-[0.78rem] font-bold shrink-0 mt-[2px] w-5 h-5 rounded-full flex items-center justify-center border"
                                style={{
                                  color: deltaColor(change.delta),
                                  borderColor: `${deltaColor(change.delta)}44`,
                                  background: `${deltaColor(change.delta)}11`,
                                }}
                              >
                                {i + 1}
                              </span>
                              <div
                                className="flex-1 text-muted text-[0.9rem] leading-relaxed pl-3 border-l"
                                style={{ borderColor: `${deltaColor(change.delta)}28` }}
                              >
                                {ev}
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Inline newsletter nudge — captures users at peak engagement */}
            <div className="mt-6 rounded-[16px] border border-[rgba(125,211,252,0.15)] bg-[rgba(125,211,252,0.04)] p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <p className="flex-1 min-w-0 text-[0.94rem] text-muted">
                  These findings arrive in your inbox every Monday.{" "}
                  <span className="text-text font-medium">Free.</span>
                </p>
                <NewsletterSignup variant="inline-compact" source="updates-score-movements" />
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Purchase CTA — positioned after Score Movements at peak intent */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              Get the full benchmark report
            </h2>
            <p className="text-muted max-w-[760px] mb-[18px]">
              Daily briefings surface headline findings. Full benchmark reports include complete methodology documentation, all 40 subdimension scores, full evidence trails, certified assessments, and sector-level analysis packages.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/purchase-research" variant="primary">Purchase Research</Button>
              <Button href="/certified-assessments">Request Certified Assessment</Button>
              <Button href="/advisory">Book Advisory</Button>
            </div>
          </Callout>
        </Container>
      </section>

      {/* Scores Confirmed */}
      {confirmations.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Scores confirmed"
              description="Entities where research found published scores remain accurate. Confirmations are documented evidence, not silence."
            />
            <div className="overflow-auto border border-line rounded-[20px] bg-[rgba(255,255,255,0.02)]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-left py-3.5 px-5">Entity</th>
                    <th className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-left py-3.5 px-4">Index</th>
                    <th className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-left py-3.5 px-4">Band</th>
                    <th className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-right py-3.5 px-4">Published</th>
                    <th className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-right py-3.5 px-4">Assessed</th>
                    <th className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-right py-3.5 px-4">Delta</th>
                    <th className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-left py-3.5 px-5">Finding</th>
                  </tr>
                </thead>
                <tbody>
                  {(confirmations as any[]).map((c: any) => {
                    const band = normalizeBand(c.publishedBand);
                    return (
                      <tr key={c.slug} className="border-b border-line last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="py-4 px-5 font-semibold text-[0.95rem]">{c.entity}</td>
                        <td className="py-4 px-4 text-muted text-[0.88rem]">{formatIndex(c.index)}</td>
                        <td className="py-4 px-4">
                          {band && <Band level={band} />}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-[0.92rem]">{c.publishedScore}</td>
                        <td className="py-4 px-4 text-right font-mono text-[0.92rem]">{c.assessedScore}</td>
                        <td className="py-4 px-4 text-right font-mono text-[0.92rem] font-semibold" style={{ color: deltaColor(c.delta) }}>
                          {c.delta > 0 ? "+" : ""}{c.delta}
                        </td>
                        <td className="py-4 px-5 text-muted text-[0.88rem] max-w-[380px] leading-relaxed">{c.headline}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Container>
        </section>
      )}

      {/* Key Highlights */}
      {highlights.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead title="Key highlights" description="Editorial-level findings from tonight's research cycle." />
            <div className="grid grid-cols-1 gap-3">
              {(highlights as string[]).map((h: string, i: number) => (
                <div
                  key={i}
                  className="rounded-[20px] border border-[rgba(125,211,252,0.18)] bg-[rgba(125,211,252,0.05)] p-5"
                >
                  <div className="flex gap-3 items-start">
                    <span className="text-[0.78rem] font-bold text-accent shrink-0 mt-[3px] uppercase tracking-wider">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[0.95rem] leading-relaxed">{h}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Newsletter Signup — positioned after Key Highlights at interest peak */}
      {showNewsletter && (
        <section id="newsletter" className="py-[30px]">
          <Container>
            <NewsletterSignup variant="card" source="updates-highlights" />
          </Container>
        </section>
      )}

      {/* Sector Intelligence */}
      {sectorTrends.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Sector intelligence"
              description="Analyst-level observations on patterns emerging across indexed sectors."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(sectorTrends as { sector: string; points: string[] }[]).map((trend) => (
                <Panel key={trend.sector}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="w-1 h-5 rounded-full bg-accent shrink-0" />
                    <h3 className="text-[1.08rem] font-bold">{trend.sector}</h3>
                  </div>
                  <ul className="space-y-3">
                    {trend.points.map((p: string, i: number) => (
                      <li key={i} className="flex gap-2.5 text-muted text-[0.9rem] leading-relaxed">
                        <span className="text-accent shrink-0 mt-[2px]">&#8250;</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Emerging Risks */}
      {emergingRisks.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Emerging risks"
              description="Forward-looking risk signals that may affect future benchmark scores. These are not current findings — they are early warning flags."
            />
            <div className="grid grid-cols-1 gap-3">
              {(emergingRisks as string[]).map((risk: string, i: number) => (
                <div
                  key={i}
                  className="rounded-[20px] border-l-4 border border-[rgba(251,146,60,0.25)] bg-[rgba(251,146,60,0.05)] p-5"
                  style={{ borderLeftColor: "#fb923c" }}
                >
                  <div className="flex gap-3 items-start">
                    <div className="shrink-0 mt-[2px]">
                      <span className="text-[0.78rem] font-bold uppercase tracking-wider text-[#fb923c]">Risk</span>
                    </div>
                    <p className="text-[0.92rem] text-muted leading-relaxed">{risk}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Research Insights */}
      {insights.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Research insights"
              description="Analytical observations from tonight's research cycle. These are assessor-level interpretations, not findings."
            />
            <div className="grid grid-cols-1 gap-3">
              {(insights as string[]).map((insight: string, i: number) => (
                <div
                  key={i}
                  className="rounded-[20px] border border-line bg-[rgba(255,255,255,0.025)] p-5"
                >
                  <div className="flex gap-3 items-start">
                    <span className="text-[0.78rem] font-bold text-muted shrink-0 mt-[3px] uppercase tracking-wider border border-line rounded px-1.5 py-0.5">
                      Note
                    </span>
                    <p className="text-[0.92rem] text-muted leading-relaxed">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Assessed Entities */}
      {recentAssessments.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Assessed entities"
              description="All entities assessed in tonight's research cycle, with composite scores and band classifications."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {(recentAssessments as any[]).map((a: any) => {
                const band = normalizeBand(a.band);
                return (
                  <Link
                    key={a.slug}
                    href={a.publishedIndex && !a.publishedIndex.includes(" ") ? `/${a.publishedIndex}` : "/indexes"}
                    className="block rounded-[16px] border border-line bg-[rgba(255,255,255,0.03)] p-4 hover:border-[rgba(125,211,252,0.3)] hover:bg-[rgba(125,211,252,0.04)] transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-[0.97rem] group-hover:text-text transition-colors leading-tight">
                        {a.entity}
                      </h4>
                      <span
                        className="text-[1.25rem] font-bold leading-none shrink-0"
                        style={{ color: bandColor(a.band) }}
                      >
                        {a.compositeScore}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {band && <Band level={band} />}
                    </div>
                    <div className="text-[0.8rem] text-muted leading-snug">
                      {a.sector}
                    </div>
                    {a.publishedComposite != null && (
                      <div className="text-[0.78rem] text-muted mt-1.5 flex items-center gap-1">
                        <span>Published:</span>
                        <span className="font-semibold">{a.publishedComposite}</span>
                        {a.publishedComposite !== a.compositeScore && (
                          <span style={{ color: deltaColor(a.compositeScore - a.publishedComposite) }}>
                            ({a.compositeScore - a.publishedComposite > 0 ? "+" : ""}
                            {Math.round((a.compositeScore - a.publishedComposite) * 10) / 10})
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* End-of-page CTA — secondary placement for users who read everything */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.3rem,2.5vw,1.7rem)] mb-2">
              Want the complete picture?
            </h2>
            <p className="text-muted max-w-[760px] mb-[18px]">
              Full benchmark reports include all 40 subdimension scores, complete evidence trails, and methodology documentation for every assessed entity.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/purchase-research" variant="primary">Purchase Research</Button>
              <Button href="/certified-assessments">Request Assessment</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}

// Re-export helpers so [date]/page.tsx can use them without duplication
export { formatDateLabel };
