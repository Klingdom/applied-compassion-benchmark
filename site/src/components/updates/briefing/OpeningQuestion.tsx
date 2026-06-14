/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Container from "@/components/ui/Container";
import TrackedEntityLink from "@/components/updates/TrackedEntityLink";
import { getEntityBySlug } from "@/data/entities";
import {
  kindToIndexSlug,
  kindToRoutePrefix,
  ALL_ENTITY_KINDS,
} from "@/lib/entityHref";

interface Props {
  updates: any;
}

// ──────────────────────────────────────────────────────────────────────────────
// Slug resolution — uses canonical KIND_TABLE from entityHref (no local maps)
// ──────────────────────────────────────────────────────────────────────────────

function resolveSlugHref(
  entitySlug: string,
): { href: string; index: string } | null {
  for (const kind of ALL_ENTITY_KINDS) {
    if (getEntityBySlug(kind, entitySlug)) {
      return {
        href: `/${kindToRoutePrefix(kind)}/${entitySlug}`,
        index: kindToIndexSlug(kind),
      };
    }
  }
  return null;
}

/**
 * OpeningQuestion — Section 2 of the daily briefing.
 *
 * Reads `updates.dailyOpeningQuestion` (object, all fields optional):
 *   - text: string           — the question to display (REQUIRED; if absent, renders null)
 *   - themes: string[]       — optional theme chips above the question
 *   - tensionFraming: string — optional muted prefix above the question text
 *   - tiedToEntities: string[] — optional entity slugs rendered as chip links
 *   - forwardResolutionDate: string — reserved for future use
 *   - eveningResolution: string    — NOT rendered yet; reserved for future feature
 *
 * If `dailyOpeningQuestion.text` is absent, returns null.
 * No fallback rotation — questions are evidence-grounded only.
 */
export default function OpeningQuestion({ updates }: Props) {
  const oq = updates.dailyOpeningQuestion;

  // No question object or no text field → render nothing
  if (!oq || !oq.text) return null;

  const text: string = oq.text;
  const tensionFraming: string | undefined = oq.tensionFraming;
  const themes: string[] = Array.isArray(oq.themes) ? oq.themes : [];
  const tiedToEntities: string[] = Array.isArray(oq.tiedToEntities)
    ? oq.tiedToEntities
    : [];

  return (
    <section
      id="opening-question"
      className="py-[30px] scroll-mt-24"
      aria-label="Today's opening question"
    >
      <Container>
        <div className="rounded-[20px] border-t-2 border border-[rgba(125,211,252,0.35)] bg-[rgba(125,211,252,0.04)] p-6 sm:p-8"
          style={{ borderTopColor: "#7dd3fc" }}>

          {/* Label row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#7dd3fc]">
              Today&apos;s question
            </div>
            {themes.length > 0 && (
              <>
                <span className="text-muted text-[0.78rem]">·</span>
                <div className="flex flex-wrap gap-1.5">
                  {themes.map((theme, i) => (
                    <span
                      key={i}
                      className="text-[0.68rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[rgba(125,211,252,0.28)] bg-[rgba(125,211,252,0.07)] text-[#7dd3fc]"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tension framing — muted prefix above the question */}
          {tensionFraming && (
            <p className="text-[0.88rem] text-muted italic mb-3 leading-relaxed">
              {tensionFraming}
            </p>
          )}

          {/* Question text — larger type than closing DailyQuestion */}
          <blockquote className="text-[1.3rem] sm:text-[1.5rem] font-medium leading-relaxed text-text max-w-3xl">
            &ldquo;{text}&rdquo;
          </blockquote>

          {/* Entity chips */}
          {tiedToEntities.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <span className="text-[0.7rem] font-bold uppercase tracking-wider text-muted mr-1">
                Related
              </span>
              {tiedToEntities.map((slug) => {
                const resolved = resolveSlugHref(slug);
                return resolved ? (
                  <TrackedEntityLink
                    key={slug}
                    href={resolved.href}
                    slug={slug}
                    index={resolved.index}
                    source="openingQuestion"
                    className="text-[0.78rem] font-semibold px-2.5 py-0.5 rounded-full border border-[rgba(125,211,252,0.32)] bg-[rgba(125,211,252,0.08)] text-[#7dd3fc] hover:border-[rgba(125,211,252,0.6)] transition-colors"
                  >
                    {slug}
                  </TrackedEntityLink>
                ) : (
                  <span
                    key={slug}
                    className="text-[0.78rem] font-semibold px-2.5 py-0.5 rounded-full border border-[rgba(125,211,252,0.32)] bg-[rgba(125,211,252,0.08)] text-[#7dd3fc]"
                  >
                    {slug}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
