/**
 * Conditions under which a per-model comparison could open (docs/PRD_AI_MODEL_WATCH.md section 10, drawn from
 * docs/MODEL_TESTING_V2_PROPOSAL.md). The thresholds are named constants with their decision references so the
 * /ai-models/leaderboards page never types them in prose. Opening any such page remains a founder decision (FD-2),
 * even when every condition is met; the first form would be groupings with ranges, not an ordered list.
 *
 * Status values are data, not copy: a status that can be derived from a repo fact is derived; the rest are held here
 * with the date they were last checked. A condition whose status cannot be verified says "unknown".
 */

import dashboardDecision from "@/data/model-benchmark/dashboard-decision.json";
import { MODEL_INDEX_FACTS as F } from "@/lib/model-index-facts";

export const JUDGE_FAMILIES_REQUIRED = 3; // Model Testing v2: cross-family judge panel
export const MIN_VALIDATED_ITEMS_PER_DIMENSION = 3; // D-40 coverage floor
export const CONSECUTIVE_WAVES_REQUIRED = 2; // two waves under per-wave approval, no open defects
export const OPEN_CLAIM_AUDITS_ALLOWED = 0;

/** Date the hand-held statuses below were last checked against the Model Testing v2 proposal. */
export const CONDITIONS_STATUS_AS_OF = "2026-10-16";

export type ConditionStatus = "met" | "in-progress" | "not-met" | "unknown";

export type RankingCondition = {
  id: string;
  /** Plain-language condition, no figures beyond the named constants above. */
  text: string;
  /** Decision or document the condition comes from. */
  ref: string;
  status: ConditionStatus;
  /** Where the status came from: a repo fact, or a dated manual check. */
  basis: "derived" | "manual";
  evidenceHref?: string;
};

const dashboardActive = (dashboardDecision as { status?: string }).status === "active";

export const RANKING_CONDITIONS: RankingCondition[] = [
  {
    id: "protocol-ratified",
    text: "The weekly-v2 testing protocol is ratified.",
    ref: "Model Testing v2 proposal",
    status: "not-met",
    basis: "manual",
  },
  {
    id: "dashboard-decision",
    text: "The model dashboard decision is ratified and active.",
    ref: (dashboardDecision as { decision_ref?: string }).decision_ref ?? "D-29b",
    status: dashboardActive ? "met" : "not-met",
    basis: "derived",
  },
  {
    id: "judge-panel",
    text: `A judge panel of ${JUDGE_FAMILIES_REQUIRED} model families is operating.`,
    ref: "Model Testing v2 proposal",
    // Checked 2026-10-16: every judge in research/model-runs/weekly/PROTOCOL.json is family "claude".
    status: "not-met",
    basis: "manual",
  },
  {
    id: "secure-item-pool",
    text: "A blinded or secure item pool exists, because a public item bank cannot support comparison between models.",
    ref: "D-29, D-29a",
    status: F.allItemsPublic ? "not-met" : "in-progress",
    basis: "derived",
    evidenceHref: "/ai-models/methodology",
  },
  {
    id: "validated-items",
    text: `Items are human-validated, with at least ${MIN_VALIDATED_ITEMS_PER_DIMENSION} rated items in every dimension.`,
    ref: "D-40",
    status: F.itemsWithTwoReviews === 0 ? "not-met" : "in-progress",
    basis: "derived",
    evidenceHref: "/ai-models#limits",
  },
  {
    id: "human-panel",
    text: "A human rating panel exists.",
    ref: "BLK-005",
    status: "not-met",
    basis: "manual",
  },
  {
    id: "agreement-floors",
    text: "Variance checks and judge-agreement floors are met.",
    ref: "Model Testing v2 proposal",
    // Checked 2026-10-16: the floors are only proposed (weekly-v2 is not ratified), so none can be met yet.
    status: "not-met",
    basis: "manual",
  },
  {
    id: "consecutive-waves",
    text: `${CONSECUTIVE_WAVES_REQUIRED} consecutive waves are published under per-wave approval with no open defects.`,
    ref: "Model Testing v2 proposal",
    status: "not-met",
    basis: "manual",
  },
  {
    id: "claim-audits",
    text: `The number of open claim audits is ${OPEN_CLAIM_AUDITS_ALLOWED}.`,
    ref: "D-29a",
    status: "unknown",
    basis: "manual",
  },
  {
    id: "one-axis",
    text: "Hosted and local deployments are never placed on one axis unless the difference is declared.",
    ref: "Model Testing v2 proposal",
    status: "in-progress",
    basis: "manual",
  },
  {
    id: "legal-review",
    text: "Legal and duty-of-care review is complete.",
    ref: "D-29",
    status: "unknown",
    basis: "manual",
  },
];

export const CONDITIONS_TOTAL = RANKING_CONDITIONS.length;
export const CONDITIONS_MET = RANKING_CONDITIONS.filter((c) => c.status === "met").length;
