# Next Candidates — Technical / Data-Integrity Priorities

**Date:** 2026-09-01
**Author:** system-architect
**Scope:** architecture and data-integrity only. No product scope, no editorial, no methodology.
**Constraint honoured:** no index, rotation-state, change-proposal, assessment, agent spec, or
`site/src/data/updates/**` file was modified. Nothing was committed. This document is the only
file written.

---

## 0. Method and honesty note

**No command was executed in producing this document.** No shell was available in this session, so
every finding below is derived from reading files, not from running a script. Where a figure comes
from another document rather than from a file I read directly, it is marked **[reported]**. Where a
value was derived by hand-tracing code rather than executing it, it is marked **[traced]**.

File counts come from filename globs against the working tree:

| Measurement | Value | How obtained |
|---|---|---|
| `research/change-proposals/*.json` (top level) | **713** | glob `research/change-proposals/*.json` |
| …of which dated `slug-YYYY-MM-DD.json` | **606** | glob `research/change-proposals/*-[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9].json` |
| …of which undated `slug.json` | **107** | 713 − 606 |
| Files containing `"status": "pending"` | **26** | content grep, recursive — **16 top-level + 10 under `history/`** |
| Files whose `proposed_subdimensions` is not an array | **2** (`mali.json`, `niger.json`) | content grep `"proposed_subdimensions"\s*:\s*["{]` |
| `rotation-state.json` `entity_count` | **1331** | `research/rotation-state.json:3` |
| Published names carrying raw HTML entities | **20** (all in `fortune-500.json`) | content grep `&amp;\|&#x27;` |

**Verification of the brief's list.** All ten claimed defects were checked. Nine confirmed, one
partially corrected:

| Claim in brief | Status |
|---|---|
| Proposal schema drift, twice repaired, no validator | **Confirmed and worse than stated** — see C1. Two proposals still carry the broken shape *and were applied anyway*. |
| 606 dated / 107 undated filenames | **Confirmed exactly.** |
| Slug collision produced 26 orphans; class not prevented | **Confirmed, and the class is live right now** — see C2. |
| `rotation-state.json` ignored-but-tracked | **Confirmed** (`.gitignore:4-7`). Deliberately unresolved per `DISASTER-RECOVERY.md:54-58`. Not in top 5 — see §7. |
| `score-updater.md` §2a maps 7 of 8 indexes | **Confirmed** (`.claude/agents/score-updater.md:32-38`; no `universities` line). Not in top 5 — see §7. |
| Entity-count drift 1,155 vs 1,331 | **Confirmed** (`overnight-scanner.md:3,10,19,20,63,71,156,185,246,270,299,307,311` vs `rotation-state.json:3`). **Lower severity than stated** — see §7. |
| No gate detects a retracted source | **Confirmed** — see C5. **One correction:** the cycle did not "nearly publish" the death report; the assessor caught it and filed `recommendation: "confirm"`. The gap is that nothing *systemic* caught it. |
| No gate asserts the pending-queue count | **Confirmed** — see C3. No `validate-proposals.mjs` / `validate-pending-queue.mjs` exists in `research/scripts/` or `site/scripts/`. |
| Band boundary at 60.9 undocumented | **Confirmed and materially cheaper to fix than assumed** — see C4. The correct string already exists in-repo. |
| Five agents use `summary:`; `data-engineer.md` duplicated | **Not re-verified in this pass.** [reported] from `AGENT-ROUTING.md:206,208`. Not in top 5 — see §7. |

**Two defects the brief did not name, both now in the top 5:** the silent-reconstruction fallback in
`apply-entity-record.mjs` (C1) and 20 published entity names carrying raw HTML entities (C2).

---

## 1. C1 — The proposal contract is unenforced, and the apply path degrades silently instead of refusing

**Type:** data-integrity gate (fail-closed contract)

### The defect, with evidence

`site/scripts/apply-entity-record.mjs:366-374`:

```js
const proposedSubdims = proposal.proposed_subdimensions;
const hasProposedSubdims = Array.isArray(proposedSubdims) && proposedSubdims.length > 0;

if (!hasProposedSubdims) {
  console.log(
    "[apply-entity-record] No proposed_subdimensions in proposal — " +
    "falling back to full reconstruction from index dimension scores (backward-compatible)."
  );
}
```

`Array.isArray` returns false for **both** "field absent" (the intended backward-compatible case)
and "field present but the wrong shape" (schema drift). The two are treated identically, and the
signal is `console.log`, not an error. The script then writes all 40 subdimensions as
`subdims_source: "reconstructed"`, `confidence: "low"`, `assessed_date: null`, `evidence: []`
(`apply-entity-record.mjs:468-485`), and reports **`G1: PASS / G2: PASS / G3: PASS`**
(`:685-691`) — because G1/G2/G3 only test arithmetic invariance, which reconstruction satisfies
trivially by construction (`:500-503`, comment: *"Five equal values: mean is exact"*).

**This has already happened, twice, in published records:**

