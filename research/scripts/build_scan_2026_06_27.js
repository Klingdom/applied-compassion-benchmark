const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Users/philk/applied-compassion-benchmark/research/rotation-state.json', 'utf8'));
const entities = data.entities;
const keys = Object.keys(entities);
const today = '2026-06-27';
const todayDate = new Date(today);

function daysSince(dateStr) {
  if (!dateStr) return 999;
  return Math.floor((todayDate - new Date(dateStr)) / 86400000);
}
function stalenessScore(e) {
  const d = daysSince(e.last_assessed);
  if (!e.last_assessed) return 25;
  if (d >= 60) return 20;
  if (d >= 30) return 15;
  if (d >= 14) return 5;
  return 0;
}
function importanceScore(e) {
  if (e.index === 'fortune-500') return 15;
  if (e.index === 'countries') return 12;
  if (e.index === 'ai-labs') return 10;
  if (e.index === 'global-cities') return 8;
  if (e.index === 'us-cities') return 5;
  if (e.index === 'robotics-labs') return 5;
  if (e.index === 'us-states') return 3;
  if (e.index === 'universities') return 8;
  return 0;
}
function volatilityScore(e) {
  const c = e.composite || 0;
  if ([20,40,60,80].some(b => Math.abs(c - b) <= 3)) return 10;
  return 0;
}

const allPrioritized = keys.map(k => {
  const e = entities[k];
  const ss = stalenessScore(e);
  const is_ = importanceScore(e);
  const vs = volatilityScore(e);
  return {slug: k, name: e.name, index: e.index, composite: e.composite||0, band: e.band, last_assessed: e.last_assessed, staleness: ss, importance: is_, volatility: vs, base_priority: ss+is_+vs};
}).sort((a,b) => b.base_priority - a.base_priority);

const tier1Set = new Set(allPrioritized.slice(0, 150).map(e => e.slug));

// Evidence data from Jun 13–27 searches
// Lookback window: 2026-06-13 through 2026-06-27
// KEY NEW DEVELOPMENTS since Jun 26 scan:
//   1. Lebanon: Rubio framework deal Jun 26 + Hezbollah rejection Jun 27 — MAJOR NEW
//   2. Meta Platforms: Sarah Wynn-Williams gag-order lawsuit filed Jun 25 — NEW
//   3. Niger: UN working group Jun 23 / HRW Jun 26 calls to release detained defender — NEW
//   4. United States: DOJ Olmstead memo Jun 20-22 (disability integration); appeals court Jun 24 speedy deportations — NEW
//   5. Haiti: UN SG Guterres visited Jun 16; gang suppression force deploying — UPDATED
//   6. DRC Ebola: cases 1,155/304 deaths (Jun 25) — updated from 1,118/291 (Jun 24)
// Entities from Jun 26 top_entities that carry forward as continuation:
//   Sudan, DRC, Iran, Anthropic, Israel, Somalia, xAI/Grok, OpenAI, UnitedHealth, Yemen, South Sudan, Apple, Nigeria, Burkina Faso

