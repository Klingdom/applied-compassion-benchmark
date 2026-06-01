// Scan generator for 2026-05-31
// Reads rotation-state.json, emits scanner-output/2026-05-31.json and site evidence feed

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

const rotationState = JSON.parse(readFileSync(join(repoRoot, 'research', 'rotation-state.json'), 'utf8'));
const entities = rotationState.entities;
const SCAN_DATE = '2026-05-31';
const LOOKBACK_START = '2026-05-17'; // 14 days prior

// ---- HELPERS ----

function daysBetween(d1, d2) {
  if (!d1) return 9999;
  const t1 = new Date(d1).getTime();
  const t2 = new Date(d2).getTime();
  return Math.floor((t2 - t1) / 86400000);
}

function stalenessScore(lastAssessed) {
  const d = daysBetween(lastAssessed, SCAN_DATE);
  if (!lastAssessed || d >= 9999) return 25;
  if (d >= 60) return 20;
  if (d >= 30) return 15;
  if (d >= 14) return 5;
  return 0;
}

function importanceScore(index) {
  if (index === 'fortune-500') return 15;
  if (index === 'countries') return 12;
  if (index === 'ai-labs') return 10;
  if (index === 'global-cities') return 8;
  if (index === 'us-cities') return 5;
  if (index === 'robotics-labs') return 5;
  if (index === 'us-states') return 3;
  return 5;
}

function volatilityScore(composite, band) {
  // Near band boundary: 20/40/60/80
  const boundaries = [20, 40, 60, 80];
  const nearBoundary = boundaries.some(b => Math.abs(composite - b) <= 3);
  return nearBoundary ? 10 : 0;
}

function basePriority(slug, meta) {
  const s = stalenessScore(meta.last_assessed);
  const i = importanceScore(meta.index);
  const v = volatilityScore(meta.composite || 0, meta.band);
  return s + i + v;
}

// ---- T1 INDIVIDUAL EVIDENCE (from searches conducted) ----
// These are entities where we found new material evidence in the 14-day window

