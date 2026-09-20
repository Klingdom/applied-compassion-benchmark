/**
 * release-watch-parse.mjs — pure parsing of fetched source bytes into dated
 * candidate items, and a transparent rule for flagging which of those
 * candidates look like a model-release announcement.
 *
 * Extends release-watch-l1.mjs (`docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md`
 * §2.7 L1). Before this module existed, `release-watch-l1.mjs` could
 * enumerate the source registry, fetch each URL, and hash the bytes — but it
 * could not read them: its own header said so plainly ("does not parse
 * retrieved bytes"). This module is what closes that gap.
 *
 * ── What this module does ────────────────────────────────────────────────
 * `parseSourceBytes(text)` turns one fetched document into an array of raw
 * items — RSS 2.0, Atom, JSON Feed, or (as a conservative fallback) an
 * HTML listing of dated links. `extractCandidates(rawItems, sourceId)` then
 * applies the fail-closed rule: a raw item becomes a candidate ONLY if it
 * has a parseable published date, a non-empty title, AND a non-empty link.
 * Missing any one of the three drops the item into `dropped[]` with a named
 * reason instead of becoming a candidate — this module never guesses a
 * date, invents a title, or fabricates a link. `recognizeRelease(candidate)`
 * then applies a separate, transparent, inspectable rule for whether a
 * candidate *looks like* a release announcement, reporting a confidence —
 * it never drops a candidate and never promotes one; that judgement is
 * always left to the human reviewing `candidates[]` in the scan record.
 *
 * ── What this module deliberately does NOT do ────────────────────────────
 * No network I/O anywhere in this file. Every function here is pure: a
 * string (or a plain object) in, a plain object out. This is what makes the
 * whole thing testable offline against committed fixture files
 * (`research/scripts/fixtures/release-watch/`) with zero live requests.
 *
 * No XML library. This repo's "no new dependencies" rule means the RSS and
 * Atom parsers below are small, tolerant, regex-based extractors — NOT a
 * conformant XML parser. Their limits are documented at each function and
 * are deliberate: when a limit is hit, the affected item is either omitted
 * entirely or fails the date/title/link bar above and is dropped. A parser
 * that cannot extract a field never invents one.
 */

// ── Shared helpers ───────────────────────────────────────────────────────

/**
 * Decodes the handful of XML/HTML constructs this module's fixtures and
 * real-world feeds are expected to use: CDATA sections and the five
 * predefined XML entities. This is NOT a general HTML/XML entity decoder —
 * numeric character references (`&#8217;`) and named HTML entities beyond
 * the XML five (`&nbsp;`, `&mdash;`, …) pass through unchanged. That is an
 * accepted, explicit limitation: an undecoded entity in a title or snippet
 * is a cosmetic defect, never a fabricated fact, so it does not need to
 * block extraction.
 *
 * @param {string} s
 * @returns {string}
 */
function decodeXmlEntities(s) {
  if (typeof s !== "string") return "";
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'");
}

function stripTags(s) {
  return typeof s === "string" ? s.replace(/<[^>]+>/g, "") : "";
}

/**
 * @param {string} block
 * @param {string} tag
 * @returns {string|null} decoded, trimmed content, or null if the tag is
 *   absent or the extractor cannot confidently locate a close tag. Limit:
 *   matches the FIRST occurrence of `<tag ...>...</tag>` in `block` via a
 *   non-greedy regex — a second same-named tag later in the block, or a
 *   self-closing variant, is invisible to this function on purpose (use
 *   extractSelfClosingAttr for self-closing/attribute-bearing tags).
 */
function extractTagContent(block, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const m = re.exec(block);
  if (!m) return null;
  const decoded = decodeXmlEntities(m[1]).trim();
  return decoded === "" ? null : decoded;
}

/**
 * @param {string} block
 * @param {string} tag
 * @param {string} attr
 * @returns {string|null} Limit: matches the FIRST `<tag ... attr="…" …>`
 *   (self-closing or not) in `block`. Atom feeds commonly carry several
 *   `<link>` elements distinguished by `rel` (`alternate`, `self`, …); this
 *   function does not parse `rel` and simply returns the first href it
 *   finds. Documented, not silently wrong: a feed whose first `<link>` is
 *   not the alternate/article URL will produce a wrong-but-present link,
 *   which is an accepted limitation of a dependency-free extractor.
 */
