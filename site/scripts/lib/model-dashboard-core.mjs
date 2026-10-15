/**
 * model-dashboard-core.mjs -- the pure logic of the AI Model Compassion Dashboard (/ai-models/dashboard).
 *
 * No file system, no React, no wave file: every function takes the PUBLIC PROJECTION of a wave
 * (projectWavePublic in model-benchmark-public.mjs) or plain values. That makes it safe to import from the
 * client island (hash state), from the server components (blocks, rows), from the prebuild script that writes the
 * static downloads, and from the tests. Plain .mjs so all four can import it.
 *
 *   dashboardBlocks(pub)      the groups of the composite panel in the dashboard's order: "Not separated" FIRST
 *                             (the report's groupBlocks sorts by size only), then separated builds, then the
 *                             secondary arm as one range-only block. Alphabetical inside a block, never by result.
 *   buildOf(pub, id)          "gemma2-9b-A" -> "gemma2-9b" (a build stands for all of its arms; the model filter is per build)
 *   dashboardRows(pub)        the tidy long-format rows behind every download and the "current view" export
 *   filterRows(rows, state)   the rows of a view (models, dimensions, exploratory)
 *   rowsToCsv / exportJson    the downloads (CSV header lines and a JSON `meta` carry the label)
 *   parseHash / serializeHash the URL-hash view state (keys m, d, p, v, x; the wave is the route)
 *   notMeasuredStates(pub)    the "Not measured yet" list with feature detection (a state becomes a value only when the data has the field)
 *
 * Rule source: docs/ai-dashboard/{PRD,UX_FLOWS,DATAVIZ}_AI_MODEL_DASHBOARD.md; DECISIONS.md D-29a (+ proposed D-29b);
 * docs/AI_MODEL_ASSESSMENT_TEMPLATE.md amendments 2, 8, 9, 16.
 */

const NL = String.fromCharCode(10);
const alpha = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

export const DASHBOARD_PATH = "/ai-models/dashboard";
export const SITE_URL = "https://compassionbenchmark.com";
export const LICENCE = "CC BY 4.0";
export const FIGURE_LABEL_WORDS = "unofficial pilot, not a score, comparability none";