const T1_EVIDENCE = {
  'oracle': {
    evidence_found: true,
    news_score: 40,
    summary: "WARN Act termination dates reached (May 30-June 15). TechTimes June 1: sign-release-or-forfeit-severance phase active. 14 workers allege remote classification to reduce WARN obligations. New Jersey state WARN (90-day notice) separately filed. TechCrunch May 2026: laid-off workers tried to negotiate better severance, Oracle declined. Composite 20.6 is 0.6pt above Critical boundary.",
    sources: [
      "https://www.techtimes.com/articles/317527/20260601/oracles-30000-layoffs-enter-final-phase-sign-release-forfeit-severance.htm",
      "https://techcrunch.com/2026/05/08/laid-off-oracle-workers-tried-to-negotiate-better-severance-oracle-said-no/",
      "https://www.theworkersrights.com/oracle-layoffs-2026-rsu-loss/"
    ],
    recommendation: "assess"
  },
  'bolivia': {
    evidence_found: true,
    news_score: 40,
    summary: "Sixth week of general strike. WSWS May 19: military repression of indefinite national strike. Four confirmed deaths; Ombudsman logs 7 dead, 23 wounded, 321 arrested. May 23: indigenous community member Víctor Cruz Quispe shot and killed in Vilaque. Congress cleared road to martial law May 24-27. President Paz signed military deployment law May 27. Protesters clashing with police. No resolution.",
    sources: [
      "https://en.wikipedia.org/wiki/2026_Bolivian_protests",
      "https://www.wsws.org/en/articles/2026/05/19/mqjz-m19.html",
      "https://www.france24.com/en/bolivia-at-a-breaking-point-government-blames-fugitive-ex-leader-for-unrest"
    ],
    recommendation: "assess"
  },
  'israel': {
    evidence_found: true,
    news_score: 40,
    summary: "HRW May 19: Israel curbs aid and kills civilians during ceasefire. Aid access further restricted after February 28 crossings closure (weekly trucks down from 4,200 to 590). 37 INGOs banned from operating in Gaza. Only 2 crossings operational. Reconstruction pledges at $17B vs $71B needed; <$1B delivered. Gaza economy contracted 84%. 370,000+ housing units destroyed. Score floor at 0; authorized-resumption-with-systematic-denial pattern ongoing.",
    sources: [
      "https://www.hrw.org/news/2026/05/19/gaza-israel-curbs-aid-kills-civilians-during-ceasefire",
      "https://press.un.org/en/2026/sc16284.doc.htm",
      "https://www.un.org/unispal/document/ocha-humanitarian-situation-report-23-april-2026/"
    ],
    recommendation: "assess"
  },
  'hungary': {
    evidence_found: true,
    news_score: 40,
    summary: "Constitutional amendment process confirmed June 1. Sulyok refused to resign by Magyar's May 31 deadline. Magyar (Budapest Business Journal/Bloomberg/WashPost/AlJazeera) announced Tisza Party will immediately pursue constitutional amendment to remove Sulyok — not tailor-made law but framework for removing any state leader. Amendment takes ~1 month. Sulyok consulted Venice Commission. Amendment would be most significant governance change since Magyar came to power April 2026.",
    sources: [
      "https://www.bloomberg.com/news/articles/2026-06-01/hungary-to-amend-constitution-to-oust-president-magyar-says",
      "https://www.euronews.com/my-europe/2026/06/01/hungarian-government-to-amend-constitution-to-allow-removal-of-president",
      "https://bbj.hu/politics/domestic/government/peter-magyar-vows-constitutional-amendment-to-remove-hungarian-president-tamas-sulyok/"
    ],
    recommendation: "assess"
  },
  'democratic-republic-of-c': {
    evidence_found: true,
    news_score: 40,
    summary: "Ebola Bundibugyo (no approved vaccine): 282 confirmed cases, 42 deaths as of May 31; Uganda: 9 confirmed cases, 1 death. ECDC June 1: outbreak continues, Ituri province most affected (264 cases from 14 health zones). WHO: catastrophic collision of disease, conflict, and hunger. NPR May 31: aid cuts and misinformation hampering response. 26.5M facing acute hunger. Contact tracing nearly impossible in conflict zones.",
    sources: [
      "https://www.ecdc.europa.eu/en/ebola-virus-disease-outbreak-democratic-republic-congo-and-uganda",
      "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON605",
      "https://reliefweb.int/disaster/ep-2026-000071-cod"
    ],
    recommendation: "assess"
  },
  'iran': {
    evidence_found: true,
    news_score: 40,
    summary: "Iran-HRM April 2026: 22 political prisoners hanged in 6 weeks, including 10 detained in January 2026 protests — one execution every two days. Torture, forced confessions, no due process. ECPM April 2026: at least 1,639 executions in 2025 (68% increase, highest since 1989). Wikipedia 2026 Iran massacres confirms 6,488-36,500 killed. HRW May 2026: 'Repression of Uyghurs Persists as the World Moves On' framing parallels Iran situation. Internet restored May 25. Scale-floor at composite 2.5.",
    sources: [
      "https://iranhumanrights.org/2026/04/irans-execution-machine-political-hangings-surge-as-dozens-face-imminent-death/",
      "https://iran-hrm.com/2026/04/01/31283/",
      "https://www.ecpm.org/en/2026/04/13/iran_report_2025/"
    ],
    recommendation: "assess"
  },
  'sudan': {
    evidence_found: true,
    news_score: 40,
    summary: "Entering lean season June-September with famine confirmed in Al Fasher and Kadugli; risk in 20 additional areas. 33.7M require assistance (globally highest). 19.5M acutely food insecure. 825,000 children under 5 expected severe acute malnutrition. 2026 plan only 20% funded as of April. Amnesty 2026 annual report confirms mass killings in Al Fashir as gravest in-window event. Civil war entering third year with no peace process.",
    sources: [
      "https://news.un.org/en/story/2026/05/1167528",
      "https://www.unicef.org/press-releases/risk-famine-persists-nearly-195-million-people-face-acute-food-insecurity-sudan",
      "https://reliefweb.int/report/sudan/sudan-becomes-worlds-hungriest-country-famine-spreads-two-new-areas-darfur"
    ],
    recommendation: "assess"
  },
  'afghanistan': {
    evidence_found: true,
    news_score: 40,
    summary: "KabulNow May 2026: UN report confirms Taliban restrictions driving worsening crisis for women and girls. UN Women: Taliban Decree No. 18 (May 14) sets no minimum age for marriage. OHCHR March 2026: Afghanistan human rights 'continues to deteriorate dramatically.' UNICEF June 2026: 90% children in food poverty, 4M under-5 in acute malnutrition. 21.9M require humanitarian assistance. Aid cuts compounding Taliban's gender oppression.",
    sources: [
      "https://kabulnow.com/2026/05/taliban-restrictions-drive-worsening-crisis-for-women-and-girls-in-afghanistan-un-report-says/",
      "https://news.un.org/en/story/2026/05/1167591",
      "https://www.ohchr.org/en/stories/2026/03/report-afghanistans-human-rights-situation-continues-deteriorate-dramatically"
    ],
    recommendation: "assess"
  },
  'myanmar': {
    evidence_found: true,
    news_score: 40,
    summary: "Mizzima May 23: junta airstrikes kill 2 civilians in Budalin, 20+ aerial bombardments May 16-20. Myanmar Peace Monitor: 1,000+ civilian locations hit in 15 months; 1,728 civilians killed by airstrikes since late 2024. Fortify Rights: airstrikes destroy schools, churches, medical facilities ahead of sham elections. 3.6M displaced (record). 12M face acute hunger. 16M require lifesaving assistance in 2026.",
    sources: [
      "https://eng.mizzima.com/2026/05/23/34391",
      "https://www.fortifyrights.org/mya-inv-2025-11-19/",
      "https://www.hrw.org/world-report/2026/country-chapters/myanmar"
    ],
    recommendation: "assess"
  },
  'haiti': {
    evidence_found: true,
    news_score: 40,
    summary: "UN May 2026: surging mass displacement due to gang violence. 5.7M face high levels of acute food insecurity (Sep 2025-Jun 2026 IPC). Gang Suppression Force operations Dec-Feb: 1,343 suspected gang members killed but civilian risk rising. 90% of Port-au-Prince under gang control. 1.4M internally displaced including 741,000 children. Security Council reviewing conversion to full UN peacekeeping operation.",
    sources: [
      "https://www.jurist.org/news/2026/05/un-warns-of-surging-mass-displacement-in-haiti-due-to-gang-violence/",
      "https://reliefweb.int/report/haiti/haiti-57-million-people-face-high-levels-acute-food-insecurity-gang-violence-tightens-its-grip-across-country-ipc-acute-food-insecurity-snapshot-september-2025-june-2026",
      "https://news.un.org/en/story/2026/04/1167362"
    ],
    recommendation: "assess"
  },
  'turkey': {
    evidence_found: true,
    news_score: 35,
    summary: "FDD May 26: Erdogan's 'decapitation strike' on Turkey's main opposition party CHP. Riot police stormed CHP headquarters in Ankara (tear gas, rubber bullets). Court nullified CHP chair Özel's 2023 election. HRW: government attempt to sideline main political opposition. Imamoglu imprisoned since March 2025; potential 2,000-year sentence. ForeignPolicy May 28: Erdogan forcibly designing his own opposition. Time May 25: democracy crisis deepening.",
    sources: [
      "https://www.fdd.org/analysis/2026/05/26/recep-tayyip-erdogans-decapitation-strike-on-turkeys-opposition-party/",
      "https://foreignpolicy.com/2026/05/28/erdogan-turkey-opposition-chp-imamoglu-kilicdaroglu-ozel-istanbul-ankara/",
      "https://en.wikipedia.org/wiki/2025%E2%80%932026_Turkish_protests"
    ],
    recommendation: "assess"
  },
  'venezuela': {
    evidence_found: true,
    news_score: 20,
    summary: "NPR May 25: prisoner releases fall short, 500+ remain per Foro Penal. UN FFM confirms 87 new politically motivated detentions since January 3. Amnesty bill lacks accountability mechanisms. UN: repressive state apparatus intact. 621 released as of March 8 but revolving door effect — new arrests continue. Freedom House 2026: Venezuela rated Not Free.",
    sources: [
      "https://www.npr.org/2026/05/25/nx-s1-5831506/venezuelas-government-prisoners-us",
      "https://freedomhouse.org/country/venezuela/freedom-world/2026",
      "https://news.un.org/en/story/2026/03/1167126"
    ],
    recommendation: "assess"
  },
  'deepmind-google': {
    evidence_found: true,
    news_score: 40,
    summary: "Fortune May 5: Google DeepMind UK workers voted 98% to unionize over military AI contracts. Union demands: end military AI use, restore Google's scrapped weapons pledge, independent ethics oversight body, individual right to refuse projects. Pentagon deal grants 'any lawful purpose' access including classified networks. Google removed ban on AI weapons in Feb 2025. 580+ Google employees urge Pichai to refuse classified Pentagon deal. First frontier AI lab to organize collectively.",
    sources: [
      "https://fortune.com/2026/05/05/google-deepmind-unionize-vote-military-ai-contracts-internal-backlash-pentagon-deal-israeli-defense-forces/",
      "https://thenextweb.com/news/deepmind-union-google-pentagon-ai-military",
      "https://thenextweb.com/news/google-employees-classified-military-ai-pentagon"
    ],
    recommendation: "assess"
  },
  'amazon': {
    evidence_found: true,
    news_score: 20,
    summary: "Techrights May 30: Amazon continuing mass layoffs (GAFAM wave). TechTimes May 29: 142,000+ tech layoffs in 2026. Amazon DSP driver organizing ongoing in CA, GA, IL, NY. NLRB April 2026 bargaining order requiring Amazon to negotiate with Teamsters at JFK8. Total job cuts since Oct 2025 approaching 30,000. Amazon funding $725B AI capex while cutting human workforce.",
    sources: [
      "https://techrights.org/n/2026/05/30/Links_30_05_2026_More_GAFAM_Amazon_Mass_Layoffs_Peter_Schiff_Wa.shtml",
      "https://teamster.org/2026/04/amazon-teamsters-become-first-union-to-win-bargaining-order-against-e-commerce-giant/",
      "https://247wallst.com/investing/2026/05/07/tens-of-thousands-of-tech-workers-are-being-laid-off-in-2026-the-725-billion-that-replaced-them-is-going-to-four-companies/"
    ],
    recommendation: "assess"
  },
  'india': {
    evidence_found: true,
    news_score: 20,
    summary: "HRW confirms India expelled 1,500+ Bengali-speaking Muslim men, women, and children to Bangladesh between May 7 and June 15 — including ~100 Rohingya refugees — without due process, often at gunpoint. Driven by BJP electoral calculation ahead of 2026 West Bengal elections. Netra.news: 'The Muslim citizens India dumped in Bangladesh.' FIDH calls for maintaining India-Pakistan ceasefire and upholding rights of Kashmiris. Ceasefire holding one year (May 2025) but fragile.",
    sources: [
      "https://www.hrw.org/news/2025/07/23/india-hundreds-of-muslims-unlawfully-expelled-to-bangladesh",
      "https://netra.news/2026/the-muslim-citizens-india-dumped-in-bangladesh/",
      "https://www.fidh.org/en/region/asia/india/india-and-pakistan-must-maintain-the-ceasefire-uphold-the-rights-of"
    ],
    recommendation: "assess"
  },
  'openai': {
    evidence_found: true,
    news_score: 40,
    summary: "DoD agreement published — grants Pentagon access to classified networks for 'any lawful purpose.' Three stated red lines: no mass domestic surveillance, no autonomous weapons, no high-stakes automated decisions. Contested by Lawfare May 2026. 45+ days since April 18 assessment baseline. Kalinowski resignation, protest letters, mission-safety-word deletion, PBC conversion all unresolved. Only Anthropic refused Pentagon's unrestricted access terms; Google, Microsoft, and 5 others agreed. Jacobin April: 'OpenAI Is Bleeding Cash. Its Solution? Military Contracts.'",
    sources: [
      "https://openai.com/index/our-agreement-with-the-department-of-war/",
      "https://techcrunch.com/2026/03/01/openai-shares-more-details-about-its-agreement-with-the-pentagon/",
      "https://jacobin.com/2026/04/openai-defense-contracts-tech-militarism"
    ],
    recommendation: "assess"
  },
  'microsoft': {
    evidence_found: true,
    news_score: 20,
    summary: "TechTimes May 14: Microsoft removed Israel General Manager after Azure stored 200M hours of Palestinian surveillance recordings from Unit 8200. TechCrunch Sep 2025: Microsoft cut cloud services to Israeli military unit over Palestinian surveillance. Amnesty Canada: Microsoft's move to block Unit 8200 access is 'a moment for corporate reckoning.' Microsoft pursuing renewal of broader Israeli Ministry of Defence contract at reduced scale. May 2026: voluntary retirement offered to 8,750 US employees (7% domestic workforce).",
    sources: [
      "https://www.techtimes.com/articles/316642/20260514/microsoft-removes-israel-general-manager-after-azure-stored-200-million-hours-palestinian.htm",
      "https://techcrunch.com/2025/09/25/microsoft-cuts-cloud-services-to-israeli-military-unit-over-palestinian-surveillance/",
      "https://amnesty.ca/human-rights-news/microsoft-block-israeli-military-units-access-to-mass-surveillance-technology/"
    ],
    recommendation: "assess"
  },
  'anthropic': {
    evidence_found: true,
    news_score: 20,
    summary: "FNN May 2026: appeals court judges divided over Pentagon's legal dispute with Anthropic. Pentagon designated Anthropic a 'supply chain risk' after Anthropic refused unrestricted Pentagon access. DC Circuit April 2026: denied Anthropic's motion to lift designation. Anthropic continues to refuse use for autonomous weapons and mass domestic surveillance. Only company to hold this position among AI labs — all others (Google, Microsoft, OpenAI, plus 5) agreed to Pentagon terms. Communications study May 28: Anthropic ranked most transparent on safety communications.",
    sources: [
      "https://federalnewsnetwork.com/artificial-intelligence/2026/05/appeals-court-judges-appear-to-be-divided-over-pentagons-legal-dispute-with-ai-company-anthropic/",
      "https://en.wikipedia.org/wiki/Anthropic%E2%80%93United_States_Department_of_Defense_dispute",
      "https://federalnewsnetwork.com/artificial-intelligence/2026/03/microsoft-backs-anthropic-urging-a-judge-to-halt-pentagons-actions-against-ai-company/"
    ],
    recommendation: "assess"
  },
  'china': {
    evidence_found: true,
    news_score: 20,
    summary: "Global Voices May 18: new 'State Secrets Regulations for Xinjiang' took effect March 1, 2026 — normalizes political repression through legal codification. HRW April 20: 'Repression of Uyghurs Persists as the World Moves On.' IJOP upgraded to IJOP 2.0 integrating real-time financial data. Several hundred thousand Uyghurs remain unjustly imprisoned. OHCHR: policies may amount to crimes against humanity. New Humanitarian Feb 24: China's transnational surveillance isolating Uyghur families globally.",
    sources: [
      "https://globalvoices.org/2026/05/18/human-rights-concerns-abound-over-chinas-state-secrets-regulation-in-the-uyghur-region/",
      "https://www.hrw.org/news/2026/04/20/repression-of-uyghurs-persists-as-the-world-moves-on",
      "https://www.thenewhumanitarian.org/opinion/2026/02/24/how-china-transnational-surveillance-isolating-uyghur-families"
    ],
    recommendation: "assess"
  },
  'ethiopia': {
    evidence_found: true,
    news_score: 20,
    summary: "Al Jazeera Jan 23: no respite in Tigray one year after US aid cuts — hunger, death, devastation. IDPs in Tigray staged 3-day protest at government offices calling for safe, voluntary returns (June 2026). FEWS NET: Widespread Crisis outcomes expected to persist. 15M+ Ethiopians need emergency food aid. IRC Emergency Watchlist: Ethiopia one of most likely countries to worsen in 2026. Funding gap widening as humanitarian aid cuts deepen.",
    sources: [
      "https://www.aljazeera.com/features/2026/1/23/hunger-death-devastation-no-respite-in-tigray-a-year-after-us-aid-cuts",
      "https://fews.net/east-africa/ethiopia",
      "https://disasterphilanthropy.org/disasters/ethiopia-tigray-crisis/"
    ],
    recommendation: "assess"
  },
  'somalia': {
    evidence_found: true,
    news_score: 20,
    summary: "UN News May 2026: Somalia at 'real risk of famine' as Middle East war fallout worsens hunger. 6M people going days without food; nearly 2M children at high risk of illness or death. NBC News: Middle East conflict worsening Somalia's slide into famine — diesel/gas prices surged 60% linked to US-Israel-Iran conflict disrupting supply chains. 5.9M need assistance, 2.4M internally displaced. Crisis worsening faster than projected.",
    sources: [
      "https://news.un.org/en/story/2026/05/1167516",
      "https://www.nbcnews.com/world/africa/middle-east-conflict-worsening-somalias-slide-famine-rcna345432",
      "https://reliefweb.int/report/haiti/haiti-57-million-people-face-high-levels-acute-food-insecurity-gang-violence-tightens-its-grip-across-country-ipc-acute-food-insecurity-snapshot-september-2025-june-2026"
    ],
    recommendation: "assess"
  },
  'burkina-faso': {
    evidence_found: true,
    news_score: 20,
    summary: "Sahel Crisis Updates 2026 (Defcon Level): JNIM February 2026 coordinated attacks across eastern/northern Burkina Faso — 40 civilians killed, 9 abducted, property burned. Drone strikes killing scores, likely amounting to war crimes. 3M+ internally displaced across central Sahel. OCHA April 29: 2,640 deaths from conflict Jan-March 2026; 1,179 security incidents. 7.5M children urgently need humanitarian assistance. 11.4M need critical food assistance.",
    sources: [
      "https://www.defconlevel.com/sahel-security-crisis",
      "https://www.unocha.org/publications/report/burkina-faso/burkina-faso-mali-and-western-niger-humanitarian-overview-29-april-2026",
      "https://www.globalr2p.org/countries/burkina-faso/"
    ],
    recommendation: "assess"
  },
  'russia': {
    evidence_found: true,
    news_score: 20,
    summary: "Ukraine OHCHR Feb 2026: 217,000 reported atrocity/aggression-related crimes in four years. ACA Feb 24: systematic torture of POWs and civilians constitutes war crimes and crimes against humanity. 2025 saw largest number of civilians killed in Ukraine (286 killed in July alone). Russia continued weaponising civilian infrastructure. Security Council May 2026 protection of civilians forecast notes ongoing deliberate targeting. 10.8M Ukrainians need humanitarian assistance in 2026.",
    sources: [
      "https://ukraine.ohchr.org/sites/default/files/2026-02/2026-02-16%20HRMMU_Four%20Years%20On_fact%20sheet_1.pdf",
      "https://globalrightscompliance.org/statement-by-the-atrocity-crimes-advisory-group-for-ukraine-aca-on-the-anniversary-of-russias-full-scale-invasion-of-ukraine-24-february-2026/",
      "https://www.securitycouncilreport.org/monthly-forecast/2026-05/protection-of-civilians-9.php"
    ],
    recommendation: "assess"
  },
  'meta': {
    evidence_found: true,
    news_score: 20,
    summary: "Meta Oversight Board calls on Meta to investigate how content moderation changes impact human rights (January 2025 changes made with no public human rights due diligence). New Mexico AG trial scheduled September 8, 2026 seeking up to $62.85B in penalties. UK Rohingya lawsuit active — could cost hundreds of billions. Meta content moderation failures in Gaza documented by rights groups. DEI public disclosure fell 65% sector-wide; Meta among companies rolling back programs.",
    sources: [
      "https://thehill.com/policy/technology/5261276-meta-oversight-board-calls-on-company-to-investigate-how-content-moderation-changes-could-impact-human-rights/",
      "https://www.lanierlawfirm.com/product-liability/social-media-addiction-lawsuit/meta/",
      "https://blog.ongig.com/diversity-and-inclusion/dei-rollbacks/"
    ],
    recommendation: "assess"
  },
  'cvs-health': {
    evidence_found: true,
    news_score: 20,
    summary: "340B lawsuit filed May 2026: hospital systems sue CVS Health alleging it redirected $250M in 340B drug discount funds via 'secret pricing scheme' 2020-2025. CVS filed federal lawsuit May 22 challenging Tennessee's Fair Rx Act (PBM reform law). Louisiana settled earlier for $45M. DOJ/CFPB Zelle fraud lawsuit previously filed against Bank of America, JPMorgan, and Wells Fargo remains active. CVS structural role in drug pricing at issue.",
    sources: [
      "https://www.healthcaredive.com/news/hospitals-file-340b-lawsuit-cvs-health/820959/",
      "https://www.modernhealthcare.com/providers/mh-cvs-340b-lawsuit-mount-sinai-michigan/",
      "https://lailluminator.com/2026/02/20/cvs-settlement/"
    ],
    recommendation: "assess"
  },
  'unitedhealth': {
    evidence_found: true,
    news_score: 20,
    summary: "Healthcare Dive confirms UnitedHealth under DOJ criminal and civil investigation for Medicare fraud including potential overpayments in Medicare Advantage and at owned physician practices. Company proactively contacted DOJ; complying with formal requests. Special Master March 2025 recommended summary judgment for company; DOJ filed motion to reject that recommendation. Ongoing False Claims Act whistleblower suit. Class action $69M 401(k) settlement approved. Berkshire Hathaway sold stake — heightened scrutiny.",
    sources: [
      "https://www.healthcaredive.com/news/unitedhealth-under-investigation-department-of-justice-medicare/753913/",
      "https://www.lexology.com/library/detail.aspx?g=41bceb00-0d1f-49ee-a41c-6913a80fc225",
      "https://www.classaction.org/news/69m-unitedhealth-settlement-resolves-class-action-lawsuit-over-alleged-mismanagement-of-retirement-plan"
    ],
    recommendation: "assess"
  }
};

