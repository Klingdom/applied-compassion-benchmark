/**
 * DimensionLegend — S1.1 (Wave S1)
 *
 * Single-row compact strip showing the 8 dimension codes + names.
 * Each code and name is wrapped in <DefinedTerm> for accessible hover/focus
 * tooltip with the full dimension definition.
 * Placed immediately above the ranking table to decode acronym headers.
 */

import { DIMENSIONS } from "@/data/dimensions";
import DefinedTerm from "@/components/ui/DefinedTerm";

// ≤6-word legend meanings, keyed by dimension code.
// Kept for backwards compatibility (used in RankingTable.tsx DIM_ABBR).
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
          {/* Code chip: DefinedTerm keyed by lowercase dim code */}
          <DefinedTerm
            term={d.code.toLowerCase()}
            className="font-bold"
          >
            <span style={{ color: d.color }}>{d.code}</span>
          </DefinedTerm>{" "}
          {/* Full name also wrapped so either is hoverable */}
          <DefinedTerm term={d.code.toLowerCase()}>
            {SHORT_NAME[d.code] ?? d.name}
          </DefinedTerm>
          {i < DIMENSIONS.length - 1 && (
            <span className="text-muted opacity-50"> ·</span>
          )}
        </span>
      ))}
    </p>
  );
}