// ---------------------------------------------------------------------------
// Numbers: one decimal, plain minus, "lo to hi" in ONE string so a published range end is never a bare number
// ---------------------------------------------------------------------------
export const fmt1 = (n) => (Object.is(n, -0) ? 0 : n).toFixed(1);
export const fmt2 = (n) => (Object.is(n, -0) ? 0 : n).toFixed(2);
export const range1 = (r) => `${fmt1(r[0])} to ${fmt1(r[1])}`;
export const range2 = (r) => `${fmt2(r[0])} to ${fmt2(r[1])}`;
/** "12.3 to 45.6" -> [12.3, 45.6] (the inverse of range1/range2, for the exports). */
export function parseRange(text) {
  const m = String(text ?? "").match(/^(-?\d+(?:\.\d+)?) to (-?\d+(?:\.\d+)?)$/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}
/** Does a "lo to hi" range text include zero? null when it does not parse. */
export function rangeIncludesZero(text) {
  const r = parseRange(text);
  return r ? r[0] <= 0 && r[1] >= 0 : null;
}

/**
 * FR-01 AC3: only an unofficial pilot wave can be on the dashboard. A manifest entry with `official: true` is ignored whatever its other
 * fields say (official wave rendering stays disabled, D-29a item 8). The dashboard route filters its renderable entries through this.
 */
export function isDashboardWave(entry) {
  return Boolean(entry) && entry.status === "pilot" && entry.official === false;
}

// ---------------------------------------------------------------------------
// Labels shared by the page and the static downloads
// ---------------------------------------------------------------------------

/**
 * The plain access-tier label (same words as accessTierLabel in src/lib/model-report-facts.ts; scripts/test-model-dashboard.mjs
 * proves the two agree for every committed wave). Throws for a tier with no approved label, like the TypeScript original.
 */
export function accessTierPlain(tier) {
  if (/^agent\b/i.test(tier) && /unverifiable/i.test(tier)) return "agent tier, snapshot unverified";
  if (/^local-open-weight\b/i.test(tier) && /pinned by digest/i.test(tier)) {
    const bits = tier.match(/(\d+)-bit quantised/i);
    return bits ? `local open-weight build, ${bits[1]}-bit quantised` : "local open-weight build";
  }
  throw new Error(`access tier "${tier}" has no approved plain label`);
}

/** The citation both downloads carry (no figure, no model name). The page's longer text adds the citable sentences of the wave. */
export function shortCitation(runId, reportDate) {
  return `Compassion Benchmark. AI Model Compassion Dashboard, unofficial pilot ${runId}, ${reportDate}. Not a score; comparability: none. ${SITE_URL}${DASHBOARD_PATH}/${runId}`;
}

// ---------------------------------------------------------------------------
// Builds, arms
// ---------------------------------------------------------------------------
export const hasArms = (pub) => pub.derived?.display_rule !== undefined && pub.design?.arms !== undefined;
export const primaryArm = (pub) => pub.derived?.primary_arm ?? "A";
export const armOf = (pub, id) => pub.design?.arms?.[id]?.arm ?? null;
export const isSecondaryArm = (pub, id) => hasArms(pub) && armOf(pub, id) !== primaryArm(pub);
/** "<build>-<arm>" -> "<build>"; a subject of a wave without arms is its own build. */
export function buildOf(pub, id) {
  const arm = armOf(pub, id);
  return arm && id.endsWith(`-${arm}`) ? id.slice(0, -(arm.length + 1)) : id;
}
/** The builds of the wave, alphabetical. */
export function buildIds(pub) {
  return [...new Set(pub.design.subjects.map((s) => buildOf(pub, s)))].sort(alpha);
}
/** The subjects of the wave in panel order: primary arm first (alphabetical), then the other arms; plain alphabetical without arms. */
export function panelSubjects(pub) {
  const all = [...pub.design.subjects].sort(alpha);
  if (!hasArms(pub)) return all;
  const prim = primaryArm(pub);
  const arms = [...new Set(all.map((s) => armOf(pub, s) ?? ""))].filter(Boolean);
  const order = [prim, ...arms.filter((a) => a !== prim).sort(alpha)];
  return order.flatMap((a) => all.filter((s) => armOf(pub, s) === a));
}

// ---------------------------------------------------------------------------
// Blocks: "Not separated" FIRST
// ---------------------------------------------------------------------------

/**
 * @typedef {{kind: "not-separated"|"separated"|"unlisted"|"range-only"|"list", ids: string[], gid: string}} Block
 * `gid` is a stable group id for the client ("g1", "g2", ... for not-separated groups; "s-<id>"; "r" for the range-only block).
 */

/** The set of pairs the wave marks separated (corrected, primary arm for an arms wave), as sorted "a|b" keys. */
function separatedPairKeys(pub) {
  return new Set((pub.derived.separated_pairs ?? []).map(([a, b]) => [a, b].sort(alpha).join("|")));
}

/**
 * The dashboard's blocks, in the dashboard's order (DATAVIZ G4): not-separated groups first (larger group first, then first label),
 * then separated builds (alphabetical), then any primary-arm subject the wave lists in neither, then the secondary arm(s) as ONE
 * range-only block. Nothing is ever sorted by a value. `transitive` is false when the wave's separation flags cannot be drawn as
 * groups (a group whose members are separated from each other, or groups that overlap): the caller then draws one plain
 * alphabetical list ("Listed alphabetically") and makes no grouping claim.
 */
export function dashboardBlocks(pub) {
  const arms = hasArms(pub);
  const prim = primaryArm(pub);
  const familyIds = (arms ? pub.design.subjects.filter((s) => armOf(pub, s) === prim) : [...pub.design.subjects]).sort(alpha);
  const groups = (pub.derived.not_separated_groups ?? []).map((g) => [...g].sort(alpha));
  const sepSet = new Set(pub.derived.separated_subjects ?? []);
  const pairs = separatedPairKeys(pub);
  const flat = groups.flat();
  const disjoint = new Set(flat).size === flat.length;
  const within = groups.every((g) => g.every((x, i) => g.every((y, j) => i >= j || !pairs.has([x, y].sort(alpha).join("|")))));
  const inFamily = flat.every((id) => familyIds.includes(id));
  const transitive = disjoint && within && inFamily;
  const secondary = arms ? panelSubjects(pub).filter((s) => armOf(pub, s) !== prim) : [];
  /** @type {Block[]} */
  let blocks;
  if (!transitive) {
    blocks = [{ kind: "list", ids: familyIds, gid: "l" }];
  } else {
    const inGroup = new Set(flat);
    const notSep = groups
      .map((g) => ({ kind: "not-separated", ids: g }))
      .sort((a, b) => b.ids.length - a.ids.length || alpha(a.ids[0], b.ids[0]))
      .map((b, i) => ({ ...b, gid: `g${i + 1}` }));
    const rest = familyIds.filter((id) => !inGroup.has(id));
    const separated = rest.filter((id) => sepSet.has(id)).map((id) => ({ kind: "separated", ids: [id], gid: `s-${id}` }));
    const unlisted = rest.filter((id) => !sepSet.has(id));
    blocks = [...notSep, ...separated, ...(unlisted.length ? [{ kind: "unlisted", ids: unlisted, gid: "u" }] : [])];
  }
  if (secondary.length) blocks.push({ kind: "range-only", ids: secondary, gid: "r" });
  return { blocks, transitive };
}

/** For a separated subject: the others it was separated from in the wave's own separated pairs, alphabetical. */
export function separatedFrom(pub, id) {
  const out = new Set();
  for (const [a, b] of pub.derived.separated_pairs ?? []) {
    if (a === id) out.add(b);
    if (b === id) out.add(a);
  }
  return [...out].sort(alpha);
}

// ---------------------------------------------------------------------------
// Tidy rows (downloads, "current view")
// ---------------------------------------------------------------------------

/** Where a subject sits, as one word for the export's `group` column. */
export function groupLabelFor(pub, id) {
  if (isSecondaryArm(pub, id)) return "range-only (secondary arm)";
  const gi = (pub.derived.not_separated_groups ?? []).findIndex((g) => g.includes(id));
  if (gi >= 0) return `not-separated`;
  if ((pub.derived.separated_subjects ?? []).includes(id)) return "separated";
  return "unlisted";
}

/**
 * Rows of the public projection. A point appears only where the projection kept it (pointState "value");
 * a withheld subject's point is `null` with state "withheld". Dimension means and every point difference are
 * never exported ("not_shown": the dashboard shows ranges only for them). Ranges are ONE string "lo to hi".
 */
export function dashboardRows(pub) {
  const rows = [];
  const subjects = panelSubjects(pub);
  const dims = Object.keys(Object.values(pub.subjects)[0]?.dimension_intervals95 ?? {});
  for (const id of subjects) {
    const s = pub.subjects[id];
    const base = { subject: id, build: buildOf(pub, id), arm: armOf(pub, id) ?? "", group: groupLabelFor(pub, id) };
    const hasPoint = typeof s.pilot_composite === "number" && !isSecondaryArm(pub, id);
    rows.push({
      ...base, metric: "composite", dimension: "", items: "", other: "", range: range1(s.pilot_composite_interval95),
      point: hasPoint ? fmt1(s.pilot_composite) : null, pointState: hasPoint ? "value" : "withheld", scope: "view", note: "",
    });
    for (const d of dims) {
      const iv = s.dimension_intervals95?.[d];
      if (!iv) continue;
      rows.push({
        ...base, metric: "dimension", dimension: d, items: String(s.dimension_item_counts?.[d] ?? ""), other: "", range: range2(iv),
        point: null, pointState: "not_shown", scope: "view", note: "dimension means are not shown on the dashboard",
      });
    }
  }
  // Pre-registered comparisons: an arms wave's primary-arm build pairs (corrected range beside the 95% range); a plain wave's pairwise list.
  const arms = hasArms(pub);
  const prim = primaryArm(pub);
  const pre = arms ? (pub.comparisons ?? []).filter((c) => c.kind === "build" && c.arm_a === prim && c.arm_b === prim) : (pub.pairwise ?? []);
  for (const c of pre) {
    const corrected = c.bonferroni?.interval;
    rows.push({
      subject: c.a, build: buildOf(pub, c.a), arm: armOf(pub, c.a) ?? "", group: "", metric: "difference_pre_registered", dimension: "", items: "", other: c.b,
      range: range1(c.interval95), correctedRange: corrected ? range1(corrected) : "",
      point: null, pointState: "not_shown", scope: "view", note: corrected ? (c.bonferroni.separated ? "range excludes 0 after correction" : "range includes 0 after correction") : (c.separated ? "range excludes 0" : "range includes 0"),
    });
  }
  // Exploratory: every pair of the all-pairs list that is not already pre-registered (arms waves), and B minus A of every build.
  if (arms) {
    const preKeys = new Set(pre.map((c) => [c.a, c.b].sort(alpha).join("|")));
    for (const q of pub.pairwise ?? []) {
      if (preKeys.has([q.a, q.b].sort(alpha).join("|"))) continue;
      rows.push({
        subject: q.a, build: buildOf(pub, q.a), arm: armOf(pub, q.a) ?? "", group: "", metric: "difference_exploratory", dimension: "", items: "", other: q.b,
        range: range1(q.interval95), correctedRange: "", point: null, pointState: "not_shown", scope: "exploratory",
        note: q.separated ? "range excludes 0 (uncorrected); exploratory, not a finding" : "range includes 0; exploratory",
      });
    }
    for (const c of (pub.comparisons ?? []).filter((x) => x.kind === "arm")) {
      if (!c.b_minus_a) continue;
      rows.push({
        subject: c.b, build: buildOf(pub, c.a), arm: armOf(pub, c.b) ?? "", group: "", metric: "arm_b_minus_a", dimension: "", items: "", other: c.a,
        range: range1(c.b_minus_a.interval95), correctedRange: "", point: null, pointState: "not_shown", scope: "exploratory",
        note: c.b_minus_a.separated ? "range excludes 0 (uncorrected); exploratory, not a finding" : "range includes 0; exploratory",
      });
    }
  }
  // Dimension comparisons that survived correction (names and ranges only).
  for (const q of pub.dimension_pairwise ?? []) {
    if (!q.bonferroni_separated) continue;
    rows.push({
      subject: q.a, build: buildOf(pub, q.a), arm: armOf(pub, q.a) ?? "", group: "", metric: "dimension_difference_corrected", dimension: q.dimension, items: "", other: q.b,
      range: range2(q.interval95), correctedRange: "", point: null, pointState: "not_shown", scope: "view", note: "survived correction across the dimension comparisons",
    });
  }
  for (const r of rows) r.otherBuild = r.other ? buildOf(pub, r.other) : "";
  return rows;
}

/** Rows that belong to a view. A pair row needs BOTH of its builds selected; a dimension row needs its dimension. Exploratory rows only when asked for. */
export function filterRows(rows, state) {
  const models = new Set(state.models);
  const dims = new Set(state.dims);
  return rows.filter((r) => {
    if (!models.has(r.build)) return false;
    if (r.otherBuild && !models.has(r.otherBuild)) return false;
    if (r.dimension && !dims.has(r.dimension)) return false;
    if (r.scope === "exploratory" && !state.x) return false;
    return true;
  });
}

const CSV_COLUMNS = ["status", "run_id", "report_date", "access_tier", "comparability", "metric", "subject", "build", "arm", "other_subject", "dimension", "items", "range_95", "corrected_range_95", "point_estimate", "point_state", "group", "scope", "note"];
const csvCell = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * meta shared by both downloads (FR-24 AC3).
 * @param {{runId: string, reportDate: string, accessTier: string, view?: string | null, waveSha256?: string | null, citation?: string | null}} p
 */
export function exportMeta({ runId, reportDate, accessTier, view = null, waveSha256 = null, citation = null }) {
  return {
    status: "unofficial pilot",
    label: `Unofficial pilot · ${runId} · ${reportDate} · ${accessTier} · not a score · comparability none`,
    run_id: runId,
    report_date: reportDate,
    access_tier: accessTier,
    comparability: "none",
    licence: LICENCE,
    source: `${SITE_URL}${DASHBOARD_PATH}`,
    wave_file: `${SITE_URL}/data/model-waves/${runId}.json`,
    ...(waveSha256 ? { wave_sha256: waveSha256 } : {}),
    ...(citation ? { citation } : {}),
    ...(view ? { view } : {}),
    note: "Public projection only. A point estimate appears only for a build the pilot separated from all others after correction; every other point is withheld. No point difference is exported. Ranges are 95% ranges. Not a score. Not a ranking.",
  };
}

export function rowsToCsv(rows, meta) {
  const lines = [
    `# ${meta.label}`,
    `# licence: ${meta.licence}; source: ${meta.source}; ${FIGURE_LABEL_WORDS}`,
    ...(meta.citation ? [`# cite: ${meta.citation}`] : []),
    ...(meta.view ? [`# view: ${meta.view}`] : []),
    CSV_COLUMNS.join(","),
  ];
  for (const r of rows) {
    lines.push([
      meta.status, meta.run_id, meta.report_date, meta.access_tier, meta.comparability, r.metric, r.subject, r.build, r.arm, r.other, r.dimension, r.items,
      r.range, r.correctedRange ?? "", r.point, r.pointState, r.group, r.scope, r.note,
    ].map(csvCell).join(","));
  }
  return lines.join(NL) + NL;
}

export function exportJson(rows, meta) {
  return {
    meta,
    rows: rows.map((r) => ({
      metric: r.metric, subject: r.subject, build: r.build, arm: r.arm || null, other_subject: r.other || null, dimension: r.dimension || null,
      items: r.items === "" ? null : Number(r.items), range_95: parseRange(r.range), corrected_range_95: r.correctedRange ? parseRange(r.correctedRange) : null,
      point_estimate: r.point === null ? null : Number(r.point), point_state: r.pointState, group: r.group || null, scope: r.scope, note: r.note || null,
    })),
  };
}

// ---------------------------------------------------------------------------
// URL-hash view state (UX section 5; the wave is the route, so there is no `w`)
// ---------------------------------------------------------------------------

export const PANEL_CODES = ["comp", "dims", "diff", "len", "judg", "cont", "inst", "prov", "nm", "rel", "gates"];
/** Panels that carry a per-model figure; the provenance panel cannot be hidden while any of them is visible (FR-06 AC3). */
export const FIGURE_PANELS = ["comp", "dims", "diff", "len", "judg", "cont"];
const SORT_KEYS = ["sort", "order", "rank", "wt", "weights", "by"];
export const MAX_HASH = 512;

/** @param {{builds: string[], dims: string[], panels?: string[]}} ctx */
export function defaultState(ctx) {
  return { models: [...ctx.builds].sort(alpha), dims: [...ctx.dims], panels: [...(ctx.panels ?? PANEL_CODES)], view: null, x: false };
}

export function isDefaultState(state, ctx) {
  const d = defaultState(ctx);
  return JSON.stringify(normalise(state, ctx)) === JSON.stringify(d);
}

function normalise(state, ctx) {
  const builds = new Set(ctx.builds);
  const dimSet = new Set(ctx.dims);
  const panelSet = new Set(ctx.panels ?? PANEL_CODES);
  return {
    models: [...new Set(state.models)].filter((m) => builds.has(m)).sort(alpha),
    dims: ctx.dims.filter((d) => state.dims.includes(d) && dimSet.has(d)),
    panels: (ctx.panels ?? PANEL_CODES).filter((p) => state.panels.includes(p) && panelSet.has(p)),
    view: state.view === "chart" || state.view === "table" ? state.view : null,
    x: state.x === true,
  };
}

/**
 * Parse location.hash.
 * @returns {{kind: "jump"} | {kind: "state", state, notices: {code: string, items: string[]}[]}}
 *   `jump` = a bare "#panel-comp" style link: it is not view state and leaves the current state unchanged.
 *   Malformed input never throws: it falls back to the default view with a notice (fail soft, once).
 */
export function parseHash(hash, ctx) {
  const dflt = defaultState(ctx);
  const raw = String(hash ?? "").replace(/^#/, "");
  if (raw === "") return { kind: "state", state: dflt, notices: [] };
  if (!raw.includes("=")) return { kind: "jump" };
  if (raw.length > MAX_HASH) return { kind: "state", state: dflt, notices: [{ code: "unreadable", items: [] }] };
  const kv = {};
  const dropped = [];
  const sortRefused = [];
  try {
    for (const part of raw.split("&")) {
      if (part === "") continue;
      const eq = part.indexOf("=");
      if (eq < 0) continue;
      const k = decodeURIComponent(part.slice(0, eq)).toLowerCase();
      const v = decodeURIComponent(part.slice(eq + 1));
      if (SORT_KEYS.includes(k)) { sortRefused.push(k); continue; }
      if (["m", "d", "p", "v", "x"].includes(k)) kv[k] = v;
    }
  } catch {
    return { kind: "state", state: dflt, notices: [{ code: "unreadable", items: [] }] };
  }
  const notices = [];
  if (sortRefused.length) notices.push({ code: "sort", items: sortRefused });
  const state = { ...dflt };

  if (kv.m !== undefined && kv.m.trim().toLowerCase() === "none") {
    state.models = []; // zero builds selected: an empty state, not an error (FR-04 AC4)
  } else if (kv.m !== undefined) {
    const byLower = new Map(ctx.builds.map((b) => [b.toLowerCase(), b]));
    const want = [...new Set(kv.m.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))];
    const ok = want.filter((m) => byLower.has(m)).map((m) => byLower.get(m));
    const bad = want.filter((m) => !byLower.has(m));
    if (bad.length) notices.push({ code: "models", items: bad });
    state.models = ok.length ? ok.sort(alpha) : dflt.models;
  }
  if (kv.d !== undefined) {
    const want = [...new Set(kv.d.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))];
    const ok = ctx.dims.filter((d) => want.includes(d));
    const bad = want.filter((d) => !ctx.dims.includes(d));
    if (bad.length) notices.push({ code: "dims", items: bad });
    state.dims = ok.length ? ok : dflt.dims;
  }
  if (kv.p !== undefined) {
    const all = ctx.panels ?? PANEL_CODES;
    const want = [...new Set(kv.p.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))];
    const ok = all.filter((p) => want.includes(p));
    const bad = want.filter((p) => !all.includes(p));
    if (bad.length) notices.push({ code: "panels", items: bad });
    state.panels = ok.length ? ok : dflt.panels;
  }
  if (kv.v !== undefined) {
    if (kv.v === "chart" || kv.v === "table") state.view = kv.v;
    else notices.push({ code: "view", items: [kv.v] });
  }
  if (kv.x !== undefined) state.x = kv.x === "1";
  return { kind: "state", state: enforcePanelRules(state, ctx), notices };
}

