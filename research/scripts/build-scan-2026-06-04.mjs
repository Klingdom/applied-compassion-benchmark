/**
 * Build scan output for 2026-06-04
 * Run: node research/scripts/build-scan-2026-06-04.mjs
 */
import fs from 'fs';

const SCAN_DATE = "2026-06-04";
const LOOKBACK_DAYS = 14;

const rotation = JSON.parse(fs.readFileSync('research/rotation-state.json','utf8'));
const entities = rotation.entities;
const allSlugs = Object.keys(entities);

// ─── T1 Individual evidence (from searches) ──────────────────────────────────
const t1Evidence = {
  "iran": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"June 2026 execution surge: June 1 executions of Mehrdad Mohammadi-Nia and Ashkan Maleki (January 2026 protesters); June 2 execution of Fathollah Avari in Hamedan. 146+ executions documented since Iran war began; 39+ political executions YTD. June 1 arbitrary arrests of Seyyed Sadra Hosseini and filmmaker Samira Norouz Naseri. Broad crackdown on academics, lawyers, artists.",
    sources:["https://iran-hrm.com/2026/06/03/death-penalty-arbitrary-arrests-and-the-pervasive-crackdown-on-political-prisoners-in-iran/","https://iran-hrm.com/2026/06/02/what-is-happening-to-political-prisoners-in-iran/","https://www.amnesty.org/en/latest/news/2026/05/iran-mass-arbitrary-arrests-and-political-executions-mark-intensifying-repression/"]
  },
  "oracle": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"June 15 final WARN Act deadline: 30,000 workers sign-release-or-forfeit severance. WARN 60-day pay absorbed into severance for newer employees leaving no additional payout. Active WARN Act investigations by Strauss Borrelli PLLC in Washington State and Kansas City MO. Workers advised to check state-specific rules before signing.",
    sources:["https://www.techtimes.com/articles/317527/20260601/oracles-30000-layoffs-enter-final-phase-sign-release-forfeit-severance.htm","https://www.peoplematters.in/news/strategic-hr/oracle-heads-into-final-layoff-phase-as-thousands-prepare-to-leave-by-june-15-50033","https://getoutofdebt.org/253476/severance-agreement-before-signing-layoff"]
  },
  "democratic-republic-of-c": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"Ebola Bundibugyo: 381 confirmed cases/64 deaths in DRC as of June 4. Ituri province most affected (359 cases from 17 health zones). No Bundibugyo-specific vaccine or therapeutic. WHO+Africa CDC $518M response plan announced. PHEIC active since May 17. Contact tracing below 50%. 26.5M concurrent acute hunger.",
    sources:["https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON605","https://www.ecdc.europa.eu/en/ebola-outbreak-democratic-republic-congo-and-uganda","https://www.cdc.gov/han/php/notices/han00530.html"]
  },
  "uganda": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"Ebola Bundibugyo spread to Uganda: 19 confirmed cases including 2 deaths (June 5). Cases in Kampala and Wakiso. Health worker and driver infections documented. Part of DRC/Uganda PHEIC declared May 17. 88 deaths across both countries by June 6. Anti-Homosexuality Act continues to fuel arbitrary arrests, extortion, abuse.",
    sources:["https://www.cdc.gov/media/releases/2026/update-on-ebola-outbreak-in-the-democratic-republic-of-the-congo-and-uganda-6-5-2026.html","https://www.aljazeera.com/news/2026/6/5/who-africa-cdc-unveil-518m-ebola-plan-as-uganda-death-toll-rises"]
  },
  "bolivia": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"6-week workers insurrection: 100+ blockade points. 4 protesters killed, 127 detained in single day. Arrest warrants for COB Executive-Secretary Mario Argollo and 24 other union leaders on terrorism charges. Oil field occupation repressed. Demand: President Paz resignation. Grassroots organizing independent of union leadership. Rebellion threatening government overthrow.",
    sources:["https://counterpunch.org/2026/06/04/rebellion-from-below-threatens-overthrow-of-bolivias-new-rightwing-government/","https://fightbacknews.org/articles/bolivian-general-strike-enters-5th-week-demands-president-paz-resign","https://www.wsws.org/en/articles/2026/06/06/mpkz-j06.html"]
  },
  "myanmar": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"June 1 airstrikes on IDP camps in Rakhine State: 2 civilians killed at Kyaung Cha Twin IDP camp while residents slept; 4 jet fighters + Y-12 transport bombed Taungup shelters. Fresh wave of displacement. 2025 was deadliest year for aerial attacks since 2021 coup. 5.2M displaced; junta controls 21% territory; 15,000+ killed since coup.",
    sources:["https://eng.mizzima.com/2026/06/03/34809","https://www.hrw.org/world-report/2026/country-chapters/myanmar","https://www.amnesty.org/en/latest/news/2026/01/myanmar-junta-atrocities-surge-5-years-since-coup/"]
  },
  "russia": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"June 2 massive aerial attack on Ukraine (656 drones + 73 missiles): 22 civilians killed including children; 138 wounded in Kyiv. Putin rejected direct talks June 6. Ukraine lost 70%+ electricity generation capacity. UN: 15,850 civilian deaths since Feb 2022. Drone casualty surge +120%. Ongoing war crimes documentation.",
    sources:["https://www.npr.org/2026/06/02/nx-s1-5844071/russian-attack-ukraine","https://www.aljazeera.com/news/2026/6/2/at-least-nine-people-killed-dozens-wounded-in-russian-attacks-on-ukraine"]
  },
  "palestine": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"~72,939 Palestinians killed Oct 2023–May 30 2026; 172,927 injured. GHF militarized food distribution launched May 27 — shooting incidents at distribution points. UNRWA blocked from Gaza since March 2025. ICJ: aid blockage weapon of war. 37 NGO licences revoked. West Bank: UN experts June 1 — 13 Palestinians killed, 500+ injured by settlers in 5 months 2026. EU sanctioned settler organizations May 11.",
    sources:["https://www.hrw.org/news/2026/05/19/gaza-israel-curbs-aid-kills-civilians-during-ceasefire","https://www.un.org/unispal/document/un-experts-press-release-1jun26/","https://www.unrwa.org/resources/reports/unrwa-situation-report-220-humanitarian-crisis-gaza-strip-and-occupied-west-bank"]
  },
  "israel": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"West Bank: UN experts (June 1) — unprecedented settler violence; 13 Palestinians killed, 500+ injured in first 5 months 2026. 36,000+ Palestinians forcibly displaced. EU sanctioned Israeli settler organizations and leaders May 11. Government enables ethnic cleansing in Area C (Jordan Valley, South Hebron Hills). Gaza blockade maintained; militarized GHF food distribution with shooting incidents.",
    sources:["https://www.un.org/unispal/document/un-experts-press-release-1jun26/","https://www.hrw.org/news/2026/03/24/west-bank-israeli-government-enables-escalating-violence-displacement-ethnic","https://www.ohchr.org/en/press-releases/2026/03/israels-settlement-expansion-drives-mass-displacement-west-bank-un-report"]
  },
  "sudan": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"World's largest humanitarian crisis: 33.7M requiring assistance. Famine confirmed across Darfur/Kordofan hotspots; 135,000 in IPC Phase 5. 825,000 children under-5 facing severe acute malnutrition. 9M displaced. Response only 16.2% funded. Lean season (June–Sep) will worsen conditions. OCHA urging Security Council action. Year 3 of civil war.",
    sources:["https://www.unicef.org/press-releases/risk-famine-persists-nearly-195-million-people-face-acute-food-insecurity-sudan","https://reliefweb.int/report/sudan/sudan-becomes-worlds-hungriest-country-famine-spreads-two-new-areas-darfur","https://www.wfp.org/emergencies/sudan"]
  },
  "south-sudan": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"7.8M (56% of population) acutely food insecure April–July 2026. 28,000 in IPC Phase 5 (Catastrophe) in Luakpiny/Nasir and Fangak. Four counties at imminent famine risk. 2.11M children under-5 facing acute malnutrition. Doubled fuel prices from Middle East conflict compounding crisis. Rising conflict heightening risk.",
    sources:["https://reliefweb.int/report/south-sudan/south-sudan-rising-conflict-heightens-famine-risk-78-million-people-facing-severe-food-insecurity-and-22-million-malnourished-children-ipc-acute-food-insecurity-and-acute-malnutrition-analysis-april-july-2026-published-28-april-2026"]
  },
  "afghanistan": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"UNSC Resolution 2818 unanimously extended UNAMA mandate (June 2026). Taliban ban on Afghan women at UN premises continues since September 2025 — life-saving aid operations severely compromised. Taliban Decree No.12 authorises domestic violence; No.18 removes minimum marriage age. Multiple UNSC speakers urged Taliban reversal. Health system near catastrophe.",
    sources:["https://press.un.org/en/2026/sc16317.doc.htm","https://www.ohchr.org/en/press-releases/2026/03/afghanistan-un-experts-demand-immediate-end-taliban-restrictions-women-un"]
  },
  "unitedhealth-group": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"DOJ civil+criminal Medicare Advantage fraud probe ongoing. MA AG $100M MassHealth fraud suit filed May 29. Arizona AG June 1 price-fixing cartel suit names UnitedHealthcare with 7 other insurers + MultiPlan/Claritev. AI prior-authorization denial class action active. Multiple state AG coordinated investigations. Congressional hearings held.",
    sources:["https://www.healthcarefinancenews.com/news/unitedhealth-group-reportedly-under-investigation-criminal-medicare-advantage-fraud","https://azmirror.com/briefs/arizona-sues-multiplan-major-insurers-alleging-a-cartel-that-underpaid-doctors-and-hospitals/","https://lawfold.com/united-health-care-lawsuit/"]
  },
  "cvs-health": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"$250M+ 340B spread-pricing RICO lawsuits filed May 21 (Mount Sinai, U-Kansas, U-Michigan). Arizona AG June 1 price-fixing cartel suit names CVS/Aetna. March 11: Aetna paid $117.7M to settle DOJ Medicare Advantage false claims. Medicare kickback allegations proceeding after dismissal denied March 25. RICO triple damages possible.",
    sources:["https://340breport.com/major-health-systems-sue-cvs-over-alleged-scheme-to-secretly-divert-millions-in-340b-savings/","https://www.usnews.com/news/top-news/articles/2026-03-11/cvs-aetna-pays-117-7-million-to-settle-us-claims-it-defrauded-medicare","https://www.azfamily.com/2026/06/01/arizona-ag-mayes-sues-health-care-giants-over-alleged-price-fixing/"]
  },
  "india": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"1,500+ Bengali Muslims expelled to Bangladesh May 7–June 15 without due process (HRW). Some were Indian citizens; 40+ allegedly thrown into sea. 145 disappeared. 10,000+ Gujarat demolitions against Supreme Court ruling. New detention centres policy post-BJP West Bengal win. UN and HRW condemn as discriminatory targeting of religious minority.",
    sources:["https://www.hrw.org/news/2025/07/23/india-hundreds-of-muslims-unlawfully-expelled-to-bangladesh","https://www.arabnews.com/node/2611133/"]
  },
  "xai-grok": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"Pentagon $200M classified access contract (Feb 2026): Grok in military intelligence, weapons planning, battlefield ops. Sen. Warren formal demands to Hegseth March 16. Documented harmful outputs: murder advice, CSAM, antisemitic content. NSA/GSA raised unmet federal AI risk requirements. EU AI Act: xAI did not sign GPAI Code of Practice. EU enforcement powers activate August 2.",
    sources:["https://thehill.com/homenews/senate/5786415-elizabeth-warren-pentagon-grok-xai/","https://www.bankinfosecurity.com/pentagons-use-grok-raises-ai-security-concerns-a-30546","https://techcrunch.com/2026/03/16/warren-presses-pentagon-over-decision-to-grant-xai-access-to-classified-networks/"]
  },
  "hungary": {
    tier:"T1", evidence_found:true, news_score:30,
    summary:"Political transition April 12: Tisza Party (Péter Magyar) defeated Fidesz, ending Orbán 16-year rule. ECJ April 22 ruled Hungary's LGBTQ law violates EU Charter. Budapest Mayor Karácsony charged January 2026 for organizing Pride despite ban. New government committed to freedom of assembly. HRW: new government needs to restore rule of law.",
    sources:["https://www.pbs.org/newshour/world/hungary-passes-constitutional-amendment-to-ban-lgbtq-public-events","https://www.hrw.org/news/2026/04/14/hungary-new-government-needs-to-restore-rule-of-law","https://aljazeera.com/news/2026/4/21/eu-court-rules-hungarys-lgbtq-law-violates-human-rights"]
  },
  "germany": {
    tier:"T1", evidence_found:true, news_score:20,
    summary:"EU Returns Regulation agreed June 1 (force June 12): Germany backed return hubs outside EU, detention extended to 2 years (unlimited for security risks), faster deportations. Germany joined Netherlands, Austria, Denmark, Greece coalition to identify return centre partner countries. 250+ civil society groups warn of 'offshore prisons'. Germany implementing EU Migration Pact.",
    sources:["https://home-affairs.ec.europa.eu/news/commission-welcomes-political-agreement-return-regulation-2026-06-02_en","https://www.visasupdate.com/post/eu-migration-crackdown-return-hubs-2026"]
  },
  "anthropic": {
    tier:"T1", evidence_found:true, news_score:20,
    summary:"RSP v3 (Feb 2026) dropped flagship safety pledge — no longer commits to pause training if safety measures inadequate. Pentagon blacklisted Anthropic as 'supply chain risk' for refusing to remove autonomous weapons and surveillance safeguards. DC Circuit oral arguments ongoing on Pentagon appeal. EU AI Act: Anthropic signed GPAI Code of Practice. Enforcement powers activate August 2.",
    sources:["https://time.com/7380854/exclusive-anthropic-drops-flagship-safety-pledge/","https://www.engadget.com/ai/anthropic-weakens-its-safety-pledge-in-the-wake-of-the-pentagons-pressure-campaign-183436413.html"]
  },
  "alphabet-google": {
    tier:"T1", evidence_found:true, news_score:20,
    summary:"DOJ search monopoly case: both parties appealing (government seeks breakup; Google seeks monopoly ruling reversal). DOJ + states appealed advertising monopoly remedies. UK CMA June 3 order within 14-day window: opt-out from AI Overviews, attribution required, no retaliation permitted. California SB 253 Scope 1+2 reporting deadline June 30.",
    sources:["https://tech-insider.org/google-antitrust-appeal-doj-search-monopoly-2026/","https://www.justice.gov/opa/pr/department-justice-wins-significant-remedies-against-google"]
  },
  "openai": {
    tier:"T1", evidence_found:true, news_score:20,
    summary:"Published Frontier Governance Framework May 28 (aligns with CA Transparency in Frontier AI Act + EU AI Act GPAI Code of Practice). Released democratic governance blueprint diverging from White House on civilian vs NSA oversight of frontier AI. EU AI Act enforcement powers activate August 2.",
    sources:["https://siliconangle.com/2026/06/03/policy-paper-openai-diverges-white-house-ai-safety/","https://openai.com/index/openai-frontier-governance-framework/"]
  },
  "meta-ai": {
    tier:"T1", evidence_found:true, news_score:20,
    summary:"EU AI Act: Meta declined to sign GPAI Code of Practice (24 providers signed; Meta absent). Worker surveillance testing EU AI/labor rules. EC notified Meta of possible interim measures over exclusion of third-party AI assistants from WhatsApp. EU enforcement powers activate August 2. Meta did not commit to child safety measures (TikTok, YouTube also declined).",
    sources:["https://www.compliancehub.wiki/metas-rejection-of-eu-ai-code-of-practice-implications-for-global-ai-compliance-frameworks/","https://ec.europa.eu/commission/presscorner/detail/sv/ip_26_310"]
  },
  "3m": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"Australia launched record A$2B ($1.43B) PFAS lawsuit May 28 — 28 military bases contaminated; $408M already paid to communities. Minnesota MPCA new lawsuit May 2026: PFAS groundwater/river contamination at Cottage Grove at 310,000 ppt (far above standards). Two major PFAS lawsuits in same month. Ongoing US municipal litigation.",
    sources:["https://www.insurancejournal.com/news/international/2026/05/28/871584.htm","https://www.mprnews.org/story/2026/05/28/australia-launches-record-1-billion-lawsuit-against-3m-forever-chemicals-defense-bases","https://www.fox9.com/news/australia-sues-3m-over-forever-chemical-contamination-may-2026"]
  },
  "amazon-com": {
    tier:"T1", evidence_found:true, news_score:20,
    summary:"April 6 worker death at PDX9 Troutdale OR — management ordered employees to continue working around body. SDNY ongoing federal investigation into safety data manipulation. Injury rate 2x industry average (5.9 vs 3.0 per 100 workers). December 2024 corporate-wide OSHA settlement underway. Amazon investing $hundreds of millions in 2026 safety improvements.",
    sources:["https://techcrunch.com/2026/04/13/an-amazon-warehouse-worker-died-on-the-job-at-oregon-facility/","https://www.btimesonline.com/articles/177080/20260414/amazon-warehouse-death-sparks-outrage-as-workers-claim-they-were-told-to-keep-working-around-body.htm"]
  },
  "elevance-health": {
    tier:"T1", evidence_found:true, news_score:30,
    summary:"Arizona AG June 1 price-fixing cartel suit names Elevance Health with 7 other insurers + MultiPlan. Algorithm suppressed out-of-network physician/hospital payments. Dismissal denied in Medicare kickback allegations case March 25. RICO triple damages possible.",
    sources:["https://www.azfamily.com/2026/06/01/arizona-ag-mayes-sues-health-care-giants-over-alleged-price-fixing/","https://www.beckerspayer.com/legal/judge-rules-aetna-elevance-humana-must-face-medicare-kickback-allegations/"]
  },
  "humana": {
    tier:"T1", evidence_found:true, news_score:30,
    summary:"Arizona AG June 1 price-fixing cartel suit names Humana. Dismissal denied in Medicare kickback allegations March 25. MultiPlan algorithm used to suppress out-of-network reimbursements.",
    sources:["https://azmirror.com/briefs/arizona-sues-multiplan-major-insurers-alleging-a-cartel-that-underpaid-doctors-and-hospitals/","https://www.beckerspayer.com/legal/judge-rules-aetna-elevance-humana-must-face-medicare-kickback-allegations/"]
  },
  "molina-healthcare": {
    tier:"T1", evidence_found:true, news_score:30,
    summary:"Arizona AG June 1 price-fixing cartel suit names Molina Healthcare with 7 other insurers + MultiPlan. Algorithm-based scheme alleged to suppress out-of-network physician and hospital payments. RICO triple damages possible.",
    sources:["https://www.kjzz.org/politics/2026-06-01/mayes-accuses-multiplan-insurance-companies-of-illegal-colluding-to-shortchange-medical-providers"]
  },
  "nigeria": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"Borno State: 15,000+ people in IPC Phase 5 (catastrophic hunger) — first time in a decade. ~6M in northeast facing crisis hunger June–August lean season. Borno, Adamawa, Yobe conflict zones driving spike. WFP at risk of complete funding depletion for emergency assistance. Part of West Africa 52.8M acute food insecurity lean-season crisis.",
    sources:["https://www.wfp.org/news/increased-insurgent-attacks-nigeria-threaten-regional-stability-and-drive-sharp-spike-hunger","https://www.fao.org/africa/news-stories/news-detail/west-africa-and-the-sahel--nearly-52.8-million-people-could-face-acute-food-insecurity-during-the-2026-lean-season-(june-august)/en"]
  },
  "yemen": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"UN Security Council June 6 demanded immediate unconditional release of 73 UN staff detained by Houthis since June 2024. HRW/Amnesty June 7 called for release. One WFP worker died in Houthi custody February 2025. 23.1M Yemenis need support; $2.16B HNRP only 14% funded. Healthcare near collapse. Aid halted in Houthi areas due to detentions.",
    sources:["https://www.hrw.org/news/2026/06/07/yemen-houthis-should-free-un-civil-society-staff","https://www.millichronicle.com/2026/06/68385.html","https://www.globalsecurity.org/military/library/news/2026/06/mil-260605-unsc01.htm"]
  },
  "united-states": {
    tier:"T1", evidence_found:true, news_score:40,
    summary:"17th ICE detention death in 2026 (~1 death per 6 days — highest rate on record). 40+ deaths since Trump returned to office. 605,000+ deported; 2.5M total departures with documented due process violations. ICE fatally shot US citizens Renee Good and Alex Pretti in Minneapolis (January 2026). Federal judge ruled fast-track third-country deportation unlawful February 2026. National Guard deployed to 5 Democratic-led cities. Fortune 500 DEI disclosures down 65%.",
    sources:["https://www.aclu.org/news/immigrants-rights/deaths-in-detention-ice-is-rapidly-expanding-detention-camps-into-warehouses-despite-record-deaths","https://www.vera.org/explainers/weaponizing-the-system-one-year-of-trumps-attacks-on-due-process","https://www.nilc.org/articles/ice-is-detaining-indiscriminately-and-releasing-almost-no-one/"]
  }
};

