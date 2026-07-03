const fs = require('fs');

// Load scan output
const scan = JSON.parse(fs.readFileSync('C:/Users/philk/applied-compassion-benchmark/research/scans/2026-06-21.json', 'utf8'));
const rotData = JSON.parse(fs.readFileSync('C:/Users/philk/applied-compassion-benchmark/research/rotation-state.json', 'utf8'));

const today = '2026-06-21';

// Step 7: Build site evidence-review feed
// Slim per-entity records keyed by index/slug
const reviews = {};
scan.entity_reviews.forEach(r => {
  const key = r.index + '/' + r.slug;
  const record = {
    reviewed_at: r.reviewed_at,
    evidence_found: r.evidence_found,
    summary: r.summary
  };
  if (r.sources && r.sources.length > 0) {
    record.sources = r.sources;
  }
  reviews[key] = record;
});

const evidenceFeed = {
  date: today,
  lookback_window_days: 14,
  reviews: reviews
};

// Write dated file
fs.writeFileSync(
  'C:/Users/philk/applied-compassion-benchmark/site/src/data/evidence-reviews/2026-06-21.json',
  JSON.stringify(evidenceFeed, null, 2)
);
console.log('Wrote evidence-reviews/2026-06-21.json with', Object.keys(reviews).length, 'records');

// Write latest.json
fs.writeFileSync(
  'C:/Users/philk/applied-compassion-benchmark/site/src/data/evidence-reviews/latest.json',
  JSON.stringify(evidenceFeed, null, 2)
);
console.log('Updated evidence-reviews/latest.json');

// Step 8: Update rotation-state.json
// Set last_scanned and last_evidence_touch to today for ALL 1260 entities
const entities = rotData.entities;
const keys = Object.keys(entities);
keys.forEach(k => {
  entities[k].last_scanned = today;
  entities[k].last_evidence_touch = today;
});
rotData.last_updated = today;

fs.writeFileSync(
  'C:/Users/philk/applied-compassion-benchmark/research/rotation-state.json',
  JSON.stringify(rotData, null, 2)
);
console.log('Updated rotation-state.json for', keys.length, 'entities');
console.log('Sample entity:', JSON.stringify(entities['finland']).substring(0, 200));