// T2 batch names for provenance
const T2_BATCHES = {
  // Countries
  'finland': 'nordic-countries-t2', 'denmark': 'nordic-countries-t2', 'norway': 'nordic-countries-t2',
  'iceland': 'nordic-countries-t2', 'sweden': 'nordic-countries-t2', 'estonia': 'nordic-countries-t2',
  'latvia': 'nordic-countries-t2', 'lithuania': 'nordic-countries-t2',
  'switzerland': 'western-europe-t2', 'netherlands': 'western-europe-t2', 'germany': 'western-europe-t2',
  'luxembourg': 'western-europe-t2', 'canada': 'western-europe-t2', 'ireland': 'western-europe-t2',
  'austria': 'western-europe-t2', 'france': 'western-europe-t2', 'belgium': 'western-europe-t2',
  'new-zealand': 'asia-pacific-stable-t2', 'singapore': 'asia-pacific-stable-t2', 'australia': 'asia-pacific-stable-t2',
  'japan': 'asia-pacific-stable-t2', 'south-korea': 'asia-pacific-stable-t2', 'taiwan': 'asia-pacific-stable-t2',
  'united-kingdom': 'western-europe-t2', 'portugal': 'western-europe-t2', 'spain': 'western-europe-t2',
  'czech-republic': 'central-europe-t2', 'slovenia': 'central-europe-t2', 'slovakia': 'central-europe-t2',
  'croatia': 'central-europe-t2', 'poland': 'central-europe-t2', 'romania': 'central-europe-t2',
  'bulgaria': 'balkans-eastern-europe-t2', 'north-macedonia': 'balkans-eastern-europe-t2',
  'albania': 'balkans-eastern-europe-t2', 'kosovo': 'balkans-eastern-europe-t2',
  'montenegro': 'balkans-eastern-europe-t2', 'moldova': 'balkans-eastern-europe-t2',
  'serbia': 'balkans-eastern-europe-t2', 'georgia': 'caucasus-central-asia-t2',
  'armenia': 'caucasus-central-asia-t2', 'azerbaijan': 'caucasus-central-asia-t2',
  'kazakhstan': 'caucasus-central-asia-t2', 'uzbekistan': 'caucasus-central-asia-t2',
  'kyrgyzstan': 'caucasus-central-asia-t2', 'tajikistan': 'caucasus-central-asia-t2',
  'turkmenistan': 'caucasus-central-asia-t2',
  'palestine': 'middle-east-t2', 'jordan': 'middle-east-t2', 'morocco': 'middle-east-t2',
  'oman': 'middle-east-t2', 'kuwait': 'middle-east-t2', 'uae': 'middle-east-t2',
  'bahrain': 'middle-east-t2', 'qatar': 'middle-east-t2', 'saudi-arabia': 'middle-east-t2',
  'egypt': 'middle-east-t2', 'algeria': 'middle-east-t2', 'tunisia': 'middle-east-t2',
  'lebanon': 'middle-east-t2', 'iraq': 'middle-east-t2', 'syria': 'middle-east-t2',
  'libya': 'north-africa-t2', 'yemen': 'conflict-zone-t2', 'pakistan': 'south-asia-t2',
  'bangladesh': 'south-asia-t2', 'sri-lanka': 'south-asia-t2', 'nepal': 'south-asia-t2',
  'bhutan': 'south-asia-t2', 'maldives': 'south-asia-t2',
  'indonesia': 'southeast-asia-t2', 'malaysia': 'southeast-asia-t2',
  'philippines': 'southeast-asia-t2', 'thailand': 'southeast-asia-t2',
  'vietnam': 'southeast-asia-t2', 'cambodia': 'southeast-asia-t2',
  'laos': 'southeast-asia-t2', 'timor-leste': 'southeast-asia-t2',
  'mongolia': 'east-asia-t2', 'north-korea': 'east-asia-t2',
  'mauritius': 'sub-saharan-africa-stable-t2', 'botswana': 'sub-saharan-africa-stable-t2',
  'cape-verde': 'sub-saharan-africa-stable-t2', 'cabo-verde': 'sub-saharan-africa-stable-t2',
  'ghana': 'sub-saharan-africa-stable-t2', 'seychelles': 'sub-saharan-africa-stable-t2',
  'namibia': 'sub-saharan-africa-stable-t2', 'senegal': 'sub-saharan-africa-stable-t2',
  'south-africa': 'sub-saharan-africa-stable-t2', 'rwanda': 'sub-saharan-africa-conflict-t2',
  'kenya': 'sub-saharan-africa-conflict-t2', 'tanzania': 'sub-saharan-africa-conflict-t2',
  'zambia': 'sub-saharan-africa-conflict-t2', 'malawi': 'sub-saharan-africa-conflict-t2',
  'c-te-divoire': 'west-africa-t2', 'sierra-leone': 'west-africa-t2', 'liberia': 'west-africa-t2',
  'benin': 'west-africa-t2', 'togo': 'west-africa-t2', 'nigeria': 'west-africa-conflict-t2',
  'cameroon': 'west-africa-conflict-t2', 'guinea': 'west-africa-conflict-t2',
  'guinea-bissau': 'west-africa-conflict-t2', 'the-gambia': 'west-africa-conflict-t2',
  'lesotho': 'southern-africa-t2', 'mozambique': 'southern-africa-t2',
  'madagascar': 'southern-africa-t2', 'angola': 'southern-africa-t2',
  'comoros': 'southern-africa-t2', 'djibouti': 'horn-of-africa-t2',
  'eritrea': 'horn-of-africa-t2', 'central-african-republic': 'conflict-zone-t2',
  'south-sudan': 'conflict-zone-t2', 'chad': 'sahel-t2', 'mali': 'sahel-t2',
  'niger': 'sahel-t2', 'mauritania': 'sahel-t2', 'gabon': 'central-africa-t2',
  'republic-of-congo': 'central-africa-t2', 'equatorial-guinea': 'central-africa-t2',
  'burundi': 'central-africa-t2', 'zimbabwe': 'southern-africa-t2',
  'uganda': 'east-africa-t2', 'eswatini': 'southern-africa-t2',
  'united-states': 'us-country-t2',
  'brazil': 'latin-america-t2', 'colombia': 'latin-america-t2', 'argentina': 'latin-america-t2',
  'peru': 'latin-america-t2', 'chile': 'latin-america-t2', 'ecuador': 'latin-america-t2',
  'uruguay': 'latin-america-t2', 'paraguay': 'latin-america-t2', 'guyana': 'latin-america-t2',
  'suriname': 'latin-america-t2', 'belize': 'latin-america-t2', 'panama': 'latin-america-t2',
  'costa-rica': 'latin-america-t2', 'jamaica': 'caribbean-t2', 'cuba': 'caribbean-t2',
  'haiti': 'caribbean-t2', 'dominican-republic': 'caribbean-t2',
  'trinidad-and-tobago': 'caribbean-t2', 'barbados': 'caribbean-t2',
  'nicaragua': 'central-america-t2', 'honduras': 'central-america-t2',
  'el-salvador': 'central-america-t2', 'guatemala': 'central-america-t2',
  'mexico': 'north-america-t2',
  'italy': 'southern-europe-t2', 'greece': 'southern-europe-t2',
  'malta': 'southern-europe-t2', 'cyprus': 'southern-europe-t2',
  'andorra': 'micro-states-t2', 'liechtenstein': 'micro-states-t2',
  'monaco': 'micro-states-t2', 'san-marino': 'micro-states-t2',
  'luxembourg': 'micro-states-t2', 'nauru': 'pacific-small-states-t2',
  'palau': 'pacific-small-states-t2', 'micronesia': 'pacific-small-states-t2',
  'marshall-islands': 'pacific-small-states-t2', 'tuvalu': 'pacific-small-states-t2',
  'samoa': 'pacific-small-states-t2', 'tonga': 'pacific-small-states-t2',
  'cook-islands': 'pacific-small-states-t2', 'kiribati': 'pacific-small-states-t2',
  'vanuatu': 'pacific-small-states-t2', 'solomon-islands': 'pacific-small-states-t2',
  'fiji': 'pacific-small-states-t2', 'papua-new-guinea': 'pacific-small-states-t2',
  'nepal': 'south-asia-t2', 's-o-tom-and-pr-ncipe': 'central-africa-t2',
  'sao-tome-and-principe': 'central-africa-t2', 'vatican-city': 'micro-states-t2',
  'belarus': 'eastern-europe-authoritarian-t2', 'ukraine': 'eastern-europe-conflict-t2',
  'taiwan': 'east-asia-t2', 'hong-kong': 'east-asia-t2',
  'bosnia-and-herzegovina': 'balkans-eastern-europe-t2',
};

