/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "@/components/ui/Container";

interface Props {
  updates: any;
}

/**
 * Failure mode definitions.
 *
 * Each mode has:
 *  - name: display name
 *  - slug: internal key
 *  - definition: plain-English explanation
 *  - keywords: patterns to detect in briefing text
 */
const FAILURE_MODES = [
  {
    slug: "moral-disengagement",
    name: "Moral disengagement",
    definition:
      "Actors use cognitive distancing mechanisms (euphemism, diffusion of responsibility, attribution of blame to victims) to reduce perceived culpability for harmful actions. Conduct continues while responsibility is redistributed.",
    keywords: [/moral.disengag/i, /diffusion of responsibility/i, /collective punishment/i],
  },
  {
    slug: "ethical-fading",
    name: "Ethical fading",
    definition:
      "Ethical dimensions of decisions recede from attention as operational, legal, or financial framing crowds out moral consideration. Actions that would be refused as moral violations are accepted as operational necessities.",
    keywords: [/ethical fading/i, /operational necessity/i, /legal compliance.*harm/i],
  },
  {
    slug: "measurement-fixation",
    name: "Measurement fixation",
    definition:
      "Actors optimize for measurable indicators at the expense of underlying outcomes, or cite data limitations to avoid accountability for impacts that are difficult to quantify. The measurement becomes the objective.",
    keywords: [/measurement fixation/i, /data.*not.*available/i, /cannot.*quantif/i],
  },
  {
    slug: "performative-compassion",
    name: "Performative compassion",
    definition:
      "Institutions signal concern for suffering through communications, pledges, or symbolic gestures while taking no operationally consequential action. Measured against the gap between stated concern and enacted policy.",
    keywords: [/performative/i, /hollow commitment/i, /stated.*not enacted/i, /symbolic/i],
  },
  {
    slug: "accountability-decay",
    name: "Accountability decay",
    definition:
      "Oversight mechanisms degrade over time as institutional attention moves elsewhere, enforcement lapses, or loopholes accumulate. The formal structure of accountability persists while the functional mechanism is hollow.",
    keywords: [/accountability decay/i, /oversight.*degraded/i, /enforcement lapse/i],
  },
  {
    slug: "stated-commitment-hollowing",
    name: "Stated commitment operational hollowing",
    definition:
      "Public commitments are maintained in language while the operational machinery to fulfill them is dismantled, under-resourced, or conditionally applied. The commitment becomes a rhetorical position rather than a behavioral constraint.",
    keywords: [
      /stated commitment/i,
      /commitment.*hollow/i,
      /not yet enacted/i,
      /promises.*not.*legislation/i,
      /translation.from.promise/i,
    ],
  },
] as const;

type FailureMode = (typeof FAILURE_MODES)[number];

interface DetectedMode {
  mode: FailureMode;
  context: string; // where in today's briefing it appears
}

function detectFailureModes(updates: any): DetectedMode[] {
  // Gather all briefing text sources to scan
  const textSources: { text: string; label: string }[] = [];

  const topSignals: any[] = Array.isArray(updates.topSignals)
    ? updates.topSignals
    : [];
  for (const s of topSignals) {
    if (s.description) textSources.push({ text: s.description, label: s.title ?? s.slug });
  }

  const methodologyNotes: any[] = Array.isArray(updates.methodologyNotes)
    ? updates.methodologyNotes
    : [];
  for (const n of methodologyNotes) {
    if (n.detail) textSources.push({ text: n.detail, label: `Methodology note (${n.type ?? ""})` });
  }

  const emergingRisks: any[] = Array.isArray(updates.emergingRisks)
    ? updates.emergingRisks
    : [];
  for (const r of emergingRisks) {
    if (r.description) textSources.push({ text: r.description, label: r.risk ?? "Emerging risk" });
  }

  const highlights: string[] = Array.isArray(updates.highlights)
    ? updates.highlights
    : [];
  for (const h of highlights) {
    textSources.push({ text: h, label: "Analysis" });
  }

  const detected: DetectedMode[] = [];
  const seenSlugs = new Set<string>();

  for (const mode of FAILURE_MODES) {
    if (seenSlugs.has(mode.slug)) continue;
    for (const { text, label } of textSources) {
      const matched = mode.keywords.some((kw) => kw.test(text));
      if (matched) {
        detected.push({ mode, context: label });
        seenSlugs.add(mode.slug);
        break;
      }
    }
    if (detected.length >= 3) break; // cap at 3
  }

  return detected;
}

export default function FailureModeCard({ updates }: Props) {
  const detected = detectFailureModes(updates);
  if (detected.length === 0) return null;

  return (
    <section
      id="failure-modes"
      className="py-[30px] scroll-mt-24"
      aria-label="ACB failure modes detected in this briefing"
    >
      <Container>
        <div className="mb-4">
          <h2 className="text-[1.25rem] font-bold mb-1">Failure modes in this briefing</h2>
          <p className="text-muted text-[0.88rem] max-w-2xl">
            Recurring patterns the ACB methodology tracks as structural barriers to institutional compassion. Detected from evidence documented in this cycle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {detected.map(({ mode, context }) => (
            <div
              key={mode.slug}
              className="rounded-[14px] border border-[rgba(167,139,250,0.25)] bg-[rgba(167,139,250,0.05)] p-4"
            >
              <div className="text-[0.68rem] font-bold uppercase tracking-widest text-[#a78bfa] mb-1.5">
                Failure mode
              </div>
              <h3 className="text-[0.97rem] font-bold mb-2">{mode.name}</h3>
              <p className="text-[0.85rem] text-muted leading-relaxed mb-3">
                {mode.definition}
              </p>
              <div className="text-[0.72rem] text-muted">
                <span className="font-bold uppercase tracking-widest mr-1.5">
                  Detected in
                </span>
                {context}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
