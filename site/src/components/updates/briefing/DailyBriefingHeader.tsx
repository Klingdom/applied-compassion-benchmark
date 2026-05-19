/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { heroDateLabel, issueNumber } from "./utils";

interface Props {
  updates: any;
  dateNav?: { date: string; label: string; isCurrent: boolean }[];
}

export default function DailyBriefingHeader({ updates, dateNav }: Props) {
  const pipeline = updates.pipeline ?? {};
  const dateStr: string = updates.date ?? "";
  const heroDate = dateStr ? heroDateLabel(dateStr) : "";
  const issueNo = dateStr ? issueNumber(dateStr) : 1;

  // One-sentence thesis: prefer updates.headline, truncate to first sentence.
  const rawHeadline: string =
    updates.headline ?? updates.summary ?? "";
  const thesis = rawHeadline
    ? rawHeadline.split(/(?<=[.!?])\s/)[0]
    : "Daily compassion intelligence across 1,155 indexed entities.";

  // KPI figures derived from pipeline
  const kpis = [
    {
      label: "Entities monitored",
      value: pipeline.entitiesScanned?.toLocaleString() ?? "1,155",
    },
    {
      label: "Fully assessed",
      value: pipeline.entitiesAssessed?.toLocaleString() ?? "0",
    },
    {
      label: "Score changes",
      value: (
        pipeline.scoreChanges ??
        pipeline.proposalsGenerated ??
        0
      ).toString(),
    },
    {
      label: "Risk signals",
      value: (
        pipeline.bandChanges ??
        pipeline.boundaryCases ??
        0
      ).toString(),
    },
  ];

  return (
    <section id="brief" className="pt-[72px] pb-8 relative overflow-hidden scroll-mt-0">
      {/* Ambient backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(125,211,252,0.08) 0%, rgba(125,211,252,0) 60%)",
        }}
      />
      <Container className="relative">
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

        {/* Masthead */}
        <div className="flex items-baseline gap-3 mb-5 flex-wrap">
          <span className="text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#7dd3fc]">
            Compassion Benchmark
          </span>
          <span className="text-muted text-[0.78rem]" aria-hidden="true">·</span>
          <span className="text-text text-[0.88rem] font-medium">{heroDate}</span>
          <span className="text-muted text-[0.78rem]" aria-hidden="true">·</span>
          <span className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider tabular-nums">
            No.&nbsp;{issueNo}
          </span>
        </div>

        <h1 className="text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.02] tracking-[-0.035em] mb-4 font-bold">
          Daily Briefing
        </h1>

        {/* One-sentence thesis */}
        <p className="text-text text-[1.08rem] sm:text-[1.15rem] leading-snug max-w-[820px] mb-6 font-medium border-l-2 border-[rgba(125,211,252,0.4)] pl-4">
          {thesis}
        </p>

        {/* CTA cluster */}
        <div className="flex gap-3 flex-wrap mb-8">
          <Button href="#signals" variant="primary">
            Read today&apos;s brief
          </Button>
          <Button href="#subscribe">Subscribe weekly</Button>
          <Button href="/methodology">View methodology</Button>
          <Button href="/indexes">Explore indexes</Button>
        </div>

        {/* KPI grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          aria-label="Today's coverage statistics"
        >
          {kpis.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-[14px] border border-line bg-[rgba(255,255,255,0.025)] p-4"
            >
              <div className="text-[0.7rem] font-bold uppercase tracking-widest text-muted mb-1.5">
                {label}
              </div>
              <div className="text-[1.6rem] font-bold tabular-nums leading-none text-text">
                {value}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
