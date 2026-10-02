import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import SectionHead from "@/components/ui/SectionHead";
import Container from "@/components/ui/Container";
import type { PilotsPageFacts } from "@/lib/model-report-facts";
import { numberWord } from "@/lib/model-report-facts";

/**
 * PilotSummaryCard: the verdict-only card on /ai-models (template F6, UX brief).
 * One panel per rendered pilot report, newest first (the manifest order, never an order by result):
 * status line, a heading with the pilot's date and run id, three plain-language bullets, a count of the
 * disclosed reasons these are not scores, and one default-variant link-button to the report. No per-model
 * figure, no chart, no table, no model name: the full ranges live only in each report. Nothing is said about
 * how one pilot compares with another. Rendered only when at least one pilot renders.
 */
export default function PilotSummaryCard({ facts, previewRunIds, showReportsIndex = false }: { facts: PilotsPageFacts; previewRunIds: string[]; showReportsIndex?: boolean }) {
  return (
    <section className="py-[30px]" id="pilot-results">
      <Container>
        <SectionHead title="Pilot results (unofficial)" description={facts.cardDescription} />
        <div className="grid gap-4">
          {facts.items.map((p) => (
            <Panel key={p.runId}>
              {previewRunIds.includes(p.runId) && (
                <p className="text-[0.85rem] font-semibold text-text border border-dashed border-text rounded-[10px] px-3 py-2 mb-3">
                  PREVIEW &mdash; not approved for publication.
                </p>
              )}
              <p className="text-[0.75rem] tracking-wide text-muted-subtle uppercase mb-1">Unofficial pilot. Not a score, not a ranking.</p>
              <h3 className="text-[1.15rem] mb-3">{p.heading}</h3>
              <ul className="list-disc pl-5 text-muted text-[0.95rem] leading-relaxed grid gap-2 max-w-[900px]">
                {p.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <p className="text-muted text-[0.93rem] leading-relaxed mt-4 max-w-[900px]">
                The report lists {numberWord(p.notScoresCount)} reasons these results are not scores. Read the{" "}
                <a href={p.href} className="underline underline-offset-2">
                  {p.anchorText}
                </a>
                .
              </p>
              <div className="mt-4">
                <Button href={p.href} trackAs="report_open" trackData={{ report_id: p.runId, surface: "ai-models", position: "card" }}>
                  Read what this pilot found, and what it can&rsquo;t show &rarr;
                </Button>
              </div>
            </Panel>
          ))}
        </div>
        {showReportsIndex && (
          <p className="text-muted text-[0.93rem] leading-relaxed mt-4 max-w-[900px]">
            <a href="/ai-models/reports" className="underline underline-offset-2">All unofficial pilot reports</a>, newest first, with a markdown copy and the data file for each.
          </p>
        )}
      </Container>
    </section>
  );
}
