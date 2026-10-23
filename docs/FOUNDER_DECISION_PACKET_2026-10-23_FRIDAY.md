# Friday reply — 2026-10-23 (first use of C-FD-2, D-59)

One reply covers everything below. Each line has a default. Replying **"defaults"** approves every default; otherwise,
answer by number. The open founder asks are ranked by cost of delay, and there are at most six (Meta-review 13 §6).
This packet replaces none of the older packets' content; it points at them.

Prepared 2026-10-22 by the coordinator, and re-ranked the same day in Iteration 117 under Meta-review 14 A5
(`docs/META_REVIEW_2026-10-22_ITER112-116.md`). The earlier version asked only for Iterations 112 and 113 and had seven
asks. Every figure below was re-run on 2026-10-22 unless marked otherwise.

**Also open, outside the six asks: D-61a**, the proposed exit terms for the D-61 visual programme (DECISIONS.md). The
default is **confirm**. It says D-61 does not override the S6 stop, and the programme pauses at 3 or more uncommitted
iterations, when an agent re-test leaves only founder-gated items, or after 2 loops with no reply from you. If you
confirm it, the next visual loop waits until item 1 lands.

---

## 1. Commit and deploy Iterations 112–118 as commits C1–C7 — default: **yes**

- **What ships:**
  - **112:** the second AI Model Watch edition (`/ai-models/watch/2026-10-22`): 1 release and a catalog of 63
    models, with 5 existing rows corrected after the fact-check.
  - **113:** the DC-25 gate (`test:self-description-claims`).
  - **115:** the D-60 evaluation programme: design documents, `PROTOCOL.v2` as proposed, and the wave gates.
  - **116:** the D-61 visual loops. These fix six defects that are **live on production now**: React error #418 on
    `/`, `/updates` and `/ai-labs`; a false "Uneven profile (std dev 0.00)" sentence; sideways scrolling at tablet
    widths; 1.5:1 primary buttons; "published.Where"; and the stale home publication table.
  - **117:** the feed description, which says "1,155 entities" on production; the fix says 1,325. Plus this
    governance work.
  - **118:** the 2026-10-22 research cycle, now complete. It adds the daily briefing `/updates/2026-10-22`, 15
    assessments and 3 new pending proposals: Paris, Portugal and UNC Chapel Hill. **No score changes**; approving
    the commit does not approve any proposal. 41 proposals are pending. C7 also carries the briefing's share image
    `site/public/og/updates-2026-10-22.png`, which the build generated after Iteration 117 had checked the
    pathspecs.
- **Pathspecs:** the C1–C7 table is in `ITERATION_LOG.md`, Iteration 117. It was checked with
  `git ls-files --modified --others --exclude-standard -- <paths>`: the union of C1–C7 plus the exclusion list equals
  `git status --short --untracked-files=all`, with 0 unassigned paths. Push all seven together, and run
  `cd site && npm run prepush:clean` on the tip first.
- **Shared files:**
  - `site/package.json` carries 113's and 116's changes on one line, so it goes in C4, and both messages say so.
  - `site/public/updates/feed.json` and `feed.xml` are touched by both C6 and C7, so they go in C7, and both messages
    say so.
- **Excluded:** the America-at-250 pair and the nonprofit library, which still wait on your separate review.
- **Validated:** 116's `npm test` ran 83 steps, exit 0, on the combined tree. Iteration 117's checks are in its log
  entry.
- **Deploy procedure:** fast-forward `main`, `gh workflow run deploy.yml --ref main`, then V7 against
  `/build-manifest.json`.
- **Cost of delay:**
  - The six live defects stay live.
  - The 2026-10-22 edition's "this week" lead gets older every day.
  - The next edition, due 2026-10-29, writes to the same `site/src/data/model-watch/` files as C1.

## 2. D-13 / waiver D13-figure — **builds fail from 2026-11-17** — default: **the split recommendation**

- **Measured 2026-10-22:** `validate-product-separation.mjs` prints "D13-figure ... expires 2026-11-16 — 24 day(s)
  remaining". The validator counts days in UTC, and it was re-run at 2026-10-23 05:03 UTC (23:03 MDT on 10-22). Earlier
  the same evening it printed 25.
- **Earlier proof:** the fail-on-expiry behaviour was proved against a pinned date in
  `docs/FOUNDER_DECISION_PACKET_2026-09-29.md` Part 0. That run gave exit 1 on 2026-11-17.
- **Options:** the full analysis is in that packet, Part 0, and the dispositions are drafted in
  `docs/D-13_DETERMINATIONS_DRAFT_2026-09-17.md`.