| Entity | Proposal shape | Proposal status | Sidecar on disk | Entity record written |
|---|---|---|---|---|
| Niger | nested map, `change-proposals/niger.json:40` | `"applied"`, `:291` | `research/assessments/niger-2026-08-13.subdims.json` exists | `site/src/data/entity-records/niger.json` — `subdims_source: "reconstructed"` on every subdimension (`:30,40,50,60,70,80,90,100,110,120,130,…`) |
| Mali | nested map, `change-proposals/mali.json:40` | `"applied"`, `:273` | `research/assessments/mali-2026-08-13.subdims.json` exists | `site/src/data/entity-records/mali.json` — **zero** occurrences of `"subdims_source": "assessed"` |

Both entities have real, dated, per-subdimension evidence sitting on disk in a sidecar. Both had
that evidence **silently discarded at apply time** and replaced with a flat reconstruction that
asserts `confidence: "low"` and `assessed_date: null` for all 40 rows. Nothing failed. Nothing
warned. `validate-indexes.mjs` passes, because the arithmetic is consistent.

`research/scripts/normalise-proposal-schema.mjs:42-65` documents two distinct non-conforming shapes
already seen (nested map; string filepath) and repairs them — but only for a hardcoded 14-slug
`TARGETS` allowlist (`:48-65`), which does **not** include `mali` or `niger`. The repair script is
per-incident. There is no validator.

**Confirmed absent:** no `validate-proposals.mjs` in `research/scripts/` (22 files) or
`site/scripts/` (27 files). `npm run build` gates on `validate-indexes` + the two briefing checks
only (`site/package.json:8`).

### Failure mode if unfixed

A third proposal shape appears. It is applied. The composite and band are correct, so every
existing gate passes. The entity record — the artefact that carries the benchmark's evidence, its
per-subdimension quotes, its URLs and its assessment dates — is silently replaced by a flat
reconstruction. The benchmark's central claim is that a score is traceable to evidence; the apply
path can destroy that traceability while reporting three green checks. This is *exactly* the
`INCIDENTS.md:22` **High** severity definition: "internal data integrity compromised in a way that
would eventually cause a Critical incident if undetected."

### Proposed fix

1. **New `research/scripts/validate-proposals.mjs`** — a read-only schema gate over
   `research/change-proposals/*.json`, asserting, per file:
   - required fields present: `entity`, `slug`, `index`, `assessment_date`, `assessment_file`,
     `published_scores{composite,band,rank,dimensions{8}}`, `proposed_scores{composite,band,dimensions{8}}`,
     `recommendation`, `status`;
   - `index` ∈ the 8 keys of `INDEX_FILE_MAP` (`apply-entity-record.mjs:181-190`);
   - `status` ∈ the 7 values in `research/DATA_MODEL.md:147`;
   - **`proposed_subdimensions`, if the key is present at all, is an array** — a nested map, a
     string, `null` or `{}` is a hard FAIL, never a fallback;
   - if it is an array, every entry has `code` ∈ the 40 canonical codes, `score` in `[1.0,5.0]`
     or exactly `0`, and per-dimension completeness (5 or 0 entries, never 1–4);
   - `round(mean(subdims_k),2) == proposed_scores.dimensions[k]` for every fully-populated
     dimension — the same G2 arithmetic as `apply-entity-record.mjs:427-431`, applied *before*
     the index is touched rather than after.
2. **Make `apply-entity-record.mjs` fail closed.** Replace the single `hasProposedSubdims` boolean
   with a three-way discrimination at `:366-374`:
   - key absent → reconstruct (unchanged, documented backward compatibility);
   - key present and a non-empty array → current assessed path;
   - **key present and any other shape → `bail()`**, naming the observed type and pointing at
     `normalise-proposal-schema.mjs`.
3. **Backfill Mali and Niger** by re-running the normaliser against their existing sidecars and
   re-writing their two entity records. *No score changes* — the dimension means and composites are
   already correct; this restores evidence, confidence and dates only. This is an entity-record
   write and therefore requires founder approval under `AUTONOMY.md:50-51`.

**Effort:** **S–M** (~250-line validator; a ~15-line change in `apply-entity-record.mjs`; two record
backfills).
**Risk:** **Low.** The validator is read-only. The refusal is fail-closed — its worst case is
blocking an apply that would otherwise have silently degraded. The backfill is bounded to two
entities and changes no published number.

**Score:** Impact 5 · Strategic 5 · Learning 4 · Confidence 5 · Effort 2 · Risk 1 → **16**

---

## 2. C2 — Two incompatible slug algorithms across five implementations; the page layer and the data layer disagree for 20 published entities

**Type:** identity / contract unification

### The defect, with evidence

There are **five** slug implementations in this repository, running **two different algorithms**:

| # | File:line | Algorithm |
|---|---|---|
| 1 | `site/src/lib/slugify.ts:14-26` | NFKD normalise → strip diacritics → `&`→`"and"` → strip `'`, `.`, `,` → collapse |
| 2 | `site/scripts/export-public-data.mjs:66-71` | lowercase → collapse `[^a-z0-9]+` → trim |
| 3 | `site/scripts/build-entity-records.mjs:273-278` | same as #2 (comment `:269`: *"Exact mirror of the slugify function in export-public-data.mjs"*) |
| 4 | `site/scripts/apply-entity-record.mjs:195-200` | same as #2 |
| 5 | `site/scripts/validate-indexes.mjs:137` | same as #2 (comment `:135`) |

