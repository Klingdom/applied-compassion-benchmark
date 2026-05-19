/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "@/components/ui/Container";

interface Props {
  updates: any;
}

/**
 * Curated ACB diagnostic question rotation (12 questions).
 * Used when updates.dailyQuestion is not set.
 * Keyed by briefing issue number mod 12 for deterministic rotation.
 */
const QUESTION_ROTATION = [
  "When an institution can measure suffering but chooses not to act, at what point does that choice become a form of conduct?",
  "What is the difference between an accountability mechanism that is structurally present and one that is functionally operative?",
  "If a score commitment made in language is never enacted in policy, which is the truer record of institutional intent?",
  "Under what conditions does stated concern for affected populations reduce, rather than obscure, the distance between institution and harm?",
  "When methodology categories are extended in real time to capture novel conduct, how do we distinguish genuine analytical innovation from post-hoc rationalization?",
  "What does it mean for an institution to operate at the floor? And what evidence would be sufficient to revise that determination?",
  "When two institutions act similarly under similar pressures and receive different scores, the differential must be traceable. What would make the differential indefensible?",
  "Institutional compliance with a legal framework is not the same as institutional compassion. Where does the framework create the gap, and where does the institution choose to inhabit it?",
  "What is the operational definition of 'responsible action' for an entity that has formally acknowledged harm and continues to produce it?",
  "If an emerging risk identified today materializes exactly as described, which current score becomes most clearly wrong in retrospect?",
  "When an institution's stated reform arc is active and measurable, what is the appropriate threshold for translating stated commitment into scored credit?",
  "Independent monitoring is itself a form of accountability. Under what conditions does its presence improve behavior, and when does it become a substitute for accountability rather than a mechanism for it?",
] as const;

function issueNumberFromDate(dateStr: string): number {
  if (!dateStr) return 0;
  const [year, month, day] = dateStr.split("-").map(Number);
  const baseline = Date.UTC(2026, 3, 15);
  const current = Date.UTC(year, month - 1, day);
  return Math.max(0, Math.round((current - baseline) / 86_400_000));
}

export default function DailyQuestion({ updates }: Props) {
  const explicit: string | undefined = updates.dailyQuestion;
  const dateStr: string = updates.date ?? "";

  const question: string =
    explicit ??
    QUESTION_ROTATION[issueNumberFromDate(dateStr) % QUESTION_ROTATION.length];

  return (
    <section
      id="daily-question"
      className="py-[30px] scroll-mt-24"
      aria-label="Closing diagnostic question"
    >
      <Container>
        <div className="rounded-[18px] border border-line bg-[rgba(255,255,255,0.02)] p-6 sm:p-8">
          <div className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-muted mb-4">
            Closing question
          </div>
          <blockquote className="text-[1.15rem] sm:text-[1.28rem] font-medium leading-relaxed text-text max-w-3xl">
            &ldquo;{question}&rdquo;
          </blockquote>
          <cite className="block mt-4 text-[0.78rem] text-muted not-italic">
            Compassion Benchmark methodology team
          </cite>
        </div>
      </Container>
    </section>
  );
}
