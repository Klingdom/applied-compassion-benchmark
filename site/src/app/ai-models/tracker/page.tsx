import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import Pill from "@/components/ui/Pill";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import FaqAccordion from "@/components/seo/FaqAccordion";
import TrackerFilters from "@/components/model-watch/TrackerFilters";
import { IndependenceCallout, SourceLinks } from "@/components/model-watch/parts";
import { MODEL_WATCH_FACTS as W, type TrackerRow } from "@/lib/model-watch-facts";
import { loadRenderableReports } from "@/lib/model-report-gate";
import { dateLong } from "@/lib/model-report-facts";

// Model tracker (docs/UX_FLOWS_AI_MODEL_WATCH.md section 2). A catalog, not an evaluation: no score, no sort-by-result,
// no per-model route, anchor or id. Every row is server-rendered so the full list works without JavaScript; the client
// filter bar only hides rows. `benchmarkLocalTag` is a join key and is never rendered or passed to the client.

const rows: readonly TrackerRow[] = W.rows;
const providerCount = new Set(rows.map((r) => r.providerSlug)).size;
// "Pilot" wording exists only while the D-29a gate renders at least one report (pilot-mention rule).
const pilotRenders = loadRenderableReports().length > 0;

const canonicalPath = "/ai-models/tracker";

export const metadata: Metadata = pageMeta({
  title: "AI model tracker: models listed with sources, not evaluations",
  description:
    "A neutral list of AI models with provider, release date, status, access, licence and cited sources. " +
    "Listed means listed with a source. It does not mean evaluated, and not listed implies nothing about a model.",
}, "/ai-models/tracker");

const faqItems = [
  {
    question: "Does a model appearing in the tracker mean Compassion Benchmark has evaluated it?",
    answer:
      "No. Listed means the model is described by at least one cited public source. It says nothing about how the model behaves. " +
      "No model has an official Compassion Benchmark score, and the tracker carries no score of any kind.",
  },
  {
    question: "What does the Tested by us column mean?",
    answer:
      "It is a status of our own work, derived by rule. Queued means the model build is on our weekly testing queue, with no timeline promised. " +
      "Not yet means no published test of the model exists. It is not a finding about the model." +
      (pilotRenders
        ? " Pilot means the build appears in an unofficial pilot report, which tests the test and is not a score."
        : ""),
  },
  {
    question: "Does a missing model mean anything?",
    answer:
      "No. The tracker is a partial list built from cited sources. A model that is missing was not found in the sources searched, and nothing is implied about it, including whether it was tested.",
  },
];

const ACCESS_LABEL: Record<string, string> = {
  "open-weights": "Open weights",
  api: "API only",
  "consumer-app": "Consumer app",
  restricted: "Restricted",
};
const accessText = (a: string[]) => a.map((x) => ACCESS_LABEL[x] ?? x).join(", ");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function TestedCell({ t }: { t: TrackerRow["tested"] }) {
  if (t.status === "pilot") {
    return (
      <div className="flex flex-col gap-1 items-start">
        <Pill>Pilot</Pill>
        <Link href={t.href} className="underline underline-offset-2 text-accent text-[0.85rem]">
          Unofficial pilot report (not a score)
        </Link>
      </div>
    );
  }
  return <Pill>{t.status === "queued" ? "Queued" : "Not yet"}</Pill>;
}

const dataAttrs = (r: TrackerRow) => ({
  "data-row": "",
  "data-provider": r.provider,
  "data-access": r.access.join("|"),
  "data-licence": r.licence,
  "data-status": r.status,
  "data-tested": r.tested.status,
});

