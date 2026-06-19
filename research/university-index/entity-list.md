# University Index — Canonical Entity List (Top 100)

**Status:** Entity list only. No compassion scoring performed yet.
**Compiled:** 2026-06-19
**Count:** 100 institutions (whole-university / institution level)

---

## Ranking sources

This list is a defensible composite of the three most widely cited 2026-cycle global
university rankings:

| Source | Edition used | Coverage taken | Notes |
|--------|--------------|----------------|-------|
| Times Higher Education (THE) World University Rankings | **2026** | Ranks 1–100 | Released Oct 2025; Oxford #1 for 10th year |
| QS World University Rankings | **2026** | Ranks 1–100 | MIT #1; 1,501 ranked institutions |
| ShanghaiRanking ARWU (Academic Ranking of World Universities) | **2025** | Ranks 1–100 | Released Aug 2025; Harvard #1 (23rd year). This is the latest ARWU edition; the 2026 ARWU publishes Aug 2026. |

Primary URLs:
- THE 2026: https://www.timeshighereducation.com/world-university-rankings/latest/world-ranking
- QS 2026: https://www.topuniversities.com/world-university-rankings/2026 (full table cross-checked via alluniversity.info and mastersportal.com)
- ARWU 2025: https://www.shanghairanking.com/rankings/arwu/2025 (full table cross-checked via xuanxiao.org and mastersportal.com)

## Composite method & tie-break

A simple, auditable average-rank composite:

1. For each institution, record its rank in each of the three lists (1–100).
2. If an institution is **not** in a given list's top 100, it is assigned a **penalty rank of 101** for that list (so breadth of recognition across systems is rewarded; ARWU's heavy STEM/Nobel-citation bias and QS's reputation-survey bias partly cancel).
3. **Composite key** = arithmetic mean of the three (possibly penalised) ranks. Lower is better.
4. **Tie-break order:** (a) more list appearances first — an institution in all three top-100s outranks one in only two even if the two-list average looks lower on raw numbers; (b) then lower mean rank; (c) then alphabetical.
5. The top 100 of the resulting ordering is this entity list.

Consequence of the breadth rule: the first **58** institutions appear in **all three** top-100 lists; ranks 59–91 appear in **two**; ranks 92–100 appear in **one** strong list (typically ARWU-only medical/research institutes or a single specialised entry). This is intentional and transparent — it keeps multi-system-validated universities at the top and treats single-list entries as the tail.

Each institution's per-source ranks are shown in the table so the composite is fully reconstructable. Reproduction script: `research/university-index/build_composite.mjs`.

## Evidence-depth flag (for the scoring phase)

The compassion-scoring phase relies heavily on English-language public evidence
(annual reports, equity/wellbeing policies, ombuds reports, news, staff/student
testimony). This produces a **geographic / English-language skew**: institutions in
the US, UK, Ireland, Canada, Australia, New Zealand, and Singapore have abundant
English-language public evidence; many strong institutions in East Asia, continental
Europe, the Middle East, and Latin America publish primarily in their national language.

Each row carries `evidenceDepth = high | medium | low` so the scoring phase can attach
a confidence flag and avoid penalising an institution merely for thin English-language
disclosure:

- **high** — primary operating/reporting language is English; deep public disclosure norms (US, UK, IE, CA, AU, NZ, Singapore, Hong Kong English-medium).
- **medium** — strong international/English presence and substantial English reporting, but core governance/HR/equity disclosure often in national language (most of continental W. Europe, Japan/Korea flagship internationally-facing universities).
- **low** — significant compassion-relevant evidence likely exists mainly in the national language and/or behind limited public disclosure; English-language desk research will be thinner (Mainland China, parts of continental Europe with limited English disclosure, Argentina, Saudi Arabia, Israel-Hebrew-primary, Taiwan).

This flag is about **evidence availability for scoring**, not institutional quality.

---

## Ranked entity list (1–100)

