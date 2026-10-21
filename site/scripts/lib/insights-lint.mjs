/**
 * insights-lint.mjs -- parse, compile and lint Insights posts (docs/DATA_MODEL_AI_MODEL_WATCH.md section 8).
 *
 * Pure (no I/O). `parsePostSource` reads a research/insights/<slug>.md string; `buildPost` compiles it to the committed
 * site/src/data/insights/<slug>.json shape; `lintPost` runs rules IL-1..IL-8 over a COMPILED post, so the same lint runs in
 * build-insights (fail closed, before anything is written) and in lint-insights.mjs (over the committed JSON, in Docker).
 *
 * Rule ids:
 *  IL-1 frontmatter (exact keys and order, ISO non-future date, audience enum, readingMinutes within 1 of ceil(words/230))
 *  IL-2 citations ([n] resolves; Sources numbered 1..N; every source cited; no duplicate URL)
 *  IL-3 Sources line regex, https URLs, dates of true precision (YYYY, YYYY-MM or YYYY-MM-DD) (and Corrections line shape)
 *  IL-4 every digit-bearing sentence has a [n] marker or a {{TOKEN}} (exemptions only from lint-allow.json; the same entries
 *       may exempt an IL-6 sentence)
 *  IL-5 no LEADERBOARD_TERMS within 60 characters of a model mention unless negated; no band name or endorsement language in a
 *       sentence that names a model
 *  IL-6 revenue / retention / efficacy claims need a citation
 *  IL-7 links only https:// or root-relative; no gumroad.com or /score-watch; no tokens in title/dek; dek has no figure
 *  IL-8 unknown {{TOKEN}}; compiled html equals a re-render of bodyMarkdown (drift); claim ledger equals its recomputation
 */

import { mdToHtml } from "./markdown-lite.mjs";
import { LEADERBOARD_TERMS } from "./model-report-html-gates.mjs";
import { BAND_NAMES, ENDORSE_RE, NEGATOR_RE } from "./model-report-template.mjs";
import { makeNaming } from "./model-report.mjs";

export const INSIGHT_TOKENS = [
  "SCORED_ENTITY_COUNT", "INDEX_COUNT", "DIMENSION_COUNT", "SUBDIMENSION_COUNT", "AI_LABS_COUNT", "CATALOG_MODEL_COUNT", "TASK_ITEM_COUNT",
];
export const AUDIENCES = ["ai-labs", "agent-builders", "both"];
export const FM_KEYS = ["title", "dek", "date", "audience", "tags", "readingMinutes"];
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SOURCE_LINE_RE = /^(\d+)\. (.+) — (.+), (\d{4}(?:-\d{2}(?:-\d{2})?)?)\. (https:\/\/\S+)$/;
export const CORRECTION_LINE_RE = /^- (\d{4}-\d{2}-\d{2}): (.+)$/;
export const CLAIM_RE = /\b(revenue|retention|churn|ROI|conversion|proven|reduces? (?:harm|risk))\b/i;
export const READING_WPM = 230;
export const MODEL_WINDOW_CHARS = 60;

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const isIso = (s) => typeof s === "string" && ISO.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;
/** A Sources date carries its true precision: YYYY, YYYY-MM or YYYY-MM-DD (never a guessed day). */
export const isSourceDate = (s) => typeof s === "string" && (/^\d{4}$/.test(s) || (/^\d{4}-(0[1-9]|1[0-2])$/.test(s)) || isIso(s));
const todayOf = (now) => now.toISOString().slice(0, 10);
const wordsOf = (s) => (String(s).trim().match(/\S+/g) ?? []).length;

/** A file is a post candidate only if its name is a slug and it opens with front matter; FACT_CHECK* files and others are skipped. */
export function isPostCandidate(filename, text) {
  if (!filename.endsWith(".md")) return false;
  if (/^FACT_CHECK/i.test(filename)) return false;
  if (!SLUG_RE.test(filename.slice(0, -3))) return false;
  return /^---\r?\n/.test(text);
}

// ---------------------------------------------------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------------------------------------------------

const unquote = (v) => (v.length >= 2 && ((v[0] === '"' && v.at(-1) === '"') || (v[0] === "'" && v.at(-1) === "'")) ? v.slice(1, -1) : v);

