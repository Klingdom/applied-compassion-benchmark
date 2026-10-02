/**
 * model-report.mjs -- compiles a wave report from markdown + a wave file.
 *
 *   reports/<run_id>.md  +  waves/<run_id>.json  -->  compiled report object
 *
 * Pure: no file or clock access. build-model-reports.mjs does the I/O and the
 * tests call this directly with synthetic input.
 *
 * Token grammar (template A): `{{path|format}}`, resolved against the WAVE FILE
 * only. `{{lit:TEXT|source:WHERE}}` is the escape hatch for a literal that has
 * no wave field; at most LIT_MAX per report, each with a source.
 *
 * Path syntax: dot-separated; array elements by index (`pairwise.0.interval95`)
 * or by selector (`pairwise[a=claude-fable,b=claude-haiku].interval95`). Subject
 * ids contain hyphens and are plain keys: `subjects.claude-opus.pilot_composite`.
 *
 * Formats: n0 (integer) n1 n2 n3 (one to three decimals) pct (percent, one
 * decimal, from a 0-1 rate) range ("lo to hi", one decimal) range0 (integers)
 * range2 (two decimals) yesno (a boolean as "yes"/"no") list
 * ("a, b and c", alphabetical; subject ids become display names) name (display
 * name). A string needs no format. A number always does.
 *
 * Every check reports { rule, message, line }. The rule ids are stable so a
 * negative control can assert WHICH rule tripped.
 */

import {
  SECTIONS, normTitle, WORD_MIN, WORD_MAX, LIT_MAX, BANNED, BAND_NAMES, WEAKER_RE, QUALIFIER_RE,
  DIRECTIONAL_RE, NEGATOR_RE, ENDORSE_RE, CTA_RE, MUST_SAY, MUST_CITE, STATUS_NUMERIC_ALLOW,
  CAUSAL_RE, NUMBER_WORDS, MUST_CITE_ANY, MUST_SAY_ANY, SENSITIVITY_SECTIONS,
} from "./model-report-template.mjs";
import { createHash } from "node:crypto";
import { waveProblems } from "./model-wave.mjs";

const alpha = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const FORMATS = new Set(["n0", "n1", "n2", "n3", "pct", "range0", "range", "range2", "list", "name", "yesno"]);

// ---------------------------------------------------------------------------
// Names
// ---------------------------------------------------------------------------

const titleCase = (s) => s.split("-").filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join(" ");

