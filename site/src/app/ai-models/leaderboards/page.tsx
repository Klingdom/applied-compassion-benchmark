import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Callout from "@/components/ui/Callout";
import Panel from "@/components/ui/Panel";
import Pill from "@/components/ui/Pill";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import FaqAccordion from "@/components/seo/FaqAccordion";
import { IndependenceCallout } from "@/components/model-watch/parts";
import { MODEL_INDEX_FACTS as F } from "@/lib/model-index-facts";
import { loadRenderableReports } from "@/lib/model-report-gate";
import { getIndexEntityCount } from "@/data/entityCount";
import {
  RANKING_CONDITIONS,
  CONDITIONS_MET,
  CONDITIONS_TOTAL,
  CONDITIONS_STATUS_AS_OF,
  type ConditionStatus,
} from "@/data/model-ranking-conditions";

// Leaderboards (docs/UX_FLOWS_AI_MODEL_WATCH.md section 4). Answers "where is the model ranking?" honestly and routes to
// what exists. Names no model, shows no lab score, and never prints the phrase for a count of tracked models. The
// optional AI Labs preview (UX section 4 item 3) is OFF: it is a build flag that is only turned on after the gates
// pass, and it would show organisations only, in the index's published order, with no score or band.
const SHOW_LABS_PREVIEW = false;
void SHOW_LABS_PREVIEW;

const labCount = getIndexEntityCount("ai-labs");
const pilotRenders = loadRenderableReports().length > 0;

export const metadata: Metadata = pageMeta({
  title: "Compassion leaderboards: what exists and what does not",
  description:
    "No model ranking is published. The live compassion leaderboard is for organisations: the AI Labs Index. " +
    "This page lists the conditions that would have to hold before any model comparison could open.",
}, "/ai-models/leaderboards");

const faqItems = [
  {
    question: "Is there a ranking of AI models by compassion?",
    answer:
      "No model ranking is published. The task bank is public, so comparison between models on it is not valid, and the conditions " +
      "for a valid comparison are not yet met. Any ranking of AI models attributed to Compassion Benchmark would be fabricated.",
  },
  {
    question: "Where is the compassion leaderboard that does exist?",
    answer:
      `The AI Labs Index scores ${labCount} organisations on their public governance record. It does not describe model ` +
      "behaviour: it describes how an organisation governs itself.",
  },
  {
    question: "Why does a model show Not yet on the tracker?",
    answer:
      "The label reflects published test reports only. Not yet is a status of our work, not a finding about the model.",
  },
];

const STATUS_LABEL: Record<ConditionStatus, string> = {
  met: "Met",
  "in-progress": "In progress",
  "not-met": "Not met",
  unknown: "Status unknown",
};

export default function LeaderboardsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "AI Models", url: breadcrumbUrl("/ai-models") },
          { name: "Compassion leaderboards", url: breadcrumbUrl("/ai-models/leaderboards") },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <section className="py-[38px]">
        <Container>
          <nav aria-label="Breadcrumb" className="text-[0.88rem] text-muted-subtle mb-4">
            <Link href="/" className="underline underline-offset-2">Home</Link> /{" "}
            <Link href="/ai-models" className="underline underline-offset-2">AI Models</Link> / Compassion leaderboards
          </nav>
          <Eyebrow>AI Model Watch</Eyebrow>
          <h1 className="text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.1] mt-3 mb-5">
            Compassion leaderboards: what exists and what does not
          </h1>
          <Callout>
            <p className="text-text text-[1.1rem] font-semibold mb-2">
              No model ranking is published. This is not a ranking page.
            </p>
            <p className="text-muted text-[0.95rem] leading-relaxed">
              The task bank of {F.itemCount} items is public, there is no cross-family judging yet, and not enough items have
              been human-validated. Read the{" "}
              <Link href="/ai-models/methodology" className="underline underline-offset-2">method</Link> for the full
              account.
            </p>
          </Callout>
        </Container>
      </section>

      <section className="py-[16px]" aria-labelledby="exists-heading">
        <Container>
          <h2 id="exists-heading" className="text-[clamp(1.35rem,2.6vw,1.85rem)] tracking-tight mb-4">
            What does exist
          </h2>
          <Card variant="featured" href="/ai-labs" className="max-w-[900px]">
            <p className="text-[0.75rem] tracking-wide text-muted-subtle uppercase mb-1">For organisations</p>
            <p className="text-[1.2rem] font-bold mb-2">
              The live compassion leaderboard is for organisations: AI Labs Index
            </p>
            <p className="text-muted text-[0.95rem] leading-relaxed mb-3">
              {labCount} labs scored. The AI Labs Index does not describe model behaviour. It describes how an organisation
              governs itself, which is a different measurement of a different object.
            </p>
            <span className="inline-flex items-center justify-center min-h-[48px] px-[18px] rounded-[14px] font-bold bg-gradient-to-br from-accent to-accent-2 text-[#07111f]">
              Open the AI Labs Index
            </span>
          </Card>
        </Container>
      </section>

      <section className="py-[26px]" id="conditions" aria-labelledby="conditions-heading">
        <Container>
          <h2 id="conditions-heading" className="text-[clamp(1.35rem,2.6vw,1.85rem)] tracking-tight mb-2">
            What would have to be true first
          </h2>
          <p className="text-muted max-w-[68ch] mb-2">
            All of these must hold, and the founder must decide. {CONDITIONS_MET} of {CONDITIONS_TOTAL} conditions met. Even
            then, the first form would be groupings with ranges, not an ordered list.
          </p>
          <p className="text-[0.85rem] text-muted-subtle mb-4">
            Hand-checked statuses were last reviewed {CONDITIONS_STATUS_AS_OF}. A status that cannot be verified says so.
          </p>
          <Panel>
            <ol aria-label="Conditions for opening a model comparison" className="grid gap-4 list-decimal pl-5">
              {RANKING_CONDITIONS.map((c) => (
                <li key={c.id} className="text-muted leading-relaxed">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-text">{c.text}</span>
                    <span className="flex flex-wrap items-center gap-2 text-[0.85rem]">
                      <Pill>{STATUS_LABEL[c.status]}</Pill>
                      <span className="text-muted-subtle">Source: {c.ref}</span>
                      {c.evidenceHref && (
                        <Link href={c.evidenceHref} className="underline underline-offset-2 text-accent">
                          Evidence
                        </Link>
                      )}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </Container>
      </section>

      <section className="py-[16px]" aria-labelledby="not-yet-heading">
        <Container>
          <h2 id="not-yet-heading" className="text-[clamp(1.35rem,2.6vw,1.85rem)] tracking-tight mb-3">
            Why some models show Not yet
          </h2>
          <p className="text-muted max-w-[68ch] leading-relaxed">
            The Tested by us column on the{" "}
            <Link href="/ai-models/tracker" className="underline underline-offset-2">model tracker</Link> is derived by rule from
            published records. {pilotRenders ? "A build that was run only as an agent, or in a wave that is not published, " : "A build with no published test "}
            shows Not yet. That label is a status of our work. It is not a finding about the model, and it is not a grade.
          </p>
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
          <div className="flex gap-3 flex-wrap mt-5">
            <Button href="/ai-models/methodology">Read the method</Button>
            <Button href="/ai-models/cycle">How the weekly cycle works</Button>
            <Button href="/insights/why-we-do-not-rank-ai-models-yet">Why we do not rank models yet</Button>
          </div>
        </Container>
      </section>

      <section className="pb-[40px]">
        <Container>
          <div className="max-w-[900px]">
            <NewsletterSignup
              variant="card"
              source="model-watch-leaderboards"
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