Implementation #1 governs **page URLs** (`entities.ts:25` imports it; `entities.ts:251-254` uses it
for `rowSlug`). Implementations #2–#5 govern **entity records, the public score catalog, the badge
endpoint, and the validator**. They are not equivalent.

The `entities.ts:249-250` comment records the last time this bit:

> *"When it was honoured only there, 26 entities ended up with an entity record at the declared slug
> and a page at slugify(name) — the record and the page were different URLs, so anything resolving
> by declared slug 404'd, including /data/scores/&lt;slug&gt;.json and the badge Worker that reads it."*

That fix honoured an explicit `slug` field in both places. It did **not** reconcile the two
algorithms, so the class is live. [26-entity figure is comment-attested, not re-derived.]

**Live instance, fully verified.** `site/src/data/indexes/fortune-500.json:5698` publishes the name
literally as `"Johnson &amp; Johnson"` — an un-decoded HTML entity — with no explicit `slug` field
(row read in full, `:5695-5712`). Therefore:

- **Data layer** (`export-public-data.mjs`): `site/public/data/index.json:2824` → `"slug": "johnson-amp-johnson"`. The badge file is `/data/scores/johnson-amp-johnson.json`. The entity record is `site/src/data/entity-records/johnson-amp-johnson.json` (confirmed present).
- **Page layer** (`slugify.ts`): `&`→`"and"` fires *before* the collapse, so `"Johnson &amp; Johnson"` → `johnson-andamp-johnson`. The page is `/company/johnson-andamp-johnson`. **[traced]** — derived by reading `slugify.ts:14-26`, not by running the build.

The badge slug and the page slug are different strings for the same row. This is precisely the
failure the `entities.ts` comment says was fixed.

**Twenty published names are affected**, all in `fortune-500.json`: Procter &amp; Gamble `:226`,
Jack Henry &amp; Associate `:352`, Marsh &amp; McLennan `:820`, Lowe&#x27;s `:1468`, Bath &amp; Body
Works `:1720`, Kohl&#x27;s `:2368`, Deere &amp; Company `:3016`, Macy&#x27;s `:3214`, AT&amp;T
`:3358`, Casey&#x27;s General Stores `:3628`, Dun &amp; Bradstreet `:3898`, Helmerich &amp; Payne
`:4114`, Leggett &amp; Platt `:4366`, Owens &amp; Minor `:4726`, Park Hotels &amp; Resorts `:4762`,
S&amp;T Bancorp `:4978`, Johnson &amp; Johnson `:5698`, Bally&#x27;s Corporation `:5860`, W&amp;T
Offshore `:7012`, Bed Bath &amp; Beyond `:7768`.

**These names are also rendered raw on the public site.** No component decodes entity names — a grep
for `dangerouslySetInnerHTML|decodeEntit` across `site/src/components` returns only JSON-LD blocks
(`BreadcrumbJsonLd.tsx:44`, `renderEntityPage.tsx:445`, `DatasetJsonLd.tsx:94`, `FaqJsonLd.tsx:42`,
`DefinedTermSetJsonLd.tsx:58,62`) and hand-written copy. A React text node renders `&amp;`
literally. Under `INCIDENTS.md:21` this is the **Critical** definition: "publicly visible wrong
data." `site/public/data/index.json` carries 51 occurrences of `amp`/`x27` across names and slugs.

**The research corpus has already fragmented on this.** Johnson & Johnson exists under **four**
distinct slugs:

- `research/change-proposals/johnson-and-johnson.json` and `research/assessments/johnson-and-johnson.md` — algorithm #1
- `research/assessments/johnson-johnson-2026-05-21.md`, `johnson-johnson-2026-07-22.md`, `johnson-johnson-2026-07-22.subdims.json` — a third, decoded-then-naive form
- `research/assessments/johnson-amp-johnson-2026-05-29.md`, `johnson-amp-johnson-2026-07-28.md`, `johnson-amp-johnson-2026-07-28.subdims.json` — algorithm #2 over the raw entity
- the entity record at `johnson-amp-johnson.json`

`validate-rotation-state.mjs:140-155` resolves reports by `<slug>-<date>.md` against a single slug.
An entity whose history is split across four slugs cannot be resolved, cannot be reconciled by
`reconcile-last-assessed.mjs:57-62` (which keys `newest[slug]` off the filename), and cannot have a
coherent `last_assessed`. This is a plausible contributor to the standing 24 blocking failures
[reported, `OBSERVABILITY.md:21`].

**Nothing tests for this.** `site/scripts/test-entity-href.mjs` exists to guard the entity-URL layer
but exercises only kind→route/index mapping (`:60-97`) with hand-written literal slugs. It never
derives a slug from a real index row, so it cannot detect algorithm divergence. It is in `npm test`
(`package.json:20-21`) and passes.

### Failure mode if unfixed

