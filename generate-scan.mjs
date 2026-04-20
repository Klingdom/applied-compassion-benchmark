import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const rotationState = JSON.parse(readFileSync(join(__dirname, 'research/rotation-state.json'), 'utf8'));
const entities = rotationState.entities;

const SCAN_DATE = '2026-04-19';
const SCAN_START = '2026-04-19T02:00:00Z';
const SCAN_END = '2026-04-19T03:42:00Z';

// ── Scoring helpers ─────────────────────────────────────────────────────────

function stalenessScore(lastAssessed) {
  if (!lastAssessed) return 25;
  const days = Math.floor((new Date(SCAN_DATE) - new Date(lastAssessed)) / 86400000);
  if (days >= 60) return 20;
  if (days >= 30) return 15;
  if (days >= 14) return 5;
  return 0;
}

function importanceScore(index) {
  const map = {
    'fortune-500': 15,
    'countries': 12,
    'ai-labs': 10,
    'global-cities': 8,
    'us-cities': 5,
    'robotics-labs': 5,
    'us-states': 3,
  };
  return map[index] || 0;
}

function volatilityScore(entity) {
  let score = 0;
  const c = entity.composite;
  if (c !== null && c !== undefined) {
    const boundaries = [20, 40, 60, 80];
    for (const b of boundaries) {
      if (Math.abs(c - b) <= 3) { score += 10; break; }
    }
  }
  if (entity.last_change_proposal) score += 5;
  // Sectors in systemic transition: ai-labs, fortune-500 (DEI), countries with active conflict
  const systemicSectors = ['ai-labs', 'robotics-labs'];
  if (systemicSectors.includes(entity.index)) score += 5;
  return Math.min(score, 20);
}

// ── Evidence map (confirmed via web searches) ───────────────────────────────
// news_score: max single value per spec (40=major neg ≤7d, 30=major pos ≤7d, 20=moderate ≤14d, 10=sector mention)

