# Founder decision packet — AI model testing, 2026-10-15

**Directive (2026-10-15):** "Work autonomously to test all available AI models. If you can't immediately test all
the models then figure out what you need and let me know."

**Summary.** Every model that can be tested locally is now downloaded and smoke-tested: 9 open-weight builds in the
queue, plus the 4 measured earlier. None has been sent a task-bank item. Three things stop a measured wave today, and
each needs you:
1. the weekly protocol is still `proposed`;
2. a plan must be committed before any reply exists;
3. the memory preflight needs about 6.6 GiB free.

Frontier models (OpenAI, Google, xAI, DeepSeek and others) cannot be tested at all without credentials and a spend
ceiling (BLK-002, open since 2026-09-06).

Evidence for every figure below: `research/model-runs/weekly/READINESS_2026-10-15.json` (smoke results) and the
`weekly-wave.mjs plan --dry-run` output recorded in ITERATION_LOG Iteration 106.

---

## 1. What is ready (done today, no approval needed)

| Build | Developer | Size | GPU share | Speed | Notes |
|---|---|---|---|---|---|
| phi4-mini | Microsoft | 2.49 GB | 100% | 102.7 tok/s | |
| granite3.3:8b | IBM | 4.94 GB | 100% | 62.1 tok/s | Apache-2.0 |
| olmo2:7b | Allen Institute for AI | 4.47 GB | 93% | 10.4 tok/s | Spills to RAM, so slow: ~2–3 h per 249 calls |
| falcon3:7b | TII | 4.57 GB | 100% | 65.9 tok/s | TII Falcon License |
| command-r7b | Cohere | 5.06 GB | 100% | 60.7 tok/s | **CC-BY-NC-4.0** (see M-FD-5) |
| exaone3.5:7.8b | LG AI Research | 4.77 GB | 100% | 67.1 tok/s | **EXAONE 1.1 – NC** (see M-FD-5) |
| llama3.1:8b | Meta | 4.92 GB | 100% | 63.0 tok/s | Llama 3.1 Community License |
| qwen3:8b | Alibaba | 5.23 GB | 100% | 65.3 tok/s | **Thinks by default** (see M-FD-6) |
| gemma3:4b | Google | 3.35 GB | 100% | 98.5 tok/s | Gemma Terms of Use |

**Collection time.** Pilot 3 measured 3–17 s per call. At that rate one weekly wave takes about 75–100 minutes of GPU
time: 2 new builds × 249 calls, plus the reference build's 83 calls. All 9 builds take about 4–5 hours.

**Judging is the larger cost.** One wave produces 581 replies, each rated by 2 Claude judges. That is about 75 batches
of 16, plus re-quote rounds and the anchor sample.

## 2. Decisions

| ID | Decision | Default |
|---|---|---|
| **M-FD-1** | **Ratify protocol `weekly-v1`.** Set `"status": "ratified"` in `research/model-runs/weekly/PROTOCOL.json` and commit it. The code refuses a real plan until you do. | **Yes** |
| **M-FD-2** | **Approve committing the first plan**, `wave-2026-10-15`: phi4-mini (Microsoft) and granite3.3:8b (IBM), plus the gemma2:9b reference. That is 581 calls and an anchor sample of 48. After M-FD-1, I run `weekly-wave.mjs plan --date 2026-10-15`, which prints the pathspec. You approve the commit. The commit before collection is the proof that the plan came before the data. | **Yes** |
| **M-FD-3** | **Who collects.** (a) You run `research/model-runs/weekly/register-task.ps1` once. The 02:00 task then collects while your apps are closed. (b) You approve me running `weekly-wave.mjs collect` in-session. Collect defers whenever free memory is under about 6.6 GiB, and Brave alone held about 5.4 GB at 12:40 today. | **(a)**, and (b) only on a day you close Brave, Steam and Creative Cloud |
| **M-FD-4** | **Pace.** `weekly-v1` allows 2 new builds per wave, so the 9 queued builds take 5 weeks. The deterministic order is Microsoft, IBM, AI2, TII, Cohere, LG, then Meta, Alibaba and Google. A faster pace needs a new protocol version (`weekly-v2`, for example with `max_new_subjects_per_wave` 4, finishing in 3 weeks). That restarts the comparability series. | **Keep v1** at 2 per week |
| **M-FD-5** | **Non-commercial licences.** command-r7b (CC-BY-NC-4.0) and exaone3.5 (EXAONE NC) restrict commercial use. The institution sells research products today, and nonprofit status is planned but not yet formed. Is evaluating them and publishing an unofficial pilot about them permitted? | **Hold both** (queue #5 and #6, weeks 3–4) until counsel answers. If no answer by week 3, set both to `skipped` with a note, and the queue moves on. |
| **M-FD-6** | **qwen3 thinking.** qwen3:8b returns a separate `thinking` field. `lib/local-subjects.mjs` stores only `message.content`, so the trace would be dropped silently, although `eval_count` counts its tokens. Choose (a): keep the model's default (thinking on), store the trace in the record and never show it to judges; this needs a harness change, a test and a protocol note before its wave. Or (b): send `think: false`. | **(a)**: it measures the build as shipped. The harness change is backlog row QWEN3-THINK. qwen3 is queue #8, week 4–5. |
| **M-FD-7** | **Frontier and hosted models (BLK-002).** There are no credentials and no approved spend; no provider key is set in this environment (checked today). Options: (i) one OpenRouter key with a ceiling you set, covering most hosted models through one interface; (ii) separate provider keys; (iii) `ollama signin` on this PC, which gives Ollama Cloud's hosted open-weight models through the same `/api/chat` the harness already uses (`/api/me` returns `unauthorized` today). Each needs a subject adapter, a protocol version for hosted builds (snapshot unverifiable, no digest) and a cost ledger. **Measured volume, not price:** pilot-3 calls averaged 93 input and 379 output tokens. A 3-trial build is about 23k input and 94k output tokens, before the contamination probe. No price is estimated here (NA-001 rule: you set the ceiling first). | **(iii) now**, because it is free to try and needs no adapter. Then **(i)** with a ceiling of your choosing. |
| **M-FD-8** | **Cross-family judges.** Every judge so far is Claude, which is a stated limit of all three pilots. The same key as M-FD-7 (i) would allow one non-Claude judge per reply. | **Yes**, once M-FD-7 (i) exists. It needs its own protocol version. |
| **M-FD-9** | **Dashboard (D-29b).** The `/ai-models/dashboard` route is built and passes its tests. It is **now gated closed by default**: today's fix found that the default build would have published it without D-29b. To publish, ratify D-29b in `DECISIONS.md`, then set `site/src/data/model-benchmark/dashboard-decision.json` `status` to `"active"`. The test refuses `"active"` without a D-29b entry. Founder preview: `CB_PREVIEW_DASHBOARD=1 CB_PREVIEW_PILOT_REPORTS=1 npm run build`. | **Hold** until the first weekly wave exists, so the dashboard launches with more than the three pilots |
| **M-FD-10** | **Claude models.** Pilot 1 (2026-10-01) measured haiku, sonnet, opus and fable with Claude judges (same family). Re-testing them now would repeat that limit. | **Wait for M-FD-8** |

## 3. If you approve M-FD-1 to M-FD-3 (a)

1. Ratify: edit `PROTOCOL.json` status, then `git add research/model-runs/weekly/PROTOCOL.json` and commit.
2. I run the real plan, and you commit `research/model-runs/wave-2026-10-15/`.
3. The 02:00 task collects, and the next session judges, analyses and audits per `.claude/commands/weekly-model-wave.md`.
   That ends in an approval packet. Nothing is published without you.