`slug` values are unique, url-safe kebab-case. Per-source ranks: `T`=THE 2026, `Q`=QS 2026, `A`=ARWU 2025 (`–` = outside that list's top 100).

| # | Name | slug | Country | Region | Type | Ev.Depth | T | Q | A | Note |
|---|------|------|---------|--------|------|----------|---|---|---|------|
| 1 | Massachusetts Institute of Technology | massachusetts-institute-of-technology | United States | North America | private | high | 2 | 1 | 3 | |
| 2 | Stanford University | stanford-university | United States | North America | private | high | 5 | 3 | 2 | |
| 3 | Harvard University | harvard-university | United States | North America | private | high | 5 | 5 | 1 | |
| 4 | University of Oxford | university-of-oxford | United Kingdom | Europe | public | high | 1 | 4 | 6 | |
| 5 | University of Cambridge | university-of-cambridge | United Kingdom | Europe | public | high | 3 | 6 | 4 | |
| 6 | California Institute of Technology | california-institute-of-technology | United States | North America | private | high | 7 | 10 | 9 | |
| 7 | University of California, Berkeley | university-of-california-berkeley | United States | North America | public | high | 9 | 17 | 5 | Flagship of UC system; scored as the Berkeley campus. |
| 8 | Princeton University | princeton-university | United States | North America | private | high | 3 | 25 | 7 | |
| 9 | Imperial College London | imperial-college-london | United Kingdom | Europe | public | high | 8 | 2 | 26 | |
| 10 | University of Chicago | university-of-chicago | United States | North America | private | high | 15 | 13 | 10 | |
| 11 | ETH Zurich | eth-zurich | Switzerland | Europe | public | medium | 11 | 7 | 22 | Swiss Federal Institute of Technology Zurich. |
| 12 | Yale University | yale-university | United States | North America | private | high | 10 | 21 | 11 | |
| 13 | University of Pennsylvania | university-of-pennsylvania | United States | North America | private | high | 14 | 15 | 14 | |
| 14 | University College London | university-college-london | United Kingdom | Europe | public | high | 22 | 9 | 14 | |
| 15 | Cornell University | cornell-university | United States | North America | private | high | 18 | 16 | 12 | Private (incl. NY statutory colleges); classified private. |
| 16 | Tsinghua University | tsinghua-university | China | Asia-Pacific | public | low | 12 | 17 | 18 | |
| 17 | Peking University | peking-university | China | Asia-Pacific | public | low | 13 | 14 | 23 | |
| 18 | Johns Hopkins University | johns-hopkins-university | United States | North America | private | high | 16 | 24 | 19 | |
| 19 | Columbia University | columbia-university | United States | North America | private | high | 20 | 38 | 8 | |
| 20 | University of Toronto | university-of-toronto | Canada | North America | public | high | 21 | 29 | 25 | |
| 21 | University of California, Los Angeles | university-of-california-los-angeles | United States | North America | public | high | 18 | 46 | 16 | UC system campus; scored as UCLA campus. |
| 22 | National University of Singapore | national-university-of-singapore | Singapore | Asia-Pacific | public | high | 17 | 8 | 56 | English-medium. |
| 23 | University of Tokyo | university-of-tokyo | Japan | Asia-Pacific | public | medium | 26 | 36 | 31 | |
| 24 | Technical University of Munich | technical-university-of-munich | Germany | Europe | public | medium | 27 | 22 | 45 | |
| 25 | University of Melbourne | university-of-melbourne | Australia | Asia-Pacific | public | high | 37 | 19 | 38 | |
| 26 | University of Edinburgh | university-of-edinburgh | United Kingdom | Europe | public | high | 29 | 34 | 37 | |
| 27 | EPFL | epfl | Switzerland | Europe | public | medium | 35 | 22 | 44 | École Polytechnique Fédérale de Lausanne. |
| 28 | University of Michigan | university-of-michigan | United States | North America | public | high | 23 | 45 | 33 | Ann Arbor flagship campus. |
| 29 | Northwestern University | northwestern-university | United States | North America | private | high | 30 | 42 | 31 | |
| 30 | Fudan University | fudan-university | China | Asia-Pacific | public | low | 36 | 30 | 41 | |
| 31 | PSL University | psl-university | France | Europe | public | medium | 48 | 28 | 34 | Paris Sciences et Lettres — collegiate research university; scored as the PSL federation. |
| 32 | University of Hong Kong | university-of-hong-kong | Hong Kong | Asia-Pacific | public | high | 33 | 11 | 67 | English-medium. |
| 33 | Zhejiang University | zhejiang-university | China | Asia-Pacific | public | low | 39 | 49 | 24 | |
| 34 | New York University | new-york-university | United States | North America | private | high | 31 | 55 | 28 | NYC degree-granting institution (global network); scored as NYU. |
| 35 | Shanghai Jiao Tong University | shanghai-jiao-tong-university | China | Asia-Pacific | public | low | 40 | 47 | 30 | |
| 36 | University of Washington | university-of-washington | United States | North America | public | high | 25 | 81 | 17 | Seattle flagship campus. |
| 37 | King's College London | kings-college-london | United Kingdom | Europe | public | high | 38 | 31 | 61 | |
| 38 | Nanyang Technological University | nanyang-technological-university | Singapore | Asia-Pacific | public | high | 31 | 12 | 88 | English-medium. |
| 39 | University of California, San Diego | university-of-california-san-diego | United States | North America | public | high | 47 | 66 | 20 | UC system campus. |
| 40 | LMU Munich | lmu-munich | Germany | Europe | public | medium | 34 | 58 | 42 | Ludwig-Maximilians-Universität München. |
| 41 | Duke University | duke-university | United States | North America | private | high | 28 | 62 | 46 | |
| 42 | University of Manchester | university-of-manchester | United Kingdom | Europe | public | high | 56 | 35 | 46 | |
| 43 | University of British Columbia | university-of-british-columbia | Canada | North America | public | high | 45 | 40 | 53 | Vancouver flagship campus. |
| 44 | McGill University | mcgill-university | Canada | North America | public | high | 41 | 27 | 76 | English-medium in francophone Québec. |
| 45 | University of Sydney | university-of-sydney | Australia | Asia-Pacific | public | high | 53 | 25 | 72 | |
| 46 | Paris-Saclay University | paris-saclay-university | France | Europe | public | medium | 68 | 70 | 13 | Université Paris-Saclay — research federation; scored as the federation. |
| 47 | Kyoto University | kyoto-university | Japan | Asia-Pacific | public | medium | 61 | 57 | 46 | |
| 48 | University of Illinois Urbana-Champaign | university-of-illinois-urbana-champaign | United States | North America | public | high | 41 | 70 | 53 | Flagship of U of Illinois system. |
| 49 | University of Texas at Austin | university-of-texas-at-austin | United States | North America | public | high | 50 | 68 | 49 | Flagship of UT system; scored as Austin campus. |
| 50 | Monash University | monash-university | Australia | Asia-Pacific | public | high | 58 | 36 | 76 | |
| 51 | Seoul National University | seoul-national-university | South Korea | Asia-Pacific | public | medium | 58 | 38 | 81 | |
| 52 | UNSW Sydney | unsw-sydney | Australia | Asia-Pacific | public | high | 79 | 20 | 80 | University of New South Wales. |
| 53 | Heidelberg University | heidelberg-university | Germany | Europe | public | medium | 49 | 80 | 51 | Ruprecht-Karls-Universität Heidelberg. |
| 54 | KU Leuven | ku-leuven | Belgium | Europe | public | medium | 46 | 60 | 76 | Katholieke Universiteit Leuven (Flemish). |
| 55 | University of Queensland | university-of-queensland | Australia | Asia-Pacific | public | high | 80 | 42 | 65 | |
| 56 | Sorbonne University | sorbonne-university | France | Europe | public | medium | 76 | 72 | 43 | Sorbonne Université (2018 merger); distinct from Paris 1 Panthéon-Sorbonne. |
| 57 | University of Bristol | university-of-bristol | United Kingdom | Europe | public | high | 80 | 51 | 98 | |
| 58 | City University of Hong Kong | city-university-of-hong-kong | Hong Kong | Asia-Pacific | public | high | 73 | 63 | 99 | English-medium. |
| 59 | Chinese University of Hong Kong | chinese-university-of-hong-kong | Hong Kong | Asia-Pacific | public | high | 41 | 32 | – | English-medium. In 2 of 3 lists. |
| 60 | Carnegie Mellon University | carnegie-mellon-university | United States | North America | private | high | 24 | 52 | – | In 2 of 3 lists (ARWU undervalues its CS-heavy profile). |
| 61 | University of Wisconsin–Madison | university-of-wisconsin-madison | United States | North America | public | high | 53 | – | 36 | Flagship of UW system; Madison campus. In 2 of 3 lists. |
| 62 | University of Science and Technology of China | university-of-science-and-technology-of-china | China | Asia-Pacific | public | low | 51 | – | 40 | USTC, Hefei. In 2 of 3 lists. |
| 63 | Washington University in St. Louis | washington-university-in-st-louis | United States | North America | private | high | 67 | – | 26 | In 2 of 3 lists. |
| 64 | Hong Kong University of Science and Technology | hong-kong-university-of-science-and-technology | Hong Kong | Asia-Pacific | public | high | 58 | 44 | – | HKUST; English-medium. In 2 of 3 lists. |
| 65 | Karolinska Institute | karolinska-institute | Sweden | Europe | public | medium | 53 | – | 50 | Medical university; not in QS comprehensive top 100. In 2 of 3 lists. |
| 66 | Delft University of Technology | delft-university-of-technology | Netherlands | Europe | public | medium | 57 | 47 | – | TU Delft. In 2 of 3 lists. |
| 67 | Australian National University | australian-national-university | Australia | Asia-Pacific | public | high | 73 | 32 | – | In 2 of 3 lists. |
| 68 | London School of Economics and Political Science | london-school-of-economics-and-political-science | United Kingdom | Europe | public | high | 52 | 56 | – | LSE; social-science specialist, so absent from STEM-weighted ARWU top 100. In 2 of 3 lists. |
| 69 | Institut Polytechnique de Paris | institut-polytechnique-de-paris | France | Europe | public | medium | 68 | 41 | – | IP Paris (incl. École Polytechnique). In 2 of 3 lists. |
| 70 | University of Amsterdam | university-of-amsterdam | Netherlands | Europe | public | medium | 62 | 53 | – | In 2 of 3 lists. |
| 71 | University of North Carolina at Chapel Hill | university-of-north-carolina-at-chapel-hill | United States | North America | public | high | 78 | – | 39 | Flagship of UNC system. In 2 of 3 lists. |
| 72 | University of Copenhagen | university-of-copenhagen | Denmark | Europe | public | medium | 90 | – | 35 | In 2 of 3 lists. |
| 73 | Brown University | brown-university | United States | North America | private | high | 65 | 69 | – | In 2 of 3 lists. |
| 74 | Hong Kong Polytechnic University | hong-kong-polytechnic-university | Hong Kong | Asia-Pacific | public | high | 80 | 54 | – | English-medium. In 2 of 3 lists. |
| 75 | Yonsei University | yonsei-university | South Korea | Asia-Pacific | private | medium | 86 | 50 | – | In 2 of 3 lists. |
| 76 | Nanjing University | nanjing-university | China | Asia-Pacific | public | low | 62 | – | 75 | In 2 of 3 lists. |
| 77 | University of Minnesota | university-of-minnesota | United States | North America | public | high | 88 | – | 51 | Twin Cities flagship campus. In 2 of 3 lists. |
| 78 | University of Southern California | university-of-southern-california | United States | North America | private | high | 73 | – | 68 | In 2 of 3 lists. |
| 79 | University of California, Santa Barbara | university-of-california-santa-barbara | United States | North America | public | high | 72 | – | 70 | UC system campus. In 2 of 3 lists. |
| 80 | Vanderbilt University | vanderbilt-university | United States | North America | private | high | 92 | – | 62 | In 2 of 3 lists. |
| 81 | University of Groningen | university-of-groningen | Netherlands | Europe | public | medium | 82 | – | 73 | In 2 of 3 lists. |
| 82 | University of Bonn | university-of-bonn | Germany | Europe | public | medium | 92 | – | 68 | Rheinische Friedrich-Wilhelms-Universität Bonn. In 2 of 3 lists. |
| 83 | University of Glasgow | university-of-glasgow | United Kingdom | Europe | public | high | 84 | 79 | – | In 2 of 3 lists. |
| 84 | Boston University | boston-university | United States | North America | private | high | 76 | 88 | – | In 2 of 3 lists. |
| 85 | University of Zurich | university-of-zurich | Switzerland | Europe | public | medium | – | 100 | 64 | Distinct from ETH Zurich. In 2 of 3 lists. |
| 86 | Lund University | lund-university | Sweden | Europe | public | medium | 95 | 72 | – | In 2 of 3 lists. |
| 87 | Purdue University | purdue-university | United States | North America | public | high | 85 | 88 | – | West Lafayette flagship campus. In 2 of 3 lists. |
| 88 | University of Birmingham | university-of-birmingham | United Kingdom | Europe | public | high | 98 | 76 | – | In 2 of 3 lists. |
| 89 | KTH Royal Institute of Technology | kth-royal-institute-of-technology | Sweden | Europe | public | medium | 98 | 78 | – | Kungliga Tekniska högskolan. In 2 of 3 lists. |
| 90 | University of California, Irvine | university-of-california-irvine | United States | North America | public | high | 97 | – | 79 | UC system campus. In 2 of 3 lists. |
| 91 | Uppsala University | uppsala-university | Sweden | Europe | public | medium | – | 93 | 93 | In 2 of 3 lists. |
| 92 | University of California, San Francisco | university-of-california-san-francisco | United States | North America | public | high | – | – | 21 | Biomedical/health-sciences-only campus; ranks very high in ARWU, absent from THE/QS comprehensive lists by design. |
| 93 | Rockefeller University | rockefeller-university | United States | North America | private | high | – | – | 29 | Biomedical graduate/research institute; ARWU-only by nature. |
| 94 | Georgia Institute of Technology | georgia-institute-of-technology | United States | North America | public | high | 41 | – | – | Strong THE-only top-50 placement (QS 99/ARWU just outside top 100). |
| 95 | University of Maryland, College Park | university-of-maryland-college-park | United States | North America | public | high | – | – | 55 | Flagship of USM system; College Park campus. |
| 96 | Utrecht University | utrecht-university | Netherlands | Europe | public | medium | – | – | 56 | |
| 97 | University of Geneva | university-of-geneva | Switzerland | Europe | public | medium | – | – | 58 | Université de Genève. |
| 98 | University of Malaya | university-of-malaya | Malaysia | Asia-Pacific | public | medium | – | 58 | – | Strong QS-only placement; English-medium. |
| 99 | UT Southwestern Medical Center | ut-southwestern-medical-center | United States | North America | public | high | – | – | 58 | Health-sciences-only institution (UT system); ARWU-only by nature. |
| 100 | Université Paris Cité | universite-paris-cite | France | Europe | public | medium | – | – | 60 | Formed 2019 (Paris Descartes + Paris Diderot + IPGP). |

---

## Composition summary

### Count by region

| Region | Count |
|--------|-------|
| North America | 41 |
| Europe | 34 |
| Asia-Pacific | 25 |
| **Total** | **100** |

(Asia-Pacific here includes East Asia, Southeast Asia, and Australasia. No institutions from the Middle East, Africa, or Latin America cleared the composite top 100 this cycle. The highest near-misses include University of Buenos Aires (Argentina), King Fahd University of Petroleum & Minerals (Saudi Arabia), the Israeli research universities (Weizmann, Hebrew U, Technion), and National Taiwan University — see "Notable near-misses" below.)

### Count by country / territory

| Country / Territory | Count |
|---------------------|-------|
| United States | 38 |
| United Kingdom | 11 |
| China (Mainland) | 7 |
| Australia | 6 |
| France | 5 |
| Hong Kong | 5 |
| Germany | 4 |
| Switzerland | 4 |
| Sweden | 4 |
| Netherlands | 4 |
| Canada | 3 |
| Singapore | 2 |
| South Korea | 2 |
| Japan | 2 |
| Denmark | 1 |
| Belgium | 1 |
| Malaysia | 1 |
| **Total** | **100** |

### Count by evidence depth (for scoring-confidence weighting)

| evidenceDepth | Count | Notes |
|---------------|-------|-------|
| high | 65 | US/UK/CA/AU/SG + HK English-medium |
| medium | 28 | Continental Europe, Japan, South Korea, Malaysia |
| low | 7 | Mainland China (all 7) |
| **Total** | **100** | |

(Low = the 7 Mainland-China universities, where compassion-relevant governance/HR/equity evidence is largely in Chinese and behind limited public disclosure. Medium covers continental-European, Japanese, Korean, and Malaysian institutions where core governance/HR/equity disclosure is often in the national language even when an English presence exists.)

### Type breakdown

| Type | Count |
|------|-------|
| public | 78 |
| private | 22 |
| **Total** | **100** |

---

## Notable inclusion / exclusion & identity judgment calls

1. **System vs. flagship campus.** Where a US public "university" is a multi-campus system, the entity is the well-understood flagship/principal campus that the rankings actually measure: UC Berkeley, UCLA, UCSD, UC Santa Barbara, UC Irvine (each a distinct UC campus and ranked separately — they are *not* collapsed into "University of California"); Michigan = Ann Arbor; Washington = Seattle; Texas = Austin; Illinois = Urbana-Champaign; Wisconsin = Madison; Minnesota = Twin Cities; Maryland = College Park; Purdue = West Lafayette; UNC = Chapel Hill. Each note records the campus chosen.

2. **French research federations.** PSL University and Université Paris-Saclay are collegiate/federated research universities (groupings of grandes écoles and institutes). The rankings score the federation, and so does this list. Sorbonne Université and Université Paris Cité are post-merger comprehensive universities and are scored as the merged institution; Sorbonne Université is distinct from Paris 1 Panthéon-Sorbonne.

3. **Specialised / single-domain institutions retained.** Karolinska Institute (medicine), UCSF and UT Southwestern (health sciences), and Rockefeller University (biomedical research) are not comprehensive universities and therefore appear in only one ranking (chiefly ARWU, which rewards Nobel/citation density). They legitimately rank among the world's strongest research institutions and are retained, but their tail position (92–99) and single-list provenance is flagged. The scoring phase should treat them as specialised institutions, not full-service universities.

4. **LSE.** A social-science specialist; absent from ARWU's STEM-citation-weighted top 100 by construction, but top-60 in both THE and QS. Retained at #68 on two-list strength.

5. **Carnegie Mellon.** Strong in THE (#24) and QS (#52) but outside ARWU's top 100 (ARWU underweights computer science, where CMU is a global leader). Retained at #60 — a clear case where ARWU's methodology alone would mislead.

6. **Geographic skew is real and documented.** The composite is dominated by the US (38), UK (12), and the anglophone + East-Asian research powers. This mirrors the underlying rankings' known biases (English-language publication counting, reputation surveys skewed to established Western institutions, Nobel/Fields/citation metrics favouring older wealthy universities). For the compassion-scoring phase, the `evidenceDepth` flag is the mitigation: do not let thin English-language disclosure (the 7 Mainland-China "low" and 28 "medium" entities) be read as absence of compassionate practice.

7. **Notable near-misses (ranks ~101–115, excluded):** Korea University, National Taiwan University, University of Colorado Boulder, Sun Yat-sen University, University of Auckland, Wageningen University & Research, King Fahd University of Petroleum & Minerals, KAIST, Leiden University, Weizmann Institute of Science, Hebrew University of Jerusalem, Technion, University of Buenos Aires, University of California Davis. Several (KAIST, Leiden, Wageningen, NTU-Taiwan, the Israeli institutes, UC Davis, Buenos Aires) are strong single-list entries that lost on the breadth tie-break. They are the first candidates if the index is later expanded beyond 100.

---

## Reproducibility

- Composite computed by `research/university-index/build_composite.mjs` (deterministic; no external calls).
- Re-run: `node research/university-index/build_composite.mjs` from the repo root.
- Per-source ranks for every listed institution are printed in the table above; the script's full output (ranks 1–110) shows the near-miss tail.

*This is an entity list and ranking-composite only. No Compassion Benchmark scoring has been applied. Slugs, country, region, type, and evidenceDepth are provided to seed the subsequent scoring phase.*
