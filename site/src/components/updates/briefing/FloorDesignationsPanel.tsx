/**
 * FloorDesignationsPanel — #20 code hygiene extraction.
 *
 * Previously an inline function in DailyBriefing.tsx, extracted here so it
 * can be memoized (no props, purely derived from static entity data).
 *
 * Scans all entity kinds for floor-designated entities and renders a
 * methodology-disclosure card with plain-language framing (#15).
 */

import Link from "next/link";
import Container from "@/components/ui/Container";
import { getAllEntities } from "@/data/entities";
import { ALL_ENTITY_KINDS, entityHref, kindToIndexSlug } from "@/lib/entityHref";
import { DIMENSIONS } from "@/data/dimensions";
import { formatIndex } from "./utils";

export default function FloorDesignationsPanel() {
  const designated = ALL_ENTITY_KINDS.flatMap((k) => getAllEntities(k))
    .filter((e) => e.floorDesignation && e.floorDesignation.designated)
    .sort((a, b) => {
      const kindOrder = a.kind.localeCompare(b.kind);
      if (kindOrder !== 0) return kindOrder;
      return a.name.localeCompare(b.name);
    });

  if (designated.length === 0) return null;

  return (
    <section id="floor-designations" className="py-[16px] scroll-mt-24">
      <Container>
        <div className="rounded-[16px] border border-[rgba(244,63,94,0.32)] bg-gradient-to-br from-[rgba(244,63,94,0.07)] via-[rgba(244,63,94,0.03)] to-transparent p-5 sm:p-6 shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#f43f5e]"
              aria-hidden
            />
            <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#f43f5e] font-bold">
              Floor designations
            </p>
            <span className="text-muted text-[0.78rem]">·</span>
            <span className="text-muted text-[0.82rem]">
              {designated.length}{" "}
              {designated.length === 1 ? "entity" : "entities"} at composite 0
              with documented evidence pattern
            </span>
          </div>
          <h2 className="text-[1.2rem] sm:text-[1.32rem] font-bold leading-snug mb-2">
            Composite scores resolving at zero — methodology disclosure
          </h2>

          {/* #15 — Plain-language definition before methodology jargon */}
          <p className="text-text text-[0.95rem] sm:text-[0.98rem] mb-2 max-w-3xl font-medium leading-relaxed">
            These entities consistently score the worst result across all 8 dimensions of compassionate conduct — the benchmark&apos;s most serious classification.
          </p>
          <p className="text-muted text-[0.88rem] sm:text-[0.92rem] mb-4 max-w-3xl leading-relaxed">
            <span className="font-semibold text-text">What &ldquo;floor&rdquo; means:</span>{" "}
            every one of the 8 dimensions (Recognition, Response, Reduction, and 5 others) resolves at the lowest
            behavioral anchor (1.0/5.0) across multiple assessment cycles, yielding a composite score of 0.{" "}
            <Link
              href="/methodology#floor-designation"
              className="text-[#7dd3fc] hover:underline"
            >
              Full methodology
            </Link>
            .
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {designated.map((e) => {
              const fd = e.floorDesignation!;
              const indexSlug = kindToIndexSlug(e.kind);
              const indexLabel = formatIndex(indexSlug);
              const href = entityHref(indexSlug, e.slug);
              if (!href) return null;
              return (
                <Link
                  key={`${e.kind}-${e.slug}`}
                  href={href}
                  className="block rounded-[12px] border border-[rgba(244,63,94,0.22)] bg-[rgba(15,18,24,0.55)] p-3.5 hover:border-[rgba(244,63,94,0.45)] hover:bg-[rgba(244,63,94,0.04)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-[0.7rem] uppercase tracking-[0.1em] text-muted mb-0.5">
                        {indexLabel}
                      </p>
                      <p className="text-text font-semibold text-[0.98rem] truncate">
                        {e.name}
                      </p>
                    </div>
                    <span className="shrink-0 text-[0.72rem] font-bold text-[#f43f5e] uppercase tracking-wider px-1.5 py-0.5 rounded border border-[rgba(244,63,94,0.32)] bg-[rgba(244,63,94,0.08)]">
                      Floor
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {fd.primaryDrivers.slice(0, 6).map((code) => {
                      const dim = DIMENSIONS.find((d) => d.code === code);
                      const color = dim?.color ?? "#94a3b8";
                      // #15 — show visible dimension name, not hover-only title= code
                      const label = dim?.name ?? code;
                      return (
                        <span
                          key={code}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[0.7rem] font-semibold"
                          style={{
                            color,
                            backgroundColor: `${color}14`,
                            border: `1px solid ${color}40`,
                          }}
                        >{label}</span>
                      );
                    })}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
