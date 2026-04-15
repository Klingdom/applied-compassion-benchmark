"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Callout from "@/components/ui/Callout";
import Panel from "@/components/ui/Panel";
import { DIMENSIONS, BAND_DESCS } from "@/data/dimensions";
import type { Dimension } from "@/data/dimensions";

/* ------------------------------------------------------------------ */
/* Scoring helpers                                                     */
/* ------------------------------------------------------------------ */

const SCORE_LABELS = ["Absent", "Minimal", "Developing", "Established", "Exemplary"] as const;
const SCORE_COLORS = ["#f87171", "#fb923c", "#fcd34d", "#86efac", "#7dd3fc"] as const;

function calcScores(scores: Record<string, number>) {
  const dimScores: Record<string, number> = {};
  DIMENSIONS.forEach((d) => {
    const vals = d.subdims.map((s) => scores[s.code] ?? 1);
    dimScores[d.code] = vals.reduce((a, b) => a + b, 0) / vals.length;
  });

  const dimVals = Object.values(dimScores);
  const dimCount = DIMENSIONS.length;
  const baseAvg = dimVals.reduce((a, b) => a + b, 0) / dimCount;
  const baseComposite = ((baseAvg - 1) / 4) * 100;

  const mean = dimVals.reduce((a, b) => a + b, 0) / dimCount;
  const variance = dimVals.reduce((a, b) => a + (b - mean) ** 2, 0) / dimCount;
  const stdDev = Math.sqrt(variance);

  let consistencyMult: number;
  if (stdDev <= 1.5) consistencyMult = 1.0;
  else if (stdDev <= 3.0) consistencyMult = 0.75;
  else if (stdDev <= 5.0) consistencyMult = 0.4;
  else consistencyMult = 0.1;

  const weakDims = dimVals.filter((v) => v < 4.0).length;
  const weaknessFactor = Math.max(0, 1 - weakDims * 0.2);

  const hasHarm = Object.values(scores).some((v) => v === 0);
  const integrationPremium = hasHarm ? 0 : 20 * consistencyMult * weaknessFactor;

  const final = Math.min(100, Math.max(0, baseComposite + integrationPremium));

  return { dimScores, final: Math.round(final * 10) / 10, integrationPremium };
}

function getBand(score: number) {
  if (score <= 20) return "Critical";
  if (score <= 40) return "Developing";
  if (score <= 60) return "Functional";
  if (score <= 80) return "Established";
  return "Exemplary";
}

function getBandColor(band: string) {
  const map: Record<string, string> = {
    Critical: "#f87171",
    Developing: "#fb923c",
    Functional: "#fcd34d",
    Established: "#86efac",
    Exemplary: "#7dd3fc",
  };
  return map[band] ?? "#7dd3fc";
}

function generateFallbackRecommendations(
  dimScores: Record<string, number>,
  final: number,
  band: string,
) {
  const sorted = [...DIMENSIONS].sort((a, b) => dimScores[a.code] - dimScores[b.code]);
  const weakest = sorted.slice(0, 3);
  const strongest = sorted.slice(-2).reverse();

  const items = weakest.map((d) => {
    const s = dimScores[d.code].toFixed(1);
    return { name: d.name, code: d.code, score: s };
  });

  return { items, strongest, band, final, desc: BAND_DESCS[band] };
}

/* ------------------------------------------------------------------ */
/* Tab type                                                            */
/* ------------------------------------------------------------------ */

