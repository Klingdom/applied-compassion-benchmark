import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import StatusBanner from "@/components/model-benchmark/pilot/StatusBanner";
import PreviewStrip from "@/components/model-benchmark/pilot/PreviewStrip";
import PrintOpenDetails from "@/components/model-benchmark/pilot/PrintOpenDetails";
import PrintButton from "@/components/model-benchmark/pilot/PrintButton";
import ReportEvents from "@/components/model-benchmark/pilot/ReportEvents";
import ReportToc, { sectionSlug } from "@/components/model-benchmark/pilot/ReportToc";
import { IntervalFigure, PairFigure, DimensionFigure, LengthFigure, JudgeFigure } from "@/components/model-benchmark/pilot/PilotFigures";
import { renderableEntries, loadRenderable } from "@/lib/model-report-gate";
import {
  reportSeoStrings, reportJsonLd, reportUrl, dateLong, readingMinutes, accessTierLabel, numberWord, familyName,
} from "@/lib/model-report-facts";

/*
 * /ai-models/reports/<run_id> -- one unofficial pilot report per wave.
 * Binding spec: docs/AI_MODEL_ASSESSMENT_TEMPLATE.md (A, B, E, G, H); DECISIONS.md D-29a (PROPOSED).
 *
 * GATE. renderableEntries() is empty in the default build (the wave's decision
 * is "proposed"), so generateStaticParams returns [] and no report HTML is
 * emitted. CB_PREVIEW_PILOT_REPORTS=1 renders proposed waves for founder review
 * with a PREVIEW strip; an "active" (ratified) wave renders without the flag.
 * dynamicParams = false: any other run id is a 404 at export time.
 *
 * The page carries no copy of its own beyond the fixed template furniture: the
 * body is the compiled narrative (every figure a token resolved against the wave
 * file), the figures are drawn from the wave file, and every derived string goes
 * through the template D lexicon.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return renderableEntries().map((x) => ({ runId: x.entry.run_id }));
}

export async function generateMetadata({ params }: { params: Promise<{ runId: string }> }): Promise<Metadata> {
  const { runId } = await params;
  const { wave, report } = loadRenderable(runId);
  const t = reportSeoStrings(wave, frontMatter(report.front_matter));
  const url = reportUrl(runId);
  return {
    title: { absolute: t.title },
    description: t.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { type: "article", title: t.title, description: t.description, url, publishedTime: wave.report_date },
    twitter: { card: "summary", title: t.title, description: t.social },
  };
}

/** Front matter lines are `key: value` (value optionally quoted). */
function frontMatter(lines: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of lines) {
    const m = l.match(/^([a-z_]+):\s*(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
  return out;
}

/** Wrap tables for horizontal scroll and give header cells their scope (WCAG 1.3.1, 2.1.1). */
function enhanceHtml(html: string): string {
  return html
    .replace(/<table>/g, '<div class="pf-table-wrap" role="region" aria-label="Table, scrollable" tabindex="0"><table class="pf-table">')
    .replace(/<\/table>/g, "</table></div>")
    .replace(/<th>/g, '<th scope="col">');
}

export default async function ReportPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  if (!renderableEntries().some((x) => x.entry.run_id === runId)) notFound();
  const { wave, report, mode } = loadRenderable(runId);
  const fm = frontMatter(report.front_matter);
  const jsonLd = reportJsonLd(wave, fm);
  const minutes = readingMinutes(report.word_count);
  const fam = familyName(wave) ?? "";

  // Figures sit at the end of the section they belong to, numbered in page order.
  const figs: Record<string, ReactNode[]> = {
    separation: [<IntervalFigure key="g1" wave={wave} number={1} />, <PairFigure key="g2" wave={wave} number={2} />],
    "separated-model": [<LengthFigure key="g4" wave={wave} number={3} />],
    dimensions: [<DimensionFigure key="g3" wave={wave} number={4} />],
    "instrument-health": [<JudgeFigure key="g5" wave={wave} number={5} />],
  };

  const artifactsUrl = `https://github.com/Klingdom/applied-compassion-benchmark/tree/main/research/model-runs/${wave.run_id}`;
  const replyMailto = `mailto:info@compassionbenchmark.com?subject=${encodeURIComponent(`Model report reply: ${wave.run_id}`)}`;
  const last = report.sections.length - 1;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "AI Models", url: breadcrumbUrl("/ai-models") },
          { name: fm.title ?? wave.run_id, url: reportUrl(wave.run_id) },
        ]}
      />
      {/* Print footer: run id and URL on every printed page (browsers that support @page margin boxes). */}
      <style>{`@page { @bottom-center { content: "Unofficial pilot ${wave.run_id} \\00b7 ${reportUrl(wave.run_id)}"; font-size: 8pt; } }`}</style>

      <StatusBanner wave={wave} />
      {mode === "preview" && <PreviewStrip decisionRef={wave.publication.decision_ref} />}
      <PrintOpenDetails />
      <ReportEvents reportId={wave.run_id} />

      <article className="pilot-report">
        <Container>
          <header className="pilot-header">
            <Eyebrow>Pilot report &middot; unofficial</Eyebrow>
            <h1>{fm.title}</h1>
            <p className="pilot-dek">{fm.dek}</p>
            <dl className="pilot-meta">
              <div><dt>Run</dt><dd>{wave.run_id}</dd></div>
              <div><dt>Date</dt><dd>{dateLong(wave.report_date)}</dd></div>
              <div><dt>Access tier</dt><dd>{accessTierLabel(wave)}</dd></div>
              <div><dt>Reading time</dt><dd>about {minutes} minutes</dd></div>
            </dl>
            <p className="pilot-print-row"><PrintButton /></p>          </header>

          <div className="pilot-layout">
            <ReportToc sections={report.sections} />
            <div className="pilot-body">
              {report.sections.map((sec, i) => {
                const slug = sectionSlug(sec.title);
                return (
                  <div key={sec.id}>
                    <section aria-labelledby={slug} data-report-section={slug} className="pilot-section">
                      <h2 id={slug}>{sec.title}</h2>
                      <div className="pilot-prose" dangerouslySetInnerHTML={{ __html: enhanceHtml(sec.html) }} />
                      {figs[sec.id]}
                      {sec.id === "why-pilot" && (
                        <p className="pilot-artifacts">
                          <a href={artifactsUrl} data-umami-event="report_artifacts_click" data-umami-event-report_id={wave.run_id}>
                            See the raw ratings and scorecards for this run (research/model-runs/{wave.run_id}/, GitHub)
                          </a>
                        </p>
                      )}
                    </section>

                    {/* Secondary block: after section 13, before section 14, never before section 12 (template H). */}
                    {sec.id === "next-wave" && (
                      <section aria-labelledby="check-or-answer" className="pilot-check">
                        <h2 id="check-or-answer">Check this work, or answer it</h2>
                        <p>
                          Every rating, scorecard and deviation in this pilot is public. You can rerun the method on any model with the AI
                          Evaluation Suite, which runs locally and sends nothing to us. A self-run is marked unofficial and is never ranked.
                        </p>
                        <p>
                          <strong>Lab, researcher or reader?</strong> If you think a finding here is wrong, tell us and show us why. We read every
                          reply. If evidence changes a finding, the correction is published as a new dated record and the original stays
                          visible. You can also propose a model for a future wave. A proposal does not guarantee evaluation, and there is never
                          a fee. No one can pay for inclusion, for a result, or to have a finding withheld.{" "}
                          <a href={replyMailto} data-umami-event="report_reply_click" data-umami-event-report_id={wave.run_id}>
                            Send a reply or proposal
                          </a>
                          .
                        </p>
                        <p className="pilot-check-actions">
                          <Button href="/ai-models#run-it-yourself" trackAs="report_run_it_click" trackData={{ report_id: wave.run_id }}>
                            Run it yourself
                          </Button>
                        </p>
                        <p>
                          Submitting your own run? It arrives as a pull request with every trial and rating.{" "}
                          <a href="/ai-models#records">Read how results are recorded</a>.
                        </p>
                      </section>
                    )}
                    {i === last && (
                      <section aria-labelledby="next-wave-signup" className="pilot-signup">
                        <h2 id="next-wave-signup" className="sr-only">Get the next assessment wave</h2>
                        <NewsletterSignup
                          variant="card"
                          source="ai-model-report-end"
                          heading="Get the next assessment wave when it publishes"
                          body={`This pilot covers one developer's ${numberWord(wave.derived.subject_count)} ${fam} models and no result in it is official. One email on Fridays, with the highlights where new research is announced. It is free, and you can unsubscribe in one click.`}
                          buttonLabel="Email me the next wave"
                          finePrint="No spam. We never share your email. We never sell it to the companies we assess."
                          successTitle="Subscribed."
                          successBody="You'll get the Friday highlights, where new research is announced."
                        />
                      </section>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </article>
    </>
  );
}
