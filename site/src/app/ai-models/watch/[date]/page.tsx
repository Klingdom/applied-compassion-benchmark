import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Callout from "@/components/ui/Callout";
import Pill from "@/components/ui/Pill";
import Stat from "@/components/ui/Stat";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import { CRISIS_LINE, IndependenceCallout, SourceLinks, displayTitle, hostOf } from "@/components/model-watch/parts";
import type { CompiledEdition, EditionManifestEntry } from "@/components/model-watch/types";
import { MODEL_WATCH_FACTS as W, editionDates, loadEdition } from "@/lib/model-watch-facts";
import { dateLong } from "@/lib/model-report-facts";

// Edition page (docs/UX_FLOWS_AI_MODEL_WATCH.md section 3b): six parts in fixed order, one h2 each. No Article schema
// (PRD C2). Every number comes from the compiled edition; nothing is typed here.
//
// generateStaticParams must not be empty under output: "export". The edition manifest ships in the same commit as at
// least one compiled edition (ARCHITECTURE_AI_MODEL_WATCH.md A7).

const manifestEditions: EditionManifestEntry[] = [...W.editions]
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export function generateStaticParams() {
  return editionDates().map((date) => ({ date }));
}

async function getEdition(date: string): Promise<CompiledEdition | null> {
  return loadEdition(date);
}

const KIND_LABEL: Record<string, string> = {
  "new-model": "New model",
  "new-version": "New version",
  update: "Update",
  "open-weights-release": "Open-weights release",
  "api-availability": "API availability",
  deprecation: "Deprecation",
  "safety-documentation": "Safety documentation",
  policy: "Policy notice",
};
// Honest label for the disclosures section: the text is our summary, not a quotation (QA H2). The gate requires this exact string.
const DISCLOSURE_LABEL = "Summary by Compassion Benchmark of the provider's own disclosure";
const kindLabel = (k: string) => KIND_LABEL[k] ?? "Other";

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  const ed = await getEdition(date);
  if (!ed) return { title: "AI Model Watch" };
  const path = `/ai-models/watch/${date}`;
  const title = `AI Model Watch, ${dateLong(date)}`;
  const ogImage = `/og/model-watch-${date}.png`;
  return {
    title,
    description: ed.lead,
    alternates: { canonical: path },
    openGraph: { title, description: ed.lead, url: path, type: "website", images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description: ed.lead, images: [ogImage] },
  };
}

const SECTIONS = [
  { id: "window", label: "Window and coverage" },
  { id: "releases", label: "New releases" },
  { id: "disclosures", label: "Safety and welfare disclosures" },
  { id: "measured", label: "What we measured this week" },
  { id: "queue", label: "Queue status" },
  { id: "corrections", label: "Corrections, sources, independence" },
];

function sortReleases(rs: CompiledEdition["releases"]) {
  return rs
    .slice()
    .sort((a, b) =>
      a.date !== b.date ? (a.date < b.date ? 1 : -1) : a.provider.localeCompare(b.provider, "en", { sensitivity: "base" }),
    );
}

