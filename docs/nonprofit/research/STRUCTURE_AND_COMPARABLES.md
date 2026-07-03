# Legal Structure, Governance & Comparable Organizations

**A findings document for converting Compassion Benchmark into a nonprofit**

Prepared: June 2026 · Scope: US-focused legal structure (with international notes), governance design to lock in independence, comparable independent benchmark/ranking/transparency nonprofits, and risks specific to a scoring institution.

> **Disclaimer:** This is strategic research, not legal or tax advice. Confirm specifics with a nonprofit attorney and a CPA before filing. Dollar figures and processing times are 2025–2026 estimates that change.

---

## Executive summary

Compassion Benchmark already operates the way the strongest organizations in this category operate: it publishes free comparative rankings of named entities and **never lets a scored entity pay for inclusion, score changes, or suppression**. That independence policy is the single most valuable asset, and the central question of a nonprofit conversion is *how to lock it in structurally so it survives growth, funding, and founder turnover.*

The research finds three things:

1. **The independence model is the category norm, not a constraint.** None of the 16 comparable organizations studied charge the entities they rank. The "no pay for inclusion" rule is what makes a benchmark credible; a nonprofit structure makes it legally durable.
2. **A 501(c)(3) public charity can keep selling research products and institutional services** — the existing earned-revenue model is preservable if it is structured as *substantially related* to an educational/charitable purpose, with any genuinely commercial activity ring-fenced (and, at scale, moved into a wholly-owned taxable subsidiary).
3. **The best-fit path is a US 501(c)(3) public charity, launched via fiscal sponsorship as a fast bridge to grants**, with governance that hard-codes independence (independent board majority, conflict-of-interest policy, a written funding-acceptance/firewall policy, and a published methodology that engineers capture-resistance into the *method*, not just the org chart).

The recommendation is at the end.

---

# PART 1 — LEGAL STRUCTURE OPTIONS

## 1.1 501(c)(3) public charity vs. private foundation

Both are 501(c)(3) tax-exempt entities; the difference is **where the money comes from and who controls the board**.

| Dimension | **Public charity** | **Private foundation** |
|---|---|---|
| Funding profile | Broad public support — must pass the **public support test**: generally ≥ ⅓ of support from the general public, government, and other public charities over a rolling 5-year window (a 10% + facts-and-circumstances fallback exists) | Funded by one/few sources (an individual, family, or company) |
| Board control | IRS expects a **majority of unrelated** board members | May be controlled by related parties |
| Donor deduction limits | More generous (e.g., up to 60% of AGI cash) | Less generous (e.g., 30% AGI cash) |
| Ongoing burden | Form 990; lighter excise rules | Form 990-PF; **5% annual payout requirement**, excise tax on investment income, self-dealing rules — heavier |
| Default status | Must *request and qualify* | **Default** classification for any 501(c)(3) that doesn't qualify as a public charity |

**For Compassion Benchmark: public charity is the clear fit.** The venture intends to be supported by grants, institutional service revenue, and (ideally) many small donors — exactly the broad-support profile the public support test rewards. Public-charity status is also *governance-friendly to the independence mission*: the required unrelated-board-majority is itself an anti-capture mechanism. A private foundation makes sense only if a single large endowment-style donor were to fund everything, which would *increase* capture risk and is the opposite of what this brand needs.

There is a nuance worth flagging early: an organization whose revenue is dominated by **fees for services / product sales** can struggle with the public support test, because gross receipts from an activity (over certain thresholds) don't all count as "public support." A **509(a)(2)** public-charity classification (for organizations supported by exempt-function/program revenue) may fit better than the donation-based **509(a)(1)** test if earned revenue dominates. This is a CPA decision to make once the revenue mix is known — and a reason to keep a healthy grant + small-donor base alongside earned revenue.

Sources: [Foundation Group – public support test](https://www.501c3.org/understanding-the-501c3-public-support-test/), [Perlman & Perlman – classification comparison](https://perlmanandperlman.com/comparison-of-501c3-tax-exempt-classifications-br-public-charity-private-non-operating-foundation-and-private-operating-foundation/), [Cullinane Law – which is right for you](https://cullinanelaw.com/difference-between-public-charity-and-private-foundation/).

## 1.2 Fiscal sponsorship — the fast bridge to grants

Fiscal sponsorship lets a project **receive tax-deductible grants and donations immediately, under an existing 501(c)(3)'s umbrella**, before (or without) standing up its own entity and waiting on the IRS. Two models matter:

| | **Model A — "Comprehensive / Direct"** | **Model C — "Pre-approved grant relationship"** |
|---|---|---|
| Legal home of the project | The project *is* part of the sponsor; staff are the sponsor's employees/volunteers | The project is a **separate legal entity**; sponsor re-grants funds to it |
| Sponsor role | Full back-office: accounting, HR, compliance, legal | Limited: receives donations for the charitable purpose and **re-grants** them |
| Independence/agility | Lower — you operate inside the sponsor | Higher — you keep your own entity and control |
| Typical fee | ~9–15% of funds | ~4–10% of funds |
| Best when | Pre-incorporation, small, want zero back-office | You already have (or want) your own LLC/corp but need a charitable conduit |

**Why this matters for grants:** Many private foundations won't grant to an entity without IRS 501(c)(3) recognition (they'd have to exercise "expenditure responsibility"). They *will* grant to a fiscal sponsor that re-grants. So sponsorship unlocks foundation money on day one.

