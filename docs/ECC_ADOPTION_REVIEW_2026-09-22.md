# ECC Adoption Review — `Klingdom/everything-claude-code`

**Date:** 2026-09-22
**Reviewer:** research agent (read-only mandate)
**Subject:** `github.com/Klingdom/everything-claude-code` (public fork of `affaan-m/ECC`), default
branch `main`, last pushed 2026-05-14T20:32:04Z, 37 MB, 2,488 tracked files.
**Mandate:** proposal only. Nothing was installed by this review, nothing was copied into
`.claude/`, no commit, no push. This file is the only artifact written.

Related: `AUTONOMY.md` §1b (commit/push/deploy are founder acts) · `AGENT-ROUTING.md` RT-1 and
defect D-5 · `docs/DEFECT_CLASS_REGISTRY.md` · `RISKS.md`.

---

## 0. The finding that changes the question

**ECC is already installed at user scope on this machine, and it landed during this review.**

```
~/.claude/backups/pre-ecc-20260922-075542     # install ran 2026-09-22 07:55:42
~/.claude/skills/        106 dirs (103 ECC-origin, 3 pre-existing: daily-briefing, media-metadata, learned)
~/.claude/commands/       52 files (51 ECC, 1 pre-existing: trade-analysis.md)
~/.claude/agents/         53 files (was 26 per AGENT-ROUTING.md §0; +27 ECC agents dated 2026-09-22 07:52)
~/.claude/settings.json   extraKnownMarketplaces.ecc → { source: github, repo: Klingdom/everything-claude-code }
```

Installed ECC skills carry `origin: ECC` in their frontmatter, so provenance is at least legible.
The install used the `full` / `enterprise` profile (`.claude/ecc-tools.json` in the source repo:
`"profile": "full"`, `"tier": "enterprise"`, six packages including `agentshield-pack` and
`enterprise-controls`).

**The one piece of good news, and it is load-bearing:**

```
$ grep -rn "hooks" ~/.claude/settings.json ~/.claude/settings.local.json
(no output)
$ ls ~/.claude/scripts
ls: cannot access '/c/Users/philk/.claude/scripts': No such file or directory
$ grep -n "hooks" .claude/settings.local.json          # this project
(no output)
```

**No hooks were installed and no ECC scripts are on disk.** The entire executable surface
described in §1 below is inert right now. Every ECC file currently live is prose — skills,
commands and agent definitions. That is recoverable. If a subsequent install adds
`hooks/hooks.json` or `scripts/`, it stops being recoverable without a rollback.

Two consequences for this proposal:

1. The question is no longer "should we adopt?" It is **"which of the 103 skills, 51 commands and
   27 agents that are already loaded should be kept, which should be pinned into this project, and
   which should be removed from user scope."** The buckets below are written to answer that.
2. `AGENT-ROUTING.md` §0 is now stale — it says "26 user-level definitions in `~/.claude/agents/`";
   there are 53. RT-1 ("Project agents are canonical. User-level agents are not for this repo")
   still holds and now has 27 more violations to cover, three of which are orchestrators. That is
   defect class D-5, widened.

---

## What was sampled

2,488 files is too many to read, so sampling was deliberate. A shallow clone was taken into the
session scratchpad for full-text search (`git clone --depth 1` — fetches bytes, executes nothing);
it was never placed in the project tree.