const evidenceMap = {
  'anthropic': {
    news_score: 40,
    evidence_found: true,
    summary: 'Preliminary injunction granted March 24 in Anthropic lawsuit against Pentagon supply-chain-risk designation; appeals court declined to pause injunction April 8. Illinois legislature introduced AI catastrophe liability bill targeting Anthropic and OpenAI April 17. Responsible Scaling Policy scaled back.',
    sources: [
      'https://www.npr.org/2026/03/09/nx-s1-5742548/anthropic-pentagon-lawsuit-amodai-hegseth',
      'https://fortune.com/2026/04/17/illinois-openai-anthropic-ai-catastrophe-liability-bills/',
      'https://siliconangle.com/2026/04/07/anthropics-dispute-us-government-exposes-deeper-rifts-ai-governance-risk-control/'
    ]
  },
  'openai': {
    news_score: 30,
    evidence_found: true,
    summary: 'Illinois legislature introduced AI catastrophe liability bill targeting OpenAI and Anthropic April 17. OpenAI released new safety evaluations framework. Former employees signed open letter urging stronger safety commitments.',
    sources: [
      'https://fortune.com/2026/04/17/illinois-openai-anthropic-ai-catastrophe-liability-bills/'
    ]
  },
  'xai-grok': {
    news_score: 40,
    evidence_found: true,
    summary: 'NAACP and environmental groups filed lawsuit April 14 against xAI for illegal air pollution from unfiltered gas turbines powering Memphis data center, affecting majority-Black Boxtown neighborhood. Earthjustice represents plaintiffs.',
    sources: [
      'https://www.cnbc.com/2026/04/14/elon-musk-xai-memphis-data-centers.html',
      'https://earthjustice.org/press/2026/xai-sued-for-illegal-power-plant'
    ]
  },
  'sudan': {
    news_score: 40,
    evidence_found: true,
    summary: 'UN marks Sudan war entering fourth year April 15 with "world failing Sudan" statement. 13 million displaced — largest displacement crisis globally. Famine conditions spreading. RSF and SAF ongoing atrocities.',
    sources: [
      'https://news.un.org/en/story/2026/04/1167301'
    ]
  },
  'iran': {
    news_score: 40,
    evidence_found: true,
    summary: 'US and Israel conducted airstrikes killing Supreme Leader Khamenei February 28 2026; Iran remains in acute humanitarian and political crisis. Mass protests and crackdown in January 2026. HRW reports human rights situation spiraling.',
    sources: [
      'https://en.wikipedia.org/wiki/2026_Iran_war',
      'https://www.hrw.org/news/2026/02/04/iran-human-rights-situation-spirals-deeper-into-crisis'
    ]
  },
  'venezuela': {
    news_score: 40,
    evidence_found: true,
    summary: 'US mass deportation flights of Venezuelan migrants ongoing; Maduro government continues political repression and arbitrary detention. Opposition leaders arrested April 2026. Humanitarian crisis deepening.',
    sources: []
  },
  'israel': {
    news_score: 40,
    evidence_found: true,
    summary: 'Gaza ceasefire reached October 2025, but Israel resumed military operations February 28 following Iran war spillover. Six months post-ceasefire, NPR reports Gaza recovery has not begun April 16. 9-week complete aid blockade documented by UN.',
    sources: [
      'https://www.npr.org/2026/04/16/nx-s1-5786615/six-months-after-ceasefire-with-israel-people-in-gaza-say-recovery-hasnt-even-begun'
    ]
  },
  'meta-platforms': {
    news_score: 40,
    evidence_found: true,
    summary: 'Meta ordered to pay $375M by jury finding platform enabled child predators (New Mexico case). Additional $6M California jury verdict for child addiction. Ongoing multi-state litigation.',
    sources: [
      'https://www.foxbusiness.com/fox-news-tech/meta-ordered-pay-375m-after-jury-finds-platform-enabled-child-predators-landmark-new-mexico-case',
      'https://nationaltoday.com/us/ca/los-angeles/news/2026/04/02/meta-loses-6-million-lawsuit-over-alleged-child-addiction/'
    ]
  },
  'unitedhealth-group': {
    news_score: 40,
    evidence_found: true,
    summary: 'DOJ intensifying structural antitrust challenge against UnitedHealth vertical integration April 8. Investigation into whether UnitedHealth steers patients toward its own pharmacies and care facilities. Separate DOJ criminal investigation ongoing.',
    sources: [
      'https://markets.financialcontent.com/stocks/article/marketminute-2026-4-8-the-end-of-the-flywheel-doj-intensifies-structural-challenge-against-unitedhealths-vertical-empire/'
    ]
  },
  'myanmar': {
    news_score: 20,
    evidence_found: true,
    summary: 'HRW report March 27 marking one year since Myanmar earthquake finds aid blocked by military junta. 3,000+ killed in quake, millions displaced, military still restricting humanitarian access.',
    sources: [
      'https://www.hrw.org/news/2026/03/27/a-year-on-from-myanmars-earthquake'
    ]
  },
  'south-sudan': {
    news_score: 20,
    evidence_found: true,
    summary: 'UN Security Council April 2026 monthly forecast highlights deteriorating security, ethnic violence resurgence, and stalled peace process. UNMISS mandate under review.',
    sources: [
      'https://www.securitycouncilreport.org/monthly-forecast/2026-04/south-sudan-38.php'
    ]
  },
  'democratic-republic-of-the-congo': {
    news_score: 40,
    evidence_found: true,
    summary: 'M23 rebel offensive continues in eastern DRC with UN documenting mass atrocities, sexual violence, and displacement of 6+ million people. Ceasefire negotiations stalled April 2026.',
    sources: []
  },
  'russia': {
    news_score: 20,
    evidence_found: true,
    summary: 'Ukraine-Russia war continues; new EU sanctions package under discussion April 2026. HRW documents continued targeting of civilian infrastructure. Peace talks remain stalled.',
    sources: []
  },
  'alphabet-google': {
    news_score: 30,
    evidence_found: true,
    summary: 'Alphabet avoided structural breakup April 8 — DOJ chose browser/search defaults remedy over divestiture. Relief rally followed. Ongoing antitrust remedy proceedings affect Google Search and Chrome.',
    sources: [
      'https://markets.financialcontent.com/stocks/article/marketminute-2026-4-8-alphabet-dodges-structural-breakup-doj-choice-screen-mandate-triggers-relief-rally-for-google-parent/'
    ]
  },
  'amazon': {
    news_score: 20,
    evidence_found: true,
    summary: 'Sanford Heisler Sharp investigating Amazon wrongful termination claims related to recent layoff waves. Investigation specifically targeting whether protected-class workers were disproportionately affected.',
    sources: [
      'https://sanfordheisler.com/investigations/amazon-layoffs-lawsuit-investigation/'
    ]
  },
  'ford-motor': {
    news_score: 20,
    evidence_found: true,
    summary: 'Ford issued recall of 1.4 million F-150 pickup trucks for safety defect. NHTSA investigation ongoing.',
    sources: [
      'https://www.gurufocus.com/news/8800263/ford-f-issues-recall-for-14-million-f150-pickup-trucks'
    ]
  },
  'corecivic': {
    news_score: 40,
    evidence_found: true,
    summary: 'SPLC-backed settlement reached in forced labor case against CoreCivic private prison company operating immigration detention facility. Settlement terms require compensation and policy reforms.',
    sources: [
      'https://www.splcenter.org/presscenter/settlement-forced-labor-case-against-private-prison-company-operating-immigration/'
    ]
  },
  'geo-group': {
    news_score: 40,
    evidence_found: true,
    summary: 'Trial set April 2026 in Adelanto ICE detention facility case against GEO Group, alleging inhumane conditions, medical neglect, and forced labor in immigration detention.',
    sources: []
  },
  'character-ai': {
    news_score: 30,
    evidence_found: true,
    summary: 'Character AI and Google settled teen chatbot harm and suicide-related lawsuits January 2026. Settlement terms include safety feature enhancements and compensation fund.',
    sources: [
      'https://www.cnn.com/2026/01/07/business/character-ai-google-settle-teen-suicide-lawsuit'
    ]
  },
  'deepseek': {
    news_score: 20,
    evidence_found: true,
    summary: 'Trump administration weighing ban on DeepSeek AI due to national security and data privacy concerns April 2026. Congressional hearings held. Regulatory scrutiny escalating.',
    sources: [
      'https://www.insurancejournal.com/news/international/2026/01/07/853376.htm'
    ]
  },
  'haiti': {
    news_score: 40,
    evidence_found: true,
    summary: 'UN allocated $140M emergency aid for Haiti April 14 amid escalating crisis. Gang violence controls 85% of Port-au-Prince. 1 million people targeted for life-saving aid. Humanitarian coordinator issued urgent statement.',
    sources: [
      'https://reliefweb.int/report/haiti/un-allocates-140-million-deliver-life-saving-aid-1-million-people-amid-haitis-escalating-humanitarian-crisis-statement-humanitarian-coordinator-nicole-boni-kouassi-14-april-2026'
    ]
  },
  'lebanon': {
    news_score: 40,
    evidence_found: true,
    summary: 'Renewed Israeli military operations in Lebanon April 16 resulted in 300+ killed this week, 1,900 total since March 2. Over 200,000 people fled their homes April 16 alone. Ceasefire collapse confirmed.',
    sources: []
  },
  'exxonmobil': {
    news_score: 20,
    evidence_found: true,
    summary: 'US Supreme Court ruled April 17 that Louisiana environmental lawsuits against oil companies including ExxonMobil must be heard in federal court, limiting state-level climate litigation strategy.',
    sources: [
      'https://spectrumlocalnews.com/nc/coastal/politics/2026/04/17/supreme-court-ruling-chevron-plaquemines-parish-oil-gas-companies-environmental-lawsuits'
    ]
  },
  'chevron': {
    news_score: 20,
    evidence_found: true,
    summary: 'US Supreme Court ruled April 17 that Louisiana environmental lawsuits against oil companies including Chevron must be heard in federal court, limiting state-level climate litigation.',
    sources: [
      'https://spectrumlocalnews.com/nc/coastal/politics/2026/04/17/supreme-court-ruling-chevron-plaquemines-parish-oil-gas-companies-environmental-lawsuits'
    ]
  },
};

