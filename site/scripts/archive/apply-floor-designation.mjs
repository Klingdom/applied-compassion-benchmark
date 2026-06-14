#!/usr/bin/env node

/**
 * apply-floor-designation.mjs — Resolve the floor-limitation cluster.
 *
 * The Compassion Benchmark composite formula has a natural mathematical floor at
 * 0 (all 8 dimensions resolve to the lowest anchor of 1.0/5.0). Several entities
 * have been carrying residual sub-dimension buoyancy ("1.1", "1.2", "1.3") that
 * keeps them off zero despite documented systemic-harm patterns that satisfy the
 * floor criteria across multiple assessment cycles.
 *
 * This script:
 *   1. Drops the 3 buoyant floor-pressed entities (xAI/Grok, Palantir AI, Israel)
 *      to all-1.0 dimension scores → composite 0.
 *   2. Attaches a structured `floorDesignation` object to all 5 floor-designated
 *      entities (the 3 above + Sudan + South Sudan, which already sit at 0).
 *   3. Re-ranks the affected indexes (composite desc, name asc tiebreak) and
 *      recounts band distributions / meta stats.
 *
 * The floorDesignation field is the methodology disclosure — every floor-pressed
 * entity must "call out why" so a reader sees the documented evidence pattern,
 * not a silent zero.
 *
 * Usage:
 *   node scripts/apply-floor-designation.mjs           # dry-run
 *   node scripts/apply-floor-designation.mjs --apply   # write changes
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEXES_DIR = join(__dirname, "..", "src", "data", "indexes");
const APPLY = process.argv.includes("--apply");

const DESIGNATED_DATE = "2026-04-30";
const EVIDENCE_WINDOW = "2026-04-15 to 2026-04-29";
const METHODOLOGY_VERSION = "v1.2";

// ─── Floor-designation payloads ────────────────────────────────────────────
// Each entity has documented evidence across 8+ assessment cycles. These
// rationale + evidence summaries are the public "call out why" disclosure.

const DESIGNATIONS = [
  {
    index: "ai-labs",
    name: "xAI/Grok",
    floorScores: true, // drop dims to all 1.0
    floorDesignation: {
      designated: true,
      designatedDate: DESIGNATED_DATE,
      evidenceWindow: EVIDENCE_WINDOW,
      rationale:
        "Floor designation reflects systemic harm pattern documented across multiple assessment cycles: deliberate removal of safety guardrails, public deployment of an LLM that produces antisemitic and violent content on demand, founder-directed alignment toward propaganda objectives, and zero functional accountability or evidence-of-care infrastructure. Composite resolves at zero because no dimension shows functional compassion behavior at the sub-anchor level.",
      primaryDrivers: ["AWR", "EMP", "ACC", "INT"],
      evidenceSummary: [
        "Grok has produced documented antisemitic outputs (\"MechaHitler\" incident, July 2025) tied to deliberate prompt-engineering changes.",
        "xAI does not publish a system card, model card, or red-team report comparable to peers.",
        "Founder has publicly directed the model toward partisan political objectives, undermining integrity.",
        "No published harm-reduction roadmap, no third-party evaluations, no incident-disclosure process.",
        "Repeated rollouts of features (image generation, voice mode) without safety evaluation disclosure.",
      ],
      methodologyVersion: METHODOLOGY_VERSION,
    },
  },
  {
    index: "ai-labs",
    name: "Palantir AI",
    floorScores: true,
    floorDesignation: {
      designated: true,
      designatedDate: DESIGNATED_DATE,
      evidenceWindow: EVIDENCE_WINDOW,
      rationale:
        "Floor designation reflects systemic harm pattern documented across multiple assessment cycles: AI products built specifically to enable mass-scale lethal targeting and immigration enforcement, leadership rhetoric explicitly endorsing harm against civilians, no disclosure of model behavior, no published safety policy, and no third-party accountability. Composite resolves at zero because compassion infrastructure is absent by design.",
      primaryDrivers: ["AWR", "EMP", "ACC", "EQU", "INT"],
      evidenceSummary: [
        "Maven Smart System and Lavender-class targeting tools deployed in active conflict with documented civilian casualty patterns.",
        "ICE contract for AI-driven immigration enforcement, including biometric tracking of mixed-status families.",
        "CEO Karp has publicly endorsed lethal use of Palantir products against perceived adversaries (Stanford, Oct 2024; multiple subsequent statements).",
        "No published model card, system card, or AI safety policy for any deployed product.",
        "No third-party red-teaming or independent harm evaluation of military/policing AI products.",
        "Refusal to disclose customer list, deployment scope, or harm metrics.",
      ],
      methodologyVersion: METHODOLOGY_VERSION,
    },
  },
  {
    index: "countries",
    name: "Israel",
    floorScores: true,
    floorDesignation: {
      designated: true,
      designatedDate: DESIGNATED_DATE,
      evidenceWindow: EVIDENCE_WINDOW,
      rationale:
        "Floor designation reflects systemic harm pattern documented across multiple assessment cycles: ICJ provisional measures finding plausible genocide, ICC arrest warrants for sitting head of state and former defense minister, sustained famine conditions imposed on a civilian population, mass civilian casualties exceeding 60,000 documented, settler-violence patterns codified through state policy, and active obstruction of independent humanitarian access. Composite resolves at zero because the documented pattern of state action against a civilian population satisfies the floor criteria across every dimension.",
      primaryDrivers: ["AWR", "EMP", "EQU", "BND", "ACC", "INT"],
      evidenceSummary: [
        "ICJ provisional measures (Jan 26, 2024; revised May 24, 2024) finding plausible genocide and ordering protective measures.",
        "ICC arrest warrants issued (Nov 21, 2024) for PM Netanyahu and former DM Gallant for war crimes and crimes against humanity.",
        "IPC famine determination (multiple updates 2024-2025) for Gaza civilian population, with documented obstruction of humanitarian aid.",
        "Documented civilian casualty count exceeding 60,000 (Gaza Health Ministry, corroborated by Lancet/UN/independent investigators).",
        "Systemic settler violence in West Bank with state non-enforcement, documented by B'Tselem, UN OCHA, Yesh Din.",
        "Restrictions on press access to Gaza, killing of 150+ journalists, and obstruction of independent fact-finding missions.",
      ],
      methodologyVersion: METHODOLOGY_VERSION,
    },
  },
  {
    index: "countries",
    name: "Sudan",
    floorScores: false, // already all 1.0
    floorDesignation: {
      designated: true,
      designatedDate: DESIGNATED_DATE,
      evidenceWindow: EVIDENCE_WINDOW,
      rationale:
        "Floor designation reflects ongoing systemic harm pattern: SAF-RSF civil war producing the world's largest displacement crisis, IPC-classified famine conditions, ethnic-cleansing patterns in Darfur, total collapse of state capacity to recognize or respond to civilian suffering, and sustained obstruction of humanitarian access by both belligerent parties. Composite was already at zero; this entry formalizes the methodology basis for that floor.",
      primaryDrivers: ["AWR", "ACT", "EQU", "BND", "ACC", "INT"],
      evidenceSummary: [
        "IPC famine classification across multiple regions (2024-2025), confirmed by UN agencies.",
        "World's largest internal displacement crisis (>10 million displaced as of 2025).",
        "UN expert panel findings of ethnic cleansing in El Geneina and broader Darfur.",
        "ICC active investigation into atrocity crimes; multiple sealed warrants reportedly issued.",
        "Total collapse of judicial and administrative state capacity in conflict zones.",
        "Documented obstruction of humanitarian convoys by both SAF and RSF forces.",
      ],
      methodologyVersion: METHODOLOGY_VERSION,
    },
  },
  {
    index: "countries",
    name: "South Sudan",
    floorScores: false, // already all 1.0
    floorDesignation: {
      designated: true,
      designatedDate: DESIGNATED_DATE,
      evidenceWindow: EVIDENCE_WINDOW,
      rationale:
        "Floor designation reflects ongoing systemic harm pattern: state failure across all dimensions of compassion infrastructure, documented IPC food-insecurity catastrophe, recurring inter-communal violence facilitated by political elites, near-total absence of accountability mechanisms, and the imminent April 30 expiry of UNMISS without credible domestic capacity to take over civilian-protection mandates. Composite was already at zero; this entry formalizes the methodology basis for that floor.",
      primaryDrivers: ["AWR", "ACT", "EQU", "ACC", "SYS", "INT"],
      evidenceSummary: [
        "IPC catastrophe-level food insecurity affecting majority of population (2024-2025).",
        "UN Commission on Human Rights in South Sudan documenting systemic violations.",
        "April 30, 2026 UNMISS mandate expiry without credible succession plan for civilian protection.",
        "Sustained pattern of state-tolerated inter-communal violence with no judicial accountability.",
        "Collapse of domestic institutions; reliance on international actors for basic state functions.",
        "No functional national human-rights or civilian-protection infrastructure.",
      ],
      methodologyVersion: METHODOLOGY_VERSION,
    },
  },
];

// ─── Index helpers ──────────────────────────────────────────────────────────

const DIM_CODES = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];

function getBand(score) {
  if (score > 80) return "exemplary";
  if (score > 60) return "established";
  if (score > 40) return "functional";
  if (score > 20) return "developing";
  return "critical";
}

const BAND_ORDER = ["Exemplary", "Established", "Functional", "Developing", "Critical"];
const BAND_RANGES = {
  Exemplary: "81-100",
  Established: "61-80",
  Functional: "41-60",
  Developing: "21-40",
  Critical: "0-20",
};

function recountBands(rankings) {
  const counts = { Exemplary: 0, Established: 0, Functional: 0, Developing: 0, Critical: 0 };
  for (const r of rankings) {
    const bandName = r.band.charAt(0).toUpperCase() + r.band.slice(1);
    if (counts[bandName] !== undefined) counts[bandName]++;
  }
  return counts;
}

function applyToIndex(indexName, designations) {
  const filePath = join(INDEXES_DIR, `${indexName}.json`);
  const data = JSON.parse(readFileSync(filePath, "utf8"));

  console.log(`\n── ${indexName}.json ──`);

  let touched = false;

  for (const d of designations) {
    const entity = data.rankings.find((r) => r.name === d.name);
    if (!entity) {
      console.error(`  ❌ Entity not found: ${d.name}`);
      continue;
    }

    const oldComposite = entity.composite;
    const oldBand = entity.band;
    const oldRank = entity.rank;

    if (d.floorScores) {
      // Drop all dimensions to 1.0 (floor anchor)
      for (const code of DIM_CODES) {
        entity.scores[code] = 1;
      }
      entity.composite = 0;
      entity.band = "critical";
    }

    // Always attach the designation object — even for entities already at 0.
    entity.floorDesignation = d.floorDesignation;
    touched = true;

    console.log(
      `  ${d.name}: composite ${oldComposite} → ${entity.composite} (rank #${oldRank}, band ${oldBand} → ${entity.band})`
    );
  }

  if (!touched) {
    console.log("  (nothing to change)");
    return;
  }

  // Re-rank: composite desc, name asc tiebreak
  data.rankings.sort((a, b) => {
    if (b.composite !== a.composite) return b.composite - a.composite;
    return a.name.localeCompare(b.name);
  });
  data.rankings.forEach((r, i) => {
    r.rank = i + 1;
  });

  // Recompute band counts (skip us-states.json — same exception as recompute-composites.mjs)
  if (Array.isArray(data.bands) && indexName !== "us-states") {
    const counts = recountBands(data.rankings);
    const total = data.rankings.length;
    // Preserve existing band structure if present; otherwise rebuild canonical order
    const existing = new Map(data.bands.map((b) => [b.name, b]));
    data.bands = BAND_ORDER.map((name) => {
      const prev = existing.get(name) || {};
      return {
        name,
        range: prev.range || BAND_RANGES[name],
        count: counts[name] ?? 0,
        pct: `${Math.round(((counts[name] ?? 0) / total) * 100)}%`,
      };
    });
  }

  // Recompute meta.meanScore and meta.medianScore if present
  if (data.meta) {
    const composites = data.rankings.map((r) => r.composite);
    if (typeof data.meta.meanScore === "number") {
      data.meta.meanScore =
        Math.round((composites.reduce((a, b) => a + b, 0) / composites.length) * 10) / 10;
    }
    if (typeof data.meta.medianScore === "number") {
      const sorted = [...composites].sort((a, b) => a - b);
      data.meta.medianScore =
        sorted.length % 2 === 0
          ? Math.round(((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2) * 10) / 10
          : sorted[Math.floor(sorted.length / 2)];
    }
    data.meta.entityCount = data.rankings.length;
  }

  // Log new ranks
  for (const d of designations) {
    const entity = data.rankings.find((r) => r.name === d.name);
    if (entity) console.log(`  → ${d.name} new rank: #${entity.rank}`);
  }

  if (APPLY) {
    writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(`  ✅ ${indexName}.json written (${data.rankings.length} entities)`);
  } else {
    console.log(`  (DRY-RUN — no write)`);
  }
}

// ─── Run ────────────────────────────────────────────────────────────────────

console.log(`\napply-floor-designation.mjs — mode: ${APPLY ? "APPLY" : "DRY-RUN"}`);
console.log(`Designating ${DESIGNATIONS.length} entities at floor.\n`);
console.log("=".repeat(70));

const byIndex = new Map();
for (const d of DESIGNATIONS) {
  if (!byIndex.has(d.index)) byIndex.set(d.index, []);
  byIndex.get(d.index).push(d);
}

for (const [indexName, designations] of byIndex) {
  applyToIndex(indexName, designations);
}

console.log("\n" + "=".repeat(70));
if (APPLY) {
  console.log("\n✅ Floor designation applied. Verify with: npm run validate:indexes\n");
} else {
  console.log("\nDRY-RUN complete. Re-run with --apply to write changes.\n");
}
