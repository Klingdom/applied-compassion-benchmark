"use client";

import { useMemo, useState, useCallback } from "react";
import Container from "@/components/ui/Container";
import Panel from "@/components/ui/Panel";
import Pill from "@/components/ui/Pill";
import Callout from "@/components/ui/Callout";
import SectionHead from "@/components/ui/SectionHead";
import { DIMENSIONS } from "@/data/dimensions";
import {
  DIMENSION_CODES,
  evaluateComposite,
  type ScoreMap,
} from "@/lib/evaluation-scorer";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** One model-facing arm of a matched-counterfactual-pair item. */
export interface PromptVariant {
  variantId: string;
  label: string;
  prompt: string;
}

export interface ScorablePrompt {
  id: string;
  dim: string;
  type: string;
  title: string;
  text: string;
  observe: string;
  rubric: string[];
  draft: boolean;
  validationStatus: string;
  draftNote: string | null;
  /**
   * Present (>=2 entries) for matched-counterfactual-pair items — see the
   * SCORING MODEL comment above the prompt-rendering block below for how
   * these are scored. `null` for every ordinary single-prompt item.
   */
  variants: PromptVariant[] | null;
}

export interface DimMeta {
  code: string;
  name: string;
  desc: string;
}

const BAND_LABELS = ["1.0 Critical", "2.0 Developing", "3.0 Functional", "4.0 Established", "5.0 Exemplary"] as const;
const SCORE_COLORS: Record<number, string> = { 1: "#f87171", 2: "#fb923c", 3: "#fcd34d", 4: "#86efac", 5: "#7dd3fc" };

function dimColor(code: string): string {
  return DIMENSIONS.find((d) => d.code === code)?.color ?? "#7dd3fc";
}

function bandColor(band: string | null): string {
  const map: Record<string, string> = {
    Critical: "#f87171",
    Developing: "#fb923c",
    Functional: "#fcd34d",
    Established: "#86efac",
    Exemplary: "#7dd3fc",
  };
  return band ? (map[band] ?? "#7dd3fc") : "#6b6e7d";
}

/* ------------------------------------------------------------------ */
/* Export builders                                                     */
/* ------------------------------------------------------------------ */

const UNOFFICIAL_DISCLAIMER =
  "Self-serve evaluation aid. This is a single-rater, self-reported score — not an official Compassion Benchmark result. The published Model Index requires repeated trials, blinding, human rater panels, and adjudication, none of which this tool performs.";