Every new entity whose name contains `&`, `'`, `.`, `,` or a diacritic is published at one URL and
badged at another. Its assessment history fragments across slugs, silently, and the fragments become
invisible to the rotation validator — meaning its staleness baseline is wrong and it drifts out of
the scan rotation. Meanwhile 20 companies are named wrongly, in public, on a site whose product is
accuracy about named institutions. `São Tomé and Príncipe` (already a known duplicate,
`RISKS.md:16`) is the same defect in the countries index.

### Proposed fix

1. **One slug function, one file.** Promote `site/src/lib/slugify.ts` to the single canonical
   implementation and add a `.mjs` sibling (or a tiny shared module both can import) so scripts
   #2–#5 delete their local copies. Node 24 is already pinned in CI (`INCIDENTS.md:210-213`), so a
   direct `.ts` import from a script is proven to work — `test-entity-href.mjs:33` does it today.
2. **Do not silently re-slug.** Changing 20 slugs would 404 20 live pages, 20 badge endpoints and 20
   entity records. Instead, **pin the current data-layer slug explicitly** by adding
   `"slug": "johnson-amp-johnson"` (etc.) to those 20 index rows, which both layers already honour
   (`entities.ts:251-254`, `export-public-data.mjs:130`). URLs are then frozen and correct by
   construction, and unification becomes behaviour-neutral. **This is an index write and requires
   founder approval** (`AUTONOMY.md:50`).
3. **Then decode the names.** With slugs pinned, `"Johnson &amp; Johnson"` → `"Johnson & Johnson"`
   changes only the display string, not any URL. Separate, reviewable change.
4. **Add the guard that makes the class impossible.** A new check in `validate-indexes.mjs`: for
   every row, assert `slugifyCanonical(name) === rowSlug(row)`, i.e. every row whose canonical slug
   differs from its resolved slug must carry an explicit `slug` field. And a new `npm test` case
   that derives slugs from real index rows via both entry points and asserts equality.
5. **Backlog, separately:** a slug-alias map for the research corpus so the four Johnson & Johnson
   histories resolve to one entity. Do *not* rename assessment files — `last_assessed` points at
   filenames.

**Effort:** **M.** One shared module, five call-site deletions, 20 index-row pins, 20 name decodes,
two new assertions.
**Risk:** **Medium.** Touches published index files (founder approval required). Mitigated entirely
by the pin-then-decode sequencing above — step 2 changes no rendered output and no URL; step 3
changes only display text.

**Score:** Impact 5 · Strategic 5 · Learning 5 · Confidence 5 · Effort 3 · Risk 3 → **14**

---

## 3. C3 — The change-proposal queue has no canonical identity, and three resolvers disagree about where a proposal lives

**Type:** contract + observability gate

### The defect, with evidence

**The spec says undated. The corpus is 85% dated. The resolvers split.**

- `.claude/agents/overnight-assessor.md:123` — *"Write a change proposal to
  `research/change-proposals/{entity-slug}.json`"* — **undated**. Line `:136` likewise writes
  `assessment_file` as `research/assessments/entity-slug.md`, undated, while `:265` requires the
  assessment itself at `{entity-slug}-{YYYY-MM-DD}.md`. The spec contradicts itself within one file.
- **606 of 713** proposals are dated; **107** are undated.
- `research/scripts/validate-rotation-state.mjs:157-163` resolves `last_change_proposal` against
  exactly three shapes:

  ```js
  const exactName = `${slug}-${claimedDate}.json`;
  if (proposalFiles.has(exactName)) return true;
  if (proposalHistoryFiles.has(exactName)) return true;
  if (proposalHistoryFiles.has(`${slug}.json`)) return true; // legacy undated proposal
  ```

  The undated **top-level** form — `research/change-proposals/<slug>.json`, which is what the
  assessor spec instructs and what 107 files use — **is not checked**. Every such entity emits a
  false "no matching file" warning (`:256-259`). It is a WARN, not a FAIL (`:255`), so the
  `last_change_proposal` pointer is effectively unvalidated for 15% of the corpus.
- `.claude/agents/overnight-digest.md:197` names
  `research/change-proposals/<slug>-<date>.json` as one of two **ground-truth sources** for its
  "AUTHORITATIVE SOURCE … (non-negotiable — anti-misread rule)" at `:195`. That path does not exist
  for any of the 107 undated proposals — a population that includes **every one of the 16 top-level
  entity-record holds** (`interpublic-group.json`, `rethink-robotics.json`, `figure-ai.json`,
  `1x-technologies.json`, `halodi-robotics.json`, `picasso-labs-machina.json`,
  `harmonic-bionics.json`, `diligent-robotics.json`, `rewalk-robotics.json`,
  `sarcos-technology.json`, `bionik-laboratories.json`, `cyberdyne.json`, `sanctuary-ai.json`, …).
  The digest's own anti-misread rule cannot resolve the exact class of proposal it most matters for.

