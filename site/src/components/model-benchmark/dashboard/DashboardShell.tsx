"use client";

/**
 * DashboardShell -- the ONLY client JavaScript of the AI Model Compassion Dashboard.
 *
 * What it does: the control bar (models, dimensions, panels, chart/table, exploratory, reset, link, downloads, cite),
 * URL-hash view state (keys m, d, p, v, x; the wave is the route), a polite live region, and the toggling of the
 * `hidden` attribute on server-rendered elements (see parts.tsx for the data-subjects / data-dim contract).
 *
 * What it does not do: it holds no wave data other than the tidy rows of the PUBLIC PROJECTION that it needs for the
 * "current view" downloads (a withheld point is not in them: the server never builds one), recomputes nothing, composes
 * no sentence about a model, and never fetches. Without JavaScript the control bar stays hidden, the page shows the full
 * wave, and the static downloads are plain links.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import { Glyph, type ShapeKind } from "@/components/model-benchmark/pilot/glyph";
import { trackEvent } from "@/lib/analytics";
import { dashboardCopy as C } from "@/lib/model-dashboard-copy";
import {
  parseHash, serializeHash, defaultState, isDefaultState, enforcePanelRules, filterRows, rowsToCsv, exportJson,
} from "../../../../scripts/lib/model-dashboard-core.mjs";

export interface ShellBuild { id: string; shape: ShapeKind }
export interface ShellProps {
  runId: string;
  builds: ShellBuild[];
  dims: { code: string; name: string }[];
  panels: { code: string; title: string }[];
  rows: Record<string, unknown>[];
  meta: Record<string, unknown>;
  armsNote: boolean;
  children: ReactNode;
}

interface ViewState { models: string[]; dims: string[]; panels: string[]; view: "chart" | "table" | null; x: boolean }
interface Notice { code: string; items: string[] }

function MiniShape({ shape }: { shape: ShapeKind }) {
  return (
    <svg className="dash-glyph" width={16} height={16} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <Glyph kind={shape} cx={8} cy={8} r={4.5} />
    </svg>
  );
}

function noticeText(n: Notice): string {
  switch (n.code) {
    case "unreadable": return C.hash.unreadable;
    case "sort": return C.hash.sortRefused;
    case "models": return C.hash.invalid(`models (${n.items.join(", ")})`);
    case "dims": return C.hash.invalid(`dimensions (${n.items.join(", ")})`);
    case "panels": return C.hash.invalid(`panels (${n.items.join(", ")})`);
    default: return C.hash.invalid(n.code);
  }
}

const FIGURE_PANELS = ["comp", "dims", "diff", "len", "judg", "cont"];

export default function DashboardShell({ runId, builds, dims, panels, rows, meta, armsNote, children }: ShellProps) {
  const ctx = useMemo(() => ({ builds: builds.map((b) => b.id), dims: dims.map((d) => d.code), panels: panels.map((p) => p.code) }), [builds, dims, panels]);
  const [state, setState] = useState<ViewState>(() => defaultState(ctx) as ViewState);
  const [ready, setReady] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [live, setLive] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const summaryText = useCallback(
    (s: ViewState) => C.live.summary(String(s.models.length), String(ctx.builds.length), String(s.dims.length), String(ctx.dims.length), runId),
    [ctx, runId],
  );

  /** One polite announcement per action; runs of checkbox changes are debounced (300 ms). Focus is never moved. */
  const announce = useCallback((text: string, debounce = false) => {
    if (timer.current) clearTimeout(timer.current);
    if (debounce) timer.current = setTimeout(() => setLive(text), 300);
    else setLive(text);
  }, []);

  const writeHash = useCallback((s: ViewState) => {
    const h = serializeHash(s, ctx) as string;
    try { history.replaceState(null, "", `${location.pathname}${location.search}${h}`); } catch { /* sandboxed frame: the state still works, it is just not in the address bar */ }
  }, [ctx]);

  const commit = useCallback((next: ViewState, message?: string, debounce = false) => {
    const fixed = enforcePanelRules(next, ctx) as ViewState;
    setState(fixed);
    writeHash(fixed);
    announce(message ?? summaryText(fixed), debounce);
  }, [ctx, writeHash, announce, summaryText]);

  // ---- mount: read the hash once, then on hashchange (a bare "#panel-..." link is a jump link and changes nothing)
  /* The URL hash is external state that only exists in the browser: it is read after mount (never during render, so the server HTML matches the first client render). */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const read = (first: boolean) => {
      const p = parseHash(location.hash, ctx) as { kind: "jump" } | { kind: "state"; state: ViewState; notices: Notice[] };
      if (p.kind === "jump") return;
      setState(p.state);
      setNotices(p.notices);
      if (p.notices.length) writeHash(p.state);
      if (first) trackEvent("dash_view", { run_id: runId, has_hash: location.hash.includes("=") });
    };
    read(true);
    setReady(true);
    const onHash = () => read(false);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [ctx, runId, writeHash]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ---- apply the state to the server-rendered DOM (attributes only; nothing is recomputed)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const hide = (el: Element, on: boolean) => (on ? el.setAttribute("hidden", "") : el.removeAttribute("hidden"));
    const sel = new Set(state.models);
    const dimSel = new Set(state.dims);
    root.querySelectorAll<HTMLElement>("[data-subjects]").forEach((el) => {
      const ids = (el.dataset.subjects ?? "").split(" ").filter(Boolean);
      const dim = el.dataset.dim;
      hide(el, !ids.every((i) => sel.has(i)) || (dim !== undefined && !dimSel.has(dim)));
    });
    root.querySelectorAll<HTMLElement>("[data-dim]:not([data-subjects])").forEach((el) => hide(el, !dimSel.has(el.dataset.dim ?? "")));
    root.querySelectorAll<HTMLElement>("[data-panel]").forEach((el) => hide(el, !state.panels.includes(el.dataset.panel ?? "")));
    root.querySelectorAll<HTMLElement>("[data-panel-stub]").forEach((el) => hide(el, state.panels.includes(el.dataset.panelStub ?? "")));
    root.querySelectorAll<HTMLElement>('[data-nofn-k="models"]').forEach((el) => { el.textContent = String(sel.size); });
    root.querySelectorAll<HTMLElement>('[data-nofn-k="dims"]').forEach((el) => { el.textContent = String(dimSel.size); });
    // Group notes: a group keeps its full-wave header; the note says how many of its members are shown.
    root.querySelectorAll<HTMLElement>("[data-subset-for]").forEach((el) => {
      const gid = el.dataset.subsetFor ?? "";
      const total = Number(el.dataset.total ?? "0");
      const shown = Array.from(root.querySelectorAll(".dash-row")).filter((r) => (r as HTMLElement).dataset.group === gid && !r.hasAttribute("hidden")).length;
      hide(el, shown >= total);
      el.querySelectorAll("[data-k]").forEach((k) => { k.textContent = String(shown); });
    });
    const diffRows = Array.from(root.querySelectorAll("#dash-pairs .dash-row"));
    root.querySelectorAll("[data-diff-empty]").forEach((el) => hide(el, sel.size >= 2));
    root.querySelectorAll("[data-diff-noshare]").forEach((el) => hide(el, !(sel.size >= 2 && diffRows.length > 0 && diffRows.every((r) => r.hasAttribute("hidden")))));
    root.querySelectorAll<HTMLDetailsElement>("details.dash-table").forEach((el) => { el.open = state.view !== "chart"; });
    root.querySelectorAll<HTMLDetailsElement>("details[data-exploratory]").forEach((el) => { el.open = state.x; });
  }, [state, ready]);

  // ---- delegated clicks of server-rendered buttons: hide / show a panel, copy a hash or a citation
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onClick = async (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-dash-hide],[data-dash-show],[data-dash-copy]");
      if (!t) return;
      const s = stateRef.current;
      if (t.dataset.dashHide !== undefined || t.dataset.dashShow !== undefined) {
        const show = t.dataset.dashShow !== undefined;
        const code = (show ? t.dataset.dashShow : t.dataset.dashHide) ?? "";
        if (!show && code === "prov" && s.panels.some((p) => FIGURE_PANELS.includes(p))) { announce("Provenance stays visible while any figure panel is shown."); return; }
        const panelsNext = show ? [...new Set([...s.panels, code])] : s.panels.filter((p) => p !== code);
        const order = ctx.panels;
        commit({ ...s, panels: order.filter((p) => panelsNext.includes(p)) }, show ? C.live.panelShown : C.live.panelHidden);
        trackEvent("dash_panel_toggle", { panel: code, state: show ? "shown" : "hidden" });
        // Focus follows the panel: to the Show button of a hidden panel, to the panel heading of a shown one.
        requestAnimationFrame(() => {
          if (show) root.querySelector<HTMLElement>(`#panel-${code}-h`)?.focus?.();
          else root.querySelector<HTMLElement>(`[data-dash-show="${code}"]`)?.focus();
        });
        return;
      }
      const id = t.dataset.dashCopy ?? "";
      const src = document.getElementById(id);
      if (!src) return;
      let text = src.textContent ?? "";
      if (t.dataset.dashCopyView !== undefined) text = `${text} ${location.href}`;
      try {
        await navigator.clipboard.writeText(text);
        announce(id.startsWith("cite") ? C.live.citeCopied : "Copied.");
        if (id.startsWith("cite")) trackEvent("dash_citation_copy", { format: id === "cite-bibtex" ? "bibtex" : "text" });
      } catch {
        announce(C.live.copyFailed);
      }
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [ctx, commit, announce]);

  // headings must be focusable for the "show" focus move
  useEffect(() => {
    rootRef.current?.querySelectorAll<HTMLElement>("section[data-panel] > .dash-panel-head > h2").forEach((h) => h.setAttribute("tabindex", "-1"));
  }, []);

  // ---- control handlers
  const toggleModel = (id: string, on: boolean) => {
    const next = on ? [...new Set([...state.models, id])] : state.models.filter((m) => m !== id);
    commit({ ...state, models: ctx.builds.filter((b) => next.includes(b)) }, undefined, true);
    trackEvent("dash_config", { kind: "models", count: next.length });
  };
  const toggleDim = (code: string, on: boolean) => {
    const next = on ? [...new Set([...state.dims, code])] : state.dims.filter((c) => c !== code);
    if (next.length === 0) { announce("At least one dimension stays selected."); return; }
    commit({ ...state, dims: ctx.dims.filter((c) => next.includes(c)) }, undefined, true);
    trackEvent("dash_config", { kind: "dimensions", count: next.length });
  };
  const togglePanel = (code: string, on: boolean) => {
    if (!on && code === "prov" && state.panels.some((p) => FIGURE_PANELS.includes(p))) { announce("Provenance stays visible while any figure panel is shown."); return; }
    const next = on ? [...new Set([...state.panels, code])] : state.panels.filter((p) => p !== code);
    commit({ ...state, panels: ctx.panels.filter((p) => next.includes(p)) }, on ? C.live.panelShown : C.live.panelHidden, true);
    trackEvent("dash_panel_toggle", { panel: code, state: on ? "shown" : "hidden" });
  };
  const setView = (v: "chart" | "table") => {
    commit({ ...state, view: state.view === v ? null : v });
    trackEvent("dash_mode_toggle", { mode: v });
  };
  const setX = (on: boolean) => {
    commit({ ...state, x: on }, on ? "Exploratory comparisons shown." : "Exploratory comparisons hidden.");
    trackEvent("dash_pairwise_toggle", { state: on ? "on" : "off" });
  };
  const reset = () => {
    const d = defaultState(ctx) as ViewState;
    setNotices([]);
    commit(d, C.live.reset);
  };
  const copyLink = async () => {
    const url = `${location.origin}${location.pathname}${serializeHash(state, ctx)}`;
    try { await navigator.clipboard.writeText(url); announce(C.live.copied); } catch { announce(C.live.copyFailed); }
    trackEvent("dash_permalink_copy");
  };
  const download = (kind: "csv" | "json") => {
    const view = (serializeHash(state, ctx) as string) || "default";
    const m = { ...meta, view };
    const vr = filterRows(rows as never, state) as never[];
    const body = kind === "csv" ? (rowsToCsv(vr, m as never) as string) : JSON.stringify(exportJson(vr, m as never), null, 2);
    const blob = new Blob([body], { type: kind === "csv" ? "text/csv;charset=utf-8" : "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ai-model-dashboard_${runId}_view.${kind}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    announce(C.live.downloadStarted);
    trackEvent("dash_download", { format: kind, scope: "view" });
  };
  const openCite = () => {
    const el = document.getElementById("dash-cite") as HTMLDetailsElement | null;
    if (!el) return;
    el.open = true;
    el.scrollIntoView({ block: "nearest" });
    el.querySelector("summary")?.focus();
  };
  const onEsc = (e: KeyboardEvent<HTMLDetailsElement>) => {
    if (e.key === "Escape" && e.currentTarget.open) {
      e.currentTarget.open = false;
      e.currentTarget.querySelector("summary")?.focus();
    }
  };

  const customised = !(isDefaultState(state, ctx) as boolean);

  return (
    <div ref={rootRef} className="dash" data-view={state.view ?? ""} data-exploratory={state.x ? "1" : "0"} data-customised={customised ? "1" : "0"}>
      <noscript><p className="dash-nojs">{C.noscript.controls}</p></noscript>

      <section aria-labelledby="dash-controls-h" className="dash-controls" hidden={!ready}>
        <h2 id="dash-controls-h" className="dash-controls-h">{C.controls.heading}</h2>
        <div className="dash-ctl-row">
          <details className="dash-menu" onKeyDown={onEsc}>
            <summary>{C.controls.models} <span className="pf-qual">({state.models.length} of {ctx.builds.length})</span></summary>
            <fieldset className="dash-fieldset">
              <legend>{C.controls.models}</legend>
              {armsNote && <p className="pf-qual">Each build is shown in both arms.</p>}
              {builds.map((b) => (
                <label key={b.id} className="dash-check">
                  <input type="checkbox" checked={state.models.includes(b.id)} onChange={(e) => toggleModel(b.id, e.target.checked)} />
                  <MiniShape shape={b.shape} /> {b.id}
                </label>
              ))}
              <div className="dash-ctl-actions">
                <button type="button" className="dash-btn" onClick={() => commit({ ...state, models: [...ctx.builds].sort() })}>{C.controls.selectAll}</button>
                <button type="button" className="dash-btn" onClick={() => commit({ ...state, models: [] }, summaryText({ ...state, models: [] }))}>None</button>
              </div>
            </fieldset>
          </details>

          <details className="dash-menu" onKeyDown={onEsc}>
            <summary>{C.controls.dims} <span className="pf-qual">({state.dims.length} of {ctx.dims.length})</span></summary>
            <fieldset className="dash-fieldset">
              <legend>{C.controls.dims}</legend>
              <p className="pf-qual">{C.controls.noteAll}</p>
              {dims.map((d) => (
                <label key={d.code} className="dash-check">
                  <input type="checkbox" checked={state.dims.includes(d.code)} onChange={(e) => toggleDim(d.code, e.target.checked)} />
                  <strong>{d.code}</strong> {d.name}
                </label>
              ))}
            </fieldset>
          </details>

          <details className="dash-menu" onKeyDown={onEsc}>
            <summary>{C.controls.panels}</summary>
            <fieldset className="dash-fieldset">
              <legend>{C.controls.panels}</legend>
              {panels.map((p) => (
                <label key={p.code} className="dash-check">
                  <input type="checkbox" checked={state.panels.includes(p.code)} onChange={(e) => togglePanel(p.code, e.target.checked)} />
                  {p.title}
                </label>
              ))}
            </fieldset>
          </details>
        </div>

        <div className="dash-ctl-row">
          <div role="group" aria-label={C.controls.view} className="dash-seg">
            <button type="button" className="dash-btn" aria-pressed={state.view === "chart"} onClick={() => setView("chart")}>{C.controls.chart}</button>
            <button type="button" className="dash-btn" aria-pressed={state.view === "table"} onClick={() => setView("table")}>{C.controls.table}</button>
          </div>
          <label className="dash-check dash-x">
            <input type="checkbox" checked={state.x} onChange={(e) => setX(e.target.checked)} />
            <span>{C.controls.exploratory} <span className="pf-qual">{C.controls.exploratoryHelp}</span></span>
          </label>
        </div>

        <div className="dash-ctl-row">
          <button type="button" className="dash-btn" onClick={reset}>{C.controls.reset}</button>
          <button type="button" className="dash-btn" onClick={copyLink}>{C.controls.share}</button>
          <button type="button" className="dash-btn" onClick={() => download("csv")}>{C.controls.downloadCsv}</button>
          <button type="button" className="dash-btn" onClick={() => download("json")}>{C.controls.downloadJson}</button>
          <button type="button" className="dash-btn" onClick={openCite}>{C.controls.cite}</button>
          <a className="dash-btn dash-link" href="#how-to-read">{C.hero.linkHow}</a>
        </div>
        <p className="pf-qual">{C.controls.mobileTable}</p>
      </section>

      {notices.length > 0 && (
        <div role="status" className="dash-notices">
          {notices.map((n, i) => <p key={i}>{noticeText(n)}</p>)}
          <button type="button" className="dash-btn dash-btn-quiet" onClick={() => setNotices([])}>{C.hash.close}</button>
        </div>
      )}
      {customised && <p className="dash-custom" role="note"><strong>{C.controls.customised}</strong></p>}
      <p role="status" aria-live="polite" className="dash-live" id="dash-live">{live || (ready ? summaryText(state) : "")}</p>
      {state.models.length === 0 && ready && <p className="dash-empty">No model selected. Choose at least one model.</p>}

      {children}
    </div>
  );
}
