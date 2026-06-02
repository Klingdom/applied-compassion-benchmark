"use client";
/**
 * ReadingProgress — Wave B, Item #9
 *
 * Thin horizontal progress bar fixed to the top of the viewport.
 * Fills as the user scrolls. Purely decorative; progressively enhances
 * without JS (renders nothing server-side until hydration).
 */

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(pct);
    }

    window.addEventListener("scroll", update, { passive: true });
    update(); // Set initial value
    return () => window.removeEventListener("scroll", update);
  }, []);

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
        className="h-full bg-gradient-to-r from-[#7dd3fc] to-[#60a5fa] transition-[width] duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
