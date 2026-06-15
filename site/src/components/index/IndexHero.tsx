/**
 * IndexHero — shared hero block for the 7 index pages.
 *
 * S1.2 (Wave S1): replaced the HTML band-distribution table with the
 * shipped BandDistributionBar component. Pass `indexSlug` (e.g. "countries")
 * to auto-load counts from the index JSON, or omit to show the aggregate bar.
 *
 * Back-compat: the `bands` prop is still accepted but unused when BandDistributionBar
 * renders. Callers do not need to be updated immediately.
 */

import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import BandDistributionBar from "@/components/charts/BandDistributionBar";
import type { BandLevel } from "@/components/ui/Band";

type BandInfo = {
  name: string;
  level: BandLevel;
  range: string;
  count: number;
  pct: string;
};

type StatInfo = {
  value: string;
  label: string;
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  stats: StatInfo[];
  /** @deprecated — kept for backward compat. Use indexSlug instead. */
  bands?: BandInfo[];
  /**
   * Index slug passed to BandDistributionBar (e.g. "countries", "fortune-500").
   * When omitted, the aggregate all-index bar is shown.
   */
  indexSlug?: string;
  children?: React.ReactNode;
};

export default function IndexHero({
  eyebrow,
  title,
  description,
  stats,
  indexSlug,
  children,
}: Props) {
  return (
    <section className="pt-[72px] pb-[30px]">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[18px] items-start">
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
              {title}
            </h1>
            <p className="text-muted text-[1.08rem] max-w-[820px] mb-[22px]">
              {description}
            </p>
            {children}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
              {stats.map((s) => (
                <Stat key={s.label} value={s.value} label={s.label} />
              ))}
            </div>
          </div>

          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-3">
              Band distribution
            </h3>
            <BandDistributionBar
              index={indexSlug ?? "all"}
              caption={`${eyebrow} · Source: Compassion Benchmark · CC-BY`}
            />
          </Panel>
        </div>
      </Container>
    </section>
  );
}