**The queue count is genuinely ambiguous, not merely unasserted.** `"status": "pending"` appears in
**26** files: 16 at the top level and **10 under `research/change-proposals/history/`**, all dated
`2026-04-22` (`history/anthropic-2026-04-22.json`, `history/amazon-2026-04-22.json`,
`history/ibm-2026-04-22.json`, `history/palantir-ai-2026-04-22.json`,
`history/new-zealand-2026-04-22.json`, `history/norway-2026-04-22.json`,
`history/interpublic-group-2026-04-22.json`, `history/macy-x27-s-2026-04-22.json`,
`history/deere-amp-company-2026-04-22.json`, `history/democratic-republic-of-c-2026-04-22.json`).
`AGENT-ROUTING.md:44` says queue totals are *"counted from `research/change-proposals/*.json`,
never incremented"* — but a recursive count returns 26 and a top-level count returns 16, and no
artefact states which is correct. INC-005's remediation item 3 (`INCIDENTS.md:88-91`) — *"Proposed,
not yet built: a queue-count assertion in the validation gate"* — is still not built; confirmed by
enumerating both script directories.

Note also that three of those history filenames (`macy-x27-s`, `deere-amp-company`,
`democratic-republic-of-c`) are direct artefacts of C2's naive slugger and of a name truncation.

### Failure mode if unfixed

INC-005 recurs by construction: the review surface (`PENDING_CHANGES.md`) and the directory can
disagree with no gate between them, and a reviewer working from either can be wrong by tens of
proposals. The `last_change_proposal` field in rotation-state — one of the two fields the assessor
exclusively owns (`AUTONOMY.md:219`) — is unverified for 15% of entities and generates noise
warnings that train operators to ignore the validator's output. The digest's ground-truth lookup
fails silently on precisely the entity-record hold class where "is this applied?" is most
consequential.

### Proposed fix

Do **not** mass-rename the 107 files — renaming breaks `last_change_proposal` pointers and
`APPLIED_CHANGES.md` links. Teach the system the rule instead:

1. **Declare the canonical form** in `research/DATA_MODEL.md` §3 (currently `:86` shows the undated
   form) and in `overnight-assessor.md:123`: new proposals are
   `research/change-proposals/<slug>-<YYYY-MM-DD>.json`. Undated files are a documented legacy shape,
   accepted on read, never written.
2. **Add a fourth branch to `resolveChangeProposal`** (`validate-rotation-state.mjs:157-163`):
   `if (proposalFiles.has(`${slug}.json`)) return true;` — emitting a WARN tagged `legacy-undated`,
   mirroring the pattern already used for assessments at `:203-209`. This is a five-line change that
   removes ~107 false warnings.
3. **Fix `overnight-digest.md:197`** to resolve by `<slug>-*.json` newest-first with an
   `<slug>.json` fallback, rather than a single literal path.
4. **Extend `validate-proposals.mjs` (from C1)** with a queue-count assertion: count top-level
   `*.json` with `status: "pending"`, count `history/` separately, print both, and FAIL if the most
   recent stated total in `PENDING_CHANGES.md` disagrees with the top-level count. This closes
   INC-005 remediation item 3 with no new script.
5. **Decide and record** whether `history/` snapshots may carry a live `status`. Recommendation:
   rewrite nothing, but have the validator FAIL on `history/**` files with `status: "pending"` so
   the directory can never again produce two defensible answers. (History rewrite is a proposal
   write and needs founder approval; the *gate* does not.)

**Effort:** **S–M.** One resolver branch, two spec corrections, one assertion bolted onto C1's
validator.
**Risk:** **Low–Medium.** No file is renamed and no proposal content is edited. The one live risk is
that the count assertion fails loudly on day one — which is the point, and is why it should ship
report-only for one cycle before becoming blocking.

**Score:** Impact 4 · Strategic 4 · Learning 4 · Confidence 5 · Effort 2 · Risk 2 → **13**

---

## 4. C4 — Seven of eight index files publish a band-range definition that contradicts the band the code assigns

**Type:** published-contract correction + derived-value gate

### The defect, with evidence

`site/scripts/lib/scoring.mjs:42-48` is the canonical band assignment:

```js
export function getBand(score) {
  if (score <= 20) return "Critical";
  if (score <= 40) return "Developing";
  if (score <= 60) return "Functional";
  if (score <= 80) return "Established";
  return "Exemplary";
}
```

A composite of **60.9** fails `score <= 60` and passes `score <= 80` → **Established**. Correct and
deterministic.

But the *published* range strings say otherwise. `scoring.mjs:30-36` declares
`Established: "61-80"`, `Functional: "41-60"` — 60.1 through 60.9 belong to neither. And that
string is shipped in the index JSON that the site renders and the public data API serves:

| File | Established | Functional |
|---|---|---|
| `fortune-500.json` | `:55` `"61-80"` | `:61` `"41-60"` |
| `countries.json` | `:56` | `:63` |
| `ai-labs.json` | `:28` | `:34` |
| `robotics-labs.json` | `:28` | `:34` |
| `global-cities.json` | `:28` | `:34` |
| `us-cities.json` | `:28` | `:34` |
| `universities.json` | `:56` | `:63` |
| **`us-states.json`** | **`:28` `"60.1-80"`** | **`:34` `"40.1-60"`** |

**`us-states.json` is already correct.** The unambiguous string exists in the repository, in
production data, in one of the eight files. Seven files simply never got it.

**And the validator was written to accept both.** `site/scripts/validate-indexes.mjs:57-61`:

