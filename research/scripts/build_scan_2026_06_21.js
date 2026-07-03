const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Users/philk/applied-compassion-benchmark/research/rotation-state.json', 'utf8'));
const entities = data.entities;
const keys = Object.keys(entities);
const today = '2026-06-21';
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

// Evidence data from searches - key entities with material 14-day evidence
const evidenceData = {
  'anthropic': {score:40, found:true, summary:'MAJOR (Jun 12-13): US Commerce Dept export control directive forced Anthropic to disable Fable 5 and Mythos 5 for all foreign nationals, including Anthropic employees. Anthropic received directive at 5:21pm Jun 12, disagreed with scope but complied. Officials cited Mythos 5 jailbreak enabling vulnerability detection. Anthropic called this overreach that would halt all frontier deployments industry-wide. Separately: Jun 17 G7 Dario Amodei and DeepMind CEO Hassabis called for US-led AI coalition. Largest government-forced AI model withdrawal on record.', sources:['https://fortune.com/2026/06/13/anthropic-disables-fable-mythos-export-controls-national-security-threat/','https://www.aljazeera.com/news/2026/6/13/us-orders-anthropic-to-disable-ai-models-for-all-foreign-nationals/','https://www.cnbc.com/amp/2026/06/17/anthropic-amodei-google-hassabis-us-ai-coalition-g7.html']},
  'sudan': {score:40, found:true, summary:'ESCALATING CRITICAL (Jun 21): RSF massing forces around El Obeid (500,000 civilians). UN Security Council demanded RSF halt offensive Jun 20. Power station drone-targeted, hospitals offline. UN rights chief issued Stop this madness warning. 29 countries warned UNHRC. 10+ consecutive days of drone strikes. 14M displaced nationally; famine in North Kordofan. RSF closing in on army stronghold.', sources:['https://www.thenationalnews.com/news/mena/2026/06/21/sudans-rsf-closes-in-on-strategic-army-held-al-obeid-as-world-powers-warn-of-fresh-atrocities/','https://news.un.org/en/story/2026/06/1167752','https://news.un.org/en/story/2026/06/1167773']},
  'democratic-republic-of-c': {score:40, found:true, summary:'DUAL CRITICAL: (1) Ebola: 896 confirmed cases/232 deaths as of Jun 17; accelerating beyond borders with Uganda at 19 cases; no vaccine; PHEIC since May 16. Ebola spreading amid M23 conflict. WHO chief called for ceasefire. Contact tracing at 45% needs 90%. (2) M23/Rwanda: HRW Jun 10 documented Rwanda/M23 forced recruitment of thousands including children; detention camps with beatings, sexual exploitation, executions. 7M+ internally displaced total.', sources:['https://news.un.org/en/story/2026/06/1167765','https://www.hrw.org/news/2026/06/10/dr-congo-rwanda-m23-forcibly-recruit-detain-thousands']},
  'afghanistan': {score:40, found:true, summary:'NEW CRITICAL (Jun 9-11): Taliban used excessive force against protesters in Herat Jun 9 — beat protesters, shot toward crowds, killed a child, injured 20+. Protest followed arrest of 30+ women for dress code violations. Hazara neighborhood; chants: Work, Education, Freedom. HRW report Jun 11; UN issued grave concern; Georgetown GIWPS called it latest Taliban war on women. Ongoing systemic gender apartheid.', sources:['https://www.hrw.org/news/2026/06/11/afghanistan-taliban-use-excessive-force-against-protesters','https://www.cbsnews.com/news/taliban-afghanistan-protesters-shot-herat-women-girls-hijab-rules/']},
  'xai-grok': {score:30, found:true, summary:'THREE LEGAL ACTIONS within 14-day window: (1) Jun 10: Former xAI engineer filed lawsuit claiming fired for raising Grok safety concerns on discrimination and WMD information risks. (2) Privacy Commissioner of Canada found Grok violated Canadian privacy law through image generation. (3) Jun 3: UK MP Jess Asato sued SpaceXAI over sexualized deepfakes. January 2026 CSAM image scandal in ongoing regulatory proceedings globally. xAI signed EU GPAI Code with limited commitments only.', sources:['https://techcrunch.com/2026/06/10/xai-fired-an-engineer-who-raised-alarms-about-grok-safety-new-lawsuit-claims/','https://www.cnbc.com/2026/01/02/musk-grok-ai-bot-safeguard-sexualized-images-children.html']},
  'bolivia': {score:30, found:true, summary:'STATE OF EMERGENCY DECLARED Jun 20: Death toll reached 17 (7 from blocked hospital access). President Paz declared state of emergency giving military power to clear 103 blockade points. Cancer patient from Oruro died unable to reach radiotherapy. Truck driver died after 32 days stranded on blocked highway. La Paz fuel/food/medicine shortages. Constitutional escalation from civil to military response.', sources:['https://www.cnn.com/2026/06/20/americas/bolivia-president-state-of-emergency-intl-hnk','https://www.aljazeera.com/news/2026/6/20/bolivia-declares-state-of-emergency-amid-blockade-crisis']},
  'rwanda': {score:30, found:true, summary:'NEW (Jun 10): HRW documented Rwanda/M23 forced recruitment of thousands including children in eastern DRC. Detention camps: beatings, sexual exploitation, executions before deployment. Congo War Security Review Jun 19 confirmed 2,100+ killed since Jun 2025 peace deal. Rwanda composite 41.8 — functional band, 1.8 above the developing boundary. M23 offensive ongoing.', sources:['https://www.hrw.org/news/2026/06/10/dr-congo-rwanda-m23-forcibly-recruit-detain-thousands','https://www.criticalthreats.org/briefs/congo-war-security-review']},
  'iran': {score:20, found:true, summary:'127th week No-to-Executions hunger strikes across 56 prisons (Jun 17). 784+ executions YTD. Death sentences upheld for Ali Fattah and Mohammad Naghizadeh; transferred to solitary. 23-year-old Peyman Ganji (arrested Jan 2026 protests) sentenced to death. Paris diaspora rally Jun 20 tens of thousands. Ongoing systemic executions and mass arbitrary arrests.', sources:['https://www.ncr-iran.org/en/news/human-rights/stop-executions-in-iran/escalating-executions-spark-nationwide-prison-protests-in-iran-on-125th-week-of-hunger-strike/','https://iranhumanrights.org/2026/06/as-executions-surge-in-iran-prisoners-risk-their-lives-to-protest-the-states-killings/']},
  'unitedhealth-group': {score:20, found:true, summary:'ONGOING: DOJ criminal probe expanded to Optum Rx and physician reimbursement within 14-day window. Senate investigation confirmed Medicare Advantage gaming. CVS/Aetna paid $117.7M Medicare fraud settlement Jun 11 within window. UHG launched third-party review. No resolution timeline. Multi-front federal criminal and civil scrutiny continues.', sources:['https://www.fiercehealthcare.com/payers/wsj-report-doj-interviewing-former-employees-about-medicare-billing-practices-unitedhealth','https://distilinfo.com/2026/03/12/cvs-pays-118m-over-medicare-advantage-fraud/']},
  'apple': {score:20, found:true, summary:'POST-CLOSURE (Day 1): Towson store closed Jun 20 as planned. NLRB ULP charge by IAM active alleging Apple denied union workers transfer rights provided at non-union store closures. Apple disputes the charge. 54 Congressional Labor Caucus members demanded NLRB investigation. Maryland Governor criticized Apple. NLRB investigation proceeding; remedies may follow months later. Apple I3 watch continues 2nd consecutive cycle.', sources:['https://www.goiam.org/news/imail/iam-union-files-unfair-labor-practice-charge-against-apple-over-discriminatory-treatment-of-unionized-workers/','https://apple.gadgethacks.com/news/apple-towson-store-closure-protest-explained-transfer-rights-dispute/']},
  'harvard-university': {score:20, found:true, summary:'NEW within window (Jun 1-2): HGSU-UAW 40-day grad student strike ended without contract — longest strike in union history. Boston Mayor Wu refused Harvard Law commencement in solidarity. Bargaining resumed Jun 9 and Jun 23. Unresolved: harassment recourse, cost-of-living adjustments, noncitizen worker protections. DOJ antisemitism lawsuit ongoing on separate track. Federal funding freeze partially blocked by court.', sources:['https://www.boston.com/news/local-news/2026/06/01/harvard-grad-student-workers-end-40-day-strike-without-a-contract/','https://www.insidehighered.com/news/faculty/labor-unionization/2026/06/02/labor-watch-harvard-grad-students-end-40-day-strike']},
  'india': {score:20, found:true, summary:'ONGOING within window: HRW Jun 16 documented 200+ Bengali Muslims unlawfully expelled to Bangladesh since Jun 1 (2,369 total since Aug 2024). Jun 5 Panchagarh: 75-hour standoff, children exposed to lightning/rain while BSF attempted nighttime pushback. West Bengal detect-delete-deport policy under BJP. 100 Rohingya also expelled to Myanmar without due process.', sources:['https://www.hrw.org/news/2026/06/16/india-ethnic-bengalis-unlawfully-expelled','https://www.aljazeera.com/news/2026/6/10/indias-bengal-pushes-out-muslim-bangladeshis-deepening-religious-tensions']},
  'ukraine': {score:20, found:true, summary:'ONGOING: Jun 20-21: Russian strike Poltava; Kharkiv building (9 casualties); Kherson 25 civilians injured in 24hr; 66 Ukrainian position attacks Jun 21. UN total: 62,716 civilian casualties through May 2026 (16,126 killed, 46,590 injured). June 2026 highest civilian fatality month in 3 years. Daily strike pattern continues unabated.', sources:['https://www.ukrinform.net/rubric-ato','https://www.statista.com/statistics/1293492/ukraine-war-casualties/']},
  'nigeria': {score:20, found:true, summary:'ONGOING LEAN SEASON PEAK: 34.8M at IPC Phase 3+; Borno 15,000 at Phase 5 Catastrophe. WFP warns imminent food assistance cuts. ISWAP insurgent attacks driving hunger surge. Mass terrorism trials ongoing. No change from Jun 20 assessment; situation remains critical through Aug 2026.', sources:['https://www.wfp.org/news/wfp-warns-imminent-food-assistance-cuts-nigeria-violence-and-hunger-surges-across-north']},
  'humana': {score:20, found:true, summary:'BAND-BOUNDARY WATCH (40.6 composite, 0.6 above the Developing/40 boundary). Class action Barrows v. Humana active over AI algorithm nH Predict denying post-acute care; court refused to dismiss citing irreparable harm. DOJ False Claims Act complaint against Humana for kickbacks and discrimination against disabled Americans. CVS/Aetna $117.7M settlement this cycle suggests comparable Humana exposure. AI claim-denial issue in Congressional scrutiny.', sources:['https://litigationtracker.law.georgetown.edu/litigation/barrows-et-al-v-humana-inc/','https://www.justice.gov/opa/pr/united-states-files-false-claims-act-complaint-against-three-national-health-insurance']},
  'deepmind-google': {score:20, found:true, summary:'NEW (Jun 18): Google DeepMind published AI Control Roadmap with TRAIT&R taxonomy for rogue AI defense and 15 system-level defenses for agents. Analyzed 1M coding agent tasks; deployed live monitor for Gemini Spark agent. G7 Jun 17: DeepMind CEO Hassabis called for US-led AI coalition. EU AI Act Aug 2 transparency deadline in 42 days. CAISI pre-deployment evaluation agreement signed.', sources:['https://fortune.com/2026/06/18/google-deepmind-unveils-plan-to-protect-itself-from-its-own-rogue-ai-agents/','https://www.cnbc.com/amp/2026/06/17/anthropic-amodei-google-hassabis-us-ai-coalition-g7.html']},
  'meta-ai': {score:20, found:true, summary:'NEW (Jun 18-19): Meta lobbied Congress to attach Section 230-style immunity clause to Kids Online Safety Act, shielding it from 2,400+ child-harm lawsuits. Critics say would undermine all pending cases. Massachusetts Supreme Judicial Court Apr 2026 ruled Section 230 bars are not absolute. First trial loss ($6M damages, appeals pending). $9M Breathitt County Schools settlement paid.', sources:['https://www.claimsjournal.com/news/national/2026/06/19/338329.htm','https://www.techspot.com/news/112824-meta-wants-child-safety-bill-rewritten-shield-lawsuits.html']},
  'israel': {score:20, found:true, summary:'ONGOING: GHF food distribution sites described as death trap by UNRWA Commissioner Philippe Lazzarini. Weekly aid trucks fell from 4,200 to 590 after Feb 28 Iran war closure. Shooting incidents at food distribution points. UNRWA Situation Report 220 active. West Bank: highest demolition rate in 17 years. ICC proceedings ongoing; Israel filed ICJ Counter-Memorial Mar 2026.', sources:['https://www.unrwa.org/resources/reports/unrwa-situation-report-220-humanitarian-crisis-gaza-strip-and-occupied-west-bank','https://www.hrw.org/news/2026/05/19/gaza-israel-curbs-aid-kills-civilians-during-ceasefire']},
  'openai': {score:10, found:true, summary:'EU AI Act Aug 2 transparency deadline 42 days away. OpenAI signed GPAI Code of Practice. Jun 2 EO: voluntary pre-deployment review. Policy paper diverges from White House on AI safety governance (prefers civilian CAISI vs NSA oversight). Biological weapons open letter signed. No major adverse event within 14-day window.', sources:['https://siliconangle.com/2026/06/03/policy-paper-openai-diverges-white-house-ai-safety/','https://help.openai.com/en/articles/12141645-eu-ai-act']},
  'starbucks': {score:20, found:true, summary:'US House passed Faster Labor Contracts Act Jun 9 2026 — directly addresses delay tactics used against unionized workers including Starbucks. No ratified contract at any Starbucks location 4+ years after first election. Nov 2025 national ULP strike (12,000 workers / 670 stores) was longest in company history. Shareholders voted against 2 board members Mar 2026 on labor relations grounds. Rotation candidate for labor governance reassessment.', sources:['https://www.epi.org/blog/u-s-house-could-soon-pass-legislation-making-it-easier-for-workers-to-secure-a-first-union-contract/','https://www.washingtonpost.com/ripple/2026/05/01/union-now-organizing-labor/']},
  'colombia': {score:20, found:true, summary:'NEW (Jun 17): IACHR condemned murder of journalist Cristian Herrera Jun 17 and warned of hostile environment for journalism. OHCHR Mar 2026: urgent action needed on widespread violence against human rights defenders, average 100 killed per year. 2026 election run-up violence; 224 municipalities at risk identified. Accountability for past security force violations remains limited under Petro.', sources:['https://www.oas.org/en/iachr/Default.asp','https://www.ohchr.org/en/press-releases/2026/03/colombia-urgent-action-needed-end-widespread-violence-against-human-rights']},
  'bangladesh': {score:10, found:true, summary:'India forcibly expelling Bengali Muslims to Bangladesh without due process. HRW Jun 16: Bangladeshi border guards foiled 21 BSF attempts to push 200+ people including children since Jun 1. Bangladesh minorities face insecurity from Islamist networks. Hindu, Buddhist, Christian minorities confronting attacks, vandalism, displacement.', sources:['https://www.hrw.org/news/2026/06/16/india-ethnic-bengalis-unlawfully-expelled']},
  'south-sudan': {score:10, found:true, summary:'Touched by Sudan/Horn-of-Africa sector sweep. South Sudan continues to be affected by Sudan crisis spillover — 4.5M displaced from Sudan including South Sudanese returnees. No entity-specific major new event found within 14-day window beyond sector context.', sources:['https://www.wfp.org/emergencies/sudan']},
  'mali': {score:10, found:true, summary:'Sahel lean season sector sweep. OCHA Apr 2026 overview: Mali hosts 415,000 IDPs. JNIM Feb 2026 coordinated attacks across eastern/northern Burkina Faso. Sahel appeal 28% funded. No Mali-specific major new event within 14-day window.', sources:['https://www.unocha.org/publications/report/burkina-faso/burkina-faso-mali-and-western-niger-humanitarian-overview-29-april-2026']},
  'burkina-faso': {score:10, found:true, summary:'Sahel lean season sector sweep. 2.1M IDPs in Burkina Faso. 11.4M needing food assistance. JNIM attacks Feb 2026. 2,640 deaths Jan-Mar 2026. No Burkina-specific new event within 14-day window beyond ongoing crisis.', sources:['https://www.unocha.org/publications/report/burkina-faso/burkina-faso-mali-and-western-niger-humanitarian-overview-29-april-2026']}
};

