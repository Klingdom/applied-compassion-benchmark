/**
 * cb-probe-facts.ts -- typed reader for the generated cb-probe facts file.
 *
 * Source: src/data/model-benchmark/cb-probe-facts.generated.json, written by
 * scripts/export-cb-probe-facts.mjs (never edit it by hand). Every tool name,
 * count, threshold and version the MCP / analysis sections state comes from here,
 * so a change to the tool or the bank cannot leave a stale sentence behind.
 */
import raw from "@/data/model-benchmark/cb-probe-facts.generated.json";

export interface CbProbeTool {
  name: string;
  group: "shared" | "JudgeEstimate" | "SelfRunScorecard";
  summary: string;
}

export interface CbProbeFacts {
  distribution: { npmPublished: boolean };
  version: string;
  license: string;
  repository: string;
  toolCount: number;
  tools: CbProbeTool[];
  bankVersion: string;
  dimensionCount: number;
  itemsTotal: number;
  itemsServedDefault: number;
  crisisItemsExcludedByDefault: number;
  trialsInDefaultRun: number;
  minTrials: number;
  minItemsPerDimension: number;
  floorReachable: boolean;
  perDimensionDefaultItems: Record<string, number>;
  defaultJudgeConfiguration: string;
  judgeConfigurations: string[];
  recallThreshold: number;
  identificationCount: number;
  identificationOptions: number;
  identificationAlpha: number;
  defaultBootstrapIterations: number;
  subdimensions: {
    available: boolean;
    covered: number;
    total: number;
    reason: string;
  };
  /** Added by the exporter; rendered verbatim, never retyped. May be absent. */
  separationStatement?: string;
}

export const CB_PROBE_FACTS = raw as unknown as CbProbeFacts;

/**
 * Resolve a tool name against the generated list. Throws at build time if the
 * tool no longer exists, so prose can reference a tool without hand-typing a
 * name that could drift.
 */
export function toolName(name: string): string {
  if (!CB_PROBE_FACTS.tools.some((t) => t.name === name)) {
    throw new Error(`cb-probe-facts: tool "${name}" is not in the generated tool list`);
  }
  return name;
}

/** Public repository URL without the git+ prefix and .git suffix. */
export function repoWebUrl(): string {
  return CB_PROBE_FACTS.repository.replace(/^git\+/, "").replace(/\.git$/, "");
}

export function repoCloneUrl(): string {
  return CB_PROBE_FACTS.repository.replace(/^git\+/, "");
}