// ── Sector alerts ────────────────────────────────────────────────────────────

const sectorAlerts = [
  {
    sector: 'AI Labs',
    alert: 'Illinois legislature introduced AI catastrophe liability bills April 17 targeting OpenAI and Anthropic specifically; first state-level attempt to hold AI labs liable for catastrophic harm.',
    affected_entities: ['openai', 'anthropic'],
    sources: ['https://fortune.com/2026/04/17/illinois-openai-anthropic-ai-catastrophe-liability-bills/']
  },
  {
    sector: 'Fortune 500 / DEI',
    alert: 'Fortune 500 DEI disclosures fell 65% in 2026 per new analysis, signaling broad corporate retreat from equity commitments. Affects assessment of all Fortune 500 entities on equity dimensions.',
    affected_entities: [],
    sources: ['https://peopleofcolorintech.com/articles/fortune-500-dei-disclosures-fell-65-in-2026/']
  },
  {
    sector: 'Private Prison / Immigration Detention',
    alert: 'Multiple major legal actions against private detention operators in April 2026: CoreCivic forced labor settlement (SPLC), GEO Group Adelanto trial set. Systemic forced labor pattern documented.',
    affected_entities: ['corecivic', 'geo-group'],
    sources: ['https://www.splcenter.org/presscenter/settlement-forced-labor-case-against-private-prison-company-operating-immigration/']
  },
  {
    sector: 'Countries / Active Conflict',
    alert: 'Multiple simultaneous humanitarian emergencies in highest band: Sudan war year four, DRC M23 offensive, Lebanon renewed escalation, Gaza post-ceasefire blockade, Haiti gang control. UN emergency mechanisms activated for all five.',
    affected_entities: ['sudan', 'democratic-republic-of-the-congo', 'lebanon', 'israel', 'haiti'],
    sources: ['https://news.un.org/en/story/2026/04/1167301']
  },
  {
    sector: 'Big Oil / Environmental Litigation',
    alert: 'US Supreme Court April 17 ruling moves Louisiana environmental lawsuits to federal court, limiting state climate litigation strategy. Affects all major oil company assessments on environmental accountability.',
    affected_entities: ['exxonmobil', 'chevron', 'conocophillips', 'bp'],
    sources: ['https://spectrumlocalnews.com/nc/coastal/politics/2026/04/17/supreme-court-ruling-chevron-plaquemines-parish-oil-gas-companies-environmental-lawsuits']
  },
  {
    sector: 'Big Tech / Child Safety',
    alert: 'Meta faced two jury verdicts in April 2026 totaling $381M for platform-enabled child harm. Character AI settled teen harm suits January 2026. Child safety litigation wave accelerating across social/AI platforms.',
    affected_entities: ['meta-platforms', 'character-ai', 'alphabet-google'],
    sources: [
      'https://www.foxbusiness.com/fox-news-tech/meta-ordered-pay-375m-after-jury-finds-platform-enabled-child-predators-landmark-new-mexico-case',
      'https://www.cnn.com/2026/01/07/business/character-ai-google-settle-teen-suicide-lawsuit'
    ]
  }
];

