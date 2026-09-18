/**
 * slug.mjs — the single source of truth for every slug-generation function
 * used by the Node build/research scripts.
 *
 * ── Why this file exists (RS-4a, 2026-09-17) ────────────────────────────────
 * Before this file, 12 different scripts each defined their own copy of a
 * "convert a name to a kebab-case slug" function. Two genuinely different
 * CONVENTIONS had accumulated across those copies:
 *
 *   - slugifyFolded()   — accents are folded (Côte -> Cote) before the rest
 *                          of the transform runs. This is the convention
 *                          `site/src/lib/slugify.ts` uses, and therefore the
 *                          convention every *page* on the site is served
 *                          under (e.g. the entity page for São Paulo is
 *                          `/city/sao-paulo`).
 *
 *   - slugifyUnfolded()  — accents are NOT folded first; an accented letter
 *                          simply falls outside `[a-z0-9]` and collapses
 *                          into the surrounding hyphen along with whatever
 *                          else is adjacent. This is the convention
 *                          `export-public-data.mjs`, `build-entity-records.mjs`,
 *                          and the other scripts below publish their JSON
 *                          output under today (e.g. São Paulo's real score
 *                          file is `/data/scores/s-o-paulo.json`).
 *
 * These two conventions DISAGREE for every published entity name that
 * contains a non-ASCII character (16 names today; see
 * `site/scripts/test-slug-conventions.mjs`'s golden table for the full
 * list). That disagreement is a KNOWN, LIVE DEFECT — RISK-018 / DC-05 — not
 * something introduced or fixed by this module. A data consumer who derives
 * a filename from the page slug (slugifyFolded) gets a 404 from the actual
 * data store (which is keyed by slugifyUnfolded). This module does not
 * change that: it only stops the two conventions from being copy-pasted
 * into new files by accident, and gives the divergence one place to be
 * measured from.
 *
 * Unifying the two conventions (folding the data stores, adding 301s, and
 * re-deriving every slug-keyed store per rule S9 — score files, entity
 * records, rotation-state keys, history, Worker KV) is the founder-gated
 * migration **RS-4b** (see IMPROVEMENT_BACKLOG.md). Do NOT attempt that here.
 *
 * ── Which stores use which convention ───────────────────────────────────────
 *   slugifyFolded (mirrors site/src/lib/slugify.ts):
 *     - site/src/lib/slugify.ts itself (the canonical definition; pages,
 *       entity registry, and RankingTable links all resolve through it).
 *       That file is NOT migrated to import from here — it is a TypeScript
 *       module consumed by the Next.js build/browser bundle, a different
 *       module graph from these Node-only scripts, and it is the ORIGINAL
 *       this file mirrors, not a duplicate of it. `slugifyFolded` below is
 *       kept byte-for-byte identical to it deliberately.
 *
 *   slugifyUnfolded (the naive convention; no accent folding):
 *     - site/scripts/apply-entity-record.mjs
 *     - site/scripts/apply-us-states.mjs
 *     - site/scripts/build-entity-records.mjs
 *     - site/scripts/export-public-data.mjs        (writes public/data/scores/*.json)
 *     - site/scripts/lib/lint-rules.mjs             (as `slugifySimple`)
 *     - site/scripts/lib/model-registry-validator.mjs (as `slugify`, wrapped —
 *       see the note on that file below; domain is model registry_id, not
 *       entity slugs, but the character-transform is identical)
 *     - site/scripts/test-collision-ratchet.mjs
 *     - site/scripts/test-entity-records.mjs
 *     - site/scripts/validate-indexes.mjs
 *     - research/scripts/reconcile-rotation-state.mjs
 *
 *   Both conventions, plus two more short-lived historical ones used only
 *   for RESOLVING old references (never for publishing new slugs):
 *     - site/scripts/build-entity-history.mjs        (as slugifyCurrent/slugifyNaive)
 *     - research/scripts/validate-rotation-state.mjs (as slugifyCurrent/slugifyNaive)
 *
 * ── Per-file differences preserved (documented, not silently unified) ──────
 *   - site/scripts/lib/model-registry-validator.mjs's `slugify(value)` also
 *     trims and null/undefined-coalesces its input (`String(value ?? "").trim()`)
 *     before calling `slugifyUnfolded`. That extra defensiveness matters
 *     there because `computeRegistryId()` calls it on optional fields
 *     (`entry?.developer`, etc.) that may be `undefined`. `slugifyUnfolded`
 *     itself is NOT made null-safe here, to avoid changing behaviour for
 *     every other caller that has always assumed a string; the wrapper
 *     lives in that file, not in this one.
 *   - site/scripts/generate-newsletter-html.mjs ALSO inlines a slug
 *     transform (twice) that is close to, but not the same as,
 *     `slugifyUnfolded`: it strips only a single leading/trailing hyphen
 *     (`/^-|-$/`) rather than a run of them (`/^-+|-+$/`). It is NOT one of
 *     the 12 files this module was extracted from (RS-4a's scope is fixed
 *     to those 12) and is deliberately left untouched here — refactoring it
 *     is out of scope for this iteration.
 *
 * All functions in this file are pure string transforms with no I/O.
 */

