# Remediation spec — RISK-023: 20 Fortune 500 names published with HTML entities

Status: **PROPOSED — founder approval required** (AUTONOMY §1b: entity renames and slug changes). No data changed.
Author: coordinator, 2026-09-15. Evidence re-run on this date unless noted.

## 1. Defect

`site/src/data/indexes/fortune-500.json` stores 20 company names with HTML entities (`&amp;`, `&#x27;`). React renders
the string literally, so readers see them:

- Live `https://compassionbenchmark.com/company/procter-andamp-gamble` → 200, `<title>Procter &amp;amp; Gamble — Compassion Score 79.0 …` and the same in `<h1>` (browser displays "Procter &amp; Gamble").
- Live `/fortune-500` ranking shows "AT&amp;T", "Johnson &amp; Johnson", "Macy&#x27;s", "Procter &amp; Gamble".
- 143 built pages carry the encoded names (company peer lists, index page).
- Natural URLs fail: `/company/procter-gamble` and `/company/johnson-johnson` → 301 → `http://compassionbenchmark.com/404`.

**Origin:** initial migration from legacy HTML, commit `a60208d9` (2026-04-14). `extract-rankings.mjs` did not decode entities.

**Why the slugs split three ways:** `site/src/lib/slugify.ts` replaces `&` with `and` on the raw stored string
("Procter &amp; Gamble" → `procter-andamp-gamble`), while the export, entity-record and rotation scripts use a
different slugger (→ `procter-amp-gamble`). The two sluggers disagreeing is RISK-018.

## 2. Affected entities (exact, computed with the site's slugify)

| Rank | Stored name | Display name (decoded) | Current page slug (live) | Score file / record / rotation key | Clean page slug (decoded name, site slugify) |
|---:|---|---|---|---|---|
| 9 | Procter &amp;amp; Gamble | Procter & Gamble | procter-andamp-gamble | procter-amp-gamble | procter-and-gamble |
| 16 | Jack Henry &amp;amp; Associate | Jack Henry & Associate | jack-henry-andamp-associate | jack-henry-amp-associate | jack-henry-and-associate |
| 42 | Marsh &amp;amp; McLennan | Marsh & McLennan | marsh-andamp-mclennan | marsh-amp-mclennan | marsh-and-mclennan |
| 78 | Lowe&amp;#x27;s | Lowe's | loweand-x27-s | lowe-x27-s | lowes |
| 92 | Bath &amp;amp; Body Works | Bath & Body Works | bath-andamp-body-works | bath-amp-body-works | bath-and-body-works |
| 128 | Kohl&amp;#x27;s | Kohl's | kohland-x27-s | kohl-x27-s | kohls |
| 164 | Deere &amp;amp; Company | Deere & Company | deere-andamp-company | deere-amp-company | deere-and-company |
| 175 | Macy&amp;#x27;s | Macy's | macyand-x27-s | macy-x27-s | macys |
| 183 | AT&amp;amp;T | AT&T | atandamp-t | at-amp-t | atandt |
| 198 | Casey&amp;#x27;s General Stores | Casey's General Stores | caseyand-x27-s-general-stores | casey-x27-s-general-stores | caseys-general-stores |
| 213 | Dun &amp;amp; Bradstreet | Dun & Bradstreet | dun-andamp-bradstreet | dun-amp-bradstreet | dun-and-bradstreet |
| 225 | Helmerich &amp;amp; Payne | Helmerich & Payne | helmerich-andamp-payne | helmerich-amp-payne | helmerich-and-payne |
| 239 | Leggett &amp;amp; Platt | Leggett & Platt | leggett-andamp-platt | leggett-amp-platt | leggett-and-platt |
| 259 | Owens &amp;amp; Minor | Owens & Minor | owens-andamp-minor | owens-amp-minor | owens-and-minor |
| 261 | Park Hotels &amp;amp; Resorts | Park Hotels & Resorts | park-hotels-andamp-resorts | park-hotels-amp-resorts | park-hotels-and-resorts |
| 273 | S&amp;amp;T Bancorp | S&T Bancorp | sandamp-t-bancorp | s-amp-t-bancorp | sandt-bancorp |
| 313 | Johnson &amp;amp; Johnson | Johnson & Johnson | johnson-andamp-johnson | johnson-amp-johnson | johnson-and-johnson |
| 322 | Bally&amp;#x27;s Corporation | Bally's Corporation | ballyand-x27-s-corporation | bally-x27-s-corporation | ballys-corporation |
| 386 | W&amp;amp;T Offshore | W&T Offshore | wandamp-t-offshore | w-amp-t-offshore | wandt-offshore |
| 428 | Bed Bath &amp;amp; Beyond | Bed Bath & Beyond | bed-bath-andamp-beyond | bed-bath-amp-beyond | bed-bath-and-beyond |

