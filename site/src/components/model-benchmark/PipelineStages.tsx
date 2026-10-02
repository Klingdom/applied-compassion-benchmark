/**
 * PipelineStages — the detect → evaluate → score → publish arc as four
 * labelled stages, each stating what exists and what is blocking it.
 *
 * Every fact rendered here is read from the published data stores at build
 * time (model-index-facts.ts, release-watch-facts.ts, and
 * release-sources-v1.json directly) — never hand-typed. See DECISIONS.md
 * D-29 for why: a hardcoded count left six stale "50" claims live on this
 * site after the Robotics Labs Index grew to 92 entities.
 *
 * D-29 also forbids implying "evaluation underway" anywhere on these pages.
 * The Evaluate stage below states a plain, checkable reason it has not
 * started (no provisioned credentials or approved budget for a pinned-snapshot
 * provider call) rather than a progress verb, and separates agent-tool runs
 * from the official stage so the sentence stays true if such runs are added.
 */

import type { ReactNode } from "react";
import Panel from "@/components/ui/Panel";
import releaseSources from "@/data/model-benchmark/release-sources-v1.json";
import { MODEL_INDEX_FACTS as F } from "@/lib/model-index-facts";
import { RELEASE_WATCH_FACTS as R } from "@/lib/release-watch-facts";

const sourceCount = (releaseSources as { sources?: unknown[] }).sources?.length ?? 0;

type Stage = {
  n: string;
  h: string;
  status: string;
  /** Only the stage with a genuine external blocker (an approval only the founder can give) is flagged in colour. */
  flagged: boolean;
  p: ReactNode;
};

const stages: Stage[] = [
  {
    n: "1",
    h: "Detect",
    status: R.hasEverScanned ? "Scanning" : "Never run",
    flagged: false,
    p: (
      <>
        {`${sourceCount} release source${sourceCount === 1 ? "" : "s"} registered, ` +
          `${R.completedScanCount} scan${R.completedScanCount === 1 ? "" : "s"} completed. A source must be ` +
          `added by a human from a verified URL before a scan can look for anything against it — see `}
        <a href="#release-watch" className="underline underline-offset-2">
          release watch
        </a>
        .
      </>
    ),
  },
  {
    n: "2",
    h: "Evaluate",
    status: "Blocked",
    flagged: true,
    p:
      "Evaluating a model officially means calling a pinned model snapshot through its provider and " +
      "recording what it does, under the publication bar. That requires provisioned credentials and an " +
      "approved spend budget, and neither exists. Runs inside an AI assistant or agent tool — including " +
      "the self-run described below — are not this stage: the model is not pinned and the tool adds its " +
      "own instructions.",
  },
  {
    n: "3",
    h: "Score",
    status: "Not reached",
    flagged: false,
    p:
      `The scoring formula is fully specified (see the method), but has never run on real model output. ` +
      `${F.itemsWithTwoReviews} of ${F.itemCount} task-bank items are validated (two human reviews), so a score ` +
      `produced today would rest on ${F.itemsWithTwoReviews === 0 ? "items no one has validated" : "items not all of which are validated"}.`,
  },
  {
    n: "4",
    h: "Publish",
    status: `${F.evaluatedModelCount} published`,
    flagged: false,
    p:
      "A result publishes only when the evaluation behind it is complete, reproducible from a frozen " +
      "snapshot, and traceable to a recorded item-bank version. Nothing has met that bar yet.",
  },
];

export default function PipelineStages() {
  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
      {stages.map((s) => (
        <Panel key={s.n}>
          <p className="text-[0.75rem] tracking-wide text-muted-subtle uppercase mb-1">Stage {s.n}</p>
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <h3 className="text-[1.08rem]">{s.h}</h3>
            <span
              className={`text-[0.78rem] font-semibold whitespace-nowrap ${s.flagged ? "text-[#fb923c]" : "text-muted-subtle"}`}
            >
              {s.status}
            </span>
          </div>
          <p className="text-muted text-[0.88rem] leading-relaxed">{s.p}</p>
        </Panel>
      ))}
    </div>
  );
}