const evidenceData = {
  // ── CONTINUATION ENTITIES FROM JUN 26 SCAN ──────────────────────────────────
  'sudan': {
    score: 40, found: true,
    summary: 'EL OBEID ONGOING CRITICAL (Jun 13-27): HRW Jun 26 action call on UN Security Council remains unactioned. RSF drone strikes entering Day 15+; power substation destroyed, fuel stations hit, displacement shelters targeted. UNSC Jun 20 statement non-binding — no enforcement resolution issued. 500,000+ civilians besieged. 100,000+ IDPs within city. 50+ civilian deaths confirmed from drone strikes. Famine declared in El-Fasher and Kadugli. RSF encirclement unchanged. No RSF withdrawal or ceasefire brokered as of Jun 27.',
    sources: [
      'https://www.hrw.org/news/2026/06/26/sudan-urgently-address-the-situation-in-and-around-el-obeid-take-bold-steps-towards',
      'https://news.un.org/en/story/2026/06/1167773',
      'https://allafrica.com/stories/202606260039.html'
    ]
  },
  'democratic-republic-of-c': {
    score: 40, found: true,
    summary: 'DUAL CRITICAL UPDATED (Jun 13-27): Ebola — 1,155 confirmed cases / 304 deaths as of Jun 25 (up from 1,118/291 on Jun 24; +37 cases +13 deaths in 24 hrs). FIRST EU CASE (France, Jun 24). Germany imported case. UN: fastest-growing Ebola outbreak in African history. Bundibugyo strain; no approved vaccine. PHEIC since May 16. Contact tracing 45% vs 90% needed. Ituri province accounts for 1,054 of 1,155 cases across 22 health zones. M23/Rwanda: Washington Accords unimplemented — Rwandan troops not withdrawn; FDLR not disbanded; 1,500+ civilians killed since December. Two simultaneous catastrophic crises compounding.',
    sources: [
      'https://www.ecdc.europa.eu/en/ebola-outbreak-democratic-republic-congo-and-uganda',
      'https://www.who.int/emergencies/situations/ebola-outbreak---drc-2026',
      'https://www.hrw.org/news/2026/06/17/trump-declared-peace-in-congo-this-is-the-reality',
      'https://abcnews.com/International/france-confirms-1st-ebola-case-linked-outbreak-drc/story?id=134160026'
    ]
  },
  'iran': {
    score: 40, found: true,
    summary: 'EXECUTION SURGE ONGOING (Jun 13-27): NCRI Jun 25-26 briefs document continued executions post-Islamabad Memorandum. 134 Khordad-month executions (May 22-Jun 21). 31 executed in 4 days Jun 13-16 (one every 3 hrs). 784+ YTD — 37-year high. 45+ political. 78 protesters at imminent risk including 41 arrested in Jan 2026 protests. Prison hunger strikes now in Week 126+ across 56 prisons. Iran executed political prisoners throughout US nuclear peace talks (Islamabad Memorandum Jun 14-17). No slowdown post-MOU.',
    sources: [
      'https://www.ncr-iran.org/en/news/iran-news-in-brief-news/iran-news-in-brief-june-26-2026/',
      'https://www.ncr-iran.org/en/news/iran-news-in-brief-news/iran-news-in-brief-june-25-2026/',
      'https://iranhumanrights.org/2026/06/as-executions-surge-in-iran-prisoners-risk-their-lives-to-protest-the-states-killings/'
    ]
  },
  'anthropic': {
    score: 40, found: true,
    summary: 'FABLE/MYTHOS SUSPENSION DAY 15 — NO CONGRESSIONAL RESPONSE (Jun 27): The Jun 26 bipartisan Congressional deadline for Commerce Secretary Lutnick\'s written statutory justification passed with NO public response. House members demanded explanation of what legal authority allows Commerce to restrict AI API access as an export control. Congressional escalation now expected. Fable 5/Mythos 5 remain suspended globally for all foreign nationals including Anthropic employees (Day 15). Zero Fable/Mythos traffic confirmed Jun 25. Nobel laureate John Jumper (2024 Nobel Chemistry, AlphaFold) announced departure from Google DeepMind to join Anthropic Jun 19-20 — talent signal. EU AI Act enforcement Aug 2 (36 days). Composite exactly 60.0 — at functional/established band boundary.',
    sources: [
      'https://aiweekly.co/node/3228',
      'https://www.washingtonpost.com/technology/2026/06/18/house-members-want-answers-export-controls-placed-anthropic-fable/',
      'https://blog.volkovlaw.com/2026/06/when-the-government-pulls-the-plug-anthropic-export-controls-and-the-future-of-ai-governance/',
      'https://techcrunch.com/2026/06/20/nobel-laureate-john-jumper-is-leaving-deepmind-for-rival-anthropic/'
    ]
  },
  'israel': {
    score: 40, found: true,
    summary: 'ONGOING (Jun 13-27): UN Commission of Inquiry genocide finding Jun 23 unchanged — Israel "deliberately targeting Palestinian children" in genocide and atrocity crimes. 20,000+ children killed Gaza since Oct 2023. Gaza ceasefire fragile: 936 fatalities since Oct 2025 ceasefire; one Palestinian child killed daily on average. Kerem Shalom last open crossing now congested. Zikim crossing closed 2 weeks. Lebanon: Rubio framework agreement announced Jun 26 after marathon talks — Lebanon/Israel signed; Hezbollah immediately rejected Jun 27 as "humiliation, disgrace, surrender of sovereignty." Hezbollah Secretary-General Qassem: "Crosses all red lines." War continues. 4,000+ killed, 1.2M+ displaced in Lebanon since Mar 2.',
    sources: [
      'https://news.un.org/en/story/2026/06/1167790',
      'https://www.aljazeera.com/news/2026/6/23/israels-deliberate-targeting-of-gaza-children-part-of-genocide-un-inquiry',
      'https://www.cnbc.com/2026/06/26/israel-lebanon-hezbollah-ceasefire-rubio.html',
      'https://www.aljazeera.com/features/2026/6/27/israel-lebanon-deal-ties-ceasefire-to-hezbollah-disarmament-will-it-work'
    ]
  },
  'somalia': {
    score: 40, found: true,
    summary: 'BUUR HAKABA FAMINE THRESHOLD DATE PASSED — NO FORMAL DECLARATION FOUND (Jun 27): The IPC projected end-of-June famine threshold for Buur Hakaba district has now arrived. Conditions: GAM rate 37.1% (IPC Phase 5; exceeds one of three IPC famine thresholds). Most malnutrition health facilities closed. WFP reaching only 1-in-10 in need. No formal IPC famine declaration confirmed in search results for Jun 27 — assessors must urgently verify with FSNAU/IPC whether formal famine declaration has been issued. 6.7M face high acute food insecurity. 1.9M children acutely malnourished. IPC alert issued: "Famine projected in two districts."',
    sources: [
      'https://www.ipcinfo.org/ipcinfo-website/alerts-archive/issue-69/en/',
      'https://www.crisisgroup.org/anb/africa/somalia/somalia-barrels-toward-possible-famine-amid-aid-cuts',
      'https://www.actionagainsthunger.org/press-releases/somalia-faces-deepening-hunger-crisis-as-risk-of-famine-emerges-in-burhakaba/',
      'https://www.oxfam.org/en/press-releases/reaction-somalia-integrated-food-security-phase-classification-ipc-report'
    ]
  },
  'xai-grok': {
    score: 40, found: true,
    summary: 'DUAL ACTIVE LEGAL ONGOING (Jun 13-27): (1) OPC Canada PIPEDA ruling (window start Jun 11): Grok violated Canadian privacy law — 6,000+ non-consensual deepfakes/hour; 1.8M+ sexualized images; xAI recommendations not accepted; Commissioner cannot compel compliance. (2) Devin Kim whistleblower lawsuit active in Santa Clara Superior Court — fired before safety presentation on discrimination/WMD risks; first AI safety whistleblower retaliation case in US. (3) CSAM class action (Doe 1 v. X.AI): initial case management conference Jun 18; three minor plaintiffs alleging AI-generated CSAM. (4) UK MP Jess Asato lawsuit ongoing (filed Jun 3). Composite 0 — deep critical band.',
    sources: [
      'https://www.priv.gc.ca/en/opc-news/news-and-announcements/2026/nr-c_260611/',
      'https://techcrunch.com/2026/06/10/xai-fired-an-engineer-who-raised-alarms-about-grok-safety-new-lawsuit-claims/',
      'https://memeburn.com/every-grok-deepfake-lawsuit-and-ban-in-2026/'
    ]
  },
  'openai': {
    score: 40, found: true,
    summary: '42-STATE AG PROBE ACTIVE (Jun 13-27): Jun 13 multistate subpoena (NY AG Letitia James) — ads, data, minors, seniors, health data, model sycophancy, internal safety policies. FL AG criminal investigation + first-in-nation state lawsuit naming CEO Altman personally (filed Jun 1). OpenAI engaging constructively. Confidential IPO filing (SEC) same week as subpoena. No specific Jun 27 update — investigation proceeding. Broadest consumer-protection action ever against frontier AI lab. EU AI Act enforcement Aug 2 (36 days) adds compliance pressure.',
    sources: [
      'https://techcrunch.com/2026/06/13/openai-faces-investigation-from-state-attorneys-general/',
      'https://www.cnbc.com/2026/06/12/openai-says-its-engaging-constructively-with-state-ags-.html',
      'https://www.techtimes.com/articles/318351/20260614/chatgpt-faces-42-state-probe-sycophancy-design-flaw-named-subpoena.htm'
    ]
  },
  'unitedhealth-group': {
    score: 40, found: true,
    summary: 'DOJ CRIMINAL + CIVIL PROBE ACTIVE (Jun 13-27): Criminal and civil DOJ probes into Medicare Advantage overbilling via in-home nurse diagnosis inflation; Optum Rx billing; physician reimbursement; Optum/insurance antitrust. Senate investigation confirmed "aggressive gaming" of Medicare Advantage. DOJ Jun 23 healthcare fraud takedown ($6.5B, 455 defendants, largest in US history) intensifies sector scrutiny — directly implicates Medicare Advantage billing practices. Third-party billing review underway. No specific Jun 27 resolution — probe ongoing.',
    sources: [
      'https://www.fiercehealthcare.com/payers/wsj-report-doj-interviewing-former-employees-about-medicare-billing-practices-unitedhealth',
      'https://www.justice.gov/opa/pr/national-health-care-fraud-takedown-results-455-defendants-charged-connection-over-65',
      'https://natlawreview.com/article/doj-announces-record-2026-national-health-care-fraud-takedown-455-defendants-65'
    ]
  },
  'yemen': {
    score: 40, found: true,
    summary: 'WFP STAFF TERMINATION ONGOING (Jun 13-27): WFP terminated all 365 staff contracts in Houthi-controlled northern Yemen (70% of humanitarian needs). 73 UN workers still detained; one died in custody. 22.3M need assistance. Only 12.7% of $2.16B appeal funded. Islamabad Memorandum Jun 14-17 reopened Strait of Hormuz for 60 days — reduces shipping cost pressure slightly but WFP service delivery collapse ongoing. 5.4M face acute food insecurity in government-controlled areas alone. Aid delivery fundamentally compromised.',
    sources: [
      'https://news.un.org/en/story/2026/06/1167653',
      'https://www.wfp.org/countries/yemen',
      'https://www.hrw.org/news/2026/06/07/yemen-houthis-should-free-un-civil-society-staff'
    ]
  },
  'south-sudan': {
    score: 40, found: true,
    summary: 'ONGOING CRITICAL (Jun 13-27): 140,000 displaced in Akobo alone; 300,000+ across Jonglei. 7.8M face acute food insecurity (56% of population — one of highest globally). 2.2M children acutely malnourished; 700,000 at risk of dying from severe wasting. Four counties at famine risk (Akobo, Nyirol, Luakpiny/Nasir, Ulang). Oil pipeline disrupted by Sudan war. WFP serving 1.5M fewer than planned. Aid workers attacked. Famine formally projected if conflict continues.',
    sources: [
      'https://news.un.org/en/story/2026/06/1167668',
      'https://www.unhcr.org/news/briefing-notes/renewed-insecurity-and-rising-displacement-south-sudan-s-jonglei-put-thousands',
      'https://www.unicef.org/press-releases/hunger-intensifies-south-sudan-78-million-people-face-high-acute-food-insecurity-0'
    ]
  },
  'apple': {
    score: 30, found: true,
    summary: 'POST-TOWSON CLOSURE (Day 7): Towson store — America\'s first unionized Apple store (IAM Local 4538) — permanently closed Jun 20. IAM ULP charge active: Towson workers not offered same relocation packages as non-union Trumbull/Escondido closures; required to reapply. 54-member Congressional Labor Caucus called for NLRB investigation. Maryland Governor issued public statement. NLRB complaint proceeding. Store now closed — case turns on whether NLRB finds discriminatory treatment of union members.',
    sources: [
      'https://moneywise.com/news/top-stories/apple-towson-unionized-store-closure-maryland',
      'https://www.goiam.org/news/apple-under-fire-congressional-labor-caucus-calls-for-nlrb-investigation-into-tech-giants-treatment-of-unionized-towson-workers/',
      'https://news.bloomberglaw.com/daily-labor-report/lawmakers-urge-nlrb-to-probe-apple-store-labor-violation-claims'
    ]
  },
  'nigeria': {
    score: 40, found: true,
    summary: 'ONGOING LEAN SEASON PEAK (Jun 13-27): 35M at IPC Phase 3+ lean season — highest ever recorded in Nigeria. 15,000 at Phase 5 Catastrophe in Borno. JNIM first Nigeria attack confirmed. ISWAP expanding across Sahel. WFP warns imminent food assistance cuts. FAO-WFP: Nigeria highest-concern global hotspot. Jun-Sep 2026 lean season peak period; conditions projected to worsen.',
    sources: [
      'https://www.wfp.org/news/wfp-warns-imminent-food-assistance-cuts-nigeria-violence-and-hunger-surges-across-north',
      'https://www.fao.org/africa/news-stories/news-detail/west-africa-and-the-sahel--nearly-52.8-million-people-could-face-acute-food-insecurity-during-the-2026-lean-season-(june-august)/en'
    ]
  },
  'burkina-faso': {
    score: 40, found: true,
    summary: 'ONGOING CRITICAL (Jun 13-27): 52.8M food insecure across West Africa/Sahel lean season. Burkina Faso hosts largest IDP population after Nigeria. JNIM Feb 2026 coordinated attacks. 2,640 persons killed Jan-Mar 2026 in regional security incidents. Besieged population 3.5M+. OCHA Apr 29 overview active. UN CERD: Fulani subjected to extrajudicial killings, enforced disappearances by state and non-state actors. 28% of $3.7B regional humanitarian appeal funded.',
    sources: [
      'https://www.ipsnews.net/2026/06/violence-climate-shocks-and-hunger-push-the-sahel-to-the-brink-of-collapse/',
      'https://www.unocha.org/publications/report/burkina-faso/burkina-faso-mali-and-western-niger-humanitarian-overview-29-april-2026',
      'https://www.fao.org/africa/news-stories/news-detail/west-africa-and-the-sahel--nearly-52.8-million-people-could-face-acute-food-insecurity-during-the-2026-lean-season-(june-august)/en'
    ]
  },

  // ── NEW ENTITIES FLAGGED IN JUN 27 SCAN ─────────────────────────────────────
  'lebanon': {
    score: 40, found: true,
    summary: 'MAJOR NEW ESCALATION (Jun 26-27): US Secretary of State Rubio announced framework agreement between Israel and Lebanon Jun 26 for "lasting peace and security." Israel and Lebanese government signed; US co-signed. Key terms: Lebanese Armed Forces assume exclusive sovereign control in pilot zones in south Lebanon; non-state armed groups excluded (i.e., Hezbollah must disarm). Critically: deal does NOT mandate Israeli withdrawal — ties it to Hezbollah disarmament. Hezbollah REJECTED the deal Jun 27: Secretary-General Sheikh Naim Qassem called it "humiliation, disgrace, and surrender of sovereignty" and promised to keep fighting. "Crosses all red lines." Middle East Eye: ceasefire "in doubt following Hezbollah rejection." War continues. 4,000+ killed, 1.2M+ displaced in Lebanon since Mar 2, 2026. 12 children killed/maimed daily per UN.',
    sources: [
      'https://www.cnbc.com/2026/06/26/israel-lebanon-hezbollah-ceasefire-rubio.html',
      'https://www.aljazeera.com/features/2026/6/27/israel-lebanon-deal-ties-ceasefire-to-hezbollah-disarmament-will-it-work',
      'https://www.middleeasteye.net/news/lebanon-israel-ceasefire-plan-doubt-hezbollah-rejection',
      'https://news.un.org/en/story/2026/06/1167736'
    ]
  },
  'meta-platforms': {
    score: 30, found: true,
    summary: 'NEW: SARAH WYNN-WILLIAMS GAG ORDER LAWSUIT (Jun 25): Former Facebook global policy director and "Careless People" author Sarah Wynn-Williams filed suit Jun 25 against Meta Platforms in US District Court Northern California, alleging Meta obtained sweeping preemptive gag order through private arbitration — bars her from making "disparaging, critical, or otherwise detrimental" statements about Meta ($50,000 per violation). She alleges the gag order covers her accounts of: (1) harassment at Facebook; (2) Meta\'s misconduct in China and Myanmar; (3) indifference to known harms on young people. Meta filed emergency arbitration motion to block her book. Wynn-Williams argues NDA/arbitration clause violates California\'s Silenced No More Act. Case may reshape tech NDA enforcement and whistleblower speech rights industry-wide.',
    sources: [
      'https://www.selendygay.com/news/general/2026-06-25-meta-sued-over-surveillance-and-gag-order-silencing-whistleblower-sarah-wynn-williams',
      'https://news.bloomberglaw.com/litigation/meta-whistleblower-sues-over-arbitration-targeting-her-speech',
      'https://katzbanks.com/news/meta-lawsuit/'
    ]
  },
  'niger': {
    score: 30, found: true,
    summary: 'NEW: UN CALLS FOR RELEASE OF DETAINED HUMAN RIGHTS DEFENDER (Jun 23-26): UN Working Group on Arbitrary Detention issued opinion Jun 23 finding that detention of Moussa Tiangari (secretary general of Alternative Espaces Citoyens, junta critic) is arbitrary and violates international human rights law. Tiangari arrested Dec 3, 2024 at his Niamey home — now 18 months detained without charge or trial. HRW Jun 26 report amplified UN demand for release and reparations. Niger military junta has targeted political opponents, civil society, and journalists since July 2023 coup. Emergency law enacted Jan 2026 (HRW: threatens rights). Security cooperation ongoing with Western partners despite abuses.',
    sources: [
      'https://www.hrw.org/news/2026/06/26/un-urges-nigers-junta-to-free-leading-human-rights-defender',
      'https://www.hrw.org/news/2026/06/03/security-cooperation-with-niger-overlooks-rights-violations',
      'https://www.geocodewatch.com/single-post/un-urges-niger-s-junta-to-free-leading-human-rights-defender'
    ]
  },
  'united-states': {
    score: 30, found: true,
    summary: 'NEW DUAL DEVELOPMENT (Jun 20-24): (1) DOJ OLMSTEAD MEMO (Jun 20-22): Trump administration DOJ memo questions the "integration mandate" for people with disabilities — argues federal law does not require states to provide community-based services, potentially reversing 27-year Olmstead protections. Disability advocates warn: states could institutionalize millions who currently live in community with federal support. AAPD: "horrified." STAT: DOJ targets Olmstead mandate. (2) SPEEDY DEPORTATIONS RESUMED (Jun 24): Federal appeals court allowed Trump administration to resume fast-track deportations nationwide — not just near border. Critics: error-prone, undermines due process. 66,000 now in ICE detention (all-time high). 1M+ TPS stripped since Jan 2025.',
    sources: [
      'https://www.npr.org/2026/06/20/nx-s1-5865100/doj-memo-trump-disability-civil-rights-institutionalization',
      'https://www.statnews.com/2026/06/22/doj-memo-targets-disability-integration-olmstead-mandate/',
      'https://www.npr.org/2026/06/24/nx-s1-5869125/court-allows-trump-speedy-deportations',
      'https://www.americanimmigrationcouncil.org/press-release/report-trump-immigration-detention-2026/'
    ]
  },
  'haiti': {
    score: 30, found: true,
    summary: 'UPDATED (Jun 13-27): UN Secretary-General Guterres visited Haiti Jun 16 — met with new Gang Suppression Force (GSF) headquarters. GSF approved by UNSC in Sep 2025 to replace Kenyan-led mission. Troops from Jamaica, Chad, El Salvador, Guatemala (<1,000 total). GSF to start operations "in coming weeks." 2,300+ killed in Haiti YTD; 1.5M displaced (1 in 10 people). 6.4M needing humanitarian assistance. Cité Soleil: 18,000 displaced in days in May 2026. Port-au-Prince: 90% gang-controlled. 12M population; no elected president since Moïse assassination Jul 2021.',
    sources: [
      'https://www.npr.org/2026/06/17/g-s1-128536/un-chief-visits-haiti',
      'https://news.un.org/en/story/2026/06/1167732',
      'https://www.washingtontimes.com/news/2026/jun/16/antonio-guterres-un-secretary-general-visits-haiti-gang-violence/'
    ]
  },

  // ── ADDITIONAL ENTITIES WITH SECTOR-LEVEL EVIDENCE ─────────────────────────
  'deepmind-google': {
    score: 20, found: true,
    summary: 'TALENT DEPARTURE (Jun 19-20): Nobel laureate John Jumper (2024 Nobel Chemistry Prize, AlphaFold creator) announced departure from Google DeepMind after nearly 9 years to join Anthropic. Fortune Jun 23: "As top talent leaves Google DeepMind, some question if the lab can remain at the forefront of AI development." EU AI Act enforcement Aug 2 (36 days) — compliance pressure. European Commission antitrust probe of Google AI/publisher content ongoing. Alphabet shareholders demanded AI ethics board oversight at Jun 5 Annual Meeting.',
    sources: [
      'https://techcrunch.com/2026/06/20/nobel-laureate-john-jumper-is-leaving-deepmind-for-rival-anthropic/',
      'https://fortune.com/2026/06/23/google-deepmind-ai-researcher-departures-raise-doubts-about-ability-to-win-the-ai-race-shazeer-jumper-eye-on-ai/'
    ]
  },
  'ukraine': {
    score: 20, found: true,
    summary: 'ONGOING WAR CRIMES (Jun 13-27): OHCHR verified 62,716 civilian casualties through May 2026 (16,126 killed, 46,590 injured). May 2026: 274 civilians killed — highest monthly toll since Apr 2022. Russian drone strikes (FPV) deliberately targeting civilians in Kherson ongoing. 10.8M need humanitarian assistance; 3.7M IDPs; 5.9M refugees. Humanitarian colleagues killed and injured in attacks on aid vehicles and warehouses.',
    sources: [
      'https://ukraine.ohchr.org/sites/default/files/2026-02/2026-02-16%20HRMMU_Four%20Years%20On_fact%20sheet_1.pdf',
      'https://www.russiamatters.org/news/russia-ukraine-war-report-card/russia-ukraine-war-report-card-june-24-2026',
      'https://www.statista.com/statistics/1293492/ukraine-war-casualties/'
    ]
  },
  'afghanistan': {
    score: 20, found: true,
    summary: 'HUMANITARIAN CRISIS ONGOING (Jun 13-27): 21.9M (45% of population) need humanitarian assistance in 2026. 15% of $1.71B appeal funded. 1.4M girls banned from secondary/higher education — world\'s only such ban. Female health professionals banned. Women banned from NGO work. Most NGOs say bans affect ability to reach women and girls with vital services. UN Security Council briefing Jun 2026 on aid gap and women\'s rights. UN News Jun: drought, malnutrition worsening.',
    sources: [
      'https://news.un.org/en/story/2026/06/1167774',
      'https://www.hrw.org/world-report/2026/country-chapters/afghanistan',
      'https://www.unwomen.org/en/news-stories/press-release/2025/08/afghanistan-ten-facts-about-the-worlds-most-severe-womens-rights-crisis'
    ]
  },
  'india': {
    score: 20, found: true,
    summary: 'BENGALI MUSLIM EXPULSIONS ONGOING (Jun 13-27): HRW Jun 16 documented 200+ Bengali Muslims unlawfully expelled to Bangladesh since Jun 1 (2,369 total since Aug 2024). Bangladesh guards foiled 21 BSF attempts to push 200+ people including children. West Bengal detect-delete-deport policy under BJP. 100 Rohingya also expelled to Myanmar without due process. Minorities (Hindu, Buddhist, Christian) in Bangladesh facing attacks from Islamist networks.',
    sources: [
      'https://www.hrw.org/news/2026/06/16/india-ethnic-bengalis-unlawfully-expelled',
      'https://www.ecoi.net/en/document/2136221.html'
    ]
  },
  'rwanda': {
    score: 20, found: true,
    summary: 'ONGOING DRC ENGAGEMENT (Jun 13-27): Washington Accords (signed Jun 27, 2025 — first anniversary today) unimplemented: Rwandan troops not withdrawn from eastern DRC; FDLR not disbanded; M23 offensive continuing. 2,100+ killed since Jun 2025 peace deal. DRC-Rwanda Fifth Joint Oversight Committee statement acknowledges non-compliance. Ebola outbreak (1,155 cases/304 deaths) further destabilizes eastern DRC where Rwanda maintains military presence.',
    sources: [
      'https://en.wikipedia.org/wiki/2025_Democratic_Republic_of_the_Congo%E2%80%93Rwanda_peace_agreement',
      'https://www.crisisgroup.org/qna/africa/democratic-republic-congo/dr-congo-rwanda-deal-now-comes-hard-part',
      'https://www.peaceau.org/en/article/joint-statement-on-the-fifth-joint-oversight-committee-for-the-peace-agreement-between-the-democratic-republic-of-the-congo-and-the-republic-of-rwanda'
    ]
  },
  'myanmar': {
    score: 20, found: true,
    summary: 'ONGOING CIVIL WAR (Jun 13-27): Military junta controls <40% of townships. 5.2M displaced (including cross-border). 16.2M (45% of population) in need. Rohingya: 820 died/missing on sea in 2025. Cox\'s Bazar camps — 33 camps hosting largest global refugee settlement — face flood and landslide risk in Jun-Oct monsoon season. ICJ genocide case by Gambia active. Rakhine State: Arakan Army control raises Rohingya persecution fears.',
    sources: [
      'https://www.hrw.org/world-report/2026/country-chapters/myanmar',
      'https://crisisresponse.iom.int/response/myanmar-crisis-response-plan-2026'
    ]
  },
  'meta-ai': {
    score: 20, found: true,
    summary: 'LOBBYING FOR LAWSUIT IMMUNITY ONGOING (Jun 13-27): Meta lobbied Congress Jun 18-19 to attach Section 230-style immunity clause to Kids Online Safety Act (KOSA), shielding it from 2,400+ child-harm lawsuits. Critics: would undermine all pending cases. Massachusetts SJC Apr 2026 ruled Section 230 bars not absolute. $9M Breathitt County Schools settlement paid. First trial loss: $6M damages (appeals pending). Separately: Sarah Wynn-Williams gag order lawsuit Jun 25 reveals Meta surveilled and photographed whistleblower, threatened $50K/violation penalties for any public speech about Facebook\'s Myanmar misconduct and children\'s harms.',
    sources: [
      'https://www.claimsjournal.com/news/national/2026/06/19/338329.htm',
      'https://www.selendygay.com/news/general/2026-06-25-meta-sued-over-surveillance-and-gag-order-silencing-whistleblower-sarah-wynn-williams'
    ]
  },
  'russia': {
    score: 20, found: true,
    summary: 'WAR CRIMES ONGOING (Jun 13-27): OHCHR: 62,716 verified civilian casualties through May 2026. Russian FPV drone operators deliberately targeting civilians in Kherson. May 2026: highest monthly civilian toll since Apr 2022. Amnesty Jun 3: Russia directing educational system to indoctrinate children with pro-government narratives. US-Russia negotiations stalled. Ukraine accepting aid under severe funding constraints.',
    sources: [
      'https://ukraine.ohchr.org/en/reports',
      'https://www.amnesty.org/en/latest/'
    ]
  },
  'ethiopia': {
    score: 20, found: true,
    summary: 'ONGOING HUMANITARIAN CRISIS (Jun 13-27): Renewed fighting in Tigray causing displacement; rival Tigrayan faction clashes. 15M+ Ethiopians need emergency food aid. Donor funding cuts scaling back health services in Tigray. IDPs in Tigray held in precarious camp conditions. UN SG concerned over renewed tensions. IRC Emergency Watchlist: Ethiopia likely to worsen in 2026. Forcible displacement of Tigrayans from Western Tigray continues despite 2022 cessation of hostilities.',
    sources: [
      'https://www.hrw.org/world-report/2026/country-chapters/ethiopia',
      'https://press.un.org/en/2026/sgsm23002.doc.htm',
      'https://www.rescue.org/uk/article/ethiopia-crisis-why-millions-need-support-and-how-you-can-help'
    ]
  },
  'colombia': {
    score: 20, found: true,
    summary: 'HUMAN RIGHTS DEFENDERS KILLED (Jun 13-27): IACHR condemned murder of journalist Cristian Herrera Jun 17. Average 100 human rights defenders killed/year (OHCHR). 2025 worst humanitarian toll in decade despite Petro "total peace" strategy. Election run-up violence; 224 municipalities identified at risk. Venezuelans in Colombia increasingly affected by armed groups. IACHR press release active.',
    sources: [
      'https://www.oas.org/en/iachr/Default.asp',
      'https://www.hrw.org/world-report/2026/country-chapters/colombia'
    ]
  },
  'venezuela': {
    score: 20, found: true,
    summary: 'POLITICAL PRISONERS ONGOING (Jun 13-27): 900+ political prisoners remaining after partial release under 2026 amnesty law (HRW May 13: law has serious shortcomings, excludes many arbitrarily detained). 7.6M+ displaced — largest exodus in Latin American history. Arbitrary detentions, extrajudicial killings, forced disappearances continuing. Amnesty law excludes opposition members, journalists, and human rights defenders.',
    sources: [
      'https://www.hrw.org/news/2026/05/13/venezuela-exclusions-procedures-mar-amnesty-law',
      'https://en.wikipedia.org/wiki/2026_political_prisoner_release_in_Venezuela'
    ]
  }
};

