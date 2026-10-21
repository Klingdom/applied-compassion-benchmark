import Link from "next/link";
import type { ReactNode } from "react";
import Callout from "@/components/ui/Callout";
import { SITE_URL } from "@/lib/model-report-facts";
import type { WatchSource } from "./types";

/** One independence line shared by every Model Watch page (docs/UX_FLOWS_AI_MODEL_WATCH.md section 0). */
export const INDEPENDENCE_LINE =
  "No provider pays for inclusion, coverage, status or wording. Commercial services support access and interpretation only, never findings.";

export const CRISIS_LINE =
  "Not guidance on which AI to talk to in a crisis. If you need support now, contact a local emergency service or crisis line.";

export function IndependenceCallout({ children }: { children?: ReactNode }) {
  return (
    <Callout>
      <p className="text-muted text-[0.95rem] leading-relaxed">
        <strong className="text-text">Compassion Benchmark is independent.</strong> {INDEPENDENCE_LINE} {children}
      </p>
      <p className="text-muted text-[0.9rem] mt-2">
        See an error?{" "}
        <a
          href="mailto:info@compassionbenchmark.com?subject=Model%20Watch%20correction"
          className="underline underline-offset-2"
        >
          Send a correction
        </a>
        . Corrections are published as new dated records and the original stays visible.
      </p>
    </Callout>
  );
}

const TYPE_LABEL: Record<string, string> = {
  "provider-announcement": "announcement",
  "model-card": "model card",
  "system-card": "system card",
  documentation: "documentation",
  "technical-report": "technical report",
  licence: "licence",
  news: "news report",
  other: "source",
  primary: "source",
  secondary: "secondary source",
};

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Source titles in the committed log can arrive cut mid-parenthesis (upstream import of an unfinished note, e.g.
 * "Model card (seen in search results,"). Drop a dangling, unclosed trailing parenthetical rather than print half a sentence.
 */
export function displayTitle(title: string): string {
  const open = title.lastIndexOf("(");
  if (open > 0 && title.indexOf(")", open) === -1) return title.slice(0, open).trim().replace(/[,;:]$/, "");
  return title;
}

function SourceLink({ s }: { s: WatchSource }) {
  const label = `${hostOf(s.url)} ${TYPE_LABEL[s.sourceType] ?? "source"}`;
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 text-accent break-words"
    >
      {label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** First two sources inline; any more sit in an expandable details ("+N more"). */
export function SourceLinks({ sources, max = 2 }: { sources: WatchSource[]; max?: number }) {
  const head = sources.slice(0, max);
  const tail = sources.slice(max);
  return (
    <div className="flex flex-col gap-1 text-[0.88rem]">
      {head.map((s) => (
        <SourceLink key={s.url} s={s} />
      ))}
      {tail.length > 0 && (
        <details>
          <summary className="cursor-pointer text-muted">+{tail.length} more</summary>
          <div className="flex flex-col gap-1 mt-1">
            {tail.map((s) => (
              <SourceLink key={s.url} s={s} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

export function canonical(path: string): string {
  return `${SITE_URL}${path}`;
}

export function LinkRow({ links }: { links: { href: string; label: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem]">
      {links.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="underline underline-offset-2 text-accent">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
