# Evidence tier convention — survey, finding, and options (2026-09-20)

**Status:** analysis for a founder decision. **Nothing was changed.** No briefing, label, validator or data file was
edited to produce this document.

**Author:** coordinator. **Method:** mechanical survey of every daily briefing JSON in
`site/src/data/updates/daily/`, classifying each `{url, sourceTier}` pair by the publisher's domain and comparing the
recorded tier against the two competing conventions. Script kept at
`C:\Users\philk\AppData\Local\Temp\claude\tier-survey.mjs` (reproduce by re-running it; it only reads).

---

## 1. The two conventions

| | tier 5 | tier 4 | tier 3 | tier 2 | tier 1 |
|---|---|---|---|---|---|
| **Documented data convention** — `.claude/agents/overnight-assessor.md:206`, and `overnight-digest.md:452` ("Tier 5 — strongest evidence") | government / court / treaty body | international org / UN mission | watchdog NGO | top-tier journalism | trade press / advocacy |
| **Published UI labels** — `site/src/components/updates/briefing/evidence/index.tsx:34-40`, with `TIER_SHORT_LABELS[1] = "Primary source"` | Trade/Advocacy | Journalism | NGO | UN/IO | Gov/Court |

They are exact inversions of one another.

## 2. What the published data actually does

371 sources across **58 briefings** could be adjudicated (their publisher type is unambiguous: a `.gov` domain, a UN
body, a named watchdog NGO, or a major news outlet). Pairs whose class is ambiguous were excluded rather than guessed.

| Source class | tier 1 | tier 2 | tier 3 | tier 4 | tier 5 |
|---|---:|---:|---:|---:|---:|
| government / court | **19** | 3 | 1 | 10 | **16** |
| international org / UN | **9** | 22 | 0 | 13 | **49** |
| watchdog NGO | 1 | 1 | **86** | 6 | 1 |
| journalism | 1 | **84** | 6 | **42** | 1 |

- Government and IO sources rated **4–5** (data convention): **88**. Rated **1–2** (UI convention): **53**.
- Journalism rated **2** (data convention): **84**. Rated **4** (UI convention): **42**.
- NGOs sit at **3** in 86 of 95 cases — the midpoint, which is identical under both conventions. That is the control:
  it shows the classifier works and that only the *ends* of the scale are in dispute.

### Per-cycle verdict — the part that matters

| | cycles |
|---|---:|
| Consistent with the **data** convention only | **18** |
| Consistent with the **UI label** convention only | **19** |
| **Internally inconsistent** (both, inside one briefing) | **17** |

## 3. Finding

**This is not a display bug. The convention was never enforced, and roughly half of the published briefings were
authored under each reading — with 17 contradicting themselves inside a single day's file.**

The practical consequence today: on every briefing page a tier badge may say the opposite of what the source is. A
Boston.com article renders as "Tier 2 · UN/IO"; a genuine UN statement can render as "Tier 4 · Journalism". Readers,
journalists and answer engines are being told the wrong provenance for our evidence, in both directions.

**Flipping the labels would fix 18 cycles and break 19.** That is why the obvious one-line fix is wrong, and why this
needs a decision rather than a patch.

## 4. Options

**A. Declare the documented convention canonical (5 = strongest), fix the labels, and migrate the data.**
Correct in the long run, and it matches every written spec. But it means editing published briefings. `AUTONOMY.md`
§1c forbids retro-editing a published briefing; the spirit is that the public record is not silently rewritten. A
migration would therefore have to be **dated and disclosed** — an appended correction note on each affected briefing,
or a site-wide note — not a silent rewrite. ~36 cycles need edits (19 inverted + 17 mixed).

**B. Fix the labels; suppress the badge for briefings before a cutoff date.**
No published text is rewritten. Historic briefings keep their sources and quotes but show no tier badge, with one
honest line explaining that tier values before the cutoff are unreliable. Cheapest honest option; loses a signal on
old pages.

**C. Fix the labels only, migrate nothing.**
Rejected: it would leave ~19 cycles actively mislabelled and 17 self-contradictory, while looking authoritative.

**D. Normalise at display time by inferring the tier from the publisher.**
Rejected: it would silently overwrite an assessor's judgement with a domain heuristic, and it hides the underlying
data defect instead of fixing it.

**Recommendation: B now, A later.** B removes the false claim immediately without touching the public record; A
becomes a scheduled, disclosed migration once the convention is enforced going forward.

## 5. Required regardless of the option chosen

1. **A gate.** No test reads `TIER_LABELS`, and the claim-to-source lint never compares a tier against its source. Add
   a check that (a) the UI map matches the documented scale, and (b) each briefing's `sourceTier` matches the tier
   recorded in that date's assessment — the check the coordinator has been running by hand since 2026-09-17, which
   caught five wrong values on that date and zero on 09-18.
2. **The convention written where authors see it** — in the digest agent spec, not only the assessor spec.
3. **A dated correction note** wherever historic values are left in place, so a reader can tell.

## 6. What this does *not* affect

No composite, band or rank depends on `sourceTier`. It is a provenance label on quoted evidence, so **no score is
wrong because of this**. The damage is to the credibility of the evidence display — which, for a benchmark whose
product is traceability, is not a small thing.
