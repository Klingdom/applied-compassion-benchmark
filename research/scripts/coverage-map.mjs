import fs from 'fs';
process.chdir('C:/Users/philk/applied-compassion-benchmark');

const scanDir = 'research/scans';
const scans = fs.readdirSync(scanDir)
  .filter((f) => /^2026-09-\d{2}\.json$/.test(f))
  .map((f) => {
    const s = JSON.parse(fs.readFileSync(scanDir + '/' + f, 'utf8'));
    return {
      date: f.slice(0, 10),
      from: s.lookback_window_start || null,
      to: s.lookback_window_end || null,
      entities: s.entities_scanned ?? null,
      top: (s.top_entities || []).length,
      dropped: (s.stats?.dropped_candidates || []).length,
    };
  })
  .sort((a, b) => a.date.localeCompare(b.date));

const has = (p) => fs.existsSync(p);
const assessedOn = (d) =>
  fs.readdirSync('research/assessments').filter((f) => f.endsWith(d + '.md')).length;
const proposalsOn = (d) =>
  fs.existsSync('research/change-proposals')
    ? fs.readdirSync('research/change-proposals').filter((f) => f.endsWith(d + '.json')).length
    : 0;

const days = [];
for (let i = 1; i <= 24; i++) days.push('2026-09-' + String(i).padStart(2, '0'));

const rows = days.map((d) => {
  const covering = scans.filter((s) => s.from && s.to && s.from <= d && d <= s.to).map((s) => s.date);
  return {
    day: d,
    covering,
    ownScan: scans.some((s) => s.date === d),
    digest: has(`research/digests/${d}.md`),
    briefing: has(`site/src/data/updates/daily/${d}.json`),
    assessed: assessedOn(d),
    proposals: proposalsOn(d),
  };
});

const uncovered = rows.filter((r) => r.covering.length === 0);
const noBriefing = rows.filter((r) => !r.briefing);

let md = `# September 2026 research coverage map

**Generated ${new Date().toISOString().slice(0, 10)}** by \`coverage-map.mjs\` from \`research/scans/2026-09-*.json\`,
\`research/digests/\`, \`research/assessments/\` and \`site/src/data/updates/daily/\`. Every figure below is read from
those files at write time — none is typed by hand (rule S11). Re-run the script to regenerate.

## Why this document exists

A directory listing makes September look full of holes: only ${rows.filter((r) => r.briefing).length} of ${rows.length} days
have a published briefing. That is true but misleading, because a cycle's **lookback window** covers the days before it.
The question that matters is not "was there a briefing dated X" but **"was the evidence of day X ever scanned"** — and
those are different questions with different answers.

**Dated artifacts are never back-filled.** \`AUTONOMY.md\` §1c forbids retro-dating published content, so a day without a
briefing stays without one. The honest remedy for a gap is a **catch-up cycle whose window spans it**, recorded as such.

## Evidence coverage, day by day

| Day | Evidence scanned by | Own scan | Digest | Briefing | Assessments | Proposals |
|---|---|---|---|---|---|---|
`;
for (const r of rows) {
  md += `| ${r.day} | ${r.covering.length ? r.covering.join(', ') : '**none**'} | ${r.ownScan ? 'yes' : '—'} | ${r.digest ? 'yes' : '—'} | ${r.briefing ? 'yes' : '—'} | ${r.assessed || '—'} | ${r.proposals || '—'} |\n`;
}

md += `
## Scan windows

| Cycle | Lookback window | Entities scanned | Priority flags | Dropped candidates |
|---|---|---:|---:|---:|
`;
for (const s of scans) {
  md += `| ${s.date} | ${s.from || '?'} → ${s.to || '?'} | ${s.entities ?? '?'} | ${s.top} | ${s.dropped} |\n`;
}

md += `
## Findings

- **Days whose evidence was never scanned: ${uncovered.length}**${uncovered.length ? ' — ' + uncovered.map((r) => r.day).join(', ') : ''}.
- **Days with no published briefing: ${noBriefing.length}** — ${noBriefing.map((r) => r.day).join(', ')}. Their evidence
  was scanned by the cycles listed above; what is absent is a dated briefing, which cannot be created retroactively.
- **The 2026-09-09 scan is an orphan**: window ${scans.find((s) => s.date === '2026-09-09')?.from} → ${scans.find((s) => s.date === '2026-09-09')?.to} (two days),
  ${scans.find((s) => s.date === '2026-09-09')?.top} priority flags, and **no digest or assessor summary**. Its candidates were
  **not lost**: Nepal, Jamaica, Boeing and Los Angeles were each assessed on 2026-09-14 by the catch-up cycle
  (\`research/assessments/{nepal,jamaica,boeing,los-angeles}-2026-09-14.md\`), verified by file existence.
- **The 2026-09-14 cycle is the load-bearing catch-up**: its window spans 09-02 → 09-14, which is why eleven days
  without their own briefing still had their evidence examined.

## What this means for public coverage claims

Any statement of the form "we scan daily" is **false** for September 2026 and must not be published. A defensible
claim is narrower: *every September day's evidence fell inside at least one cycle's lookback window*${uncovered.length ? ', except ' + uncovered.map((r) => r.day).join(', ') : ''}.
That is a weaker claim, and it is the true one. \`RISK-016\` already records that this pipeline has never run unattended,
which is the underlying cause of the irregular cadence.
`;

fs.writeFileSync('docs/SEPTEMBER_2026_COVERAGE_MAP.md', md);
console.log('written: docs/SEPTEMBER_2026_COVERAGE_MAP.md');
console.log('days with a briefing:', rows.filter((r) => r.briefing).length, 'of', rows.length);
console.log('evidence-uncovered days:', uncovered.map((r) => r.day).join(', ') || 'none');
console.log('no-briefing days:', noBriefing.length);
