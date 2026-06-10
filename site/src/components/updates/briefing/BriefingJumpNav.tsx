"use client";
/**
 * BriefingJumpNav — Wave B, Item #9
 *
 * Persistent in-page navigation listing major section anchors.
 * - Sticky below the site navbar on desktop
 * - Horizontally scrollable on mobile
 * - Active section highlighted via IntersectionObserver (progressive enhancement)
 * - Works without JS (plain anchor links)
 *
 * Bug fix (Wave B): accepts `presentSections` prop from the server component so
 * only sections that actually render on this briefing appear as chips. This
 * eliminates dead anchor links on content-sparse (flat) briefings.
 *
 * Wave C changes:
 * - Fix stale-closure / exhaustive-deps issue (UPDATES_REVIEW2_FRONTEND C7):
 *   visibleSet converted to a ref, presentSections included in dep array via
 *   stable string key. eslint-disable removed.
 * - Added date prop + briefing_section_nav trackEvent on chip click.
 */

import { useEffect, useRef, useState, useMemo } from "react";
import { trackEvent, EVENTS } from "@/lib/analytics";

export interface NavItem {
  id: string;
  label: string;
}

interface Props {
  /** Ordered list of sections that actually render for this briefing.
   *  Computed server-side in DailyBriefing.tsx using the same guards that
   *  gate each section. Only these IDs get a chip; dead links are impossible. */
  presentSections: NavItem[];
  /** ISO date string for the briefing — forwarded in analytics payload. */
  date?: string;
}

export default function BriefingJumpNav({ presentSections, date }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  // visibleSet as a ref so it survives re-renders without triggering effects
  const visibleSetRef = useRef<Set<string>>(new Set());

  // Stable dep: serialize section IDs so the effect only re-fires when sections
  // actually change (array reference changes every render otherwise).
  const sectionKey = useMemo(
    () => presentSections.map((n) => n.id).join(","),
    [presentSections],
  );

  useEffect(() => {
    // Clear stale visible set whenever sections change
    visibleSetRef.current = new Set();

    const targets = presentSections
      .map((n) => document.getElementById(n.id))
      .filter(Boolean) as HTMLElement[];

    if (targets.length === 0) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSetRef.current.add(entry.target.id);
          } else {
            visibleSetRef.current.delete(entry.target.id);
          }
        }
        // The active section is the topmost visible one in document order
        const ordered = presentSections
          .map((n) => n.id)
          .filter((id) => visibleSetRef.current.has(id));
        setActiveId(ordered[0] ?? null);
      },
      {
        // Trigger when a section enters the top 30% of the viewport
        rootMargin: "-10% 0px -60% 0px",
        threshold: 0,
      },
    );

    for (const el of targets) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  // sectionKey is the stable serialization of presentSections ids
  }, [sectionKey, presentSections]);

  return (
    <nav
      aria-label="In-page briefing navigation"
      className={[
        "sticky top-[60px] z-40",
        "border-b border-line bg-[rgba(11,18,32,0.92)] backdrop-blur-md",
        "py-2.5",
      ].join(" ")}
    >
      {/* Horizontally scrollable on mobile; single row on desktop */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <ul
          className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5 sm:flex-wrap"
          role="list"
        >
          {presentSections.map(({ id, label }) => {
            const isActive = activeId === id;
            return (
              <li key={id} className="shrink-0">
                <a
                  href={`#${id}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() =>
                    trackEvent(EVENTS.BRIEFING_SECTION_NAV, {
                      section: id,
                      date: date ?? null,
                    })
                  }
                  className={[
                    "inline-flex items-center px-3 py-1 rounded-[8px] text-[0.82rem] font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-[rgba(125,211,252,0.15)] text-[#7dd3fc] border border-[rgba(125,211,252,0.35)]"
                      : "text-muted hover:text-text hover:bg-[rgba(255,255,255,0.04)] border border-transparent",
                  ].join(" ")}
                >
                  {label}
                </a>
              </li>
            );
          })}
          {/* Archive link as rightmost chip */}
          <li className="shrink-0 ml-auto pl-2">
            <a
              href="/updates/archive"
              className="inline-flex items-center px-3 py-1 rounded-[8px] text-[0.82rem] font-medium text-muted hover:text-text hover:bg-[rgba(255,255,255,0.04)] border border-transparent transition-colors whitespace-nowrap"
            >
              All briefings
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
