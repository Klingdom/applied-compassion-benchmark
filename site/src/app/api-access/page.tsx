import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";
import ApiAccessCta from "./ApiAccessCta";
import { API_ACCESS } from "@/data/gumroad";

export const metadata: Metadata = {
  title: "API Access — Compassion Benchmark",
  description:
    "Free public JSON data plus a coming-soon Pro API tier for institutional access to Compassion Benchmark scores and structured data.",
};

export default function ApiAccessPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10 border-b border-line">
        <Container>
          <div className="max-w-4xl">
            <Eyebrow>Data access</Eyebrow>
            <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-4">
              API access
            </h1>
            <p className="text-muted text-[1.12rem] max-w-[760px] mb-6">
              Compassion Benchmark score data is available as public JSON and, coming soon, as a
              key-gated Pro API with richer fields, change history, and evidence references.
            </p>
          </div>
        </Container>
      </section>

      {/* Two tiers */}
      <section className="py-12">
        <Container>
          <SectionHead
            title="Available tiers"
            description="Start with the free public JSON. Upgrade to Pro when you need richer fields or change history."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Public JSON — free */}
            <div className="bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.02)] border border-line rounded-[20px] p-6 flex flex-col gap-4">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Free</Pill>
                <Pill>Public</Pill>
              </div>
              <h3 className="text-[1.2rem] font-bold">Public JSON</h3>
              <p className="text-muted">
                Static JSON files served from{" "}
                <code className="text-[0.9em] bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 rounded">
                  compassionbenchmark.com/data/
                </code>{" "}
                — CORS-open, regenerated on each build. No API key required.
              </p>
              <ul className="list-disc pl-[18px] text-muted space-y-1.5 text-[0.95rem]">
                <li>All 7 index families</li>
                <li>Rankings, composite scores, and band for each entity</li>
                <li>Dimension-level scores</li>
                <li>Regenerated nightly after research pipeline runs</li>
                <li>No rate limiting (static files, Nginx-served)</li>
              </ul>
              <div className="mt-auto">
                <Button href="/purchase-research" variant="primary" full>
                  Browse published research
                </Button>
              </div>
            </div>

            {/* Pro API — coming soon or live */}
            <div className="bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.02)] border border-line rounded-[20px] p-6 flex flex-col gap-4">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Pro</Pill>
                {!API_ACCESS.useGumroad && <Pill>Coming soon</Pill>}
              </div>
              <h3 className="text-[1.2rem] font-bold">Pro API</h3>
              <p className="text-muted">
                Key-gated API with richer fields, change history, evidence references, and higher
                request limits. Designed for institutional data teams and research workflows.
              </p>
              <ul className="list-disc pl-[18px] text-muted space-y-1.5 text-[0.95rem]">
                <li>Change history per entity (score deltas + dates)</li>
                <li>Evidence references from change proposals</li>
                <li>Band history</li>
                <li>Structured subdimension data</li>
                <li>Higher rate limits + priority cache</li>
              </ul>
              <div className="mt-auto">
                <ApiAccessCta />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Example usage */}
      <section className="py-12 border-t border-line">
        <Container>
          <SectionHead
            title="Public JSON — example usage"
            description="No SDK. No authentication. Just static JSON over HTTPS."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-3">All entities in an index</h3>
              <pre className="text-[0.8rem] text-[#94a3b8] overflow-x-auto font-mono leading-relaxed">
                <code>{`GET /data/fortune-500.json

{
  "meta": { "entityCount": 447, ... },
  "rankings": [
    {
      "rank": 1,
      "name": "...",
      "composite": 72.4,
      "band": "Established",
      "scores": { "WE": 4.2, "GC": 3.9, ... }
    }
  ]
}`}</code>
              </pre>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-3">Available index files</h3>
              <ul className="space-y-1.5 text-[0.9rem] font-mono text-muted">
                {[
                  "/data/fortune-500.json",
                  "/data/countries.json",
                  "/data/us-states.json",
                  "/data/ai-labs.json",
                  "/data/robotics-labs.json",
                  "/data/global-cities.json",
                  "/data/us-cities.json",
                ].map((path) => (
                  <li key={path} className="flex items-center gap-2">
                    <span className="text-[#7dd3fc]">GET</span>
                    <span>{path}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Independence note */}
      <section className="py-12 border-t border-line">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.4rem,2.5vw,1.8rem)] mb-3">
              Independence applies to API access too
            </h2>
            <p className="text-muted max-w-[820px]">
              Pro API access does not grant influence over scores, entity inclusion, or research
              priorities. The API serves published data only — the same data visible on every public
              index page. The assessment pipeline operates in a separate technical plane with no
              awareness of API subscribers.
            </p>
          </Callout>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="py-12 border-t border-line">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-[1.08rem] font-bold mb-2">Start with public data</h3>
            <p className="text-muted mb-4">
              The public JSON covers all 7 indexes and updates nightly. For most analytical use
              cases it is sufficient. Files at{" "}
              <code className="text-[0.85em] bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 rounded">
                /data/*.json
              </code>{" "}
              are CORS-open.
            </p>
            <Button href="/purchase-research" variant="primary">
              Browse published research
            </Button>
          </Card>
          <Card>
            <h3 className="text-[1.08rem] font-bold mb-2">Need a data license?</h3>
            <p className="text-muted mb-4">
              For institutional use, redistribution rights, or a structured data agreement, see
              Data Licenses.
            </p>
            <Button href="/data-licenses">Data licensing</Button>
          </Card>
        </Container>
      </section>
    </>
  );
}
