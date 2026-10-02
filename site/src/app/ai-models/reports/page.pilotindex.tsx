import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Panel from "@/components/ui/Panel";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import PreviewStrip from "@/components/model-benchmark/pilot/PreviewStrip";
import { loadRenderableReports } from "@/lib/model-report-gate";
import { reportsIndexItem, titleFromFrontMatter, SITE_URL } from "@/lib/model-report-facts";

/*
 * /ai-models/reports -- the index of the unofficial pilot reports.
 *
 * DECISIONS.md D-29a item 1: "No reports index until two reports." This route lives in `page.pilotindex.tsx`,
 * which Next treats as a page only when "pilotindex.tsx" is a page extension; next.config.ts adds it exactly when
 * at least two reports render (pilot-render-gate.mjs reportsIndexRenders). With fewer, the route does not exist.
 *
 * Words and links only. Newest first by report date (a date is not a result), each report with its title, date,
 * models in alphabetical order, status, what the pilot found about separation in words, and links to the report,
 * its markdown and its data. No figure for any model, no ordering of models, no band, no paid link.
 */

const PAGE_URL = `${SITE_URL}/ai-models/reports`;

const reports = loadRenderableReports()
  .map((r) => ({ r, item: reportsIndexItem(r.wave, titleFromFrontMatter(r.report.front_matter, r.wave.run_id)) }))
  .sort((a, b) => (a.item.date < b.item.date ? 1 : a.item.date > b.item.date ? -1 : a.item.runId < b.item.runId ? 1 : -1));

export const metadata: Metadata = {
  title: { absolute: "Unofficial Pilot Reports on AI Models | Compassion Benchmark" },
  description:
    "Every unofficial pilot report of the AI Model Compassion Benchmark, newest first, with its status, what it found about separation, and links to the report, its markdown and its data. None is a score or a ranking.",
  alternates: { canonical: PAGE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Unofficial pilot reports on AI models",
    description: "Pilot reports of the AI Model Compassion Benchmark. None is a score or a ranking.",
    url: PAGE_URL,
  },
};

export default function ReportsIndexPage() {
  const previewWave = reports.find((x) => x.r.mode === "preview")?.r.wave ?? null;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "AI Models", url: breadcrumbUrl("/ai-models") },
          { name: "Pilot reports", url: PAGE_URL },
        ]}
      />
      {previewWave && <PreviewStrip decisionRef={previewWave.publication.decision_ref} />}
      <section className="py-[38px]">
        <Container>
          <Eyebrow>AI Model Compassion Benchmark &middot; Unofficial pilots</Eyebrow>
          <h1 className="text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.1] mt-3 mb-4">Unofficial pilot reports</h1>
          <p className="text-muted max-w-[900px] text-[1.05rem] leading-relaxed mb-3">
            No AI model has an official score. Each report below is an unofficial pilot: it tested the test, it is not a
            score, it carries no ranking, and it supports no comparison with the models in another report or with any
            model outside it. Reports are listed newest first, by date.
          </p>
          <p className="text-muted max-w-[900px] text-[0.95rem] leading-relaxed">
            Machine readers can start at the{" "}
            <a href="/data/model-benchmark/index.json" className="underline underline-offset-2">
              program index (JSON)
            </a>
            . The <a href="/ai-models/methodology" className="underline underline-offset-2">method</a> and the{" "}
            <a href="/ai-models" className="underline underline-offset-2">pre-registration page</a> describe how a pilot is run.
          </p>
        </Container>
      </section>

      <section className="pb-[40px]" aria-label="Pilot reports">
        <Container>
          <div className="grid gap-4">
            {reports.map(({ item }) => (
              <Panel key={item.runId}>
                <article aria-labelledby={`report-${item.runId}`}>
                  <p className="text-[0.75rem] tracking-wide text-muted-subtle uppercase mb-1">{item.statusLabel}</p>
                  <h2 id={`report-${item.runId}`} className="text-[1.25rem] mb-3">
                    <a href={item.reportPath} className="underline underline-offset-2">{item.title}</a>
                  </h2>
                  <dl className="grid gap-1.5 text-[0.95rem] text-muted max-w-[900px]">
                    <div>
                      <dt className="inline text-muted-subtle">Date: </dt>
                      <dd className="inline">{item.dateLong}</dd>
                    </div>
                    <div>
                      <dt className="inline text-muted-subtle">Run: </dt>
                      <dd className="inline">{item.runId}</dd>
                    </div>
                    <div>
                      <dt className="inline text-muted-subtle">Models tested (alphabetical order, not a ranking): </dt>
                      <dd className="inline">{item.subjects.join(", ")}</dd>
                    </div>
                    <div>
                      <dt className="inline text-muted-subtle">What it found about separation: </dt>
                      <dd className="inline">{item.separation}</dd>
                    </div>
                  </dl>
                  <ul className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4 text-[0.93rem]">
                    <li><a href={item.reportPath} className="underline underline-offset-2">Read the report</a></li>
                    <li><a href={item.markdownPath} className="underline underline-offset-2">Markdown</a></li>
                    <li><a href={`/data/model-waves/${item.runId}.json`} className="underline underline-offset-2">Data (JSON)</a></li>
                  </ul>
                </article>
              </Panel>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
