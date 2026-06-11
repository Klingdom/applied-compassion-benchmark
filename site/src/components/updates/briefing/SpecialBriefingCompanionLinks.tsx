/**
 * SpecialBriefingCompanionLinks — Wave H1, Item #5
 *
 * "Read next" companion card + "Related daily briefing" link.
 * - Shows the OTHER report(s) from the manifest (the two are a companion pair).
 * - Links to the related daily briefing for the same date.
 * Server component — no client JS.
 */

import Link from "next/link";
import manifest from "@/data/special-briefings/manifest.json";

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

interface Props {
  currentSlug: string;
  date: string;
}

export default function SpecialBriefingCompanionLinks({ currentSlug, date }: Props) {
  // Find companion briefings (all others from the manifest)
  const companions = manifest.briefings.filter((b) => b.slug !== currentSlug);

  return (
    <section
      aria-labelledby="companion-heading"
      className="border-t border-line py-8"
    >
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          id="companion-heading"
          className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-muted mb-4"
        >
          Continue reading
        </h2>

        <div className="flex flex-col gap-4">
          {/* Companion special briefings */}
          {companions.length > 0 && (
            <div className="space-y-3">
              {companions.map((b) => (
                <Link
                  key={b.slug}
                  href={`/updates/special/${b.slug}`}
                  className="group flex items-start gap-4 rounded-[16px] border border-line bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.01)] p-5 transition-all hover:border-[rgba(125,211,252,0.3)] hover:bg-[rgba(125,211,252,0.03)]"
                >
                  {/* "Read next" label */}
                  <div className="shrink-0 mt-0.5">
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded border border-[rgba(125,211,252,0.25)] bg-[rgba(125,211,252,0.06)] text-accent">
                      Companion
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.7rem] text-muted mb-1">{formatDate(b.date)}</p>
                    <h3 className="text-[1rem] font-bold leading-snug tracking-tight text-text group-hover:text-accent transition-colors mb-1">
                      {b.title}
                    </h3>
                    <p className="text-muted text-[0.82rem] leading-relaxed line-clamp-2">
                      {b.dek}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 text-[0.8rem] text-accent font-medium">
                      Read briefing
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 6h8M6.5 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Related daily briefing */}
          <Link
            href={`/updates/${date}`}
            className="group flex items-center justify-between gap-4 rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] px-4 py-3 transition-all hover:border-[rgba(125,211,252,0.2)] hover:bg-[rgba(125,211,252,0.02)]"
          >
            <div className="min-w-0">
              <p className="text-[0.72rem] text-muted mb-0.5">Related daily briefing</p>
              <p className="text-[0.88rem] font-semibold text-text group-hover:text-accent transition-colors">
                {formatDate(date)} — daily benchmark
              </p>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="shrink-0 text-muted group-hover:text-accent transition-colors"
            >
              <path
                d="M5 2l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
