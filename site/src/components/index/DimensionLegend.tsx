/**
 * DimensionLegend — S1.1 (Wave S1)
 *
 * Single-row compact strip showing the 8 dimension codes + names.
 * Each code is a coloured <abbr> with a hover tooltip (code + 6-word meaning).
 * Placed immediately above the ranking table to decode acronym headers.
 *
 * Server component — no client JS.
 */

import { DIMENSIONS } from "@/data/dimensions";

// ≤6-word legend meanings, keyed by dimension code.
// Also used as the tooltip on <abbr> inside RankingTable.tsx header cells.
export const DIMENSION_MEANINGS: Record<string, string> = {
  AWR: "Detects suffering before it's named",
  EMP: "Connects with others' inner experience",
  ACT: "Turns understanding into real help",
  EQU: "Distributes care fairly by need",
  BND: "Helps sustainably, without creating dependency",
  ACC: "Owns failures and makes repair",
  SYS: "Addresses root causes, not symptoms",
  INT: "Genuine, consistent, non-performative compassion",
};

// Short visible name override for width. Falls back to dim.name.
const SHORT_NAME: Record<string, string> = { SYS: "Systems" };

export default function DimensionLegend() {
  return (
    <p className="text-[0.8rem] text-muted leading-relaxed flex flex-wrap gap-x-3 gap-y-1 mb-3">
      {DIMENSIONS.map((d, i) => (
        <span key={d.code} className="whitespace-nowrap">
          <abbr
            title={`${d.name} — ${DIMENSION_MEANINGS[d.code] ?? d.desc}`}
            className="no-underline font-bold cursor-help"
            style={{ color: d.color }}
          >
            {d.code}
          </abbr>{" "}
          <span>{SHORT_NAME[d.code] ?? d.name}</span>
          {i < DIMENSIONS.length - 1 && (
            <span className="text-muted opacity-50"> ·</span>
          )}
        </span>
      ))}
    </p>
  );
}