function extractSelfClosingAttr(block, tag, attr) {
  const re = new RegExp(`<${tag}\\b[^>]*\\b${attr}\\s*=\\s*["']([^"']*)["'][^>]*/?>`, "i");
  const m = re.exec(block);
  if (!m) return null;
  const decoded = decodeXmlEntities(m[1]).trim();
  return decoded === "" ? null : decoded;
}

/**
 * @param {*} raw
 * @returns {string|null} an ISO-8601 datetime, or null if `raw` is not a
 *   string `Date.parse` can resolve. Never throws.
 */
function toIsoOrNull(raw) {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const t = Date.parse(raw.trim());
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString();
}

// ── Format detection ─────────────────────────────────────────────────────

/**
 * @param {string} text
 * @returns {"json-feed"|"atom"|"rss"|"html"|"unknown"|"empty"}
 */
export function detectFormat(text) {
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed) return "empty";
  if (trimmed[0] === "{" || trimmed[0] === "[") {
    let data;
    try {
      data = JSON.parse(trimmed);
    } catch {
      return "unknown"; // malformed JSON — fail closed, not a crash
    }
    if (typeof data?.version === "string" && data.version.includes("jsonfeed.org")) return "json-feed";
    return "unknown"; // valid JSON, but not a recognised JSON Feed envelope
  }
  if (/<feed[\s>]/i.test(trimmed) && /<entry\b/i.test(trimmed)) return "atom";
  if (/<rss[\s>]/i.test(trimmed) || (/<channel\b/i.test(trimmed) && /<item\b/i.test(trimmed))) return "rss";
  if (/<html[\s>]/i.test(trimmed) || /<a\b[^>]*\bhref\s*=/i.test(trimmed)) return "html";
  return "unknown";
}

// ── RSS 2.0 ───────────────────────────────────────────────────────────────

/**
 * Tolerant RSS 2.0 `<item>` extractor. NOT a conformant XML parser — see
 * the file header. Explicit limits: does not handle nested `<item>`
 * elements, XML namespace prefixes on the `item` tag itself, or an
 * `<item>` split across a CDATA boundary that itself contains the literal
 * string `</item>`. On any of those, the affected item is simply not
 * matched by the block regex and is silently absent from the result — not
 * a fabricated partial item.
 *
 * @param {string} text
 * @returns {Array<{title: string|null, link: string|null, publishedAtRaw: string|null, publishedAt: string|null, snippet: string}>}
 */
export function parseRss(text) {
  const items = [];
  const itemBlocks = text.match(/<item\b[^>]*>[\s\S]*?<\/item>/gi) || [];
  for (const block of itemBlocks) {
    const title = extractTagContent(block, "title");
    const link = extractTagContent(block, "link");
    const pubDateRaw = extractTagContent(block, "pubDate") || extractTagContent(block, "dc:date");
    const description = extractTagContent(block, "description");
    const publishedAt = toIsoOrNull(pubDateRaw);
    items.push({
      title,
      link,
      publishedAtRaw: pubDateRaw,
      publishedAt,
      snippet: (description || stripTags(block)).slice(0, 600),
    });
  }
  return items;
}

// ── Atom ──────────────────────────────────────────────────────────────────

/**
 * Tolerant Atom `<entry>` extractor. Same class of limits as parseRss.
 * Prefers `<published>`; falls back to `<updated>` when `<published>` is
 * absent, which is legal Atom (a feed may report only `updated`).
 *
 * @param {string} text
 * @returns {Array<{title: string|null, link: string|null, publishedAtRaw: string|null, publishedAt: string|null, snippet: string}>}
 */
export function parseAtom(text) {
  const items = [];
  const entryBlocks = text.match(/<entry\b[^>]*>[\s\S]*?<\/entry>/gi) || [];
  for (const block of entryBlocks) {
    const title = extractTagContent(block, "title");
    const link = extractSelfClosingAttr(block, "link", "href");
    const dateRaw = extractTagContent(block, "published") || extractTagContent(block, "updated");
    const summary = extractTagContent(block, "summary") || extractTagContent(block, "content");
    const publishedAt = toIsoOrNull(dateRaw);
    items.push({
      title,
      link,
      publishedAtRaw: dateRaw,
      publishedAt,
      snippet: (summary || stripTags(block)).slice(0, 600),
    });
  }
  return items;
}