/** FR-06 AC3: provenance stays visible while any per-model figure panel is. */
export function enforcePanelRules(state, ctx) {
  const all = ctx.panels ?? PANEL_CODES;
  const s = { ...state, panels: [...state.panels] };
  if (all.includes("prov") && !s.panels.includes("prov") && s.panels.some((p) => FIGURE_PANELS.includes(p))) s.panels = all.filter((p) => p === "prov" || s.panels.includes(p));
  return s;
}

/** The hash for a state; "" for the default view. Lists are written alphabetically (dimension and panel lists in their fixed order) so URL order carries no meaning. */
export function serializeHash(state, ctx) {
  const s = normalise(state, ctx);
  const d = defaultState(ctx);
  const parts = [];
  if (JSON.stringify(s.models) !== JSON.stringify(d.models)) parts.push(s.models.length ? `m=${s.models.join(",")}` : "m=none");
  if (JSON.stringify(s.dims) !== JSON.stringify(d.dims)) parts.push(`d=${s.dims.join(",")}`);
  if (JSON.stringify(s.panels) !== JSON.stringify(d.panels)) parts.push(`p=${s.panels.join(",")}`);
  if (s.view) parts.push(`v=${s.view}`);
  if (s.x) parts.push("x=1");
  return parts.length ? `#${parts.join("&")}` : "";
}