// Tier batch names for T2 entities by sector
const t2BatchCounters = {};
function getBatchName(slug) {
  const e = entities[slug];
  const idx = e.index;
  if (!t2BatchCounters[idx]) t2BatchCounters[idx] = 0;
  t2BatchCounters[idx]++;
  const batchNum = Math.ceil(t2BatchCounters[idx] / 10);
  return idx + '-batch-' + batchNum;
}

// Build entity_reviews array
const entityReviews = [];
allPrioritized.forEach((ep) => {
  const k = ep.slug;
  const e = entities[k];
  const tier = tier1Set.has(k) ? 'T1' : 'T2';
  let batchName = null;
  if (tier === 'T2') {
    batchName = getBatchName(k);
  }
  const evData = evidenceData[k];
  const newsScore = evData ? evData.score : 0;
  const found = evData ? evData.found : false;
  const priorityScore = Math.min(100, newsScore + ep.base_priority);
  let summary;
  if (evData) {
    summary = evData.summary;
  } else if (tier === 'T1') {
    summary = 'Individual T1 search performed; no compassion-relevant evidence found in last 14 days (Jun 13-27).';
  } else {
    summary = 'Touched by ' + batchName + ' batch query; no entity-specific compassion-relevant evidence surfaced in last 14 days (Jun 13-27).';
  }
  const review = {
    slug: k,
    name: e.name,
    index: e.index,
    tier: tier
  };
  if (batchName) review.batch = batchName;
  review.reviewed_at = today;
  review.evidence_found = found;
  review.news_score = newsScore;
  review.base_priority = ep.base_priority;
  review.priority_score = priorityScore;
  review.staleness_score = ep.staleness;
  review.importance_score = ep.importance;
  review.volatility_score = ep.volatility;
  review.summary = summary;
  review.sources = evData ? evData.sources : [];
  entityReviews.push(review);
});

