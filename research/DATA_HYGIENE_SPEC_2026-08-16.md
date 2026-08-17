# Data Hygiene Spec — Index Name Defects

**Date:** 2026-08-16
**Status:** SPEC — not implemented. Requires founder approval (changes live URLs).
**Scope:** Three defect classes in `site/src/data/indexes/*.json`, all user-visible.

---

## Summary

An audit of all 8 published indexes found three name-level defect classes. All predate the
2026-08-16 score batch and are unrelated to the seed-placeholder problem.

| Class | Count | Severity | Blast radius |
|---|---:|---|---|
| A. Unescaped HTML entities | 20 | **HIGH** — corrupts URLs *and* pipeline entity identity | 20 URLs |
| B. Truncated names (22-char cut) | ~30 | MEDIUM — wrong name displayed, wrong URL | ~30 URLs |
| C. Duplicate entities | 3 pairs | MEDIUM — inflated counts, ambiguous to readers | Needs founder decision |

---

## Class A — Unescaped HTML entities (20 entities, fortune-500)

### Why this is not a display bug

`site/src/lib/slugify.ts` runs on the **raw** name string. It converts `&` → `and` *before*
stripping non-alphanumerics, so an unescaped `&amp;` becomes the literal token `andamp`:

```
"Johnson &amp; Johnson"
  .toLowerCase()                 -> "johnson &amp; johnson"
  .replace(/&/g, "and")          -> "johnson andamp; johnson"
  .replace(/[^a-z0-9]+/g, "-")   -> "johnson-andamp-johnson"
```

### Confirmed downstream contamination

This is already corrupting research-pipeline entity identity, not just the web layer.
`research/scans/2026-08-11.json` records a dropped candidate under the slug **`lowe-x27-s`** —
the scanner inherited the mangled slug as the entity's canonical identifier. Any cross-cycle
entity matching on these 20 companies is unreliable until this is fixed.

### The 20 affected entities

| Name as stored | Current (broken) URL | Correct URL |
|---|---|---|
| `Procter &amp; Gamble` | `/company/procter-andamp-gamble` | `/company/procter-and-gamble` |
| `Johnson &amp; Johnson` | `/company/johnson-andamp-johnson` | `/company/johnson-and-johnson` |
| `AT&amp;T` | `/company/atandamp-t` | `/company/atandt` |
| `Marsh &amp; McLennan` | `/company/marsh-andamp-mclennan` | `/company/marsh-and-mclennan` |
| `Deere &amp; Company` | `/company/deere-andamp-company` | `/company/deere-and-company` |
| `Bath &amp; Body Works` | `/company/bath-andamp-body-works` | `/company/bath-and-body-works` |
| `Bed Bath &amp; Beyond` | `/company/bed-bath-andamp-beyond` | `/company/bed-bath-and-beyond` |
| `Dun &amp; Bradstreet` | `/company/dun-andamp-bradstreet` | `/company/dun-and-bradstreet` |
| `Helmerich &amp; Payne` | `/company/helmerich-andamp-payne` | `/company/helmerich-and-payne` |
| `Leggett &amp; Platt` | `/company/leggett-andamp-platt` | `/company/leggett-and-platt` |
| `Owens &amp; Minor` | `/company/owens-andamp-minor` | `/company/owens-and-minor` |
| `Park Hotels &amp; Resorts` | `/company/park-hotels-andamp-resorts` | `/company/park-hotels-and-resorts` |
| `S&amp;T Bancorp` | `/company/sandamp-t-bancorp` | `/company/sandt-bancorp` |
| `W&amp;T Offshore` | `/company/wandamp-t-offshore` | `/company/wandt-offshore` |
| `Jack Henry &amp; Associate` | `/company/jack-henry-andamp-associate` | `/company/jack-henry-and-associate` |
| `Lowe&#x27;s` | `/company/loweand-x27-s` | `/company/lowes` |
| `Kohl&#x27;s` | `/company/kohland-x27-s` | `/company/kohls` |
| `Macy&#x27;s` | `/company/macyand-x27-s` | `/company/macys` |
| `Casey&#x27;s General Stores` | `/company/caseyand-x27-s-general-stores` | `/company/caseys-general-stores` |
| `Bally&#x27;s Corporation` | `/company/ballyand-x27-s-corporation` | `/company/ballys-corporation` |

Note `Jack Henry &amp; Associate` is **also** a Class-B truncation (should be `Associates`).
Fix both in one edit; the redirect below targets the entity-corrected form only — if the
truncation is fixed simultaneously, the target must become `/company/jack-henry-and-associates`.

### Implementation

1. In `site/src/data/indexes/fortune-500.json`, replace `&amp;` → `&` and `&#x27;` → `'` in
   the `name` field of the 20 entities above. **Do not** blanket-replace across the file —
   scope strictly to `name`.
2. Append the redirect block below to `nginx-ssl.conf`, immediately **before** the existing
   `rewrite ^/(.+)\.html$ /$1 permanent;` line (that rule is a catch-all and must stay last).
3. Rebuild and verify.

### Redirect block (paste-ready)