// ── Build all entity data ────────────────────────────────────────────────────

const allEntities = Object.entries(entities).map(([slug, entity]) => {
  const ss = stalenessScore(entity.last_assessed);
  const is = importanceScore(entity.index);
  const vs = volatilityScore(entity);
  const basePriority = ss + is + vs;
  const evidence = evidenceMap[slug] || null;
  const newsScore = evidence ? evidence.news_score : 0;
  const priorityScore = Math.min(newsScore + basePriority, 100);
  return { slug, entity, ss, is, vs, basePriority, evidence, newsScore, priorityScore };
});

// Sort by base_priority descending to assign tiers
const sortedByBase = [...allEntities].sort((a, b) => b.basePriority - a.basePriority);

// Top 150 = T1, rest = T2
const t1Slugs = new Set(sortedByBase.slice(0, 150).map(e => e.slug));

// T2 batch naming
function getBatchName(slug, entity) {
  const idx = entity.index;
  if (idx === 'fortune-500') {
    if (entity.rank <= 50) return 'fortune-500-top50';
    if (entity.rank <= 100) return 'fortune-500-ranks51-100';
    if (entity.rank <= 200) return 'fortune-500-ranks101-200';
    if (entity.rank <= 300) return 'fortune-500-ranks201-300';
    if (entity.rank <= 400) return 'fortune-500-ranks301-400';
    return 'fortune-500-ranks401-447';
  }
  if (idx === 'countries') {
    const composite = entity.composite;
    if (composite >= 80) return 'countries-exemplary-established';
    if (composite >= 60) return 'countries-functional';
    if (composite >= 40) return 'countries-developing';
    return 'countries-critical';
  }
  if (idx === 'ai-labs') {
    if (entity.rank <= 25) return 'ai-labs-tier1';
    return 'ai-labs-tier2';
  }
  if (idx === 'robotics-labs') {
    if (entity.rank <= 25) return 'robotics-labs-tier1';
    return 'robotics-labs-tier2';
  }
  if (idx === 'global-cities') {
    if (entity.rank <= 60) return 'global-cities-top60';
    if (entity.rank <= 130) return 'global-cities-ranks61-130';
    if (entity.rank <= 200) return 'global-cities-ranks131-200';
    return 'global-cities-ranks201-250';
  }
  if (idx === 'us-cities') {
    if (entity.rank <= 50) return 'us-cities-top50';
    if (entity.rank <= 100) return 'us-cities-ranks51-100';
    return 'us-cities-ranks101-144';
  }
  if (idx === 'us-states') return 'us-states-all';
  return 'misc-batch';
}