/** Strip combining diacritical marks after NFKD decomposition (Côte -> Cote). */
export function foldAccents(str) {
  return str.normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

/**
 * slugifyFolded — the PAGE/SITE convention. Exact mirror of
 * `site/src/lib/slugify.ts`'s `slugify()`: accents folded, `&` spelled as
 * "and", `'`/`.`/`,` dropped outright, everything else collapsed to `-`.
 *
 * This is what determines every entity page URL (e.g. `/city/sao-paulo`).
 */
export function slugifyFolded(name) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/'/g, "")
    .replace(/\./g, "")
    .replace(/,/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

/**
 * slugifyUnfolded — the DATA-STORE convention published by
 * export-public-data.mjs, build-entity-records.mjs, and the other scripts
 * listed above. No accent folding, no `&`/`'` special-casing — any run of
 * non-alphanumeric characters (including "&", "'", or an accented letter,
 * which falls outside `[a-z0-9]` once lower-cased without NFKD folding)
 * collapses to a single hyphen.
 *
 * This is what determines every generated `/data/scores/<slug>.json` file
 * today. It disagrees with `slugifyFolded` for every non-ASCII entity name
 * (e.g. "São Paulo" -> "s-o-paulo" here vs. "sao-paulo" there) — that
 * disagreement is RISK-018 / DC-05, tracked and ratcheted by
 * `site/scripts/test-slug-conventions.mjs`, and is NOT fixed by this module.
 */
export function slugifyUnfolded(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * slugifyNaiveFolded — accents folded first, but punctuation (e.g. an
 * apostrophe) is left for the naive rule to collapse into its OWN hyphen
 * rather than being dropped outright, e.g. "Côte d'Ivoire" ->
 * "cote-d-ivoire" (vs. slugifyFolded's "cote-divoire"). Used only to
 * recognize historical/alias slug forms when resolving old references
 * (build-entity-history.mjs, validate-rotation-state.mjs) — never to
 * publish a new slug.
 */
export function slugifyNaiveFolded(name) {
  return slugifyUnfolded(foldAccents(name));
}

/**
 * slugifyHtmlEncoded — the short-lived HTML-entity-encoded convention:
 * `&` spelled out as the word "amp", `'` spelled out as "x27" (e.g.
 * deere-amp-company, at-amp-t, bally-x27-s-corporation), each becoming its
 * own hyphen-delimited token. Used only to recognize historical/alias slug
 * forms when resolving old references — never to publish a new slug.
 */
export function slugifyHtmlEncoded(name) {
  const encoded = foldAccents(name).replace(/&/g, " amp ").replace(/'/g, " x27 ");
  return slugifyUnfolded(encoded);
}

/**
 * Some catalogue slugs are disambiguated by appending "-<index>" to avoid a
 * cross-index collision (e.g. georgia-us-states vs. georgia the country).
 * Strip that suffix to recover the bare alias a briefing might reference.
 */
export function indexSuffixStripped(slug, index) {
  if (!index) return null;
  const suffix = `-${index}`;
  if (slug.endsWith(suffix) && slug.length > suffix.length) {
    return slug.slice(0, -suffix.length);
  }
  return null;
}

/**
 * rowSlug — the "explicit slug always wins" rule shared by every index-row
 * consumer: an index row may declare its own `slug`, which takes precedence
 * over deriving one from `name`. Matches the `row.slug ?? slugify(row.name)`
 * pattern already used inline at each of this module's call sites (nullish
 * coalescing: an explicit empty-string slug is honoured as-is, matching
 * existing script behaviour — this is NOT the same edge case as
 * `site/src/lib/slugify.ts`'s `rowSlug()`, which additionally trims and
 * treats a blank string as absent; that stricter check is that file's own
 * behaviour and is left unchanged here).
 *
 * @param {{name: string, slug?: unknown}} row
 * @param {(name: string) => string} slugifyFn — slugifyFolded or slugifyUnfolded
 */
export function rowSlug(row, slugifyFn) {
  return row.slug ?? slugifyFn(row.name);
}
