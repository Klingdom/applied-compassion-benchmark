"use client";

import { ReactNode } from "react";
import Link from "next/link";
import * as Tooltip from "@radix-ui/react-tooltip";
import { getGlossaryEntry } from "@/data/glossary";

interface DefinedTermProps {
  /** Glossary key. Looked up in @/data/glossary. */
  term: string;
  /**
   * Inline rendered text. Falls back to the glossary entry's label
   * when omitted.
   */
  children?: ReactNode;
  /** Optional className applied to the inline trigger. */
  className?: string;
  /**
   * When true, render the children as plain text and skip the tooltip.
   * Useful as a defensive bypass during migration.
   */
  noTooltip?: boolean;
}

/**
 * Inline glossary term with hover/focus tooltip.
 *
 * Renders the children (or the entry's label) underlined with a dotted
 * border to signal "hover me." On hover or keyboard focus, surfaces the
 * plain-English definition plus an optional methodology link.
 *
 * If the term is not in the glossary, gracefully falls back to plain text
 * — the page still renders correctly during incremental migration.
 *
 * Accessible by default via Radix:
 *   - Keyboard: tab to focus, Esc to dismiss
 *   - ARIA:     associated description on the trigger
 *   - Touch:    tap to show, tap outside to dismiss
 */
export default function DefinedTerm({
  term,
  children,
  className,
  noTooltip = false,
}: DefinedTermProps) {
  const entry = getGlossaryEntry(term);
  const displayText = children ?? entry?.label ?? term;

  // Graceful fallback when the term is unknown or tooltips are disabled.
  if (!entry || noTooltip) {
    return <span className={className}>{displayText}</span>;
  }

  const triggerClass =
    "inline border-b border-dotted border-[rgba(125,211,252,0.55)] " +
    "cursor-help text-text/95 hover:text-accent hover:border-accent " +
    "focus-visible:outline-none focus-visible:text-accent " +
    "focus-visible:border-accent transition-colors " +
    (className ?? "");

  return (
    <Tooltip.Provider delayDuration={250} skipDelayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span
            className={triggerClass}
            tabIndex={0}
            role="button"
            aria-label={`Definition: ${entry.label}`}
          >
            {displayText}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            align="center"
            sideOffset={6}
            collisionPadding={12}
            className={[
              // Layout
              "z-50 max-w-[320px] rounded-lg px-3.5 py-3",
              // Surface — match Panel design tokens
              "bg-[var(--color-panel-2)] border border-[rgba(125,211,252,0.22)]",
              "shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
              // Type
              "text-[0.86rem] leading-[1.5] text-text",
              // Animation hooks — keyframes defined in globals.css
              "defined-term-tooltip",
            ].join(" ")}
          >
            <div className="text-[0.78rem] font-bold uppercase tracking-wide text-accent mb-1">
              {entry.label}
            </div>
            <p className="text-text/90 m-0">{entry.definition}</p>
            {entry.href ? (
              <Link
                href={entry.href}
                className="inline-flex items-center gap-1 mt-2 text-[0.8rem] font-semibold text-accent hover:text-text transition-colors"
              >
                {entry.hrefLabel ?? "Read methodology"}
                <span aria-hidden="true">→</span>
              </Link>
            ) : null}
            <Tooltip.Arrow
              width={11}
              height={6}
              className="fill-[var(--color-panel-2)]"
            />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
