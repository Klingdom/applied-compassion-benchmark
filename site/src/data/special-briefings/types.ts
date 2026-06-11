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
  generatedAt: string;
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
  updatedAt: string;
}
