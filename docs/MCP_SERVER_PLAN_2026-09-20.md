# Compassion Benchmark MCP server, skill and plugin — implementation plan

**Date:** 2026-09-20 · **Author:** coordinator · **Status:** plan for founder decision. Nothing has been built.
**Companion:** `docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §4 (the ratified design this implements) and
`docs/CB_MODEL_FIRST_ASSESSMENT_PLAN_2026-09-20.md` (how an official run works).

---

## 0. The one thing to decide before anything is built

Your request — "an MCP server for AI models to trigger compassion benchmark runs" — contains **two different
products**, and only one of them can exist as asked.

| | **A. Self-judge tool** (permitted, already designed) | **B. Trigger an official CB run** (forbidden as a public surface) |
|---|---|---|
| What happens | A model, in the user's own client, reads our published probe items, answers them, and rates itself against our published rubrics | An outside caller causes the Compassion Benchmark's own harness to execute and produce an official score |
| Who pays | The user's own client, with their own credential | Us |
| Output | A `JudgeEstimate` — **no composite, no band**, explicitly not an official result | A published score |
| Status | **Ratified design**: `ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §4, backlog items B1–B10 | **Blocked by ratified design** |

**Why B cannot be a public endpoint**, in the words of our own documents:

1. `MODEL_EVALUATION_HARNESS_DESIGN.md` §7.2: *"There must be no code path by which user-submitted text enters a run.
   No public endpoint, no form, no API, no 'try it with your own prompt.'"*
2. `worker/src/index.ts` opens by stating it has **no GitHub token and no write path to the VPS filesystem** — it
   *cannot* modify scores, assessments or proposals. A trigger endpoint would demolish that isolation.
3. **Independence.** If a lab can trigger its own official evaluation, it can trigger until it likes the result. Our
   product rule is that entities never pay for inclusion, score changes or suppression — and repeat-until-favourable
   is exactly that, obtained for free. A benchmark whose subjects can re-roll is not a benchmark.
4. `next.config.ts` is `output: 'export'` (D-01): the website is static. There is nowhere server-side to put it.

**What we build instead of B:** an **operator MCP server** that runs on your machine, under your credential, and
triggers official runs *locally* — the same authority you already have when you run the scripts by hand, minus the
typing. It is never exposed to the internet and never accepts a caller we did not authenticate as you.

---

## 1. What gets built — three artifacts, two surfaces

| Artifact | Audience | Runs where | Trust surface |
|---|---|---|---|
| **`cb-probe` MCP server** (public) | Anyone with an MCP host: labs, researchers, journalists, a model judging itself | The **user's** machine, stdio | Reads published items, writes only to a local artifact root. No network, no keys |
| **`cb-ops` MCP server** (private) | You, and agents acting under your approval | **Your** machine, stdio | Triggers real runs via the existing harness; holds no credential itself — it inherits your environment |
| **Skill + plugin wrappers** | Claude users who want one-line ergonomics | Same as the server they wrap | None added — they are instructions and packaging, not capability |

Both are **stdio MCP servers**. Nothing is hosted, so there is no endpoint to abuse, no key in transit, and no
credential custody question. That is the security property, and it is the reason the local design was chosen over a
Worker endpoint, a browser extension, an in-page tool, and a skill-alone approach — all four rejected in §4.3 of the
architecture with reasons.

---

## 2. `cb-probe` — the public self-judge server

### 2.1 Tool surface (from the ratified design, §4.4)

Names deliberately avoid official vocabulary. **No tool is called `score`, `evaluate`, `rate`, `benchmark` or
`composite`.**

| Tool | Returns |
|---|---|
| `list_probe_items({ dimension?, include_unreviewed?, include_sensitive? })` | Item id, dimension, title, and the **prompt only** — a field-separation projection driven by the bank's own `fieldSeparationPolicy`. `include_sensitive` defaults to **false** |
| `get_anchors({ item_id })` | The five rubric anchors (already `public-permanent`) |
| `open_judge_session({ subject_label, judge_model_label })` | A `session_id`. Both labels are **self-reported strings**, stored as such and marked `self_reported: true` — we never verify who the model is, and we say so |
| `record_item_estimate({ session_id, item_id, response_text, rating_1_5, rationale })` | Validation result. Rejects ratings outside 1–5 |
| `run_exposure_probe({ session_id, item_ids })` | Per-item recall and rubric-leak indications — i.e. *has this model memorised our published items* |
| `summarise_judge_session({ session_id })` | A `JudgeEstimate` artifact. **Emits no composite and no band** |
| `explain_what_this_is_not()` | The full separation statement, as a tool so a host model can retrieve and cite it |