/** Display names for the wave's subjects. `full` "Claude Fable"; `short` "Fable" (common first segment dropped). */
export function makeNaming(wave) {
  const ids = Object.keys(wave.subjects).sort(alpha);
  const firsts = new Set(ids.map((i) => i.split("-")[0]));
  const dropFirst = ids.length > 1 && firsts.size === 1 && ids.every((i) => i.includes("-"));
  const full = {};
  const short = {};
  for (const id of ids) {
    full[id] = titleCase(id);
    short[id] = dropFirst ? titleCase(id.split("-").slice(1).join("-")) : titleCase(id);
  }
  const forms = [];
  for (const id of ids) for (const f of new Set([full[id], short[id], id])) forms.push([f, id]);
  forms.sort((a, b) => b[0].length - a[0].length);
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?<![A-Za-z0-9-])(?:${forms.map(([f]) => esc(f)).join("|")})(?![A-Za-z0-9-])`, "g");
  const byForm = new Map(forms);
  return {
    ids, full, short,
    displayName: (id) => full[id] ?? id,
    /** All model mentions in `text`: [{id, start, end}] in order. */
    mentions(text) {
      const out = [];
      for (const m of text.matchAll(re)) out.push({ id: byForm.get(m[0]), start: m.index, end: m.index + m[0].length });
      return out;
    },
  };
}

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------

function splitPath(path) {
  const segs = [];
  let cur = "";
  let depth = 0;
  for (const ch of path) {
    if (ch === "[") depth++;
    if (ch === "]") depth--;
    if (ch === "." && depth === 0) { segs.push(cur); cur = ""; } else cur += ch;
  }
  segs.push(cur);
  return segs;
}

const own = (o, k) => o !== null && typeof o === "object" && Object.prototype.hasOwnProperty.call(o, k);

/** Resolve against the wave. Returns { ok, value, canonical } or { ok:false, error }. */
export function resolvePath(wave, path) {
  let cur = wave;
  const canon = [];
  for (const seg of splitPath(path)) {
    const m = seg.match(/^([^[\]]+)(?:\[([^\]]*)\])?$/);
    if (!m) return { ok: false, error: `malformed path segment "${seg}"` };
    const [, key, sel] = m;
    if (!own(cur, key)) return { ok: false, error: `"${key}" not found in the wave file (path ${path})` };
    cur = cur[key];
    canon.push(key);
    if (sel !== undefined) {
      if (!Array.isArray(cur)) return { ok: false, error: `selector on non-array "${key}"` };
      const conds = sel.split(",").map((c) => c.split("="));
      if (conds.some((c) => c.length !== 2)) return { ok: false, error: `malformed selector [${sel}]` };
      const hits = cur.map((e, i) => [e, i]).filter(([e]) => conds.every(([k, v]) => String(e?.[k]) === v));
      if (hits.length !== 1) return { ok: false, error: `selector [${sel}] matched ${hits.length} elements of "${key}", need exactly one` };
      canon.push(String(hits[0][1]));
      cur = hits[0][0];
    }
  }
  if (cur === undefined || cur === null) return { ok: false, error: `${path} is empty in this wave ("Not measured in this wave")` };
  return { ok: true, value: cur, canonical: canon.join(".") };
}

// ---------------------------------------------------------------------------
// Formats
// ---------------------------------------------------------------------------

const grouped = (n) => Math.round(n).toLocaleString("en-US");

function listJoin(xs) {
  if (xs.length === 0) return "";
  if (xs.length === 1) return xs[0];
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}

export function applyFormat(value, format, naming, ctxPath) {
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const rng = (v) => Array.isArray(v) && v.length === 2 && v.every(num);
  switch (format) {
    case undefined:
      if (typeof value === "string") return { ok: true, text: value };
      return { ok: false, error: `${ctxPath} is ${typeof value}: it needs a format (${[...FORMATS].join(", ")})` };
    case "yesno": return typeof value === "boolean" ? { ok: true, text: value ? "yes" : "no" } : { ok: false, error: `yesno needs a boolean at ${ctxPath}` };
    case "n1": return num(value) ? { ok: true, text: value.toFixed(1) } : { ok: false, error: `n1 needs a number at ${ctxPath}` };
    case "n0": return num(value) ? { ok: true, text: grouped(value) } : { ok: false, error: `n0 needs a number at ${ctxPath}` };
    case "n2": return num(value) ? { ok: true, text: value.toFixed(2) } : { ok: false, error: `n2 needs a number at ${ctxPath}` };
    case "n3": return num(value) ? { ok: true, text: value.toFixed(3) } : { ok: false, error: `n3 needs a number at ${ctxPath}` };
    case "range0": return rng(value) ? { ok: true, text: `${grouped(value[0])} to ${grouped(value[1])}` } : { ok: false, error: `range0 needs a [lo, hi] pair at ${ctxPath}` };
    case "pct": return num(value) ? { ok: true, text: `${(value * 100).toFixed(1)}%` } : { ok: false, error: `pct needs a 0-1 rate at ${ctxPath}` };
    case "range": return rng(value) ? { ok: true, text: `${value[0].toFixed(1)} to ${value[1].toFixed(1)}` } : { ok: false, error: `range needs a [lo, hi] pair at ${ctxPath}` };
    case "range2": return rng(value) ? { ok: true, text: `${value[0].toFixed(2)} to ${value[1].toFixed(2)}` } : { ok: false, error: `range2 needs a [lo, hi] pair at ${ctxPath}` };
    case "list": {
      if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) return { ok: false, error: `list needs an array of strings at ${ctxPath}` };
      const names = value.map((v) => (naming.full[v] ?? v));
      return { ok: true, text: listJoin([...names].sort(alpha)) };
    }
    case "name": {
      if (typeof value === "string" && naming.full[value]) return { ok: true, text: naming.full[value] };
      const m = ctxPath.match(/^subjects\.([^.]+)$/);
      if (m && naming.full[m[1]]) return { ok: true, text: naming.full[m[1]] };
      return { ok: false, error: `name needs a subject id (or a path directly under subjects.) at ${ctxPath}` };
    }
    default:
      return { ok: false, error: `unknown format "${format}"` };
  }
}

// ---------------------------------------------------------------------------
// Token scanning
// ---------------------------------------------------------------------------

const TOKEN_RE = /\{\{([^{}\n]+)\}\}/g;
const MASK = "";

function parseToken(inner) {
  const body = inner.trim();
  if (body.startsWith("lit:")) {
    const m = body.match(/^lit:(.*?)\|source:(.+)$/);
    if (!m) return { kind: "lit", error: "a lit token needs |source:WHERE" };
    return { kind: "lit", text: m[1].trim(), source: m[2].trim() };
  }
  const bar = body.lastIndexOf("|");
  if (bar >= 0 && FORMATS.has(body.slice(bar + 1).trim())) return { kind: "fig", path: body.slice(0, bar).trim(), format: body.slice(bar + 1).trim() };
  return { kind: "fig", path: body, format: undefined };
}

/** Subject ids a resolved token is about. */
function tokenSubjects(entry, wave, naming) {
  const ids = new Set();
  for (const seg of splitPath(entry.canonical)) if (naming.full[seg]) ids.add(seg);
  const pair = entry.canonical.match(/^(sensitivity\.pairwise|pairwise|dimension_pairwise)\.(\d+)\./);
  if (pair) { const e = (pair[1] === "sensitivity.pairwise" ? wave.sensitivity.pairwise : wave[pair[1]])[Number(pair[2])]; ids.add(e.a); ids.add(e.b); }
  if (typeof entry.value === "string" && naming.full[entry.value]) ids.add(entry.value);
  return ids;
}

const isNumeric = (v) => typeof v === "number" || (Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "number"));

// ---------------------------------------------------------------------------
// Copy rules (template D) over one sentence. Exported so the frontend can run the same
// lexicon over titles, meta descriptions, alt text and JSON-LD strings (QA G3).
// ---------------------------------------------------------------------------

export function lexiconProblems(txt, wave, naming = makeNaming(wave)) {
  const out = [];
  const bad = (rule, message) => out.push({ rule, message });
  const sepSet = new Set(wave.derived.separated_subjects);
  const pairSeparated = (a, b) => wave.derived.separated_pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const negated = NEGATOR_RE.test(txt);
  for (const b of BANNED) {
    if (b.re.test(txt) && !(b.negatable && negated)) bad("R-banned-lexicon", `banned word "${b.label}" in: "${txt.slice(0, 120)}"`);
  }
  for (const band of BAND_NAMES) if (new RegExp(`\\b${band}\\b`).test(txt)) bad("R-banned-lexicon", `band name "${band}" in prose: bands never label a model (template A)`);
  if (WEAKER_RE.test(txt) && !QUALIFIER_RE.test(txt)) bad("R-banned-lexicon", `"weaker/worse" outside an approved qualifier (the sentence must carry the confound: reply length, confound or unresolved): "${txt.slice(0, 120)}"`);
  const ms = naming.mentions(txt);
  if (ms.length && ENDORSE_RE.test(txt)) bad("R-model-endorsement", `a model name beside safe/recommend/trust language: "${txt.slice(0, 120)}"`);
  if (ms.length && DIRECTIONAL_RE.test(txt) && !negated) {
    const named = [...new Set(ms.map((m) => m.id))];
    const okSet = named.length === 1
      ? sepSet.has(named[0])
      : named.every((a, i) => named.every((b2, j) => i >= j || pairSeparated(a, b2)));
    if (!okSet) bad("R-ordering-adjacent", `an ordering word beside ${named.map((n) => naming.short[n]).join(" / ")}, which the pilot did not separate: "${txt.slice(0, 120)}"`);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Compile
// ---------------------------------------------------------------------------

/**
 * @returns {{ errors: {rule:string,message:string,line:number}[], report: object|null }}
 *   `report` is the compiled object (also present when there are errors, for diagnosis).
 */
export function compileReport({ md, wave, dimensionNames = {} }) {
  const errors = [];
  const err = (rule, message, line = 0) => errors.push({ rule, message, line });
  // A report is only as good as its wave: an invalid wave (flag contradicting its interval,
  // stale derived block, forbidden key) stops the compile before any prose is read.
  const wp = waveProblems(wave);
  if (wp.length) return { errors: wp.map((m) => ({ rule: "R-wave-invalid", message: m, line: 0 })), report: null };
  const naming = makeNaming(wave);
  const src = md.replace(/\r\n?/g, "\n").replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ""));
  const srcLines = src.split("\n");

  // ---- front matter (optional) ---------------------------------------------
  let start = 0;
  const front = [];
  if (srcLines[0]?.trim() === "---") {
    const end = srcLines.findIndex((l, i) => i > 0 && l.trim() === "---");
    if (end < 0) err("R-front-matter", "front matter opened with --- but never closed", 1);
    else { for (let i = 1; i < end; i++) front.push(i); start = end + 1; }
  }
  const frontLineSet = new Set(front);

  // ---- resolve tokens line by line -----------------------------------------
  const ledger = [];
  const lits = [];
  const lines = []; // { n, src, out, masked, tokens:[{start,end,entry}], kind, section, ... }
  let offset = 0;
  let curField = null; // front-matter key the current line belongs to (continuation lines inherit it)
  for (let i = 0; i < srcLines.length; i++) {
    const n = i + 1;
    const s = srcLines[i];
    if (i < start && !frontLineSet.has(i)) { continue; }
    let out = "";
    let masked = "";
    let last = 0;
    const toks = [];
    for (const m of s.matchAll(TOKEN_RE)) {
      out += s.slice(last, m.index);
      masked += s.slice(last, m.index);
      last = m.index + m[0].length;
      if (/measured_original_answer_stats/.test(m[1])) err("R-measured-original", "exclusion_record.measured_original_answer_stats must never be quoted (template B10)", n);
      const tk = parseToken(m[1]);
      let rendered = "";
      if (tk.kind === "lit") {
        if (tk.error) err("R-lit-source", `${tk.error}: ${m[0]}`, n);
        else {
          rendered = tk.text;
          lits.push({ text: tk.text, source: tk.source, line: n });
          toks.push({ start: out.length, end: out.length + rendered.length, entry: { kind: "lit", rendered, line: n } });
        }
      } else {
        const r = resolvePath(wave, tk.path);
        if (!r.ok) err("R-token-unresolved", `${m[0]}: ${r.error}`, n);
        else {
          const f = applyFormat(r.value, tk.format, naming, r.canonical);
          if (!f.ok) err("R-token-format", `${m[0]}: ${f.error}`, n);
          else {
            rendered = f.text;
            const entry = { kind: "fig", token: m[0], path: tk.path, canonical: r.canonical, format: tk.format ?? null, value: r.value, rendered, line: n };
            toks.push({ start: out.length, end: out.length + rendered.length, entry });
          }
        }
      }
      out += rendered;
      masked += MASK;
    }
    out += s.slice(last);
    masked += s.slice(last);
    if (/\{\{|\}\}/.test(out)) err("R-token-syntax", "unmatched {{ or }} in a line (tokens must open and close on one line)", n);
    if (frontLineSet.has(i)) { const km = s.match(/^([A-Za-z_][\w-]*)\s*:/); if (km) curField = km[1]; }
    lines.push({ n, src: s, out, masked, toks, front: frontLineSet.has(i), field: frontLineSet.has(i) ? curField : null, globalStart: offset });
    offset += out.length + 1;
  }

  // ---- classify lines, assign sections --------------------------------------
  const h2 = [];
  let sec = -1; // -1 = preface
  let glossLevel = null; // heading level that opened the glossary region
  for (const L of lines) {
    const t = L.out;
    const hm = t.match(/^(#{1,6})\s+(.*)$/);
    if (L.front) L.kind = "front";
    else if (hm) L.kind = "heading";
    else if (/^\s*\|/.test(t)) L.kind = "table";
    else if (/^\s*(?:[-*+]|\d+[.)])\s+/.test(t)) L.kind = "list";
    else if (/^\s*$/.test(t)) L.kind = "blank";
    else L.kind = "para";
    if (L.kind === "heading") {
      L.level = hm[1].length;
      L.title = hm[2].trim();
      if (L.level === 2) { sec += 1; h2.push({ title: L.title, line: L.n, index: sec }); }
      if (glossLevel !== null && L.level <= glossLevel) glossLevel = null;
      if (L.level >= 3 && /^glossary$/i.test(L.title.replace(/[^A-Za-z ]/g, "").trim())) glossLevel = L.level;
    }
    L.section = L.kind === "front" ? -2 : sec;
    L.glossary = glossLevel !== null;
  }

  // ---- structure: fixed H2s in order ------------------------------------------
  const h1s = lines.filter((l) => l.kind === "heading" && l.level === 1);
  if (h1s.length > 1) err("R-sections-h1", `${h1s.length} H1 headings; at most one`, h1s[1].n);
  const wanted = SECTIONS.map((s) => normTitle(s.title));
  const got = h2.map((h) => normTitle(h.title));
  const missing = SECTIONS.filter((s) => !got.includes(normTitle(s.title)));
  for (const s of missing) err("R-sections-missing", `required H2 "${s.title}" is missing`, 0);
  const extra = h2.filter((h) => !wanted.includes(normTitle(h.title)));
  for (const h of extra) err("R-sections-extra", `H2 "${h.title}" is not one of the ${SECTIONS.length} fixed sections (optional sections are H3 inside a fixed section)`, h.line);
  if (!missing.length && !extra.length && JSON.stringify(got) !== JSON.stringify(wanted)) {
    const bad = got.findIndex((g, i) => g !== wanted[i]);
    err("R-sections-order", `H2 "${h2[bad].title}" is out of template order (expected "${SECTIONS[bad].title}" at position ${bad + 1})`, h2[bad].line);
  }
  const secId = (idx) => {
    if (idx < 0) return "preface";
    const k = SECTIONS.findIndex((s) => normTitle(s.title) === normTitle(h2[idx]?.title ?? ""));
    return k >= 0 ? SECTIONS[k].id : `extra-${idx}`;
  };
  for (const L of lines) L.sid = L.section === -2 ? "front" : secId(L.section);

  // ---- bare digits ---------------------------------------------------------------
  const runIds = [wave.run_id];
  for (const L of lines) {
    let t = L.masked.replace(/\]\([^)]*\)/g, "]()"); // link destinations are not prose
    if (L.kind === "heading") t = t.replace(/^(#{1,6})\s+\d+[.)]\s+/, "$1 ");
    if (L.kind === "list") t = t.replace(/^(\s*)\d+[.)]\s+/, "$1- ");
    if (L.kind === "table" && /^[\s|:-]+$/.test(t)) continue;
    for (const r of runIds) t = t.split(r).join(" ");
    t = t.replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ")
      .replace(/\b[A-Z]{2,4}-\d+(?:-[A-Z0-9]+)?\b/g, " ")
      .replace(/\bD-\d+[a-z]?\b/g, " ");
    const m = t.match(/\d/);
    if (m) {
      const at = Math.max(0, m.index - 25);
      err("R-bare-digit", `a bare digit in prose: "...${t.slice(at, m.index + 25).replace(//g, "{{}}")}..." Use a {{path|format}} token, or {{lit:...|source:...}} (max ${LIT_MAX}).`, L.n);
    }
  }

  // ---- lit cap -------------------------------------------------------------------
  if (lits.length > LIT_MAX) err("R-lit-cap", `${lits.length} lit tokens; the cap is ${LIT_MAX}`, lits[LIT_MAX].line);

  // ---- blocks and sentences --------------------------------------------------------
  const blocks = [];
  let cur = null;
  const flush = () => { if (cur) { blocks.push(cur); cur = null; } };
  for (const L of lines) {
    if (L.kind === "front") continue;
    if (L.kind === "blank") { flush(); continue; }
    if (L.kind === "para" || L.kind === "blockquote") {
      if (!cur || cur.kind !== "para") { flush(); cur = { kind: "para", sid: L.sid, lines: [], glossary: L.glossary }; }
      cur.lines.push(L);
      continue;
    }
    flush();
    blocks.push({ kind: L.kind, sid: L.sid, lines: [L], glossary: L.glossary });
  }
  flush();
  for (const b of blocks) {
    let text = "";
    const toks = [];
    for (const L of b.lines) {
      if (text) text += " ";
      for (const t of L.toks) toks.push({ ...t, start: t.start + text.length, end: t.end + text.length });
      text += L.out;
    }
    b.text = text;
    b.toks = toks;
    b.firstLine = b.lines[0].n;
    // sentences: table rows are one unit; paragraphs and list items split on ". "
    const cuts = [0];
    if (b.kind !== "table" && b.kind !== "heading") {
      for (const m of text.matchAll(/(?<=[.!?])\s+(?=["(\[A-Z{])/g)) cuts.push(m.index + m[0].length);
    }
    b.sentences = cuts.map((c, i) => {
      const e = i + 1 < cuts.length ? cuts[i + 1] : text.length;
      const s = { start: c, end: e, text: text.slice(c, e).trim() };
      s.toks = toks.filter((t) => t.start >= c && t.start < e);
      s.sid = b.sid;
      s.line = b.firstLine;
      s.kind = b.kind;
      return s;
    });
  }
  const sentences = blocks.flatMap((b) => b.sentences.map((s) => ({ ...s, block: b })));

  // ---- helpers over sentences ---------------------------------------------------------
  const subjectsOf = (t) => tokenSubjects(t.entry, wave, naming);
  const isPerModelFigure = (t) => {
    if (t.entry.kind !== "fig" || t.entry.format === "name") return false;
    if (!isNumeric(t.entry.value) && typeof t.entry.value !== "boolean") return false;
    if (/^(sensitivity\.pairwise|pairwise|dimension_pairwise)\.\d+\./.test(t.entry.canonical)) return true;
    return subjectsOf(t).size > 0;
  };
  const derived = wave.derived;
  const groups = derived.not_separated_groups;
  const sepSet = new Set(derived.separated_subjects);
  const groupMembers = new Set(groups.flat());
  const pairSeparated = (a, b) => derived.separated_pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

  // ---- group sentence precedes the first per-model figure -------------------------------
  // A "Not separated" sentence says the range of the difference includes zero / the pilot
  // cannot tell them apart, and names exactly the members of one group (by token or by
  // plain text; claims-vs-pairwise below checks the names against the wave either way).
  const firstFigure = (() => {
    for (const s of sentences) for (const t of s.toks) if (isPerModelFigure(t)) return { s, t };
    return null;
  })();
  const sentenceIndex = new Map(sentences.map((s, i) => [s, i]));
  const NOT_SEP_PHRASE = /includes? zero|cross(?:es)? zero|cannot (?:tell|say|order|separate)|could not (?:tell|separate)|could not be told apart|cannot be told apart|not separated|does not separate/i;
  for (let gi = 0; gi < groups.length; gi++) {
    const want = [...groups[gi]].sort(alpha).join("|");
    const hit = sentences.find((s) => NOT_SEP_PHRASE.test(s.text)
      && [...new Set(naming.mentions(s.text).map((m) => m.id))].sort(alpha).join("|") === want);
    if (!hit) {
      err("R-group-sentence-missing", `no "Not separated" sentence for group ${gi} (${groups[gi].join(", ")}). It must name exactly those models (for example with {{derived.not_separated_groups.${gi}|list}}) and say the range of the difference includes zero / the pilot cannot tell them apart.`, 0);
      continue;
    }
    if (firstFigure && sentenceIndex.get(hit) > sentenceIndex.get(firstFigure.s)) {
      err("R-group-sentence-late", `the "Not separated" sentence for group ${gi} (line ${hit.line}) comes after the first per-model figure (line ${firstFigure.s.line}, ${firstFigure.t.entry.token}). The group must be named first.`, hit.line);
    }
  }

  // ---- point estimates live only in a table labelled "point estimate" ----------------------
  const tableHeaderOf = (L) => {
    let i = lines.indexOf(L);
    while (i > 0 && lines[i - 1].kind === "table") i--;
    return lines[i].out;
  };
  // Amendment 2026-10-01 #8 gate: once any report shows a separated subject's point, no point difference
  // involving a member of a not-separated group may appear (point + difference rebuild the hidden point).
  const pairOfDiff = (canonical) => {
    const pw = canonical.match(/^(sensitivity\.pairwise|pairwise)\.(\d+)\.difference$/);
    return pw ? (pw[1] === "sensitivity.pairwise" ? wave.sensitivity.pairwise : wave.pairwise)[Number(pw[2])] : null;
  };
  const separatedPoint = lines.flatMap((L) => L.toks.map((t) => t.entry)).find((e) => {
    const m = e.kind === "fig" && e.canonical.match(/^(?:sensitivity\.)?subjects\.([^.]+)\.pilot_composite$/);
    return m && sepSet.has(m[1]);
  });
  for (const L of lines) for (const t of L.toks) {
    const e = t.entry;
    if (e.kind !== "fig") continue;
    const pe = pairOfDiff(e.canonical);
    if (pe && separatedPoint && (groupMembers.has(pe.a) || groupMembers.has(pe.b))) {
      err("R-reconstruct", `${e.token}: this report shows a separated subject's point (${separatedPoint.token}); a point difference against a not-separated group member would let readers rebuild the hidden points and their order. Show the paired-difference range instead (template amendment 2026-10-01 #8)`, L.n);
    }
    const pointOf = e.canonical.match(/^(?:sensitivity\.)?subjects\.([^.]+)\.pilot_composite$/);
    const isPoint = pointOf !== null;
    // Amendment 2026-10-01 #2: a member of a not-separated group shows a range, never a point, anywhere
    // (prose, tables, headings, front matter). Points stay allowed for separated subjects.
    if (isPoint && groupMembers.has(pointOf[1])) {
      err("R-group-point", `${e.token}: ${pointOf[1]} is in a not-separated group, which shows ranges only; a point reads as a ranking (template amendment 2026-10-01 #2)`, L.n);
    }
    if (isPoint && !(L.kind === "table" && /point estimate/i.test(tableHeaderOf(L)))) {
      err("R-point-in-prose", `${e.token}: a point appears only in a table cell whose column is labelled "point estimate" (template D)`, L.n);
    }
    const pw = e.canonical.match(/^(sensitivity\.pairwise|pairwise|dimension_pairwise)\.(\d+)\.difference$/);
    if (pw) {
      const el = (pw[1] === "sensitivity.pairwise" ? wave.sensitivity.pairwise : wave[pw[1]])[Number(pw[2])];
      const ok = pw[1] === "dimension_pairwise" ? el.bonferroni_separated : el.separated;
      if (!ok) err("R-difference-unseparated", `${e.token}: a point difference is shown only for a separated pair (Bonferroni-separated for dimensions); this comparison is not`, L.n);
    }
  }

  // ---- implied order: tables, lists, name runs ------------------------------------------------
  // Two orders carry no meaning: alphabetical, and template E's group order (size
  // descending then first label, alphabetical within). Anything else (for example
  // sorted by a result) is an implied ranking.
  const clusters = [...groups, ...derived.separated_subjects.map((s) => [s])].sort((g, h) => h.length - g.length || alpha(g[0], h[0]));
  const clusterRank = new Map(clusters.flat().map((id, i) => [id, i]));
  const alphaRank = new Map([...naming.ids].sort(alpha).map((id, i) => [id, i]));
  const monotone = (ids, rank) => ids.every((x, i) => i === 0 || rank.get(ids[i - 1]) <= rank.get(x));
  const seqAlpha = (ids) => monotone(ids, alphaRank) || monotone(ids, clusterRank);
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if ((b.kind === "table" || b.kind === "list") && !(i > 0 && blocks[i - 1].kind === b.kind && blocks[i - 1].sid === b.sid)) {
      // A "series over models" is a list or table in which EVERY item starts with a model, one item per model.
      const run = [];
      let allStartWithModel = true;
      for (let j = i; j < blocks.length && blocks[j].kind === b.kind && blocks[j].sid === b.sid; j++) {
        if (b.kind === "table" && (/^[\s|:-]+$/.test(blocks[j].text) || j === i)) continue; // separator, header
        const plain = blocks[j].text.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "").replace(/[*_|]/g, " ");
        const m = naming.mentions(plain)[0];
        if (m && m.start <= (b.kind === "table" ? 40 : 30)) run.push({ id: m.id, line: blocks[j].firstLine });
        else allStartWithModel = false;
      }
      const distinct = new Set(run.map((r) => r.id)).size === run.length;
      if (allStartWithModel && run.length >= 2 && distinct && !seqAlpha(run.map((r) => r.id))) {
        err("R-implied-order", `${b.kind} rows over models are not in alphabetical or group order (${run.map((r) => r.id).join(" > ")}). Order carries no meaning and must not follow a result.`, run[0].line);
      }
    }
  }
  for (const s of sentences) {
    if (s.kind === "table" || s.kind === "heading") continue;
    const ms = naming.mentions(s.text);
    let run = [];
    const closeRun = () => {
      if (run.length >= 2 && !seqAlpha(run.map((r) => r.id))) {
        err("R-implied-order", `models listed as "${run.map((r) => naming.short[r.id]).join(", ")}" are not in alphabetical order`, s.line);
      }
      run = [];
    };
    for (let i = 0; i < ms.length; i++) {
      if (i > 0 && !/^\s*(?:,|, and| and|, or| or|\/|&)\s*$/.test(s.text.slice(ms[i - 1].end, ms[i].start))) closeRun();
      run.push(ms[i]);
    }
    closeRun();
  }

  // ---- binding: a figure next to the right name ----------------------------------------------
  // Tight rule: a model name ending within TIGHT characters before a figure, with none of the
  // figure's own models named just after it, is a swap ("Fable's range is <Opus's range>").
  // Loose rule: if the sentence names any model at all, one of the figure's own models must be
  // among them. Table rows: the row's first model must be one of the figure's models.
  const TIGHT = 24;
  // Front-matter fields (abstract, dek, meta_description ...) are bound under the same rule: one line is one unit.
  const frontUnits = lines.filter((L) => L.kind === "front").map((L) => ({ start: 0, text: L.out, toks: L.toks, kind: "front", line: L.n }));
  for (const s of [...sentences, ...frontUnits]) {
    const ms = naming.mentions(s.text);
    if (!ms.length) continue;
    for (const t of s.toks) {
      if (t.entry.kind !== "fig" || t.entry.format === "name" || !isNumeric(t.entry.value)) continue;
      const ids = subjectsOf(t);
      if (!ids.size) continue;
      const at = t.start - s.start;
      const here = `${t.entry.token} is about ${[...ids].join(" and ")}`;
      if (!ms.some((m) => ids.has(m.id))) {
        err("R-binding", `${here} but the sentence names only ${[...new Set(ms.map((m) => m.id))].join(", ")}: a figure must sit with its own model`, s.line);
        continue;
      }
      if (s.kind === "table") {
        const plain = s.text.replace(/[*_]/g, " ");
        const row = naming.mentions(plain)[0];
        if (row && !ids.has(row.id)) err("R-binding", `${here} but the row starts with ${row.id}: a figure must sit in its own model's row`, s.line);
        continue;
      }
      const prev = [...ms].reverse().find((m) => m.end <= at);
      const nextOwn = ms.find((m) => m.start >= at && m.start - at <= TIGHT && ids.has(m.id));
      if (prev && at - prev.end <= TIGHT && !ids.has(prev.id) && !nextOwn) {
        err("R-binding", `${here} but the model name just before it is ${prev.id}: a figure must sit next to its own model`, s.line);
      }
    }
  }

  // ---- lexicon -----------------------------------------------------------------------------------
  const claimSentences = sentences.filter((s) => s.kind !== "table" || !/^[\s|:-]+$/.test(s.text));
  for (const s of claimSentences) for (const p of lexiconProblems(s.text, wave, naming)) err(p.rule, p.message, s.line);
  // Title, dek and other front matter feed <title>, JSON-LD and OG: same lexicon, and no per-model figure.
  for (const L of lines) {
    if (L.kind !== "front") continue;
    for (const p of lexiconProblems(L.out, wave, naming)) err(p.rule, `front matter: ${p.message}`, L.n);
    for (const t of L.toks) if (isPerModelFigure(t)) err("R-front-figure", `${t.entry.token}: front matter (title, dek, meta) carries no per-model figure (template G)`, L.n);
    // Template G: no number in a title. title and seo_title carry no figure or literal token, and no digit
    // other than a YYYY-MM-DD date (the run id is NOT exempt here).
    if (L.field === "title" || L.field === "seo_title") {
      if (L.toks.length) err("R-title-token", `front matter ${L.field}: a title carries no {{...}} token (template G: no number in titles); write the number in words`, L.n);
      const dm = L.out.replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ").match(/\d/);
      if (dm) err("R-title-digit", `front matter ${L.field}: a digit in a title other than a YYYY-MM-DD date (template G: no number in titles)`, L.n);
    }
  }

  // ---- claims vs pairwise ------------------------------------------------------------------------
  const clauseSplit = /;|,\s+(?:and|but|while|whereas)\s+|\s+(?:but|while|whereas)\s+/;
  const NEG = /(?:includes?|crosses?) zero|not separated|cannot (?:tell|separate|say|order)|could not (?:tell|separate|order)|does not separate|did not separate|can not tell/i;
  const coveredPairs = new Set();
  const pairKey = (x, y) => [x, y].sort(alpha).join("|");
  for (const s of claimSentences) {
    if (s.kind === "table") continue;
    let from = 0;
    const parts = [];
    for (const m of s.text.matchAll(new RegExp(clauseSplit, "g"))) { parts.push([from, m.index]); from = m.index + m[0].length; }
    parts.push([from, s.text.length]);
    for (const [a, b] of parts) {
      const clause = s.text.slice(a, b);
      const ms = naming.mentions(clause);
      const isNeg = NEG.test(clause);
      if (isNeg) {
        const ids = [...new Set(ms.map((m) => m.id))];
        for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
          if (pairSeparated(ids[i], ids[j])) err("R-claims-vs-pairwise", `the prose says the pilot cannot tell ${naming.short[ids[i]]} and ${naming.short[ids[j]]} apart, but the wave marks that pair separated: "${clause.trim().slice(0, 120)}"`, s.line);
        }
        continue;
      }
      const pos = clause.match(/\bseparat(?:e|es|ed|ing)\b[^.;]*?\bfrom\b/i);
      if (!pos || NEGATOR_RE.test(clause)) continue;
      const fromAt = pos.index + pos[0].length - 4;
      const before = [...new Set(ms.filter((m) => m.end <= fromAt).map((m) => m.id))];
      const after = [...new Set(ms.filter((m) => m.start >= fromAt).map((m) => m.id))];
      if (before.length && after.length) {
        for (const x of before) for (const y of after) if (x !== y) coveredPairs.add(pairKey(x, y));
        for (const x of before) for (const y of after) if (x !== y && !pairSeparated(x, y)) err("R-claims-vs-pairwise", `the prose says ${naming.short[x]} was separated from ${naming.short[y]}, but the wave marks that pair not separated: "${clause.trim().slice(0, 120)}"`, s.line);
      } else if (before.length && !after.length) {
        const other = clause.match(/\b(?:the )?other (\w+)|\beach of the others\b|\ball (?:the )?others\b/i);
        if (other) {
          for (const x of before) for (const y of naming.ids) if (x !== y) coveredPairs.add(pairKey(x, y));
          for (const x of before) if (!sepSet.has(x)) err("R-claims-vs-pairwise", `the prose says ${naming.short[x]} was separated from the others, but it is in a not-separated group`, s.line);
          const w = (other[1] ?? "").toLowerCase();
          if (NUMBER_WORDS[w] !== undefined && NUMBER_WORDS[w] !== wave.derived.subject_count - 1) err("R-claims-count", `"the other ${w}" but the wave has ${wave.derived.subject_count} subjects`, s.line);
        }
      }
    }
  }
  for (const [x, y] of derived.separated_pairs) {
    if (!coveredPairs.has(pairKey(x, y))) err("R-claims-missing", `${x} and ${y} are separated in the wave, but no sentence says so ("X was separated from ..."). A missing separation is a misstatement too.`, 0);
  }

  // ---- crisis adjacency (section 3, text level) --------------------------------------------------
  for (const b of blocks.filter((x) => x.sid === "duty-of-care")) {
    if (naming.mentions(b.text).length || b.toks.length) err("R-crisis-adjacency", "the duty-of-care section must carry no model name, token or number (template B3)", b.firstLine);
    if (CTA_RE.test(b.text) || /\]\(/.test(b.text)) err("R-crisis-adjacency", "the duty-of-care section must carry no call to action or link (template B3, H)", b.firstLine);
  }
  {
    const w = countWords(blocks.filter((x) => x.sid === "duty-of-care" && x.kind !== "heading").map((x) => x.text).join(" "));
    if (blocks.some((x) => x.sid === "duty-of-care") && w > 110) err("R-crisis-length", `the duty-of-care section is ${w} words; it must fit within two screens at 390px (budget 70)`, 0);
  }

  // ---- per-section rules ----------------------------------------------------------------------------
  const bySid = (sid) => blocks.filter((b) => b.sid === sid);
  const secText = (sid) => bySid(sid).map((b) => b.text).join("\n");
  const secToks = (sid) => bySid(sid).flatMap((b) => b.toks.filter((t) => t.entry.kind === "fig"));
  for (const [sid, musts] of Object.entries(MUST_SAY)) {
    if (!bySid(sid).length) continue;
    const text = secText(sid);
    for (const m of musts) if (!m.test(text)) err("R-must-say", `section "${SECTIONS.find((s) => s.id === sid).title}" must ${m.label}`, bySid(sid)[0].firstLine);
  }
  for (const [sid, prefixes] of Object.entries(MUST_CITE)) {
    if (!bySid(sid).length) continue;
    const toks = secToks(sid);
    // A leading "=" means the exact path (so "=bank.items_not_served" is not satisfied by "bank.items_not_served_sensitive").
    for (const p of prefixes) {
      const hit = p.startsWith("=") ? toks.some((t) => t.entry.canonical === p.slice(1)) : toks.some((t) => t.entry.canonical.startsWith(p) || t.entry.path.startsWith(p) || t.entry.path.includes(p));
      if (!hit) err("R-must-cite", `section "${SECTIONS.find((s) => s.id === sid).title}" must cite a ${p.replace(/^=/, "")} field (template B "Fields")`, bySid(sid)[0].firstLine);
    }
  }
  // Amendment 2026-10-01 #3/#4: the judge-sensitivity statement, in "Instrument health" or "Why these are not scores".
  {
    const where = SENSITIVITY_SECTIONS.filter((sid) => bySid(sid).length);
    const titles = SENSITIVITY_SECTIONS.map((sid) => `"${SECTIONS.find((s) => s.id === sid).title}"`).join(" or ");
    const anchor = where.length ? bySid(where[0])[0].firstLine : 0;
    const toks = where.flatMap((sid) => secToks(sid));
    for (const p of MUST_CITE_ANY) {
      if (!toks.some((t) => t.entry.canonical === p || t.entry.path === p)) err("R-must-cite", `${titles} must cite ${p} (template amendment 2026-10-01 #3)`, anchor);
    }
    const text = where.map((sid) => secText(sid)).join("\n");
    for (const m of MUST_SAY_ANY) if (!m.test(text)) err("R-must-say", `${titles} must ${m.label} (template amendment 2026-10-01 #3)`, anchor);
  }
  // 1: status first; no per-model figure
  const s1 = bySid("status").filter((b) => b.kind !== "heading");
  if (s1.length && !/unofficial/i.test(s1[0].text)) err("R-status-first", "the first block of the status section must say it is unofficial", s1[0].firstLine);
  for (const t of secToks("status")) {
    if (isNumeric(t.entry.value) && !STATUS_NUMERIC_ALLOW.some((p) => t.entry.canonical.startsWith(p))) err("R-section-figures", `${t.entry.token}: the status section may state only run-level numbers (template B1: no per-model figure)`, t.entry.line);
  }
  // 2: no figures
  for (const t of secToks("may-say")) if (isNumeric(t.entry.value)) err("R-section-figures", `${t.entry.token}: the may-say section carries no figures (template B2)`, t.entry.line);
  // 7: causal words, caveats, confound order
  for (const b of bySid("separated-model")) if (CAUSAL_RE.test(b.text)) err("R-causal-language", `causal wording in the reply-length section: "${b.text.slice(0, 120)}" (template B7 forbids because / driven by / explains)`, b.firstLine);
  {
    const order = secToks("separated-model").map((t) => t.entry.canonical);
    const iWords = order.findIndex((c) => /median_reply_words/.test(c));
    const iSlope = order.findIndex((c) => /^length\.(pooled_within_item|within_subject_slopes)/.test(c));
    const iBound = order.findIndex((c) => /^length\.composite_if_pooled_slope_removed/.test(c));
    if (iBound >= 0 && ((iWords >= 0 && iBound < iWords) || (iSlope >= 0 && iBound < iSlope))) err("R-confound-order", "reply-length confound order is word counts, then slopes, then the bound (template D)", bySid("separated-model")[0].firstLine);
    if (iSlope >= 0 && iWords >= 0 && iSlope < iWords) err("R-confound-order", "reply-length slopes appear before word counts (template D: word counts first)", bySid("separated-model")[0].firstLine);
  }
  for (const b of blocks) {
    const toks = b.toks.filter((t) => t.entry.kind === "fig");
    if (toks.some((t) => /^length\.composite_if_pooled_slope_removed/.test(t.entry.canonical)) && !/not an estimate/i.test(b.text)) err("R-bound-caveat", "the length bound must share its paragraph with 'not an estimate' (template B7)", b.firstLine);
    const sepFig = toks.find((t) => /^(?:subjects\.[^.]+\.(?:pilot_composite|pilot_composite_interval95)|sensitivity\.subjects\.[^.]+\.pilot_composite)$/.test(t.entry.canonical) && sepSet.has(t.entry.canonical.split(".").filter((x) => x !== "sensitivity")[1]));
    if (sepFig && b.kind !== "table" && !(/unresolved/i.test(b.text) && /length/i.test(b.text))) err("R-separated-caveat", `${sepFig.entry.token}: a separated model's figure carries each unresolved confound in the same paragraph or caption (D-29a item 4): needs "unresolved" and "reply length"`, b.firstLine);
    if (sepFig && b.kind === "table") {
      const tableText = blocks.filter((x) => x.sid === b.sid).map((x) => x.text).join(" ");
      if (!(/unresolved/i.test(tableText) && /length/i.test(tableText))) err("R-separated-caveat", `${sepFig.entry.token}: a table row for a separated model needs the unresolved reply-length caveat in its section`, b.firstLine);
    }
  }
  // 8: predicate-checked "lowest" claims. The dimension is named by code or by its display name
  // (options.dimensionNames); the claim is about one named model or about "every model".
  for (const s of claimSentences) if (s.sid === "dimensions" && /\blowest\b/i.test(s.text)) {
    const named = [...new Set(naming.mentions(s.text).map((m) => m.id))];
    const dims = Object.keys(wave.subjects[naming.ids[0]].dimensions);
    // A dimension named as a markdown link ("[Empathy](/dimensions/empathy)") is matched on its text; the link target is not prose.
    const prose = s.text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
    const escRe = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const hits = dims.filter((d) => new RegExp(`\\b${d}\\b`).test(prose) || (dimensionNames[d] && new RegExp(`\\b${escRe(dimensionNames[d])}\\b`, "i").test(prose)));
    const everyModel = /\b(?:every|each) model\b|\ball (?:\w+ )?models\b/i.test(s.text);
    if (hits.length !== 1 || (!everyModel && named.length !== 1)) {
      // An empty name map makes every dimension named in words unverifiable: say so rather than blame the sentence.
      const hint = hits.length === 0 && Object.keys(dimensionNames).length === 0 ? " (no dimension display names were loaded: pass dimensionNames from readDimensionNames(), as build-model-reports does)" : "";
      err("R-lowest-claim", `a "lowest" claim must name exactly one dimension and either one model or "every model" so it can be checked: "${s.text.slice(0, 120)}"${hint}`, s.line);
      continue;
    }
    for (const id of everyModel ? naming.ids : named) {
      const means = wave.subjects[id].dimensions;
      if (means[hits[0]] !== Math.min(...Object.values(means))) err("R-lowest-claim", `"lowest" claim is false: ${hits[0]} is not ${id}'s lowest dimension mean`, s.line);
    }
    const count = s.text.match(/\bof the (\w+) dimensions\b/i);
    if (count && NUMBER_WORDS[count[1].toLowerCase()] !== undefined && NUMBER_WORDS[count[1].toLowerCase()] !== dims.length) err("R-claims-count", `"of the ${count[1]} dimensions" but the wave has ${dims.length}`, s.line);
  }
  // 10: never the original-answer stats
  // 13: no date
  for (const b of bySid("next-wave")) if (/\b\d{4}-\d{2}-\d{2}\b/.test(b.text)) err("R-next-wave-date", "section 13 carries no date (template B13)", b.firstLine);

  // ---- word count (template B: body incl. headings and captions; excl. tables, glossary) -------------
  const countable = blocks.filter((b) => b.kind !== "table" && !b.glossary);
  const wordCount = countWords(countable.map((b) => b.text).join("\n"));
  if (wordCount < WORD_MIN || wordCount > WORD_MAX) err("R-word-count", `${wordCount} words; the template allows ${WORD_MIN} to ${WORD_MAX}`, 0);
  const perSection = {};
  for (const b of countable) perSection[b.sid] = (perSection[b.sid] ?? 0) + countWords(b.text);

  // ---- output ---------------------------------------------------------------------------------------------
  // Offsets index into reportText(report): [front, preface, "## title\nbody"...] joined by "\n".
  const hLines = lines.filter((l) => l.kind === "heading" && l.level === 2);
  const frontText = front.map((i) => lines.find((l) => l.n === i + 1)?.out ?? "").filter(Boolean).join("\n");
  // Front-matter tokens enter the ledger like body tokens, at their offset in front_matter.join("\n").
  {
    let at = 0;
    for (const L of lines) {
      if (L.kind !== "front" || !L.out) continue;
      for (const t of L.toks) if (t.entry.kind === "fig") ledger.push({ ...t.entry, section: "front", location: `front_matter.${L.field ?? "unknown"}`, offset: at + t.start });
      at += L.out.length + 1;
    }
  }
  let pieceStart = frontText.length + 1;
  const region = (body, headerLen) => {
    const joined = body.map((l) => l.out).join("\n");
    const lead = joined.length - joined.trimStart().length;
    const md2 = joined.trim();
    let at = 0;
    for (const L of body) {
      for (const t of L.toks) if (t.entry.kind === "fig") ledger.push({ ...t.entry, section: L.sid, offset: pieceStart + headerLen + at + t.start - lead });
      at += L.out.length + 1;
    }
    return md2;
  };
  const preface = region(lines.filter((l) => l.kind !== "front" && l.section === -1), 0);
  pieceStart += preface.length + 1;
  const secOut = [];
  for (let i = 0; i < hLines.length; i++) {
    const body = lines.filter((l) => l.kind !== "front" && l.section === i && l !== hLines[i]);
    const header = `## ${hLines[i].title}\n`;
    const md2 = region(body, header.length);
    pieceStart += header.length + md2.length + 1;
    secOut.push({ id: secId(i), title: hLines[i].title, markdown: md2, html: renderHtml(md2) });
  }
  for (const L of lines) if (L.kind === "heading") for (const t of L.toks) if (t.entry.kind === "fig") ledger.push({ ...t.entry, section: L.sid, offset: -1 });
  for (const l of lits) ledger.push({ kind: "lit", token: null, path: null, rendered: l.text, source: l.source, line: l.line });

  const report = {
    schema: "model-report-1",
    run_id: wave.run_id,
    report_date: wave.report_date,
    status: wave.official ? "official" : "pilot",
    official: wave.official,
    comparability: wave.comparability,
    wave_source_sha256: wave.source_sha256,
    source_md_sha256: createHash("sha256").update(src).digest("hex"),
    word_count: wordCount,
    words_by_section: perSection,
    front_matter: frontText ? frontText.split("\n") : [],
    preface: { markdown: preface, html: renderHtml(preface) },
    sections: secOut,
    figure_ledger: ledger,
    lit_count: lits.length,
  };
  return { errors, report };
}

