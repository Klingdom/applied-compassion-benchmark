import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";
import updatesRaw from "@/data/updates/latest.json";

/* eslint-disable @typescript-eslint/no-explicit-any */
const updates = updatesRaw as any;

export const metadata: Metadata = {
  title: "Daily Updates",
  description:
    "Daily compassion benchmark research findings: score changes, sector trends, emerging risks, and evidence-linked insights across 1,155 entities.",
};

function bandColor(band: string): string {
  const map: Record<string, string> = {
    critical: "#f87171",
    developing: "#fb923c",
    functional: "#fcd34d",
    established: "#86efac",
    exemplary: "#7dd3fc",
  };
  return map[band?.toLowerCase()] ?? "#7dd3fc";
}

function deltaColor(delta: number): string {
  if (delta <= -10) return "#f87171";
  if (delta < 0) return "#fb923c";
  if (delta >= 10) return "#86efac";
  if (delta > 0) return "#34d399";
  return "#94a3b8";
}

export default function UpdatesPage() {
  const { pipeline, scoreChanges, confirmations, sectorTrends, emergingRisks, insights, highlights, recentAssessments } = updates;

  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Benchmark research updates &middot; {updates.date}</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                Daily research findings
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Evidence-linked score assessments, sector trends, and emerging risks from overnight research across all published benchmark indexes. Updated nightly.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat value={String(pipeline.entitiesScanned.toLocaleString())} label="Entities scanned" />
                <Stat value={String(pipeline.entitiesAssessed)} label="Entities assessed" />
                <Stat value={String(pipeline.proposalsGenerated)} label="Score changes proposed" />
                <Stat value={String(pipeline.confirmations)} label="Scores confirmed" />
              </div>
            </div>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">How this works</h3>
              <p className="text-muted mb-2">
                Every night, research agents scan all 1,155 benchmarked entities for new evidence, run full 40-subdimension assessments on flagged entities, and produce scored findings with linked sources.
              </p>
              <p className="text-muted mb-3 text-[0.92rem]">
                Score changes are proposed, not automatic. A human analyst reviews all proposals before published scores update.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button href="/methodology">Read Methodology</Button>
                <Button href="/indexes">View Indexes</Button>
              </div>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Score Changes */}
      {scoreChanges.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Score changes proposed"
              description="Entities with significant evidence-based score movement. All proposals are pending human review."
            />
            <div className="grid grid-cols-1 gap-4">
              {scoreChanges.map((change: Record<string, unknown>) => (
                <div
                  key={change.slug as string}
                  className="border rounded-[20px] p-6"
                  style={{
                    borderColor: "rgba(248,113,113,0.3)",
                    background: "linear-gradient(135deg, rgba(248,113,113,0.06), rgba(251,146,60,0.03))",
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                    <div>
                      <h3 className="text-[1.3rem] font-bold">{change.entity as string}</h3>
                      <span className="text-muted text-[0.88rem]">
                        {(change.index as string)?.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} &middot; {change.status as string}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-muted text-[1.1rem]">{change.publishedScore as number}</span>
                        <span className="text-muted">&rarr;</span>
                        <span className="text-[1.3rem] font-bold" style={{ color: deltaColor(change.delta as number) }}>
                          {change.assessedScore as number}
                        </span>
                      </div>
                      <div className="text-[0.82rem] font-bold" style={{ color: deltaColor(change.delta as number) }}>
                        {(change.delta as number) > 0 ? "+" : ""}{change.delta as number} points
                      </div>
                      {Boolean(change.bandChange) && (
                        <div className="text-[0.78rem] mt-1">
                          <span style={{ color: bandColor(change.publishedBand as string) }}>{change.publishedBand as string}</span>
                          {" "}&rarr;{" "}
                          <span style={{ color: bandColor(change.assessedBand as string) }}>{change.assessedBand as string}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-muted mb-3">{change.headline as string}</p>
                  {(change.evidence as string[])?.length > 0 && (
                    <ul className="list-disc pl-[18px] text-muted text-[0.92rem] space-y-1.5">
                      {(change.evidence as string[]).map((ev: string, i: number) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Confirmations */}
      {confirmations.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Scores confirmed"
              description="Entities where research found published scores remain accurate."
            />
            <div className="overflow-auto border border-line rounded-[20px] bg-[rgba(255,255,255,0.03)]">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-4 border-b border-line">Entity</th>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-4 border-b border-line">Index</th>
                    <th className="text-muted text-[0.86rem] font-semibold text-right py-3 px-4 border-b border-line">Published</th>
                    <th className="text-muted text-[0.86rem] font-semibold text-right py-3 px-4 border-b border-line">Assessed</th>
                    <th className="text-muted text-[0.86rem] font-semibold text-right py-3 px-4 border-b border-line">Delta</th>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-4 border-b border-line">Finding</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmations.map((c: Record<string, unknown>) => (
                    <tr key={c.slug as string}>
                      <td className="py-3 px-4 border-b border-line font-semibold">{c.entity as string}</td>
                      <td className="py-3 px-4 border-b border-line text-muted text-[0.92rem]">
                        {(c.index as string)?.replace(/-/g, " ").replace(/\b\w/g, (s: string) => s.toUpperCase())}
                      </td>
                      <td className="py-3 px-4 border-b border-line text-right">{c.publishedScore as number}</td>
                      <td className="py-3 px-4 border-b border-line text-right">{c.assessedScore as number}</td>
                      <td className="py-3 px-4 border-b border-line text-right" style={{ color: deltaColor(c.delta as number) }}>
                        {(c.delta as number) > 0 ? "+" : ""}{c.delta as number}
                      </td>
                      <td className="py-3 px-4 border-b border-line text-muted text-[0.92rem] max-w-[400px]">{c.headline as string}</td>
                    </tr>
                  ))}
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
            <SectionHead title="Key highlights" />
            <div className="grid grid-cols-1 gap-3">
              {highlights.map((h: string, i: number) => (
                <Panel key={i}>
                  <p className="text-[0.95rem]">{h}</p>
                </Panel>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Sector Trends */}
      {sectorTrends.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Sector trends"
              description="Patterns emerging across indexed sectors."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectorTrends.map((trend: { sector: string; points: string[] }) => (
                <Panel key={trend.sector}>
                  <h3 className="text-[1.08rem] font-bold mb-2.5">{trend.sector}</h3>
                  <ul className="list-disc pl-[18px] text-muted text-[0.92rem] space-y-1.5">
                    {trend.points.map((p: string, i: number) => (
                      <li key={i}>{p}</li>
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
              description="External events that may affect future benchmark scores."
            />
            <div className="grid grid-cols-1 gap-3">
              {emergingRisks.map((risk: string, i: number) => (
                <Card key={i}>
                  <p className="text-[0.95rem]">{risk}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Impacts and insights"
              description="Analytical observations from tonight's research."
            />
            <div className="grid grid-cols-1 gap-3">
              {insights.map((insight: string, i: number) => (
                <Panel key={i}>
                  <p className="text-[0.95rem]">{insight}</p>
                </Panel>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Recent Assessments */}
      {recentAssessments.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Recent assessments"
              description="Entities most recently assessed by the research pipeline."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentAssessments.map((a: Record<string, unknown>) => (
                <Card key={a.slug as string} href={a.publishedIndex ? `/${a.publishedIndex}` : "/indexes"}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-[1rem]">{a.entity as string}</h4>
                    <span
                      className="text-[1.2rem] font-bold leading-none"
                      style={{ color: bandColor(a.band as string) }}
                    >
                      {a.compositeScore as number}
                    </span>
                  </div>
                  <div className="text-[0.82rem] text-muted mb-1">
                    {a.sector as string} &middot; <span style={{ color: bandColor(a.band as string) }}>{a.band as string}</span>
                  </div>
                  <div className="text-[0.78rem] text-muted">
                    Assessed {a.date as string}
                    {a.publishedComposite != null && (
                      <> &middot; Published: {a.publishedComposite as number}</>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              Get the full benchmark report
            </h2>
            <p className="text-muted max-w-[760px] mb-[18px]">
              Daily updates show headline findings. Full benchmark reports include complete methodology, all 40 subdimension scores, evidence trails, and sector analysis.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/purchase-research" variant="primary">Purchase Research</Button>
              <Button href="/certified-assessments">Request Certified Assessment</Button>
              <Button href="/advisory">Book Advisory</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
