import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import manifest from "@/data/special-briefings/manifest.json";
import type { BriefingManifestEntry } from "@/data/special-briefings/types";

export const metadata: Metadata = {
  title: "Special Briefings — Compassion Benchmark",
  description:
    "Occasional thematic deep-dives from Compassion Benchmark: cross-index analysis, structural patterns, and interpretive findings published outside the daily cycle.",
  alternates: {
    canonical: "https://compassionbenchmark.com/updates/special",
  },
  openGraph: {
    title: "Special Briefings — Compassion Benchmark",
    description:
      "Occasional thematic deep-dives: cross-index analysis, structural patterns, and interpretive findings across 1,156 entities.",
    url: "https://compassionbenchmark.com/updates/special",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Special Briefings — Compassion Benchmark",
    description:
      "Occasional thematic deep-dives: cross-index analysis, structural patterns, and interpretive findings across 1,156 entities.",
  },
};

function formatDate(dateStr: string): string {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return dateStr;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function SpecialBriefingsIndexPage() {
  const briefings = manifest.briefings as BriefingManifestEntry[];

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Compassion Benchmark — Special Briefings",
            description:
              "Occasional thematic deep-dives: cross-index analysis, structural patterns, and interpretive findings from Compassion Benchmark.",
            url: "https://compassionbenchmark.com/updates/special",
            publisher: {
              "@type": "Organization",
              name: "Compassion Benchmark",
              url: "https://compassionbenchmark.com",
            },
          }),
        }}
      />

      {/* ── Hero / standfirst ─────────────────────────────────────────────── */}
      <section className="pt-[72px] pb-8 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(125,211,252,0.06) 0%, rgba(125,211,252,0) 60%)",
          }}
        />
        <Container className="relative max-w-[860px]">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 mb-6 text-[0.82rem] text-muted"
          >
            <Link href="/updates" className="hover:text-text transition-colors">
              Daily Briefing
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-text font-medium">Special Briefings</span>
          </nav>

          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded border border-[rgba(125,211,252,0.35)] bg-[rgba(125,211,252,0.08)] text-accent">
              Special Briefings
            </span>
            <span className="text-muted text-[0.8rem]">
              {briefings.length} {briefings.length === 1 ? "analysis" : "analyses"} published
            </span>
          </div>

          <h1 className="text-[clamp(2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.03em] mb-5 font-bold">
            Special Briefings
          </h1>

          {/* Standfirst — what Special Briefings are */}
          <div className="border-l-2 border-[rgba(125,211,252,0.3)] pl-4 mb-8 space-y-3 max-w-[680px]">
            <p className="text-muted text-[1rem] sm:text-[1.08rem] leading-relaxed">
              Special Briefings are deep-dive thematic analyses distinct from the
              daily briefing cycle. Where daily briefings track score movements
              and new evidence as they emerge, Special Briefings step back to ask
              structural questions: what does the full record reveal about how
              certain entity types score, where the hardest patterns persist, and
              what the benchmark actually shows at the extremes.
            </p>
            <p className="text-muted text-[0.92rem] leading-relaxed">
              Each analysis draws exclusively on Compassion Benchmark&apos;s own
              scoring data — no external commentary, no editorial interpolation.
              Published outside the daily cycle when a pattern in the data is
              large enough to warrant dedicated treatment.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Briefings library ─────────────────────────────────────────────── */}
      <div className="border-t border-line">
        <Container className="max-w-[860px] py-10">
          {briefings.length === 0 ? (
            <div className="rounded-[16px] border border-line bg-[rgba(255,255,255,0.02)] p-8 text-center">
              <p className="text-muted text-[0.95rem]">
                No special briefings published yet. Check back after the next
                analytical cycle.
              </p>
              <Link
                href="/updates"
                className="mt-4 inline-flex items-center gap-1.5 text-[0.88rem] text-accent hover:text-text font-medium transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M9 2L4 7l5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Latest daily briefing
              </Link>
            </div>
          ) : (
            <ul className="space-y-5" role="list">
              {briefings.map((b) => (
                <li key={b.slug}>
                  <BriefingCard briefing={b} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </div>

      {/* ── Newsletter capture — primary forward engagement CTA ──────────── */}
      <div className="border-t border-line py-10 bg-[rgba(255,255,255,0.01)]">
        <Container className="max-w-[860px]">
          <NewsletterSignup
            variant="card"
            source="special-index"
            preamble="New special briefings are announced in the weekly email."
          />
        </Container>
      </div>

      {/* ── Footer nav — forward primary, daily link demoted ─────────────── */}
      <div className="border-t border-line py-6 bg-[rgba(255,255,255,0.01)]">
        <Container className="max-w-[860px]">
          <div className="flex items-center justify-end">
            <Link
              href="/updates"
              className="inline-flex items-center gap-1.5 text-[0.82rem] text-muted hover:text-text transition-colors"
            >
              Latest daily briefing
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 6.5h7M7 3l3.5 3.5L7 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </Container>
      </div>
    </>
  );
}

// ─── BriefingCard sub-component ───────────────────────────────────────────────

function BriefingCard({ briefing }: { briefing: BriefingManifestEntry }) {
  return (
    <Link
      href={`/updates/special/${briefing.slug}`}
      className="group block rounded-[20px] border border-line bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.01)] p-6 sm:p-7 transition-all hover:border-[rgba(125,211,252,0.3)] hover:bg-[rgba(125,211,252,0.03)]"
    >
      {/* Edition + date meta */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded border border-[rgba(125,211,252,0.25)] bg-[rgba(125,211,252,0.06)] text-accent">
          {briefing.edition}
        </span>
        <span className="text-muted text-[0.8rem]">
          {formatDate(briefing.date)}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-[1.2rem] sm:text-[1.4rem] font-bold leading-tight tracking-tight mb-2 text-text group-hover:text-accent transition-colors">
        {briefing.title}
      </h2>

      {/* Dek */}
      <p className="text-muted text-[0.92rem] sm:text-[0.96rem] leading-relaxed max-w-[700px]">
        {briefing.dek}
      </p>

      {/* Read CTA — explicit forward action */}
      <div className="mt-4 flex items-center gap-1.5 text-[0.82rem] text-accent font-medium">
        Read the analysis
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 6.5h8M7 2.5l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
}