// ---------------------------------------------------------------------------
// Words and HTML
// ---------------------------------------------------------------------------

export function countWords(text) {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#|]/g, " ")
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function inline(s) {
  let t = esc(s);
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) => (/^(?:\/|#|https:\/\/|mailto:)/.test(url) ? `<a href="${url}">${text}</a>` : text));
  return t;
}

/** Small markdown renderer: headings (H3 and below), paragraphs, lists, tables. Deterministic. */
export function renderHtml(markdown) {
  const out = [];
  const lines = markdown.split("\n");
  let list = null;
  let table = [];
  const flushList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((r) => !/^[\s|:-]+$/.test(r));
    const cells = (r) => r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());
    out.push("<table>");
    rows.forEach((r, i) => out.push(`<tr>${cells(r).map((c) => `<${i === 0 ? "th" : "td"}>${inline(c)}</${i === 0 ? "th" : "td"}>`).join("")}</tr>`));
    out.push("</table>");
    table = [];
  };
  let para = [];
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
  for (const line of lines) {
    if (/^\s*\|/.test(line)) { flushPara(); flushList(); table.push(line); continue; }
    flushTable();
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    const ul = line.match(/^\s*[-*+]\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (h) { flushPara(); flushList(); const lv = Math.min(6, Math.max(h[1].length, 3)); out.push(`<h${lv}>${inline(h[2])}</h${lv}>`); }
    else if (ul || ol) { flushPara(); const tag = ul ? "ul" : "ol"; if (list !== tag) { flushList(); out.push(`<${tag}>`); list = tag; } out.push(`<li>${inline((ul ?? ol)[1])}</li>`); }
    else if (!line.trim()) { flushPara(); flushList(); }
    else { flushList(); para.push(line.trim()); }
  }
  flushPara(); flushList(); flushTable();
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// G1: verify a compiled report against its wave (catches hand-edited output)
// ---------------------------------------------------------------------------

/** The concatenated resolved text the ledger offsets refer to. */
export function reportText(report) {
  return [report.front_matter.join("\n"), report.preface.markdown, ...report.sections.map((s) => `## ${s.title}\n${s.markdown}`)].join("\n");
}

export function verifyCompiled(report, wave) {
  const problems = [];
  const naming = makeNaming(wave);
  if (report.wave_source_sha256 !== wave.source_sha256) problems.push("V-wave-sha: compiled report was built from a different wave file");
  if (report.run_id !== wave.run_id) problems.push("V-run-id: compiled run_id differs from the wave");
  let figures = 0;
  for (const e of report.figure_ledger) {
    if (e.kind !== "fig") continue;
    figures += 1;
    const r = resolvePath(wave, e.path);
    if (!r.ok) { problems.push(`V-unresolved: ${e.token}: ${r.error}`); continue; }
    const f = applyFormat(r.value, e.format ?? undefined, naming, r.canonical);
    if (!f.ok) problems.push(`V-format: ${e.token}: ${f.error}`);
    else if (f.text !== e.rendered) problems.push(`V-rendered: ${e.token} now resolves to "${f.text}" but the report says "${e.rendered}"`);
  }
  // Every section's html must be what its markdown renders to.
  for (const s of report.sections) if (renderHtml(s.markdown) !== s.html) problems.push(`V-html: section "${s.title}" html does not match its markdown (hand-edited?)`);
  if (renderHtml(report.preface.markdown) !== report.preface.html) problems.push("V-html: preface html does not match its markdown");
  // Digits in the compiled text must all be explained by the ledger or an allowed pattern.
  const text = reportText(report);
  for (const e of report.figure_ledger) {
    if (e.kind !== "fig" || e.offset < 0) continue;
    if (text.slice(e.offset, e.offset + e.rendered.length) !== e.rendered) problems.push(`V-offset: ${e.token} should read "${e.rendered}" at offset ${e.offset} but the compiled text there reads "${text.slice(e.offset, e.offset + e.rendered.length)}" (figure moved or swapped)`);
  }
  // Mask each figure at its own verified offset (never by value: a short figure such
  // as "1" would otherwise also hide a tampered "1" elsewhere).
  const chars = [...text];
  for (const e of report.figure_ledger) {
    if (e.kind !== "fig" || e.offset < 0) continue;
    for (let i = e.offset; i < e.offset + e.rendered.length && i < chars.length; i++) chars[i] = " ";
  }
  let masked = chars.join("");
  for (const e of report.figure_ledger) if ((e.kind === "lit" || e.offset < 0) && /\d/.test(e.rendered)) masked = masked.split(e.rendered).join(" ");
  masked = masked.split(wave.run_id).join(" ").replace(/\]\([^)]*\)/g, "]()")
    .replace(/^(#{1,6})\s+\d+[.)]\s+/gm, "$1 ").replace(/^(\s*)\d+[.)]\s+/gm, "$1- ")
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ").replace(/\b[A-Z]{2,4}-\d+(?:-[A-Z0-9]+)?\b/g, " ").replace(/\bD-\d+[a-z]?\b/g, " ");
  const m = masked.match(/\d[\d.,]*/);
  if (m) problems.push(`V-unexplained-digit: the compiled text contains "${m[0]}" that no ledger entry produced`);
  if (/\b\d{4}-\d{2}-\d{2}T\d{2}:/.test(JSON.stringify(report))) problems.push("V-timestamp: the compiled report carries a timestamp (non-deterministic output)");
  if (figures === 0) problems.push("V-empty: the ledger has no figures; a report with none was not compiled from a wave");
  return problems;
}