- **Default (that packet's recommendation):**
  - Ratify D-13 and remediate the three cases a reader can see: 1X Technologies, Figure AI, and Boston Dynamics (SPOT
    demo).
  - Extend Amazon, Meta and Microsoft with an explicit dated waiver.
  - Remediation means index writes, which are yours (AUTONOMY §1b); the coordinator prepares them for your approval.
- **If you cannot decide this week:** approve **"extend D13-figure to 2026-12-16"**. That is one recorded waiver change;
  it buys time and resolves nothing.

## 3. Method wording and printed numbers: LRN-FIX-2, DIM-SCALE-COPY and DPB-SCALE — default: **fix all three**

All three change published method copy or printed numbers, so they are one decision.
- **LRN-FIX-2:** `site/src/app/methodology/page.tsx` presents dimension scores "out of 10" (/10), while the formula
  averages 0–5 means (backlog LRN-FIX-2). Fix: the page uses one scale, and `test:method-claims` fails on a planted "/10".
- **DIM-SCALE-COPY:** the entity section heading says "8 dimensions, scored 0–5", while the dimension bars run 1–5.
  Fix: the heading names the 1–5 scale.
- **DPB-SCALE:** `DimensionProfileBar` is fed `round(score × 20)` (the score/5 scale), so it disagrees with the
  corrected dimension cards. Fix: it is fed the same scale as the corrected cards. The printed numbers change.
- **Why it is yours:** each changes a published method claim or a printed number. LRN-FIX-2 has v2 score 17, the
  highest founder-gated item.

## 4. PROTOCOL-V2 with the D-60 bundle (P-FD-1 to P-FD-5) — default: **all defaults**

- **Protocol:** `research/model-runs/weekly/PROTOCOL.v2.json` now exists with status "proposed" (Iteration 115). It
  has 15 open values, each with a proposed default (counted by walking the file for `O<n>` blocks with `open: true`).
  - **Default (two steps):** you approve the open values at their defaults, and then the file's status becomes
    "ratified" (PROTOCOL-V2-2).
  - **Until then:** the "protocol ratified" ranking condition stays "not met" on `/ai-models/leaderboards` and
    `/ai-models/cycle`.
- **The D-60 bundle** (`docs/model-eval/PROGRAMME.md`, Phases 2–4):

| Ask | Default |
|---|---|
| **P-FD-1, the judge panel (O1)** | Start "v2.0-local": the three current Claude judges, judging by hand, labelled single-family, so local waves can run without a key. Move to 3 families once a key exists |
| **P-FD-2, sensitivity tags** | You name a qualified, paid human reviewer to tag the 93 items. No sensitive item is served until then (MF1) |
| **P-FD-3, tracked key files** | Keep the history, add an ignore rule for `keys/` in unpublished-pool runs, and keep the G-keys gate |
| **P-FD-4, experiment results** | They stay internal |
| **P-FD-5, one pilot-3 separation** | It does not survive the stricter resampling. Default: no change now; add a dated methods note when v2 adopts that method |

## 5. SPECIAL-MD-RENDER — the briefing renderer mangles "_" in URLs and code — default: **fix and regenerate**

- **Live:** the special-briefing markdown renderer turns "_" in URLs and code spans into `<em>`. It does this 24 times
  across 9 published briefings (the baseline in the `test-inline-spacing` waiver, which ends 2026-11-30).
- **Fix:** `scripts/build-special-briefings.mjs` leaves URLs and code spans alone, and the waiver is removed.
- **Why it is yours:** it regenerates published briefing files, including the held America-at-250 one. You approve
  the regenerated files; no briefing's text is edited by hand.

## 6. HOOK-DC23 — a harness hook against shell-quoting losses — default: **yes**

- **The problem:** DC-23 has 11 dated occurrences, and the practice rule was broken again on 2026-10-14.
- **Ask:** approve a PreToolUse hook in the Claude Code settings that refuses Bash commands containing a backtick
  inside a double-quoted `node -e` argument, proven by a planted probe.
- **Why it is yours:** it changes harness settings, so it needs your approval.

---

**Not in this packet (still open, unchanged):**
- **SIGNUP-ENDPOINT:** every "email me" form posts to Formspree, because `NEXT_PUBLIC_LISTMONK_URL` is unset in
  builds. Default: **keep Formspree**, and add a test that pins the endpoint. Moving to Listmonk needs the URL and a
  secret decision, which are yours, whenever you want to raise it.
- V2 ask 1 (hosted API key and spend ceiling), V2 ask 3 (standing commit authority for `waves/*`), and V2 ask 5 (the
  02:00 task).
- FD-2 (a model comparison) and FD-4 (scheduler and unattended commits).
- BLK-005 (human panel funding), the licence ruling, and the America-at-250 dated correction.
- D-43 to D-46 (rubric repairs) are in `docs/FOUNDER_DECISION_PACKET_2026-09-29.md`.
