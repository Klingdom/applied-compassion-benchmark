/**
 * /updates/forward-watch — Scoring Outlook ledger (Wave C, Item #2)
 *
 * Aggregates OPEN/upcoming forward triggers from all recent briefing JSONs,
 * deduped by entity+trigger, sorted by proximity.
 * Build-time static page — no runtime fetch.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { getForwardWatchIndex, type ForwardWatchEntry } from "@/data/updates/forwardWatchIndex";
import { entityHref } from "@/lib/entityHref";
import { getEntityBySlug } from "@/data/entities";
import type { EntityKind } from "@/data/entities";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const metadata: Metadata = {
  title: "Scoring Outlook — Forward Watch — Compassion Benchmark",
  description:
    "Active forward scoring triggers across Compassion Benchmark entities: upcoming deadlines, pending rulings, and dated trigger conditions that may result in score changes.",
  alternates: {
    canonical: "https://compassionbenchmark.com/updates/forward-watch",
  },
  openGraph: {
    title: "Scoring Outlook — Forward Watch",
    description:
      "Active forward scoring triggers: dated trigger conditions, entity links, and source briefings.",
    url: "https://compassionbenchmark.com/updates/forward-watch",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Scoring Outlook — Forward Watch — Compassion Benchmark",
    description:
      "Active forward scoring triggers: dated trigger conditions, entity links, and source briefings.",
  },
};

// ─── Entity-link resolution ───────────────────────────────────────────────────

const SLUG_LOOKUP_KINDS: EntityKind[] = [
  "ai-lab",
  "company",
  "robotics-lab",
  "country",
  "city",
  "us-city",
  "us-state",
];
const INDEX_MAP: Record<EntityKind, string> = {
  "ai-lab": "ai-labs",
  company: "fortune-500",
  "robotics-lab": "robotics-labs",
  country: "countries",
  city: "global-cities",
  "us-city": "us-cities",
  "us-state": "us-states",
};

function resolveEntityHref(slug: string): string | null {
  for (const kind of SLUG_LOOKUP_KINDS) {
    if (getEntityBySlug(kind, slug)) {
      return entityHref(INDEX_MAP[kind], slug);
    }
  }
  return null;
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

function priorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case "critical": return "#f87171";
    case "high": return "#fb923c";
    case "medium": return "#fcd34d";
    default: return "#94a3b8";
  }
}

function daysLabel(days: number | null): string {
  if (days === null) return "TBD";
  if (days === 0) return "Today";
  if (days < 0) return `${Math.abs(days)}d elapsed`;
  if (days === 1) return "1 day";
  return `${days} days`;
}

function daysColor(days: number | null): string {
  if (days === null) return "#94a3b8";
  if (days < 0) return "rgba(148,163,184,0.6)";  // elapsed — dimmer
  if (days <= 7) return "#f87171";
  if (days <= 30) return "#fb923c";
  return "#94a3b8";
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr || dateStr.toUpperCase() === "TBD") return "TBD";
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return dateStr;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function formatBriefingDate(dateStr: string): string {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return dateStr;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ForwardWatchPage() {
  const entries = getForwardWatchIndex();

  // Partition into upcoming/TBD vs elapsed
  const upcoming = entries.filter((e) => e.daysUntil === null || e.daysUntil >= 0);
  const elapsed = entries.filter((e) => e.daysUntil !== null && e.daysUntil < 0);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Compassion Benchmark — Scoring Outlook: Forward Watch",
            description:
              "Active forward scoring triggers, upcoming deadlines, and pending rulings that may result in score changes across Compassion Benchmark entities.",
            url: "https://compassionbenchmark.com/updates/forward-watch",
            numberOfItems: entries.length,
          }),
        }}
      />

      <section className="pt-[72px] pb-8 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(252,211,77,0.06) 0%, rgba(252,211,77,0) 60%)",
          }}
        />
        <Container className="relative">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[0.78rem] text-muted mb-6">
            <Link href="/" className="hover:text-text transition-colors">Home</Link>
            <span aria-hidden="true">›</span>
            <Link href="/updates" className="hover:text-text transition-colors">Daily Briefing</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page" className="text-text">Scoring Outlook</span>
          </nav>

          {/* Header */}
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded border border-[rgba(252,211,77,0.35)] bg-[rgba(252,211,77,0.08)] text-[#fcd34d]">
              Forward watch
            </span>
            <span className="text-muted text-[0.8rem]">
              Scoring outlook
            </span>
          </div>

          <h1 className="text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-[-0.03em] font-bold mb-4">
            Scoring Outlook
          </h1>

          <p className="text-text text-[1rem] sm:text-[1.08rem] leading-relaxed max-w-[760px] mb-4 border-l-2 border-[rgba(252,211,77,0.35)] pl-4">
            Active trigger conditions documented in daily briefings. Each entry
            describes a dated event or threshold that, if met, would produce a
            scored signal for the named entity.
          </p>

          <p className="text-[0.82rem] text-muted mb-8">
            {upcoming.length} open trigger{upcoming.length !== 1 ? "s" : ""}.{" "}
            {elapsed.length > 0 && (
              <>
                {elapsed.length} recently elapsed.{" "}
              </>
            )}
            <Link href="/methodology" className="underline decoration-dotted underline-offset-2 hover:text-text transition-colors">
              Scoring methodology
            </Link>
            {" · "}
            <Link href="/updates/archive" className="underline decoration-dotted underline-offset-2 hover:text-text transition-colors">
              Browse all briefings
            </Link>
          </p>

          {/* Upcoming / TBD triggers */}
          {upcoming.length > 0 && (
            <TriggerTable entries={upcoming} heading="Open triggers" />
          )}

          {/* Elapsed triggers */}
          {elapsed.length > 0 && (
            <div className="mt-10">
              <TriggerTable entries={elapsed} heading="Recently elapsed" dimmed />
            </div>
          )}

          {entries.length === 0 && (
            <div className="rounded-[14px] border border-line bg-[rgba(255,255,255,0.02)] p-8 text-center text-muted text-[0.9rem]">
              No forward triggers documented in current briefings.
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

// ─── Trigger table sub-component ─────────────────────────────────────────────

function TriggerTable({
  entries,
  heading,
  dimmed = false,
}: {
  entries: ForwardWatchEntry[];
  heading: string;
  dimmed?: boolean;
}) {
  return (
    <div>
      <h2 className={`text-[0.72rem] font-bold uppercase tracking-[0.16em] mb-4 ${dimmed ? "text-muted-subtle" : "text-muted"}`}>
        {heading}
      </h2>

      {/* Desktop: table layout. Mobile: stacked cards. */}
      <div className="rounded-[18px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden">
        {/* Header row (desktop only) */}
        <div
          className="hidden md:grid gap-4 px-5 py-2.5 border-b border-line text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted-subtle"
          style={{ gridTemplateColumns: "90px 180px 1fr 110px 90px" }}
        >
          <span>Due</span>
          <span>Entity</span>
          <span>Trigger condition</span>
          <span>Source briefing</span>
          <span>Priority</span>
        </div>

        {/* Rows */}
        <ul className="divide-y divide-line" role="list">
          {entries.map((entry, i) => {
            const entityHrefStr = entry.slug ? resolveEntityHref(entry.slug) : null;
            const color = daysColor(entry.daysUntil);

            return (
              <li
                key={`${entry.entity}-${entry.date}-${i}`}
                className={`flex flex-col gap-2 px-5 py-4 md:grid md:gap-4 md:items-start ${dimmed ? "opacity-60" : ""}`}
                style={{ gridTemplateColumns: "90px 180px 1fr 110px 90px" } as any}
              >
                {/* Due date + days */}
                <div className="flex flex-row md:flex-col gap-2 md:gap-1">
                  <span
                    className="inline-flex items-center justify-center px-2 py-0.5 rounded-[6px] border text-[0.75rem] font-bold tabular-nums w-fit"
                    style={{
                      color,
                      borderColor: `${color}44`,
                      background: `${color}10`,
                    }}
                  >
                    {daysLabel(entry.daysUntil)}
                  </span>
                  {entry.date && entry.date.toUpperCase() !== "TBD" && (
                    <span className="text-[0.72rem] text-muted tabular-nums">
                      {formatDateDisplay(entry.date)}
                    </span>
                  )}
                </div>

                {/* Entity */}
                <div className="font-semibold text-[0.88rem]">
                  {entityHrefStr ? (
                    <Link
                      href={entityHrefStr}
                      className="text-text hover:text-[#7dd3fc] transition-colors"
                    >
                      {entry.entity}
                    </Link>
                  ) : (
                    <span className="text-text">{entry.entity}</span>
                  )}
                </div>

                {/* Trigger condition */}
                <p className="text-[0.85rem] text-muted leading-snug">
                  {entry.trigger.length > 280
                    ? entry.trigger.slice(0, 277) + "…"
                    : entry.trigger}
                </p>

                {/* Source briefing */}
                <div className="text-[0.78rem]">
                  <Link
                    href={entry.briefingPath}
                    className="text-[#7dd3fc] hover:text-text transition-colors"
                  >
                    {formatBriefingDate(entry.sourceBriefingDate)}
                  </Link>
                </div>

                {/* Priority */}
                <div>
                  <span
                    className="text-[0.65rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border w-fit inline-block"
                    style={{
                      color: priorityColor(entry.priority),
                      borderColor: `${priorityColor(entry.priority)}44`,
                      background: `${priorityColor(entry.priority)}10`,
                    }}
                  >
                    {entry.priority.toUpperCase()}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