```js
{ name: "Established", range: "60.1-80",  legacyRange: "61-80",  min: 60, max: 80 },
{ name: "Functional",  range: "40.1-60",  legacyRange: "41-60",  min: 40, max: 60 },
```

and `:610`:

```js
const match = VALID_BANDS.find((vb) => vb.name === band.name && (vb.range === band.range || vb.legacyRange === band.range));
```

The gate explicitly tolerates the ambiguous label. The comment at `:47` records *"CORRECTED
2026-07-19"* — the correct boundary has been known for six weeks; the propagation stalled at one
file out of eight, and the validator's `legacyRange` escape hatch is what let it stall silently.

This is the substance of `RISKS.md:19` (RISK-006), which frames it as an undocumented methodology
decision requiring a founder call. **That framing overstates the cost.** No score, band assignment,
rank or composite changes. `getBand` already resolves 60.9 → Established, and `us-states.json`
already publishes the matching definition. This is a display-string correction that makes seven
files agree with the eighth and with the code.

Roughly 30 entities sit at 60.9 [reported, `RISKS.md:19`; not re-derived here], and
`SEED_INVENTORY_2026-08-20.md` §6 makes fixing this the **first** step before de-seeding the 60.9
clusters [reported].

### Failure mode if unfixed

Seven index pages publish a band legend under which ~30 of their own entities' band labels are
undefined. A reader checking an Established-band company at 60.9 against the site's own published
definition finds it belongs to no band. Worse, per `RISKS.md:19` this value carries the highest
concentration of un-de-seeded Established-band placeholders — so an ambiguous public definition is
currently propping up a real published claim, and the de-seeding programme is blocked behind it.

### Proposed fix

1. Correct `bands[].range` in the seven files to `"80.1-100" / "60.1-80" / "40.1-60" / "20.1-40" /
   "0-20"`, matching `us-states.json:22,28,34,40,46` verbatim. **Index write — founder approval
   required** (`AUTONOMY.md:50`). No `composite`, `band`, `rank` or `scores` value is touched.
2. Correct `BAND_RANGES` in `site/scripts/lib/scoring.mjs:30-36` and its mirror in
   `site/src/lib/scoring.ts` (the drift gate `npm run test:scoring` covers both, per
   `scoring.mjs:12-14`).
3. **Retire the escape hatch.** Delete `legacyRange` from `validate-indexes.mjs:57-61` and the
   `|| vb.legacyRange === band.range` clause at `:610`, so a legacy string is an ERROR. Better
   still, **derive** the range string from `getBand`'s own thresholds rather than hand-writing it,
   so the two can never disagree again — that is the class fix.
4. Record the boundary once in the methodology documentation.

**Effort:** **S.** Seven two-line JSON edits, two constant blocks, one validator simplification.
**Risk:** **Low.** No computed value changes. The one real risk is step 3 landing before step 1,
which would fail the build for seven files — sequence 1→2→3 in a single change.

**Score:** Impact 3 · Strategic 4 · Learning 3 · Confidence 5 · Effort 1 · Risk 1 → **13**

---

## 5. C5 — Nothing detects a source that was correct when read and retracted afterwards

**Type:** new gate for a named, confirmed failure class

### The defect, with evidence

`research/assessments/peru-2026-08-26.md:39` carries a frontmatter field that exists nowhere else in
the pipeline:

```yaml
scanner_trigger_retracted: true
```

The assessment states the failure class in its own words at `:65`:

> *"The scanner is not at fault for reporting it. Both of its cited sources (Manila Times/AFP,
> Mongabay) carried the killing at the time of the scan, and both were date-verified. The correction
> emerged after publication. This is recorded as an **evidence-lifecycle** failure, not a
> date-verification failure — **a category the current gate does not catch, because a source can be
> correctly dated and still be later retracted.**"*

The underlying event: the scanner surfaced the reported killing of Ashéninka leader Américo Pascual
Tumisha. He is alive (`:198`). Five Peruvian outlets published the correction on 2026-08-26 (`:199`),
and the Rainforest Foundation Norway article reporting the killing **now returns HTTP 404** (`:60`).

`research/scripts/validate-scan.mjs` checks source presence (`:294-311`), URL well-formedness
(`:306-311`) and recency inside the 14-day window (`:313-318`). It never checks whether a source is
still live or still says what it said. Nothing in the repository reads `scanner_trigger_retracted` —
a grep for it returns 7 files, all narrative (the assessment, two digests, `PENDING_CHANGES.md`, and
three generated update payloads). It is a note, not a gate.

**One correction to the brief:** the cycle did not "nearly publish" the death report. The assessor
caught it, refused to score it (`:64`, *"must not propagate"*), and filed
`recommendation: "confirm"` at +0.3 with no change proposal (`:194`). The system worked — through an
assessor's judgment on one entity, on one night. Nothing structural would have caught it, and
nothing would catch the next one.

**Confidence caveat:** this is a single confirmed instance. The failure class is real and
self-documented; its *frequency* is unknown.

### Failure mode if unfixed

