"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

interface TrackedEntityLinkProps {
  href: string;
  slug: string;
  index: string;
  source: "scoreChanges" | "confirmation" | "recentAssessment" | "sectorAlert";
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
