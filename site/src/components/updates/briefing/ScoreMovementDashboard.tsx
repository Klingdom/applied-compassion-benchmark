/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "@/components/ui/Container";
import ScoreMovementCard from "./ScoreMovementCard";

interface Props {
  updates: any;
}

/**
 * ScoreMovementDashboard - scannable grid of all assessed entities.
 *
 * Sources (merged, deduplicated by slug):
 *   1. recentAssessments (fullest shape: includes status, published, assessed)
 *   2. appliedChanges (score changes committed this cycle)
 *   3. pendingReview (proposed changes not yet committed)
 */
export default function ScoreMovementDashboard({ updates }: Props) {
  const recentAssessments: any[] = Array.isArray(updates.recentAssessments)
    ? updates.recentAssessments
    : [];
  const appliedChanges: any[] = Array.isArray(updates.appliedChanges)
    ? updates.appliedChanges
    : [];
  const pendingReview: any[] = Array.isArray(updates.pendingReview)
    ? updates.pendingReview
    : [];
  const scoreChanges: any[] = Array.isArray(updates.scoreChanges)
    ? updates.scoreChanges
    : [];

  // Merge: start from recentAssessments as canonical, enrich with scoreChanges data
  const seen = new Set<string>();
  const all: any[] = [];

  // Build a lookup from score changes by slug for enrichment
  const changeBySlug: Record<string, any> = {};
  for (const c of [...appliedChanges, ...pendingReview, ...scoreChanges]) {
    if (c.slug) changeBySlug[c.slug] = c;
  }

  for (const a of recentAssessments) {
    if (!a.slug || seen.has(a.slug)) continue;
    seen.add(a.slug);
    const change = changeBySlug[a.slug];
    all.push({
      ...a,
      ...(change ?? {}),
      // Prefer recentAssessments fields for display
      entity: a.entity,
      slug: a.slug,
      index: a.index ?? a.publishedIndex,
      published: a.published ?? a.publishedScore,
      assessed: a.assessed ?? a.assessedScore,
      delta: a.delta,
      status: a.status,
      // P0/P1 enrichment: prefer recentAssessments value, fall back to scoreChange value
      whyHeadline: a.whyHeadline ?? change?.whyHeadline,
      dominantDimension: a.dominantDimension ?? change?.dominantDimension,
      primaryEvidenceUrl: a.primaryEvidenceUrl ?? change?.primaryEvidenceUrl,
      distanceToBoundary: a.distanceToBoundary ?? change?.distanceToBoundary,
      nextForwardSignal: a.nextForwardSignal ?? change?.nextForwardSignal,
    });
  }

  // Add any score changes not already in recentAssessments
  for (const c of [...appliedChanges, ...pendingReview, ...scoreChanges]) {
    if (!c.slug || seen.has(c.slug)) continue;
    seen.add(c.slug);
    all.push(c);
  }

  if (all.length === 0) return null;

  // Sort: score changes first, then boundary cases, then confirmations
  const sorted = [...all].sort((a, b) => {
    const aHasChange = Math.abs(a.delta ?? 0) > 0;
    const bHasChange = Math.abs(b.delta ?? 0) > 0;
    if (aHasChange !== bHasChange) return bHasChange ? 1 : -1;
    return Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0);
  });

  const hasChanges = sorted.some((a) => Math.abs(a.delta ?? 0) > 0);

  return (
    <section
      id="score-movements"
      className="py-[30px] scroll-mt-24"
      aria-label="Score movement dashboard"
    >
      <Container>
        <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h2 className="text-[1.25rem] font-bold mb-1">Score movements</h2>
            <p className="text-muted text-[0.88rem]">
              {hasChanges
                ? "Entities with score changes this cycle, followed by confirmed positions."
                : "All entities assessed this cycle. No score changes."}
            </p>
          </div>
          <span className="text-muted text-[0.85rem] shrink-0">
            {sorted.length} assessed
          </span>
        </div>

        <div className="space-y-2">
          {sorted.map((assessment: any, i: number) => (
            <ScoreMovementCard
              key={`${assessment.slug ?? i}-${i}`}
              assessment={assessment}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