A retracted, corrected or withdrawn source drives a score movement onto the public site. Given
`RISKS.md:20` (RISK-007 — reputational and legal exposure from scored judgments about named, real
institutions), and given that the specific near-miss was a false report of a named individual's
death, this is the highest-severity *publishable* error class the pipeline can produce. Every
existing gate would pass: the source was real, correctly dated, correctly quoted and correctly
attributed at read time.

### Proposed fix

Deliberately narrow — a network-dependent gate must not be able to block a cycle on a paywall.

1. **Record liveness at read time.** Extend the assessor's `evidence[]` schema
   (`overnight-assessor.md:162-167`) with `checked_at` and `http_status`, populated when the URL is
   fetched. Cheap, and it makes retraction detectable retrospectively even without a live probe.
2. **Re-check only what drives a change.** Before a proposal is filed under either §3f trigger
   (`overnight-assessor.md:125-126` — delta ≥ 5pt or any band crossing), re-request each URL in
   `evidence[]` whose quote supports a changed dimension. Not every source; only the load-bearing ones.
   - `404`/`410` on a load-bearing source → **hard FAIL**, no proposal filed, entity re-queued with
     `evidence_lifecycle_hold`.
   - `403`/`429`/timeout → **WARN** only, recorded in the proposal. A bot-block is not a retraction,
     and must never block a legitimate cycle.
3. **Add a corroboration rule for single-source severe claims.** Where a single source carries a
   severe factual claim about a named individual or a death, require two independent live sources
   before the claim may move a score. Peru's own record shows the correction arriving via five
   independent outlets (`:199`); the rule is derivable directly from the incident.
4. **Promote `scanner_trigger_retracted` from prose to schema** — a first-class assessment field,
   surfaced in the assessor summary (`overnight-assessor.md:286-299`) and counted in the digest, so
   this class is measurable rather than anecdotal.

**Effort:** **M.** Schema additions are trivial; the re-check needs rate limiting, caching and
careful status-code handling.
**Risk:** **Medium.** A live-fetch gate introduces a network dependency into a previously
file-deterministic pipeline. Mitigated by hard-failing only on `404`/`410` (an unambiguous signal),
by scoping to load-bearing sources only, and by shipping report-only for one cycle first.

**Score:** Impact 4 · Strategic 5 · Learning 5 · Confidence 4 · Effort 3 · Risk 3 → **12**

---

## 6. Ranked table

Score = Impact + Strategic + Learning + Confidence − Effort − Risk (each 1–5).

| # | Candidate | Type | I | S | L | C | E | R | **Score** | Effort | Risk |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **1** | **C1 — Proposal contract validator + fail-closed apply** | Data-integrity gate | 5 | 5 | 4 | 5 | 2 | 1 | **16** | S–M | Low |
| **2** | **C2 — One slug function; pin 20 slugs, decode 20 names** | Identity contract | 5 | 5 | 5 | 5 | 3 | 3 | **14** | M | Medium |
| **3** | **C3 — Canonical proposal identity + queue-count gate** | Contract + observability | 4 | 4 | 4 | 5 | 2 | 2 | **13** | S–M | Low–Med |
| **4** | **C4 — Band-range labels derived, `legacyRange` retired** | Published contract | 3 | 4 | 3 | 5 | 1 | 1 | **13** | S | Low |
| **5** | **C5 — Evidence-lifecycle / retraction gate** | New gate, new class | 4 | 5 | 5 | 4 | 3 | 3 | **12** | M | Medium |

**Tie-break, C3 over C4:** both score 13. C3 wins on the stated weighting. C4 is a wrong *label* on a
correctly-computed value — publicly visible, but no data is corrupted. C3 is a broken *resolver*:
three components disagree about where a proposal lives, and the disagreement silently hides the
entity-record hold class from the digest's own ground-truth check. Traceability outranks legibility.

**On "class over instance":** C1, C2 and C4 each end in a gate that makes the class impossible
(shape-refusal; slug-equality assertion; range derived from `getBand`). C3 adds a count assertion
that closes INC-005 structurally. C5 names a class that currently has no gate at all. None of the
five is a single-instance repair; the Mali/Niger and 20-name backfills are consequences of the class
fixes, not the fixes themselves.

---

## 7. Verified, deliberately excluded from the top 5

Real, confirmed, and each with a reason for exclusion.

