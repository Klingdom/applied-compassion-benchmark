/**
 * Build-time helpers for reading per-entity history JSON files.
 *
 * These files are written by site/scripts/build-entity-history.mjs to
 * site/public/data/history/ before the Next.js static export runs.
 *
 * We read via fs.readFileSync so the import path resolves correctly
 * in both `next dev` and `next build` (static export).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { EntityHistory, HistoryManifest } from "@/types/entity-history";

// Resolve the absolute path to site/public/data/history/ at module load time.
// process.cwd() in Next.js app router resolves to site/ at build time.
function getHistoryDir(): string {
  return join(process.cwd(), "public", "data", "history");
}

/**
 * Load the history manifest listing all slugs that have history entries.
 * Returns null if the manifest hasn't been generated yet (pre-prebuild).
 */
export function getHistoryManifest(): HistoryManifest | null {
  try {
    const raw = readFileSync(join(getHistoryDir(), "_manifest.json"), "utf-8");
    return JSON.parse(raw) as HistoryManifest;
  } catch {
    return null;
  }
}

/**
 * Load per-entity history JSON for a given slug.
 * Returns null if the file doesn't exist or the slug has no recorded events.
 */
export function getEntityHistory(slug: string): EntityHistory | null {
  try {
    const raw = readFileSync(join(getHistoryDir(), `${slug}.json`), "utf-8");
    return JSON.parse(raw) as EntityHistory;
  } catch {
    return null;
  }
}

/**
 * Check whether a given slug has a history file.
 * Used by entity detail pages to conditionally render the "View score history" link.
 */
export function hasEntityHistory(slug: string): boolean {
  const manifest = getHistoryManifest();
  if (!manifest) return false;
  return manifest.slugs.includes(slug);
}
