# CB-MODEL — Assumptions

Single-authority file. Things this programme is currently proceeding on that are **not verified**.

An assumption is not a fact. Each entry states what would falsify it and what depends on it. When
one is verified it moves to `CURRENT_STATE.md` "Operational" or becomes a decision in the root
`DECISIONS.md`; when falsified it becomes a blocker or a risk.

**Last updated:** 2026-09-06 (created).

---

## Unverified programme parameters — from the unreadable `.docx` (`BLK-004`)

These three were supplied as "already established". Each was checked by grep against all 15 readable
package files. **None appears anywhere.** The strings `CB-MODEL`, `72`, `30-day`, `three-year`,
`Version 1`, `2026`, `three-layer` and `public reference` return zero hits across the package
markdown.

| ID | Assumption | What depends on it | What would falsify it | Confidence |
|---|---|---|---|---|
| **ASM-001** | The programme is **version 1.0, dated 2026-09-06, with a three-year horizon**. | Any roadmap, any funding narrative, any "as of version X" statement on a published page. | Reading the `.docx`. | **Low as a verified fact; high as founder recollection.** Not to be printed on a public page until confirmed. |
| **ASM-002** | Major releases get a **72-hour rapid result** and a **30-day full result**. | The release-intelligence ticket deadlines; the whole feasibility case for the evaluation pipeline. A 72-hour turnaround including two blinded human raters is a demanding operational commitment. | Reading the `.docx`, or a founder confirmation. | **Low.** `02` mandates "rapid-check and full-run deadlines" with no numbers. **Do not publish this SLA.** |
| **ASM-003** | The battery is **three layers**: public reference, secure rotating, live post-deployment challenge. | Task-bank architecture, form design, exposure classes. | Already **partly contradicted by the readable package.** `03-BENCHMARK-BATTERY` specifies **six** pools — Core Public, Secure Standard, Challenge, Incident Regression, Arena, Specialized Track — with targets of ≥64 public core, 128 secure **per form**, 48 rotating challenge, and a candidate bank above 240. | **Superseded in practice.** Build to the six-pool spec, which is readable and stricter. Treat "three-layer" as a summary for external explanation, not a design. |
| **ASM-004** | **CB-MODEL** is the correct internal code. | Naming throughout this directory. | It appears in none of the 15 package files; it is the founder's own term. | **High** as founder intent, **not** a package term. Public name remains **Compassion Benchmark Model Index**. Never "ACB" (`README.md`). |

## Assumptions about the existing repo

| ID | Assumption | Basis | What would falsify it | Confidence |
|---|---|---|---|---|
| **ASM-005** | `compositeCore()` in `site/src/lib/scoring.ts` is reusable for model scoring unchanged. | Single shared implementation, 69 passing test cases, explicit anti-drift design. | A Methods Committee decision that model composites need different weighting; or the CONFLICT-04 resolution landing on the other formula. | **High** on the code; **conditional** on `BLK-006`. |
| **ASM-006** | The eight dimensions transfer from institutions to model behaviour. | `/ai-evaluation-suite` already reinterprets all eight for model behaviour, and its per-prompt rubrics are genuinely behaviour-anchored. | Content-validity study `VAL-C-01`; or discriminant findings that the model reinterpretation measures verbosity or general capability. | **Medium.** Never empirically tested. The reinterpretation is currently *undocumented* — the page hardcodes a different 40-subdimension set (CONFLICT-05). |
| **ASM-007** | The `ai-labs.json` roster is the AI Labs Index. | The founder's brief says so; it is served at `/ai-labs`. | Its `meta.title` is "Top 50 AI **Companies** Index 2026" and its rows mix five subject types including ≥10 deployed products (§2.3). | **Medium.** It is *closest* to the AI Labs Index but is not cleanly one product. |
| **ASM-008** | The 33 prompts are salvageable as the Core Public pool. | The rubrics are prompt-specific and behaviour-anchored — the strongest asset on the page. | 4 items are unexecutable as written; coverage is 2–6 per dimension; all are published with answer keys (`RISK-015`). | **Medium.** Salvageable as a *starting* public pool, not as an official form. |
| **ASM-009** | `AUTONOMY.md` governs where it and `HUMAN-AUTHORITY-BOUNDARY.md` differ. | Every `AUTONOMY.md` rule traces to a dated event here; the package file is generic. | A founder decision the other way. | **Assumption only — proposed as draft D-23, not ratified.** This document has been written under it. |
| **ASM-010** | `research/SYSTEM_HEALTH.md` is stale, not authoritative. | Last updated 2026-05-21 (Loop 1/6). INC-001, INC-002 and INC-008 all postdate it and contradict several of its GREEN marks. | Someone updating it. | High. |

## Assumptions this scaffold deliberately refuses to make

Recorded so a later agent does not quietly adopt them:

- **Not assumed:** that any specific model exists, or which models should be in scope. No model is
  named anywhere in this directory. That requires a scan (`BLK-001`) and a founder priority call.
- **Not assumed:** any cost, per-token price, trial count or budget figure. `COST_LEDGER.md`
  contains no estimate.
- **Not assumed:** that the missing starting prompt was `00-MASTER-CONDUCTOR`. That inference is
  recorded in `BLK-003` and explicitly **not acted upon**.
- **Not assumed:** that the 33 prompts have any validity. `VALIDATION_LEDGER.md` records zero
  studies, and `validation_status` for every item is `unvalidated`.
- **Not assumed:** that the founder's three-product framing maps cleanly onto the current indexes.
  It does not (§2.3).