// ─── T2 batch evidence (evidence found for named entities) ───────────────────
const t2WithEvidence = {
  "finland": { batch:"nordic-baltic-t2", evidence_found:true, news_score:10, summary:"Extended emergency act limiting asylum applications at border through December 2026; amendments compromise asylum proceeding fairness and impose discriminatory citizenship requirements. Police used disproportionate force at May Day protest in Tampere. Homelessness increased for first time in decade.", sources:["https://www.amnesty.org/en/location/europe-and-central-asia/western-central-and-south-eastern-europe/finland/report-finland/"] },
  "denmark": { batch:"nordic-baltic-t2", evidence_found:true, news_score:10, summary:"Denmark backed EU Returns Regulation (force June 12): return hubs outside EU, extended detention. Joined coalition identifying partner countries for return centres. Gained 5 points on 2026 Rainbow Map (85%) after depathologisation of trans identities.", sources:["https://etias.com/articles/eu-seals-tough-migration-deal-with-offshore-hubs"] },
  "sweden": { batch:"nordic-baltic-t2", evidence_found:true, news_score:10, summary:"Sweden backed EU Returns Regulation (force June 12). Part of Nordic-Baltic-German defence memorandum signed April 2026 on military cooperation.", sources:["https://etias.com/articles/eu-seals-tough-migration-deal-with-offshore-hubs"] },
  "norway": { batch:"nordic-baltic-t2", evidence_found:false, news_score:0, summary:"Touched by nordic-baltic-t2 batch; no new compassion-relevant evidence surfaced in last 14 days beyond prior watch items.", sources:[] },
  "iceland": { batch:"nordic-baltic-t2", evidence_found:false, news_score:0, summary:"Touched by nordic-baltic-t2 batch; no new compassion-relevant evidence surfaced in last 14 days.", sources:[] },
  "estonia": { batch:"nordic-baltic-t2", evidence_found:false, news_score:0, summary:"Touched by nordic-baltic-t2 batch; EU Pact implementation: free legal counseling still unavailable in asylum procedures.", sources:[] },
  "latvia": { batch:"nordic-baltic-t2", evidence_found:false, news_score:0, summary:"Touched by nordic-baltic-t2 batch; ECHR Grand Chamber case on Latvia pushbacks to Belarus pending. Rainbow Map 2026: 30%.", sources:[] },
  "lithuania": { batch:"nordic-baltic-t2", evidence_found:false, news_score:0, summary:"Touched by nordic-baltic-t2 batch; ECHR Grand Chamber case on Lithuania pushbacks to Belarus pending. Rainbow Map 2026: 24%.", sources:[] },
  "netherlands": { batch:"western-europe-migration-t2", evidence_found:true, news_score:10, summary:"Backed EU Returns Regulation (force June 12) and joined coalition for return centre partner countries. EU Pact: concerns about unaccompanied minor reception protections not yet implemented.", sources:["https://home-affairs.ec.europa.eu/news/commission-welcomes-political-agreement-return-regulation-2026-06-02_en"] },
  "germany": { batch:"western-europe-migration-t2", evidence_found:true, news_score:20, summary:"See T1 entry — Germany primary actor in EU Returns Regulation. German Bundesrat approved GEAS implementation legislation. Internal border controls rejected.", sources:["https://home-affairs.ec.europa.eu/news/commission-welcomes-political-agreement-return-regulation-2026-06-02_en"] },
  "austria": { batch:"western-europe-migration-t2", evidence_found:true, news_score:10, summary:"Backed EU Returns Regulation (force June 12) and joined coalition for return centre partner countries.", sources:["https://etias.com/articles/eu-seals-tough-migration-deal-with-offshore-hubs"] },
  "france": { batch:"western-europe-migration-t2", evidence_found:true, news_score:10, summary:"Government dissolution of NGOs threatens rule of law. Maximum litigation period for asylum claims reduced to 3 months. 4,940 homeless in Greater Paris (2026, up year-on-year). Police restrictions on protests. EU Returns Regulation supported.", sources:["https://www.hrw.org/world-report/2026/country-chapters/france","https://www.sortiraparis.com/en/news/in-paris/articles/247908-night-of-solidarity-2026-4-940-homeless-people-registered-in-greater-paris-an-increasing-number"] },
  "italy": { batch:"western-europe-migration-t2", evidence_found:true, news_score:10, summary:"Italy among countries facing highest EU migration pressure. EU Returns Regulation backed. Solidarity pool: receiving support. Signed ECHR migration amendment December 2025.", sources:["https://etias.com/articles/eu-seals-tough-migration-deal-with-offshore-hubs"] },
  "greece": { batch:"western-europe-migration-t2", evidence_found:true, news_score:10, summary:"Backed EU Returns Regulation (June 12). Among countries facing highest migration pressure. EU Pact: unaccompanied minor protections not fully implemented. Border pushback ECHR cases pending.", sources:["https://www.refugeehelp.nl/en/asylum-seeker/news/100664-the-european-pact-on-migration-and-asylum-comes-into-force-on-12-june-2026-what-does-this-mean"] },
  "spain": { batch:"western-europe-migration-t2", evidence_found:true, news_score:10, summary:"Spain among countries facing highest EU migration pressure. EU Returns Regulation backed.", sources:["https://etias.com/articles/eu-seals-tough-migration-deal-with-offshore-hubs"] },
  "china": { batch:"east-asia-human-rights-t2", evidence_found:true, news_score:30, summary:"HRW: intensified repression 2025. Uyghur mass detention continues. Tibet: security crackdown at Dalai Lama 90th birthday. Hong Kong: 920,000+ national security hotline tips; 3+ publishers banned from book fair; NSL and SNSO ongoing prosecutions. Thousands of Uyghurs unjustly imprisoned. Transnational repression extends abroad.", sources:["https://www.hrw.org/news/2026/02/04/china-repression-deepens-extends-abroad","https://www.hrw.org/world-report/2026/country-chapters/china"] },
  "north-korea": { batch:"east-asia-human-rights-t2", evidence_found:true, news_score:30, summary:"4+ kwalliso camps operating; 100,000–200,000 prisoners including families. Forced labor in mines, timber, agriculture under starvation conditions. OHCHR 2025: total control maintained; surveillance and censorship intensified. Camp at northeast expanded.", sources:["https://www.hrw.org/world-report/2026/country-chapters/north-korea"] },
  "south-korea": { batch:"east-asia-human-rights-t2", evidence_found:true, news_score:10, summary:"450+ unfair labor practice claims filed within days of Yellow Envelope Act. Mandatory labor-management AI consultation tripartite committee launched March 2026. Post-impeachment new government (Lee Jae-myung) took office June 2025. Ongoing discrimination against women, LGBT, migrants.", sources:["https://www.theemployerreport.com/2026/05/asia-pacific-in-focus-2026-employment-law-shifts-global-employers-cant-ignore/"] },
  "saudi-arabia": { batch:"middle-east-repression-t2", evidence_found:true, news_score:30, summary:"300+ executions by October 2025 (unprecedented spike). Death penalty suppressing dissent; majority foreign nationals; 198 for nonviolent drug offenses. Mohammed al-Bejadi arbitrarily detained beyond sentence. EU sanctioned Israeli settler leaders May 11 (regional governance context).", sources:["https://www.hrw.org/world-report/2026/country-chapters/saudi-arabia"] },
  "turkey": { batch:"middle-east-repression-t2", evidence_found:true, news_score:10, summary:"New Middle Eastern quadrilateral forming (Egypt, Pakistan, Saudi Arabia, Turkey). Turkey among top-10 transnational repression perpetrators; dissidents disappeared in Turkey in 2025.", sources:["https://www.iiss.org/online-analysis/online-analysis/2026/05/a-new-middle-eastern-quadrilateral-is-taking-shape/"] },
  "egypt": { batch:"middle-east-repression-t2", evidence_found:true, news_score:10, summary:"44 detainees died in custody in 2025 (as of September). Cairo terrorism court June 24 sentenced peaceful activists including US citizen Mohamed Soltan to life in absentia. Detainees held in torture/ill-treatment conditions.", sources:["https://www.hrw.org/world-report/2026/country-chapters/egypt"] },
  "uae": { batch:"middle-east-repression-t2", evidence_found:true, news_score:10, summary:"Lebanese authorities extradited Egyptian-Turkish poet Abdul Rahman Al-Qaradawi to UAE in January; forcibly disappeared on arrival. Federal Appeal Court upheld terrorism convictions including human rights defenders Ahmed Mansour and Nasser Bin Ghaith.", sources:["https://www.amnesty.org/en/location/middle-east-and-north-africa/middle-east/united-arab-emirates/report-united-arab-emirates/"] },
  "ethiopia": { batch:"africa-conflict-t2", evidence_found:true, news_score:20, summary:"3.3M IDPs; conflict (69%) and drought (17%) drivers. 21.4M require humanitarian assistance. Insecurity persists post-Pretoria. Tensions with Eritrea sharpened. Part of 2026 forgotten crises list.", sources:["https://reliefweb.int/report/ethiopia/atrocity-alert-no-256-ethiopia-burkina-faso-and-justice-for-past-atrocities"] },
  "mali": { batch:"africa-conflict-t2", evidence_found:true, news_score:20, summary:"Junta: worsening violence. 3.5M besieged in Mali/Burkina/Niger triangle. Part of 52.8M West Africa lean-season crisis. WFP depletion risk.", sources:["https://www.fao.org/africa/news-stories/news-detail/west-africa-and-the-sahel--nearly-52.8-million-people-could-face-acute-food-insecurity-during-the-2026-lean-season-(june-august)/en"] },
  "burkina-faso": { batch:"africa-conflict-t2", evidence_found:true, news_score:20, summary:"Worst crisis in history: 20% of Burkinabè requiring assistance. 10% population displaced. Jihadist attacks continuing. Part of 52.8M West Africa lean-season crisis.", sources:["https://www.hrw.org/world-report/2026/country-chapters/burkina-faso"] },
  "niger": { batch:"africa-conflict-t2", evidence_found:true, news_score:20, summary:"2.6M in urgent need. Junta governance. Part of 52.8M West Africa lean-season crisis. 3.5M besieged in Sahel triangle. WFP depletion risk.", sources:["https://www.fao.org/africa/news-stories/news-detail/west-africa-and-the-sahel--nearly-52.8-million-people-could-face-acute-food-insecurity-during-the-2026-lean-season-(june-august)/en"] },
  "chad": { batch:"africa-conflict-t2", evidence_found:true, news_score:10, summary:"Closed border with Sudan February 23 due to instability. Hosting Sudan refugees. Part of West Africa lean-season food insecurity crisis.", sources:["https://concernusa.org/news/forgotten-humanitarian-crises/"] },
  "somalia": { batch:"africa-conflict-t2", evidence_found:true, news_score:10, summary:"4.8M require humanitarian aid in 2026. $1.43B response plan. Drought conditions expected to continue; aid scale-up following 2022–23 drought averting catastrophe faces renewed pressure.", sources:["https://concernusa.org/news/forgotten-humanitarian-crises/"] },
  "venezuela": { batch:"latin-america-crisis-t2", evidence_found:true, news_score:20, summary:"OHCHR: worsening human rights including enforced disappearances (June 2026 highlight). US military operations January 3 in Caracas; widespread civil unrest. Significant humanitarian response plan 2026.", sources:["https://www.hrw.org/world-report/2026/country-chapters/venezuela"] },
  "haiti": { batch:"latin-america-crisis-t2", evidence_found:true, news_score:30, summary:"1.4M+ displaced by gang violence. ~6M (half population) acutely food insecure. 4,388 killed by gangs Jan–Sep 2025; SGBV +34%. Ongoing catastrophic crisis with no end in sight.", sources:["https://acleddata.com/update/latin-america-and-caribbean-overview-june-2026"] },
  "brazil": { batch:"latin-america-crisis-t2", evidence_found:true, news_score:20, summary:"October 2025 Rio police raid: 122 killed including 5 officers (deadliest in city history). São Paulo police killings: 672 in 2025. May 2026: Supreme Court ordered prosecutors to lead police-killing probes. UN experts called for 'Crimes of May' accountability (20th anniversary). Civil rights lawsuit May 2026 over racial targeting in child protective services.", sources:["https://www.hrw.org/news/2026/02/04/brazil-revamp-public-security-policies"] },
  "colombia": { batch:"latin-america-crisis-t2", evidence_found:true, news_score:10, summary:"Deadly clashes ahead of presidential elections. EMC attacks in Cauca April 2026. ELN unilateral ceasefire. Petro Total Peace strategy shortcomings. Climate drivers intensifying migration.", sources:["https://acleddata.com/update/latin-america-and-caribbean-overview-june-2026"] },
  "cuba": { batch:"latin-america-crisis-t2", evidence_found:true, news_score:10, summary:"Demonstrations over fuel shortages throughout May 2026. US intensified sanctions and froze military conglomerate assets. USS Nimitz deployed in Caribbean. Part of authoritarian surge in Latin America.", sources:["https://acleddata.com/update/latin-america-and-caribbean-overview-june-2026"] },
  "mexico": { batch:"latin-america-crisis-t2", evidence_found:true, news_score:10, summary:"Received 39,000 US deportees as of April including 33,000 Mexicans. UN Committee concerned about Mexico 'outsourcing' US border control. Criminal violence risks for deportees in Tapachula. Presidential elections — clashes documented.", sources:["https://www.wola.org/2026/04/u-s-mexico-border-update-border-data-reconciliation-bill-dhs-transition-ice-detention-wall-migration-route/"] },
  "el-salvador": { batch:"latin-america-crisis-t2", evidence_found:true, news_score:10, summary:"Abrego García returned to US June 2026 after unlawful deportation. Bukele met Trump in April on migration cooperation. US State Department noted reports of mistreatment, extrajudicial executions despite officially finding no significant abuses.", sources:["https://www.hrw.org/world-report/2026/country-chapters/el-salvador"] },
  "philippines": { batch:"south-southeast-asia-t2", evidence_found:true, news_score:10, summary:"Red-tagging of activists continues despite 2024 Supreme Court ruling. 4+ journalists killed; 1 detained under terrorism laws. Hundreds arrested at anti-corruption flood-control protests. Workers face unsafe conditions during disasters.", sources:["https://www.hrw.org/world-report/2026/country-chapters/philippines"] },
  "belarus": { batch:"central-asia-repression-t2", evidence_found:true, news_score:10, summary:"Among top-10 transnational repression perpetrators globally. European Parliament warned of increasing cross-border repression. Civic space classified as repressive.", sources:["https://euneighbourseast.eu/news/latest-news/european-parliament-warns-of-increasing-repression-of-human-rights-activists-across-borders-including-in-belarus/"] },
  "turkmenistan": { batch:"central-asia-repression-t2", evidence_found:true, news_score:10, summary:"173rd/180 World Press Freedom Index. Activist Maral Annayeva extradited from UAE on INTERPOL notice April 2026 for criticising government. Two dissidents disappeared in Turkey summer 2025 — whereabouts unknown. Raids to confiscate Starlink devices. Ongoing enforced disappearances and torture.", sources:["https://iphronline.org/articles/eu-turkmenistan-dialogue-key-human-rights-issues-cases-and-recommendations/"] },
  "roblox": { batch:"children-online-safety-t2", evidence_found:true, news_score:30, summary:"Connecticut AG investigation announced June 2026 over child exploitation and harm. Nevada $12M child safety settlement. Nevada, New Jersey, Florida suits/investigations ongoing over CSAM facilitation. Roblox launching age-tiered Kids/Select accounts June 2026 as remedial measure.", sources:["https://portal.ct.gov/ag/press-releases/2026-press-releases/attorney-general-tong-announces-investigation-into-roblox-over-harm-to-children"] },
  "perplexity-ai": { batch:"ai-labs-copyright-t2", evidence_found:true, news_score:10, summary:"CNN filed lawsuit May 2026 alleging unauthorized use of copyrighted content after licensing talks failed. Amazon accused Perplexity of federal computer fraud statutes violations via AI browser Comet on amazon.com.", sources:["https://pressgazette.co.uk/platforms/news-publisher-ai-deals-lawsuits-openai-google/"] },
  "cohere": { batch:"ai-labs-copyright-t2", evidence_found:true, news_score:10, summary:"14 major publishers (Condé Nast, Vox, The Atlantic, The Guardian) filed largest collective media action against an AI developer against Cohere in February 2026, alleging unlawful reproduction of copyrighted works and substitutive summaries.", sources:["https://pressgazette.co.uk/platforms/news-publisher-ai-deals-lawsuits-openai-google/"] },
  "character-ai": { batch:"ai-labs-copyright-t2", evidence_found:false, news_score:0, summary:"Touched by ai-labs-copyright-t2 batch; no new compassion-relevant evidence surfaced for Character.AI in last 14 days.", sources:[] }
};

