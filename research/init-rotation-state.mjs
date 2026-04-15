#!/usr/bin/env node

/**
 * Initialize rotation-state.json from all 7 published index JSON files.
 * Maps every entity to { index, last_scanned, last_assessed, last_change_proposal }.
 *
 * Usage: node research/init-rotation-state.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(import.meta.dirname, "..", "site", "src", "data", "indexes");
const OUT_FILE = join(import.meta.dirname, "rotation-state.json");

const INDEX_FILES = [
  { file: "countries.json", index: "countries", nameKey: "name" },
  { file: "us-states.json", index: "us-states", nameKey: "name" },
  { file: "fortune-500.json", index: "fortune-500", nameKey: "name" },
  { file: "ai-labs.json", index: "ai-labs", nameKey: "name" },
  { file: "robotics-labs.json", index: "robotics-labs", nameKey: "name" },
  { file: "us-cities.json", index: "us-cities", nameKey: "name" },
  { file: "global-cities.json", index: "global-cities", nameKey: "name" },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const entities = {};
let total = 0;

for (const { file, index } of INDEX_FILES) {
  const path = join(DATA_DIR, file);
  if (!existsSync(path)) {
    console.error(`Missing: ${path}`);
    continue;
  }

  const data = JSON.parse(readFileSync(path, "utf-8"));
  const rankings = data.rankings || [];

  for (const entry of rankings) {
    const slug = slugify(entry.name);
    // Handle duplicate slugs across indexes by appending index name
    const key = entities[slug] ? `${slug}-${index}` : slug;

    entities[key] = {
      name: entry.name,
      index,
      rank: entry.rank,
      composite: entry.composite,
      band: entry.band,
      last_scanned: null,
      last_assessed: null,
      last_change_proposal: null,
    };
    total++;
  }
}

const state = {
  last_updated: new Date().toISOString().split("T")[0],
  entity_count: total,
  entities,
};

writeFileSync(OUT_FILE, JSON.stringify(state, null, 2));
console.log(`Wrote ${total} entities across ${INDEX_FILES.length} indexes to ${OUT_FILE}`);