// ── JSON Feed ─────────────────────────────────────────────────────────────

/**
 * JSON Feed 1.1 (https://www.jsonfeed.org/version/1.1/) item extractor.
 * Real JSON.parse — no hand-rolled JSON tolerance needed. `url` is
 * preferred as the link; `id` is used only as a fallback and only when it
 * is itself an `http(s)://` URL (JSON Feed's `id` is explicitly permitted
 * to be a non-URL opaque string, which this module will not treat as a
 * link).
 *
 * @param {string} text
 * @returns {Array<{title: string|null, link: string|null, publishedAtRaw: string|null, publishedAt: string|null, snippet: string}>}
 */
export function parseJsonFeed(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return []; // malformed JSON — fail closed, not a crash
  }
  const rawItems = Array.isArray(data?.items) ? data.items : [];
  return rawItems.map((it) => {
    const title = typeof it?.title === "string" && it.title.trim() ? it.title.trim() : null;
    const link = typeof it?.url === "string" && it.url.trim() ? it.url.trim() : typeof it?.id === "string" && /^https?:\/\//i.test(it.id) ? it.id.trim() : null;
    const dateRaw = typeof it?.date_published === "string" ? it.date_published : null;
    const publishedAt = toIsoOrNull(dateRaw);
    const body = typeof it?.content_text === "string" ? it.content_text : typeof it?.summary === "string" ? it.summary : typeof it?.content_html === "string" ? stripTags(it.content_html) : "";
    return { title, link, publishedAtRaw: dateRaw, publishedAt, snippet: (body || "").slice(0, 600) };
  });
}

// ── HTML listing (conservative fallback) ─────────────────────────────────

const ISO_DATE_RE = /\b(\d{4}-\d{2}-\d{2})\b/;
const MONTH_NAMES = "January|February|March|April|May|June|July|August|September|October|November|December";
const LONG_DATE_RE = new RegExp(`\\b((?:${MONTH_NAMES})\\s+\\d{1,2},?\\s+\\d{4})\\b`);
const ANCHOR_RE = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

/**
 * Conservative HTML-listing fallback for a provider with no feed at all.
 * Fails closed by design (task requirement, not an incidental property):
 * if this function cannot find a date, it yields NO candidate for that
 * link rather than guessing one.
 *
 * Explicit limits, all deliberate:
 *   1. A date and a link are paired ONLY when they appear on the SAME LINE
 *      of raw text. No DOM tree, no proximity search across lines, no
 *      awareness of a `<time>` element or a table row split across lines.
 *      A real page whose date sits in a sibling element on the next line
 *      is invisible to this fallback and correctly produces nothing — that
 *      is the fail-closed behaviour working as intended, not a defect to
 *      fix later with a smarter proximity heuristic (a heuristic is
 *      exactly the kind of guess this function must not make).
 *   2. Recognises exactly two date shapes: ISO-8601 `YYYY-MM-DD` and
 *      `Month D, YYYY` (English month names only).
 *   3. Does not resolve relative URLs (`href="/news/x"` is returned
 *      verbatim) and does not follow links.
 *   4. A line with more than one `<a>` tag pairs the SAME date with every
 *      anchor on that line — a listing that puts one date next to several
 *      links on one line will over-attribute; sources built this way
 *      should register a feed URL instead (§2.7's stated preference).
 *
 * @param {string} text
 * @returns {Array<{title: string|null, link: string|null, publishedAtRaw: string|null, publishedAt: string|null, snippet: string}>}
 */
export function parseHtmlListing(text) {
  const items = [];
  const lines = typeof text === "string" ? text.split(/\r?\n/) : [];
  for (const line of lines) {
    const dateMatch = ISO_DATE_RE.exec(line) || LONG_DATE_RE.exec(line);
    if (!dateMatch) continue; // no date on this line — no candidate, never a guess
    const publishedAt = toIsoOrNull(dateMatch[1]);
    if (!publishedAt) continue;
    ANCHOR_RE.lastIndex = 0;
    let anchorMatch;
    while ((anchorMatch = ANCHOR_RE.exec(line)) !== null) {
      const link = anchorMatch[1]?.trim() || null;
      const title = decodeXmlEntities(stripTags(anchorMatch[2])).trim() || null;
      items.push({
        title,
        link,
        publishedAtRaw: dateMatch[0],
        publishedAt,
        snippet: line.trim().slice(0, 600),
      });
    }
  }
  return items;
}

