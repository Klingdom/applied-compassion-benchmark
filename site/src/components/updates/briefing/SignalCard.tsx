/* eslint-disable @typescript-eslint/no-explicit-any */
import TrackedEntityLink from "@/components/updates/TrackedEntityLink";
import { entityHref } from "@/lib/entityHref";
import { formatIndex, SEVERITY_COLORS } from "./utils";

interface SignalCardProps {
  signal: any;
}

/**
 * SignalCard - a single compact signal row in the SignalStack.
 */
export default function SignalCard({ signal }: SignalCardProps) {
  const severity: string = signal.severity ?? "medium";
  const color = SEVERITY_COLORS[severity] ?? "#94a3b8";
  const href =
    signal.index && signal.slug ? entityHref(signal.index, signal.slug) : null;

  // Short summary: first sentence of description
  const description: string = signal.description ?? signal.body ?? signal.alert ?? "";
  const summary = description.split(/(?<=[.!?])\s+/)[0] ?? description;

  // Category badge from index
  const category = signal.index ? formatIndex(signal.index) : null;

  return (
    <article
      className="rounded-[14px] border p-4 transition-colors hover:bg-[rgba(255,255,255,0.02)]"
      style={{
        borderColor: `${color}33`,
        background: `${color}07`,
      }}
      aria-label={signal.title ?? summary}
    >
      {/* Top row: category + severity */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {category && (
          <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted">
            {category}
          </span>
        )}
        <span className="text-muted text-[0.65rem]" aria-hidden="true">·</span>
        <span
          className="text-[0.65rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
          style={{
            color,
            borderColor: `${color}44`,
            background: `${color}12`,
          }}
          aria-label={`Severity: ${severity}`}
        >
          {severity}
        </span>
        {signal.actionRequired && (
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#f87171] px-1.5 py-0.5 rounded border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)]">
            Action required
          </span>
        )}
      </div>

      {/* Title / entity link */}
      <h3 className="text-[0.92rem] font-semibold leading-snug mb-1.5">
        {href ? (
          <TrackedEntityLink
            href={href}
            slug={signal.slug}
            index={signal.index}
            source="topSignal"
            className="hover:text-accent transition-colors"
          >
            {signal.title ?? signal.entity ?? signal.slug}
          </TrackedEntityLink>
        ) : (
          <span>{signal.title ?? signal.entity ?? signal.slug}</span>
        )}
      </h3>

      {/* One-line summary */}
      {summary && (
        <p className="text-[0.85rem] text-muted leading-relaxed line-clamp-2">
          {summary}
        </p>
      )}

      {/* Footer: link */}
      {href && (
        <div className="mt-2 flex justify-end">
          <TrackedEntityLink
            href={href}
            slug={signal.slug}
            index={signal.index}
            source="topSignal"
            className="text-[0.75rem] font-semibold text-muted hover:text-accent transition-colors"
          >
            View profile &rarr;
          </TrackedEntityLink>
        </div>
      )}
    </article>
  );
}
