"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Tracker filter bar. The server renders EVERY row (table and mobile cards, same
 * data); this component only hides rows via the `hidden` attribute using the
 * data-provider / data-access / data-licence / data-status / data-tested
 * attributes on each row. Without JavaScript the bar never renders and the full
 * list is shown. Filter state lives in the query string and is read client-side
 * only (static export); the static HTML is always unfiltered.
 */

type Props = {
  providers: string[];
  access: string[];
  licences: string[];
  statuses: string[];
  /** The "Pilot" option exists only while the pilot gate renders a report. */
  showPilotOption: boolean;
  /** Id of the element wrapping every row to filter. */
  scopeId: string;
  /** Number of rows in the server-rendered table, used for the static "Showing N of N" line. */
  totalCount: number;
};

type Key = "provider" | "access" | "licence" | "status" | "tested";
const KEYS: Key[] = ["provider", "access", "licence", "status", "tested"];
const EMPTY: Record<Key, string> = { provider: "", access: "", licence: "", status: "", tested: "" };

const ACCESS_LABEL: Record<string, string> = {
  "open-weights": "Open weights",
  api: "API",
  "consumer-app": "Consumer app",
  restricted: "Restricted",
};

const TESTED_LABEL: Record<string, string> = { pilot: "Pilot", queued: "Queued", "not-yet": "Not yet" };

const selectCls =
  "bg-[rgba(255,255,255,0.05)] border border-line-strong rounded-[10px] px-3 h-[42px] w-full text-[0.92rem] text-text focus:outline-none focus:border-[rgba(125,211,252,0.4)]";

function parseQuery(search: string): Record<Key, string> {
  const q = new URLSearchParams(search);
  const next = { ...EMPTY };
  for (const k of KEYS) next[k] = q.get(k) ?? "";
  return next;
}

function matches(el: HTMLElement, v: Record<Key, string>): boolean {
  return KEYS.every((k) => !v[k] || (el.dataset[k] ?? "").split("|").includes(v[k]));
}

const noopSubscribe = () => () => {};

export default function TrackerFilters({ providers, access, licences, statuses, showPilotOption, scopeId, totalCount }: Props) {
  // False on the server and during hydration, true afterwards: the bar never exists without JavaScript.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  // The query string is read client-side only. Until the user changes a control, the selection is whatever the URL says.
  const search = useSyncExternalStore(noopSubscribe, () => window.location.search, () => "");
  const [override, setOverride] = useState<Record<Key, string> | null>(null);
  const values = override ?? parseQuery(search);
  // One Reset button per layout; only one layout is visible (CSS), so focus goes to whichever is actually rendered.
  const resetRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const emptyRef = useRef<HTMLDivElement>(null);
  const changed = useRef(false);

  // Counts are a pure function of the row data attributes and the current selection.
  let shown = totalCount;
  let total = totalCount;
  if (mounted) {
    shown = 0;
    total = 0;
    document.getElementById(scopeId)?.querySelectorAll<HTMLElement>("tbody [data-row]").forEach((el) => {
      total += 1;
      if (matches(el, values)) shown += 1;
    });
  }

  // Hide or show every row (table rows and mobile cards) and mirror the selection into the query string.
  useEffect(() => {
    if (!mounted) return;
    document.getElementById(scopeId)?.querySelectorAll<HTMLElement>("[data-row]").forEach((el) => {
      el.hidden = !matches(el, values);
    });
    const q = new URLSearchParams();
    for (const k of KEYS) if (values[k]) q.set(k, values[k]);
    const qs = q.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
  }, [mounted, values, scopeId]);

  // After a change that produced zero results, move focus to Reset so it is never lost.
  useEffect(() => {
    if (!(changed.current && mounted && shown === 0)) return;
    const visible = Object.values(resetRefs.current).find((b) => b && b.offsetParent !== null);
    // Fallback (Reset hidden or its details element closed): the empty-state message itself takes focus.
    if (visible) visible.focus();
    else emptyRef.current?.focus();
  }, [shown, mounted]);

  const anyActive = KEYS.some((k) => values[k]);
  const activeCount = KEYS.filter((k) => values[k]).length;

  const set = (k: Key, val: string) => {
    changed.current = true;
    setOverride({ ...values, [k]: val });
  };

  const field = (k: Key, label: string, options: { value: string; label: string }[], idSuffix: string) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={`tracker-filter-${k}-${idSuffix}`} className="text-[0.8rem] text-muted-subtle">
        {label}
      </label>
      <select
        id={`tracker-filter-${k}-${idSuffix}`}
        className={selectCls}
        value={values[k]}
        onChange={(e) => set(k, e.target.value)}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  const testedOptions = [...(showPilotOption ? ["pilot"] : []), "queued", "not-yet"].map((v) => ({
    value: v,
    label: TESTED_LABEL[v],
  }));

  const bar = (idSuffix: string) => (
    <form
      role="search"
      aria-label="Filter models"
      onSubmit={(e) => e.preventDefault()}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 items-end gap-3"
    >
      {field("provider", "Provider", providers.map((p) => ({ value: p, label: p })), idSuffix)}
      {field("access", "Access", access.map((a) => ({ value: a, label: ACCESS_LABEL[a] ?? a })), idSuffix)}
      {field("licence", "Licence", licences.map((l) => ({ value: l, label: l })), idSuffix)}
      {field("status", "Status", statuses.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })), idSuffix)}
      {field("tested", "Tested by us", testedOptions, idSuffix)}
      {(
        <button
          ref={(el) => {
            resetRefs.current[idSuffix] = el;
          }}
          hidden={!anyActive}
          type="button"
          onClick={() => {
            changed.current = true;
            setOverride({ ...EMPTY });
          }}
          className="border border-line-strong rounded-[10px] px-4 h-[42px] text-[0.92rem] font-semibold text-text bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)]"
        >
          Reset filters
        </button>
      )}
    </form>
  );

  return (
    <div className="mb-4" hidden={!mounted}>
      {/* Hidden until JavaScript runs: the markup is in the static HTML, but without JavaScript nobody meets a dead form. */}
      {/* Below 720px the bar collapses into a details element, open by default only when a filter is active.
          Only one rendering is visible at a time (CSS), so assistive tech meets one set of controls. */}
      <div className="min-[720px]:hidden">
        <details open={anyActive || undefined} className="border border-line-strong rounded-[14px] px-4 py-3">
          <summary className="cursor-pointer text-text font-medium">Filters ({activeCount} active)</summary>
          <div className="mt-3">{bar("narrow")}</div>
        </details>
      </div>
      <div className="hidden min-[720px]:block">{bar("wide")}</div>

      <p aria-live="polite" className="text-muted text-[0.93rem] mt-3">
        {`Showing ${shown} of ${total} models`}
      </p>
      <div
        ref={emptyRef}
        tabIndex={-1}
        hidden={shown !== 0}
        className="mt-3 border border-[rgba(125,211,252,0.18)] rounded-[16px] p-4 bg-[rgba(125,211,252,0.06)] text-muted text-[0.93rem]"
      >
        No models match these filters. Not listed does not mean not tested or not released. Reset filters to see the
        full list.
      </div>
    </div>
  );
}
