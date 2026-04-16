import { DIMENSIONS } from "@/data/dimensions";

export function calcScores(scores: Record<string, number>) {
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

export function getBand(score: number) {
  if (score <= 20) return "Critical";
  if (score <= 40) return "Developing";
  if (score <= 60) return "Functional";
  if (score <= 80) return "Established";
  return "Exemplary";
}

export function getBandColor(band: string) {
  const map: Record<string, string> = {
    Critical: "#f87171",
    Developing: "#fb923c",
    Functional: "#fcd34d",
    Established: "#86efac",
    Exemplary: "#7dd3fc",
  };
  return map[band] ?? "#7dd3fc";
}