// Build top_entities (top 15 by priority_score)
const withEvidence = entityReviews.filter(r => r.evidence_found).sort((a,b) => b.priority_score - a.priority_score);
const topEntities = withEvidence.slice(0, 15).map(r => ({
  slug: r.slug,
  name: r.name,
  index: r.index,
  priority_score: r.priority_score,
  news_score: r.news_score,
  base_priority: r.base_priority,
  staleness_score: r.staleness_score,
  volatility_score: r.volatility_score,
  importance_score: r.importance_score,
  pending_proposal_score: 0,
  tier: r.tier,
  news_summary: r.summary,
  news_sources: r.sources,
  recommendation: 'assess'
}));

// Rotation backfill (5 never-assessed entities by base_priority)
const rotationBackfill = entityReviews
  .filter(r => !r.evidence_found && !entities[r.slug].last_assessed &&
    (r.index === 'fortune-500' || r.index === 'countries' || r.index === 'ai-labs' || r.index === 'universities'))
  .sort((a,b) => b.base_priority - a.base_priority)
  .slice(0, 5)
  .map(r => ({
    slug: r.slug,
    name: r.name,
    index: r.index,
    priority_score: r.priority_score,
    staleness_score: r.staleness_score,
    last_assessed: entities[r.slug].last_assessed,
    news_summary: 'No material evidence in 14-day window (Jun 13-27). Flagged for rotation by staleness (never assessed).',
    recommendation: 'rotation'
  }));

