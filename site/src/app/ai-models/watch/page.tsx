import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import Callout from "@/components/ui/Callout";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import { IndependenceCallout } from "@/components/model-watch/parts";
import type { EditionManifestEntry } from "@/components/model-watch/types";
import { MODEL_WATCH_FACTS as W } from "@/lib/model-watch-facts";
import { dateLong } from "@/lib/model-report-facts";

// Edition listing (docs/UX_FLOWS_AI_MODEL_WATCH.md section 3a). Newest first. Not a ranking, not an evaluation.
// No Article schema on /ai-models/** (PRD C2); BreadcrumbList only.

const editions: EditionManifestEntry[] = [...W.editions]
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export const metadata: Metadata = pageMeta({
  title: "AI Model Watch: dated editions of what shipped, with sources",
  description:
    "Dated editions of what AI providers released and disclosed, with sources. Not a ranking and not an evaluation.",
}, "/ai-models/watch");

function EditionCard({ e, latest }: { e: EditionManifestEntry; latest: boolean }) {
  return (
    <Card href={`/ai-models/watch/${e.date}`}>
      <div className="flex items-center gap-2 mb-2">
        <time dateTime={e.date} className="text-text font-semibold">
          {dateLong(e.date)}
        </time>
        {latest && <Pill>Latest</Pill>}
      </div>
      <p className="text-[0.82rem] text-muted-subtle mb-2">
        Window {e.windowFrom} to {e.windowTo} &middot; {e.releaseCount} release{e.releaseCount === 1 ? "" : "s"} logged
      </p>
      <p className="text-muted text-[0.93rem] leading-relaxed">{e.lead}</p>
    </Card>
  );
}

export default function WatchListingPage() {
  const grouped = editions.length > 12;
  const years = grouped ? Array.from(new Set(editions.map((e) => e.date.slice(0, 4)))) : [];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "AI Models", url: breadcrumbUrl("/ai-models") },
          { name: "AI Model Watch", url: breadcrumbUrl("/ai-models/watch") },
        ]}
      />

      <section className="py-[38px]">
        <Container>
          <nav aria-label="Breadcrumb" className="text-[0.88rem] text-muted-subtle mb-4">
            <Link href="/" className="underline underline-offset-2">Home</Link> /{" "}
            <Link href="/ai-models" className="underline underline-offset-2">AI Models</Link> / AI Model Watch
          </nav>
          <Eyebrow>AI Model Watch</Eyebrow>
          <h1 className="text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.1] mt-3 mb-4">AI Model Watch</h1>
          <p className="text-muted max-w-[68ch] text-[1.05rem] leading-relaxed mb-3">
            Dated editions of what AI providers shipped and what they disclosed about their own releases, each with
            sources. This is not a ranking and not an evaluation.
          </p>
          <p className="text-muted max-w-[68ch] text-[0.95rem] leading-relaxed">
            Looking for the full list of models? See the{" "}
            <Link href="/ai-models/tracker" className="underline underline-offset-2">model tracker</Link>.
          </p>
          <p className="text-muted max-w-[68ch] text-[0.95rem] leading-relaxed mt-3">
            <Link href="/ai-models/cycle" className="underline underline-offset-2">How the weekly cycle works</Link>: what
            runs today and what is planned.
          </p>
        </Container>
      </section>

      <section className="py-[16px]" aria-labelledby="editions-heading">
        <Container>
          <h2 id="editions-heading" className="text-[clamp(1.3rem,2.5vw,1.7rem)] tracking-tight mb-4">
            Editions
          </h2>
          {editions.length === 0 ? (
            <Callout>
              <p className="text-text font-medium mb-1">No edition has been published yet.</p>
              <p className="text-muted text-[0.93rem]">
                Nothing is implied about the industry. The{" "}
                <Link href="/ai-models/tracker" className="underline underline-offset-2">model tracker</Link> lists models
                with sources in the meantime.
              </p>
            </Callout>
          ) : grouped ? (
            years.map((y) => (
              <div key={y} className="mb-8">
                <h3 className="text-[1.15rem] mb-3">{y}</h3>
                <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
                  {editions
                    .filter((e) => e.date.startsWith(y))
                    .map((e) => (
                      <EditionCard key={e.date} e={e} latest={e.date === editions[0].date} />
                    ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
              {editions.map((e, i) => (
                <EditionCard key={e.date} e={e} latest={i === 0} />
              ))}
            </div>
          )}
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
              source="model-watch-hub-list"
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
