/**
 * markdown-lite.mjs
 *
 * Minimal, dependency-free Markdown -> HTML renderer, extracted verbatim from
 * build-special-briefings.mjs (docs/ARCHITECTURE_AI_MODEL_WATCH.md decision A4) so
 * special briefings and Insights posts share ONE renderer.
 *
 * Behaviour is frozen: regenerated special briefings must be byte-identical
 * (acceptance for build item 1; test-markdown-lite.mjs pins a snapshot).
 *
 * Supported: ATX headings (h1-h4), paragraphs, bold, italic, inline code, links,
 * bullet and ordered lists, pipe tables, horizontal rules, blockquotes. Fenced
 * code blocks are DROPPED. All text is HTML-escaped first (escHtml).
 */

// Handles: ATX headings (h1–h4), paragraphs, **bold**, *italic*, bullet lists,
// ordered lists, pipe tables, horizontal rules, fenced code blocks, blockquotes.
// Does NOT require any external dependency.

/**
 * Escape HTML special characters to prevent XSS in rendered output.
 */
export function escHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Render inline markdown (bold, italic, inline code, links) to HTML.
 */
export function renderInline(text) {
  // Escape HTML first, then apply markdown inline rules.
  let s = escHtml(text);
  // Protect {{TOKEN}} spans from the inline rules (their underscores would otherwise pair as italics).
  const tokens = [];
  s = s.replace(/\{\{[^{}]*\}\}/g, (m) => { tokens.push(m); return `\uE000${tokens.length - 1}\uE000`; });
  // Bold: **text** or __text__
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  // Italic: *text* or _text_ (single, not double)
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(/(?<![_])_([^_]+)_(?![_])/g, "<em>$1</em>");
  // Inline code: `code`
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Links: [text](url) — for source URLs in the Sources section
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  if (tokens.length) s = s.replace(/\uE000(\d+)\uE000/g, (_, i) => tokens[Number(i)]);
  return s;
}

/**
 * Render a pipe table block (array of raw lines) to an HTML <table>.
 * We skip the separator row (---).
 */
export function renderTable(lines) {
  const rows = lines.filter((l) => !/^\|?[\s:|-]+\|/.test(l.replace(/\|---/g, "").replace(/---|:--/g, "")));
  // Actually: filter out the separator line which is all dashes/colons
  const dataRows = lines.filter((l) => {
    const stripped = l.replace(/^\|/, "").replace(/\|$/, "");
    return !/^[\s|:-]+$/.test(stripped);
  });

  const html = ["<div class='sb-table-wrap'><table>"];
  dataRows.forEach((line, i) => {
    const cells = line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());
    const tag = i === 0 ? "th" : "td";
    html.push(`<tr>${cells.map((c) => `<${tag}>${renderInline(c)}</${tag}>`).join("")}</tr>`);
  });
  html.push("</table></div>");
  return html.join("\n");
}

/**
 * Convert a block of markdown text to HTML.
 * Processes line-by-line with state tracking for lists and tables.
 *
 * @param {string} markdown - Raw markdown text
 * @param {number} headingOffset - Add this to h-level (so ## in a section body = h3 on the page)
 */
export function mdToHtml(markdown, headingOffset = 0) {
  const lines = markdown.split("\n");
  const out = [];
  let inUl = false;
  let inOl = false;
  let tableBuffer = [];
  let inTable = false;
  let inFence = false;
  let inBlockquote = false;
  let blockquoteLines = [];

  function flushUl() {
    if (inUl) { out.push("</ul>"); inUl = false; }
  }
  function flushOl() {
    if (inOl) { out.push("</ol>"); inOl = false; }
  }
  function flushList() { flushUl(); flushOl(); }
  function flushTable() {
    if (inTable && tableBuffer.length > 0) {
      out.push(renderTable(tableBuffer));
      tableBuffer = [];
      inTable = false;
    }
  }
  function flushBlockquote() {
    if (inBlockquote && blockquoteLines.length > 0) {
      out.push(`<blockquote>${blockquoteLines.map(l => `<p>${renderInline(l)}</p>`).join("\n")}</blockquote>`);
      blockquoteLines = [];
      inBlockquote = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced code blocks — pass through verbatim
    if (line.startsWith("```")) {
      flushList();
      flushTable();
      flushBlockquote();
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      // Skip code blocks in output (we don't need them for public briefings)
      continue;
    }

    // Horizontal rule
    if (/^---+\s*$/.test(line) || /^\*\*\*+\s*$/.test(line)) {
      flushList();
      flushTable();
      flushBlockquote();
      out.push("<hr>");
      continue;
    }

    // ATX Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (headingMatch) {
      flushList();
      flushTable();
      flushBlockquote();
      const level = Math.min(6, headingMatch[1].length + headingOffset);
      const text = headingMatch[2].trim();
      out.push(`<h${level}>${renderInline(text)}</h${level}>`);
      continue;
    }

    // Pipe table row
    if (/^\|/.test(line.trim())) {
      flushList();
      flushBlockquote();
      inTable = true;
      tableBuffer.push(line);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Blockquote
    if (line.startsWith("> ") || line === ">") {
      flushList();
      const content = line.replace(/^>\s?/, "");
      // Handle bold labels like "> **Title:**"
      if (!inBlockquote) inBlockquote = true;
      if (content.trim()) blockquoteLines.push(content);
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // Unordered list items: -, *, +
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
    if (ulMatch) {
      flushOl();
      if (!inUl) { out.push("<ul>"); inUl = true; }
      out.push(`<li>${renderInline(ulMatch[2])}</li>`);
      continue;
    }

    // Ordered list items: 1. 2. etc.
    const olMatch = line.match(/^\d+\.\s+(.*)/);
    if (olMatch) {
      flushUl();
      if (!inOl) { out.push("<ol>"); inOl = true; }
      out.push(`<li>${renderInline(olMatch[1])}</li>`);
      continue;
    }

    // Empty line — close lists, tables, blockquotes, etc.
    if (line.trim() === "") {
      flushList();
      flushTable();
      flushBlockquote();
      continue;
    }

    // Regular paragraph
    flushList();
    flushTable();
    flushBlockquote();
    out.push(`<p>${renderInline(line)}</p>`);
  }

  flushList();
  flushTable();
  flushBlockquote();

  return out.join("\n");
}
