# D-13 Determinations — Draft Dispositions for the 6 Waivered Entities

**Status: DRAFT — no index modified, nothing ratified.** This document proposes dispositions for
the founder to ratify or reject. No file under `site/src/data/indexes/`, `site/scripts/`,
`DECISIONS.md`, `RISKS.md`, `research/`, or any log has been edited to produce it, and nothing in
it has been committed. Every delist, redirect, merge or rename named below requires explicit
founder approval under `AUTONOMY.md` §1b ("Any **delisting**, **deletion**, **merge**, **rename**
or **index reassignment** of an entity" is an always-escalate write) before any agent may act on it.

**Inputs used (read in full for this draft):**
- `site/scripts/product-separation-waivers.json` (all 6 waivers)
- `DECISIONS.md` § D-13 (2026-08-20, status **proposed**), § D-23 (2026-09-07), § D-37 (2026-09-16)
- `research/INDEX_EXPANSION_SCOPE_2026-08-20.md` §1.1–1.2, §2.2–2.4
- `RISKS.md` RISK-015, RISK-017
- `docs/META_REVIEW_2026-09-17_ITER16-20.md` §7 (shortlist item 2, "D-13-1") and §8 (decision packet
  item 5)
- Live rows in `site/src/data/indexes/ai-labs.json`, `robotics-labs.json`, `fortune-500.json`
  (`.rankings[]`), read directly and quoted below
- `site/scripts/lib/product-separation.mjs` (canonicalisation and duplicate-detection logic) and
  `site/scripts/validate-product-separation.mjs` (the CLI wrapper, check 2)
- `site/scripts/lib/deployed-ai-audit-subjects.mjs`, `docs/CB_MODEL_INTEGRATION_2026-09-06.md` §2.3
  (for the SPOT-demo section)
- `site/scripts/known-collisions.json`
- `AUTONOMY.md` §1b
- `.claude/agents/coordinator.md` (S9, quoted below)
- Route structure: `site/src/app/{ai-lab,robotics-lab,company}/[slug]/page.tsx` (confirmed to exist
  by `Glob`; see the SPOT-demo section for the corresponding negative check)

**Data-quality note found while gathering rows (not a mismatch in composite):** `robotics-labs.json`
now holds far more than the 50 rows the waiver text and `INDEX_EXPANSION_SCOPE_2026-08-20.md`
describe — the ranks below (13, 15, 9, 27, 90) do not match the ranks cited in that August scoping
study (14, 16, 10, 32, 48), consistent with `CLAUDE.md`'s snapshot of 92 robotics-labs entities as
of 2026-09-16 (the study predates that expansion). **All composite values, however, match the
waiver text and the scoping study exactly, with no discrepancy found** — see the per-entity
cross-checks below.

---

## 1. Figure AI

**Rows as published:**

| File | Name | Composite | Band | Rank |
|---|---|---:|---|---:|
| `ai-labs.json` | Figure AI | 31.3 | developing | 35 |
| `robotics-labs.json` | Figure AI | 48.4 | functional | 27 |

**Cross-check against waiver text:** waiver `D13-figure` states ai-labs 31.3 and robotics-labs 48.4,
a 17.1-point spread. Both composites match the live file exactly. **No mismatch.** (Rank is not
stated in the waiver; live ranks are 35 and 27 respectively.)

**Rule applied.** PPT (`DECISIONS.md` § D-13): *"The index is determined by what the customer
receives: software/model/API → `ai-labs`; a physical machine that senses and acts → `robotics-labs`;
both → majority revenue, else the entity's own product hierarchy."* `INDEX_EXPANSION_SCOPE_2026-08-20.md`
§2.2 applies this directly: *"Figure AI | A humanoid robot (Figure 03) | **robotics-labs**."* Figure
AI sells a physical humanoid robot; the PPT test is unambiguous here — this is the "clearest true
duplicate of the six" per the waiver's own reason field (identical name, two indexes, two scores).

**Proposed disposition:** keep `robotics-labs.json` "Figure AI" (48.4, rank 27); delist
`ai-labs.json` "Figure AI" (31.3, rank 35); redirect `/ai-lab/figure-ai` → `/robotics-lab/figure-ai`.

**Alternatives, with trade-offs:**
- *Keep the ai-labs row instead, delist robotics-labs.* Rejected reading: contradicts the PPT
  outcome the study itself reached (§2.2 table). Would need a stated reason to override; none found
  in the repo.
- *Extend the `D13-figure` waiver 60 days (to 2027-01-15), as a recorded decision.* Defers the
  determination; does not resolve RISK-015 for this entity; keeps two published composites for one
  company live in the interim. Valid only as a deliberate, dated act per the waiver file's own rule
  ("extending it is a deliberate, reviewable act, not a default").
- *No ambiguity found in D-13's text for this entity* — the PPT gives one answer and the waiver
  reason field agrees it is the clearest case.

**Does this clear check 2? Yes.** `canonicalizeEntityName("Figure AI")` (`lib/product-separation.mjs`)
strips the trailing " AI" business-unit suffix and folds to `"figure"` for both rows regardless of
file; with only one "Figure AI" row published (robotics-labs), `detectDuplicatePublications` finds a
single occurrence for canonical `"figure"` and the group no longer qualifies as a duplicate (needs
`occurrences.length > 1`). No validator rule change needed.

**Downstream stores affected (S9 — "a rename is not done until every consumer is re-derived... index
rows, entity records, rotation state, score files, history, redirects"), listed only, not changed:**
- `/data/scores/figure-ai.json` (generated by `export-public-data.mjs`) — currently a collision per
  `site/scripts/known-collisions.json` (`"slug": "figure-ai", "indexes": ["ai-labs", "robotics-labs"]`,
  explicitly noted there as "NOT a naming fix" — deferred to this D-13 determination)
- `site/src/data/entity-records/figure-ai.json` (one file currently serves both published rows)
- `research/rotation-state.json` key `"figure-ai"` (single key at line 7582; confirm at apply time
  whether it tracks the ai-labs or robotics-labs assessment lineage, or both)
- `site/scripts/known-collisions.json` entry for `figure-ai` (would be removed once the duplicate
  publication, not just the slug collision, is resolved)
- `/ai-lab/figure-ai` and `/ai-lab/figure-ai/history` pages and their redirects
- Worker KV Score-Watch subscriber keys keyed `watch:email:figure-ai` if any exist (Score-Watch
  sales are currently paused per D-34/RISK-014, so exposure here is likely small but unverified —
  **UNVERIFIED — founder or research to confirm whether any live subscriber watches this slug**)

**Consequences a reader would see:** the `/ai-lab/figure-ai` page stops existing as a ranked ai-labs
row (31.3, rank 35) and 301s to the robotics-labs page (48.4, rank 27) — a reader following an old
link sees a different composite and band (developing → functional) for the same company. This is a
lower composite disappearing, not a lower composite being applied; no score itself changes.

**Waiver expiry:** 2026-11-16. **Founder decision-by date (expiry − 30 days): 2026-10-17.**

---

## 2. 1X Technologies / Halodi Robotics

**Rows as published:**

| File | Name | Composite | Band | Rank |
|---|---|---:|---|---:|
| `ai-labs.json` | 1X Technologies | 50 | functional | 14 |
| `robotics-labs.json` | 1X Technologies | 81.4 | exemplary | 9 |
| `robotics-labs.json` | Halodi Robotics | 62.5 | established | 15 |

**Cross-check against waiver text:** waiver `D13-1x-technologies` states ai-labs 50, robotics-labs
81.4, and Halodi Robotics 62.5, "a 31.4-point spread." All three composites match the live file
exactly. **No mismatch.**

**Rule applied.** Two rules combine here. First, PPT: 1X Technologies sells a physical humanoid
robot (NEO) — `INDEX_EXPANSION_SCOPE_2026-08-20.md` §2.2: *"1X Technologies | A humanoid robot (NEO)
| **robotics-labs**."* Second, the hard constraint itself: *"no entity may hold more than one
published composite anywhere in the Compassion Benchmark"* (`DECISIONS.md` § D-13). Halodi Robotics
is not a distinct rule case under R-SUB-1..4 — it is the *same legal entity* as 1X Technologies
under a pre-2023 name, captured in code as a maintained fact, not a string-normalization inference:
`KNOWN_NAME_ALIASES = { "halodi robotics": "1x technologies" }` (`lib/product-separation.mjs`,
documented there as "1X Technologies is Halodi Robotics's post-rebrand name... not an inference").
`INDEX_EXPANSION_SCOPE_2026-08-20.md` §2.4's four-state model classifies this as **Renamed**:
*"Same legal entity, new name... Rename in place. Score history carries forward. One record only."*

**Proposed disposition:** keep `robotics-labs.json` "1X Technologies" (81.4, rank 9) as the single
surviving record; delist `ai-labs.json` "1X Technologies" (50, rank 14); delist `robotics-labs.json`
"Halodi Robotics" (62.5, rank 15); redirect `/ai-lab/1x-technologies` → `/robotics-lab/1x-technologies`
and `/robotics-lab/halodi-robotics` → `/robotics-lab/1x-technologies`.

**Alternatives, with trade-offs:**
- *Average or otherwise blend the two robotics-labs composites (81.4 and 62.5) into one retained
  score.* Explicitly rejected by governing precedent: D-08 (`DECISIONS.md`) — *"Duplicate records
  are merged structurally; composites are never averaged... keep the surviving row's published
  composite... Do not average the two composites."* `INDEX_EXPANSION_SCOPE_2026-08-20.md` §1.1
  agrees for this exact pair: *"Do not average the two composites; 65.6 was assessed against the
  company and 20.3 against a product"* (stated for Boston Dynamics but the same discipline applies
  here) — which of the two 1X-era composites (81.4 vs. 62.5) is the more current/accurate
  measurement is **UNVERIFIED — founder or research to confirm**; this draft defaults to keeping the
  higher-rank, more recently-named "1X Technologies" row on the strength of the rename-in-place
  convention, not on a claim that 81.4 is the more accurate score.
- *Extend the `D13-1x-technologies` waiver 60 days (to 2027-01-29), as a recorded decision.*
  Preserves the status quo (three published composites, 31.4-point spread) for another cycle.
- No genuine ambiguity found in D-13's text on *which* index owns this entity — both the PPT and the
  rename rule point the same direction. The open question is only *which of the two robotics-labs
  composites is retained*, flagged above as unverified.

**Does this clear check 2? Yes.** All three names canonicalise to the same key: "1X Technologies"
(either file) → `normalizeEntityName` folds to `"1x technologies"`; "Halodi Robotics" →
`normalizeEntityName` folds to `"halodi robotics"`, then `KNOWN_NAME_ALIASES` maps it to
`"1x technologies"`. With only the robotics-labs "1X Technologies" row published, one occurrence
remains for that canonical key and the duplicate group closes. No validator rule change needed.

**Downstream stores affected (S9), listed only, not changed:**
- `/data/scores/1x-technologies.json` and `/data/scores/halodi-robotics.json` (`export-public-data.mjs`)
- `site/src/data/entity-records/1x-technologies.json` and `site/src/data/entity-records/halodi-robotics.json`
  (two separate entity-record files currently exist)
- `research/rotation-state.json` keys `"1x-technologies"` (line 7416) and `"halodi-robotics"`
  (line 7946)
- `site/scripts/known-collisions.json` entry for `1x-technologies` (explicitly deferred to D-13
  there: *"Resolve by delisting one row, not by renaming"*)
- `/ai-lab/1x-technologies`, `/robotics-lab/1x-technologies`, `/robotics-lab/halodi-robotics` pages
  and `/history` variants
- Worker KV Score-Watch subscriber keys for any of the three slugs — **UNVERIFIED — founder or
  research to confirm live subscriber count**, same caveat as Figure AI

**Consequences a reader would see:** two of three published pages for this one company disappear;
the surviving `/robotics-lab/1x-technologies` page keeps the 81.4/exemplary/rank-9 record. A reader
who previously saw "1X Technologies 50.0 (functional)" on ai-labs or "Halodi Robotics 62.5
(established)" on robotics-labs is redirected to a higher score and a higher band than either prior
page showed.

**Waiver expiry:** 2026-11-30. **Founder decision-by date (expiry − 30 days): 2026-10-31.**

---

## 3. Boston Dynamics (SPOT demo)

**Rows as published:**

| File | Name | Composite | Band | Rank |
|---|---|---:|---|---:|
| `robotics-labs.json` | Boston Dynamics | 65.6 | established | 13 |
| `robotics-labs.json` | Boston Dynamics (SPOT demo) | 20.3 | developing | 90 |

**Cross-check against waiver text:** waiver `D23-boston-dynamics-spot-demo` states 65.6 and 20.3,
"45.3 points apart," same-index. Both composites match the live file exactly. **No mismatch.**

**Rule applied: D-23 / three-product separation, NOT D-13**, per the waiver's own `decision` field
(`"D-23 / three-product separation"`) and the task instruction to follow that path for this entity.
The waiver's `reason` field states the mechanism precisely: *"This is misfiled rather than
duplicated: a DEPLOYED CONFIGURATION sitting in an organisations index, which check 3 should have
caught. It surfaces through check 2 only because `PARENTHETICAL_SUFFIX_RE` strips '(SPOT demo)' —
the same regex that is CORRECT for '(Teradyne)'. One regex, two semantics."* This is the CB-MODEL
three-product rule (`docs/CB_MODEL_INTEGRATION_2026-09-06.md`, quoted in
`validate-product-separation.mjs`'s header): *"three products — Model Index... AI Labs Index...
Deployed AI Audit (product configurations) — never merge into one score."* The SPOT demo row is a
**Deployed AI Audit** subject (a configured product demonstration), not a second Boston Dynamics
organisation.

**Verified fact governing this disposition: the Deployed AI Audit product does not currently
exist.** `docs/CB_MODEL_INTEGRATION_2026-09-06.md` §1.1 table: *"Compassion Benchmark Deployed AI
Audit | **Does not exist as a product**... §2.3 below."* §2.3 repeats: *"Deployed AI Audit — a
product that does not exist."* **V8 positive/negative control:** `Glob` of `site/src/app/*/` was run
for this draft; it returned `site/src/app/ai-lab/[slug]/page.tsx`, `site/src/app/robotics-lab/[slug]/page.tsx`
and `site/src/app/company/[slug]/page.tsx` among others (**positive control** — the glob mechanism
correctly finds real dynamic-route directories), and returned **no** `deployed-ai-audit` directory of
any kind (the negative finding this section relies on). So the waiver's own stated remediation —
*"Move the SPOT demo row out of the labs index into the Deployed AI Audit product"* — currently has
no live destination page to move the row *into*.

**Proposed disposition:** delist `robotics-labs.json` "Boston Dynamics (SPOT demo)" (20.3, rank 90).
Retain the SPOT weaponisation evidence inside the surviving "Boston Dynamics" record, per
`INDEX_EXPANSION_SCOPE_2026-08-20.md` §1.1's own recommendation for this exact row (*"Retain the
SPOT weaponisation evidence inside the Boston Dynamics record"*). Because no Deployed AI Audit route
exists, there is **no live page to redirect to today**. Two sub-options for the redirect target,
both requiring founder choice:
  - (a) `/robotics-lab/boston-dynamics-spot-demo` → `/robotics-lab/boston-dynamics` now, as an
    interim redirect, to be re-pointed to a Deployed AI Audit URL if and when that product ships; or
  - (b) tombstone the row (dated, `status: delisted`, no redirect) and publish no interim redirect
    until Deployed AI Audit exists as a real destination, avoiding a redirect target that would
    itself need a second migration later.

**Alternatives, with trade-offs:**
- *Extend the `D23-boston-dynamics-spot-demo` waiver 60 days (to 2027-02-12), as a recorded
  decision.* Keeps a product-configuration row inside an organisations index for another cycle;
  does not fix the check-3 taxonomy gap this row exists to illustrate.
- *Average the two composites (65.6 and 20.3) rather than delisting.* Rejected under the same D-08
  no-averaging precedent applied to 1X Technologies above, and the source study's explicit
  instruction not to average this exact pair (§1.1: "65.6 was assessed against the company and 20.3
  against a product").
- *Split `PARENTHETICAL_SUFFIX_RE` into two regexes* (one for corporate-parent suffixes like
  "(Teradyne)", one for configuration suffixes like "(SPOT demo)"), per the waiver's own
  `remediation` field. This is a validator-code change, not a data disposition, and is out of scope
  for this document, which is documents-only.

**Does this clear check 2? Yes**, mechanically — delisting the SPOT demo row leaves one occurrence
for canonical `"boston dynamics"` (both rows fold to the same key via `PARENTHETICAL_SUFFIX_RE`), so
`detectDuplicatePublications` no longer reports a group. No validator rule change is needed for check
2 specifically. **Separately, check 3** (`detectDeployedAuditSubjects`, WARN severity, matched
against the maintained list in `lib/deployed-ai-audit-subjects.mjs`) would continue to warn on any
Deployed-AI-Audit-classified row left inside `ai-labs.json` or `robotics-labs.json` — delisting this
row from `robotics-labs.json` removes it from check 3's scope as well, but check 3 is WARN, not FAIL,
and is not what RISK-015 depends on.

**Downstream stores affected (S9), listed only, not changed:**
- `/data/scores/boston-dynamics-spot-demo.json` and `/data/scores/boston-dynamics.json`
- `site/src/data/entity-records/boston-dynamics-spot-demo.json` and
  `site/src/data/entity-records/boston-dynamics.json` (both exist as separate files today)
- `research/rotation-state.json` keys `"boston-dynamics"` (line 7924) and
  `"boston-dynamics-spot-demo"` (line 8298)
- `/robotics-lab/boston-dynamics-spot-demo` page and its `/history` page
- Not currently listed in `site/scripts/known-collisions.json` (this pair is a same-index
  duplicate caught by check 2's regex, not a cross-index slug collision, so it was never added
  there — no entry to remove)
- Worker KV Score-Watch subscriber keys for `boston-dynamics-spot-demo` — **UNVERIFIED — founder or
  research to confirm**

**Consequences a reader would see:** `/robotics-lab/boston-dynamics-spot-demo` (20.3, developing,
rank 90) stops resolving as an independent entity; depending on the founder's redirect choice, a
reader either lands on the main Boston Dynamics page (65.6, established, rank 13) or sees a
tombstone/404 until a Deployed AI Audit destination exists.

**Waiver expiry:** 2026-12-14. **Founder decision-by date (expiry − 30 days): 2026-11-14.**

---

## 4. Amazon

**Rows as published:**

| File | Name | Composite | Band | Rank |
|---|---|---:|---|---:|
| `ai-labs.json` | Amazon AWS AI | 35.9 | developing | 31 |
| `fortune-500.json` | Amazon | 12.8 | critical | 427 (`f500Rank` 2) |

**Cross-check against waiver text:** waiver `D13-amazon` states ai-labs 35.9 and fortune-500 12.8,
"23.1-point spread." Both composites match the live file exactly. **No mismatch.**

**Rule applied — genuinely ambiguous in D-13's own text; two readings.** `DECISIONS.md` § D-13's
R-SUB-3: *"A published parent blocks the division"* — live application explicitly lists *"Blocks
Microsoft AI, Amazon AWS AI, Meta AI."* The Consequence paragraph is direct: *"Under R-SUB-3,
Microsoft AI, Amazon AWS AI and Meta AI would be delisted from ai-labs — all three currently
published... That has not happened."* Read this way, the rule already resolves Amazon: AWS AI is
not separately incorporated, Amazon already holds a published fortune-500 composite, so R-SUB-3
blocks the division outright.

**Reading 2 — the waiver's own reason field disputes this is settled:** *"Arguably a genuine scope
distinction (an AI division vs the parent corporation) rather than a duplicate, which is precisely
what D-13 must settle."* Under this reading, R-SUB-2 (*"Named business unit inside a diversified
parent may be listed only if the parent holds no published composite"*) is the wrong test to apply
by default, because a business unit as large and distinct as AWS AI arguably deserves its own
scoping analysis rather than automatic blocking — D-13's own status line calls the whole document
**"proposed... adopted by practice but never ratified."** The document does not resolve which
reading wins; that is what ratification would decide. **This draft does not pick one silently** —
both are given, with a stated default below.

**Proposed disposition (default reading = R-SUB-3, matching D-13's literal Consequence
paragraph):** keep `fortune-500.json` "Amazon" (12.8, rank 427); delist `ai-labs.json` "Amazon AWS
AI" (35.9, rank 31); redirect `/ai-lab/amazon-aws-ai` → `/company/amazon`.

**Alternatives, with trade-offs:**
- *Keep both rows as a deliberate divisional-scope exception (Reading 2).* Requires a validator
  change (see "Does this clear check 2?" below) and a new, explicit rule text added to D-13 or a
  successor decision — not just silence. Trade-off: preserves a real distinction readers may want
  (AWS's AI practices vs. Amazon's retail/logistics practices) at the cost of the hard constraint's
  simplicity and at the cost of a 23.1-point gap remaining publicly visible and unexplained on two
  separate pages.
- *Extend the `D13-amazon` waiver 60 days (to 2027-03-16), as a recorded decision.* Preserves status
  quo; this is the case D-37 says explicitly "cannot resolve until D-13 is ratified," so an
  extension here is not a failure to act, it is arguably the structurally correct move if the
  founder is not ready to rule on Reading 1 vs. Reading 2 for all three division cases at once
  (D-37: "the three division-vs-parent cases... cannot resolve until D-13 is ratified" — grouping
  Amazon with Meta and Microsoft as one joint decision, per the `D13-amazon` waiver's own
  `remediation` field: *"resolve jointly with D13-meta and D13-microsoft as one division-scoping
  decision"* — note the JSON's remediation field on `D13-meta` states this joint framing; `D13-amazon`'s
  own remediation field is narrower and does not use this wording, so treat "joint resolution" as
  Meta's and Microsoft's stated preference, not confirmed as Amazon's).
- *Revenue-majority test (D-13 PPT's tie-break for entities that both build software and hold a
  parent composite)* — **UNVERIFIED — founder or research to confirm** whether AWS AI (or AWS as a
  whole) is majority or minority of Amazon's consolidated revenue; the repo contains no revenue
  figures for either entity, so this test cannot be applied from data on hand.

**Does this clear check 2? Depends on which reading is adopted.**
- Default disposition (delist ai-labs row): **Yes.** `canonicalizeEntityName("Amazon AWS AI")` strips
  the trailing `" AWS AI"` via `AI_BUSINESS_UNIT_SUFFIX_RE` (`/\s+(?:AWS\s+)?AI$/i`) to `"Amazon"`,
  folding to canonical `"amazon"` — identical to fortune-500's `"Amazon"` → `"amazon"`. With only the
  fortune-500 row published, the duplicate group closes. No validator rule change needed.
- Reading 2 (keep both rows): **No — would still fail check 2 as written**, and would require a new
  validator rule. Name it: a **division-aware co-publication allowlist** (e.g. an
  `ALLOWED_DIVISION_COPUBLICATIONS` list in `lib/product-separation.mjs`, parallel in structure to
  `KNOWN_NAME_ALIASES` but with the opposite effect — an explicit, named, founder-approved exception
  from duplicate detection for a specific (parent canonical, division name) pair, rather than an
  alias that merges two names into one canonical key). This does not exist today and is not built by
  this draft.

**Downstream stores affected (S9), listed only, not changed:**
- `/data/scores/amazon.json` and `/data/scores/amazon-aws-ai.json`
- `site/src/data/entity-records/amazon.json` and `site/src/data/entity-records/amazon-aws-ai.json`
- `research/rotation-state.json` keys `"amazon"` (line 6159) and `"amazon-aws-ai"` (line 7615)
- Not in `site/scripts/known-collisions.json` (different slugs, `amazon` vs. `amazon-aws-ai` — this
  is a same-canonical-entity duplicate under check 2, not a slug collision, so no entry exists there
  to remove)
- `/ai-lab/amazon-aws-ai` page and `/history` page; `/company/amazon` page and `/history` page
- Worker KV Score-Watch subscriber keys for either slug — **UNVERIFIED — founder or research to
  confirm**

**Consequences a reader would see (default disposition):** `/ai-lab/amazon-aws-ai` (35.9,
developing) disappears and redirects to `/company/amazon` (12.8, critical) — a reader following the
old AWS AI link sees a much lower composite and a much worse band (developing → critical) for what
the redirect now presents as the same institution.

**Waiver expiry:** 2027-01-15. **Founder decision-by date (expiry − 30 days): 2026-12-16.**

---

## 5. Meta

**Rows as published:**

| File | Name | Composite | Band | Rank |
|---|---|---:|---|---:|
| `ai-labs.json` | Meta AI | 26.3 | developing | 40 |
| `fortune-500.json` | Meta Platforms | 7.8 | critical | 445 (`f500Rank` 27) |

**Cross-check against waiver text:** waiver `D13-meta` states ai-labs 26.3 and fortune-500 7.8,
"18.5-point spread... Same division-vs-parent question as Amazon." Both composites match the live
file exactly. **No mismatch.**

**Rule applied — same two-reading ambiguity as Amazon (§4 above), not repeated in full here.**
R-SUB-3's live-application list explicitly names Meta AI: *"Blocks Microsoft AI, Amazon AWS AI, Meta
AI"* (`DECISIONS.md` § D-13), and the Consequence paragraph again: *"Meta AI... would be delisted
from ai-labs... That has not happened."* The waiver's own `remediation` field states the joint-
resolution framing explicitly for this entity: *"Ratify D-13; resolve jointly with D13-amazon and
D13-microsoft as one division-scoping decision."*

**Proposed disposition (default reading = R-SUB-3):** keep `fortune-500.json` "Meta Platforms" (7.8,
rank 445); delist `ai-labs.json` "Meta AI" (26.3, rank 40); redirect `/ai-lab/meta-ai` →
`/company/meta-platforms`.

**Alternatives, with trade-offs:** identical structure to Amazon's §4 — (a) keep both rows as a
divisional-scope exception, same validator-rule-change cost as Amazon; (b) extend the
`D13-meta` waiver 60 days (to 2027-03-30), as a recorded decision, explicitly supported by this
waiver's own remediation text calling for joint resolution with Amazon and Microsoft; (c) a
revenue-majority tie-break — **UNVERIFIED — founder or research to confirm** Meta AI's share of Meta
Platforms' consolidated revenue; not present in this repo's data.

**Does this clear check 2? Depends on which reading, same logic as Amazon.**
- Default disposition (delist ai-labs row): **Yes.** `canonicalizeEntityName("Meta AI")` strips
  trailing `" AI"` to `"Meta"` → canonical `"meta"`. `canonicalizeEntityName("Meta Platforms")`
  strips the `LEGAL_SUFFIX_RE` match `"Platforms"` to `"Meta"` → canonical `"meta"`. Identical
  canonical key; one surviving row closes the group. No validator rule change needed.
- Reading 2 (keep both): **No** — same named validator gap as Amazon: a
  division-aware co-publication allowlist would be required.

**Downstream stores affected (S9), listed only, not changed:**
- `/data/scores/meta-ai.json` and `/data/scores/meta-platforms.json`
- `site/src/data/entity-records/meta-ai.json` and `site/src/data/entity-records/meta-platforms.json`
- `research/rotation-state.json` keys `"meta-ai"` (line 7559) and `"meta-platforms"` (line 6830)
- Not in `site/scripts/known-collisions.json` (different slugs; not a slug collision)
- `/ai-lab/meta-ai` page and `/history` page; `/company/meta-platforms` page and `/history` page
- Worker KV Score-Watch subscriber keys for either slug — **UNVERIFIED — founder or research to
  confirm**

**Consequences a reader would see (default disposition):** `/ai-lab/meta-ai` (26.3, developing)
disappears and redirects to `/company/meta-platforms` (7.8, critical) — an even larger visible drop
than Amazon's, and the lowest of the three division composites among the surviving parent rows.

**Waiver expiry:** 2027-01-29. **Founder decision-by date (expiry − 30 days): 2026-12-30.**

---

## 6. Microsoft

**Rows as published:**

| File | Name | Composite | Band | Rank |
|---|---|---:|---|---:|
| `ai-labs.json` | Microsoft AI | 75.9 | established | 4 |
| `fortune-500.json` | Microsoft | 65.3 | established | 26 (`f500Rank` 11) |

**Cross-check against waiver text:** waiver `D13-microsoft` states ai-labs 75.9 and fortune-500 65.3,
"10.6-point spread, the narrowest of the six." Both composites match the live file exactly. **No
mismatch.**

**Rule applied — same two-reading ambiguity as Amazon and Meta.** R-SUB-3's live-application list
names Microsoft AI first: *"Blocks Microsoft AI, Amazon AWS AI, Meta AI"* (`DECISIONS.md` § D-13).
The Consequence paragraph adds a fact specific to this entity: *"Microsoft AI's composite was moved
on 2026-08-16"* — i.e. this is not a stale, never-revisited row; someone updated it after the
duplicate was already known to exist. The waiver's `remediation` field: *"Ratify D-13; resolve
jointly with D13-amazon and D13-meta."*

**Proposed disposition (default reading = R-SUB-3):** keep `fortune-500.json` "Microsoft" (65.3,
rank 26); delist `ai-labs.json` "Microsoft AI" (75.9, rank 4); redirect `/ai-lab/microsoft-ai` →
`/company/microsoft`.

**Alternatives, with trade-offs:** same structure as Amazon and Meta — (a) keep both rows as a
divisional-scope exception, same validator-rule-change cost; (b) extend the `D13-microsoft` waiver
60 days (to 2027-04-13), as a recorded decision, consistent with its own remediation text's
joint-resolution framing; (c) revenue-majority tie-break — **UNVERIFIED — founder or research to
confirm** Microsoft AI's share of Microsoft's consolidated revenue.

**One consideration specific to Microsoft, not present for Amazon or Meta:** this is "the narrowest
[gap] of the six" (10.6 points) and currently sits **highest of all six delist candidates** — rank 4
of the entire ai-labs index, in the Established band. Delisting it removes the single most
prominent published score among the six determinations in this document. This is a fact about
visibility, not an argument for a different disposition; recorded because a reader would notice this
one first.

**Does this clear check 2? Depends on which reading, same logic as Amazon and Meta.**
- Default disposition (delist ai-labs row): **Yes.** `canonicalizeEntityName("Microsoft AI")` strips
  trailing `" AI"` to `"Microsoft"` → canonical `"microsoft"`, identical to fortune-500's
  `"Microsoft"` → `"microsoft"`. One surviving row closes the group. No validator rule change
  needed.
- Reading 2 (keep both): **No** — same named validator gap as Amazon and Meta: a division-aware
  co-publication allowlist would be required.

**Downstream stores affected (S9), listed only, not changed:**
- `/data/scores/microsoft-ai.json` and `/data/scores/microsoft.json`
- `site/src/data/entity-records/microsoft-ai.json` and `site/src/data/entity-records/microsoft.json`
- `research/rotation-state.json` keys `"microsoft-ai"` (line 7294) and `"microsoft"` (line 2363)
- Not in `site/scripts/known-collisions.json` (different slugs; not a slug collision)
- `/ai-lab/microsoft-ai` page and `/history` page; `/company/microsoft` page and `/history` page
- Worker KV Score-Watch subscriber keys for either slug — **UNVERIFIED — founder or research to
  confirm**

**Consequences a reader would see (default disposition):** `/ai-lab/microsoft-ai`, currently rank 4
of the whole ai-labs index at 75.9 (established), disappears and redirects to `/company/microsoft`
(65.3, established) — same band, smaller drop than Amazon's or Meta's, but the most visible removal
of the six because of where it currently ranks.

**Waiver expiry:** 2027-02-12. **Founder decision-by date (expiry − 30 days): 2027-01-13.**

---

## Summary table

| Entity | Rule | Proposed disposition | Clears check 2? | Authority class | Decide-by |
|---|---|---|---|---|---|
| Figure AI | PPT (robot → robotics-labs) | Keep robotics-labs (48.4); delist ai-labs (31.3); redirect `/ai-lab/figure-ai` → `/robotics-lab/figure-ai` | Yes | AUTONOMY §1b — founder approval required | 2026-10-17 |
| 1X Technologies / Halodi Robotics | PPT + rename-in-place (§2.4) | Keep robotics-labs "1X Technologies" (81.4); delist ai-labs "1X Technologies" (50) and robotics-labs "Halodi Robotics" (62.5); redirect both | Yes | AUTONOMY §1b — founder approval required | 2026-10-31 |
| Boston Dynamics (SPOT demo) | D-23 / three-product separation (not D-13) | Delist SPOT demo row (20.3); interim redirect to `/robotics-lab/boston-dynamics` or tombstone — Deployed AI Audit destination does not exist yet | Yes (check 2); check 3 also clears | AUTONOMY §1b — founder approval required | 2026-11-14 |
| Amazon | R-SUB-3 (default) vs. disputed divisional-scope reading | Default: keep fortune-500 (12.8); delist ai-labs "Amazon AWS AI" (35.9); redirect `/ai-lab/amazon-aws-ai` → `/company/amazon` | Yes if default; No if divisional exception kept (needs new allowlist rule) | AUTONOMY §1b — founder approval required | 2026-12-16 |
| Meta | R-SUB-3 (default) vs. disputed divisional-scope reading | Default: keep fortune-500 "Meta Platforms" (7.8); delist ai-labs "Meta AI" (26.3); redirect `/ai-lab/meta-ai` → `/company/meta-platforms` | Yes if default; No if divisional exception kept (needs new allowlist rule) | AUTONOMY §1b — founder approval required | 2026-12-30 |
| Microsoft | R-SUB-3 (default) vs. disputed divisional-scope reading | Default: keep fortune-500 "Microsoft" (65.3); delist ai-labs "Microsoft AI" (75.9, currently rank 4); redirect `/ai-lab/microsoft-ai` → `/company/microsoft` | Yes if default; No if divisional exception kept (needs new allowlist rule) | AUTONOMY §1b — founder approval required | 2027-01-13 |

---

## Ratification asks (one line per entity, yes / no / alternative)

1. **Figure AI** — Ratify: delist the ai-labs row (31.3), keep robotics-labs (48.4), redirect? **Yes / No / Alternative.**
2. **1X Technologies / Halodi Robotics** — Ratify: delist ai-labs "1X Technologies" (50) and robotics-labs "Halodi Robotics" (62.5), keep robotics-labs "1X Technologies" (81.4), redirect both? **Yes / No / Alternative.**
3. **Boston Dynamics (SPOT demo)** — Ratify: delist the SPOT demo row (20.3) under D-23, with an interim redirect to Boston Dynamics (65.6) pending a real Deployed AI Audit destination? **Yes / No / Alternative.**
4. **Amazon** — Ratify R-SUB-3 (delist "Amazon AWS AI" 35.9, keep fortune-500 "Amazon" 12.8), or adopt the divisional-scope reading and commission the validator allowlist instead? **Yes / No / Alternative.**
5. **Meta** — Ratify R-SUB-3 (delist "Meta AI" 26.3, keep fortune-500 "Meta Platforms" 7.8), or adopt the divisional-scope reading and commission the validator allowlist instead? **Yes / No / Alternative.**
6. **Microsoft** — Ratify R-SUB-3 (delist "Microsoft AI" 75.9 — currently ai-labs rank 4 — keep fortune-500 "Microsoft" 65.3), or adopt the divisional-scope reading and commission the validator allowlist instead? **Yes / No / Alternative.**