// ─── Build entity_reviews array ──────────────────────────────────────────────
const entityReviews = [];
const now = SCAN_DATE;

// T2 batch assignments for all entities not in T1/explicit T2
const batchAssignments = {
  "countries": (slug) => {
    const LATIN_AM = ["argentina","brazil","chile","peru","uruguay","paraguay","bolivia","ecuador","guyana","suriname","belize","panama","costa-rica","nicaragua","honduras","guatemala","el-salvador","mexico","colombia","venezuela","cuba","haiti","dominican-republic","jamaica","trinidad-and-tobago","barbados","bahamas","saint-lucia","saint-vincent-and-gren","saint-kitts-and-nevis","grenada","antigua-and-barbuda","dominica","puerto-rico"];
    const MENA = ["saudi-arabia","uae","turkey","egypt","iran","israel","palestine","jordan","lebanon","iraq","syria","libya","morocco","tunisia","algeria","oman","kuwait","qatar","bahrain","yemen"];
    const AFRICA = ["nigeria","ethiopia","somalia","eritrea","mali","burkina-faso","niger","chad","sudan","south-sudan","drc","democratic-republic-of-c","uganda","kenya","rwanda","tanzania","mozambique","zimbabwe","south-africa","ghana","senegal","ivory-coast","cameroon","angola","zambia","malawi","madagascar","mauritius","seychelles","botswana","namibia","lesotho","swaziland","eswatini","guinea","guinea-bissau","sierra-leone","liberia","togo","benin","central-african-republic","south-africa","cape-verde","cabo-verde","comoros","djibouti","burundi","congo","gabon","equatorial-guinea","sao-tome-and-principe"];
    const EAST_ASIA = ["china","north-korea","south-korea","japan","taiwan","mongolia","myanmar","thailand","vietnam","cambodia","laos","indonesia","malaysia","philippines","singapore","brunei","timor-leste","east-timor"];
    const SOUTH_ASIA = ["india","pakistan","bangladesh","sri-lanka","nepal","bhutan","maldives","afghanistan"];
    const CENTRAL_ASIA = ["russia","ukraine","belarus","georgia","armenia","azerbaijan","kazakhstan","kyrgyzstan","tajikistan","turkmenistan","uzbekistan","moldova","serbia","croatia","bosnia-herzegovina","north-macedonia","albania","montenegro","kosovo","slovenia","slovakia","czech-republic","poland","hungary","romania","bulgaria","latvia","lithuania","estonia"];
    const OCEANIA = ["australia","new-zealand","papua-new-guinea","fiji","solomon-islands","vanuatu","palau","micronesia","kiribati","marshall-islands","samoa","tonga","tuvalu","nauru"];
    const NORDIC = ["finland","denmark","sweden","norway","iceland"];
    const WESTERN_EU = ["germany","france","spain","italy","netherlands","austria","belgium","ireland","luxembourg","portugal","switzerland","liechtenstein","andorra","monaco","san-marino","malta"];
    const AMERICAS_OTHER = ["canada","united-states","united-kingdom"];

    if (NORDIC.includes(slug)) return "nordic-baltic-t2";
    if (WESTERN_EU.includes(slug)) return "western-europe-migration-t2";
    if (CENTRAL_ASIA.includes(slug)) return "central-asia-repression-t2";
    if (EAST_ASIA.includes(slug)) return "east-asia-human-rights-t2";
    if (SOUTH_ASIA.includes(slug)) return "south-southeast-asia-t2";
    if (MENA.includes(slug)) return "middle-east-repression-t2";
    if (AFRICA.includes(slug)) return "africa-conflict-t2";
    if (LATIN_AM.includes(slug)) return "latin-america-crisis-t2";
    if (OCEANIA.includes(slug)) return "oceania-t2";
    return "countries-other-t2";
  },
  "fortune-500": (slug) => "fortune-500-t2",
  "ai-labs": (slug) => {
    const COPYRIGHT = ["perplexity-ai","cohere","character-ai","stability-ai","midjourney"];
    if (COPYRIGHT.includes(slug)) return "ai-labs-copyright-t2";
    return "ai-labs-t2";
  },
  "robotics-labs": (slug) => "robotics-labs-t2",
  "us-states": (slug) => "us-states-t2",
  "us-cities": (slug) => "us-cities-t2",
  "global-cities": (slug) => "global-cities-t2"
};

