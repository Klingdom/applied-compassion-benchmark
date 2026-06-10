/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TodayInBrief — Wave E1, Item #2 (densification pass)
 *
 * Rewritten: drops the bordered card wrapper. Now renders as bare bullet markup
 * suitable for inline placement between the thesis and the CTA cluster.
 *
 * Preserves: entity links via entityHref (Wave C), numbered dot bullets,
 * graceful null/empty handling on flat/legacy briefings.
 */

import Link from "next/link";
import { entityHref } from "@/lib/entityHref";
import type { TodayInBriefItem } from "./utils";

interface Props {
  items: TodayInBriefItem[];
}

export default function TodayInBrief({ items }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      {/* Section label */}
      <div className="text-[0.63rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
        Today in Brief
      </div>

      {/* Bare bullet list — no card border/bg/padding */}
      <ul className="space-y-1.5 mb-4" aria-label="Today in brief — key findings">
        {items.map((item, i) => {
          // Link to the entity detail page when slug + index resolve; otherwise
          // render plain text (never a dead in-page anchor).
          const href =
            item.slug && item.index ? entityHref(item.index, item.slug) : null;
          return (
            <li key={i} className="flex gap-3 items-start">
              {/* Numbered dot */}
              <span
                aria-hidden="true"
                className="shrink-0 mt-[3px] w-5 h-5 rounded-full border border-[rgba(125,211,252,0.35)] bg-[rgba(125,211,252,0.08)] text-[#7dd3fc] text-[0.7rem] font-bold flex items-center justify-center leading-none tabular-nums"
              >
                {i + 1}
              </span>
              <p className="text-[0.9rem] text-text leading-snug flex-1">
                {href ? (
                  <Link
                    href={href}
                    className="hover:text-accent transition-colors"
                  >
                    {item.text}
                  </Link>
                ) : (
                  item.text
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