```nginx
    # Fortune-500 HTML-entity slug corrections (2026-08-16 data-hygiene fix)
    rewrite ^/company/procter-andamp-gamble$ /company/procter-and-gamble permanent;
    rewrite ^/company/jack-henry-andamp-associate$ /company/jack-henry-and-associate permanent;
    rewrite ^/company/marsh-andamp-mclennan$ /company/marsh-and-mclennan permanent;
    rewrite ^/company/loweand-x27-s$ /company/lowes permanent;
    rewrite ^/company/bath-andamp-body-works$ /company/bath-and-body-works permanent;
    rewrite ^/company/kohland-x27-s$ /company/kohls permanent;
    rewrite ^/company/deere-andamp-company$ /company/deere-and-company permanent;
    rewrite ^/company/macyand-x27-s$ /company/macys permanent;
    rewrite ^/company/atandamp-t$ /company/atandt permanent;
    rewrite ^/company/caseyand-x27-s-general-stores$ /company/caseys-general-stores permanent;
    rewrite ^/company/dun-andamp-bradstreet$ /company/dun-and-bradstreet permanent;
    rewrite ^/company/helmerich-andamp-payne$ /company/helmerich-and-payne permanent;
    rewrite ^/company/leggett-andamp-platt$ /company/leggett-and-platt permanent;
    rewrite ^/company/owens-andamp-minor$ /company/owens-and-minor permanent;
    rewrite ^/company/park-hotels-andamp-resorts$ /company/park-hotels-and-resorts permanent;
    rewrite ^/company/sandamp-t-bancorp$ /company/sandt-bancorp permanent;
    rewrite ^/company/johnson-andamp-johnson$ /company/johnson-and-johnson permanent;
    rewrite ^/company/ballyand-x27-s-corporation$ /company/ballys-corporation permanent;
    rewrite ^/company/wandamp-t-offshore$ /company/wandt-offshore permanent;
    rewrite ^/company/bed-bath-andamp-beyond$ /company/bed-bath-and-beyond permanent;
```

---

## Class B — Truncated names (~30 entities)

Names are cut at **22 characters** (one country at 24), the signature of a fixed-width field in
the legacy `site/scripts/extract-rankings.mjs` HTML extraction. Confirmed truncations:

**fortune-500:** Raymond James Financia(l) · Thermo Fisher Scientif(ic) · Frontier Communication(s) ·
Universal Health Servi(ces) · Universal Forest Produ(cts) · Community Health Syste(ms) ·
Fidelity National Fina(ncial) · Pioneer Natural Resour(ces) · Oil States Internation(al) ·
Watts Water Technologi(es) · Advanced Energy Indust(ries) · InterContinental Hotel(s Group) ·
Automatic Data Process(ing) · Jack Henry & Associate(s) · Installed Building Pro(ducts) ·
Packaging Corp of Amer(ica) · Rayonier Advanced Mate(rials) · Telephone and Data Sys(tems) ·
American Electric Powe(r) · Allegiance Transportat(ion) · Calumet Specialty Prod(ucts) ·
NexTier Oilfield Solut(ions) · Alliance Resource Part(ners) · American Outdoor Brand(s) ·
Breitburn Energy Partn(ers) · Magnum Hunter Resource(s) · Natural Resource Partn(ers) ·
Westinghouse Air Brake (Technologies)

**countries:** `Democratic Republic of C` → Democratic Republic of the Congo
**robotics-labs:** `Kepler Exploration Robot` → Kepler Exploration Robotics

### Notes

- The DRC truncation breaks **every name-based lookup** for "Congo" or "DRC". It also
  propagated into the research pipeline: the 2026-08-11 assessment was filed as
  `research/assessments/democratic-republic-of-c-2026-08-11.md`.
- Verify each against an authoritative source before correcting — a few 21–22 char names in the
  audit output are legitimately that length (Charter Communications, Archer Daniels Midland,
  Huntington Bancshares, Cabot Microelectronics, Sprouts Farmers Market, AvalonBay Communities,
  Benchmark Electronics, Basic Energy Services) and must NOT be "corrected."
- Each correction changes a URL and needs a matching redirect, same pattern as Class A.
- Fix the root cause in `extract-rankings.mjs` or the extraction is re-run risk.

---

## Class C — Duplicate entities (founder decision required)

| Index | Duplicate | Detail |
|---|---|---|
| fortune-500 | **ADP** (rank 36, 60.9) and **Automatic Data Process** (rank 38, 60.9) | Same company. Identical seed vector `{3.5,3.5,3.5,3,3.5,3.5,3.5,3.5}`. The published count of 448 is inflated by at least one. **Both sit in the 60.9 seed cluster flagged for de-seeding** — resolve the duplicate *before* assessing, or the work is done twice. |
| us-cities | **Portland** (rank 8, 57.8) and **Portland** (rank 22, 48.4) | Two different scores, no state qualifier. Presumably Portland OR and Portland ME. A reader cannot tell which is which. |
| us-cities | **Springfield** (rank 93, 35.9) and **Springfield** (rank 94, 35.9) | Both on the 35.9 seed. Presumably two of Springfield MA / IL / MO. |

**Decisions needed:**
1. ADP — merge to one record. Which name and which rank survives?
2. Portland / Springfield — disambiguate with state suffix (e.g. "Portland, OR"), or drop one?
   Note that adding a state suffix changes the slug and needs a redirect.

---

## Verification

After implementing any class:

```bash
node site/scripts/validate-indexes.mjs      # expect 0 errors
cd site && npm run build                    # expect exit 0
```

Then confirm redirects resolve on the deployed host:

```bash
curl -sI https://compassionbenchmark.com/company/johnson-andamp-johnson | head -3
# expect: HTTP/1.1 301, Location: /company/johnson-and-johnson
```

---

## Recommended sequence

1. **Class A** — highest harm, smallest blast radius, mechanically verifiable. Do first.
2. **Class C (ADP only)** — must precede the 60.9 Fortune-500 de-seeding study.
3. **Class B** — larger, needs per-name source verification.
4. **Root cause** — fix the fixed-width truncation in `extract-rankings.mjs` so a future
   re-extraction does not reintroduce Classes A and B.

## Out of scope

Score values, band assignments, ranks, and the seed-placeholder problem
(see `research/SAHEL_BAND_CALIBRATION_2026-08-13.md`). This spec is names and URLs only.
