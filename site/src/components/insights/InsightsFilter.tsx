"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Audience filter for the Insights listing. Without JavaScript the component never
 * renders and every post shows with its audience tag. With JavaScript it hides cards
 * by `data-audience` (a space-separated list of the filters a card belongs to).
 */

const FILTERS = [
  { value: "", label: "All" },
  { value: "labs", label: "Labs" },
  { value: "agents", label: "Agent builders" },
];

const noopSubscribe = () => () => {};

function readAudience(): string {
  if (typeof window === "undefined") return "";
  const q = new URLSearchParams(window.location.search).get("audience") ?? "";
  return FILTERS.some((f) => f.value === q) ? q : "";
}

export default function InsightsFilter({ scopeId }: { scopeId: string }) {
  // False on the server and during hydration, true afterwards: the bar never exists without JavaScript.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [active, setActive] = useState<string>(readAudience);

  useEffect(() => {
    if (!mounted) return;
    const scope = document.getElementById(scopeId);
    scope?.querySelectorAll<HTMLElement>("[data-audience]").forEach((el) => {
      el.hidden = active !== "" && !(el.dataset.audience ?? "").split(" ").includes(active);
    });
    const qs = active ? `?audience=${active}` : "";
    window.history.replaceState(null, "", `${window.location.pathname}${qs}${window.location.hash}`);
  }, [mounted, active, scopeId]);

  if (!mounted) return null;

  return (
    <div role="group" aria-label="Filter posts by audience" className="flex flex-wrap gap-2 mb-5">
      {FILTERS.map((f) => (
        <button
          key={f.value || "all"}
          type="button"
          aria-pressed={active === f.value}
          onClick={() => setActive(f.value)}
          className={`px-4 py-2 rounded-full border text-[0.92rem] font-semibold transition-colors ${
            active === f.value
              ? "border-[rgba(125,211,252,0.4)] bg-[rgba(125,211,252,0.15)] text-accent"
              : "border-line text-muted hover:text-text"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