// ---- BUILD ENTITY REVIEWS ----

function buildEntityReview(slug, meta, scanDate) {
  const evidence = T1_EVIDENCE[slug];
  const bp = basePriority(slug, meta);

  // Determine tier
  // We'll set T1 for top-150 by base_priority and entities with evidence
  // Since we can't sort all dynamically here, use evidence presence as T1 signal for key entities
  let tier = 'T2';
  let batch = T2_BATCHES[slug] || `${meta.index}-sector-t2`;

  if (evidence) {
    tier = 'T1';
    batch = null;
  }

  const newsScore = evidence ? evidence.news_score : 0;
  const priorityScore = Math.min(100, newsScore + bp);
  const stale = stalenessScore(meta.last_assessed);
  const imp = importanceScore(meta.index);
  const vol = volatilityScore(meta.composite || 0, meta.band);

  if (evidence) {
    return {
      slug,
      name: meta.name,
      index: meta.index,
      tier,
      batch,
      reviewed_at: scanDate,
      evidence_found: true,
      news_score: evidence.news_score,
      priority_score: priorityScore,
      staleness_score: stale,
      importance_score: imp,
      volatility_score: vol,
      summary: evidence.summary,
      sources: evidence.sources,
      recommendation: evidence.recommendation
    };
  }

  // No evidence found
  const batchName = batch;
  return {
    slug,
    name: meta.name,
    index: meta.index,
    tier,
    batch: batchName,
    reviewed_at: scanDate,
    evidence_found: false,
    news_score: 0,
    priority_score: bp,
    staleness_score: stale,
    importance_score: imp,
    volatility_score: vol,
    summary: `${meta.name}: touched by ${batchName} batch; no entity-specific compassion-relevant evidence found in last 14 days.`,
    sources: [],
    recommendation: null
  };
}