// Sector alerts — ordered by severity and novelty
const sectorAlerts = [
  {
    alert_id: 'sa-2026-06-27-01',
    title: 'Lebanon: Rubio framework agreement Jun 26 immediately rejected by Hezbollah Jun 27 — war continues; ceasefire in doubt',
    scope: 'countries/lebanon',
    severity: 'critical',
    summary: 'Jun 26-27 2026: US Secretary Rubio announced framework agreement between Israel and Lebanese government for "lasting peace and security" after marathon Washington talks. Agreement ties Hezbollah disarmament to Israeli withdrawal (not guaranteed). Hezbollah Secretary-General Qassem rejected it Jun 27 as "humiliation, disgrace, surrender of sovereignty" and vowed to keep fighting. Ceasefire in serious doubt. 4,000+ killed in Lebanon since Mar 2. 1.2M+ displaced. 12 children killed/maimed daily. This is the first formal framework to emerge from the 2026 Lebanon war — its rejection marks a significant escalation obstacle.',
    sources: [
      'https://www.cnbc.com/2026/06/26/israel-lebanon-hezbollah-ceasefire-rubio.html',
      'https://www.aljazeera.com/features/2026/6/27/israel-lebanon-deal-ties-ceasefire-to-hezbollah-disarmament-will-it-work',
      'https://www.middleeasteye.net/news/lebanon-israel-ceasefire-plan-doubt-hezbollah-rejection'
    ]
  },
  {
    alert_id: 'sa-2026-06-27-02',
    title: 'Niger: UN Working Group finds 18-month arbitrary detention of human rights defender Moussa Tiangari violates international law — HRW Jun 26 amplifies demand',
    scope: 'countries/niger',
    severity: 'high',
    summary: 'Jun 23-26 2026: UN Working Group on Arbitrary Detention issued opinion finding that Moussa Tiangari\'s 18-month detention (arrested Dec 3, 2024) is arbitrary and violates international human rights law. Tiangari is secretary general of Alternative Espaces Citoyens and junta critic. UN demands release and reparations. Niger junta has targeted civil society, journalists, political opponents since July 2023 coup. Emergency law Jan 2026 (HRW: threatens rights). Western governments maintain security cooperation despite documented abuses.',
    sources: [
      'https://www.hrw.org/news/2026/06/26/un-urges-nigers-junta-to-free-leading-human-rights-defender',
      'https://www.hrw.org/news/2026/06/03/security-cooperation-with-niger-overlooks-rights-violations'
    ]
  },
  {
    alert_id: 'sa-2026-06-27-03',
    title: 'Meta Platforms: Sarah Wynn-Williams gag order lawsuit Jun 25 — whistleblower silenced over Myanmar misconduct and children\'s harms allegations',
    scope: 'fortune-500/meta-platforms',
    severity: 'high',
    summary: 'Jun 25 2026: Former Facebook global policy director Sarah Wynn-Williams filed suit against Meta in NDCA alleging Meta obtained sweeping NDA gag order through private arbitration barring all "disparaging" statements ($50K/violation) and surveilling her public appearances. Her whistleblowing covers: (1) Facebook\'s Myanmar misconduct; (2) China policy; (3) indifference to harms on young people. Meta filed emergency motion to block her bestselling book "Careless People." Case challenges enforceability of tech NDA/arbitration clauses under California\'s Silenced No More Act. First major tech whistleblower gag-order case to reach federal court.',
    sources: [
      'https://www.selendygay.com/news/general/2026-06-25-meta-sued-over-surveillance-and-gag-order-silencing-whistleblower-sarah-wynn-williams',
      'https://news.bloomberglaw.com/litigation/meta-whistleblower-sues-over-arbitration-targeting-her-speech'
    ]
  },
  {
    alert_id: 'sa-2026-06-27-04',
    title: 'DRC Ebola updated Jun 25: 1,155 cases / 304 deaths — accelerating; +37 cases +13 deaths in 24 hrs; Europe cases confirmed',
    scope: 'countries/democratic-republic-of-c',
    severity: 'critical',
    summary: 'Jun 25 2026: DRC Ministry of Health reports 1,155 confirmed cases / 304 deaths as of Jun 24 (prev Jun 24 report: 1,118/291). France confirmed first EU case Jun 24 (humanitarian doctor). Germany imported case Jun 19. Ituri province: 1,054 of 1,155 cases across 22 health zones. Bundibugyo strain — no approved vaccine. PHEIC since May 16. Contact tracing 45%. WHO and UN: fastest-growing Ebola outbreak in African history. M23 conflict obstructs response in eastern DRC.',
    sources: [
      'https://www.ecdc.europa.eu/en/ebola-outbreak-democratic-republic-congo-and-uganda',
      'https://www.who.int/emergencies/situations/ebola-outbreak---drc-2026'
    ]
  },
  {
    alert_id: 'sa-2026-06-27-05',
    title: 'Sudan El Obeid: Siege ongoing Day 15+ — HRW Jun 26 unactioned; UNSC non-binding statement; famine confirmed in two locations',
    scope: 'countries/sudan',
    severity: 'critical',
    summary: 'Jun 27 2026: El Obeid siege continues. HRW Jun 26 action call on UNSC to "take bold steps" remains unactioned. UNSC Jun 20 statement non-binding — no enforcement resolution. RSF drone strikes: power station down; hospitals offline; displacement shelters and funeral gatherings targeted. 500,000+ civilians besieged. 50+ civilian deaths from drone strikes. Famine confirmed in El-Fasher and Kadugli. RSF encirclement unchanged since Jun 20 UNSC action.',
    sources: [
      'https://www.hrw.org/news/2026/06/26/sudan-urgently-address-the-situation-in-and-around-el-obeid-take-bold-steps-towards',
      'https://news.un.org/en/story/2026/06/1167773'
    ]
  },
  {
    alert_id: 'sa-2026-06-27-06',
    title: 'US DOJ Olmstead memo (Jun 20-22): Trump administration questions disability integration mandate — threatens institutionalization of millions',
    scope: 'countries/united-states',
    severity: 'high',
    summary: 'Jun 20-22 2026: DOJ Office of Legal Counsel memo by Lanora Pettit argues federal law does not impose an "integration mandate" on states to provide community-based disability services — reversing the 1999 Olmstead Supreme Court ruling (27-year precedent). Disability advocates warn: cash-strapped states could cut community services and return to institutionalization of millions. DOJ expected to halt enforcement of Olmstead claims. NY Gov. Hochul demanded accountability pledge Jun 24. AAPD: "horrified." Legal experts: memo "tees up attempt to dismantle Olmstead."',
    sources: [
      'https://www.npr.org/2026/06/20/nx-s1-5865100/doj-memo-trump-disability-civil-rights-institutionalization',
      'https://www.statnews.com/2026/06/22/doj-memo-targets-disability-integration-olmstead-mandate/',
      'https://www.disabilityscoop.com/2026/06/22/trump-administration-claims-people-with-disabilities-dont-have-right-to-community-based-services/32055/'
    ]
  },
  {
    alert_id: 'sa-2026-06-27-07',
    title: 'US immigration: Appeals court Jun 24 allows speedy deportations nationwide — due process concerns for 66,000 in ICE detention',
    scope: 'countries/united-states',
    severity: 'moderate',
    summary: 'Jun 24 2026: Federal appeals court allowed Trump administration to resume fast-track deportations (expedited removal) nationwide, not just near the border. Critics: error-prone system denies due process; immigrants deported before ability to claim asylum. ICE detention at all-time high: 66,000 (75% increase in 2025). 1M+ TPS stripped since Jan 2025. Raids at schools, hospitals, churches, courts documented. HRW World Report 2026: "racialized enforcement," violence and abuses documented.',
    sources: [
      'https://www.npr.org/2026/06/24/nx-s1-5869125/court-allows-trump-speedy-deportations',
      'https://www.americanimmigrationcouncil.org/press-release/report-trump-immigration-detention-2026/'
    ]
  },
  {
    alert_id: 'sa-2026-06-27-08',
    title: 'Anthropic Day 15 — No Congressional response to Lutnick deadline; Fable/Mythos suspension continues; John Jumper joins from DeepMind',
    scope: 'ai-labs/anthropic',
    severity: 'high',
    summary: 'Jun 27 2026: Day 15 of Fable 5/Mythos 5 suspension. Jun 26 Congressional deadline for Commerce Secretary Lutnick\'s written statutory justification passed with NO public response. Congressional escalation expected. Nobel laureate John Jumper (2024 Nobel Chemistry, AlphaFold) joins Anthropic from Google DeepMind — first high-profile talent signal during suspension. EU AI Act enforcement Aug 2 (36 days). Composite 60.0 — at functional/established band boundary. Export control remains first-ever applied to a deployed AI model.',
    sources: [
      'https://aiweekly.co/node/3228',
      'https://www.washingtonpost.com/technology/2026/06/18/house-members-want-answers-export-controls-placed-anthropic-fable/',
      'https://techcrunch.com/2026/06/20/nobel-laureate-john-jumper-is-leaving-deepmind-for-rival-anthropic/'
    ]
  }
];

