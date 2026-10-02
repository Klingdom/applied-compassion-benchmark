import type { PilotWave } from "@/lib/model-wave-facts";
import { accessTierLabel, dateLong } from "@/lib/model-report-facts";

/**
 * StatusBanner (template E, a11y brief): a labelled region, NOT sticky (a sticky
 * banner obscures focus, WCAG 2.4.11), first element inside <main>, before the
 * H1. Screenshot-safe text: it names the status, the run, the date and the
 * access tier in plain words, and does not rely on colour or an icon.
 *
 * It is a single <aside> with <p> children and no nested <aside>, so the
 * built-HTML gate (G5) can read it. In print it is fixed to the top of every
 * page (see the .pilot-banner rules in globals.css).
 */
export default function StatusBanner({ wave }: { wave: PilotWave }) {
  return (
    <aside role="region" aria-label="Status of these results" className="pilot-banner">
      <p className="pilot-banner-main">
        <strong>UNOFFICIAL PILOT.</strong> Not a Compassion Benchmark score. Not a ranking. No cross-model comparison.
      </p>
      <p className="pilot-banner-sub">
        Comparability: {wave.comparability}. Run {wave.run_id}, {dateLong(wave.report_date)}. Access tier: {accessTierLabel(wave)}.
      </p>
    </aside>
  );
}
