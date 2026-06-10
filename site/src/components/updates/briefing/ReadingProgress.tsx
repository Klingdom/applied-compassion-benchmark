"use client";
/**
 * ReadingProgress — Wave B, Item #9
 *
 * Thin horizontal progress bar fixed to the top of the viewport.
 * Fills as the user scrolls. Purely decorative; progressively enhances
 * without JS (renders nothing server-side until hydration).
 *
 * Wave C changes:
 * - Fires briefing_read_depth at 25/50/75/90% milestones (once per page load)
 * - Guards width transition with motion-safe (prefers-reduced-motion)
 */

import { useEffect, useRef, useState } from "react";
import { trackEvent, EVENTS } from "@/lib/analytics";

interface Props {
  /** ISO date string for the briefing (e.g. "2026-06-08"). Forwarded in analytics payload. */
  date?: string;
}

const MILESTONES = [25, 50, 75, 90] as const;

export default function ReadingProgress({ date }: Props) {
  const [progress, setProgress] = useState(0);
  // Guard: each milestone fires at most once per page load
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    function update() {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(pct);

      // Fire milestone events (each at most once per page load)
      for (const milestone of MILESTONES) {
        if (!firedRef.current.has(milestone) && pct >= milestone) {
          firedRef.current.add(milestone);
          trackEvent(EVENTS.BRIEFING_READ_DEPTH, { pct: milestone, date: date ?? null });
        }
      }
    }

    window.addEventListener("scroll", update, { passive: true });
    update(); // Set initial value
    return () => window.removeEventListener("scroll", update);
  }, [date]);

  if (progress === 0) return null;

  return (
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
  );
}