// ── Top-level dispatcher ─────────────────────────────────────────────────

/**
 * Turns one fetched document into raw dated items. Pure over a string;
 * never throws (a defensive outer catch degrades to zero items rather than
 * crashing a scan on a hostile or unexpected payload — every parser above
 * is already internally defensive, so this is a second, cheap backstop).
 *
 * @param {string} text
 * @returns {{format: string, items: Array<object>, parseError: string|null}}
 */
export function parseSourceBytes(text) {
  try {
    const format = detectFormat(text);
    let items = [];
    if (format === "json-feed") items = parseJsonFeed(text);
    else if (format === "atom") items = parseAtom(text);
    else if (format === "rss") items = parseRss(text);
    else if (format === "html") items = parseHtmlListing(text);
    // "empty" and "unknown" formats yield zero items — fail closed rather
    // than guessing at a structure this module does not recognise.
    return { format, items, parseError: null };
  } catch (err) {
    return { format: "unknown", items: [], parseError: err?.message ?? String(err) };
  }
}

// ── Candidate extraction — the fail-closed bar ───────────────────────────

/**
 * Applies the fail-closed rule (task requirement 2): a raw item becomes a
 * candidate only if it has ALL THREE of a parseable published date, a
 * non-empty title, and a non-empty link. The task text names date and
 * title explicitly ("No date ⇒ no candidate. No title ⇒ no candidate.");
 * this implementation adds link as a third, equally fail-closed condition,
 * because a candidate's link is what becomes its evidence `source_url`
 * downstream (`docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §2.3) — a
 * candidate CB cannot point a reader at is not evidence, it is an
 * assertion, and this module does not produce those.
 *
 * @param {Array<object>} rawItems
 * @param {string} sourceId
 * @returns {{candidates: Array<object>, dropped: Array<{source_id: string, reason: string, title: string|null, link: string|null, snippet: string|null}>}}
 */
export function extractCandidates(rawItems, sourceId) {
  const candidates = [];
  const dropped = [];
  for (const raw of Array.isArray(rawItems) ? rawItems : []) {
    const title = typeof raw?.title === "string" ? raw.title.trim() : "";
    const link = typeof raw?.link === "string" ? raw.link.trim() : "";
    const publishedAt = typeof raw?.publishedAt === "string" && raw.publishedAt.trim() ? raw.publishedAt : null;
    const snippet = typeof raw?.snippet === "string" ? raw.snippet : "";

    if (!publishedAt) {
      dropped.push({
        source_id: sourceId,
        reason: "no-date: no parseable published date was found for this item — fail closed, no candidate emitted (never guessed)",
        title: title || null,
        link: link || null,
        snippet: snippet || null,
      });
      continue;
    }
    if (!title) {
      dropped.push({
        source_id: sourceId,
        reason: "no-title: item has a date but no usable title — fail closed, no candidate emitted",
        title: null,
        link: link || null,
        snippet: snippet || null,
      });
      continue;
    }
    if (!link) {
      dropped.push({
        source_id: sourceId,
        reason: "no-link: item has a date and a title but no usable link — a candidate without a link cannot carry a source_url, so none is emitted",
        title,
        link: null,
        snippet: snippet || null,
      });
      continue;
    }

    candidates.push({ source_id: sourceId, title, link, published_at: publishedAt, snippet: snippet.slice(0, 600) });
  }
  return { candidates, dropped };
}

// ── Recognition rule (task requirement 3) ────────────────────────────────

/**
 * The documented keyword set. Each entry is an announcement/release verb
 * or phrase, English only, matched case-insensitively against the
 * candidate's title + snippet.
 */