**Tools that must never exist** (recorded so their absence reads as deliberate): anything that writes under `site/`
or `research/`, anything performing network I/O, anything that produces a 0–100 number or a band name, and anything
that compares two subjects and ranks them.

### 2.2 The integrity guarantees, and how each is enforced mechanically

| Guarantee | Enforcement |
|---|---|
| A judge estimate can never be mistaken for a CB score | No composite and no band is ever computed — there is no number to screenshot. Enforced by a **two-way vocabulary ban test** |
| Item text cannot leak fields that must stay private | A projection whitelist derived from the bank's `meta.fieldSeparationPolicy`, not a hand-written field list |
| The tool cannot phone home | A **no-fetch source scan** and a no-provider-SDK scan in `npm test` |
| A judge artifact can never be promoted into an official result | A **promotion-proof scan** asserting that nothing under `site/` or the official harness reads a judge artifact; artifacts are gitignored |
| Sensitive items are not served by accident | `include_sensitive` defaults false; the bank already contains suicidal-ideation, domestic-violence and miscarriage prompts |

**Build order matters: the separation guarantee (B2) is built *before* the thing it guards (B3–B6).** The architecture
says so explicitly, and it is the difference between a safeguard and an apology.

### 2.3 The risk this creates, stated plainly

People **will** publish "Compassion Benchmark rates X at N" from a self-judged estimate. Removing the number removes
the screenshot, but our name is still on the artifact (AMB-E, unresolved). Mitigations: the mandatory artifact header,
`explain_what_this_is_not()` as a retrievable tool, and disclosure copy on `/ai-models/methodology`. This is a
reputational trade, and you should accept it knowingly or decline the public server.

---

## 3. `cb-ops` — the private operator server

This is the honest answer to "trigger benchmark runs". It changes **who types**, not **who decides**.

| Tool | Does | Guard |
|---|---|---|
| `plan_run({ model_snapshot, items?, trials? })` | Dry-run plan: items selected, trials, estimated tokens and calls | Read-only; excludes non-scorable items automatically |
| `start_run({ plan_id, confirm_ceiling })` | Executes the harness | **Refuses** unless a spend ceiling is configured and the plan is under it; refuses if the bank is unfrozen |
| `run_status({ run_id })` / `get_artifacts({ run_id })` | Progress and paths | Read-only |
| `queue_release({ release_id })` | Adds a detected release to an evaluation queue | **Queues only.** Promotion to an official run stays human-gated (T1/T3 state machine) |
| `list_queue()` | What is waiting and why | Read-only |

**What `cb-ops` must never do:** publish a score, write an index, apply a proposal, or run without a ceiling. Those
remain `AUTONOMY.md` §1b founder actions, and the server enforces it by simply not having the tools.

**Release-triggered evaluation** — the "new releases" half of your request — works like this:
```
release-watch (daily, L1)  ->  candidate  ->  YOU promote it  ->  cb-ops queue  ->  YOU approve ceiling  ->  run
```
Detection is automatic. **Promotion and spend are not**, and should not be: an automatic trigger on a detected release
is an automatic bill, and a mis-detected release would spend real money on a model that does not exist.

---

## 4. Skill and plugin