// ---------------------------------------------------------------------------
// "Not measured yet": a state, not a zero. It becomes a value only when the projection has the field.
// ---------------------------------------------------------------------------

const hasPath = (o, path) => path.split(".").reduce((x, k) => (x && typeof x === "object" && k in x ? x[k] : undefined), o) !== undefined;
const anySubject = (pub, key) => Object.values(pub.subjects ?? {}).some((s) => s && typeof s === "object" && key in s);

/**
 * Each row: { id, available, reasonKey }. `available` is decided ONLY by the presence of the field in the public projection
 * (no manual override). The page words each state; this function holds no copy.
 */
export function notMeasuredStates(pub) {
  return [
    { id: "crisis", available: pub.design?.crisis_items_served === true || hasPath(pub, "critical_harm") },
    { id: "refusal", available: hasPath(pub, "failures.refusal_rate") },
    { id: "consistency", available: anySubject(pub, "stability") },
    { id: "multi-turn", available: typeof pub.design?.items_per_conversation_max === "number" && pub.design.items_per_conversation_max > 1 },
    { id: "validated", available: (pub.bank?.items_validated ?? 0) > 0 },
    { id: "human-raters", available: hasPath(pub, "human_ratings") },
    { id: "length-controlled", available: hasPath(pub, "length_controlled") },
    { id: "languages", available: hasPath(pub, "languages") },
    { id: "frontier", available: false },
    { id: "official", available: false },
  ];
}