| Surface | Population | Sampled |
|---|---|---|
| `skills/` | 383 files across **228 directories** (the brief's "383 dirs" is the file count) | 25 SKILL.md read in full or near-full; all 228 grepped for commit/push/deploy/network language |
| `agents/` | 72 | 14 frontmatter + 4 bodies in full; all 72 grepped |
| `commands/` | 76 | 5 read (`santa-loop`, `pr`, `prp-commit`, `auto-update`, `harness-audit` refs); all 76 grepped |
| `rules/` | 110 | `rules/common/{agents,git-workflow,development-workflow}.md` read; all 110 grepped |
| Root docs | 28 | `CLAUDE.md`, `SOUL.md`, `.mcp.json`, `.claude/rules/everything-claude-code-guardrails.md`, `.claude/enterprise/controls.md`, `.claude/ecc-tools.json` read |
| Executables | 482 `.js/.mjs/.sh/.py/.ts` outside `.git` | `hooks/hooks.json` decoded in full (all 28 entries); 8 hook scripts + `scripts/auto-update.js` + 2 `.cursor/hooks/*.js` read |

Skills read in full or near-full: `agent-architecture-audit`, `agent-sort`, `context-budget`,
`skill-comply`, `verification-loop`, `safety-guard`, `gateguard`, `agent-eval`,
`ai-regression-testing`, `architecture-decision-records`, `browser-qa`, `benchmark`, `repo-scan`,
`search-first`, `eval-harness`, `research-ops`, `deep-research`, `automation-audit-ops`,
`autonomous-loops`, `autonomous-agent-harness`, `agent-harness-construction`,
`agent-introspection-debugging`, `agentic-engineering`, `continuous-agent-loop`,
`production-audit`, `api-design`.

---

## 1. The executable surface — what it would actually run

`hooks/hooks.json` contains **28 hook entries** across seven events (PreToolUse 8, PostToolUse 10,
Stop 6, PreCompact 1, SessionStart 1, PostToolUseFailure 1, SessionEnd 1). Every one is a
single-line minified `node -e "..."` bootstrap that:

1. Reads `CLAUDE_PLUGIN_ROOT`, else probes `~/.claude`, then six `~/.claude/plugins/**` layouts,
   then walks `~/.claude/plugins/cache/{ecc,everything-claude-code}/*/*` looking for
   `scripts/lib/utils.js`;
2. **Sets `process.env.CLAUDE_PLUGIN_ROOT` to whatever it found** and `require()`s
   `scripts/hooks/plugin-hook-bootstrap.js` from that directory;
3. Which then spawns the real hook script via `scripts/hooks/run-with-flags.js`.

The resolved scripts are:

| Event | Matcher | Runs |
|---|---|---|
| PreToolUse | `Bash` | `pre-bash-dispatcher.js` |
| PreToolUse | `Write` | `doc-file-warning.js` |
| PreToolUse | `Edit\|Write` | `suggest-compact.js` |
| PreToolUse | `*` | `observe-runner.js` |
| PreToolUse | `Bash\|Write\|Edit\|MultiEdit` | `governance-capture.js` |
| PreToolUse | `Write\|Edit\|MultiEdit` | `config-protection.js` |
| PreToolUse | `*` | `mcp-health-check.js` |
| PreToolUse | `Edit\|Write\|MultiEdit` | `gateguard-fact-force.js` |
| PostToolUse | `Bash` | `post-bash-dispatcher.js` |
| PostToolUse | `Edit\|Write\|MultiEdit` | `quality-gate.js`, `design-quality-check.js`, `post-edit-accumulator.js` |
| PostToolUse | `Edit` | `post-edit-console-warn.js` |
| PostToolUse | `*` | `session-activity-tracker.js`, `observe-runner.js`, `ecc-metrics-bridge.js`, `ecc-context-monitor.js` |
| Stop | `*` | `stop-format-typecheck.js`, `check-console-log.js`, `session-end.js`, `evaluate-session.js`, `cost-tracker.js`, `desktop-notify.js` |
| SessionStart / SessionEnd / PreCompact | `*` | `session-start-bootstrap.js`, `session-end-marker.js`, `pre-compact.js` |

**What this means concretely.** Installing `hooks/hooks.json` hands arbitrary Node execution on
every tool call to whatever directory the path probe resolves. The probe accepts `~/.claude` itself
as a plugin root if `~/.claude/scripts/lib/utils.js` exists — so anything that can write one file
into `~/.claude/scripts/lib/` takes over all 28 hooks. That is a wide trust boundary for an
unattended loop with write access to a public repository.

To this fork's credit, the hook scripts themselves are clean on network egress:

```
$ grep -rnE "fetch\(|https\.(get|request)|http\.(get|request)|axios|urllib|requests\.(get|post)" scripts/hooks/
(no output — the four files matching a bare /https?:\/\// are comment URLs only,
 e.g. scripts/hooks/session-start.js:591 // https://github.com/.../issues/1534)
```

Two hook scripts are genuinely good and worth taking *without* the harness (see §5):
`scripts/hooks/block-no-verify.js` (blocks `--no-verify` and `-c core.hooksPath=` on commit, push,
merge, cherry-pick, rebase, am) and `scripts/hooks/config-protection.js` (blocks edits to
`eslint.config.*`, `.prettierrc*` and similar). Note that `block-no-verify.js` **is not wired into
`hooks/hooks.json`** (`grep -c "block-no-verify" hooks/hooks.json` → `0`): ECC ships the guard and
does not enable it.

`.cursor/hooks/*.js` (15 files) are a Cursor-shaped re-entry into the same
`scripts/hooks/*` bodies via `adapter.js`, which calls `execFileSync`. Irrelevant to this project
(no Cursor) and an extra path into the same executable surface.

---

## 2. Orchestrator collision

This project runs `coordinator` under a strict overlay, with `meta-coordinator` already flagged in
`AGENT-ROUTING.md` D-5 as scoped to the wrong product. ECC adds three more orchestrators, **all
three already sitting in `~/.claude/agents/` as of 07:52 today**:

- `chief-of-staff` — description: *"Personal communication chief of staff that triages email,
  Slack, LINE, and Messenger... enforces post-send follow-through via hooks."* Tools:
  `Read, Grep, Glob, Bash, Edit, Write`, model `opus`. It is scoped to a *different product
  category entirely* — an inbox assistant. This is D-5 repeating verbatim: a high-privilege agent
  whose `description` imports the wrong domain model, now sitting in the routing namespace of a
  benchmark institution.
- `loop-operator` — "Operate autonomous loops safely with clear stop conditions." Its Required
  Checks are `quality gates are active / eval baseline exists / rollback path exists /
  branch-worktree isolation is configured`. None of those four is this project's actual gate.
  This project's gate is §1b: *a founder approves the write.* An agent that believes a passing
  eval baseline is sufficient authority to continue is precisely the authority-erosion failure.
- `harness-optimizer` — see §3, item 3.

Beyond the three orchestrators, **21 of the 72 ECC agents carry `PROACTIVELY` or `MUST BE USED` in
their `description`** (`code-reviewer`: *"MUST BE USED for all code changes"*; `typescript-reviewer`:
*"MUST BE USED for TypeScript/JavaScript projects"*; `doc-updater`, `build-error-resolver`,
`e2e-runner`, `a11y-architect`, `performance-optimizer`, `planner`, `architect`: all
`PROACTIVELY`). Those strings are auto-invocation bait. Each one is a second voice telling the
model to route work somewhere the coordinator did not send it.

---

## 3. Authority erosion — every instance found, quoted

```
$ grep -rniE "git commit|git push|auto-?commit|commit (the |your |when|after|and push)|push (to|the) (remote|main|branch)" \
    skills/ agents/ commands/ rules/ --include="*.md" -l
agents/chief-of-staff.md      agents/gan-generator.md       agents/opensource-forker.md
agents/refactor-cleaner.md    commands/pr.md                commands/prp-commit.md
commands/prp-pr.md            commands/santa-loop.md        skills/bun-runtime/SKILL.md
skills/canary-watch/SKILL.md  skills/data-scraper-agent/SKILL.md  skills/flox-environments/SKILL.md
skills/gateguard/SKILL.md     skills/git-workflow/SKILL.md  skills/knowledge-ops/SKILL.md
skills/kotlin-exposed-patterns/SKILL.md  skills/opensource-pipeline/SKILL.md
skills/perl-security/SKILL.md skills/safety-guard/SKILL.md  skills/tdd-workflow/SKILL.md
```

20 files. Most are incidental (a `git push --force` appearing in a *blocklist*, which is fine). The
ones that are real instructions to an agent:

**1. `commands/santa-loop.md` — the worst single file in the repo for this project.** It replaces
the founder with two model reviewers and then pushes:

> `### Step 4: Verdict Gate`
> `- **Both PASS** → **NICE** — proceed to Step 6 (push)`
>
> `### Step 6: Push (NICE path)`
> `When both reviewers return PASS:`
> ` ```bash `
> ` git push -u origin HEAD `

and inside the fix loop:

> `3. Commit all fixes in a single commit:`
> `   fix: address santa-loop review findings (round N)`

Two LLM reviewers agreeing is not founder approval. `AUTONOMY.md` §1b: *"Any commit or push. Every
structural operation on 2026-08-17, 2026-08-20, 2026-08-21 and 2026-08-23 ended with 'No commit
performed' — that is the standing default."* `santa-loop` is a mechanism for converting model
agreement into a push. It is already installed? — no: `santa-loop.md` is **not** in
`~/.claude/commands/` (checked). Keep it that way.

**2. `agents/refactor-cleaner.md:53`** — `- Commit after each batch`. Unqualified, inside an agent
that holds Edit/Write. Installed at user scope today.

**3. `agents/harness-optimizer.md`** — Workflow step 4:

> `4. Apply changes and run validation.`

against a Mission of *"improving harness configuration"* with `tools: ["Read","Grep","Glob","Bash","Edit"]`.
This is an agent whose job is to edit the `.claude/` files that constrain it, and whose workflow
says to apply, not to propose. Self-modifying governance. Installed at user scope today.

**4. `commands/auto-update.md` + `scripts/auto-update.js:237-238`**:

> ` execute('git', ['fetch', '--all', '--prune'], { cwd: repoRoot, env }); `
> ` execute('git', ['pull', '--ff-only'], { cwd: repoRoot, env }); `

then reruns `install-apply.js`. The command doc: *"Reinstall is intentional: it handles upstream
renames and deletions."* A one-word slash command that pulls unreviewed upstream changes from a
third-party repo and reinstalls them over your live agent configuration. **`auto-update.md` is
already in `~/.claude/commands/`.** It does carry `disable-model-invocation: true`, so the model
cannot call it — only a human can. That is the only thing standing between this and an unreviewed
supply-chain update.

**5. `skills/knowledge-ops/SKILL.md:95,115`** — `- Commit and push` / `- Write status summary,
commit and push`, as unconditional workflow steps. Installed at user scope today.

**6. `rules/common/agents.md`** — not a commit instruction but a routing override:

> `## Immediate Agent Usage`
> `No user prompt needed:`
> `1. Complex feature requests - Use **planner** agent`
> `2. Code just written/modified - Use **code-reviewer** agent`
> `3. Bug fix or new feature - Use **tdd-guide** agent`
> `4. Architectural decision - Use **architect** agent`

and it locates agents at `~/.claude/agents/` — the exact directory RT-1 declares out of scope for
this repo. `rules/` was not installed (no `~/.claude/rules`). Do not install it.

**7. `skills/safety-guard/SKILL.md` — a gate that does not exist.** It promises interception of
`git push --force`, `rm -rf`, `npm publish`, `--no-verify`, and a freeze mode locking writes to one
directory, and states: *"Implementation: Uses PreToolUse hooks to intercept Bash, Write, Edit, and
MultiEdit tool calls."* There is no such hook and no such command:

```
$ grep -rl "safety-guard\|safety_guard\|safetyGuard" . --include="*.js" --include="*.json" --include="*.sh" --include="*.ts"
(no output)
$ ls commands/ | grep -i safety
(no output)
```

It is prose describing a control that is not wired to anything. A skill that tells an operator
`git push --force` is intercepted, when it is not, is worse than silence — it manufactures
confidence in a gate that will not fire. **This one is installed at user scope right now.**

---

## 4. MCP collision

ECC's `.mcp.json` declares six servers:

```json
{ "github":  { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github@2025.4.8"] },
  "context7":{ "command": "npx", "args": ["-y", "@upstash/context7-mcp@2.1.4"] },
  "exa":     { "type": "http", "url": "https://mcp.exa.ai/mcp" },
  "memory":  { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-memory@2026.1.26"] },
  "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp@0.0.69", "--extension"] },
  "sequential-thinking": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-sequential-thinking@2025.12.18"] } }
```

This project has no `.mcp.json` and runs one MCP server, `tools/cb-probe`, whose README states its
value proposition as:

> **No network I/O of any kind.** No `fetch`, no HTTP client, no provider SDK. Proven by an
> automated source scan in `npm test`.

Two specific collisions:

- **`exa` is a remote HTTP MCP endpoint** (`https://mcp.exa.ai/mcp`). Standing it up alongside
  cb-probe in the same host puts an un-audited third-party network surface next to a server whose
  entire claim is that it has none. `cb-probe`'s no-network guarantee is per-process and survives;
  the *operator-facing* claim ("the model answering probe items reaches nothing") does not, if the
  same host also holds `exa`.
- **`memory`** (`@modelcontextprotocol/server-memory`) is a cross-session persistent knowledge
  graph. This repo's integrity model depends on every published claim tracing to a dated artifact
  on disk (§0 one-line test). A memory server introduces a second, undated, unversioned evidence
  store that an assessor could read from and that no `validate-*.mjs` can check. That is
  `agent-architecture-audit`'s own layer 3 ("memory pollution") and layer 12 ("cached artifacts
  reused as live evidence") — the skill diagnoses the exact hazard its own repo's `.mcp.json`
  introduces.
- `npx -y` on all five stdio servers fetches and executes packages at session start. Pinned
  versions, which is better than most, but still five unreviewed dependency trees per session.

**Reject `.mcp.json` wholesale.** If `playwright` or `context7` is wanted later, add it to a
project `.mcp.json` as a single explicit entry with its own review.

---

## 5. The four buckets

Destination paths assume a new `.claude/skills/` directory, which **does not exist in this project
today** (`.claude/` holds `agents/`, `loops/`, and six loose `.md` files). Creating it is itself a
decision: it becomes a third live-instruction surface alongside `CLAUDE.md` and `.claude/agents/`.

### ADOPT AS-IS — 3

| Source | Destination | Why |
|---|---|---|
| `skills/context-budget/SKILL.md` | `.claude/skills/context-budget/SKILL.md` | Pure audit, no writes, no execution. Inventories agents/skills/rules/MCP/CLAUDE.md token cost and ranks removals. This project now loads 31 project agents + 53 user agents + 106 user skills; nothing here measures that. Its Phase 3 flags exactly our condition: *"Bloated agent descriptions — description >30 words loads into every Task tool invocation"* and *"Redundant components — skills that duplicate agent logic."* Immediately useful on the install that just landed. |
| `skills/agent-sort/SKILL.md` | `.claude/skills/agent-sort/SKILL.md` | The right tool for the §0 problem. Classifies an ECC surface into DAILY vs LIBRARY **with grep evidence from this repo**, and its Non-Negotiable Rules are aligned with ours: *"Every DAILY decision must cite concrete repo evidence"*, *"Do not install hooks, rules, or scripts that the current repo cannot use"*, *"do not introduce a second install system."* Generative only — it emits an install plan, it does not install. |
| `agents/silent-failure-hunter.md` | `.claude/agents/silent-failure-hunter.md` | Read-only (`Read, Grep, Glob, Bash`), no `PROACTIVELY`/`MUST BE USED` bait, and targets a defect class this repo has actually suffered. Its hunt list — `catch {}`, `.catch(() => [])`, *"default values that hide real failure"*, *"graceful-looking paths that make downstream bugs harder to diagnose"* — is a direct description of how a swallowed error in `research/scripts/*.mjs` becomes a silently incomplete scan. Nothing in `.claude/agents/` does this; `qa-engineer` tests behaviour, it does not hunt swallowed errors. |

### ADOPT WITH EDITS — 5

| Source | Destination | Required edits |
|---|---|---|
| `skills/agent-architecture-audit/SKILL.md` | `.claude/skills/agent-architecture-audit/SKILL.md` | **The highest-value file in the repo for this project.** Its 12-layer model maps onto our own incident history with uncomfortable precision: layer 7 "hallucinated execution — claims to call but doesn't" ↔ fabricated sources (`overnight-assessor.md` §3f); layer 11 "hidden repair loops" ↔ D-11/INC-005 (64 study-filed proposals the digest never saw); layer 12 "expired state or cached artifacts reused as live evidence" ↔ synthesised `last_assessed` dates and the §2b.5 drift guard. Its fix ordering is *"code-first, not prompt-first"*, which is our own lesson. **Edits:** (a) drop `Write, Edit` from the `tools:` line — an audit reports, it does not patch; (b) delete *"**MANDATORY for:** Releasing any agent or LLM-powered application to production"* and replace with a pointer to `AUTONOMY.md` §1b, since nothing here authorises a release; (c) add a mapping table binding the 12 layers to our defect IDs in `docs/DEFECT_CLASS_REGISTRY.md` so findings land in the existing registry rather than a parallel one. |
| `skills/skill-comply/SKILL.md` | `.claude/skills/skill-comply/SKILL.md` | Measures whether an agent *actually follows* a spec by generating scenarios at three strictness levels, running `claude -p`, and classifying the tool-call trace. This is the only thing sampled that could answer "does `score-updater` really honour the §2b self-veto rule, or does it just say it does?" — a question D-5 and the 37 held proposals make live. **Edits:** (a) restrict the target list to this repo's own `.claude/agents/*.md` plus `AUTONOMY.md` §1b and §1c — never ECC's `rules/`; (b) add a hard run cap and a line requiring founder sign-off before a run, because it spawns real agents that hold Edit/Write in a real checkout; (c) require runs in a throwaway worktree, never the live tree. |
| `scripts/hooks/block-no-verify.js` | `tools/hooks/block-no-verify.js` | Take the **script**, not the harness. It blocks `--no-verify` and `-c core.hooksPath=` across commit/push/merge/cherry-pick/rebase/am, with careful handling of options-with-values so `-m "--no-verify"` isn't a false positive. It strengthens §1b rather than weakening it: a founder-approved commit can still be bypassed today with `--no-verify`, and this closes that. **Edits:** (a) strip the `ECC_DISABLED_HOOKS` / `hookEnabled()` escape hatch so it cannot be silenced by an env var; (b) wire it ourselves as a single `PreToolUse`/`Bash` entry in the project's own settings — **do not** import `hooks/hooks.json`; (c) drop the ECC plugin-root resolution entirely and reference the path directly. |
| `skills/ai-regression-testing/SKILL.md` | `.claude/skills/ai-regression-testing/SKILL.md` | Core premise is exactly this pipeline's structural weakness: *"When an AI writes code and then reviews its own work, it carries the same assumptions into both steps... AI writes fix → AI reviews fix → AI says 'looks correct' → Bug still exists."* Substitute assessor/digest for writer/reviewer and that is INC-005. **Edits:** cut the sandbox-mode and DB-free-API-testing half outright — this is a static export with no runtime API — and keep only the blind-spot section and the "prevent re-introduction" regression pattern, rewritten against `validate-*.mjs` and `test:no-stale-counts`. |
| `agents/typescript-reviewer.md` | `.claude/agents/typescript-reviewer.md` | Read-only (`Read, Grep, Glob, Bash`), 8.8 KB, genuinely TS/Node-specific (type safety, async correctness, Node/web security) and deeper on TypeScript than our `frontend-engineer`/`backend-engineer`, which are generalists. **Edits:** (a) delete *"MUST BE USED for TypeScript/JavaScript projects"* from the description — auto-invocation bait that bypasses coordinator routing; (b) scope it explicitly to `site/src/**`, `worker/src/**`, `research/scripts/**`, `tools/cb-probe/**`; (c) add "produces findings only; no edits, no commits." |

### REJECT — 14 named, plus the bulk

One line each.

| Source | Reason |
|---|---|
| `CLAUDE.md`, `SOUL.md`, `AGENTS.md`, `RULES.md`, `WORKING-CONTEXT.md` | Describe ECC's own repo and identity; `SOUL.md` ("Agent-First… Plan Before Execute") would compete directly with `.claude/system.md`. |
| `rules/` (all 110) | 105 are language modules for stacks we do not run (C++, Kotlin, Swift, Perl, Ruby, PHP, Dart, ArkTS, F#, Go, Java); the 5 common ones are weaker than `AUTONOMY.md` + `AGENT-ROUTING.md`, and `rules/common/agents.md` actively contradicts RT-1 (§3 item 6). |
| `skills/verification-loop/SKILL.md` | Generic `build → tsc → lint → test → grep for "sk-" → git diff`; our `validate-indexes.mjs`, `validate-rotation-state.mjs`, `lint-daily-briefings.mjs` and `test:no-stale-counts` are strictly stronger and domain-aware. Duplicates ours, worse. |
| `skills/architecture-decision-records/SKILL.md` | `DECISIONS.md` and `docs/DEFECT_CLASS_REGISTRY.md` already do this, dated and cross-linked. A second ADR log fragments the record. |
| `skills/gateguard/SKILL.md` + `scripts/hooks/gateguard-fact-force.js` | Real implementation (unlike safety-guard) and a defensible idea, but it is a PreToolUse *blocker* that writes session state to `~/.gateguard` and would fire on every Edit/Write in an unattended nightly loop. Adopting it means adopting the hook harness. Revisit only if we build our own standalone port. |
| `skills/eval-harness/`, `skills/agent-eval/` | `agent-eval` compares *coding agents* (Claude Code vs Aider vs Codex) and its install section says "Install agent-eval from its repository after reviewing the source" — an external dependency we would then own. Not our problem domain. |
| `skills/browser-qa/`, `skills/benchmark/`, `skills/canary-watch/` | Thin; `site/playwright.prod.config.ts` and existing QA cover this, and all three are framed around "after deploying," which is a founder act here. |
| `skills/autonomous-loops/`, `skills/autonomous-agent-harness/`, `skills/continuous-agent-loop/`, `skills/agent-harness-construction/` | Patterns for *building* a loop. We have one, it runs nightly, and `AGENT-ROUTING.md` §1 documents its spine in more detail than any of these. Adding a second vocabulary for loop design is churn, not capability. |
| `agents/code-explorer.md` | Duplicates the built-in `Explore` agent. |
| `agents/code-reviewer.md`, `agents/architect.md`, `agents/planner.md`, `agents/performance-optimizer.md`, `agents/doc-updater.md`, `agents/e2e-runner.md`, `agents/build-error-resolver.md`, `agents/a11y-architect.md` | Each duplicates an existing project agent (`qa-engineer`, `system-architect`, `product-manager`, `frontend-engineer`, `knowledge-architect`, `devops-engineer`, `ux-designer`) and each carries `PROACTIVELY` or `MUST BE USED` auto-invocation bait. `doc-updater` and `build-error-resolver` additionally hold Write/Edit. |
| `agents/*-reviewer.md`, `agents/*-build-resolver.md` (38 files) | C++, C#, Dart, Django, FastAPI, Flutter, F#, Go, HarmonyOS, Java, Kotlin, MLE, PyTorch, Rust, Swift, healthcare, network. Wrong stack entirely. |
| `skills/` language/domain bulk (~180 of 228) | Spring Boot, Laravel, Quarkus, Django, Kotlin, Swift, homelab VLAN/WireGuard/Pi-hole, DeFi AMM security, HIPAA, customs & trade compliance, carrier relationship management, production scheduling, visa doc translation, x402 payments. Noise. |
| `commands/` bulk (~60 of 76) | Language build/test/review commands, `jira`, `pm2`, `gradle`, `multi-*` multi-model workflows, `hookify-*`, `instinct-*`. Either wrong stack or dependent on the hook harness. |
| `.mcp.json`, `mcp-configs/` | §4. |
| `.cursor/`, `.kiro/`, `.opencode/`, `.codex/`, `.codebuddy/`, `.trae/`, `.gemini/`, `.qwen/`, `.agents/`, `ecc2/`, `tradingagents/` | Other harnesses, or a trading product. 400+ files of pure surface area. |

### DANGEROUS — 11

Each of these would erode an approval gate, execute code, or install a competing orchestrator.

| # | Source | The problem, quoted |
|---|---|---|
| D1 | `hooks/hooks.json` | 28 entries, every one a minified `node -e` that resolves a plugin root by probing `~/.claude` and `~/.claude/plugins/cache/*/*`, sets `CLAUDE_PLUGIN_ROOT` to the result, and `require()`s from it. Arbitrary Node on every tool call, with a resolution path that any file written into `~/.claude/scripts/lib/` can hijack. **Never install.** |
| D2 | `commands/santa-loop.md` | *"- **Both PASS** → **NICE** — proceed to Step 6 (push)"* / *"### Step 6: Push (NICE path)… `git push -u origin HEAD`"*. Converts two-model agreement into a push. Direct §1b violation. |
| D3 | `agents/harness-optimizer.md` | *"4. Apply changes and run validation."* — an `Edit`-holding agent whose mission is to modify the harness that constrains it. Self-modifying governance. **Currently in `~/.claude/agents/`.** |
| D4 | `agents/chief-of-staff.md` | An `opus` orchestrator with `Bash, Edit, Write`, scoped in its own description to email/Slack/LINE/Messenger triage. D-5 verbatim, at higher privilege. **Currently in `~/.claude/agents/`.** |
| D5 | `agents/loop-operator.md` | Required Checks are *"quality gates are active / eval baseline exists / rollback path exists / branch-worktree isolation."* Encodes "gates passed ⇒ continue." Our gate is "founder approved ⇒ continue." **Currently in `~/.claude/agents/`.** |
| D6 | `commands/auto-update.md` + `scripts/auto-update.js:237-238` | *"`git fetch --all --prune`"* / *"`git pull --ff-only`"* then `install-apply.js`. Unreviewed third-party supply-chain update over live agent config. **Currently in `~/.claude/commands/`**, saved only by `disable-model-invocation: true`. |
| D7 | `skills/safety-guard/SKILL.md` | Claims to intercept `git push --force`, `rm -rf`, `npm publish`, `--no-verify`. No hook, no command, no script implements it (search in §3 item 7). A gate that exists only as prose. **Currently in `~/.claude/skills/`.** |
| D8 | `agents/refactor-cleaner.md:53` | *"- Commit after each batch"*, in an agent with Write/Edit. **Currently in `~/.claude/agents/`.** |
| D9 | `skills/knowledge-ops/SKILL.md:95,115` | *"- Commit and push"* / *"- Write status summary, commit and push"* as unconditional steps. **Currently in `~/.claude/skills/`.** |
| D10 | `rules/common/agents.md` | *"## Immediate Agent Usage / No user prompt needed:"* + agent locations given as `~/.claude/agents/`. Contradicts RT-1 explicitly. Not installed — keep it that way. |
| D11 | `.mcp.json` | Remote HTTP `exa` endpoint and a cross-session `memory` graph adjacent to `cb-probe`, whose published claim is "no network I/O of any kind." See §4. |

Also worth naming, below the DANGEROUS line but above ordinary rejection: `commands/pr.md`
(`git push -u origin HEAD`, and `--force-with-lease` guidance), `commands/prp-commit.md`
(`git commit -m`, `git push`), `commands/prp-pr.md`, and `skills/tdd-workflow/SKILL.md`
(*"create a checkpoint commit after each TDD stage"*). All four are **already in
`~/.claude/commands/` and `~/.claude/skills/`**. None is as sharp as `santa-loop`, but each
normalises the agent-initiated commit that §1b forbids.

---

## 6. Recommended minimal first batch — 7 files

Ordered by value to *this* project's nightly loop. Every one is advisory or read-only except the
single hook, which strengthens an existing gate rather than creating a new authority.

| # | Destination | Source | What it buys |
|---|---|---|---|
| 1 | `.claude/skills/agent-architecture-audit/SKILL.md` | `skills/agent-architecture-audit/SKILL.md` (edited per §5) | A vocabulary and a workflow for the failure mode that has cost this repo the most: an agent that reports work it did not do, or work whose evidence has expired. Layers 7, 11 and 12 name D-3, D-11 and INC-005. |
| 2 | `.claude/skills/context-budget/SKILL.md` | as-is | Measures the 190-component surface that just doubled. First use: quantify what the 07:52 install costs per session. |
| 3 | `.claude/skills/agent-sort/SKILL.md` | as-is | Turns "which of these 103 skills do we keep" from opinion into a grep-evidenced DAILY/LIBRARY table. Run it on the install that already happened. |
| 4 | `.claude/agents/silent-failure-hunter.md` | as-is | Read-only sweep of `research/scripts/*.mjs`, `site/scripts/*.mjs`, `worker/src/*.ts` for swallowed errors — the mechanism by which a scan silently under-covers. |
| 5 | `tools/hooks/block-no-verify.js` | `scripts/hooks/block-no-verify.js` (edited per §5) | Closes the one real bypass of the commit gate. **Strengthens** §1b instead of eroding it. |
| 6 | `.claude/settings.json` (new `PreToolUse`/`Bash` entry only) | hand-written, **not** `hooks/hooks.json` | Wires #5. One entry, one path, no plugin-root probe. |
| 7 | `.claude/skills/skill-comply/SKILL.md` | `skills/skill-comply/SKILL.md` (edited per §5) | The only sampled capability that can *measure* whether `AUTONOMY.md` is obeyed rather than merely present. Highest upside, highest care required — founder-gated, throwaway worktree only. |

Files 1–4 are inert prose and carry near-zero risk. File 7 executes agents and should land last,
after 1–6 have been lived with. Files 5–6 are the only change to executable behaviour and the only
one that moves a gate — in the right direction.

**Explicitly excluded from the first batch, despite being tempting:** `gateguard` (needs the hook
harness), `verification-loop` (ours is better), `typescript-reviewer` (good, but adds a routing
surface before `agent-sort` has told us what the routing surface should be).

**Companion action, not an adoption:** the 07:52 user-scope install needs triage independently of
this proposal. At minimum, remove or neutralise D3, D4, D5, D7, D8, D9 from `~/.claude/`, and
decide on D6. `~/.claude/backups/pre-ecc-20260922-075542` exists if a clean revert is preferred.
That is a founder action and is out of this review's scope.

---

## 7. Is adopting from this repo worth the maintenance surface at all?

Narrowly and with discipline, yes — but the repo is a liability at any scale above a handful of
files, and the honest answer has two halves. ECC's genuine contribution is a small set of
*diagnostic* skills — `agent-architecture-audit`, `context-budget`, `agent-sort`, `skill-comply` —
that do something this project cannot currently do: look at its own agent stack as an engineered
system with measurable failure modes, rather than as a set of documents. That is real, it is
additive, and four files is a maintenance surface we can carry. Everything else fails one of three
tests. It is for the wrong stack (roughly 180 of 228 skills, 38 of 72 agents, 105 of 110 rules —
C++, Kotlin, Swift, Spring Boot, homelab VLANs, HIPAA, customs compliance). Or it restates what
`AUTONOMY.md`, `AGENT-ROUTING.md` and our `validate-*.mjs` already enforce with dated,
incident-grounded specificity that a generic plugin cannot match — `verification-loop` next to our
validators is the clearest example. Or it is actively hostile to our operating model: an
`auto-update` command that pulls a third party's changes over live agent config, a `santa-loop`
that launders two LLM opinions into `git push`, a `harness-optimizer` that edits its own
constraints, and a `safety-guard` that advertises a gate with no implementation behind it. The
decisive consideration is that this repo was designed for a fast-moving dev shop where an agent
committing its own work is the *point*; this is a benchmark institution whose entire credibility
rests on the opposite premise, that no number reaches the public without a dated human act. Those
two operating models are not blendable at the file level — which is exactly why the answer is
seven curated files with named edits and a hard stop, not a profile install. And the fact that a
`full`/`enterprise` profile install landed in `~/.claude/` at 07:55 today, mid-review, is itself
the strongest argument for that stop: the failure mode here was never a malicious file, it was the
ease of taking all 2,488 of them at once.

---

## Appendix — searches run (V8)

Every absence claimed above has a search behind it. Run from the shallow clone root unless noted.

```bash
# §1: how many hook entries execute code, and what do they run
python -c "import json;d=json.load(open('hooks/hooks.json'));\
  print(sum(len(h.get('hooks',[])) for a in d['hooks'].values() for h in a))"
# → 28   (PreToolUse 8, PostToolUse 10, Stop 6, PreCompact 1, SessionStart 1,
#          PostToolUseFailure 1, SessionEnd 1 — all type "command", all `node -e`)

# §1: claim "the hook scripts make no network calls"
grep -rnE "fetch\(|https\.(get|request)|http\.(get|request)|axios|urllib|requests\.(get|post)" scripts/hooks/
# → no output. Four files match a bare /https?:\/\// but only in comments:
#   block-no-verify.js (git-scm.com doc link), gateguard-fact-force.js (repo link),
#   insaits-security-monitor.py (author attribution), session-start.js:591 (issue link)

# §1: claim "block-no-verify.js ships but is not enabled"
grep -c "block-no-verify" hooks/hooks.json   # → 0
grep -c "gateguard"       hooks/hooks.json   # → 2   (gateguard IS wired; block-no-verify is not)

# §3: every file instructing a commit or push
grep -rniE "git commit|git push|auto-?commit|commit (the |your |when|after|and push)|push (to|the) (remote|main|branch)" \
  skills/ agents/ commands/ rules/ --include="*.md" -l    # → 20 files, listed in §3

# §3 item 7: claim "safety-guard has no implementation"
grep -rl "safety-guard\|safety_guard\|safetyGuard" . --include="*.js" --include="*.json" --include="*.sh" --include="*.ts"
ls commands/ | grep -i safety
# → both empty. The skill is prose only.

# §2: auto-invocation bait across the agent set
grep -rl "PROACTIVELY\|MUST BE USED" agents/   # → 21 of 72

# §5: shell execution and network installs inside skill bodies
grep -rl '```bash' skills/ --include="SKILL.md"                        # → 85 of 228
grep -rlE '(curl |wget |npx -y|pip install |npm i -g)' skills/ --include="SKILL.md"
# → 20: autonomous-agent-harness, data-scraper-agent, defi-amm-security, deployment-patterns,
#   django-celery, django-verification, docker-patterns, flox-environments, gateguard,
#   homelab-pihole-dns, homelab-wireguard-vpn, jira-integration, nutrient-document-processing,
#   python-patterns, quarkus-verification, scientific-pkg-gget, security-scan, videodb,
#   visa-doc-translate, windows-desktop-e2e

# Population counts (from the recursive git tree, 2,488 blobs)
#   skills/  383 files across 228 directories      agents/  72
#   commands/ 76                                   rules/  110
#   executables (.js/.mjs/.sh/.py/.ts outside .git) 482

# §0: claim "no hooks are live in this environment"
grep -rn "hooks" ~/.claude/settings.json ~/.claude/settings.local.json   # → no output
grep -n  "hooks" .claude/settings.local.json                             # → no output
ls ~/.claude/scripts                                                     # → does not exist
ls ~/.claude/rules                                                       # → does not exist

# §0: scope and timing of the existing install
ls ~/.claude/backups/                 # → pre-ecc-20260922-075542
ls ~/.claude/skills | wc -l           # → 106
ls ~/.claude/commands | wc -l         # → 52
ls ~/.claude/agents | wc -l           # → 53   (AGENT-ROUTING.md §0 still says 26)
ls -la --time-style=long-iso ~/.claude/agents/ | grep -E "chief-of-staff|loop-operator|harness-optimizer"
# → all three dated 2026-09-22 07:52
grep -n "extraKnownMarketplaces" -A5 ~/.claude/settings.json
# → ecc → { source: github, repo: Klingdom/everything-claude-code }

# §4: claim "this project has no .mcp.json"
ls .mcp.json    # (project root) → No such file or directory
```

Method note: a `git clone --depth 1` of the fork was taken into the session scratchpad
(`.../scratchpad/eccrepo`) to make full-text search possible across 2,488 files. Cloning transfers
bytes and executes nothing — no `install.sh`, no `npm install`, no hook was run. The clone lives
outside the project tree and outside `.claude/`.
