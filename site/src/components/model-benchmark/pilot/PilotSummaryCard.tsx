import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import SectionHead from "@/components/ui/SectionHead";
import Container from "@/components/ui/Container";
import type { PilotPageFacts } from "@/lib/model-report-facts";
import { numberWord } from "@/lib/model-report-facts";

/**
 * PilotSummaryCard: the verdict-only card on /ai-models (template F6, UX brief).
 * Status line, one purpose sentence, three plain-language bullets, a count of the
 * disclosed reasons these are not scores, and one default-variant link-button to
 * the report. No per-model figure, no chart, no table: the full ranges live only
 * in the report. Rendered only when the pilot renders (never in the default build).
 */
export default function PilotSummaryCard({ facts, preview }: { facts: PilotPageFacts; preview: boolean }) {
  return (
    <section className="py-[30px]" id="pilot-results">
      <Container>
        <SectionHead
          title="Pilot results (unofficial)"
          description="One unofficial pilot tested the test, not the models. It is not a score, not a ranking, and it supports no comparison with any other model."
        />
        <Panel>
          {preview && (
            <p className="text-[0.85rem] font-semibold text-text border border-dashed border-text rounded-[10px] px-3 py-2 mb-3">
              PREVIEW &mdash; not approved for publication.
            </p>
          )}
          <p className="text-[0.75rem] tracking-wide text-muted-subtle uppercase mb-1">Unofficial pilot. Not a score, not a ranking.</p>
          <h3 className="text-[1.15rem] mb-3">What the pilot found</h3>
          <ul className="list-disc pl-5 text-muted text-[0.95rem] leading-relaxed grid gap-2 max-w-[900px]">
            {facts.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="text-muted text-[0.93rem] leading-relaxed mt-4 max-w-[900px]">
            The report lists {numberWord(facts.notScoresCount)} reasons these results are not scores. Read the {" "}
            <a href={facts.href} className="underline underline-offset-2">
              {facts.anchorText}
            </a>
            .
          </p>
          <div className="mt-4">
            <Button href={facts.href} trackAs="report_open" trackData={{ report_id: facts.runId, surface: "ai-models", position: "card" }}>
              Read what the pilot found, and what it can&rsquo;t show &rarr;
            </Button>
          </div>
        </Panel>
      </Container>
    </section>
  );
}