(In the table, `&amp;amp;` / `&amp;#x27;` are how the stored strings `&amp;` / `&#x27;` must be written in Markdown.)

**Collision check (2026-09-15):** none of the 20 clean page slugs exists as a company page or score file, and no other
entity in any of the 8 indexes slugifies to the same value.

## 3. Proposed fix (RS-2b, founder-gated)

1. **Decode names at the source** — the 20 `name` values in `fortune-500.json`, the 20 `site/src/data/entity-records/*`
   files and the 20 `research/rotation-state.json` `name` fields. No composite, band, rank or dimension changes.
2. **One slug per entity, pinned.** Following the Georgia (`georgia-us-states`) and Phoenix (`phoenix-global-cities`)
   precedents, pin an explicit slug on each of the 20 rows so pages, score files, records and rotation keys agree,
   independent of which slugger runs. Default: the clean page slug in the table above.
   - **Founder choice:** three clean slugs follow the site slugger literally and read awkwardly — `atandt`,
     `sandt-bancorp`, `wandt-offshore`. Alternative pins: `at-and-t`, `s-and-t-bancorp`, `w-and-t-offshore`.
3. **Redirects (nginx, 301):** `/company/<current page slug>` → `/company/<pinned slug>` for all 20; also redirect the
   natural guesses that currently 404 (`/company/procter-gamble`, `/company/johnson-johnson`, …) where unambiguous.
   Data URLs: `/data/scores/<old key>.json` → new key (badge embeds and API consumers hold the old key).
4. **Rekey** `rotation-state.json` and entity-record filenames through the existing structural-merge tooling (D-08
   precedent), in one operation, with `test-entity-records.mjs` and `validate-rotation-state.mjs` run before and after.
5. **Do not edit published briefings** (AUTONOMY §1c). Past briefings keep whatever text they published.
6. **Gate (RS-2a, agent-doable):** `validate-indexes.mjs` fails on any `&[a-z#0-9]+;` sequence in a published name;
   the 20 current cases go on a dated waiver list that must only shrink. Proof: planted probe fails, removal passes.

## 4. Verification plan (V1–V7)

- V1 BEFORE: `/company/procter-andamp-gamble` title shows the entity; `/company/procter-gamble` → 301 `/404` (recorded above).
- V2/V4: after the change, `grep -c "&amp;amp;\|&amp;#x27;" site/out/**/*.html` → 0 for these names; `/fortune-500` shows "Procter & Gamble".
- V3: validator probe.
- V6: diff limited to the 20 rows, 20 records, 20 rotation entries, nginx redirects, validator.
- V7 AFTER on production: `/company/procter-and-gamble` 200 with title "Procter & Gamble"; `/company/procter-andamp-gamble` → 301 → new slug; `/data/scores/procter-amp-gamble.json` → 301 → new key.

## 5. Decision requested

- **Approve RS-2b** with default slugs, or with the three alternative pins (`at-and-t`, `s-and-t-bancorp`, `w-and-t-offshore`).
- RS-2a (validator) needs only the normal commit approval.
