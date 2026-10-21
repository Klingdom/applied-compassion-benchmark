/**
 * model-watch-tested.mjs -- "tested by us", derived and never stored (docs/DATA_MODEL_AI_MODEL_WATCH.md section 7).
 *
 * A pure function of: a catalog row's benchmarkLocalTag, the pilot render gate (renderableEntries output), the wave files
 * and the committed queue snapshot. It returns a LABEL and a link, never a figure. The single render rule stays the D-29a
 * gate: only waves whose renderableEntries mode is "active" can yield "pilot"; a preview or proposed wave never does.
 *
 * Result: { status: "pilot", runId, href } | { status: "queued" } | { status: "not-yet" }
 */

export const TESTED_STATUSES = ["pilot", "queued", "not-yet"];

/**
 * @param {{benchmarkLocalTag: string|null}} row
 * @param {{queue: {entries: {tag:string,status:string}[]}|null, renderable: {entry:object, mode:string}[], waves: object[]|Record<string,object>}} input
 */
export function testedStatus(row, { queue, renderable, waves }) {
  const tag = row?.benchmarkLocalTag;
  if (!tag) return { status: "not-yet" };
  const waveList = Array.isArray(waves) ? waves : Object.values(waves ?? {});
  const byRun = new Map(waveList.map((w) => [w.run_id, w]));
  const active = (renderable ?? [])
    .filter((x) => x.mode === "active")
    .filter((x) => {
      const builds = byRun.get(x.entry.run_id)?.design?.subject_builds ?? {};
      return Object.values(builds).some((b) => b?.tag === tag);
    })
    .map((x) => x.entry)
    .sort((a, b) => (a.report_date < b.report_date ? 1 : a.report_date > b.report_date ? -1 : a.run_id < b.run_id ? 1 : -1));
  if (active.length) return { status: "pilot", runId: active[0].run_id, href: `/ai-models/reports/${active[0].run_id}` };
  if ((queue?.entries ?? []).some((e) => e.tag === tag && e.status === "queued")) return { status: "queued" };
  return { status: "not-yet" };
}