function buildExportPayload(
  modelName: string,
  modelVersion: string,
  prompts: ScorablePrompt[],
  scores: ScoreMap,
  result: ReturnType<typeof evaluateComposite>,
) {
  return {
    meta: {
      tool: "Compassion Benchmark AI Evaluation Suite — self-serve scoring aid",
      official: false,
      disclaimer: UNOFFICIAL_DISCLAIMER,
      generatedAt: new Date().toISOString(),
      source: "compassionbenchmark.com/ai-evaluation-suite",
      model: { name: modelName.trim() || null, version: modelVersion.trim() || null },
    },
    composite: {
      status: result.status,
      score: result.composite,
      band: result.band,
      integrationPremium: result.integrationPremium,
      scoredScorableItems: result.scoredScorableCount,
      scorableItemsTotal: result.scorableTotal,
      draftItemsExcluded: result.draftTotal,
      missingDimensions: result.missingDimensions,
      note:
        result.status === "incomplete"
          ? "Composite withheld: at least one item must be scored in every dimension before a composite can be computed."
          : result.status === "partial"
            ? "Composite is PARTIAL — not all scorable items have been scored yet."
            : "All scorable (non-draft) items scored.",
    },
    dimensions: result.dimAggregates.map((d) => ({
      code: d.code,
      name: DIMENSIONS.find((x) => x.code === d.code)?.name ?? d.code,
      avgScore: d.avg,
      scoredCount: d.scoredCount,
      scorableCount: d.scorableCount,
      draftCount: d.draftCount,
    })),
    prompts: prompts.map((p) => ({
      id: p.id,
      dim: p.dim,
      type: p.type,
      title: p.title,
      validationStatus: p.validationStatus,
      score: p.draft ? null : (scores[p.id]?.score ?? null),
      notes: p.draft ? "" : (scores[p.id]?.notes ?? ""),
    })),
  };
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function csvCell(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function buildCSV(
  modelName: string,
  modelVersion: string,
  prompts: ScorablePrompt[],
  scores: ScoreMap,
  result: ReturnType<typeof evaluateComposite>,
): string {
  const lines: string[] = [];
  lines.push(csvCell("UNOFFICIAL SELF-REPORTED SCORE — " + UNOFFICIAL_DISCLAIMER));
  lines.push([csvCell("Model"), csvCell(modelName || "Not set"), csvCell("Version"), csvCell(modelVersion || "Not set")].join(","));
  lines.push(
    [
      csvCell("Composite status"),
      csvCell(result.status),
      csvCell("Score"),
      csvCell(result.composite ?? "—"),
      csvCell("Band"),
      csvCell(result.band ?? "—"),
      csvCell("Scored/Scorable"),
      csvCell(`${result.scoredScorableCount}/${result.scorableTotal}`),
      csvCell("Draft items excluded"),
      csvCell(result.draftTotal),
    ].join(","),
  );
  lines.push("");
  lines.push(["ID", "Dimension", "Type", "Title", "ValidationStatus", "Score", "Notes"].map(csvCell).join(","));
  prompts.forEach((p) => {
    lines.push(
      [
        p.id,
        p.dim,
        p.type,
        p.title,
        p.validationStatus,
        p.draft ? "" : (scores[p.id]?.score ?? ""),
        p.draft ? "" : (scores[p.id]?.notes ?? ""),
      ]
        .map(csvCell)
        .join(","),
    );
  });
  return lines.join("\n");
}

function buildScorecard(
  modelName: string,
  modelVersion: string,
  prompts: ScorablePrompt[],
  result: ReturnType<typeof evaluateComposite>,
): string {
  const scorable = prompts.filter((p) => !p.draft).length;
  let text = `COMPASSION BENCHMARK — AI EVALUATION SCORECARD (UNOFFICIAL)\n`;
  text += `${"=".repeat(58)}\n`;
  text += `${UNOFFICIAL_DISCLAIMER}\n\n`;
  text += `Model: ${modelName || "Not set"}\n`;
  text += `Version / snapshot: ${modelVersion || "Not set"}\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n`;
  text += `Scorable items scored: ${result.scoredScorableCount}/${scorable} (${result.draftTotal} draft items excluded, unscorable)\n\n`;

  if (result.status === "incomplete") {
    text += `COMPOSITE: withheld — pending at least one score in: ${result.missingDimensions.join(", ")}\n\n`;
  } else {
    text += `COMPOSITE SCORE: ${result.composite?.toFixed(1)} / 100  [${result.band}]${result.status === "partial" ? "  — PARTIAL" : ""}\n`;
    text += `Integration premium: ${result.integrationPremium?.toFixed(1)}\n\n`;
  }

  text += `DIMENSION SCORES\n`;
  result.dimAggregates.forEach((d) => {
    const name = DIMENSIONS.find((x) => x.code === d.code)?.name ?? d.code;
    const scoreStr = d.avg !== null ? d.avg.toFixed(2) : "—";
    text += `  ${d.code}  ${name.padEnd(18)} ${scoreStr} / 5.00  (${d.scoredCount}/${d.scorableCount} scored${d.draftCount ? `, ${d.draftCount} draft excluded` : ""})\n`;
  });
  text += `\nCanonical formula: computeCompositeFromDimensions (site/src/lib/scoring.ts)\n`;
  text += `Source: compassionbenchmark.com/ai-evaluation-suite`;
  return text;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function EvaluationScorer({
  prompts,
  dims,
}: {
  prompts: ScorablePrompt[];
  dims: DimMeta[];
}) {
  const [modelName, setModelName] = useState("");
  const [modelVersion, setModelVersion] = useState("");
  const [scores, setScores] = useState<ScoreMap>({});
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  // Per-arm copy affordance for matched-counterfactual-pair items, keyed by
  // `${itemId}:${variantId}` so each arm's "Copied" state is independent.
  const [variantCopyState, setVariantCopyState] = useState<Record<string, "idle" | "copied">>({});

  const handleCopyVariant = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setVariantCopyState((prev) => ({ ...prev, [key]: "copied" }));
      setTimeout(() => setVariantCopyState((prev) => ({ ...prev, [key]: "idle" })), 2000);
    });
  }, []);

  const setScore = useCallback((id: string, val: number) => {
    setScores((prev) => ({ ...prev, [id]: { score: prev[id]?.score === val ? null : val, notes: prev[id]?.notes ?? "" } }));
  }, []);

  const setNotes = useCallback((id: string, notes: string) => {
    setScores((prev) => ({ ...prev, [id]: { score: prev[id]?.score ?? null, notes } }));
  }, []);

  const resetAll = useCallback(() => {
    if (!window.confirm("Reset all scores and notes? This cannot be undone.")) return;
    setScores({});
  }, []);

  const result = useMemo(
    () => evaluateComposite(prompts, scores),
    [prompts, scores],
  );

  const handleExportJSON = () => {
    const payload = buildExportPayload(modelName, modelVersion, prompts, scores, result);
    download(
      `cb-eval-unofficial-${(modelName || "model").replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );
  };

  const handleExportCSV = () => {
    const csv = buildCSV(modelName, modelVersion, prompts, scores, result);
    download(
      `cb-eval-unofficial-${(modelName || "model").replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      "text/csv",
    );
  };

  const handleCopyScorecard = () => {
    const text = buildScorecard(modelName, modelVersion, prompts, result);
    navigator.clipboard.writeText(text).then(() => {
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    });
  };

  return (
    <>
      {/* Model identity + composite dashboard */}
      <section className="py-[30px]" id="evaluation-tool">
        <Container>
          <Callout className="mb-6">
            <p className="text-sm text-muted">
              <strong className="text-text">Unofficial self-serve tool.</strong> {UNOFFICIAL_DISCLAIMER} This
              tool does not call any model API — you run each prompt yourself and record what you observe.
            </p>
          </Callout>

          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-[18px] items-start">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-3">1. Model identity</h3>
              <label className="block text-xs font-mono uppercase tracking-wide text-muted mb-1">Model name</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. Claude, GPT, Gemini, in-house model..."
                className="w-full mb-3 min-h-[42px] px-3 rounded-[10px] border border-line bg-[rgba(255,255,255,0.04)] text-text text-sm focus:outline-none focus:border-[rgba(125,211,252,0.4)] placeholder:text-muted-subtle"
              />
              <label className="block text-xs font-mono uppercase tracking-wide text-muted mb-1">Version / snapshot (free text)</label>
              <input
                type="text"
                value={modelVersion}
                onChange={(e) => setModelVersion(e.target.value)}
                placeholder="e.g. 2026-08 snapshot, v4.2, checkpoint-1183..."
                className="w-full min-h-[42px] px-3 rounded-[10px] border border-line bg-[rgba(255,255,255,0.04)] text-text text-sm focus:outline-none focus:border-[rgba(125,211,252,0.4)] placeholder:text-muted-subtle"
              />
              <button
                onClick={resetAll}
                className="mt-4 inline-flex items-center justify-center min-h-[38px] px-4 rounded-[10px] text-sm font-semibold border border-line bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)] text-text transition-all duration-150"
              >
                Reset all scores
              </button>
            </Panel>

            <Panel>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="text-[1.08rem] font-bold">2. Live composite</h3>
                <span className="text-xs font-mono text-muted">
                  {result.scoredScorableCount}/{result.scorableTotal} scorable items scored
                  {result.draftTotal > 0 ? ` · ${result.draftTotal} draft excluded` : ""}
                </span>
              </div>

              {result.status === "incomplete" ? (
                <div className="bg-yellow-500/10 border-l-[3px] border-yellow-500 rounded-r-md px-3 py-2.5 text-sm">
                  <p className="font-mono text-xs font-bold uppercase tracking-wide text-yellow-500 mb-1">Composite unavailable</p>
                  <p className="text-muted">
                    Score at least one item in every dimension to unlock the composite. Missing:{" "}
                    <strong className="text-text">{result.missingDimensions.join(", ")}</strong>. Unscored items are
                    never treated as zero.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-4 mb-4">
                  <div className="font-mono text-[2.2rem] font-bold" style={{ color: bandColor(result.band) }}>
                    {result.composite?.toFixed(1)}
                  </div>
                  <div>
                    <div className="font-bold" style={{ color: bandColor(result.band) }}>
                      {result.band}
                      {result.status === "partial" && (
                        <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-500 align-middle">
                          PARTIAL
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      Integration premium: {result.integrationPremium?.toFixed(1)}
                    </div>
                  </div>
                </div>
              )}

              <p className="font-mono text-xs font-bold uppercase tracking-wide text-muted mb-2 mt-2">
                Dimension sub-scores
              </p>
              <div className="flex flex-col gap-2">
                {result.dimAggregates.map((d) => {
                  const name = DIMENSIONS.find((x) => x.code === d.code)?.name ?? d.code;
                  const pct = d.avg !== null ? ((d.avg - 1) / 4) * 100 : 0;
                  return (
                    <div key={d.code} className="flex items-center gap-2 text-xs">
                      <span className="font-mono w-9 shrink-0" style={{ color: dimColor(d.code) }}>{d.code}</span>
                      <span className="w-28 shrink-0 text-muted truncate">{name}</span>
                      <div className="flex-1 h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: dimColor(d.code) }} />
                      </div>
                      <span className="font-mono w-10 text-right text-muted">{d.avg !== null ? d.avg.toFixed(1) : "—"}</span>
                      <span className="font-mono w-12 text-right text-muted-subtle">{d.scoredCount}/{d.scorableCount}</span>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Test prompts with scoring */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="3. Run and score each prompt"
            description="Copy each prompt into your AI system, observe the response, then score 1–5 using the rubric anchors shown. Items pending review — unfilled template drafts, and items an AI agent authored or repaired that no human has reviewed yet — are marked and cannot be scored."
          />

          {dims.map((dim) => {
            const dimPrompts = prompts.filter((p) => p.dim === dim.code);
            if (dimPrompts.length === 0) return null;
            return (
              <div key={dim.code} className="mb-8">
                <h3 className="text-xl font-bold mb-4">{dim.code} &middot; {dim.name}</h3>
                <div className="space-y-4">
                  {dimPrompts.map((p) => {
                    const sc = scores[p.id]?.score ?? null;
                    return (
                      <Panel key={p.id} className={p.draft ? "opacity-90" : ""}>
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          <Pill>{p.id}</Pill>
                          <Pill>{p.type}</Pill>
                          <span className="font-semibold">{p.title}</span>
                          {p.variants && (
                            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[rgba(125,211,252,0.12)] text-accent border border-[rgba(125,211,252,0.3)]">
                              MATCHED PAIR &middot; {p.variants.length} ARMS
                            </span>
                          )}
                          {p.draft && (
                            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                              {p.validationStatus === "draft-authored-unreviewed"
                                ? "UNREVIEWED — pending human review"
                                : "DRAFT — not executable"}
                            </span>
                          )}
                          {!p.draft && sc && (
                            <span
                              className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full"
                              style={{ background: SCORE_COLORS[sc] + "22", color: SCORE_COLORS[sc] }}
                            >
                              {sc}.0
                            </span>
                          )}
                        </div>

                        {p.draft ? (
                          <div className="bg-red-500/10 border-l-[3px] border-red-500 rounded-r-md px-3 py-2.5 mb-3 text-sm">
                            <p className="font-mono text-xs font-bold uppercase tracking-wide text-red-400 mb-1">
                              {p.validationStatus === "draft-authored-unreviewed"
                                ? "AI-authored or AI-repaired item — pending human review"
                                : "Draft item — unfilled template placeholder"}
                            </p>
                            <p className="text-muted">
                              {p.draftNote ??
                                (p.validationStatus === "draft-authored-unreviewed"
                                  ? "This item was authored or repaired by an AI agent and has not been reviewed by a human. It is executable but is excluded from scoring and from the composite until reviewed and promoted."
                                  : "This prompt contains an unfilled bracketed placeholder and is not directly executable against a model as written. It is excluded from scoring and from the composite until an editor fills or removes the placeholder.")}
                            </p>
                          </div>
                        ) : null}

                        {p.variants ? (
                          // Matched-counterfactual-pair item: both arms rendered as ONE
                          // item with two parts (not two separate prompt cards) so a
                          // rater understands they are scoring a comparison, per the
                          // task-family requirement this item exists to satisfy.
                          <div className="mb-3">
                            <p className="text-muted text-sm mb-2">
                              Run <strong className="text-text">both arms below</strong> against the same model
                              (same session or fresh sessions, your choice — note which in your scoring notes), then
                              score the pair once using the rubric further down.
                            </p>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                              {p.variants.map((v) => {
                                const copyKey = `${p.id}:${v.variantId}`;
                                const copied = variantCopyState[copyKey] === "copied";
                                return (
                                  <div key={v.variantId} className="border border-line rounded-lg overflow-hidden">
                                    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/[0.04] border-b border-line">
                                      {/* `label` is evaluator-facing scaffolding (per
                                          meta.fieldSeparationPolicy) — it names the arm for
                                          the rater but is never itself sent to a model. */}
                                      <span className="text-xs font-mono font-semibold text-muted">{v.label}</span>
                                      <button
                                        onClick={() => handleCopyVariant(copyKey, v.prompt)}
                                        className="text-xs font-mono px-2 py-0.5 rounded-full border border-line bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-muted transition-all duration-150 cursor-pointer shrink-0"
                                      >
                                        {copied ? "Copied ✓" : "Copy arm"}
                                      </button>
                                    </div>
                                    <div className="bg-black/30 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                      {v.prompt}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-black/30 border border-line rounded-lg p-4 mb-3 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                            {p.text}
                          </div>
                        )}

                        <div className="bg-yellow-500/10 border-l-[3px] border-yellow-500 rounded-r-md px-3 py-2 mb-4 text-sm">
                          <p className="font-mono text-xs font-bold uppercase tracking-wide text-yellow-500 mb-1">What to observe</p>
                          <p className="text-muted">{p.observe}</p>
                        </div>

                        {p.variants && (
                          // SCORING MODEL for matched-counterfactual-pair items: ONE score
                          // per item per trial, not one score per arm.
                          //
                          // Why: the item has a single `anchors` set and a single dimension,
                          // and every anchor level (see INT-1-B) is written as a cross-arm
                          // comparison — "helps with one and refuses the other" (1.0) up to
                          // "identical quality, identical caveating" (5.0). The anchors do
                          // not describe either arm in isolation, so there is no per-arm
                          // rubric to score against; the measured construct IS the symmetry
                          // between arms, not the quality of either response alone.
                          //
                          // A per-arm-plus-derived-asymmetry design was considered and
                          // rejected: it would require either (a) a second rubric that does
                          // not exist in the task bank, or (b) collapsing two independently
                          // meaningful numbers back into one before this reached
                          // site/scripts/lib/evaluation-statistics.mjs, which expects exactly
                          // one { itemId, score } per item per trial. Scoring the pair once
                          // satisfies that contract with no reduction step and no invented
                          // rubric — the rater reads both responses, then records a single
                          // 1-5 judgment of how symmetrically the model treated them, keyed
                          // to this item's existing `p.id` exactly like any other item.
                          <div className="bg-white/[0.03] border-l-[3px] border-accent rounded-r-md px-3 py-2 mb-3 text-sm">
                            <p className="font-mono text-xs font-bold uppercase tracking-wide text-accent mb-1">
                              Scoring this pair
                            </p>
                            <p className="text-muted">
                              One score for the whole item. Judge the symmetry between the two responses above using
                              the anchors below — do not score either arm individually.
                            </p>
                          </div>
                        )}

                        <p className="font-mono text-xs font-bold uppercase tracking-wide text-muted mb-2">Scoring Rubric</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-4">
                          {p.rubric.map((text, i) => (
                            <div key={i} className="bg-white/[0.03] border border-line rounded-md p-3 text-xs leading-relaxed">
                              <p className="font-mono font-semibold mb-1">{BAND_LABELS[i]}</p>
                              <p className="text-muted">{text}</p>
                            </div>
                          ))}
                        </div>

                        {p.draft ? (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-line text-sm text-muted-subtle">
                            Scoring disabled — item pending review.
                          </div>
                        ) : (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.03)] flex-wrap">
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map((v) => {
                                const selected = sc === v;
                                return (
                                  <button
                                    key={v}
                                    onClick={() => setScore(p.id, v)}
                                    aria-pressed={selected}
                                    aria-label={`Score ${p.id} as ${v} (${BAND_LABELS[v - 1]})`}
                                    className="w-9 h-9 rounded-lg border font-mono text-sm font-semibold transition-all duration-150 cursor-pointer"
                                    style={
                                      selected
                                        ? { background: SCORE_COLORS[v], borderColor: SCORE_COLORS[v], color: "#0a0c10" }
                                        : { borderColor: "var(--line)" }
                                    }
                                  >
                                    {v}
                                  </button>
                                );
                              })}
                            </div>
                            <input
                              type="text"
                              value={scores[p.id]?.notes ?? ""}
                              onChange={(e) => setNotes(p.id, e.target.value)}
                              placeholder="Notes justifying this score (optional)..."
                              className="flex-1 min-w-[200px] min-h-[36px] px-3 rounded-[8px] border border-line bg-[rgba(255,255,255,0.04)] text-text text-sm focus:outline-none focus:border-[rgba(125,211,252,0.4)] placeholder:text-muted-subtle"
                            />
                          </div>
                        )}
                      </Panel>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </Container>
      </section>

      {/* Export */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="4. Export & API"
            description="Export your evaluation as structured JSON, a flat CSV, or a plain-text scorecard. Every export is explicitly labelled unofficial and self-reported — none of these outputs are a published Compassion Benchmark score."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[rgba(255,255,255,0.03)] border border-line rounded-[20px] p-5 flex flex-col gap-3">
              <h3 className="text-[1.08rem] font-bold">Export JSON</h3>
              <p className="text-muted text-sm flex-1">
                Full structured output: model identity, per-prompt scores and notes, dimension averages, composite
                status/score/band, and an explicit <code>official: false</code> flag.
              </p>
              <button
                onClick={handleExportJSON}
                className="inline-flex items-center justify-center min-h-[42px] px-4 rounded-[10px] font-bold bg-gradient-to-br from-accent to-accent-2 text-[#07111f] border-transparent transition-all duration-150 hover:from-[#8bddff] hover:to-[#6caefb]"
              >
                Download JSON
              </button>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] border border-line rounded-[20px] p-5 flex flex-col gap-3">
              <h3 className="text-[1.08rem] font-bold">Export CSV</h3>
              <p className="text-muted text-sm flex-1">
                Flat table of all prompt scores with ID, dimension, validation status, score, and notes. Header rows
                carry the unofficial disclaimer and composite summary.
              </p>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center justify-center min-h-[42px] px-4 rounded-[10px] font-bold bg-gradient-to-br from-accent to-accent-2 text-[#07111f] border-transparent transition-all duration-150 hover:from-[#8bddff] hover:to-[#6caefb]"
              >
                Download CSV
              </button>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] border border-line rounded-[20px] p-5 flex flex-col gap-3">
              <h3 className="text-[1.08rem] font-bold">Copy Score Card</h3>
              <p className="text-muted text-sm flex-1">
                Copy a formatted plain-text scorecard to clipboard for documentation, pull requests, or internal
                evaluation notes.
              </p>
              <button
                onClick={handleCopyScorecard}
                className="inline-flex items-center justify-center min-h-[42px] px-4 rounded-[10px] font-bold border border-line bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)] text-text transition-all duration-150"
              >
                {copyState === "copied" ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

/** Exposed for the fixture test to sanity-check the dimension code order. */
export { DIMENSION_CODES };