**Named sponsors to verify** (those serving tech / research / transparency / open-source projects — this is a *starting list to vet*, not an endorsement):

- **Code for Science & Society** — sponsors data/research/open-science projects (e.g., Dat, PREreview). Strong fit for a public-interest data/research venture.
- **NumFOCUS** — sponsors scientific/data open-source projects (Jupyter, Matplotlib, rOpenSci); 100+ projects.
- **Open Collective Foundation / Open Source Collective** — transparent fiscal hosting with public ledgers (note: Open Collective Foundation announced a wind-down — **verify current status** before relying on it).
- **The Tides Center** — large, established sponsor that has incubated many advocacy/research orgs (Epoch AI's early home was a fiscal sponsor; AI Now was hosted at NYU before spinning out — both illustrate the on-ramp pattern).
- **Social Impact Commons / Community Initiatives / Players Philanthropy Fund** — general-purpose sponsors handling Model A and Model C.
- **Superbloom Design** — currently fiscally sponsors *Ranking Digital Rights*, a near-exact analogue (a tech-accountability ranking project).

**Recommended use:** Start under a **Model C** sponsor (keep your own entity and control, lower fee, preserve independence) to receive grants while the Form 1023 is pending, then graduate to a standalone 501(c)(3). RDR has lived under three different sponsors (New America's Open Technology Institute → World Benchmarking Alliance → Superbloom), which shows both the flexibility *and* the risk of tying your reputation to a host — a reason to treat sponsorship as a bridge, not a destination.

Sources: [Mission Edge – Model A vs C](https://www.missionedge.org/news-and-resources/fiscal-sponsorship-model-a-vs-model-c), [GVNG – choosing a model](https://gvng.org/blog/understanding-fiscal-sponsorship-choosing-the-right-model-for-your-mission/), [Code for Science & Society – working with a fiscal sponsor](https://www.codeforsociety.org/resources/working-with-a-fiscal-sponsor), [NumFOCUS fiscal sponsorship](https://bssw.io/blog_posts/numfocus-a-fiscal-sponsor-of-scientific-software).

## 1.3 Hybrid structures

| Structure | What it is | Fit for Compassion Benchmark |
|---|---|---|
| **Nonprofit with an earned-revenue program** | A 501(c)(3) that sells mission-related products/services as a *related* program (the current model, formalized) | **Best default.** Keep selling research assets and institutional services *as educational program activity*; tax-free if substantially related (see 1.4). |
| **Nonprofit + wholly-owned for-profit subsidiary** | The charity owns 100% of a taxable corp/LLC that does unrestricted commercial deals; profits flow up as dividends | **Best if earned revenue grows large or turns clearly commercial.** The charity keeps brand/IP/mission control; the sub pays taxes and shields the parent's exemption. This is the **Mozilla model** (Mozilla Foundation owns Mozilla Corporation). Add later, not at formation. |
| **L3C (low-profit LLC)** | Hybrid LLC designed to attract foundation program-related investments (PRIs) | **Weak fit.** Recognized in only ~8 states; PRI qualification often needs a costly private IRS ruling; can't take tax-deductible gifts. Skip. |
| **Benefit Corp / PBC** | A *for-profit* that legally commits to a social mission; can raise equity/VC | **Not the primary vehicle** — it's taxable, not charitable, and can't receive deductible donations or most grants. Only relevant if you wanted a venture-funded commercial arm. The independence brand is better served by charitable status. |
| **B Corp (certification)** | A *certification* (B Lab), not a legal entity | N/A for a nonprofit; it's a for-profit marketing/standard credential. |

**Takeaway:** Form as a plain **501(c)(3) public charity with a related earned-revenue program now.** Reserve the **nonprofit-parent + taxable-subsidiary** structure as a clean upgrade path if commercial sales scale beyond what "related" activity comfortably covers. Mozilla is both the template *and* the cautionary tale: the structure works, but Mozilla's ~86% revenue dependence on a single counterparty (Google) is a worse capture risk than any grant — a direct warning that **no single funder or customer should ever dominate revenue**, least of all a scored entity.

Sources: [Ethix – B-Corp/Benefit/L3C/PBC](https://ethixmerch.com/blog/b-corp-benefit-corp/), [LegalGPS – L3C vs B Corp](https://www.legalgps.com/business-entity-comparison/l3c-vs-b-corp), [Mozilla – governance/organizations](https://www.mozilla.org/en-US/about/governance/organizations/), [Mozilla Corporation – Wikipedia](https://en.wikipedia.org/wiki/Mozilla_Corporation).

## 1.4 Can a 501(c)(3) keep selling research reports and institutional services? (UBIT)

**Yes — and this is the crux of preserving the existing model.** Three concepts govern it:

**1. Substantially related vs. unrelated.** Income is taxable Unrelated Business Income (UBI) only if it comes from a trade or business that is (a) *regularly carried on* and (b) *not substantially related* to the exempt purpose. "Substantially related" means the activity itself **causally furthers the exempt mission** beyond just raising money. If Compassion Benchmark's exempt purpose is *educating the public about how institutions create or reduce suffering*, then **publishing and selling the research, datasets, and interpretive analysis is the exempt activity itself** — strongly analogous to a university selling course materials or a museum selling catalogs. That income should be related (non-taxable).

**2. Intended use of profits is irrelevant.** A critical trap: the IRS taxes UBI based on *the activity that generated it*, **not on how the money is spent**. "We use the profits for the mission" does **not** shield income — the *selling activity* must itself be related. So the framing of products as educational program (not as a commercial line of business) matters.

**3. The commerciality doctrine** is the real risk at scale. Even related-looking activity can endanger exemption if the organization "operates in a manner indistinguishable from a commercial business" — IRS red flags include pricing to maximize revenue, marketing like a commercial publisher, accumulating profits for expansion, and a paid sales staff. The classic publishing guidance (Rev. Rul. 67-4; the IRS's EO publishing materials) draws the line at whether materials are selected/distributed for *educational value vs. salability* and through *non-commercial vs. ordinary commercial channels*. Practical guardrails:

- Frame and price products as **mission/educational** (consider tiered or "below-market for nonprofits/researchers" pricing — ProPublica's Data Store model), not revenue-maximizing.
- Keep the **core rankings and methodology free and public**; sell *derived* depth (datasets, custom analysis, institutional tooling, training).
- Maintain a **donative element** and a diversified revenue base (grants + small donors), so commerce stays *incidental and subordinate* to charitable purpose.
- File **Form 990-T** and pay UBIT on any genuinely unrelated lines (≥ $1,000 gross) — having *some* UBI is fine and normal; it must just stay a minority of activity.

**What keeps institutional services "related":** services that *educate and help institutions interpret and act on the benchmark* (training, interpretation, briefings, access tooling) further the educational mission. What would drift toward *unrelated/commercial*: generic consulting unrelated to the benchmark, or anything that looks like selling favorable treatment (which the independence policy already forbids and which would be far more dangerous than UBIT — it would threaten exemption outright).

Sources: [National Council of Nonprofits – UBIT](https://www.councilofnonprofits.org/running-nonprofit/administration-and-financial-management/unrelated-business-income-taxation), [IRS Pub 598](https://www.irs.gov/publications/p598), [Hurwit & Associates – substantially related](https://www.hurwitassociates.com/taxation-of-unrelated-business-income/taxation-of-unrelated-business-income/), [IRS EO publishing activities (Rev. Rul. 67-4 etc.)](https://www.irs.gov/pub/irs-tege/eotopice88.pdf), [CharityLawyer – commerciality doctrine](https://charitylawyerblog.com/2009/11/08/501c3-organizations-and-the-commerciality-doctrine/), [Adler & Colvin – revenue-generating activities](https://www.adlercolvin.com/revenue-generating-activities-of-charitable-organizations-legal-issues/).

## 1.5 Locking in independence through governance

A nonprofit structure can convert the "no pay for inclusion" *policy* into a *legal/structural guarantee* that survives the founder. The instruments:

1. **Mission lock in the Articles of Incorporation and bylaws.** State the exempt purpose as independent measurement/education about institutional suffering, and embed the independence principle (entities never pay for inclusion, score changes, or suppression of findings) as a **bylaw-level rule that requires a supermajority to amend.** This makes selling scores not just off-policy but *ultra vires*.
2. **Independent board majority + duty of loyalty.** Public-charity status already requires a majority of unrelated directors. Their fiduciary duties (care, loyalty, obedience to mission) make any director who approved pay-for-score personally exposed.
3. **Conflict-of-interest policy** (the IRS expects one; Form 1023 asks about it). Require annual disclosures and recusal. Extend it explicitly to **funder conflicts** — e.g., a director or donor connected to a scored entity must recuse from anything touching that entity's score.
4. **Written funding-acceptance / firewall policy** (steal the best clauses from the comparables — see Part 2):
   - **No funding from a scored entity** may influence its score; ideally, *no scored entity may be a dominant funder*.
   - **"We can criticize our own funders"** clause (Bellingcat) — no funding relationship constrains findings about the funder.
   - **Editorial firewall**: scoring/methodology decisions are made by research staff "independent of donors or any other party" (Freedom House's *Freedom in the World* model — its flagship index takes **no** government money even though ~88% of the org's budget is government-funded).
   - **Donor diversification norm** (Transparency International: no single donor > ~10% of income; public disclosure of all gifts over a low threshold).
   - **Reverse due diligence** on large donors (Bellingcat researches donors over €5,000).
5. **Methodological capture-resistance** (the strongest safeguard, from V-Dem and Stanford's FMTI): publish the rubric, use distributed/transparent scoring, and maintain reproducibility so no single actor can quietly move a number. This makes scores *hard to lean on* by design — independence engineered into the method, not just the bylaws.
6. **Transparency commitments**: publish audited financials, a funder list, and a code of ethics. Consider adopting an external standard (e.g., a transparency-pledge / civil-society code) to outsource credibility.

Together these turn independence from a founder's promise into a structural property of the institution.

Sources: [BoardSource – conflict of interest](https://boardsource.org/resources/nonprofit-conflict-of-interest/), [National Council of Nonprofits – conflicts of interest](https://www.councilofnonprofits.org/running-nonprofit/governance-leadership/conflicts-interests), [Freedom House – financials/independence](https://freedomhouse.org/about-us/financials), [Transparency International – donation policy](https://www.transparency.org/en/donation-policy-and-guidelines), [Bellingcat – funding policy](https://www.bellingcat.com/about/funding-and-how-to-support-bellingcat/).

## 1.6 Practical formation: steps, timeline, cost (solo founder)

**Steps:**
1. **Choose state & name; check name availability.** (Delaware and your home state are the common choices; many founders just incorporate where they operate to avoid foreign-registration overhead.)
2. **Recruit an initial board.** Most states require **at least 3 directors** for a nonprofit (a few allow 1, but a 3-person unrelated board is needed for public-charity credibility and the IRS application anyway). This is a gating step for a solo founder — see Part 3.
3. **File Articles of Incorporation** with the state (include IRS-required 501(c)(3) purpose + dissolution language).
4. **Adopt bylaws + conflict-of-interest policy; hold an organizational meeting.**
5. **Get an EIN** from the IRS (free, instant).
6. **Apply for 501(c)(3)** via **Form 1023** or **Form 1023-EZ**.
7. **Register for state charitable solicitation** (40 states + DC require this before fundraising).
8. *(Bridge option)* Sign a **fiscal sponsorship** agreement to receive grants while the 1023 is pending.

**Form 1023 vs 1023-EZ:**

| | **1023-EZ** | **1023 (full)** |
|---|---|---|
| Eligibility | Projected gross receipts **≤ $50k/yr** for 3 yrs **and** assets ≤ $250k | Anyone; required above EZ thresholds |
| IRS fee | **$275** | **$600** |
| Length / effort | 3 pages, ~1 hour | ~40 pages, 20–45+ hours |
| Processing | ~2–4 weeks (80% within 90 days) | ~3–6 months |

**Important:** Compassion Benchmark **likely cannot use 1023-EZ** if it projects > $50k/year in combined grant + earned revenue (probable, given existing Gumroad/services revenue). Plan on the **full Form 1023** — which is also the better choice because it lets you *describe and pre-clear* the earned-revenue model and independence safeguards with the IRS, reducing later UBIT/commerciality ambiguity.

**Rough cost & timeline (DIY solo founder):**
- State incorporation: ~$50–$125
- IRS Form 1023: **$600**
- State charitable-solicitation registration: $0–$100+ (per state)
- Optional registered agent, attorney/CPA review: $0 DIY → ~$1,500–$5,000 with professional help
- **Total minimum DIY: roughly $700–$1,000.** With professional formation help: ~$2,500–$6,000.
- **Timeline:** incorporation 1–4 weeks; full 1023 determination commonly **3–6 months** (sometimes longer). Realistic "planning to operational": **2–8 months** — which is exactly why fiscal sponsorship is worth using as a bridge.

Sources: [National Council of Nonprofits – incorporation/state forms](https://www.councilofnonprofits.org/running-nonprofit/how-start-nonprofit/how-start-nonprofit-step-3-incorporation-and-state-forms), [IRS – about Form 1023-EZ](https://www.irs.gov/forms-pubs/about-form-1023-ez), [Wegner CPAs – 1023 vs 1023-EZ FAQs](https://www.wegnercpas.com/form-1023-and-form-1023-ez-faqs-2/), [RallyUp – cost to start a nonprofit](https://rallyup.com/blog/how-much-does-it-cost-to-start-a-nonprofit/).

---

# PART 2 — COMPARABLE ORGANIZATIONS

Sixteen independent research / benchmark / transparency / accountability organizations, grouped by what they teach. **None charges the entities it ranks** — universal confirmation that Compassion Benchmark's independence policy is the category standard.

## 2.1 Summary table

| Organization | Legal form | Funding model | Earned revenue? | Key governance / independence feature |
|---|---|---|---|---|
| **World Benchmarking Alliance** | Dutch foundation (ANBI) | 100% grants (govts + foundations) | No | Two-tier board (Executive + Supervisory); benchmarked firms are *allies*, never funders |
| **Ranking Digital Rights** | **Fiscally sponsored** (now Superbloom) | Foundation grants + small donations | No | Lightweight; cautionary tale on host dependence (3 sponsors) |
| **V-Dem Institute** | Research institute **inside U. of Gothenburg** | Research-council + foundation grants | No | **Anonymous distributed expert coders** + transparent Bayesian model = method-level capture resistance |
| **Freedom House** | US **501(c)(3)** | ~88% government grants | Minimal | Flagship index takes **no** govt money; "staff decide, not donors" firewall |
| **Transparency International** | German assn. (e.V.) + 100+ chapters | Govts, multilaterals, foundations | No (CPI not sold) | No donor > 10% income; disclose gifts > €1k; "no protection for corrupt donors" |
| **Our World in Data / GCDL** | UK **registered charity** | Foundation grants + **4,000+ small donors** | Minimal | University (Oxford) editors + independent charity ops; open data/reproducible |
| **ProPublica** | US **501(c)(3)** | Foundations + members; **Data Store earned revenue** | **Yes** (datasets, syndication) | Anchor-donor→diversified; public Code of Ethics; tiered data pricing |
| **Bellingcat** | Dutch *stichting* + US **501(c)(3)** | ~50% grants + **workshops/training** | **Yes** (training, keynotes) | **No direct government money**; "can criticize funders"; donor due diligence > €5k |
| **Mozilla Foundation** | US **501(c)(3)** owning taxable subs | Search royalties (via Corp) + donations | **Yes** (via for-profit subsidiary) | Nonprofit-parent owns for-profit; **cautionary: ~86% revenue from one counterparty** |
| **Access Now** | US **501(c)(3)** | Foundations + dev agencies + **RightsCon** | **Yes** (RightsCon tickets/sponsorships) | Published 4 funding "non-negotiables"; audited transparency |
| **AlgorithmWatch** | German **gGmbH** (+ Swiss arm) | Grants + "Friends" members | Minimal | Refuses EU money while lobbying EU; adopts TI transparency code |
| **MLCommons** | US nonprofit **consortium** (DE) | **Membership dues** (incl. from benchmarked firms) | Modest | Symmetric reproducible rules + multi-vendor working groups |
| **Epoch AI** | US **501(c)(3)** (was fiscally sponsored) | Grants (Open Phil-dominant) + **industry/gov contracts** | **Yes** | Editorial-independence policy + holdout sets — *but* FrontierMath/OpenAI disclosure failure |
| **Center for AI Safety** | US **501(c)(3)** + **501(c)(4)** Action Fund | Philanthropy (concentrated) | Minimal | c3/c4 split walls off advocacy; funder-concentration + FTX-clawback risk |
| **AI Now Institute** | US **501(c)(3)** (spun out of NYU) | Foundation grants only | **No** | **Categorical refusal of corporate money**; un-earmarked grants; non-industry board |
| **Stanford FMTI / HELM** | Program **inside Stanford (501(c)(3))** | University + grants | No | Published 100-indicator rubric + **external advisory board** + academic freedom |

## 2.2 Lessons by theme

**Closest structural analogues (purpose-built benchmark institutions):**
- **World Benchmarking Alliance** is the cleanest template — a single-purpose public-benefit foundation that exists only to publish free comparative rankings of named corporations, funded entirely by grants/governments, with benchmarked entities organized as *engaged allies* but firewalled from funding and methodology. If Compassion Benchmark wants a "what does the mature version look like" model, WBA is it.
- **V-Dem** shows capture-resistance can be **engineered into the measurement method**: ~3,500 anonymous country experts + a transparent statistical aggregation model make scores hard to pressure. Directly applicable to a rules-based 8-dimension/40-subdimension methodology.

**Combining published rankings with earned revenue (the existing model, validated):**
- **ProPublica's Data Store** is the most transferable earned-revenue model: keep the findings free, sell the *underlying datasets/derived research* with **tiered pricing** (cheaper for nonprofits/journalists/academics, more for commercial buyers). Pulled in six figures without paywalling the public-interest output.
- **Bellingcat** earns ~half its budget from **training/workshops on its own methodology** plus keynotes — directly applicable if Compassion Benchmark trains others to use its scoring method or interprets it for institutions.
- **Access Now's RightsCon** shows a **paid convening** (tickets + sponsorships from the covered sector) ring-fenced by a written funding policy.
- **Epoch AI** is the cautionary tale: it takes contract revenue from the very AI labs it studies, and its **undisclosed OpenAI funding + privileged access to benchmark items** (FrontierMath, Dec 2024–Jan 2025) caused a credibility crisis. Lesson: earned revenue from a scored entity is survivable *only* with **contemporaneous disclosure** and **no asymmetric/private access** — and is safest avoided entirely for a benchmark whose brand is independence.

**Anti-capture posture, weakest → strongest:**
- *Disclosure-based* (Access Now, Transparency International): take broad money, including from covered sectors, but publish a funding policy and audited financials.
- *Diversification norms* (TI's "no donor > 10%", broad small-donor bases at OWID and AlgorithmWatch's "Friends").
- *Editorial firewall* (Freedom House: flagship index funded by non-conflicted money; "staff decide, not donors").
- *Bright-line refusals* — **strongest**: AI Now **refuses all corporate money** from the industry it scrutinizes; Bellingcat takes **no direct government funding**; AlgorithmWatch refuses EU money while lobbying the EU. For a brand built entirely on independence, a categorical "no funding from scored entities" rule is the most defensible.

**On-ramp / maturation patterns:**
- Start under a **fiscal sponsor** (Epoch's early path) or **inside a host institution** (AI Now at NYU; Stanford FMTI), then **spin out to a standalone 501(c)(3)** once durable. RDR's three-sponsor journey shows both the flexibility and the reputational risk of host dependence.

**Structural-form menu confirmed by the set:**
- US **501(c)(3)** (ProPublica, Access Now, Freedom House, AI Now, Epoch, CAIS) — best for US donations + "independent institute" brand.
- **Nonprofit + taxable subsidiary** (Mozilla) — for scaled commercial revenue.
- **Consortium/membership** (MLCommons) — funds a benchmark from member dues, but sits uneasily with *adversarially* scoring those same members; works only because participation is voluntary and rules are symmetric. **Not** a fit for involuntary scoring of named entities.
- **European charitable forms** (WBA Dutch foundation, OWID UK charity, AlgorithmWatch German gGmbH) — if a non-US, internationally-neutral identity is ever desired.

Sources are consolidated in the **Sources** section below.

---

# PART 3 — KEY RISKS & MITIGATIONS

## 3.1 Defamation / reputation risk of scoring named entities

**The risk:** Publishing comparative scores of named governments, companies, and labs invites defamation / trade-libel / "product disparagement" claims and the threat of expensive litigation (even meritless suits impose cost and chilling effect).

**Why the legal position is strong:**
- **Opinion is protected.** Pure opinion — including evaluative judgments that can't be proven true or false — is protected by the First Amendment. A *score* derived from a disclosed methodology reads as protected opinion, **provided it doesn't imply undisclosed false facts.** The danger zone is asserting a *false statement of fact* (e.g., "Company X used child labor in 2025") that turns out to be false.
- **Rating organizations have specific precedent.** In *Bose Corp. v. Consumers Union* (U.S. 1984), the Supreme Court protected *Consumer Reports'* critical product rating, applying the **New York Times v. Sullivan "actual malice"** standard to product-disparagement claims raising First Amendment issues and requiring independent appellate review of malice findings. Most scored entities (governments, large corporations, prominent labs) are **public figures / matters of public concern**, so a plaintiff must prove the benchmark published a false fact with *actual malice* (knowing falsity or reckless disregard) — a very high bar.

**Mitigations:**
1. **Anchor every score in disclosed, sourced facts and a transparent rubric** (the methodology already does this). Opinion built on *disclosed* facts is protected; the published evidence trail is the best defamation defense.
2. **Separate fact from judgment in language** — present scores as evaluative conclusions ("we assess X at N on dimension D because [sourced evidence]"), avoid unprovable factual assertions of wrongdoing.
3. **Maintain rigorous sourcing, correction, and right-of-reply processes** — a documented good-faith process is the antidote to "actual malice."
4. **Use anti-SLAPP statutes.** Many states have anti-SLAPP laws that let a publisher quickly dismiss meritless suits aimed at protected speech on matters of public concern and recover fees. Incorporating/operating in a strong-anti-SLAPP state (e.g., California) is a real consideration. *(Verify current state anti-SLAPP coverage with counsel.)*
5. **Carry media liability / D&O insurance** covering defamation defense.
6. **Keep scoring genuinely independent of payment** — the independence policy is *also* a litigation shield: it rebuts any claim that a score was a bad-faith commercial attack.

Sources: [FindLaw – defamation & First Amendment](https://constitution.findlaw.com/amendment1/defamation-and-false-statements-under-the-first-amendment.html), [Minc Law – opinion defense](https://www.minclaw.com/opinion-defense/), [Bose Corp. v. Consumers Union (Justia)](https://supreme.justia.com/cases/federal/us/466/485/), [First Amendment Encyclopedia – Bose](https://firstamendment.mtsu.edu/article/bose-corp-v-consumers-union-of-united-states-inc/).

## 3.2 Perceived-bias / independence challenges

**The risk:** Even with zero pay-for-score, scored entities and critics will allege methodological bias, ideological capture, or arbitrary judgment — the cheapest way to discredit a ranking.

**Mitigations:**
- **Radical methodological transparency** — publish the full rubric, weights, evidence, and change history (FMTI's 100 indicators; V-Dem's open model). Reproducibility makes "bias" claims testable and usually refutable.
- **External advisory board** of credible, non-conflicted experts to review methodology (FMTI's 5-person board is a cheap, high-legitimacy model feasible from day one).
- **Right of reply / correction process** for scored entities — engagement without surrender (WBA's "allies" model).
- **Distributed / rules-based scoring** so no single person's judgment moves a number quietly.
- **Diversify funders across the ideological spectrum** — CAIS shows that concentration in a single *worldview* cluster (even with no pay-for-score) invites "captured by an ideology" criticism. Breadth of funding signals breadth of independence.

## 3.3 Funder-influence risk (and how to firewall it)

**The risk:** A grantmaker or service client steers coverage, scoring, or emphasis — the classic capture vector, especially acute because some potential funders may themselves be (or be tied to) scored entities.

**Mitigations (a layered firewall, drawn from the comparables):**
1. **Bright-line: no scored entity funds its own score**, and ideally no scored entity is a *material* funder of the org (the strongest version: AI Now-style categorical refusal of money from the scrutinized sector).
2. **No single funder > ~10% of revenue** (TI norm) — diversify across grants, earned revenue, and many small donors.
3. **Un-earmarked / general-operating grants only** for core scoring work (AI Now) — funders cannot buy a project that shapes findings.
4. **"We can criticize our funders" clause** in writing (Bellingcat); **flagship index funded by non-conflicted money** with a "staff decide, not donors" rule (Freedom House).
5. **Reverse due diligence** on large donors (Bellingcat > €5k) and **public disclosure** of all funders above a low threshold (TI > €1k).
6. **Methodological firewall** — the score is produced by the rubric and evidence, not by anyone in a funding relationship; decisions are logged.

## 3.4 Sustainability of a solo-founder org

**The risk:** Key-person dependence — funder, board, and reputational concentration in one person; burnout; no continuity. (Mozilla's revenue concentration and CAIS's FTX clawback show how fragile concentrated dependence is.)

**Mitigations:**
- **Diversify revenue early**: blend grants + tiered earned revenue (ProPublica/Bellingcat) + a **broad small-donor base** (OWID's 4,000+ donors; AlgorithmWatch's "Friends") — small donors are both income and an independence signal.
- **Use fiscal sponsorship** to outsource back-office (accounting, HR, compliance) so the founder stays on mission during the build-out.
- **Automate and document the research pipeline** (already a strength — the nightly evidence-scan/assessment pipeline is an institutional asset that reduces key-person risk if documented and reproducible).
- **Recruit a real board** (next) to provide continuity, succession, and credibility beyond the founder.
- **Build the methodology as the durable asset** — a transparent, reproducible method outlives any individual.

## 3.5 Governance / board recruitment

**The risk:** Solo founders struggle to assemble the **3+ unrelated directors** the IRS/states expect, and a weak board undermines both compliance and the independence brand.

**Mitigations:**
- **Recruit a small (3–5) founding board** chosen for *independence credibility* over industry ties (AI Now's non-industry board model) — e.g., an ethicist/researcher on suffering/welfare, a nonprofit-governance/legal expert, a data-methods expert, a journalist/transparency figure. An **external methodology advisory board** can supplement the fiduciary board cheaply (FMTI model).
- **Adopt strong governance documents at formation**: conflict-of-interest policy, funding-acceptance/firewall policy, and a **supermajority-locked independence clause** in the bylaws.
- **Stagger terms and define succession** to reduce founder-dependence.
- **Mind founder control vs. independence tension**: the founder will want to protect the mission, but an independent-majority board is what *proves* independence to the public and the IRS. Lock the mission in the bylaws (hard to amend) rather than relying on founder board control.

---

# RECOMMENDATION

**Primary path: Form Compassion Benchmark as a US 501(c)(3) public charity with a related earned-revenue program, and use a Model C fiscal sponsor as a bridge to grants during the ~3–6 month IRS determination.**

Rationale:

1. **It fits the funding profile and rewards the brand.** The intended mix — foundation grants, mission-aligned earned revenue, and (ideally) many small donors — maps to public-charity status, and the required **independent-board-majority is itself an anti-capture mechanism** that operationalizes the independence policy. This is the form chosen by the closest US analogues (ProPublica, Access Now, AI Now, Freedom House).
2. **It preserves the existing earned-revenue model.** Selling research assets and institutional *interpretation/training* services is defensible as **substantially related** educational program activity (university-/museum-style), so most of it is non-taxable. Keep the core rankings and methodology free; sell *derived* depth with **tiered pricing** (ProPublica Data Store model); file 990-T on any genuinely unrelated lines; and keep commerce *incidental and subordinate* to mission to stay clear of the commerciality doctrine. Use the **full Form 1023** (not 1023-EZ) precisely so the earned-revenue model and independence safeguards are described and pre-cleared with the IRS.
3. **Fiscal sponsorship removes the timing and back-office barriers** for a solo founder — it unlocks tax-deductible foundation grants immediately and outsources compliance, while the standalone entity is built. Treat it as a bridge, not a home (the RDR cautionary tale).
4. **Governance locks in independence as a structural guarantee.** At formation: bylaw-level, supermajority-locked "no pay for inclusion/score/suppression" clause; an independent 3–5 person board chosen for credibility over ties; a conflict-of-interest policy extended to funder conflicts; and a **written funding-acceptance/firewall policy** assembled from the best comparable clauses — *no scored entity as a material funder* (AI Now-style bright line), *no single donor > 10%* (TI), *"we can criticize our funders"* (Bellingcat), *flagship index decisions made by staff independent of donors* (Freedom House), and *public funder disclosure*. Pair this with **methodological capture-resistance** (V-Dem / FMTI): a published rubric, distributed/rules-based scoring, reproducibility, and an external methodology advisory board.

**Secondary / future path: add a wholly-owned taxable subsidiary (the Mozilla structure) only if commercial sales scale** beyond what "related" program activity comfortably supports. The charity keeps brand/IP/mission control; the subsidiary does unrestricted commercial deals and pays tax; profits flow up. Do **not** build this at formation — it adds complexity prematurely — and heed Mozilla's warning: **never let any single funder or customer (least of all a scored entity) dominate revenue.**

Net: a 501(c)(3) public charity does not just *permit* Compassion Benchmark's independence-plus-earned-revenue model — it is the structure that makes the independence policy **legally durable, founder-independent, and credible**, which is the entire point of converting.

---

# SOURCES

**Legal structure (501(c)(3), foundations, UBIT, formation)**
- Foundation Group — Public Support Test: https://www.501c3.org/understanding-the-501c3-public-support-test/
- Perlman & Perlman — Comparison of 501(c)(3) classifications: https://perlmanandperlman.com/comparison-of-501c3-tax-exempt-classifications-br-public-charity-private-non-operating-foundation-and-private-operating-foundation/
- Cullinane Law — Public charity vs private foundation: https://cullinanelaw.com/difference-between-public-charity-and-private-foundation/
- National Council of Nonprofits — UBIT: https://www.councilofnonprofits.org/running-nonprofit/administration-and-financial-management/unrelated-business-income-taxation
- IRS — Publication 598 (UBIT): https://www.irs.gov/publications/p598
- Hurwit & Associates — Substantially related / UBI: https://www.hurwitassociates.com/taxation-of-unrelated-business-income/taxation-of-unrelated-business-income/
- IRS — EO publishing activities (Rev. Rul. 67-4): https://www.irs.gov/pub/irs-tege/eotopice88.pdf
- CharityLawyer — Commerciality doctrine: https://charitylawyerblog.com/2009/11/08/501c3-organizations-and-the-commerciality-doctrine/
- Perlman & Perlman — IRS & commercial charities: https://perlmanandperlman.com/irs-declares-war-on-commercial-charities/
- Adler & Colvin — Revenue-generating activities of charities: https://www.adlercolvin.com/revenue-generating-activities-of-charitable-organizations-legal-issues/
- IRS — About Form 1023-EZ: https://www.irs.gov/forms-pubs/about-form-1023-ez
- Wegner CPAs — Form 1023 vs 1023-EZ FAQs: https://www.wegnercpas.com/form-1023-and-form-1023-ez-faqs-2/
- National Council of Nonprofits — Incorporation & state forms: https://www.councilofnonprofits.org/running-nonprofit/how-start-nonprofit/how-start-nonprofit-step-3-incorporation-and-state-forms
- RallyUp — Cost to start a nonprofit: https://rallyup.com/blog/how-much-does-it-cost-to-start-a-nonprofit/

**Fiscal sponsorship & hybrid structures**
- Mission Edge — Fiscal Sponsorship Model A vs C: https://www.missionedge.org/news-and-resources/fiscal-sponsorship-model-a-vs-model-c
- GVNG — Choosing a fiscal sponsorship model: https://gvng.org/blog/understanding-fiscal-sponsorship-choosing-the-right-model-for-your-mission/
- Code for Science & Society — Working with a fiscal sponsor: https://www.codeforsociety.org/resources/working-with-a-fiscal-sponsor
- NumFOCUS — Fiscal sponsor of scientific software: https://bssw.io/blog_posts/numfocus-a-fiscal-sponsor-of-scientific-software
- Ethix — B-Corp / Benefit Corp / L3C / PBC: https://ethixmerch.com/blog/b-corp-benefit-corp/
- LegalGPS — L3C vs B Corp: https://www.legalgps.com/business-entity-comparison/l3c-vs-b-corp
- Mozilla — Governance / organizations: https://www.mozilla.org/en-US/about/governance/organizations/

**Governance & independence**
- BoardSource — Conflict of interest for nonprofits: https://boardsource.org/resources/nonprofit-conflict-of-interest/
- National Council of Nonprofits — Conflicts of interest: https://www.councilofnonprofits.org/running-nonprofit/governance-leadership/conflicts-interests
- Institute for Nonprofit News — Membership standards (firewall): https://inn.org/about/membership-standards/

**Comparable organizations**
- World Benchmarking Alliance — Finances: https://www.worldbenchmarkingalliance.org/finances/ · Governance: https://www.worldbenchmarkingalliance.org/about-us/our-governance
- Ranking Digital Rights — Who we are: https://rankingdigitalrights.org/who-we-are/
- V-Dem Institute — FAQ (funding/coder anonymity): https://www.v-dem.net/about/faq/ · Institute: https://www.v-dem.net/about/v-dem-institute/
- Freedom House — Financials & independence: https://freedomhouse.org/about-us/financials
- Transparency International — Donation policy & guidelines: https://www.transparency.org/en/donation-policy-and-guidelines · Funding & financials: https://www.transparency.org/en/the-organisation/funding-and-financials
- Our World in Data — How we're funded: https://ourworldindata.org/funding · Global Change Data Lab (Charity Commission): https://register-of-charities.charitycommission.gov.uk/en/charity-search/-/charity-details/5140507
- ProPublica — About: https://www.propublica.org/about · Data Store revenue (Nieman Lab): https://www.niemanlab.org/2016/10/propublicas-data-store-which-has-pulled-in-200k-is-now-selling-datasets-for-other-news-orgs/
- Bellingcat — Funding & how to support: https://www.bellingcat.com/about/funding-and-how-to-support-bellingcat/
- Mozilla Foundation — Wikipedia: https://en.wikipedia.org/wiki/Mozilla_Foundation · Mozilla Corporation — Wikipedia: https://en.wikipedia.org/wiki/Mozilla_Corporation
- Access Now — Financials/funding: https://www.accessnow.org/financials/
- AlgorithmWatch — Transparency & governance: https://algorithmwatch.org/en/transparency/
- MLCommons — About: https://mlcommons.org/about-us/ · Get involved (membership): https://mlcommons.org/get-involved/
- Epoch AI — Our funding: https://epoch.ai/our-funding · OpenAI/FrontierMath disclosure controversy (TechCrunch): https://techcrunch.com/2025/01/19/ai-benchmarking-organization-criticized-for-waiting-to-disclose-funding-from-openai/
- Center for AI Safety: https://safe.ai/ · CAIS Action Fund (501c4, GuideStar): https://www.guidestar.org/profile/93-2442608
- AI Now Institute — About (no-corporate-money policy, funders, board): https://ainowinstitute.org/about
- Stanford CRFM — Foundation Model Transparency Index: https://crfm.stanford.edu/fmti/October-2023/index.html · HAI advisory board: https://hai.stanford.edu/news/crfm-names-advisory-board-foundation-model-transparency-index

**Risks (defamation, ratings precedent)**
- FindLaw — Defamation & the First Amendment: https://constitution.findlaw.com/amendment1/defamation-and-false-statements-under-the-first-amendment.html
- Minc Law — Can a statement of opinion be defamatory?: https://www.minclaw.com/opinion-defense/
- Bose Corp. v. Consumers Union (Justia, U.S. 1984): https://supreme.justia.com/cases/federal/us/466/485/
- First Amendment Encyclopedia — Bose Corp. v. Consumers Union: https://firstamendment.mtsu.edu/article/bose-corp-v-consumers-union-of-united-states-inc/
