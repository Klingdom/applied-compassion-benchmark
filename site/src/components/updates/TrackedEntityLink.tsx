"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

interface TrackedEntityLinkProps {
  href: string;
  slug: string;
  index: string;
  source:
    | "scoreChanges"
    | "confirmation"
    | "recentAssessment"
    | "sectorAlert"
    | "topSignal"
    // Editorial blocks added in May 2026 — each tracks user navigation back to
    // the entity profile from a distinct briefing context so CVR per block
    // can be measured independently.
    | "floorConduct"
    | "boundaryWatch"
    | "hold"
    | "forwardSignal";
  children: ReactNode;
  className?: string;
}

/**
 * A Next.js Link that fires an Umami analytics event on click.
 * Must be a Client Component because it uses an onClick handler.
 */
export default function TrackedEntityLink({
  href,
  slug,
  index,
  source,
  children,
  className,
}: TrackedEntityLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackEvent("updates_entity_click", { slug, index, source })
      }
    >
      {children}
    </Link>
  );
}