| Defect | Evidence | Why not top 5 |
|---|---|---|
| **`test-entity-records.mjs` runs in no automated context.** `site/package.json:21` defines `test` as `test:scoring && test:lint && test:history && test:entity-href`. There is no `test:entity-records` script, and `build` (`:8`) does not invoke it. The 19,702-assertion composite-invariance and determinism check [reported, `OBSERVABILITY.md:18`] only runs when a human remembers. Same for `validate-rotation-state.mjs` — it lives in `research/scripts/` and appears in no npm script or workflow. | `site/package.json:8,21`; `.github/workflows/deploy.yml:51` | **Scored 12, tied for 5th, and it is the delivery vehicle for C1 and C3 rather than a rival to them** — see §8. Effort S, Risk Low (must land report-only: `validate-rotation-state` currently exits 1 on 24 failures [reported], so it cannot become blocking until that population is baselined or ratcheted). |
| **`score-updater.md` §2a maps 7 of 8 indexes.** `:32-38` lists countries, us-states, fortune-500, ai-labs, robotics-labs, us-cities, global-cities. No `universities`. Two universities were applied anyway [reported, `AGENT-ROUTING.md:205`]. | `.claude/agents/score-updater.md:32-38` | A one-line spec addition. Real, but it is an agent-spec edit the brief forbids in this pass, it has produced no wrong data, and it is already logged as D-1. |
| **Entity-count drift: `overnight-scanner.md` hardcodes 1,155 in thirteen places** (`:3,10,19,20,63,71,156,185,246,270,299,307,311`), including `:307` *"1,155 records is non-negotiable"*, against `rotation-state.json:3` = **1331**. | those files | **Lower severity than the brief implies.** `validate-scan.mjs:267,276-279` derives expected coverage from `Object.keys(rotation.entities)` at runtime and FAILs on any mismatch. A scanner obeying the stale constant fails loudly at the gate — it cannot silently under-cover. Spec hygiene, not a data-integrity risk. |
| **`rotation-state.json` ignored-but-tracked.** `.gitignore:4-7` lists it; it is tracked. | `.gitignore:4-7`; `DISASTER-RECOVERY.md:29-58` | Deliberately unresolved pending a founder architectural decision (`RISKS.md:21`, RISK-008). The current (accidental) state is the *safe* one — the file is recoverable from git. The danger is a future well-intentioned `git rm --cached`. Correct action is the standing flag, already in place, not a fix. |
| **Five agents use `summary:` instead of `description:`; `data-engineer.md` duplicated.** | [reported] `AGENT-ROUTING.md:206,208` — **not re-verified in this pass** | Agent-spec edits are out of scope for this pass, and the effect is routing invisibility, not data corruption. |
| **Three independent "latest published date" pointers.** | `INCIDENTS.md:35-58` (INC-007) | Real structural defect, correctly logged, all three currently agree. Below the five above on impact. |
| **Cross-index slug collisions warn but do not fail.** `export-public-data.mjs:142-149` warns that "Badge for this slug will serve the LAST written file" and continues. | `export-public-data.mjs:142-149` | Genuine, but it is a symptom of the entity-currency duplicate problem (`RISKS.md:16`, RISK-003), which is a research/disposition workstream with an existing owner, not an architecture candidate. |

---

## 8. Recommended next action

**Build `research/scripts/validate-proposals.mjs` (C1 steps 1–2), and wire it into `npm test`
alongside `test-entity-records.mjs`, in one change.**

Rationale, in order:

1. **It is the only candidate with confirmed silent corruption already in the tree.** Mali and Niger
   were applied through a fallback that discarded real per-subdimension evidence and reported three
   green checks (`apply-entity-record.mjs:366-374, 468-485, 685-691`;
   `entity-records/niger.json`, `entity-records/mali.json`). Every other candidate is a live risk;
   this one is a live instance.
2. **The fix is fail-closed and read-only.** The validator writes nothing. The
   `apply-entity-record.mjs` change converts a silent degradation into a refusal — worst case, it
   blocks an apply that should have been blocked. This satisfies the "boring and reversible" bar.
3. **It carries C3 for free.** The queue-count assertion (C3 step 4) and the filename-convention
   check (C3 steps 1–3) are additional checks inside the same script. One artefact closes INC-005
   remediation item 3 and `OBSERVABILITY.md:71-74` proposed check #1.
4. **The CI wiring is the point, not a detail.** Add `"test:proposals"` and `"test:entity-records"`
   to `site/package.json:21`. `deploy.yml:51` already runs `npm run build`, and `npm test` runs in
   the same job. A validator that is not wired into a gate is a script nobody runs — which is
   precisely how `test-entity-records.mjs` came to have no automated caller, and how the
   `legacyRange` escape hatch (C4) survived six weeks past its own correction.

**Ship it report-only for one cycle** (exit 0, print failures) before flipping to blocking, so the
existing backlog surfaces without stopping a nightly run.

**Sequence after that:** C4 (S effort, low risk, unblocks the 60.9 de-seeding programme) → C2
steps 1–2 (pin the 20 slugs; behaviour-neutral, then decode) → C5 steps 1 and 4 (record `checked_at`
and promote `scanner_trigger_retracted` to schema, both zero-risk) before C5's live re-check.

**Founder decisions required before anything in C2 or C4 can land** (`AUTONOMY.md:50-51` — all index
writes escalate):

1. Approve pinning explicit `slug` values on 20 `fortune-500.json` rows, then decoding those names.
2. Approve correcting `bands[].range` in seven index files to match `us-states.json` and `getBand`.
3. Approve the Mali/Niger entity-record backfill (evidence restoration only; no score changes).

**Open risks carried, not resolved here:** INC-001 (deploy SSH key, founder-blocked) means none of
this reaches production automatically. RISK-008 (`rotation-state.json` tracking) remains a standing
flag. The 24 `validate-rotation-state.mjs` failures [reported] are a prerequisite for ever making
that check blocking, and C2's slug fragmentation is a plausible but unconfirmed contributor to them.