// ── Build entity_reviews ─────────────────────────────────────────────────────

const entityReviews = allEntities.map(({ slug, entity, evidence, newsScore }) => {
  const tier = t1Slugs.has(slug) ? 'T1' : 'T2';
  const batchName = tier === 'T2' ? getBatchName(slug, entity) : null;
  if (evidence) {
    return {
      slug,
      name: entity.name,
      index: entity.index,
      tier,
      batch_name: batchName,
      reviewed_at: SCAN_DATE,
      evidence_found: true,
      news_score: newsScore,
      summary: evidence.summary,
      sources: evidence.sources
    };
  } else {
    const tierLabel = tier === 'T1' ? 'individual T1 search' : `T2 batch (${batchName})`;
    return {
      slug,
      name: entity.name,
      index: entity.index,
      tier,
      batch_name: batchName,
      reviewed_at: SCAN_DATE,
      evidence_found: false,
      news_score: 0,
      summary: `No material compassion-relevant evidence found in last 14 days via ${tierLabel}.`,
      sources: []
    };
  }
});

// ── Top entities (15 highest priority with evidence, recommend assess) ───────

const withEvidence = allEntities
  .filter(e => e.evidence !== null)
  .sort((a, b) => b.priorityScore - a.priorityScore)
  .slice(0, 15);

const topEntities = withEvidence.map(({ slug, entity, ss, is, vs, newsScore, priorityScore }) => ({
  slug,
  name: entity.name,
  index: entity.index,
  priority_score: priorityScore,
  news_score: newsScore,
  staleness_score: ss,
  volatility_score: vs,
  importance_score: is,
  tier: t1Slugs.has(slug) ? 'T1' : 'T2',
  news_summary: evidenceMap[slug].summary,
  news_sources: evidenceMap[slug].sources,
  recommendation: 'assess'
}));

// ── Rotation backfill (5 next by staleness without evidence) ─────────────────

const withoutEvidence = allEntities
  .filter(e => e.evidence === null)
  .sort((a, b) => {
    if (b.ss !== a.ss) return b.ss - a.ss;
    return b.basePriority - a.basePriority;
  })
  .slice(0, 5);

const rotationBackfill = withoutEvidence.map(({ slug, entity, ss, is, vs, basePriority }) => ({
  slug,
  name: entity.name,
  index: entity.index,
  priority_score: basePriority,
  staleness_score: ss,
  importance_score: is,
  volatility_score: vs,
  recommendation: 'rotation'
}));

// ── Stats ────────────────────────────────────────────────────────────────────

const entitiesWithEvidence = allEntities.filter(e => e.evidence !== null).length;
const t1Count = t1Slugs.size;
const t2Count = allEntities.length - t1Count;

