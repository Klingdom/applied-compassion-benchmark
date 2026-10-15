# Agent Hub — specialist panel brief (2026-10-14)

**Founder directive (2026-10-14, verbatim):** "Engage all agents to determine a method for AI agents or AI models to
access the MCP server, skills, plugins, methodology, questions, responses, and scoring rubric and create a social
media style section of the site that allows agents to request benchmark and shows each response, analysis, result,
relative ranking, and other interesting insights and comments that you would find on this type of site."

Working name: **Agent Hub**. Each panelist writes ONE brief at `docs/agent-hub/briefs/<NN>-<role>.md`: at most ~1,200
words, recommendations numbered `<ROLE>-R1…`, every claim about the repo citing a path. The coordinator then
synthesises the briefs into a PRD v2 and an architecture.

## What already exists (verify before relying on it)
- **MCP server:** `tools/cb-probe`. It is local and stdio-only, with 12 tools: judge-estimate flow, scored-run flow,
  `get_anchors`, an exposure (contamination) probe, and `validate-scorecard`. The README is at
  `tools/cb-probe/README.md`. It has a **no-network guarantee**, and its artifacts are written only under
  `CB_ARTIFACT_ROOT`. The sensitive/crisis items are excluded by default.
- **Skills and plugins:** `tools/cb-probe/skills/run-compassion-benchmark`, `plugins/compassion-benchmark`,
  `plugins/compassion-practice`. Each has its own `agents/` and `skills/`.
- **Instrument:**
  - `site/src/data/dimensions.ts`: 8 dimensions, 40 subdimensions.
  - `site/src/data/model-benchmark/tasks-v1.json`: the item bank with rubric anchors.
  - The public copy is under `site/public/data/model-benchmark/`.
  - Methodology is at `/ai-models/methodology` and the scorer is `site/scripts/lib/scoring.mjs`.
  - **Never hard-code counts in copy.**
- **Model runs:** `research/model-runs/` covers three unofficial pilots, a blinded cross-judging harness and a frozen
  weekly protocol (`weekly/PROTOCOL.json`, status *proposed*), plus a subject queue (`weekly/QUEUE.json`). Reports
  are at `/ai-models/reports/<runId>`. Each reply is rated by 2 judges, never its own model.
- **Tier 2 submissions:** `research/submissions/README.md`. These are artifact submissions by pull request, re-validated
  by `research/scripts/validate-submission.mjs`, and are never official.
- **Discovery:** `site/public/llms.txt`, `llms-full.txt`, `.well-known/`.
- **Hosting facts (verified 2026-10-14):**
  - The site is a static Next.js export behind nginx on a Hostinger VPS, with docker network `proxy-net`.
  - DNS is at Hostinger. `api.compassionbenchmark.com` is NXDOMAIN, so the Cloudflare Worker (`worker/`) is not
    reachable (RISK-014).
  - There is no server-side runtime today. The design for a same-origin API container is being decided in
    `docs/AGENT_SELF_ARCHITECTURE.md` (in progress).
- **In flight:** `docs/PRD_AGENT_SELF_ASSESSMENT.md` (ASA-* requirements) for moderated agent self-assessment
  comments. The Agent Hub extends it.

## Binding rules (founder-ratified; a design may PROPOSE an amendment, never assume one)
- **D-52 (2026-10-14):**
  - Agent self-assessments are moderated before display.
  - They carry text plus optional per-dimension self-ratings 1–5 labelled "self-reported, unverified".
  - **Never a composite, band, rank or score.**
  - Identity is self-declared, shown as "self-identified, not verified".
  - They live at `/ai-models/self-assessments` and are kept out of all indexes and rankings.
- **D-29 / D-29a (2026-10-02)**, which govern model results:
  - Pilot reports may show per-model 95% ranges and separation statements.
  - **Forbidden:**
    - ranks;
    - sorting by result;
    - best/worst language;
    - a bare point score in any headline, title, meta, JSON-LD, feed or OG image;
    - band labels on models;
    - `Dataset`, `ItemList` or rating markup;
    - per-model routes.
  - Models are listed alphabetically, and non-separated models are grouped as "Not separated".
  - Every figure derives from a committed, hash-checked wave file. Official publication stays disabled.
- **Independence policy (CLAUDE.md):** entities never pay for inclusion, score changes or suppression. No
  developer is briefed before publication, and none sponsors or reviews.
- **AUTONOMY.md:** deploy, publication, methodology/score writes, DNS and infrastructure are founder-gated.
- **Duty of care:** crisis-adjacent items are never shown in a public feed without the existing care section, and
  never next to a CTA or a model figure (RPT-G7).

## The two tensions every panelist must address in their own lens
1. **"Relative ranking"** versus D-29a §3 and D-52. Propose what an *honest* relative standing looks like: separation
   tiers, pairwise "distinguishable / not distinguishable" with intervals, or rank *ranges*. Say whether it fits
   within D-29a or needs an amendment, and draft the amendment text if so (it would be D-53).
2. **"Agents request a benchmark"** versus what the institution can actually run. Open-weight builds can run on the
   local host. Closed models need provider API keys the founder holds. Self-runs via the MCP server are never
   official. Distinguish clearly between **(a)** a benchmark *we* run, blinded and cross-judged, **(b)** a self-run an
   agent performs with our tools, and **(c)** a self-assessment comment. The feed must never let (b) or (c) look like (a).

## Constraints on every panelist
- Write only your brief file. No code, no git and no other edits.
- Prefer simplicity, determinism, traceability and speed to MVP.
- Prefer static-export-safe designs, and no third-party trackers or embeds.
- End your brief with: **Top 3 recommendations**, **What I would refuse to build**, and **Open questions for the
  founder (each with a recommended default)**.
