"use client";
/**
 * MethodologyTOC — #5 sticky "On this page" nav + reading progress bar
 *
 * Desktop: sticky right-rail TOC (hidden on mobile).
 * Mobile: collapsible <details> list at top of page content.
 * IntersectionObserver tracks active section.
 * Thin top progress bar fills as the user scrolls.
 *
 * Benefit-phrased labels (not just section titles).
 * Progressively enhances: plain anchor links work without JS.
 */

import { useEffect, useRef, useState, useMemo } from "react";

export interface TocItem {
  id: string;
  label: string;
}

interface Props {
  items: TocItem[];
}

export default function MethodologyTOC({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const visibleSetRef = useRef<Set<string>>(new Set());

  // Stable dep: only re-run observer when section ids change
  const sectionKey = useMemo(() => items.map((n) => n.id).join(","), [items]);

  // Scroll progress
  useEffect(() => {
    function updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(pct);
    }
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  // IntersectionObserver for active section
  useEffect(() => {
    visibleSetRef.current = new Set();

    const targets = items
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
        const ordered = items
          .map((n) => n.id)
          .filter((id) => visibleSetRef.current.has(id));
        setActiveId(ordered[0] ?? null);
      },
      { rootMargin: "-10% 0px -55% 0px", threshold: 0 },
    );

    for (const el of targets) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  // sectionKey is stable dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey, items]);

  return (
    <>
      {/* Top progress bar */}
      {progress > 0 && (
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reading progress"
          className="fixed top-0 left-0 right-0 z-50 h-[2px] pointer-events-none"
        >
          <div
            className="h-full bg-gradient-to-r from-[#7dd3fc] to-[#60a5fa] motion-safe:transition-[width] motion-safe:duration-75 motion-safe:ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Mobile: collapsible "On this page" list */}
      <nav
        aria-label="On this page"
        className="xl:hidden mb-6 border border-line rounded-[14px] bg-[rgba(255,255,255,0.02)] overflow-hidden"
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-between w-full px-4 py-3 text-[0.86rem] font-semibold text-muted hover:text-text transition-colors"
          aria-expanded={open}
        >
          <span>On this page</span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden="true"
            className={`transition-transform motion-reduce:transition-none ${open ? "rotate-90" : ""}`}
          >
            <path
              d="M4.5 2.5l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {open && (
          <ul className="border-t border-line px-4 py-3 space-y-1" role="list">
            {items.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  aria-current={activeId === id ? "location" : undefined}
                  className={[
                    "block py-1 text-[0.84rem] transition-colors",
                    activeId === id ? "text-[#7dd3fc]" : "text-muted hover:text-text",
                  ].join(" ")}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Desktop: sticky right-rail — rendered via portal-like absolute positioning.
          The page layout places a <div> with id="toc-rail" at the right side.
          We render into that slot from here using a fixed right-rail approach. */}
      <nav
        aria-label="On this page"
        className={[
          "hidden xl:block",
          "fixed top-24 right-[max(1.5rem,calc((100vw-1200px)/2-180px))]",
          "w-[160px] z-30",
        ].join(" ")}
      >
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-muted mb-2">
          On this page
        </p>
        <ul className="space-y-1" role="list">
          {items.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={activeId === id ? "location" : undefined}
                className={[
                  "block py-0.5 text-[0.78rem] leading-snug transition-colors border-l-2 pl-2",
                  activeId === id
                    ? "text-[#7dd3fc] border-[#7dd3fc]"
                    : "text-muted hover:text-text border-transparent hover:border-[rgba(125,211,252,0.3)]",
                ].join(" ")}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