type Tab = "explore" | "assess" | "results";

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function SelfAssessment() {
  const [tab, setTab] = useState<Tab>("explore");
  const [activeDimCode, setActiveDimCode] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const [currentDimIdx, setCurrentDimIdx] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [animateRing, setAnimateRing] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);
  const [email, setEmail] = useState("");
  const [emailUnlocked, setEmailUnlocked] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  const detailRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  // Check localStorage for previously entered email
  useEffect(() => {
    const saved = localStorage.getItem("cb_email");
    if (saved) {
      setEmail(saved);
      setEmailUnlocked(true);
    }
  }, []);

  const totalSubdims = DIMENSIONS.reduce((a, d) => a + d.subdims.length, 0);
  const answeredCount = Object.keys(scores).length;
  const progressPct = Math.round((answeredCount / totalSubdims) * 100);

  const recordScore = useCallback((code: string, val: number) => {
    setScores((prev) => ({ ...prev, [code]: val }));
  }, []);

  const recordEvidence = useCallback((code: string, val: string) => {
    setEvidence((prev) => ({ ...prev, [code]: val }));
  }, []);

  const goToDim = useCallback(
    (idx: number) => {
      if (idx < 0 || idx > 7) return;
      setCurrentDimIdx(idx);
      if (dotsRef.current) {
        dotsRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    },
    [],
  );

  const finishAssessment = useCallback(() => {
    if (answeredCount < totalSubdims) {
      if (
        !window.confirm(
          `You have ${totalSubdims - answeredCount} unanswered questions. Missing scores will default to 1 (Absent). Continue?`,
        )
      )
        return;
    }
    setShowResults(true);
    setTab("results");
    setTimeout(() => {
      setAnimateRing(true);
      setAnimateBars(true);
    }, 100);
  }, [answeredCount, totalSubdims]);

  const handleEmailSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setEmailSubmitting(true);

    // Store in localStorage as fallback
    localStorage.setItem("cb_email", email.trim());

    // Calculate scores for submission
    const { final } = calcScores(scores);
    const band = getBand(final);

    // Submit to Formspree for lead capture
    const FORMSPREE_FORM_ID = "xojyjllo";
    fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        score: final,
        band,
        source: "self-assessment",
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently fail — localStorage fallback is already saved
    });

    // Small delay to feel intentional
    setTimeout(() => {
      setEmailUnlocked(true);
      setEmailSubmitting(false);
    }, 400);
  }, [email, scores]);

  const resetAssessment = useCallback(() => {
    if (!window.confirm("Reset all scores and start a new assessment?")) return;
    setScores({});
    setEvidence({});
    setCurrentDimIdx(0);
    setShowResults(false);
    setAnimateRing(false);
    setAnimateBars(false);
    setTab("assess");
  }, []);

  /* ------------------------------------------------------------------ */
  /* Explore tab                                                         */
  /* ------------------------------------------------------------------ */

  const toggleDimDetail = (code: string) => {
    if (activeDimCode === code) {
      setActiveDimCode(null);
    } else {
      setActiveDimCode(code);
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  };

  const renderExplore = () => {
    const activeDim = DIMENSIONS.find((d) => d.code === activeDimCode);
    return (
      <div>
        <section className="pt-16 pb-8">
          <Container>
            <Eyebrow>8 Dimensions &middot; 40 Subdimensions &middot; 0&ndash;100 Scale</Eyebrow>
            <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.08] tracking-[-0.02em] max-w-[820px] mb-3.5">
              Understanding <em className="text-accent italic">Institutional</em> Compassion
            </h1>
            <p className="text-muted text-[1.05rem] max-w-[680px] mb-6">
              Explore the Compassion Benchmark framework — how it measures whether institutions
              recognize, respond to, and reduce suffering across eight core dimensions.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setTab("assess")}
                className="inline-flex items-center justify-center min-h-[46px] px-5 rounded-xl font-bold bg-gradient-to-br from-accent to-accent-2 text-[#07111f] border-transparent transition-all duration-150 hover:from-[#8bddff] hover:to-[#6caefb]"
              >
                Take the Self-Assessment &rarr;
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("dim-grid-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center justify-center min-h-[46px] px-5 rounded-xl font-semibold border border-line bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)] text-text transition-all duration-150"
              >
                Explore Dimensions
              </button>
            </div>
          </Container>
        </section>

        <section id="dim-grid-section" className="pb-10">
          <Container>
            <Callout className="mb-7">
              <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] mb-2">
                The 8 Dimensions of Compassionate Practice
              </h2>
              <p className="text-muted max-w-[800px]">
                The benchmark measures institutions across eight interlocking dimensions. Select any
                dimension below to explore its definition, subdimensions, and behavioral anchors.
              </p>
            </Callout>

            {/* Score legend */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-7">
              {SCORE_LABELS.map((label, i) => (
                <div
                  key={label}
                  className="bg-[rgba(255,255,255,0.03)] border border-line rounded-xl p-3.5 text-center"
                >
                  <div className="text-2xl font-extrabold" style={{ color: SCORE_COLORS[i] }}>
                    {i + 1}
                  </div>
                  <div
                    className="text-[0.72rem] font-bold mt-0.5"
                    style={{ color: SCORE_COLORS[i] }}
                  >
                    {label.toUpperCase()}
                  </div>
                  <p className="text-[0.78rem] text-muted mt-1">
                    {
                      [
                        "The behavior does not exist",
                        "Exists nominally or reactively",
                        "Inconsistent or partial",
                        "Systematic and documented",
                        "Independently verified, leading",
                      ][i]
                    }
                  </p>
                </div>
              ))}
            </div>

            {/* Dimension grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
              {DIMENSIONS.map((d) => (
                <button
                  key={d.code}
                  onClick={() => toggleDimDetail(d.code)}
                  className={`text-left bg-[rgba(255,255,255,0.03)] border rounded-[20px] p-5 cursor-pointer transition-all duration-200 relative overflow-hidden hover:-translate-y-0.5 hover:border-[rgba(125,211,252,0.2)] ${
                    activeDimCode === d.code
                      ? "border-[rgba(125,211,252,0.35)] bg-[rgba(125,211,252,0.07)]"
                      : "border-line"
                  }`}
                >
                  <div
                    className="inline-flex items-center justify-center w-[38px] h-[38px] rounded-[10px] font-extrabold text-[0.85rem] mb-3"
                    style={{ background: d.color + "20", color: d.color }}
                  >
                    {d.code}
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">{d.name}</h3>
                  <p className="text-[0.84rem] text-muted leading-[1.45]">{d.desc}</p>
                  <div className="mt-3 text-[0.78rem] text-muted">
                    {d.subdims.length} subdimensions
                  </div>
                </button>
              ))}
            </div>

            {/* Dimension detail */}
            {activeDim && (
              <div
                ref={detailRef}
                className="bg-gradient-to-b from-[rgba(255,255,255,0.045)] to-[rgba(255,255,255,0.02)] border border-line rounded-[22px] p-[30px] mb-8 animate-[fadeIn_0.3s_ease]"
              >
                <div className="flex items-start gap-[18px] mb-5 pb-5 border-b border-line">
                  <div
                    className="w-14 h-14 rounded-[14px] flex items-center justify-center font-extrabold text-lg shrink-0"
                    style={{
                      background: activeDim.color + "20",
                      color: activeDim.color,
                    }}
                  >
                    {activeDim.code}
                  </div>
                  <div>
                    <h2 className="text-[1.8rem] mb-1.5">{activeDim.name}</h2>
                    <p className="text-muted text-[0.95rem] max-w-[700px]">
                      {activeDim.longDesc}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {activeDim.subdims.map((s) => (
                    <div
                      key={s.code}
                      className="bg-[rgba(255,255,255,0.03)] border border-line rounded-[14px] p-4"
                    >
                      <h4 className="text-[0.9rem] font-semibold mb-1.5">
                        <span
                          className="text-[0.75rem] font-bold block mb-1"
                          style={{ color: activeDim.color }}
                        >
                          {s.code}
                        </span>
                        {s.name}
                      </h4>
                      <p className="text-[0.8rem] text-muted leading-[1.4] mb-3.5">{s.desc}</p>
                      <div>
                        {s.anchors.map((a, i) => (
                          <div
                            key={i}
                            className="flex gap-2 mb-1.5 text-[0.76rem] items-start"
                          >
                            <span
                              className="rounded px-1.5 py-0.5 font-bold whitespace-nowrap shrink-0"
                              style={{
                                background: SCORE_COLORS[i] + "20",
                                color: SCORE_COLORS[i],
                              }}
                            >
                              {i + 1}
                            </span>
                            <span className="text-muted">{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bands */}
            <Callout className="mt-2 mb-5">
              <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] mb-2">Composite Score Bands</h2>
              <p className="text-muted">
                After scoring all 8 dimensions, a composite 0&ndash;100 score is calculated with an
                integration premium that rewards consistency and penalizes active harm.
              </p>
            </Callout>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-8">
              {[
                { range: "0\u201320", name: "Critical", color: "#f87171" },
                { range: "21\u201340", name: "Developing", color: "#fb923c" },
                { range: "41\u201360", name: "Functional", color: "#fcd34d" },
                { range: "61\u201380", name: "Established", color: "#86efac" },
                { range: "81\u2013100", name: "Exemplary", color: "#7dd3fc" },
              ].map((b) => (
                <div
                  key={b.name}
                  className="p-4 rounded-[14px] text-center border border-line bg-[rgba(255,255,255,0.03)]"
                >
                  <div className="text-xl font-extrabold" style={{ color: b.color }}>
                    {b.range}
                  </div>
                  <div className="text-[0.82rem] text-muted mt-1">{b.name}</div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </div>
    );
  };

  /* ------------------------------------------------------------------ */
  /* Assess tab                                                          */
  /* ------------------------------------------------------------------ */

  const renderAssess = () => {
    const dim = DIMENSIONS[currentDimIdx];

    return (
      <section className="py-5 pb-16">
        <Container>
          <div className="pt-12 pb-6">
            <Eyebrow>Self-Assessment Questionnaire &middot; ACB-SAQ-001</Eyebrow>
            <h1 className="text-[clamp(2rem,4vw,3.2rem)] tracking-[-0.02em] mb-3">
              Measure your institution&apos;s compassion
            </h1>
            <p className="text-muted max-w-[660px] text-base mb-2">
              Rate your institution across all 8 dimensions and 40 subdimensions. Takes ~25 minutes.
              Scores are based on documented reality, not aspiration.
            </p>
            <p className="text-[0.82rem] text-muted-subtle">
              This is a self-reported Tier 5 assessment — not an official ACB certification. Use for
              internal benchmarking and improvement planning.
            </p>
          </div>

          {/* Progress */}
          <div className="mb-2">
            <div className="bg-[rgba(255,255,255,0.06)] rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-400"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[0.82rem] text-muted mt-2 mb-6">
              <span>
                {answeredCount === 0
                  ? "Not started"
                  : `${answeredCount} of ${totalSubdims} subdimensions scored`}
              </span>
              <span>{progressPct}%</span>
            </div>
          </div>

          {/* Dimension nav dots */}
          <div ref={dotsRef} className="flex gap-2 items-center justify-center mb-5 flex-wrap">
            {DIMENSIONS.map((d, i) => {
              const allScored = d.subdims.every((s) => scores[s.code] !== undefined);
              const isCurrent = i === currentDimIdx;
              return (
                <button
                  key={d.code}
                  onClick={() => goToDim(i)}
                  title={d.name}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[0.7rem] font-bold cursor-pointer transition-all duration-150 border ${
                    isCurrent
                      ? "bg-[rgba(125,211,252,0.15)]"
                      : allScored
                        ? "bg-[rgba(134,239,172,0.12)] border-[rgba(134,239,172,0.3)] text-[#86efac]"
                        : "border-line bg-[rgba(255,255,255,0.04)] text-muted"
                  }`}
                  style={
                    isCurrent ? { color: d.color, borderColor: d.color } : undefined
                  }
                >
                  {d.code}
                </button>
              );
            })}
          </div>

          {/* Current dimension section */}
          <Panel className="mb-5 animate-[fadeIn_0.3s_ease]" key={dim.code}>
            <div className="flex items-center gap-3.5 mb-6 pb-[18px] border-b border-line">
              <div
                className="w-11 h-11 rounded-[11px] flex items-center justify-center font-extrabold text-[0.9rem] shrink-0"
                style={{ background: dim.color + "20", color: dim.color }}
              >
                {dim.code}
              </div>
              <div>
                <div className="text-[1.2rem]">
                  Dimension {currentDimIdx + 1} of 8: {dim.name}
                </div>
                <div className="text-muted text-[0.85rem] mt-0.5">{dim.desc}</div>
              </div>
            </div>

            {dim.subdims.map((s) => (
              <div
                key={s.code}
                className="bg-[rgba(255,255,255,0.03)] border border-line rounded-2xl p-5 mb-4"
              >
                <h4 className="font-semibold text-[0.95rem] mb-1">
                  <span
                    className="text-[0.75rem] font-bold"
                    style={{ color: dim.color }}
                  >
                    {s.code}
                  </span>{" "}
                  &nbsp;{s.name}
                </h4>
                <p className="text-[0.85rem] text-muted mb-4 leading-[1.45]">{s.desc}</p>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map((v) => {
                    const selected = scores[s.code] === v;
                    return (
                      <label key={v} className="flex flex-col items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`score_${s.code}`}
                          value={v}
                          checked={selected}
                          onChange={() => recordScore(s.code, v)}
                          className="hidden"
                        />
                        <div
                          className={`w-[52px] h-[52px] rounded-xl border-2 flex items-center justify-center font-bold text-[1.05rem] transition-all duration-150 cursor-pointer ${
                            selected ? "" : "border-line bg-[rgba(255,255,255,0.04)] hover:border-[rgba(125,211,252,0.3)] hover:bg-[rgba(125,211,252,0.08)]"
                          }`}
                          style={
                            selected
                              ? {
                                  borderColor: dim.color,
                                  background: dim.color + "20",
                                  color: dim.color,
                                }
                              : undefined
                          }
                        >
                          {v}
                        </div>
                        <span className="text-[0.7rem] text-muted text-center max-w-[52px]">
                          {SCORE_LABELS[v - 1]}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-1.5 text-[0.78rem] text-muted">{s.anchors[2]}</div>
                <textarea
                  className="w-full mt-3 p-2.5 px-3.5 bg-[rgba(255,255,255,0.04)] border border-line rounded-[10px] text-text text-[0.85rem] resize-y min-h-[60px] transition-all duration-150 focus:outline-none focus:border-[rgba(125,211,252,0.3)] focus:bg-[rgba(125,211,252,0.04)] placeholder:text-muted"
                  placeholder="Evidence notes (optional): specific documents, examples, or observations that justify your score..."
                  value={evidence[s.code] ?? ""}
                  onChange={(e) => recordEvidence(s.code, e.target.value)}
                />
              </div>
            ))}

            <div className="flex justify-between mt-6 gap-3">
              <button
                onClick={() => goToDim(currentDimIdx - 1)}
                disabled={currentDimIdx === 0}
                className="inline-flex items-center justify-center min-h-[46px] px-5 rounded-xl font-semibold border border-line bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)] text-text transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                &larr; Previous
              </button>
              <span className="text-muted text-[0.85rem] self-center">
                {currentDimIdx + 1} / 8
              </span>
              {currentDimIdx < 7 ? (
                <button
                  onClick={() => goToDim(currentDimIdx + 1)}
                  className="inline-flex items-center justify-center min-h-[46px] px-5 rounded-xl font-bold bg-gradient-to-br from-accent to-accent-2 text-[#07111f] border-transparent transition-all duration-150 hover:from-[#8bddff] hover:to-[#6caefb]"
                >
                  Next &rarr;
                </button>
              ) : (
                <button
                  onClick={finishAssessment}
                  className="inline-flex items-center justify-center min-h-[46px] px-5 rounded-xl font-bold bg-gradient-to-br from-accent to-accent-2 text-[#07111f] border-transparent transition-all duration-150 hover:from-[#8bddff] hover:to-[#6caefb]"
                >
                  Complete Assessment &rarr;
                </button>
              )}
            </div>
          </Panel>
        </Container>
      </section>
    );
  };

  /* ------------------------------------------------------------------ */
  /* Results tab                                                         */
  /* ------------------------------------------------------------------ */

  const renderResults = () => {
    const { dimScores, final, integrationPremium } = calcScores(scores);
    const band = getBand(final);
    const bandColor = getBandColor(band);
    const reco = generateFallbackRecommendations(dimScores, final, band);

    // SVG ring math: circumference = 2 * PI * 70 ~= 439.8
    const circumference = 2 * Math.PI * 70;
    const dashOffset = animateRing ? circumference - (final / 100) * circumference : circumference;

    return (
      <section className="py-5 pb-16 animate-[fadeIn_0.4s_ease]">
        <Container>
          {/* Score hero */}
          <div className="bg-gradient-to-br from-[rgba(125,211,252,0.10)] to-[rgba(96,165,250,0.08)] border border-[rgba(125,211,252,0.18)] rounded-[28px] p-9 mb-7 text-center">
            <Eyebrow>Assessment Complete</Eyebrow>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] mb-2">
              Your Compassion Benchmark Score
            </h2>

            {/* Score ring */}
            <div className="relative w-40 h-40 mx-auto my-5">
              <svg
                className="transform -rotate-90"
                width="160"
                height="160"
                viewBox="0 0 160 160"
              >
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={bandColor}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{
                    transition: "stroke-dashoffset 1.5s cubic-bezier(.25,.46,.45,.94)",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className="text-[2.4rem] leading-none font-normal"
                  style={{ color: bandColor }}
                >
                  {Math.round(final)}
                </div>
                <div className="text-[0.75rem] text-muted">/ 100</div>
              </div>
            </div>

            <div className="text-lg font-bold mt-1" style={{ color: bandColor }}>
              {band.toUpperCase()}
            </div>
            <p className="text-muted text-[0.9rem] max-w-[520px] mx-auto mt-2">
              {BAND_DESCS[band]}
            </p>
          </div>

          {/* Email gate */}
          {!emailUnlocked && (
            <div className="bg-gradient-to-b from-[rgba(255,255,255,0.045)] to-[rgba(255,255,255,0.02)] border border-[rgba(125,211,252,0.25)] rounded-[22px] p-8 mb-7 text-center">
              <h3 className="text-xl font-bold mb-2">Unlock your full results</h3>
              <p className="text-muted max-w-[480px] mx-auto mb-5">
                Enter your email to see your dimension-level breakdown, strength and weakness analysis, and personalized improvement recommendations.
              </p>
              <form onSubmit={handleEmailSubmit} className="flex gap-3 max-w-[440px] mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 min-h-[48px] rounded-[14px] border border-line bg-panel-2 text-text px-3.5 text-base focus:outline-none focus:border-[rgba(125,211,252,0.4)]"
                />
                <button
                  type="submit"
                  disabled={emailSubmitting}
                  className="inline-flex items-center justify-center min-h-[48px] px-5 rounded-[14px] font-bold bg-gradient-to-br from-accent to-accent-2 text-[#07111f] border-transparent transition-all duration-150 hover:from-[#8bddff] hover:to-[#6caefb] disabled:opacity-60"
                >
                  {emailSubmitting ? "..." : "Unlock Results"}
                </button>
              </form>
              <p className="text-[0.78rem] text-muted-subtle mt-3">
                No spam. We may send you benchmark updates and new index releases.
              </p>
            </div>
          )}

          {/* Gated content: dimension bars + recommendations */}
          {emailUnlocked && (
            <>
          {/* Dimension bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-7">
            {DIMENSIONS.map((d) => {
              const s = dimScores[d.code];
              const pct = ((s - 1) / 4) * 100;
              return (
                <div
                  key={d.code}
                  className="bg-[rgba(255,255,255,0.03)] border border-line rounded-[14px] p-4"
                >
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="font-semibold text-[0.9rem]">
                      <span
                        className="font-bold text-[0.8rem]"
                        style={{ color: d.color }}
                      >
                        {d.code}
                      </span>{" "}
                      {d.name}
                    </span>
                    <span className="font-bold text-[0.9rem]" style={{ color: d.color }}>
                      {s.toFixed(1)}/5.0
                    </span>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.06)] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        background: d.color,
                        width: animateBars ? `${pct}%` : "0%",
                        transition: "width 1.2s cubic-bezier(.25,.46,.45,.94)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendations */}
          <Panel className="mb-5">
            <h3 className="text-2xl mb-[18px]">Improvement Recommendations</h3>
            <div className="leading-[1.7] text-[0.95rem]">
              <h4 className="text-accent text-base font-semibold mt-[18px] mb-1.5">
                Overall Assessment
              </h4>
              <p className="text-muted">
                Your institution scored{" "}
                <strong className="text-text">{Math.round(reco.final)}/100</strong> — placing it in
                the <strong className="text-text">{reco.band}</strong> band. {reco.desc}
              </p>

              <h4 className="text-accent text-base font-semibold mt-[18px] mb-1.5">
                Top Priority Areas
              </h4>
              <ul className="pl-[18px] text-muted list-disc">
                {reco.items.map((item) => (
                  <li key={item.code} className="mb-2">
                    <strong className="text-text">
                      {item.name} ({item.code}) — {item.score}/5.0:
                    </strong>{" "}
                    This dimension is a priority gap. Review the specific subdimension anchors and
                    identify which practices are absent. Begin with establishing a basic detection or
                    measurement system, then build toward consistency.
                  </li>
                ))}
              </ul>

              <h4 className="text-accent text-base font-semibold mt-[18px] mb-1.5">
                Build on Strengths
              </h4>
              <p className="text-muted">
                Your strongest dimensions —{" "}
                <strong className="text-text">
                  {reco.strongest.map((d: Dimension) => d.name).join(" and ")}
                </strong>{" "}
                — provide a foundation. Use existing practices in these areas as models for building
                infrastructure in weaker dimensions.
              </p>

              <h4 className="text-accent text-base font-semibold mt-[18px] mb-1.5">
                6-Month Action Plan
              </h4>
              <ul className="pl-[18px] text-muted list-disc">
                <li className="mb-2">
                  Conduct a structured review of your lowest-scoring subdimensions and assign
                  ownership for each gap.
                </li>
                <li className="mb-2">
                  Establish at least one new measurement or feedback mechanism in your weakest
                  dimension within 30 days.
                </li>
                <li className="mb-2">
                  Reassess using this questionnaire in 6 months to track progress and recalculate
                  your composite score.
                </li>
              </ul>
            </div>
          </Panel>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center min-h-[46px] px-5 rounded-xl font-bold bg-gradient-to-br from-accent to-accent-2 text-[#07111f] border-transparent transition-all duration-150 hover:from-[#8bddff] hover:to-[#6caefb]"
            >
              Download / Print Results
            </button>
            <button
              onClick={resetAssessment}
              className="inline-flex items-center justify-center min-h-[46px] px-5 rounded-xl font-semibold border border-line bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)] text-text transition-all duration-150"
            >
              Start New Assessment
            </button>
          </div>

          {/* Band-aware next-step CTA */}
          {(() => {
            const ctaConfig =
              band === "Critical" || band === "Developing"
                ? {
                    headline: "Your next step: Certified Assessment",
                    description:
                      "Organizations in the " + band + " band benefit most from a structured, assessor-led review that identifies specific gaps and builds a concrete improvement roadmap.",
                    linkHref: "/certified-assessments",
                    linkLabel: "Explore Certified Assessments",
                    borderColor: "rgba(248,113,113,0.35)",
                    bgFrom: "rgba(248,113,113,0.08)",
                    bgTo: "rgba(251,146,60,0.05)",
                  }
                : band === "Functional" || band === "Established"
                  ? {
                      headline: "Your next step: Advisory Support",
                      description:
                        "Organizations in the " + band + " band are well-positioned to translate benchmark insights into strategic action with expert advisory guidance.",
                      linkHref: "/advisory",
                      linkLabel: "Book Advisory Support",
                      borderColor: "rgba(134,239,172,0.35)",
                      bgFrom: "rgba(134,239,172,0.08)",
                      bgTo: "rgba(252,211,77,0.05)",
                    }
                  : {
                      headline: "Your next step: Benchmark Reports",
                      description:
                        "Exemplary organizations can deepen their understanding with premium benchmark reports — compare your practices against sector leaders and identify where to sustain excellence.",
                      linkHref: "/purchase-research",
                      linkLabel: "Browse Benchmark Reports",
                      borderColor: "rgba(125,211,252,0.35)",
                      bgFrom: "rgba(125,211,252,0.08)",
                      bgTo: "rgba(167,139,250,0.05)",
                    };

            return (
              <div
                className="mt-7 rounded-[22px] p-8 text-center"
                style={{
                  border: `1px solid ${ctaConfig.borderColor}`,
                  background: `linear-gradient(135deg, ${ctaConfig.bgFrom}, ${ctaConfig.bgTo})`,
                }}
              >
                <p className="text-[0.88rem] text-muted mb-2">
                  You scored <strong className="text-text">{Math.round(final)}</strong> &mdash; placing you in the <strong style={{ color: bandColor }}>{band}</strong> band
                </p>
                <h3 className="text-[clamp(1.3rem,2.5vw,1.7rem)] font-bold mb-2">
                  {ctaConfig.headline}
                </h3>
                <p className="text-muted max-w-[560px] mx-auto mb-5 text-[0.95rem]">
                  {ctaConfig.description}
                </p>
                <a
                  href={ctaConfig.linkHref}
                  className="inline-flex items-center justify-center min-h-[50px] px-7 rounded-[14px] font-bold bg-gradient-to-br from-accent to-accent-2 text-[#07111f] border-transparent transition-all duration-150 hover:from-[#8bddff] hover:to-[#6caefb] text-[1.05rem]"
                >
                  {ctaConfig.linkLabel} &rarr;
                </a>
              </div>
            );
          })()}
            </>
          )}
        </Container>
      </section>
    );
  };

  /* ------------------------------------------------------------------ */
  /* Tab selector + render                                               */
  /* ------------------------------------------------------------------ */

  return (
    <div>
      {/* Sub-navigation tabs */}
      <div className="flex gap-1 justify-center pt-8 pb-2">
        {(
          [
            { key: "explore", label: "Explore Dimensions" },
            { key: "assess", label: "Self-Assessment" },
            ...(showResults ? [{ key: "results", label: "Results" }] : []),
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-[10px] cursor-pointer text-[0.9rem] font-medium transition-all duration-150 border ${
              tab === t.key
                ? "text-text bg-[rgba(125,211,252,0.12)] border-[rgba(125,211,252,0.2)]"
                : "text-muted border-transparent hover:text-text hover:bg-[rgba(255,255,255,0.05)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "explore" && renderExplore()}
      {tab === "assess" && renderAssess()}
      {tab === "results" && showResults && renderResults()}
    </div>
  );
}