export default async function EditionPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const ed = await getEdition(date);
  if (!ed) notFound();

  const idx = manifestEditions.findIndex((e) => e.date === date);
  const newer = idx > 0 ? manifestEditions[idx - 1] : null;
  const older = idx >= 0 && idx < manifestEditions.length - 1 ? manifestEditions[idx + 1] : null;
  const releases = sortReleases(ed.releases);
  const h2 = "text-[clamp(1.35rem,2.6vw,1.85rem)] tracking-tight mb-3";

  const editionNav = (
    <nav aria-label="Editions" className="flex flex-wrap justify-between gap-3 text-[0.93rem]">
      <span>
        {older && (
          <Link href={`/ai-models/watch/${older.date}`} className="underline underline-offset-2 text-accent">
            Previous edition: {older.date}
          </Link>
        )}
      </span>
      <Link href="/ai-models/watch" className="underline underline-offset-2 text-accent">
        All editions
      </Link>
      <span>
        {newer && (
          <Link href={`/ai-models/watch/${newer.date}`} className="underline underline-offset-2 text-accent">
            Next edition: {newer.date}
          </Link>
        )}
      </span>
    </nav>
  );

  const jump = (
    <ol className="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.9rem]">
      {SECTIONS.map((s) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className="text-muted underline underline-offset-2">
            {s.label}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "AI Models", url: breadcrumbUrl("/ai-models") },
          { name: "AI Model Watch", url: breadcrumbUrl("/ai-models/watch") },
          { name: dateLong(date), url: breadcrumbUrl(`/ai-models/watch/${date}`) },
        ]}
      />

      <section className="py-[38px]">
        <Container>
          <nav aria-label="Breadcrumb" className="text-[0.88rem] text-muted-subtle mb-4">
            <Link href="/" className="underline underline-offset-2">Home</Link> /{" "}
            <Link href="/ai-models" className="underline underline-offset-2">AI Models</Link> /{" "}
            <Link href="/ai-models/watch" className="underline underline-offset-2">AI Model Watch</Link> / {date}
          </nav>
          <Eyebrow>AI Model Watch</Eyebrow>
          <h1 className="text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.1] mt-3 mb-4">
            AI Model Watch, <time dateTime={date}>{dateLong(date)}</time>
          </h1>
          <p className="text-muted max-w-[900px] text-[1.05rem] leading-relaxed mb-3">{ed.lead}</p>
          <p className="text-muted-subtle text-[0.9rem] mb-4">
            Window {ed.window.from} to {ed.window.to}. As of <time dateTime={ed.asOf}>{ed.asOf}</time>. This edition records
            what was released and disclosed. It is not a ranking and not an evaluation.
          </p>
          <div className="hidden md:block mb-4">
            <p className="text-[0.75rem] tracking-wide text-muted-subtle uppercase mb-2">On this page</p>
            {jump}
          </div>
          <details className="md:hidden border border-line rounded-[14px] px-4 py-3 mb-4">
            <summary className="cursor-pointer text-text font-medium">On this page</summary>
            <div className="mt-3">{jump}</div>
          </details>
          {editionNav}
        </Container>
      </section>

      {/* 1. Window and coverage */}
      <section className="py-[18px]" id="window" aria-labelledby="window-heading">
        <Container>
          <h2 id="window-heading" className={h2}>1. Window and coverage</h2>
          <Callout>
            <p className="text-muted text-[0.95rem] leading-relaxed">
              <strong className="text-text">
                Window {ed.window.from} to {ed.window.to}.
              </strong>{" "}
              {ed.coverageStatement}
            </p>
            <p className="text-muted text-[0.93rem] leading-relaxed mt-2">
              A source that was not scanned is not &ldquo;nothing found&rdquo;.
            </p>
          </Callout>
        </Container>
      </section>

      {/* 2. New releases */}
      <section className="py-[18px]" id="releases" aria-labelledby="releases-heading">
        <Container>
          <h2 id="releases-heading" className={h2}>2. New releases</h2>
          {releases.length === 0 ? (
            <p className="text-muted">No releases logged in this window. See the coverage note above.</p>
          ) : (
            <>
              <div className="hidden min-[720px]:block overflow-x-auto border border-line rounded-[14px]">
                <table className="w-full text-[0.9rem] border-collapse min-w-[860px]">
                  <caption className="sr-only">Releases logged in this window, newest date first</caption>
                  <thead>
                    <tr className="text-left text-muted-subtle">
                      {["Date", "Provider", "Model", "Kind", "Summary", "Sources"].map((h) => (
                        <th key={h} scope="col" className="py-2.5 px-3 border-b border-line font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-muted">
                    {releases.map((r) => (
                      <tr key={r.releaseId}>
                        <td className="py-2.5 px-3 border-b border-line/60 align-top whitespace-nowrap">
                          <time dateTime={r.date}>{r.date}</time>
                        </td>
                        <td className="py-2.5 px-3 border-b border-line/60 align-top">{r.provider}</td>
                        <th scope="row" className="py-2.5 px-3 border-b border-line/60 align-top text-left text-text font-medium break-words">
                          {r.modelName ?? "Not stated"}
                        </th>
                        <td className="py-2.5 px-3 border-b border-line/60 align-top">
                          <Pill>{kindLabel(r.kind)}</Pill>
                        </td>
                        <td className="py-2.5 px-3 border-b border-line/60 align-top leading-relaxed">{r.summary}</td>
                        <td className="py-2.5 px-3 border-b border-line/60 align-top">
                          <SourceLinks sources={r.sources} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="min-[720px]:hidden grid gap-3" aria-label="Releases logged in this window">
                {releases.map((r) => (
                  <li key={r.releaseId} className="border border-line rounded-[16px] p-4 bg-[rgba(255,255,255,0.03)]">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div>
                        <p className="text-[0.78rem] text-muted-subtle">
                          <time dateTime={r.date}>{r.date}</time> &middot; {r.provider}
                        </p>
                        <p className="text-text font-semibold break-words">{r.modelName ?? "Not stated"}</p>
                      </div>
                      <Pill>{kindLabel(r.kind)}</Pill>
                    </div>
                    <p className="text-muted text-[0.9rem] leading-relaxed mb-2">{r.summary}</p>
                    <SourceLinks sources={r.sources} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </Container>
      </section>

      {/* 3. Safety and welfare disclosures: our summary of the provider's disclosure, source linked, never a quotation */}
      <section className="py-[18px]" id="disclosures" aria-labelledby="disclosures-heading">
        <Container>
          <h2 id="disclosures-heading" className={h2}>3. Safety and welfare disclosures</h2>
          <p className="text-muted text-[0.95rem] mb-4 max-w-[900px]">
            We summarise what providers disclosed and link the source. We do not assess it.
          </p>
          {ed.disclosures.length === 0 ? (
            <p className="text-muted">No relevant disclosures were logged. This does not mean none were made.</p>
          ) : (
            <ul className="grid gap-4 max-w-[900px] list-none p-0 m-0">
              {ed.disclosures.map((d) => (
                <li key={d.releaseId}>
                  <p className="text-text font-medium text-[0.95rem] mb-1">
                    {d.provider}: {d.modelName ?? "policy notice, no model named"}
                  </p>
                  <p className="text-[0.8rem] text-muted-subtle mb-1.5">{DISCLOSURE_LABEL}</p>
                  <p className="text-muted leading-relaxed">{d.safetyNote}</p>
                  <p className="text-[0.85rem] text-muted-subtle mt-1.5">
                    Source{d.sources.length > 1 ? "s" : ""}:{" "}
                    {d.sources.map((src, i) => (
                      <span key={src.url}>
                        {i > 0 && "; "}
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 text-accent"
                        >
                          {hostOf(src.url)}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                        , retrieved <time dateTime={src.accessed}>{src.accessed}</time>
                      </span>
                    ))}
                    .
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      {/* 4. What we measured: label and link only, never a figure */}
      <section className="py-[18px]" id="measured" aria-labelledby="measured-heading">
        <Container>
          <h2 id="measured-heading" className={h2}>4. What we measured this week</h2>
          {ed.measured.reports.length === 0 ? (
            <p className="text-muted">No assessment was published in this window.</p>
          ) : (
            <ul className="grid gap-2 text-muted">
              {ed.measured.reports.map((r) => (
                <li key={r.runId}>
                  <Link href={r.href} className="underline underline-offset-2 text-accent">
                    Unofficial pilot report, {r.reportDate}
                  </Link>{" "}
                  (unofficial; not a score)
                </li>
              ))}
            </ul>
          )}
          {ed.measured.note && <p className="text-muted mt-3">{ed.measured.note}</p>}
        </Container>
      </section>

      {/* 5. Queue status */}
      <section className="py-[18px]" id="queue" aria-labelledby="queue-heading">
        <Container>
          <h2 id="queue-heading" className={h2}>5. Queue status</h2>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] max-w-[640px] mb-3">
            <Stat value={String(ed.queue.queued)} label="Queued" />
            <Stat value={String(ed.queue.measured)} label="Measured" />
            <Stat value={String(ed.queue.skipped)} label="Skipped" />
          </div>
          <p className="text-muted text-[0.93rem]">
            {ed.queue.asOf ? `Queue as of ${ed.queue.asOf}. ` : ""}No timelines are promised.
          </p>
        </Container>
      </section>

      {/* 6. Corrections, sources, independence, signup */}
      <section className="py-[18px]" id="corrections" aria-labelledby="corrections-heading">
        <Container>
          <h2 id="corrections-heading" className={h2}>6. Corrections, sources, independence</h2>
          <h3 className="text-[1.05rem] mb-2">Corrections</h3>
          {ed.corrections.length === 0 ? (
            <p className="text-muted mb-5">No corrections yet.</p>
          ) : (
            <ul className="grid gap-2 text-muted mb-5">
              {ed.corrections.map((c) => (
                <li key={`${c.date}-${c.text.slice(0, 24)}`}>
                  <time dateTime={c.date} className="text-text">{c.date}</time>: {c.text}
                </li>
              ))}
            </ul>
          )}
          <h3 className="text-[1.05rem] mb-2">Sources</h3>
          <ol className="list-decimal pl-5 grid gap-1 text-[0.9rem] text-muted mb-6">
            {ed.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-accent break-words">
                  {displayTitle(s.title)}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>{" "}
                <span className="text-muted-subtle">
                  ({hostOf(s.url)}, retrieved {s.accessed})
                </span>
              </li>
            ))}
          </ol>
          <IndependenceCallout />
          <p className="text-[0.86rem] text-muted-subtle mt-4 max-w-[900px] leading-relaxed">{CRISIS_LINE}</p>
        </Container>
      </section>

      <section className="py-[10px]">
        <Container>{editionNav}</Container>
      </section>

      <section className="py-[20px] pb-[40px]">
        <Container>
          <div className="max-w-[900px]">
            <NewsletterSignup
              variant="card"
              source="model-watch-edition"
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
