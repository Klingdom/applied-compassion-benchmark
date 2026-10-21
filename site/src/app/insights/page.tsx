import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import Callout from "@/components/ui/Callout";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import { IndependenceCallout } from "@/components/model-watch/parts";
import InsightsFilter from "@/components/insights/InsightsFilter";
import { AUDIENCE_LABEL, insightEntries } from "@/components/insights/data";
import { dateLong } from "@/lib/model-report-facts";

// Insights listing (docs/UX_FLOWS_AI_MODEL_WATCH.md section 5a). Argued, cited pieces; newest first.

export const metadata: Metadata = {
  title: "Insights: cited pieces on compassion-first AI for labs and agent builders",
  description:
    "Argued, cited pieces on compassion-first AI for AI labs and agent builders. Every figure carries a source or is derived from the published data.",
  alternates: { canonical: "/insights" },
};

const audienceFilters = (a: string) => (a === "ai-labs" ? "labs" : a === "agent-builders" ? "agents" : "labs agents");

export default function InsightsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "Insights", url: breadcrumbUrl("/insights") },
        ]}
      />

      <section className="py-[38px]">
        <Container>
          <nav aria-label="Breadcrumb" className="text-[0.88rem] text-muted-subtle mb-4">
            <Link href="/" className="underline underline-offset-2">Home</Link> / Insights
          </nav>
          <Eyebrow>Insights</Eyebrow>
          <h1 className="text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.1] mt-3 mb-4">Insights</h1>
          <p className="text-muted max-w-[900px] text-[1.05rem] leading-relaxed">
            Argued, cited pieces on compassion-first AI for AI labs, agent builders, press and policy readers. Every figure
            carries a source or is derived from the data published on this site.
          </p>
        </Container>
      </section>

      <section className="py-[16px]" aria-labelledby="posts-heading">
        <Container>
          <h2 id="posts-heading" className="text-[clamp(1.3rem,2.5vw,1.7rem)] tracking-tight mb-4">Posts</h2>
          {insightEntries.length === 0 ? (
            <Callout>
              <p className="text-text font-medium">No posts yet.</p>
            </Callout>
          ) : (
            <>
              <InsightsFilter scopeId="insight-posts" />
              <div id="insight-posts" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
                {insightEntries.map((p) => (
                  <div key={p.slug} data-audience={audienceFilters(p.audience)}>
                    <Card href={`/insights/${p.slug}`}>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Pill>{AUDIENCE_LABEL[p.audience]}</Pill>
                        <span className="text-[0.82rem] text-muted-subtle">
                          <time dateTime={p.date}>{dateLong(p.date)}</time> &middot; {p.readingMinutes} min read
                        </span>
                      </div>
                      <h3 className="text-[1.15rem] mb-2">{p.title}</h3>
                      <p className="text-muted text-[0.93rem] leading-relaxed">{p.dek}</p>
                    </Card>
                  </div>
                ))}
              </div>
            </>
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
              source="insights-list"
              heading="Email me when a new piece publishes"
              body="One email when a new Insights piece or AI Model Watch edition is published. No promise of weekly timing."
              buttonLabel="Email me new pieces"
              finePrint="Free. No promise of weekly timing. We never share your email."
              successTitle="Subscribed."
              successBody="Subscribed. We will email you when something publishes."
            />
          </div>
        </Container>
      </section>
    </>
  );
}