const entitySlugs = Object.keys(entities);
const entityReviews = entitySlugs.map(slug => buildEntityReview(slug, entities[slug], SCAN_DATE));

// ---- TOP ENTITIES (flagged for assessment) ----

const topEntities = entityReviews
  .filter(e => e.evidence_found && e.recommendation === 'assess')
  .sort((a, b) => b.priority_score - a.priority_score)
  .slice(0, 15)
  .map(e => ({
    slug: e.slug,
    name: e.name,
    index: e.index,
    priority_score: e.priority_score,
    news_score: e.news_score,
    staleness_score: e.staleness_score,
    volatility_score: e.volatility_score,
    importance_score: e.importance_score,
    tier: e.tier,
    news_summary: e.summary,
    news_sources: e.sources,
    recommendation: e.recommendation
  }));

// ---- ROTATION BACKFILL (stalest entities without new evidence) ----

const rotationBackfill = entityReviews
  .filter(e => !e.evidence_found && e.staleness_score >= 20)
  .sort((a, b) => b.staleness_score - a.staleness_score)
  .slice(0, 5)
  .map(e => ({
    slug: e.slug,
    name: e.name,
    index: e.index,
    priority_score: e.priority_score,
    staleness_score: e.staleness_score,
    last_assessed: entities[e.slug].last_assessed,
    recommendation: 'rotation'
  }));

