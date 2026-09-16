/**
 * Types for special briefing data, shared between build scripts and page components.
 */

export interface BriefingSection {
  heading: string;
  /** Heading level from the source markdown (2 = ## , 3 = ###, etc.) */
  level: number;
  /** Safe HTML rendered from the section's markdown body */
  html: string;
}

export interface SpecialBriefing {
  slug: string;
  title: string;
  dek: string;
  edition: string;
  date: string;
  scope: string;
  cohortSummary: string;
  /** Rendered key findings text (may contain **bold** markdown inline markers) */
  keyFindings: string[];
  bodySections: BriefingSection[];
  /**
   * Deterministic "last modified" stamp: the source .md file's last commit
   * date, or its front-matter publish date as a fallback. null only if
   * neither could be determined (see build-special-briefings.mjs).
   */
  generatedAt: string | null;
}

export interface BriefingManifestEntry {
  slug: string;
  title: string;
  dek: string;
  date: string;
  edition: string;
}

export interface BriefingManifest {
  briefings: BriefingManifestEntry[];
}
