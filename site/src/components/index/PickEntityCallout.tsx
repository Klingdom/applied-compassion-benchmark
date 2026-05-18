"use client";

import { useEffect, useState } from "react";
import Callout from "@/components/ui/Callout";

/**
 * Callout revealed only when the page URL contains the hash
 * `#pick-entity-to-watch`. Shown above the index grid to guide visitors
 * who arrive from the Score-Watch marketing page.
 *
 * Uses a useEffect hash-check so it works in the static export where
 * window is unavailable during server render.
 */
export default function PickEntityCallout() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => {
      setVisible(window.location.hash === "#pick-entity-to-watch");
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  if (!visible) return null;

  return (
    <div className="mb-6" aria-live="polite">
      <Callout>
        <h2 className="text-[1.15rem] font-bold mb-1.5">Pick an index, then pick an entity</h2>
        <p className="text-muted">
          Browse any index below, find the entity you want to track, and subscribe to Score-Watch
          from its detail page.
        </p>
      </Callout>
    </div>
  );
}