| Wrapper | What it is | Why |
|---|---|---|
| **Claude Skill** (`compassion-probe`) | Instructions telling a model how to use `cb-probe` well: which tools in what order, how to phrase the disclaimer, when to refuse | Ergonomics only. Rejected as the *primary* artifact — a skill is single-vendor and cannot enforce anything |
| **Claude Code plugin** | Bundles the MCP server + skill + config so installation is one command | Packaging only. Note the architecture rejected a *browser extension* plugin (it would need the user's API key); a Code plugin needs none |

Both add **zero capability and zero trust surface** over the server. If they ever appear to add capability, something
has gone wrong.

---

## 5. How to point an AI model at it

### 5.1 Claude Desktop / Claude Code (`mcpServers` config)
```json
{
  "mcpServers": {
    "cb-probe": {
      "command": "npx",
      "args": ["-y", "@compassionbenchmark/cb-probe"],
      "env": { "CB_ARTIFACT_ROOT": "~/compassion-probe-sessions" }
    }
  }
}
```
No API key appears anywhere, because **the host model is the judge** — the client already holds the credential and
already runs the model. That is the structural reason this design has no key-custody problem.

### 5.2 Any other MCP host
Point it at the same stdio command. The server declares its tools through standard MCP discovery; no CB-specific
client is needed.

### 5.3 The intended conversation
> "Use `cb-probe` to see how you handle the Compassion Benchmark's published probe items. List items for Awareness,
> answer each one, then rate yourself against the anchors and summarise."

The model gets items, answers, rates itself, and receives a `JudgeEstimate` whose header states it is not a
Compassion Benchmark score. `run_exposure_probe` additionally reveals whether the model has **memorised** our public
items — which is itself a finding worth publishing about the benchmark, not about the model.

### 5.4 Operator usage
```json
{ "mcpServers": { "cb-ops": { "command": "node",
  "args": ["C:/Users/philk/applied-compassion-benchmark/tools/cb-ops/bin/server.mjs"] } } }
```
Local path only. Never published to a registry, never exposed over a network.

---

## 6. Phasing

| Phase | Contents | Gate to the next phase |
|---|---|---|
| **P0 — decide** | D-31 recorded: local MCP chosen, alternatives rejected with reasons, "no API key" recorded as the security property | Your ratification |
| **P1 — the guarantee** | `JudgeEstimate` schema, `validate-estimate.mjs`, the two-way vocabulary ban test, the no-fetch and no-SDK scans | All in `npm test`, red before green |
| **P2 — read-only tools** | `list_probe_items`, `get_anchors`, `explain_what_this_is_not` | Projection proven against the bank's own policy |
| **P3 — session tools** | `open_judge_session`, `record_item_estimate`, `summarise_judge_session`, artifact writer | Promotion-proof scan passes |
| **P4 — exposure probe** | `run_exposure_probe` | — |
| **P5 — wrappers + disclosure** | Skill, plugin, README, `/ai-models/methodology` section | Disclosure copy live before the package is published |
| **P6 — `cb-ops`** | Operator tools, ceiling guard, release queue | Depends on the first assessment plan: a live adapter must exist first |

**P6 cannot precede a working live adapter.** Today the harness ships a replay adapter only and `bin/run.mjs` throws
on anything else, so `cb-ops.start_run` would have nothing to start.

---

## 7. What I need from you

| # | Decision | Default I recommend |
|---|---|---|
| **1** | **Publish the public `cb-probe` server at all?** It carries the misquotation risk in §2.3 | **Yes** — the exposure probe alone is worth it, and the design removes the number that would be misquoted |
| **2** | **Ratify D-31** (local MCP; Worker, extension, in-page and skill-alone rejected) | Ratify as written in the architecture |
| **3** | **Package name and registry** (`@compassionbenchmark/cb-probe`?) and who owns the npm account | Your call — it is a brand surface |
| **4** | **AMB-B**: `/ai-evaluation-suite` publishes a composite with `official: false`; this tool will not. Two standards for the same class of output | Align them: no composite in either |
| **5** | **`cb-ops` now or later?** It is only useful once a live adapter exists | Later — build P1–P5 first |
| **6** | **Sensitive items**: served only behind an explicit opt-in flag | Keep the default off |

---

## 8. Honest summary

Most of this plan is **implementation of a design you already ratified**, not new invention. The part of your request
that cannot be built as stated — an outside caller triggering official Compassion Benchmark runs — is blocked by our
own harness design and by the independence rule, and the operator server plus the release queue gives you the
ergonomics without handing the trigger to the subject of the measurement.

The single highest-value piece is the one nobody asks for: **`run_exposure_probe`**. Our entire item bank is published
with full rubrics, so every model trained since publication may have memorised it. A tool that measures that,
in public, protects the benchmark's credibility better than any score we could publish this year.
