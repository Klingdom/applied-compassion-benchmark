/**
 * DashboardPage -- the page body of /ai-models/dashboard and /ai-models/dashboard/<run_id> (server component).
 *
 * Reading order (UX_FLOWS section 1): status banner, hero (what this is / is not), the crisis-use note, the wave list,
 * the program status strip, the control bar (the one client island), the panels, then how to read, glossary, data,
 * questions and corrections. DOM order is visual order. With JavaScript disabled everything below the control bar is
 * fully rendered and readable; the control bar is simply absent.
 */

import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import StatusBanner from "@/components/model-benchmark/pilot/StatusBanner";
import PreviewStrip from "@/components/model-benchmark/pilot/PreviewStrip";
import PrintOpenDetails from "@/components/model-benchmark/pilot/PrintOpenDetails";
import type { DashboardData } from "@/lib/model-dashboard-facts";
import { asReportWave, DASHBOARD_URL } from "@/lib/model-dashboard-facts";
import { dashboardCopy as C } from "@/lib/model-dashboard-copy";
import { dateLong, numberWord, SITE_URL } from "@/lib/model-report-facts";
import { exportMeta, shortCitation } from "../../../../scripts/lib/model-dashboard-core.mjs";
import DashboardShell from "./DashboardShell";
import { CompositePanel, DimensionPanel, DifferencePanel, LengthPanel, JudgePanel, ContaminationPanel, InstrumentPanel, ProvenancePanel, NotMeasuredPanel, ReleasePanel, GatesPanel } from "./panels";

export function dashboardJsonLd(d: DashboardData) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: d.title,
    description: d.description,
    url: d.canonical,
    inLanguage: "en",
    dateModified: d.reportDate,
    isPartOf: { "@type": "WebSite", name: "Compassion Benchmark", url: SITE_URL },
  };
}

export function dashboardFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: C.faq.items.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
  };
}

const PANEL_ORDER = [
  { code: "comp", title: C.panels.comp.title },
  { code: "dims", title: C.panels.dims.title },
  { code: "diff", title: C.panels.diff.title },
  { code: "inst", title: C.panels.inst.title },
  { code: "len", title: C.panels.len.title },
  { code: "judg", title: C.panels.judg.title },
  { code: "cont", title: C.panels.cont.title },
  { code: "nm", title: C.panels.nm.title },
  { code: "prov", title: C.panels.prov.title },
  { code: "rel", title: C.panels.rel.title },
  { code: "gates", title: C.panels.gates.title },
];

/**
 * The ONLY data the client island receives (FR-02 AC4, FR-27 AC3). Everything in it comes from the public projection:
 * ids, shapes, labels, and the tidy rows (a range is ONE string "lo to hi"; a point appears only for a subject separated
 * after correction). scripts/test-model-dashboard.mjs scans a JSON dump of it for every withheld value.
 */
export function shellProps(d: DashboardData) {
  return {
    runId: d.runId,
    builds: d.builds.map((b) => ({ id: b.id, shape: b.shape })),
    dims: d.dims,
    panels: PANEL_ORDER,
    rows: d.rows as unknown as Record<string, unknown>[],
    meta: exportMeta({ runId: d.runId, reportDate: d.reportDate, accessTier: d.accessTier, waveSha256: d.waveSha256, citation: shortCitation(d.runId, d.reportDate) }) as Record<string, unknown>,
    armsNote: d.wave.derived.display_rule !== undefined,
  };
}

