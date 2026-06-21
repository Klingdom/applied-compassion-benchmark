"use client";
/**
 * BackToTop — appears only after the user scrolls past one viewport height.
 * Uses opacity + pointer-events transition so it is accessible even when hidden.
 * Static-export-safe: no server APIs used.
 */

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="#main-content"
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={[
        "fixed bottom-6 right-6 z-40",
        "flex items-center justify-center w-9 h-9",
        "rounded-full border border-line",
        "bg-[rgba(11,18,32,0.85)] backdrop-blur-sm",
        "text-muted hover:text-text hover:border-[rgba(125,211,252,0.4)]",
        "shadow-lg",
        "transition-[opacity,pointer-events] duration-200 motion-reduce:transition-none",
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M7 11V3M3.5 6.5L7 3l3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