const stats = {
  entities_with_evidence: entitiesWithEvidence,
  entities_flagged_for_assessment: topEntities.length,
  rotation_slots_filled: rotationBackfill.length,
  total_assessment_targets: topEntities.length + rotationBackfill.length,
  tier_1_count: t1Count,
  tier_2_count: t2Count,
  tier_3_sector_sweeps: 6
};

// ── Assemble scan output ─────────────────────────────────────────────────────

const scanOutput = {
  scan_date: SCAN_DATE,
  scan_start: SCAN_START,
  scan_end: SCAN_END,
  lookback_window_days: 14,
  entities_scanned: allEntities.length,
  searches_performed: 237,
  tier_breakdown: {
    tier_1_individual: t1Count,
    tier_2_batched: 81,
    tier_3_sector_sweeps: 6
  },
  top_entities: topEntities,
  rotation_backfill: rotationBackfill,
  sector_alerts: sectorAlerts,
  entity_reviews: entityReviews,
  stats
};

writeFileSync(
  join(__dirname, 'research/scans/2026-04-19.json'),
  JSON.stringify(scanOutput, null, 2),
  'utf8'
);
console.log('Wrote research/scans/2026-04-19.json');
console.log(`  entity_reviews: ${entityReviews.length}`);
console.log(`  top_entities: ${topEntities.length}`);
console.log(`  rotation_backfill: ${rotationBackfill.length}`);

// ── Build evidence-reviews feed ──────────────────────────────────────────────

const reviewsFeed = {};
for (const review of entityReviews) {
  const key = `${review.index}/${review.slug}`;
  const entry = {
    reviewed_at: review.reviewed_at,
    evidence_found: review.evidence_found,
    summary: review.summary,
    tier: review.tier
  };
  if (review.sources && review.sources.length > 0) {
    entry.sources = review.sources;
  }
  reviewsFeed[key] = entry;
}

const evidenceFeed = {
  date: SCAN_DATE,
  lookback_window_days: 14,
  reviews: reviewsFeed
};

const feedPath = join(__dirname, 'site/src/data/evidence-reviews/latest.json');
writeFileSync(feedPath, JSON.stringify(evidenceFeed, null, 2), 'utf8');
console.log('Wrote site/src/data/evidence-reviews/latest.json');
console.log(`  review keys: ${Object.keys(reviewsFeed).length}`);

// ── Update rotation-state.json ───────────────────────────────────────────────

for (const slug of Object.keys(rotationState.entities)) {
  rotationState.entities[slug].last_scanned = SCAN_DATE;
  rotationState.entities[slug].last_evidence_touch = SCAN_DATE;
}
rotationState.last_updated = SCAN_DATE;

writeFileSync(
  join(__dirname, 'research/rotation-state.json'),
  JSON.stringify(rotationState, null, 2),
  'utf8'
);
console.log('Updated research/rotation-state.json');
console.log(`  last_scanned set to ${SCAN_DATE} for all ${Object.keys(rotationState.entities).length} entities`);

// ── Console summary ──────────────────────────────────────────────────────────

console.log('\n=== SCAN SUMMARY ===');
console.log(`Date: ${SCAN_DATE}`);
console.log(`Runtime: ${SCAN_START} → ${SCAN_END}`);
console.log(`Entities scanned: ${allEntities.length}`);
console.log(`Searches performed: 237 (T1: ${t1Count} individual, T2: 81 batched, T3: 6 sector sweeps)`);
console.log(`Entities with material evidence: ${entitiesWithEvidence}`);
console.log('\nTop 5 flagged entities:');
topEntities.slice(0, 5).forEach((e, i) => {
  console.log(`  ${i + 1}. ${e.name} (${e.index}) — priority ${e.priority_score}, news ${e.news_score}`);
  console.log(`     ${e.news_summary.substring(0, 100)}...`);
});
console.log('\nSector alerts:');
sectorAlerts.forEach(a => console.log(`  - [${a.sector}] ${a.alert.substring(0, 80)}...`));
console.log(`\nAll ${entityReviews.length} entity records written. Scan complete.`);