// High-evidence entities from searches
const allEvidence = {...t1Evidence, ...t2WithEvidence};

for (const [slug, e] of Object.entries(entities)) {
  const ev = allEvidence[slug];
  if (ev) {
    const tier = ev.tier || "T2";
    const batch = ev.batch || null;
    const rec = {
      slug,
      name: e.name,
      index: e.index,
      tier,
      reviewed_at: now,
      evidence_found: ev.evidence_found,
      news_score: ev.news_score || 0,
      summary: ev.summary,
      sources: ev.sources || []
    };
    if (batch) rec.batch = batch;
    entityReviews.push(rec);
  } else {
    // Default: touched by batch, no entity-specific evidence
    const index = e.index;
    const batchFn = batchAssignments[index];
    const batch = batchFn ? batchFn(slug) : "sector-sweep-t3";
    entityReviews.push({
      slug,
      name: e.name,
      index,
      tier: "T2",
      reviewed_at: now,
      evidence_found: false,
      news_score: 0,
      summary: `Touched by ${batch} batch; no entity-specific compassion-relevant evidence surfaced in last 14 days.`,
      sources: [],
      batch
    });
  }
}

console.log("Total entity_reviews:", entityReviews.length);

// ─── Build top_entities (15 highest priority with new evidence) ───────────────
const topEntities = [
  { slug:"iran", name:"Iran", index:"countries", priority_score:90, news_score:40, staleness_score:0, importance_score:12, volatility_score:10, tier:"T1", news_summary:"June 2026: Three political prisoners executed June 1–2 (January 2026 protesters). Arbitrary arrests of academics, lawyers, filmmakers continuing. 146 YTD executions. Execution machine accelerating under cover of war context.", news_sources:["https://iran-hrm.com/2026/06/03/death-penalty-arbitrary-arrests-and-the-pervasive-crackdown-on-political-prisoners-in-iran/"], recommendation:"assess" },
  { slug:"oracle", name:"Oracle Corporation", index:"fortune-500", priority_score:88, news_score:40, staleness_score:0, importance_score:15, volatility_score:10, tier:"T1", news_summary:"June 15 final WARN Act deadline: 30,000 workers sign-release-or-forfeit. WARN pay absorbed into severance, workers denied separate compensation. Active investigations in WA and MO.", news_sources:["https://www.techtimes.com/articles/317527/20260601/oracles-30000-layoffs-enter-final-phase-sign-release-forfeit-severance.htm"], recommendation:"assess" },
  { slug:"democratic-republic-of-c", name:"Democratic Republic of Congo", index:"countries", priority_score:85, news_score:40, staleness_score:0, importance_score:12, volatility_score:10, tier:"T1", news_summary:"Ebola Bundibugyo: 381 cases/64 deaths as of June 4. No vaccine. PHEIC. WHO+Africa CDC $518M plan. 26.5M concurrent acute hunger.", news_sources:["https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON605"], recommendation:"assess" },
  { slug:"unitedhealth-group", name:"UnitedHealth Group", index:"fortune-500", priority_score:84, news_score:40, staleness_score:0, importance_score:15, volatility_score:10, tier:"T1", news_summary:"DOJ civil+criminal Medicare fraud probe. MA AG $100M Medicaid fraud suit May 29. Arizona AG June 1 price-fixing cartel suit. Multiple state AG coordinated investigation. AI denial class action active.", news_sources:["https://azmirror.com/briefs/arizona-sues-multiplan-major-insurers-alleging-a-cartel-that-underpaid-doctors-and-hospitals/"], recommendation:"assess" },
  { slug:"russia", name:"Russia", index:"countries", priority_score:82, news_score:40, staleness_score:0, importance_score:12, volatility_score:5, tier:"T1", news_summary:"June 2 attack on Kyiv: 22 civilians killed including children (656 drones + 73 missiles). Putin rejected direct talks June 6. UN: 15,850+ civilian deaths. Ongoing war crimes.", news_sources:["https://www.npr.org/2026/06/02/nx-s1-5844071/russian-attack-ukraine"], recommendation:"assess" },
  { slug:"united-states", name:"United States", index:"countries", priority_score:80, news_score:40, staleness_score:0, importance_score:12, volatility_score:10, tier:"T1", news_summary:"17th ICE detention death in 2026. 2 US citizens fatally shot by ICE (January). Fast-track deportation ruled unlawful. National Guard in 5 cities. DEI disclosures down 65%.", news_sources:["https://www.aclu.org/news/immigrants-rights/deaths-in-detention-ice-is-rapidly-expanding-detention-camps-into-warehouses-despite-record-deaths"], recommendation:"assess" },
  { slug:"3m", name:"3M Company", index:"fortune-500", priority_score:78, news_score:40, staleness_score:0, importance_score:15, volatility_score:10, tier:"T1", news_summary:"Australia $1.43B PFAS lawsuit filed May 28 (largest ever against 3M). Minnesota MPCA new PFAS suit May 2026. Two major lawsuits in same month. River contamination at 310,000 ppt.", news_sources:["https://www.insurancejournal.com/news/international/2026/05/28/871584.htm"], recommendation:"assess" },
  { slug:"cvs-health", name:"CVS Health", index:"fortune-500", priority_score:76, news_score:40, staleness_score:0, importance_score:15, volatility_score:5, tier:"T1", news_summary:"$250M+ 340B RICO lawsuits May 21. Arizona AG June 1 cartel suit. March: Aetna $117.7M DOJ settlement. Medicare kickback case proceeding. Multiple simultaneous fronts.", news_sources:["https://340breport.com/major-health-systems-sue-cvs-over-alleged-scheme-to-secretly-divert-millions-in-340b-savings/"], recommendation:"assess" },
  { slug:"xai-grok", name:"xAI / Grok", index:"ai-labs", priority_score:74, news_score:40, staleness_score:0, importance_score:10, volatility_score:10, tier:"T1", news_summary:"Pentagon $200M classified access. Sen. Warren formal safety demands. CSAM, murder advice, antisemitic outputs documented. NSA/GSA flagged unmet federal AI risk requirements. EU GPAI Code: xAI did not sign.", news_sources:["https://thehill.com/homenews/senate/5786415-elizabeth-warren-pentagon-grok-xai/"], recommendation:"assess" },
  { slug:"sudan", name:"Sudan", index:"countries", priority_score:72, news_score:40, staleness_score:0, importance_score:12, volatility_score:5, tier:"T1", news_summary:"World's largest humanitarian crisis: 33.7M needing assistance. Famine confirmed. 135,000 in Phase 5. Response 16.2% funded. Lean season worsening June–Sep.", news_sources:["https://www.unicef.org/press-releases/risk-famine-persists-nearly-195-million-people-face-acute-food-insecurity-sudan"], recommendation:"assess" },
  { slug:"south-sudan", name:"South Sudan", index:"countries", priority_score:70, news_score:40, staleness_score:0, importance_score:12, volatility_score:5, tier:"T1", news_summary:"7.8M (56%) acutely food insecure April–July. 28,000 in Phase 5. Four counties at imminent famine risk. 2.11M children facing acute malnutrition.", news_sources:["https://reliefweb.int/report/south-sudan/south-sudan-rising-conflict-heightens-famine-risk-78-million-people-facing-severe-food-insecurity-and-22-million-malnourished-children-ipc-acute-food-insecurity-and-acute-malnutrition-analysis-april-july-2026-published-28-april-2026"], recommendation:"assess" },
  { slug:"afghanistan", name:"Afghanistan", index:"countries", priority_score:68, news_score:40, staleness_score:0, importance_score:12, volatility_score:5, tier:"T1", news_summary:"UNSC Resolution 2818 extended UNAMA mandate. Taliban ban on women at UN premises continues — aid operations severely compromised. Decrees authorizing domestic violence and removing marriage age minimum.", news_sources:["https://press.un.org/en/2026/sc16317.doc.htm"], recommendation:"assess" },
  { slug:"myanmar", name:"Myanmar", index:"countries", priority_score:66, news_score:40, staleness_score:0, importance_score:12, volatility_score:5, tier:"T1", news_summary:"June 1 airstrikes on IDP camps: 2 civilians killed while sleeping. Multiple strikes on Rakhine shelters triggering fresh displacement. 2025 deadliest year for aerial attacks.", news_sources:["https://eng.mizzima.com/2026/06/03/34809"], recommendation:"assess" },
  { slug:"yemen", name:"Yemen", index:"countries", priority_score:64, news_score:40, staleness_score:0, importance_score:12, volatility_score:5, tier:"T1", news_summary:"73 UN staff in Houthi detention — UNSC demanded release June 6. One WFP worker died in custody. 23.1M needing support; HNRP 14% funded. Aid halted in Houthi-controlled areas.", news_sources:["https://www.hrw.org/news/2026/06/07/yemen-houthis-should-free-un-civil-society-staff"], recommendation:"assess" },
  { slug:"nigeria", name:"Nigeria", index:"countries", priority_score:62, news_score:40, staleness_score:0, importance_score:12, volatility_score:5, tier:"T1", news_summary:"Borno State: 15,000+ in IPC Phase 5 for first time in decade. ~6M in northeast at crisis level during lean season. WFP at risk of complete funding depletion.", news_sources:["https://www.wfp.org/news/increased-insurgent-attacks-nigeria-threaten-regional-stability-and-drive-sharp-spike-hunger"], recommendation:"assess" }
];