export default function ModelTrackerPage() {
  const fv = W.filterValues;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "AI Models", url: breadcrumbUrl("/ai-models") },
          { name: "Model tracker", url: breadcrumbUrl(canonicalPath) },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <section className="py-[38px]">
        <Container>
          <nav aria-label="Breadcrumb" className="text-[0.88rem] text-muted-subtle mb-4">
            <Link href="/" className="underline underline-offset-2">Home</Link> /{" "}
            <Link href="/ai-models" className="underline underline-offset-2">AI Models</Link> / Model tracker
          </nav>
          <Eyebrow>AI Model Watch</Eyebrow>
          <h1 className="text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.1] mt-3 mb-4">AI model tracker</h1>
          <p className="text-muted max-w-[68ch] text-[1.05rem] leading-relaxed mb-3">
            A neutral list of AI models in alphabetical order by provider, with the sources each entry rests on. Listed means
            listed with a source; it does not mean evaluated, and not listed implies nothing about a model.
          </p>
          <p className="text-muted max-w-[68ch] text-[0.95rem] leading-relaxed mb-6">
            This is not a ranking page and the list carries no score. No model has an official Compassion Benchmark score.{" "}
            <Link href="/ai-models/leaderboards" className="underline underline-offset-2">
              Why no model ranking is published
            </Link>
            .
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] max-sm:[&>div]:p-3 max-sm:[&_strong]:text-[1.05rem] max-sm:[&_strong]:break-words max-sm:[&_span]:text-[0.78rem] max-sm:[&_span]:leading-snug">
            <Stat value={String(W.catalogModelCount)} label="Models listed in the catalog" />
            <Stat value={String(providerCount)} label="Providers" />
            <Stat value={W.catalogAsOf} label="Catalog as of" />
          </div>
        </Container>
      </section>

      <section className="py-[16px]" id="catalog" aria-labelledby="catalog-heading">
        <Container>
          <h2 id="catalog-heading" className="text-[clamp(1.3rem,2.5vw,1.7rem)] tracking-tight mb-3">
            Catalog
          </h2>
          <noscript>
            <p className="text-muted text-[0.93rem] mb-3">Filters need JavaScript. The full list is below.</p>
          </noscript>
          <TrackerFilters
            providers={fv.provider}
            access={fv.access}
            licences={fv.licence}
            statuses={fv.status}
            showPilotOption={pilotRenders}
            scopeId="tracker-rows"
            totalCount={rows.length}
          />

          <div id="tracker-rows">
            {rows.length === 0 ? (
              <p className="text-muted">No models are listed yet.</p>
            ) : (
              <>
                {/* Wide screens: table. Below 720px: stacked cards from the same data (CSS only, one is exposed). */}
                <div className="hidden min-[720px]:block relative overflow-x-auto border border-line rounded-[14px]">
                  <table className="w-full text-[0.9rem] border-collapse min-w-[900px]">
                    <caption className="sr-only">
                      AI models listed with sources, alphabetical by provider then name. Not a ranking.
                    </caption>
                    <thead>
                      <tr className="text-left text-muted-subtle">
                        {["Provider", "Model", "Released", "Status", "Access", "Licence", "Tested by us", "Source"].map((h) => (
                          <th key={h} scope="col" className="py-2.5 px-3 border-b border-line font-medium align-bottom">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-muted">
                      {rows.map((r) => (
                        <tr key={r.id} {...dataAttrs(r)}>
                          <td className="py-2.5 px-3 border-b border-line/60 align-top">{r.provider}</td>
                          <th scope="row" className="py-2.5 px-3 border-b border-line/60 align-top text-left text-text font-medium break-words">
                            {r.name}
                          </th>
                          <td className="py-2.5 px-3 border-b border-line/60 align-top whitespace-nowrap">
                            {r.releaseDate ? <time dateTime={r.releaseDate}>{r.releaseDate}</time> : "Not stated"}
                          </td>
                          <td className="py-2.5 px-3 border-b border-line/60 align-top whitespace-nowrap">{cap(r.status)}</td>
                          <td className="py-2.5 px-3 border-b border-line/60 align-top whitespace-nowrap">{accessText(r.access)}</td>
                          <td className="py-2.5 px-3 border-b border-line/60 align-top">{r.licence}</td>
                          <td className="py-2.5 px-3 border-b border-line/60 align-top">
                            <TestedCell t={r.tested} />
                          </td>
                          <td className="py-2.5 px-3 border-b border-line/60 align-top min-w-[230px]">
                            <SourceLinks sources={r.sources} compact />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ul className="min-[720px]:hidden grid gap-3" aria-label="AI models listed with sources">
                  {rows.map((r) => (
                    <li key={r.id} {...dataAttrs(r)} className="border border-line rounded-[16px] p-4 bg-[rgba(255,255,255,0.03)]">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div>
                          <p className="text-[0.78rem] text-muted-subtle uppercase tracking-wide">{r.provider}</p>
                          <p className="text-text font-semibold break-words">{r.name}</p>
                        </div>
                        <TestedCell t={r.tested} />
                      </div>
                      <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1 text-[0.9rem] text-muted">
                        <dt className="text-muted-subtle">Released</dt>
                        <dd>{r.releaseDate ? <time dateTime={r.releaseDate}>{r.releaseDate}</time> : "Not stated"}</dd>
                        <dt className="text-muted-subtle">Status</dt>
                        <dd>{cap(r.status)}</dd>
                        <dt className="text-muted-subtle">Access</dt>
                        <dd>{accessText(r.access)}</dd>
                        <dt className="text-muted-subtle">Licence</dt>
                        <dd>{r.licence}</dd>
                        <dt className="text-muted-subtle">Source</dt>
                        <dd>
                          <SourceLinks sources={r.sources} />
                        </dd>
                      </dl>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Container>
      </section>

      <section className="py-[26px]" aria-labelledby="tested-heading">
        <Container>
          <Panel>
            <h2 id="tested-heading" className="text-[1.2rem] mb-3">What Tested by us means</h2>
            <p className="text-muted text-[0.93rem] leading-relaxed mb-3">
              The value is derived by rule from our own records, never typed per model, and it carries no figure.
            </p>
            <ul className="text-muted text-[0.93rem] leading-relaxed list-disc pl-5 grid gap-1.5">
              {pilotRenders && (
                <li>
                  <strong className="text-text">Pilot:</strong> the model build appears in a published unofficial pilot report.
                  A pilot is a test of the test, not a score.
                </li>
              )}
              <li>
                <strong className="text-text">Queued:</strong> the build is on our weekly testing queue. No timeline is
                promised.
              </li>
              <li>
                <strong className="text-text">Not yet:</strong> no published test of the model exists. This is a status of our
                work, not a finding about the model.
              </li>
            </ul>
            {W.measuredOutsideCatalog.length > 0 && (
              <p className="text-muted text-[0.93rem] leading-relaxed mt-3">
                {W.measuredOutsideCatalog.length} {W.measuredOutsideCatalog.length === 1 ? "build" : "builds"} measured in earlier pilots
                ({W.measuredOutsideCatalog.join(", ")}) {W.measuredOutsideCatalog.length === 1 ? "has" : "have"} no row in this catalog, so
                {W.measuredOutsideCatalog.length === 1 ? " it does" : " they do"} not appear in the table above. See{" "}
                <Link href="/ai-models/reports" className="underline underline-offset-2">the pilot reports</Link>.
              </p>
            )}
            <p className="text-muted text-[0.93rem] leading-relaxed mt-3">
              {W.catalogAsOf && <>Catalog as of {dateLong(W.catalogAsOf)}. </>}
              Entries rest on the cited sources only. See{" "}
              <Link href="/ai-models/watch" className="underline underline-offset-2">the weekly editions</Link> for what
              shipped each week.
            </p>
          </Panel>
        </Container>
      </section>

      <section className="py-[10px]">
        <Container>
          <FaqAccordion items={faqItems} />
        </Container>
      </section>

      <section className="py-[20px]">
        <Container>
          <IndependenceCallout />
        </Container>
      </section>

      <section className="pb-[40px]">
        <Container>
          <div className="max-w-[900px]">
            <NewsletterSignup
              variant="card"
              source="model-watch-tracker"
              heading="Email me when a new edition publishes"
              body="One email when a new AI Model Watch edition is published. No promise of weekly timing."
              buttonLabel="Email me new editions"
              finePrint="Free. No promise of weekly timing. We never share your email."
              successTitle="Subscribed."
              successBody="Subscribed. We will email you when an edition publishes."
            />
          </div>
        </Container>
      </section>
    </>
  );
}