export default function DashboardPage({ d, mode }: { d: DashboardData; mode: "active" | "preview" }) {
  const w = d.wave;
  const rw = asReportWave(w);
  const p = d.program;
  const link = d.waves.find((l) => l.runId === d.runId);
  const replyMailto = `mailto:info@compassionbenchmark.com?subject=${encodeURIComponent(`Model dashboard reply: ${d.runId}`)}`;
  const csv = `/data/model-dashboard/${d.runId}.csv`;
  const json = `/data/model-dashboard/${d.runId}.json`;
  const nonCurrent = d.waves.length > 1;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dashboardJsonLd(d)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dashboardFaqJsonLd()) }} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "AI Models", url: breadcrumbUrl("/ai-models") },
          { name: C.title, url: d.canonical },
        ]}
      />
      <style>{`@page { @bottom-center { content: "Unofficial pilot ${d.runId} \\00b7 ${DASHBOARD_URL}"; font-size: 8pt; } }`}</style>

      <StatusBanner wave={rw} />
      {mode === "preview" && <PreviewStrip decisionRef={w.publication.decision_ref} />}
      {link?.superseded && (
        <p className="dash-superseded" role="note">This wave was replaced by a later one. It stays here, unchanged.</p>
      )}
      <PrintOpenDetails />

      <article className="pilot-report dashboard" data-pagefind-ignore>
        <Container>
          <a href="#dash-panels" className="skip-link dash-skip">Skip to panels</a>
          <header className="pilot-header">
            <Eyebrow>{C.eyebrow}</Eyebrow>
            <h1>{C.title}</h1>
            <p className="pilot-dek">{C.hero.lede(numberWord(p.buildCountInWave), String(p.itemsTotal))}</p>
            <dl className="pilot-meta">
              <div><dt>Run</dt><dd>{d.runId}</dd></div>
              <div><dt>Date</dt><dd>{dateLong(d.reportDate)}</dd></div>
              <div><dt>Access tier</dt><dd>{d.accessTier}</dd></div>
              <div><dt>Comparability</dt><dd>{w.comparability}</dd></div>
            </dl>
          </header>

          <div className="dash-hero">
            <div>
              <h2 className="dash-h2">{C.hero.isHead}</h2>
              <ul className="dash-ul">{C.hero.is.map((x) => <li key={x}>{x}</li>)}</ul>
              <h2 className="dash-h2">{C.hero.isntHead}</h2>
              <ul className="dash-ul">{C.hero.isnt.map((x) => <li key={x}>{x}</li>)}</ul>
              <p className="dash-note">{C.hero.labsNote}</p>
              <p className="dash-herolinks">
                <a href="#how-to-read" data-umami-event="dash_howto_open" data-umami-event-target="hero">{C.hero.linkHow}</a>{" · "}
                <a href="#data">{C.hero.linkData}</a>{" · "}
                <a href="/ai-models/methodology">{C.hero.linkMethod}</a>
              </p>
            </div>
            <aside className="dash-callout" aria-label={C.hero.scoreCalloutTitle}>
              <p><strong>{C.hero.scoreCalloutTitle}</strong></p>
              <p>{C.hero.scoreCallout}</p>
            </aside>
          </div>

          <section aria-labelledby="duty-h" className="dash-duty" data-duty-of-care>
            <h2 id="duty-h" className="dash-h2">{C.duty.heading}</h2>
            <p>{C.duty.text}</p>
          </section>

          <nav aria-label={C.waveNav.heading} className="dash-waves">
            <h2 className="dash-h2">{C.waveNav.heading}</h2>
            {!nonCurrent ? (
              <p>{C.waveNav.only}: {d.runId} · {d.reportDate}</p>
            ) : (
              <>
                <p>{C.waveNav.current}: <strong>{d.runId} · {d.reportDate}</strong></p>
                <ul className="dash-ul">
                  {d.waves.filter((l) => l.runId !== d.runId).map((l) => (
                    <li key={l.runId}><a href={l.href} data-umami-event="dash_wave_switch" data-umami-event-run_id={l.runId}>{l.runId} · {l.reportDate}{l.superseded ? " (superseded)" : ""}</a></li>
                  ))}
                </ul>
                <p className="pf-qual">{C.waveNav.refuse}</p>
              </>
            )}
          </nav>

          <section aria-labelledby="status-h" className="dash-status">
            <h2 id="status-h" className="dash-h2">{C.status.heading}</h2>
            <p>{p.officialModelCount === 0 ? C.status.none : `${p.officialModelCount} official model scores.`}</p>
            <dl className="dash-stats">
              <div className="dash-stat"><dt>{C.status.labels.official}</dt><dd>{p.officialModelCount === 0 ? "None" : p.officialModelCount}</dd></div>
              <div className="dash-stat"><dt>{C.status.labels.waves}</dt><dd>{p.publishableWaveCount}</dd></div>
              <div className="dash-stat"><dt>{C.status.labels.builds}</dt><dd>{p.buildCountInWave}</dd></div>
              <div className="dash-stat"><dt>{C.status.labels.bank}</dt><dd>{p.itemsTotal}</dd></div>
              <div className="dash-stat"><dt>{C.status.labels.validated}</dt><dd>{p.itemsValidatedByReview === 0 ? C.status.noneOf(String(p.itemsTotal)) : `${p.itemsValidatedByReview} of ${p.itemsTotal}`}</dd></div>
              <div className="dash-stat"><dt>{C.status.labels.tracked}</dt><dd>{p.trackedCount === 0 ? "None" : p.trackedCount}</dd></div>
            </dl>
            <p className="pf-qual">{C.status.labels.lastWave}: {dateLong(p.lastWaveDate)}. {C.status.protocol} {C.status.notCount}</p>
          </section>

          <DashboardShell {...shellProps(d)}>
            <details id="dash-cite" className="dash-cite">
              <summary>{C.cite.heading}</summary>
              <p className="pf-qual">{C.cite.note}</p>
              <h3 className="dash-h3">{C.cite.plain}</h3>
              <blockquote id="cite-plain" className="pilot-citation">{d.citation.plain}</blockquote>
              <p><button type="button" className="dash-btn" data-dash-copy="cite-plain" data-dash-copy-view>{C.cite.copy}: {C.cite.plain}</button></p>
              <h3 className="dash-h3">{C.cite.bibtex}</h3>
              <pre id="cite-bibtex" className="dash-pre">{d.citation.bibtex}</pre>
              <p><button type="button" className="dash-btn" data-dash-copy="cite-bibtex">{C.cite.copy}: {C.cite.bibtex}</button></p>
            </details>

            <div id="dash-panels">
              <CompositePanel d={d} />
              <DimensionPanel d={d} />
              <DifferencePanel d={d} />
              <InstrumentPanel d={d} />
              <LengthPanel d={d} />
              <JudgePanel d={d} />
              <ContaminationPanel d={d} />
              <NotMeasuredPanel d={d} />
              <ProvenancePanel d={d} />
              <ReleasePanel d={d} />
              <GatesPanel d={d} />
            </div>
          </DashboardShell>

          <section aria-labelledby="how-to-read" className="dash-help" id="how-to-read-section">
            <h2 id="how-to-read" className="dash-h2" tabIndex={-1}>{C.howto.heading}</h2>
            <ol className="dash-ul dash-ol">{C.howto.items.map((x) => <li key={x}>{x}</li>)}</ol>
          </section>

          <section aria-labelledby="glossary-h" className="dash-help">
            <h2 id="glossary-h" className="dash-h2">{C.howto.glossHead}</h2>
            <dl className="dash-gloss">
              {C.glossary.map((g) => (
                <div key={g.term}><dt>{g.term}</dt><dd>{g.def}</dd></div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="data" className="dash-help">
            <h2 id="data" className="dash-h2" tabIndex={-1}>{C.data.heading}</h2>
            <p>{C.data.intro}</p>
            <ul className="dash-ul">
              <li><a href={csv} download data-umami-event="dash_download" data-umami-event-format="csv" data-umami-event-scope="wave">{C.data.csv}</a></li>
              <li><a href={json} download data-umami-event="dash_download" data-umami-event-format="json" data-umami-event-scope="wave">{C.data.json}</a></li>
              <li><a href={`/data/model-waves/${d.runId}.json`}>{C.data.wave}</a></li>
              <li>{C.data.licence}: CC BY 4.0</li>
            </ul>
          </section>

          <section aria-labelledby="faq-h" className="dash-help">
            <h2 id="faq-h" className="dash-h2">{C.faq.heading}</h2>
            {C.faq.items.map((x) => (
              <div key={x.q}>
                <h3 className="dash-h3">{x.q}</h3>
                <p>{x.a}</p>
              </div>
            ))}
          </section>

          <section aria-labelledby="footer-h" className="dash-help dash-footer-block">
            <h2 id="footer-h" className="dash-h2">{C.footer.heading}</h2>
            <p>{C.footer.corrections} <a href={replyMailto}>{C.footer.report}</a>.</p>
            <p>{C.footer.reply}</p>
            <p>{C.footer.noDeveloper}</p>
            <p>{C.footer.independence}</p>
            <p>
              <a href={d.reportHref}>{C.footer.reportLink}</a>{" · "}
              <a href="/ai-models/methodology">{C.footer.methodology}</a>
            </p>
            <p className="pf-qual">{C.footer.analytics}</p>
          </section>
        </Container>
      </article>
    </>
  );
}

/** Metadata of a dashboard page. Title starts "Unofficial Pilot:", names no model and carries no figure beyond month and year (G20-title). */
export function dashboardMetadata(d: DashboardData): Metadata {
  const preview = d.mode === "preview";
  return {
    title: { absolute: d.title },
    description: d.description,
    alternates: { canonical: d.canonical },
    robots: { index: !preview, follow: true },
    openGraph: { type: "website", title: d.title, description: d.description, url: d.canonical },
    twitter: { card: "summary", title: d.title, description: C.social },
  };
}
