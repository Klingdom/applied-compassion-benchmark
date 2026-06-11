"use client";
/**
 * SpecialBriefingJumpNav — Wave H1, Item #3
 *
 * Sticky in-page navigation for /updates/special/[slug] pages.
 * Reuses the same IntersectionObserver + active-chip pattern as BriefingJumpNav
 * but targets the special-report's section IDs (section-{i}-heading).
 *
 * Props:
 *   sections — array of { id, label } built server-side from bodySections
 *              (only real sections; zero dead links guaranteed by the caller)
 *   date     — ISO date for analytics
 */

import { useEffect, useRef, useState, useMemo } from "react";

export interface NavSection {
  id: string;
  label: string;
}

interface Props {
  sections: NavSection[];
  date?: string;
}

export default function SpecialBriefingJumpNav({ sections, date: _date }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const visibleSetRef = useRef<Set<string>>(new Set());

  const sectionKey = useMemo(
    () => sections.map((s) => s.id).join(","),
    [sections]
  );

  useEffect(() => {
    visibleSetRef.current = new Set();

    const targets = sections
      .map((s) => document.getElementById(s.id))
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
        const ordered = sections
          .map((s) => s.id)
          .filter((id) => visibleSetRef.current.has(id));
        setActiveId(ordered[0] ?? null);
      },
      { rootMargin: "-10% 0px -60% 0px", threshold: 0 }
    );

    for (const el of targets) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sectionKey, sections]);

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="Special briefing sections"
      className={[
        "sticky top-[60px] z-40",
        "border-b border-line bg-[rgba(11,18,32,0.92)] backdrop-blur-md",
        "py-2.5",
      ].join(" ")}
    >
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-8">
        <ul
          className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5 sm:flex-wrap"
          role="list"
        >
          {sections.map(({ id, label }) => {
            const isActive = activeId === id;
            return (
              <li key={id} className="shrink-0">
                <a
                  href={`#${id}`}
                  aria-current={isActive ? "location" : undefined}
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
          {/* Back to index as rightmost chip */}
          <li className="shrink-0 ml-auto pl-2">
            <a
              href="/updates/special"
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
