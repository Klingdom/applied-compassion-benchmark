/**
 * self-description-claims.mjs -- detection library for DC-25 (public copy misdescribes our own publications).
 *
 * Fact derived from data: decision D-29a lets unofficial pilot reports show a point estimate (pilot_composite) for a model
 * the pilot's test separated. When any non-null pilot_composite exists in site/public/data/model-waves/*.json, copy that says
 * pilot reports show only ranges / no composite / no point estimates is FALSE.
 *
 * EXEMPTIONS (minimal; a quotation or a correction record is a citation, not an assertion):
 *   1. Text inside a markdown "## Corrections" section (up to the next "## " heading or end of file).
 *   2. `corrections` entries in insights JSON (the key is skipped when walking strings).
 *   3. Text in straight or curly double quotes immediately following "said" / "first said".
 * Everything else is scanned. Nothing is allowlisted by line.
 */

/** Decode the entities JSX/HTML copy uses for quotes and apostrophes. Newlines are preserved (line numbers stay valid). */
export function decodeEntities(s) {
  return s
    .replace(/&apos;|&#x27;|&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&#34;|&#x22;|&ldquo;|&rdquo;/g, '"')
    .replace(/&nbsp;/g, " ");
}

const blank = (s) => s.replace(/[^\n]/g, " ");

/** Blank (keep length and newlines) the exempt regions of a text. */
export function stripExemptions(text, { markdown = false } = {}) {
  let t = text;
  if (markdown) {
    // Corrections section: heading line to the next "## " heading or end.
    t = t.replace(/^##[ \t]+Corrections[ \t]*\r?\n[\s\S]*?(?=^##[ \t]|(?![\s\S]))/gim, blank);
  }
  // A quotation introduced by "said" / "first said" is a citation.
  t = t.replace(/\bsaid\s*[:,]?\s*["“][^"“”]*["”]/gi, blank);
  return t;
}

/** Window (chars each side) in which "pilot" must appear for the "only ranges" family. */
const PILOT_WINDOW = 160;

export const PATTERNS = [
  { id: "ranges-rather-than", re: /ranges\s+rather\s+than\s+(?:single\s+)?(?:numbers|points|scores|point\s+estimates)/gi },
  { id: "no-composite-published", re: /\bno\s+(?:model\s+|pilot\s+)?composite\s+(?:is|was|has\s+been|gets)\s+(?:published|shown|reported)/gi },
  { id: "ranges-not-scores", re: /\branges,?\s+not\s+(?!official\b)scores\b/gi },
  { id: "only-ranges", re: /\b(?:only|just)\s+ranges\b|\branges\s+only\b/gi, needsPilot: true },
  { id: "no-point-estimates", re: /\bno\s+point\s+estimates?\b/gi },
];

/**
 * Find forbidden claims in one text. Returns [{id, line, snippet}].
 * @param {string} text raw text
 * @param {{markdown?: boolean}} opts markdown: honour the "## Corrections" exemption
 */
export function findClaims(text, opts = {}) {
  const t = stripExemptions(decodeEntities(String(text)), opts);
  const out = [];
  for (const { id, re, needsPilot } of PATTERNS) {
    re.lastIndex = 0;
    for (const m of t.matchAll(re)) {
      if (needsPilot) {
        const ctx = t.slice(Math.max(0, m.index - PILOT_WINDOW), m.index + m[0].length + PILOT_WINDOW);
        if (!/pilot/i.test(ctx)) continue;
        // "the secondary arm shows ranges only" is TRUE: point estimates are withheld by design for secondary-arm variants.
        if (/secondary/i.test(t.slice(Math.max(0, m.index - 120), m.index))) continue;
      }
      const line = t.slice(0, m.index).split("\n").length;
      out.push({ id, line, snippet: m[0].replace(/\s+/g, " ") });
    }
  }
  return out;
}

/** Walk parsed JSON; true when any `pilot_composite` key holds a non-null value (number or otherwise). */
export function hasPilotComposite(node) {
  if (Array.isArray(node)) return node.some(hasPilotComposite);
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k === "pilot_composite" && v !== null && v !== undefined) return true;
      if (hasPilotComposite(v)) return true;
    }
  }
  return false;
}

/** Collect string values of parsed JSON, skipping any `corrections` key. */
export function jsonStrings(node, out = []) {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) node.forEach((n) => jsonStrings(n, out));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) if (k !== "corrections") jsonStrings(v, out);
  }
  return out;
}

/**
 * Run the claim check over loaded sources.
 * @param {{path:string,text:string,markdown?:boolean}[]} sources
 * @param {boolean} compositeExists derived fact
 * @returns {{status:"APPLICABLE"|"N/A", findings:{path:string,id:string,line:number,snippet:string}[]}}
 */
export function checkSources(sources, compositeExists) {
  if (!compositeExists) return { status: "N/A", findings: [] };
  const findings = [];
  for (const s of sources) {
    for (const f of findClaims(s.text, { markdown: !!s.markdown })) findings.push({ path: s.path, ...f });
  }
  return { status: "APPLICABLE", findings };
}