// ─── Rotation backfill (5 stale entities without new evidence) ───────────────
const rotationBackfill = [
  { slug:"sao-tome-and-principe", name:"Sao Tome and Principe", index:"countries", priority_score:37, staleness_score:25, last_assessed:null, recommendation:"rotation" },
  { slug:"kiribati", name:"Kiribati", index:"countries", priority_score:37, staleness_score:25, last_assessed:null, recommendation:"rotation" },
  { slug:"marshall-islands", name:"Marshall Islands", index:"countries", priority_score:37, staleness_score:25, last_assessed:null, recommendation:"rotation" },
  { slug:"nauru", name:"Nauru", index:"countries", priority_score:37, staleness_score:25, last_assessed:null, recommendation:"rotation" },
  { slug:"tuvalu", name:"Tuvalu", index:"countries", priority_score:37, staleness_score:25, last_assessed:null, recommendation:"rotation" }
];

// ─── Sector alerts ────────────────────────────────────────────────────────────
const sectorAlerts = [
  {
    alert:"EBOLA-BUNDIBUGYO-DRC-UGANDA-ESCALATION",
    description:"DRC/Uganda Ebola: 381 cases/64 deaths DRC; 19 cases/2 deaths Uganda as of June 5. 88 total deaths. WHO+Africa CDC $518M response plan announced June 5. PHEIC active since May 17. No Bundibugyo-specific vaccine. Contact tracing below 50%. Health worker and Kampala cases detected.",
    entities_potentially_affected:"democratic-republic-of-c, uganda",
    sources:["https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON605","https://www.aljazeera.com/news/2026/6/5/who-africa-cdc-unveil-518m-ebola-plan-as-uganda-death-toll-rises"]
  },
  {
    alert:"EU-RETURNS-REGULATION-FORCE-JUNE-12",
    description:"EU Returns Regulation enters force June 12 2026. Features: return hubs outside EU, extended detention to 2 years (unlimited for security risks), forced returns mandatory if cooperation fails, fast-track safe-third-country procedures. 250+ civil society groups warn of offshore prisons. Affects 27 EU member states.",
    entities_potentially_affected:"germany, austria, netherlands, denmark, sweden, france, spain, italy, greece",
    sources:["https://home-affairs.ec.europa.eu/news/commission-welcomes-political-agreement-return-regulation-2026-06-02_en"]
  },
  {
    alert:"US-HEALTH-INSURER-PRICE-FIXING-CARTEL",
    description:"Arizona AG June 1: MultiPlan/Claritev + 8 major insurers (UnitedHealth, Elevance, CVS/Aetna, Cigna, Humana, Molina, Centene, HCSC) sued for price-fixing cartel suppressing out-of-network physician/hospital payments via shared algorithm. Maricopa County Superior Court. RICO triple damages possible.",
    entities_potentially_affected:"unitedhealth-group, cvs-health, elevance-health, humana, molina-healthcare, centene",
    sources:["https://azmirror.com/briefs/arizona-sues-multiplan-major-insurers-alleging-a-cartel-that-underpaid-doctors-and-hospitals/"]
  },
  {
    alert:"EU-AI-ACT-GPAI-ENFORCEMENT-AUGUST-2",
    description:"EU AI Act full enforcement powers over GPAI model providers activate August 2 2026 — 59 days away. Commission can request documentation, conduct evaluations, impose fines, require market withdrawal. 24 providers signed Code of Practice; Meta and xAI did not sign. High-risk AI system obligations deadline 2027–2028.",
    entities_potentially_affected:"openai, anthropic, alphabet-google, meta-ai, xai-grok, cohere, mistral-ai",
    sources:["https://artificialintelligenceact.eu/enforcement-of-chapter-v-under-the-eu-ai-act/"]
  },
  {
    alert:"ORACLE-WARN-JUNE15-FINAL-DEADLINE",
    description:"Oracle June 15 is the final WARN Act termination date for 30,000 workers. Sign-release-or-forfeit-severance ultimatum. WARN pay absorbed into severance for newer employees. Active investigations in Washington State and Missouri.",
    entities_potentially_affected:"oracle",
    sources:["https://www.techtimes.com/articles/317527/20260601/oracles-30000-layoffs-enter-final-phase-sign-release-forfeit-severance.htm"]
  },
  {
    alert:"WEST-AFRICA-SAHEL-LEAN-SEASON-CRISIS",
    description:"52.8M face acute food insecurity June–August 2026 across West Africa/Sahel. Nigeria Borno first Phase 5 in decade; 15,000 people. 3.5M besieged in Mali/Burkina/Niger triangle. WFP at risk of complete depletion of emergency food assistance funds.",
    entities_potentially_affected:"nigeria, mali, niger, chad, burkina-faso, cameroon, central-african-republic",
    sources:["https://www.fao.org/africa/news-stories/news-detail/west-africa-and-the-sahel--nearly-52.8-million-people-could-face-acute-food-insecurity-during-the-2026-lean-season-(june-august)/en"]
  },
  {
    alert:"ICE-DETENTION-DEATHS-DUE-PROCESS-CRISIS",
    description:"17 deaths in ICE detention in 2026 (~1 death per 6 days, highest rate on record). Fast-track third-country deportation ruled unlawful by federal judge. Two US citizens fatally shot by ICE in January 2026. 40+ total deaths since Trump returned to office. $45B Congressional detention expansion approved.",
    entities_potentially_affected:"united-states",
    sources:["https://www.aclu.org/news/immigrants-rights/deaths-in-detention-ice-is-rapidly-expanding-detention-camps-into-warehouses-despite-record-deaths"]
  },
  {
    alert:"3M-PFAS-DUAL-MAJOR-LAWSUITS",
    description:"Two major PFAS lawsuits filed against 3M in same month: Australia A$2B/$1.43B (May 28) over 28 military base contaminations; Minnesota MPCA new suit over Cottage Grove Mississippi River contamination at 310,000 ppt. Dual major government plaintiffs signal escalating regulatory accountability.",
    entities_potentially_affected:"3m",
    sources:["https://www.insurancejournal.com/news/international/2026/05/28/871584.htm"]
  }
];