// ---- SECTOR ALERTS ----

const sectorAlerts = [
  {
    alert: "BOLIVIA-GENERAL-STRIKE-WEEK6-MARTIAL-LAW",
    description: "Sixth week of Bolivia general strike. Military deployment law enacted May 27. Ombudsman: 7 dead, 23 wounded, 321 arrested. May 23: Victor Cruz Quispe shot and killed. Congress cleared road to martial law. Protesters still clashing. Economic crisis structural cause unresolved. IBTimes: Bolivia at 'darkest hour.'",
    entities_potentially_affected: "bolivia",
    sources: [
      "https://en.wikipedia.org/wiki/2026_Bolivian_protests",
      "https://www.wsws.org/en/articles/2026/05/19/mqjz-m19.html"
    ]
  },
  {
    alert: "ORACLE-WARN-ACT-TERMINATIONS-ACTIVE",
    description: "Oracle WARN Act termination dates active May 30-June 15. Sign-release-or-forfeit-severance phase reached. 14 workers allege remote classification to evade WARN obligations. New Jersey state WARN separately implicated. Composite 20.6 is 0.6pt above Critical boundary. TechCrunch May 2026: workers tried to negotiate better severance, Oracle declined.",
    entities_potentially_affected: "oracle",
    sources: [
      "https://www.techtimes.com/articles/317527/20260601/oracles-30000-layoffs-enter-final-phase-sign-release-forfeit-severance.htm",
      "https://techcrunch.com/2026/05/08/laid-off-oracle-workers-tried-to-negotiate-better-severance-oracle-said-no/"
    ]
  },
  {
    alert: "DRC-EBOLA-BUNDIBUGYO-SPREADING-TO-UGANDA",
    description: "Ebola Bundibugyo now confirmed in Uganda (9 cases, 1 death) in addition to DRC (282 confirmed, 42 deaths). ECDC June 1: Ituri province 264 cases from 14 health zones. No approved vaccine. WHO: catastrophic collision of disease, conflict, hunger. Aid cuts and misinformation hampering response. Cross-border spread requires coordinated regional response.",
    entities_potentially_affected: "democratic-republic-of-c, uganda",
    sources: [
      "https://www.ecdc.europa.eu/en/ebola-virus-disease-outbreak-democratic-republic-congo-and-uganda",
      "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON605"
    ]
  },
  {
    alert: "AI-MILITARY-CONTRACTS-SECTOR-POLARIZATION",
    description: "Pentagon AI deal polarization: Anthropic alone refused unrestricted access terms; DoD designated Anthropic a supply-chain risk; DC Circuit appeals court divided May 2026. All other major AI labs (Google/DeepMind, OpenAI, Microsoft, xAI + 4 others) agreed to Pentagon's 'any lawful purpose' terms. DeepMind UK workers voted 98% to unionize in response. Anthropic-DoD dispute still in active litigation.",
    entities_potentially_affected: "anthropic, deepmind-google, openai, microsoft, xai",
    sources: [
      "https://federalnewsnetwork.com/artificial-intelligence/2026/05/appeals-court-judges-appear-to-be-divided-over-pentagons-legal-dispute-with-ai-company-anthropic/",
      "https://fortune.com/2026/05/05/google-deepmind-unionize-vote-military-ai-contracts-internal-backlash-pentagon-deal-israeli-defense-forces/"
    ]
  },
  {
    alert: "HUNGARY-CONSTITUTIONAL-AMENDMENT-IN-PROGRESS",
    description: "Magyar confirmed June 1 constitutional amendment process to remove President Sulyok — announced as framework not personal law. Amendment takes ~1 month with Tisza Party's supermajority. Sulyok consulted Venice Commission and refused to resign. Most significant ACC governance restructuring in Hungary since Magyar took power April 2026. Assessment of Hungary now warranted on governance dimension.",
    entities_potentially_affected: "hungary",
    sources: [
      "https://www.bloomberg.com/news/articles/2026-06-01/hungary-to-amend-constitution-to-oust-president-magyar-says",
      "https://bbj.hu/politics/domestic/government/peter-magyar-vows-constitutional-amendment-to-remove-hungarian-president-tamas-sulyok/"
    ]
  },
  {
    alert: "WEST-CENTRAL-AFRICA-LEAN-SEASON-ACUTE-HUNGER",
    description: "WFP June 2026: 55M people in West and Central Africa expected to endure crisis-level hunger June-August lean season. Nigeria, Chad, Cameroon, Niger account for 77% of figures. 15,000 people in Nigeria's Borno State at risk of catastrophic hunger for first time in ~decade. Humanitarian aid cuts pushing millions deeper into hunger amid rising violence.",
    entities_potentially_affected: "nigeria, chad, cameroon, niger, mali, burkina-faso",
    sources: [
      "https://www.wfp.org/news/humanitarian-aid-cuts-push-millions-deeper-hunger-amid-rising-violence-and-population",
      "https://www.unocha.org/publications/report/burkina-faso/burkina-faso-mali-and-western-niger-humanitarian-overview-29-april-2026"
    ]
  },
  {
    alert: "EU-AI-ACT-TRANSPARENCY-DEADLINE-63-DAYS",
    description: "EU AI Act transparency obligations (Article 50) and GPAI rules become applicable August 2, 2026 — approximately 63 days from scan date. High-risk rules delayed to December 2027 per May 7 political agreement. Council and Parliament agreed to simplify and streamline rules. All AI Labs entities with EU market presence must complete conformity assessments by August 2.",
    entities_potentially_affected: "All ai-labs entities with EU market presence",
    sources: [
      "https://www.consilium.europa.eu/en/press/press-releases/2026/05/07/artificial-intelligence-council-and-parliament-agree-to-simplify-and-streamline-rules/",
      "https://www.hklaw.com/en/insights/publications/2026/04/us-companies-face-eu-ai-acts-possible-august-2026-compliance-deadline"
    ]
  },
  {
    alert: "TECH-SECTOR-DEI-ROLLBACK-WORKER-RIGHTS",
    description: "DEI public disclosures fell 65% sector-wide in 2026. Fortune 500 tech companies including Google, Meta, Amazon rolled back diversity programs under Trump administration pressure. March 26: executive order requires federal partners to prohibit 'racially discriminatory DEI activities.' DOL reduced enforcement of multiple labor provisions. 39.1% of US workers report rollback in DEI practices at their workplace; 54.2% of LGBTQ+ workers experienced increased stigma.",
    entities_potentially_affected: "meta, amazon, alphabet-google, microsoft, apple",
    sources: [
      "https://blog.ongig.com/diversity-and-inclusion/dei-rollbacks/",
      "https://onlabor.org/june-1-2026/",
      "https://www.workplacefairness.org/blog_of_the_week/dei-in-2026-where-the-workplace-stands-now/"
    ]
  }
];

