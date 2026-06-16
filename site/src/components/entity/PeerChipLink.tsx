"use client";

/**
 * PeerChipLink — a linked chip for the "Compare across the field" block.
 *
 * Client component: fires a peer_click analytics event on click.
 * Descriptive anchor text (name + score) per SEO/accessibility spec.
 */
import Link from "next/link";
import { trackEvent, EVENTS } from "@/lib/analytics";
import type { PeerChip } from "./EntityDetail";

/** Map a 0–100 composite to a band color (matches EntityDetail.bandColorFrom100). */
function bandColorFrom100(score: number): string {
  if (score <= 20) return "#f87171"; // Critical
  if (score <= 40) return "#fb923c"; // Developing
  if (score <= 60) return "#fcd34d"; // Functional
  if (score <= 80) return "#86efac"; // Established
  return "#7dd3fc";                  // Exemplary
}

export default function PeerChipLink({
  peer,
  label,
  trackLabel,
  entitySlug,
}: {
  peer: PeerChip;
  label?: string;
  trackLabel: string;
  entitySlug: string;
}) {
  const bandColor = bandColorFrom100(peer.composite);
  const displayName = label ? `${label}: ${peer.name}` : peer.name;

  return (
    <Link
      href={peer.href}
      onClick={() =>
        trackEvent(EVENTS.PEER_CLICK, {
          from_slug: entitySlug,
          to_slug: peer.slug,
          to_name: peer.name,
          context: trackLabel,
        })
      }
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-line bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors text-[0.82rem] group"
      title={`${peer.name} — Compassion Score ${peer.composite.toFixed(1)} (${peer.band})`}
    >
      {/* Band color dot */}
      <span
        className="inline-block w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: bandColor }}
        aria-hidden
      />
      <span className="text-text font-medium group-hover:text-[#7dd3fc] transition-colors truncate max-w-[160px]">
        {displayName}
      </span>
      <span className="text-muted shrink-0">
        {peer.composite.toFixed(1)}
      </span>
    </Link>
  );
}