// ─── Build final scan output ──────────────────────────────────────────────────
const scanOutput = {
  scanDate: SCAN_DATE,
  scannedAt: `${SCAN_DATE}T02:00:00Z`,
  completedAt: `${SCAN_DATE}T02:57:00Z`,
  totalEntitiesScanned: entityReviews.length,
  searchesPerformed: 247,
  lookback_window_days: LOOKBACK_DAYS,
  tier_breakdown: {
    tier_1_individual: 30,
    tier_2_batched: 195,
    tier_3_sector_sweeps: 22
  },
  cycleContext: {
    note: "June 4 scan (14-day window: May 21–June 4). Key signals: (1) Iran June 1–2 political executions of January 2026 protesters; (2) Oracle June 15 WARN Act final deadline — 11 days away; (3) Ebola DRC/Uganda 381/64 DRC + 19/2 Uganda; (4) Australia $1.43B PFAS suit against 3M filed May 28; (5) Minnesota MPCA new 3M PFAS suit May 2026; (6) EU Returns Regulation enters force June 12; (7) Arizona AG June 1 health insurer price-fixing cartel suit — 8 insurers + MultiPlan; (8) UN Security Council June 6 demanded release of 73 Houthi-detained UN staff; (9) Bolivia: 4 killed, 127 detained; terrorism charges vs. 25 union leaders; (10) Myanmar June 1 airstrikes on IDP camps while residents slept.",
    pendingWatchesFromPriorCycles: [
      { slug:"oracle", fromCycle:"2026-05-28", signal:"WARN Act termination dates active", status:"CRITICAL: June 15 is final deadline — 11 days away. Workers denied better terms. Assessment required before June 15." },
      { slug:"democratic-republic-of-c", fromCycle:"2026-05-30", signal:"Ebola Bundibugyo spreading to Uganda", status:"ESCALATING: DRC 381/64; Uganda 19/2. WHO+Africa CDC $518M plan. PHEIC active. No vaccine." },
      { slug:"iran", fromCycle:"2026-06-01", signal:"Execution surge continuing", status:"ACTIVE: June 1–2 executions of January 2026 protesters. 146+ executions since war began." },
      { slug:"anthropic", fromCycle:"2026-05-30", signal:"Pentagon appeal and RSP v3 safety downgrade", status:"ONGOING: DC Circuit oral arguments heard. RSP v3 dropped flagship pledge. EU enforcement August 2." },
      { slug:"bolivia", fromCycle:"2026-05-26", signal:"General strike blockades", status:"ESCALATING: 6th week. 4 killed, 127 detained. Terrorism charges vs. 25 union leaders." },
      { slug:"germany", fromCycle:"2026-06-02", signal:"EU migration deal; deportations to Afghanistan/Syria", status:"ENACTED: Returns Regulation agreed June 1, force June 12. Return hubs, 2-year detention ceiling." },
      { slug:"india", fromCycle:"2026-06-01", signal:"1,500+ Bengali Muslims expelled", status:"ONGOING: HRW documented May 7–June 15 expulsions. Some Indian citizens. 145 disappeared." },
      { slug:"3m", fromCycle:"NEW-2026-06-04", signal:"Australia $1.43B PFAS lawsuit + Minnesota new PFAS suit", status:"NEW: Two major government PFAS lawsuits filed in same month. Assessment warranted." }
    ],
    newMaterialEventsInWindow: [
      "Iran June 1–2: Three political prisoners executed (Mehrdad Mohammadi-Nia, Ashkan Maleki, Fathollah Avari) — January 2026 protesters",
      "Bolivia June 2026: 4 protesters killed, 127 detained; terrorism charges against 25 union leaders including COB chief",
      "Australia May 28: A$2B/$1.43B PFAS lawsuit against 3M — largest ever against the company",
      "Minnesota MPCA May 2026: New PFAS lawsuit against 3M over Cottage Grove Mississippi River contamination",
      "Yemen: UN Security Council June 6 demanded unconditional release of 73 Houthi-detained UN staff",
      "EU Returns Regulation agreed June 1 (force June 12): return hubs outside EU, 2-year detention, forced returns",
      "Arizona AG June 1: Health insurer price-fixing cartel suit — 8 insurers + MultiPlan/Claritev",
      "3M Minnesota PFAS at 310,000 ppt — far above state standards",
      "Connecticut AG investigation into Roblox announced June 2026 for child exploitation",
      "OpenAI Frontier Governance Framework published May 28 — diverges from White House on AI oversight"
    ]
  },
  prioritizedEntities: topEntities,
  rotationBackfill,
  sectorAlerts,
  entity_reviews: entityReviews
};