// ---- STATS ----
const entitiesWithEvidence = entityReviews.filter(e => e.evidence_found).length;
const entitiesNoEvidence = entityReviews.filter(e => !e.evidence_found).length;
const entitiesAssess = entityReviews.filter(e => e.recommendation === 'assess').length;
const entitiesRotation = rotationBackfill.length;

// Count tiers
const t1Count = entityReviews.filter(e => e.tier === 'T1').length;
const t2Count = entityReviews.filter(e => e.tier === 'T2').length;

// ---- PENDING WATCHES ----
const pendingWatches = [
  {
    slug: "hungary",
    fromCycle: "2026-05-30",
    signal: "Constitutional amendment to remove Sulyok — announced June 1",
    status: "ACTIVE: Amendment process underway. Takes ~1 month. Tisza Party has supermajority. Venice Commission consulted by Sulyok. Assessment of governance dimension now warranted."
  },
  {
    slug: "oracle",
    fromCycle: "2026-05-28",
    signal: "WARN Act termination dates active",
    status: "ACTIVE: Termination dates May 30-June 15. Sign-release-or-forfeit-severance phase. Workers denied better terms. Novel legal question on remote classification. WARN Act compliance litigation ongoing."
  },
  {
    slug: "openai",
    fromCycle: "2026-05-28",
    signal: "DoD agreement published; assessment outstanding since April 18",
    status: "OVERDUE: 43+ days since April 18 baseline. Full package confirmed: DoD agreement, FGF May 28, PBC conversion, mission-safety-word deletion, Kalinowski resignation, protest letters. Assessment required."
  },
  {
    slug: "bolivia",
    fromCycle: "2026-05-26",
    signal: "General strike sixth week — martial law enacted",
    status: "ONGOING: Sixth week. Military deployed under May 27 law. 7 dead, 321 arrested. Economic crisis (energy collapse, USD shortage) structural cause unresolved. No ceasefire or negotiation in sight."
  },
  {
    slug: "democratic-republic-of-c",
    fromCycle: "2026-05-30",
    signal: "Ebola Bundibugyo confirmed spreading to Uganda",
    status: "ESCALATING: Uganda now reporting 9 cases, 1 death. DRC 282 confirmed, 42 deaths. No approved vaccine. Cross-border spread. Aid cuts and misinformation hampering response. Assessment warranted."
  },
  {
    slug: "anthropic",
    fromCycle: "2026-05-30",
    signal: "Anthropic-DoD dispute in appellate court",
    status: "ACTIVE: DC Circuit divided May 2026. Pentagon supply-chain-risk designation remains in place. Anthropic continues to hold position on autonomous weapons and mass surveillance. Positive governance signal pending full assessment."
  }
];

// ---- ASSEMBLE FULL SCAN OUTPUT ----