export const ANNOUNCEMENT_KEYWORD_PATTERNS = [
  { label: "announcing", re: /\bannounc(?:ing|es|ed|ement)\b/i },
  { label: "introducing", re: /\bintroduc(?:ing|es|ed|tion)\b/i },
  { label: "release", re: /\breleas(?:e|es|ed|ing)\b/i },
  { label: "launch", re: /\blaunch(?:es|ed|ing)?\b/i },
  { label: "now available", re: /\bnow available\b/i },
  { label: "general availability", re: /\bgenerally available\b|\bgeneral availability\b/i },
  { label: "unveil", re: /\bunveil(?:s|ed|ing)?\b/i },
  { label: "debut", re: /\bdebut(?:s|ed|ing)?\b/i },
  { label: "ships", re: /\bships\b|\bshipping\b/i },
];

/**
 * The required version-or-name token: a short alphanumeric pattern meant
 * to catch model/version identifiers such as "4.7", "v2.1", "GPT-5",
 * "Claude 4.7", "2.5 Pro". Deliberately generic — it is a SIGNAL, not an
 * identity parser; `snapshot_label`/`snapshot_precision` in a promoted
 * release are set by a human, never derived from this regex.
 */
export const VERSION_OR_NAME_TOKEN_RE = /\b(?:v\d+(?:\.\d+){0,2}|[A-Za-z][A-Za-z-]{1,24}[ -]\d+(?:\.\d+){0,2}|\d+\.\d+(?:\.\d+)?)\b/;

/**
 * Deciding "this post announces a model release" is judgement, so this
 * function never drops a candidate and never promotes one — see the file
 * header. It reports, transparently, whether the documented rule fired and
 * why, so a human reviewing `candidates[]` can see both what matched and
 * what did not.
 *
 * Rule: `is_release_candidate` is true only when BOTH (a) at least one
 * announcement/release keyword matches AND (b) the version-or-name token
 * matches, in the candidate's title + snippet. `confidence` scales with
 * how many distinct keywords matched, capped at 0.9 — never 1.0, because
 * this rule is a heuristic filter for human review, not a determination.
 *
 * Known false-positive modes (documented per task requirement 3):
 *   - A keyword plus an unrelated numeric/named token, e.g. "we are
 *     launching our Q3 2026 roadmap" or "COVID-19 policy update ships
 *     today" — the rule cannot distinguish a model identifier from any
 *     other version-shaped or name+number token in the text.
 *   - A retrospective or comparison post that reuses release vocabulary
 *     ("looking back at how GPT-4 launched") reads as positive even though
 *     nothing new shipped in this post.
 *
 * Known false-negative modes:
 *   - An announcement using a verb outside the documented list ("is live
 *     today", "now shipping to everyone", "drops today") does not match
 *     any keyword and is scored `is_release_candidate: false` even though
 *     it may be a real release. It still appears in `candidates[]` — the
 *     rule only annotates, it never drops — so a human still sees it, just
 *     with a low/zero confidence.
 *   - A name with no digits at all ("Codename Meridian", "Claude Next")
 *     has no version-or-name token and is scored false for the same
 *     reason, for the same reason: it still reaches the human via
 *     `candidates[]`.
 *
 * @param {{title?: string, snippet?: string}} candidate
 * @returns {{isReleaseCandidate: boolean, confidence: number, matchedKeywords: string[], matchedVersionToken: string|null, reasons: string[]}}
 */
export function recognizeRelease(candidate) {
  const text = `${candidate?.title ?? ""} ${candidate?.snippet ?? ""}`;
  const matchedKeywords = ANNOUNCEMENT_KEYWORD_PATTERNS.filter((k) => k.re.test(text)).map((k) => k.label);
  const versionMatch = VERSION_OR_NAME_TOKEN_RE.exec(text);
  const matchedVersionToken = versionMatch ? versionMatch[0] : null;

  const reasons = [];
  if (matchedKeywords.length === 0) reasons.push("no announcement/release keyword matched (documented list in ANNOUNCEMENT_KEYWORD_PATTERNS)");
  if (!matchedVersionToken) reasons.push("no version-or-name token matched (VERSION_OR_NAME_TOKEN_RE)");

  const isReleaseCandidate = matchedKeywords.length > 0 && matchedVersionToken !== null;
  const confidence = isReleaseCandidate ? Math.min(0.9, 0.4 + 0.15 * matchedKeywords.length) : 0;

  if (isReleaseCandidate) reasons.push(`matched ${matchedKeywords.length} keyword(s) and a version-or-name token ("${matchedVersionToken}")`);

  return { isReleaseCandidate, confidence, matchedKeywords, matchedVersionToken, reasons };
}