/** @returns {{errors:string[], fm:object|null, bodyMarkdown:string, sources:object[], corrections:object[]}} */
export function parsePostSource(md, slug) {
  const errors = [];
  const text = md.replace(/\r\n?/g, "\n");
  const bad = (rule, msg) => errors.push(`${rule}: ${msg}`);
  if (!SLUG_RE.test(slug)) bad("IL-1", `slug "${slug}" must match ${SLUG_RE}`);
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) { bad("IL-1", "missing front matter block"); return { errors, fm: null, bodyMarkdown: "", sources: [], corrections: [] }; }
  const lines = m[1].split("\n");
  const keys = lines.map((l) => l.slice(0, Math.max(0, l.indexOf(":"))));
  if (keys.join(",") !== FM_KEYS.join(",")) bad("IL-1", `front matter keys must be exactly ${FM_KEYS.join(", ")} in that order, one line each (got: ${keys.join(", ")})`);
  const raw = Object.fromEntries(lines.map((l) => { const i = l.indexOf(":"); return [l.slice(0, i), l.slice(i + 1).trim()]; }));
  const tagsM = (raw.tags ?? "").match(/^\[(.*)\]$/);
  const tags = tagsM ? tagsM[1].split(",").map((t) => t.trim()).filter(Boolean) : null;
  if (!tagsM) bad("IL-1", "tags must be written [a, b]");
  const fm = {
    title: unquote(raw.title ?? ""), dek: unquote(raw.dek ?? ""), date: raw.date ?? "", audience: raw.audience ?? "",
    tags: tags ?? [], readingMinutes: /^\d+$/.test(raw.readingMinutes ?? "") ? Number(raw.readingMinutes) : NaN,
  };
  const rest = text.slice(m[0].length);
  const restLines = rest.split("\n");
  const srcIdx = restLines.findIndex((l) => l.trim() === "## Sources");
  const corIdx = restLines.findIndex((l) => l.trim() === "## Corrections");
  if (srcIdx < 0) { bad("IL-2", "missing the ## Sources section"); return { errors, fm, bodyMarkdown: rest.trim(), sources: [], corrections: [] }; }
  if (corIdx >= 0 && corIdx < srcIdx) bad("IL-3", "## Corrections must come after ## Sources");
  const bodyMarkdown = restLines.slice(0, srcIdx).join("\n").trim();
  const srcEnd = corIdx > srcIdx ? corIdx : restLines.length;
  const sources = [];
  restLines.slice(srcIdx + 1, srcEnd).forEach((l) => {
    if (!l.trim()) return;
    const sm = l.trim().match(SOURCE_LINE_RE);
    if (!sm) { bad("IL-3", `Sources line does not match "N. Title — Publisher, YYYY[-MM[-DD]]. https://url": "${l.trim().slice(0, 100)}"`); return; }
    sources.push({ n: Number(sm[1]), title: sm[2], publisher: sm[3], date: sm[4], url: sm[5] });
  });
  const corrections = [];
  if (corIdx >= 0) {
    restLines.slice(corIdx + 1).forEach((l) => {
      if (!l.trim()) return;
      const cm = l.trim().match(CORRECTION_LINE_RE);
      if (!cm) { bad("IL-3", `Corrections line must be "- YYYY-MM-DD: text": "${l.trim().slice(0, 100)}"`); return; }
      corrections.push({ date: cm[1], text: cm[2] });
    });
  }
  return { errors, fm, bodyMarkdown, sources, corrections };
}

// ---------------------------------------------------------------------------------------------------------------------
// Render and claim ledger
// ---------------------------------------------------------------------------------------------------------------------

/** markdown-lite output with [n] -> superscript anchors; root-relative links open in the same tab. Tokens are left as {{X}}. */
export function renderPostHtml(bodyMarkdown) {
  const html = mdToHtml(bodyMarkdown, 0);
  return html
    .replace(/<a href="(\/[^"/][^"]*|\/)" target="_blank" rel="noopener noreferrer">/g, '<a href="$1">')
    .split(/(<[^>]+>)/)
    .map((part) => (part.startsWith("<") ? part : part.replace(/\[(\d+)\]/g, '<sup><a href="#src-$1" aria-label="Source $1">[$1]</a></sup>')))
    .join("");
}

const CITE_RE = /\[(\d+)\]/g;
const CITE_ONE = /\[\d+\]/;
const TOKEN_RE = /\{\{([A-Za-z0-9_]+)\}\}/g;

