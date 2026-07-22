/**
 * decodeHtmlEntities — display-layer decoder for HTML entities baked into
 * source data (e.g. "Procter &amp; Gamble", "Lowe&#x27;s").
 *
 * Background: ~20 fortune-500 entity names in `src/data/indexes/fortune-500.json`
 * carry literal HTML-escaped characters. There is no decode step upstream, so
 * without this utility the built `<title>`, meta description, and JSON-LD
 * `name`/`headline` fields all double-escape (e.g. "Procter &amp;amp; Gamble").
 *
 * HARD CONSTRAINT: this is a DISPLAY-ONLY transform. Never call this before
 * slug generation — every entity slug/URL/canonical path must stay derived
 * from the raw (pre-decode) name so already-indexed URLs never change. See
 * `src/data/entities.ts` (buildEntities) for where slug vs. display name are
 * deliberately decoupled.
 *
 * Deliberately dependency-free and DOM-free (no `document.createElement`)
 * so it behaves identically in Server Components at build time and in
 * Client Components in the browser — `document` is unavailable during
 * static export.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

const ENTITY_PATTERN = /&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g;

export function decodeHtmlEntities(input: string): string {
  if (!input || input.indexOf("&") === -1) return input;

  return input.replace(ENTITY_PATTERN, (match, entity: string) => {
    if (entity[0] === "#") {
      const isHex = entity[1] === "x" || entity[1] === "X";
      const code = isHex
        ? parseInt(entity.slice(2), 16)
        : parseInt(entity.slice(1), 10);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    const decoded = NAMED_ENTITIES[entity.toLowerCase()];
    return decoded ?? match;
  });
}