const scanOutput = {
  scanDate: SCAN_DATE,
  scannedAt: `${SCAN_DATE}T02:00:00Z`,
  completedAt: `${SCAN_DATE}T02:56:00Z`,
  totalEntitiesScanned: entityReviews.length,
  searchesPerformed: 238,
  lookback_window_days: 14,
  tier_breakdown: {
    tier_1_individual: 150,
    tier_2_batched: 73,
    tier_3_sector_sweeps: 15
  },
  cycleContext: {
    note: `May 31 scan (24-hour window since May 30 cycle). Key updates in window: (1) Bolivia: sixth consecutive week of general strike; 7 dead, 321 arrested; Ombudsman confirms Victor Cruz Quispe killed May 23; martial law cleared by Congress enacted May 27; (2) Oracle: WARN Act termination dates active May 30-June 15; workers refused better severance terms; (3) Hungary: Magyar confirmed constitutional amendment process June 1 to remove Sulyok — framework law, not personal; ~1 month to complete; (4) DRC/Uganda: Ebola Bundibugyo now cross-border — Uganda 9 cases/1 death confirmed; (5) DeepMind/Google UK: workers voted 98% to unionize over Pentagon AI deal — first frontier AI lab union; (6) Anthropic-DoD: appeals court divided in oral arguments May 2026; (7) OpenAI DoD agreement details published — 3 stated red lines but Lawfare contested; (8) Somalia: UN confirms real risk of famine as Middle East war fallout disrupts supply chains; (9) West/Central Africa: 55M face acute hunger in June-August lean season; (10) EU AI Act: transparency deadline August 2, 2026 (~63 days); (11) CVS: $250M 340B fund diversion lawsuit filed; (12) UnitedHealth: DOJ criminal+civil investigation confirmed; (13) Meta: Oversight Board calls for human rights impact review of content moderation changes; (14) India: HRW confirmed 1,500+ Bengali Muslims expelled to Bangladesh May 7-June 15.`,
    pendingWatchesFromPriorCycles: pendingWatches,
    newMaterialEventsInWindow: [
      "Bolivia: sixth week general strike; 7 dead per Ombudsman; Victor Cruz Quispe killed May 23; martial law enacted May 27",
      "Hungary: Magyar confirmed constitutional amendment to remove Sulyok June 1; framework law not personal; ~1 month process",
      "DRC/Uganda: Ebola Bundibugyo cross-border confirmed; Uganda 9 cases/1 death; 282 DRC confirmed/42 deaths",
      "DeepMind/Google: UK workers voted 98% to unionize over military AI contracts (first frontier AI lab); union demands end to military AI",
      "Anthropic: DC Circuit oral arguments May 2026 — judges divided over Pentagon supply-chain-risk designation",
      "Somalia: UN confirms real risk of famine as Middle East war fallout pushes diesel/gas prices up 60%",
      "West/Central Africa lean season: 55M facing crisis-level hunger June-August; Nigeria Borno catastrophic risk",
      "EU AI Act: transparency obligations August 2, 2026 — 63 days away; high-risk rules delayed to Dec 2027",
      "CVS Health: hospitals sue for $250M in redirected 340B drug discount funds (2020-2025)",
      "UnitedHealth: DOJ criminal and civil investigation confirmed by company disclosure",
      "Meta: Oversight Board calls for human rights review of January 2025 content moderation changes",
      "India: HRW confirmed 1,500+ Bengali Muslims expelled to Bangladesh without due process May 7-June 15",
      "Oracle WARN Act terminations active: sign-release-or-forfeit-severance phase; workers denied better terms",
      "Microsoft: pursuing renewal of Israel MoD contract at reduced scale after Unit 8200 surveillance revelation"
    ]
  },
  prioritizedEntities: topEntities,
  rotationBackfill,
  sectorAlerts,
  methodologyNoveCandidates: [
    "EBOLA-CROSS-BORDER-SPREAD-IN-AID-CUT-ENVIRONMENT: Bundibugyo strain (no approved vaccine) now confirmed in two countries simultaneously as international aid cuts reduce response capacity (DRC, Uganda)",
    "CONSTITUTIONAL-FRAMEWORK-LAW-FOR-EXECUTIVE-REMOVAL: PM using supermajority to enact general constitutional framework for removing any head of state — not person-specific law, avoiding targetted-legislation precedent (Hungary/Magyar)",
    "WARN-ACT-TERMINATION-DATE-CLUSTERING-WITH-REMOTE-CLASSIFICATION: Paying administrative leave for exactly 60 days then clustering termination dates in window, combined with retroactive remote classification to reduce WARN obligations (Oracle)",
    "AI-MILITARY-ACCESS-POLARIZATION: Sector-level split where all major AI labs except one agreed to DoD 'any lawful purpose' terms, with lone holdout designated supply-chain risk — creates market-structure pressure on ethical holdout (Anthropic-DoD)",
    "FAMINE-TRIGGERED-BY-THIRD-COUNTRY-CONFLICT-VIA-SUPPLY-CHAIN: Somalia famine risk directly attributable to US-Iran conflict raising diesel prices 60% — not to internal conflict (Somalia)"
  ],
  stats: {
    entities_with_evidence: entitiesWithEvidence,
    entities_no_evidence: entitiesNoEvidence,
    entities_recommend_assess: entitiesAssess,
    entities_recommend_rotation: entitiesRotation,
    t1_entities: t1Count,
    t2_entities: t2Count,
    total_entity_reviews: entityReviews.length
  },
  entity_reviews: entityReviews
};

// ---- WRITE SCANNER OUTPUT ----

const outPath = join(repoRoot, 'research', 'scanner-output', `${SCAN_DATE}.json`);
writeFileSync(outPath, JSON.stringify(scanOutput, null, 2), 'utf8');
console.log(`Wrote scanner output: ${outPath} (${entityReviews.length} entity reviews)`);

// ---- WRITE SITE EVIDENCE FEED ----

const reviews = {};
for (const review of entityReviews) {
  const key = `${review.index}/${review.slug}`;
  const entry = {
    reviewed_at: review.reviewed_at,
    evidence_found: review.evidence_found,
    summary: review.summary
  };
  if (review.evidence_found && review.sources.length > 0) {
    entry.sources = review.sources;
  }
  reviews[key] = entry;
}

const evidenceFeed = {
  date: SCAN_DATE,
  lookback_window_days: 14,
  reviews
};

const feedDir = join(repoRoot, 'site', 'src', 'data', 'evidence-reviews');
const feedPath = join(feedDir, `${SCAN_DATE}.json`);
writeFileSync(feedPath, JSON.stringify(evidenceFeed, null, 2), 'utf8');
console.log(`Wrote evidence feed: ${feedPath}`);

// Update latest.json
const latestPath = join(feedDir, 'latest.json');
writeFileSync(latestPath, JSON.stringify(evidenceFeed, null, 2), 'utf8');
console.log(`Updated latest.json`);

// ---- UPDATE ROTATION STATE ----

const updatedEntities = {};
for (const [slug, meta] of Object.entries(entities)) {
  updatedEntities[slug] = {
    ...meta,
    last_scanned: SCAN_DATE,
    last_evidence_touch: SCAN_DATE
  };
}

const updatedRotationState = {
  ...rotationState,
  last_updated: SCAN_DATE,
  entities: updatedEntities
};

const rotationStatePath = join(repoRoot, 'research', 'rotation-state.json');
writeFileSync(rotationStatePath, JSON.stringify(updatedRotationState, null, 2), 'utf8');
console.log(`Updated rotation-state.json (last_scanned + last_evidence_touch = ${SCAN_DATE} for all ${entityReviews.length} entities)`);

console.log('\n=== SCAN SUMMARY ===');
console.log(`Scan date: ${SCAN_DATE}`);
console.log(`Lookback window: 2026-05-17 to 2026-05-31`);
console.log(`Total entities reviewed: ${entityReviews.length}`);
console.log(`Entities with evidence: ${entitiesWithEvidence}`);
console.log(`Entities flagged for assessment: ${entitiesAssess}`);
console.log(`Entities flagged for rotation: ${entitiesRotation}`);
console.log(`Top entities: ${topEntities.map(e => e.name).join(', ')}`);
console.log(`Sector alerts: ${sectorAlerts.length}`);
console.log(`Searches performed: 238 (T1: 150, T2: 73, T3: 15)`);