/** The prose lines of a body: fenced code dropped, markdown furniture removed, link URLs removed, table cells split. */
export function proseLines(bodyMarkdown) {
  const out = [];
  let fence = false;
  for (const raw of bodyMarkdown.replace(/\r\n?/g, "\n").split("\n")) {
    if (raw.startsWith("```")) { fence = !fence; continue; }
    if (fence) continue;
    let l = raw.trim();
    if (!l || /^(?:---+|\*\*\*+)$/.test(l)) continue;
    if (/^\|/.test(l)) {
      if (/^[\s|:-]+$/.test(l)) continue;
      out.push(...l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()).filter(Boolean));
      continue;
    }
    l = l.replace(/^#{1,6}\s+/, "").replace(/^>\s?/, "").replace(/^[-*+]\s+/, "").replace(/^\d+\.\s+/, "");
    l = l.replace(/\[([^\]]*)\]\(([^)]*)\)/g, "$1").replace(/\{\{[A-Za-z0-9_]+\}\}|[*_`]/g, (m) => (m.startsWith("{{") ? m : ""));
    if (l) out.push(l);
  }
  return out;
}

export function splitSentences(line) {
  const moved = line.replace(/([.!?])((?:\s*\[\d+\])+)/g, "$2$1");
  return moved.split(/(?<=[.!?])\s+(?=["“(\[{*_A-Z])/).map((s) => s.trim()).filter(Boolean);
}

export const sentencesOf = (bodyMarkdown) => proseLines(bodyMarkdown).flatMap(splitSentences);

const stripForDigits = (s) => s
  .replace(CITE_RE, " ").replace(TOKEN_RE, " ")
  .replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ").replace(/\bD-\d+[a-z]?\b/g, " ");

export function claimLedgerOf(bodyMarkdown) {
  const out = [];
  for (const s of sentencesOf(bodyMarkdown)) {
    const tokens = [...s.matchAll(TOKEN_RE)].map((m) => m[1]);
    if (!/\d/.test(s.replace(CITE_RE, "")) && tokens.length === 0) continue;
    out.push({
      sentence: s.replace(CITE_RE, "").replace(/\s+([.!?,;])/g, "$1").replace(/\s{2,}/g, " ").trim(),
      citations: [...new Set([...s.matchAll(CITE_RE)].map((m) => Number(m[1])))].sort((a, b) => a - b),
      tokens: [...new Set(tokens)],
    });
  }
  return out;
}

export function buildPost(slug, parsed, { generatedAt }) {
  const { fm, bodyMarkdown, sources, corrections } = parsed;
  return {
    slug, title: fm.title, dek: fm.dek, date: fm.date, audience: fm.audience, tags: fm.tags, readingMinutes: fm.readingMinutes,
    bodyMarkdown, html: renderPostHtml(bodyMarkdown), sources, claimLedger: claimLedgerOf(bodyMarkdown), corrections, generatedAt,
  };
}

export function buildInsightsManifest(posts) {
  return {
    posts: [...posts]
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? -1 : 1))
      .map((p) => ({
        slug: p.slug, title: p.title, dek: p.dek, date: p.date, audience: p.audience, tags: p.tags, readingMinutes: p.readingMinutes,
        lastCorrected: p.corrections.length ? p.corrections.map((c) => c.date).sort().at(-1) : null,
      })),
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Model mention matcher (IL-5)
// ---------------------------------------------------------------------------------------------------------------------

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Build `mentions(text) -> [{start,end}]` from catalog names/families (case-sensitive, 3+ chars) and every wave's makeNaming forms.
 * @param {{catalogRows?: {name:string,family:string|null}[], waves?: object[]}} src
 */
export function makeModelMatcher({ catalogRows = [], waves = [] } = {}) {
  const forms = new Set();
  for (const r of catalogRows) for (const f of [r.name, r.family]) if (typeof f === "string" && f.trim().length >= 3) forms.add(f.trim());
  const re = forms.size ? new RegExp(`(?<![A-Za-z0-9-])(?:${[...forms].sort((a, b) => b.length - a.length).map(escRe).join("|")})(?![A-Za-z0-9-])`, "g") : null;
  const namings = waves.map((w) => makeNaming(w));
  return {
    formCount: forms.size + namings.length,
    mentions(text) {
      const out = [];
      if (re) for (const m of text.matchAll(re)) out.push({ start: m.index, end: m.index + m[0].length });
      for (const n of namings) for (const m of n.mentions(text)) out.push({ start: m.start, end: m.end });
      return out;
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Lint a compiled post
// ---------------------------------------------------------------------------------------------------------------------

/**
 * @param {object} post   compiled post (site/src/data/insights/<slug>.json shape)
 * @param {{now?:Date, matcher?:{mentions:Function}, allow?:{slug:string,sentencePrefix:string,reason:string}[], sourcesUnparsed?:boolean}} ctx
 * @returns {string[]} failures, each starting with its rule id
 */
export function lintPost(post, ctx = {}) {
  const f = [];
  const now = ctx.now ?? new Date();
  const matcher = ctx.matcher ?? { mentions: () => [] };
  const allow = (ctx.allow ?? []).filter((a) => a.slug === post.slug);
  const at = (rule, msg) => { const m = `${rule}: ${post.slug}: ${msg}`; if (!f.includes(m)) f.push(m); };
  const skipCites = ctx.sourcesUnparsed === true; // the Sources block failed IL-3: do not cascade IL-2 noise from it
  const body = String(post.bodyMarkdown ?? "");

  // IL-1
  if (!SLUG_RE.test(post.slug ?? "")) at("IL-1", `slug must match ${SLUG_RE}`);
  if (!isIso(post.date)) at("IL-1", "date must be an ISO date");
  else if (post.date > todayOf(now)) at("IL-1", `date ${post.date} is in the future`);
  if (!AUDIENCES.includes(post.audience)) at("IL-1", `audience must be one of ${AUDIENCES.join(", ")} (a single value)`);
  if (!Array.isArray(post.tags) || post.tags.length === 0 || !post.tags.every((t) => SLUG_RE.test(t))) at("IL-1", "tags must be a non-empty list of kebab-case tags");
  if (typeof post.title !== "string" || !post.title.trim()) at("IL-1", "title is required");
  if (typeof post.dek !== "string" || !post.dek.trim()) at("IL-1", "dek is required");
  const expectMin = Math.ceil(wordsOf(body) / READING_WPM);
  if (!Number.isInteger(post.readingMinutes) || Math.abs(post.readingMinutes - expectMin) > 1) at("IL-1", `readingMinutes ${post.readingMinutes} is not within 1 of ceil(words/${READING_WPM}) = ${expectMin}`);

  // IL-2 / IL-3 sources
  const sources = Array.isArray(post.sources) ? post.sources : [];
  if (sources.length === 0 && !skipCites) at("IL-2", "a post needs at least one source");
  sources.forEach((s, i) => {
    if (s.n !== i + 1) at("IL-2", `Sources must be numbered 1..N contiguously (entry ${i + 1} is numbered ${s.n})`);
    if (typeof s.url !== "string" || !/^https:\/\/\S+$/.test(s.url)) at("IL-3", `source ${s.n}: url must be https`);
    if (!isSourceDate(s.date)) at("IL-3", `source ${s.n}: date must be YYYY, YYYY-MM or YYYY-MM-DD`);
    if (typeof s.title !== "string" || !s.title.trim() || s.title.includes(" — ")) at("IL-3", `source ${s.n}: title must be non-empty and must not contain " — "`);
    if (typeof s.publisher !== "string" || !s.publisher.trim()) at("IL-3", `source ${s.n}: publisher is required`);
  });
  const urls = sources.map((s) => s.url);
  if (new Set(urls).size !== urls.length) at("IL-2", "duplicate source URL");
  const cited = new Set();
  let inFence = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("```")) { inFence = !inFence; continue; }
    if (inFence) continue;
    for (const m of line.matchAll(CITE_RE)) {
      const n = Number(m[1]);
      cited.add(n);
      if (!skipCites && !sources.some((s) => s.n === n)) at("IL-2", `citation [${n}] does not resolve to a Sources entry`);
    }
  }
  for (const s of sources) if (!cited.has(s.n)) at("IL-2", `source ${s.n} is never cited`);
  (post.corrections ?? []).forEach((c, i, arr) => {
    if (!isIso(c?.date) || typeof c?.text !== "string" || !c.text.trim()) at("IL-3", `correction ${i + 1} must be {date (ISO), text}`);
    else if (i > 0 && c.date < arr[i - 1].date) at("IL-3", "corrections must be in ascending date order (append-only)");
  });

  // IL-4 / IL-5 / IL-6 per sentence
  const sentences = sentencesOf(body);
  for (const s of sentences) {
    const tokens = [...s.matchAll(TOKEN_RE)];
    const hasCite = CITE_ONE.test(s);
    if (/\d/.test(stripForDigits(s)) && !hasCite && tokens.length === 0) {
      const plain = s.replace(CITE_RE, "").trim();
      if (!allow.some((a) => plain.startsWith(a.sentencePrefix))) at("IL-4", `digit-bearing sentence has no [n] citation and no {{TOKEN}}: "${plain.slice(0, 110)}"`);
    }
    if (CLAIM_RE.test(s) && !hasCite && !allow.some((a) => s.startsWith(a.sentencePrefix))) at("IL-6", `efficacy/revenue/retention claim needs a citation: "${s.slice(0, 110)}"`);
    const ms = matcher.mentions(s);
    if (ms.length) {
      const negated = NEGATOR_RE.test(s);
      for (const m of ms) {
        const win = s.slice(Math.max(0, m.start - MODEL_WINDOW_CHARS), Math.min(s.length, m.end + MODEL_WINDOW_CHARS));
        if (LEADERBOARD_TERMS.test(win) && !negated) { at("IL-5", `ranking word within ${MODEL_WINDOW_CHARS} characters of "${s.slice(m.start, m.end)}": "${s.slice(0, 110)}"`); break; }
      }
      for (const b of BAND_NAMES) if (new RegExp(`\\b${b}\\b`).test(s)) at("IL-5", `band name "${b}" in a sentence that names a model: "${s.slice(0, 110)}"`);
      if (ENDORSE_RE.test(s)) at("IL-5", `endorsement language in a sentence that names a model: "${s.slice(0, 110)}"`);
    }
  }

  // IL-7 links, title/dek
  for (const m of body.matchAll(/\[([^\]]*)\]\(([^)]*)\)/g)) {
    const url = m[2].trim();
    const okLink = /^https:\/\/\S+$/.test(url) || (/^\/(?!\/)\S*$/.test(url));
    if (!okLink) at("IL-7", `link "${url.slice(0, 80)}" is neither https:// nor root-relative`);
    if (/gumroad\.com/i.test(url) || /^\/score-watch/.test(url)) at("IL-7", `link "${url.slice(0, 80)}" points to a paid product or the paused Score-Watch (CTAs are rendered by the page)`);
  }
  if (/\bhttp:\/\//i.test(body)) at("IL-7", "plain http:// URL in the body");
  if (/\bjavascript:/i.test(body)) at("IL-7", "javascript: URL in the body");
  for (const k of ["title", "dek"]) {
    if (/\{\{/.test(post[k] ?? "")) at("IL-7", `${k} must not contain a {{TOKEN}}`);
  }
  const dekPlain = stripForDigits(String(post.dek ?? ""));
  if (/\d/.test(dekPlain) && !allow.some((a) => String(post.dek).startsWith(a.sentencePrefix))) at("IL-7", `dek contains a figure (the dek cannot carry a citation or token): "${String(post.dek).slice(0, 100)}"`);

  // IL-8 tokens and drift
  for (const m of `${body}\n${post.title ?? ""}\n${post.dek ?? ""}`.matchAll(TOKEN_RE)) if (!INSIGHT_TOKENS.includes(m[1])) at("IL-8", `unknown token {{${m[1]}}}`);
  if (/\{\{(?![A-Za-z0-9_]+\}\})/.test(body)) at("IL-8", "malformed {{ token");
  // Defence in depth: after token substitution no brace pair may survive in the compiled html (a mangled token would print raw).
  if (/\{\{|\}\}/.test(String(post.html ?? "").replace(TOKEN_RE, "0"))) at("IL-8", "compiled html still contains {{ or }} after token substitution (a token was mangled by an inline rule)");
  if (post.html !== renderPostHtml(body)) at("IL-8", "compiled html differs from a re-render of bodyMarkdown (drift: rebuild the post)");
  if (JSON.stringify(post.claimLedger) !== JSON.stringify(claimLedgerOf(body))) at("IL-8", "claimLedger differs from its recomputation (drift: rebuild the post)");
  return f;
}

/** Allow-list shape check (reason is mandatory so an exemption is always explained). */
export function allowListProblems(allow) {
  if (!Array.isArray(allow)) return ["lint-allow.json must be an array of {slug, sentencePrefix, reason}"];
  return allow.flatMap((a, i) => (a && SLUG_RE.test(a.slug ?? "") && typeof a.sentencePrefix === "string" && a.sentencePrefix.length >= 12 && typeof a.reason === "string" && a.reason.trim().length >= 10
    ? [] : [`lint-allow.json[${i}] needs {slug, sentencePrefix (12+ chars), reason (10+ chars)}`]));
}

/** Manifest must list exactly the posts, newest first. */
export function manifestProblems(manifest, posts) {
  const f = [];
  if (!manifest || !Array.isArray(manifest.posts)) return ["IL-8: manifest.json must be {posts[]}"];
  const want = JSON.stringify(buildInsightsManifest(posts));
  if (JSON.stringify(manifest) !== want) f.push("IL-8: manifest.json differs from the one derived from the compiled posts (run build-insights)");
  return f;
}