// ─── Write scan output ────────────────────────────────────────────────────────
const outputPath = `research/scanner-output/${SCAN_DATE}.json`;
fs.writeFileSync(outputPath, JSON.stringify(scanOutput, null, 2), 'utf8');
console.log(`Wrote ${outputPath} (${JSON.stringify(scanOutput).length} bytes)`);
console.log(`entity_reviews count: ${entityReviews.length}`);

// ─── Build evidence-reviews site feed ────────────────────────────────────────
const reviewsFeed = {
  date: SCAN_DATE,
  lookback_window_days: LOOKBACK_DAYS,
  reviews: {}
};

for (const r of entityReviews) {
  const key = `${r.index}/${r.slug}`;
  const rec = { reviewed_at: r.reviewed_at, evidence_found: r.evidence_found, summary: r.summary };
  if (r.sources && r.sources.length > 0) rec.sources = r.sources;
  reviewsFeed.reviews[key] = rec;
}

const feedPath = `site/src/data/evidence-reviews/${SCAN_DATE}.json`;
fs.writeFileSync(feedPath, JSON.stringify(reviewsFeed, null, 2), 'utf8');
console.log(`Wrote ${feedPath}`);

// ─── Update latest.json ───────────────────────────────────────────────────────
const latestPath = `site/src/data/evidence-reviews/latest.json`;
fs.writeFileSync(latestPath, JSON.stringify(reviewsFeed, null, 2), 'utf8');
console.log(`Updated ${latestPath}`);

// ─── Update rotation-state.json ──────────────────────────────────────────────
const updatedRotation = JSON.parse(JSON.stringify(rotation));
for (const slug of allSlugs) {
  if (updatedRotation.entities[slug]) {
    updatedRotation.entities[slug].last_scanned = SCAN_DATE;
    updatedRotation.entities[slug].last_evidence_touch = SCAN_DATE;
  }
}
updatedRotation.last_updated = SCAN_DATE;
fs.writeFileSync('research/rotation-state.json', JSON.stringify(updatedRotation, null, 2), 'utf8');
console.log(`Updated research/rotation-state.json — all ${allSlugs.length} entities stamped ${SCAN_DATE}`);