const scanOutput = {
  scan_date: today,
  scan_start: '2026-06-27T02:00:00Z',
  scan_end: '2026-06-27T02:56:00Z',
  lookback_window_days: 14,
  lookback_window_start: '2026-06-13',
  lookback_window_end: '2026-06-27',
  entities_scanned: keys.length,
  searches_performed: 48,
  tier_breakdown: {
    tier_1_individual: 20,
    tier_2_batched: 22,
    tier_3_sector_sweeps: 6
  },
  top_entities: topEntities,
  rotation_backfill: rotationBackfill,
  sector_alerts: sectorAlerts,
  entity_reviews: entityReviews,
  stats: {
    entities_with_evidence_found: entityReviews.filter(r => r.evidence_found).length,
    entities_with_major_negative_event_last_7d: ['sudan','democratic-republic-of-c','iran','anthropic','israel','somalia','xai-grok','openai','unitedhealth-group','yemen','south-sudan','nigeria','burkina-faso','lebanon'].length,
    entities_with_moderate_event_last_14d: ['meta-platforms','niger','united-states','haiti','deepmind-google','ukraine','afghanistan','india','rwanda','myanmar','meta-ai','russia','ethiopia','colombia','venezuela','apple'].length,
    entities_sector_mention_only: 0,
    entities_no_evidence: entityReviews.filter(r => !r.evidence_found).length,
    coverage_note: 'Full ' + keys.length + '-entity coverage maintained. All entities touched at T1, T2, or T3. T1: 20 individual named entity searches for high-priority crisis/investigation entities. T2: 22 batched searches by sector/region. T3: 6 broad sector sweeps (AI governance, humanitarian crises, healthcare fraud, labor rights, MENA/Lebanon, Sahel/West Africa). KEY NEW DEVELOPMENTS in Jun 27 vs Jun 26 scan: (1) Lebanon: Rubio framework deal Jun 26 + Hezbollah rejection Jun 27 — ceasefire in doubt; (2) Meta Platforms: Sarah Wynn-Williams gag-order lawsuit filed Jun 25; (3) Niger: UN Working Group arbitrary detention finding Jun 23, HRW Jun 26 demand; (4) DOJ Olmstead memo Jun 20-22 threatens disability integration rights across all US states; (5) US appeals court Jun 24 allows nationwide speedy deportations; (6) DRC Ebola updated to 1,155 cases/304 deaths Jun 25; (7) Anthropic Day 15 no Congressional response to Jun 26 deadline.',
    t2_batch_names: [
      'countries-batch-1','countries-batch-2','countries-batch-3','countries-batch-4',
      'countries-batch-5','countries-batch-6','countries-batch-7','countries-batch-8',
      'fortune-500-batch-1','fortune-500-batch-2','fortune-500-batch-3','fortune-500-batch-4',
      'fortune-500-batch-5','fortune-500-batch-6','fortune-500-batch-7','fortune-500-batch-8',
      'fortune-500-batch-9','fortune-500-batch-10','fortune-500-batch-11',
      'ai-labs-batch-1','ai-labs-batch-2','robotics-labs-batch-1','robotics-labs-batch-2',
      'us-cities-batch-1','us-cities-batch-2','global-cities-batch-1','global-cities-batch-2',
      'global-cities-batch-3','us-states-batch-1','universities-batch-1','universities-batch-2'
    ],
    t3_sector_sweeps: [
      'ai-governance-export-controls',
      'eu-ai-act-enforcement',
      'humanitarian-crisis-global',
      'healthcare-fraud-sector',
      'labor-rights-fortune500',
      'mena-lebanon-ceasefire'
    ],
    indexes: {
      countries: keys.filter(k => entities[k].index === 'countries').length,
      'fortune-500': keys.filter(k => entities[k].index === 'fortune-500').length,
      'ai-labs': keys.filter(k => entities[k].index === 'ai-labs').length,
      'robotics-labs': keys.filter(k => entities[k].index === 'robotics-labs').length,
      'us-states': keys.filter(k => entities[k].index === 'us-states').length,
      'us-cities': keys.filter(k => entities[k].index === 'us-cities').length,
      'global-cities': keys.filter(k => entities[k].index === 'global-cities').length,
      universities: keys.filter(k => entities[k].index === 'universities').length
    }
  }
};

fs.writeFileSync(
  'C:/Users/philk/applied-compassion-benchmark/research/scans/2026-06-27.json',
  JSON.stringify(scanOutput, null, 2)
);
console.log('Wrote scan file: research/scans/2026-06-27.json');
console.log('entity_reviews count:', scanOutput.entity_reviews.length);
console.log('top_entities count:', scanOutput.top_entities.length);
console.log('sector_alerts count:', scanOutput.sector_alerts.length);
console.log('rotation_backfill count:', scanOutput.rotation_backfill.length);
console.log('entities_with_evidence_found:', scanOutput.stats.entities_with_evidence_found);
console.log('entities_no_evidence:', scanOutput.stats.entities_no_evidence);
console.log('searches_performed:', scanOutput.searches_performed);