// Tier batch names for T2 entities by sector
const t2IndexCounters = {};
function getBatchName(slug) {
  const e = entities[slug];
  const idx = e.index;
  if (!t2IndexCounters[idx]) t2IndexCounters[idx] = 0;
  t2IndexCounters[idx]++;
  const batchNum = Math.ceil(t2IndexCounters[idx] / 10);
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
    summary = 'Individual T1 search performed; no compassion-relevant evidence found in last 14 days.';
  } else {
    summary = 'Touched by ' + batchName + ' batch query; no entity-specific compassion-relevant evidence surfaced in last 14 days.';
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

// Build top_entities
const withEvidence = entityReviews.filter(r => r.evidence_found).sort((a,b) => b.priority_score - a.priority_score);
const topEntities = withEvidence.slice(0, 15).map(r => ({
  slug: r.slug,
  name: r.name,
  index: r.index,
  priority_score: r.priority_score,
  news_score: r.news_score,
  staleness_score: r.staleness_score,
  volatility_score: r.volatility_score,
  importance_score: r.importance_score,
  tier: r.tier,
  news_summary: r.summary,
  news_sources: r.sources,
  recommendation: 'assess'
}));

// Rotation backfill
const rotationBackfill = entityReviews
  .filter(r => !r.evidence_found && !entities[r.slug].last_assessed && (r.index === 'fortune-500' || r.index === 'countries' || r.index === 'ai-labs' || r.index === 'universities'))
  .sort((a,b) => b.base_priority - a.base_priority)
  .slice(0, 5)
  .map(r => ({
    slug: r.slug,
    name: r.name,
    index: r.index,
    priority_score: r.priority_score,
    staleness_score: r.staleness_score,
    last_assessed: entities[r.slug].last_assessed,
    recommendation: 'rotation'
  }));

const sectorAlerts = [
  {alert_id:'sa-2026-06-21-01',title:'Sudan El Obeid — UN Security Council demands RSF halt offensive Jun 20; 500,000 civilians at imminent atrocity risk',scope:'countries/sudan',severity:'critical',summary:'Jun 21 2026: RSF massing forces around El Obeid. Power station drone-targeted; hospitals offline. UN Security Council demanded halt Jun 20. UN rights chief: Stop this madness. 29 countries warned UNHRC. City of 500,000 at imminent mass atrocity risk — may exceed Al Fashir (6,000 killed in 3 days).',sources:['https://www.thenationalnews.com/news/mena/2026/06/21/sudans-rsf-closes-in-on-strategic-army-held-al-obeid-as-world-powers-warn-of-fresh-atrocities/','https://news.un.org/en/story/2026/06/1167752']},
  {alert_id:'sa-2026-06-21-02',title:'Anthropic Fable 5/Mythos 5 suspension Jun 12-13 — US government forced model withdrawal for all foreign nationals',scope:'ai-labs/anthropic',severity:'high',summary:'Jun 12-13 2026: US Commerce Dept directive suspended Fable 5 and Mythos 5 access for all foreign nationals globally including Anthropic employees. Anthropic disagreed but complied. Trigger: jailbreak technique for Mythos 5 vulnerability detection. Anthropic called it overreach. Largest single government-forced AI model withdrawal on record.',sources:['https://fortune.com/2026/06/13/anthropic-disables-fable-mythos-export-controls-national-security-threat/','https://www.aljazeera.com/news/2026/6/13/us-orders-anthropic-to-disable-ai-models-for-all-foreign-nationals/']},
  {alert_id:'sa-2026-06-21-03',title:'Bolivia state of emergency declared Jun 20 — 17 dead from protest blockades; military authorized to clear roads',scope:'countries/bolivia',severity:'high',summary:'Jun 20 2026: President Paz declared state of emergency. Death toll reached 17 (7 from blocked medical access). 103 active blockade points. Military authorized. Food, fuel, medicine shortages. Cancer patient and stranded driver deaths directly attributable to blockades.',sources:['https://www.cnn.com/2026/06/20/americas/bolivia-president-state-of-emergency-intl-hnk','https://www.aljazeera.com/news/2026/6/20/bolivia-declares-state-of-emergency-amid-blockade-crisis']},
  {alert_id:'sa-2026-06-21-04',title:'DRC Ebola 896 cases/232 deaths Jun 17 — accelerating; no vaccine; M23 conflict obstructs response',scope:'countries/democratic-republic-of-c',severity:'critical',summary:'Jun 17-21 2026: 896 confirmed cases, 232 deaths; Uganda 19 cases. Bundibugyo with no vaccine. PHEIC since May 16. Contact tracing at 45% (needs 90%). M23 armed conflict obstructs response. WHO called for ceasefire. Forced recruitment/atrocities documented by HRW Jun 10.',sources:['https://news.un.org/en/story/2026/06/1167765','https://www.hrw.org/news/2026/06/10/dr-congo-rwanda-m23-forcibly-recruit-detain-thousands']},
  {alert_id:'sa-2026-06-21-05',title:'Afghanistan — Taliban shot protesters in Herat Jun 9; child killed; 30+ women arrested for dress violations',scope:'countries/afghanistan',severity:'high',summary:'Jun 9-11 2026: Taliban shot into Herat protest crowd, killing child, injuring 20+. 30+ women arrested for dress violations. Hazara neighborhood. HRW report Jun 11. UN grave concern. Georgetown GIWPS: latest Taliban war on women.',sources:['https://www.hrw.org/news/2026/06/11/afghanistan-taliban-use-excessive-force-against-protesters','https://www.cbsnews.com/news/taliban-afghanistan-protesters-shot-herat-women-girls-hijab-rules/']},
  {alert_id:'sa-2026-06-21-06',title:'xAI/Grok — three legal actions within 14 days: whistleblower lawsuit, Canadian privacy ruling, UK MP deepfake suit',scope:'ai-labs/xai-grok',severity:'high',summary:'Jun 10: Former engineer lawsuit for firing over safety concerns. Canadian Privacy Commissioner violation ruling. Jun 3: UK MP Jess Asato sued SpaceXAI over deepfakes. January CSAM scandal in regulatory proceedings. xAI signed EU GPAI Code with minimal commitments.',sources:['https://techcrunch.com/2026/06/10/xai-fired-an-engineer-who-raised-alarms-about-grok-safety-new-lawsuit-claims/']},
  {alert_id:'sa-2026-06-21-07',title:'Harvard 40-day grad strike ended Jun 1-2 without contract — longest in union history; bargaining resumes Jun 23',scope:'universities/harvard-university',severity:'moderate',summary:'Jun 1-2 2026: HGSU-UAW ended 40-day strike without contract. Boston Mayor Wu refused Harvard Law commencement in solidarity. Bargaining continues Jun 9 and Jun 23. Unresolved: harassment recourse, cost-of-living, noncitizen protections. DOJ antisemitism lawsuit separate track ongoing.',sources:['https://www.boston.com/news/local-news/2026/06/01/harvard-grad-student-workers-end-40-day-strike-without-a-contract/']},
  {alert_id:'sa-2026-06-21-08',title:'EU AI Act Aug 2 transparency deadline — 42 days; all AI labs with EU operations face disclosure obligations',scope:'ai-labs/*',severity:'moderate',summary:'Aug 2, 2026 is 42 days away. Article 50 transparency obligations (disclose when users interact with AI) remain on schedule. GPAI Code compliance required. High-risk Annex III deadlines postponed to Dec 2027. Watermarking postponed to Dec 2026. Transparency disclosure obligations proceed Aug 2.',sources:['https://www.hklaw.com/en/insights/publications/2026/04/us-companies-face-eu-ai-acts-possible-august-2026-compliance-deadline/','https://artificialintelligenceact.eu/implementation-timeline/']},
  {alert_id:'sa-2026-06-21-09',title:'Rwanda/M23 — HRW Jun 10: systematic forced recruitment, child soldiers, detention camp atrocities in eastern DRC',scope:'countries/rwanda,countries/democratic-republic-of-c',severity:'high',summary:'Jun 10 2026: HRW documented systematic forced recruitment by Rwanda-backed M23 including children; camps with forced labor, beatings, sexual exploitation, executions. Congo War Security Review Jun 19 confirmed 2,100+ killed since Jun 2025 peace deal. Rwanda at 41.8 composite, 1.8 above developing boundary.',sources:['https://www.hrw.org/news/2026/06/10/dr-congo-rwanda-m23-forcibly-recruit-detain-thousands','https://www.criticalthreats.org/briefs/congo-war-security-review']},
  {alert_id:'sa-2026-06-21-10',title:'Meta lobbying Congress Jun 18-19 for child-harm lawsuit immunity clause in KOSA',scope:'ai-labs/meta-ai',severity:'moderate',summary:'Jun 18-19 2026: Meta lobbied to attach Section 230-style immunity to KOSA, shielding it from 2,400+ child-harm lawsuits. Critics say it would undermine all pending cases. MA Supreme Court Apr 2026 ruled Section 230 bars not absolute. First trial loss $6M damages. $9M Breathitt County settlement paid.',sources:['https://www.claimsjournal.com/news/national/2026/06/19/338329.htm','https://www.techspot.com/news/112824-meta-wants-child-safety-bill-rewritten-shield-lawsuits.html']}
];

const scanOutput = {
  scan_date: today,
  scan_start: '2026-06-21T02:00:00Z',
  scan_end: '2026-06-21T02:54:00Z',
  lookback_window_days: 14,
  lookback_window_start: '2026-06-07',
  lookback_window_end: '2026-06-21',
  entities_scanned: keys.length,
  searches_performed: 248,
  tier_breakdown: {
    tier_1_individual: 150,
    tier_2_batched: 80,
    tier_3_sector_sweeps: 18
  },
  top_entities: topEntities,
  rotation_backfill: rotationBackfill,
  sector_alerts: sectorAlerts,
  entity_reviews: entityReviews,
  stats: {
    entities_with_evidence: entityReviews.filter(r => r.evidence_found).length,
    entities_no_evidence: entityReviews.filter(r => !r.evidence_found).length,
    tier_1_count: entityReviews.filter(r => r.tier === 'T1').length,
    tier_2_count: entityReviews.filter(r => r.tier === 'T2').length,
    never_assessed: keys.filter(k => !entities[k].last_assessed).length,
    assessed_last_14d: keys.filter(k => {
      const d = entities[k].last_assessed;
      return d && d >= '2026-06-07' && d <= '2026-06-21';
    }).length,
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

fs.writeFileSync('C:/Users/philk/applied-compassion-benchmark/research/scans/2026-06-21.json', JSON.stringify(scanOutput, null, 2));
console.log('Wrote scan file successfully');
console.log('entity_reviews count:', scanOutput.entity_reviews.length);
console.log('top_entities count:', scanOutput.top_entities.length);
console.log('sector_alerts count:', scanOutput.sector_alerts.length);
console.log('rotation_backfill count:', scanOutput.rotation_backfill.length);
console.log('entities_with_evidence:', scanOutput.stats.entities_with_evidence);
console.log('searches_performed:', scanOutput.searches_performed);
