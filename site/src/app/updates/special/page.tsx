import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import manifest from "@/data/special-briefings/manifest.json";

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
  const { briefings } = manifest;

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

      {/* Hero section */}
      <section className="pt-[72px] pb-8 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(125,211,252,0.06) 0%, rgba(125,211,252,0) 60%)",
          }}
        />
        <Container className="relative">
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

          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded border border-[rgba(125,211,252,0.35)] bg-[rgba(125,211,252,0.08)] text-accent">
              Special Briefings
            </span>
            <span className="text-muted text-[0.8rem]">Thematic analysis</span>
          </div>

          <h1 className="text-[clamp(2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.03em] mb-4 font-bold">
            Special Briefings
          </h1>

          <p className="text-muted text-[1rem] sm:text-[1.1rem] leading-relaxed max-w-[680px] mb-8">
            Occasional deep-dives into structural patterns across all seven
            indexes. While daily briefings track the latest score movements and
            evidence, Special Briefings step back to examine how the benchmark
            works — what patterns appear at the top and bottom of the scale,
            how entity types compare, and what the full record reveals over
            time.
          </p>

          <Link
            href="/updates"
            className="inline-flex items-center gap-1.5 text-[0.88rem] text-accent hover:text-text font-medium transition-colors"
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
            Back to daily briefing
          </Link>
        </Container>
      </section>

      {/* Briefings list */}
      <div className="border-t border-line">
        <Container className="py-10">
          {briefings.length === 0 ? (
            <p className="text-muted text-[0.95rem]">
              No special briefings published yet.
            </p>
          ) : (
            <ul className="space-y-6" role="list">
              {briefings.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/updates/special/${b.slug}`}
                    className="group block rounded-[20px] border border-line bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.01)] p-6 sm:p-7 transition-all hover:border-[rgba(125,211,252,0.3)] hover:bg-[rgba(125,211,252,0.03)]"
                  >
                    {/* Edition + date meta */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="text-[0.7rem] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded border border-[rgba(125,211,252,0.25)] bg-[rgba(125,211,252,0.06)] text-accent">
                        {b.edition}
                      </span>
                      <span className="text-muted text-[0.8rem]">
                        {formatDate(b.date)}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-[1.2rem] sm:text-[1.4rem] font-bold leading-tight tracking-tight mb-2 text-text group-hover:text-accent transition-colors">
                      {b.title}
                    </h2>

                    {/* Dek */}
                    <p className="text-muted text-[0.92rem] sm:text-[0.96rem] leading-relaxed max-w-[700px]">
                      {b.dek}
                    </p>

                    {/* Read link */}
                    <div className="mt-4 flex items-center gap-1.5 text-[0.82rem] text-accent font-medium">
                      Read briefing
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
                </li>
              ))}
            </ul>
          )}
        </Container>
      </div>
    </>
  );
}
