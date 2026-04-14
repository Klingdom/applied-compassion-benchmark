import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import Band, { BandLevel } from "@/components/ui/Band";

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
  bands: BandInfo[];
  children?: React.ReactNode;
};

export default function IndexHero({
  eyebrow,
  title,
  description,
  stats,
  bands,
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
            <h3 className="text-[1.08rem] font-bold mb-2.5">
              Band distribution
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">
                    Band
                  </th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">
                    Range
                  </th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">
                    Count
                  </th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {bands.map((b) => (
                  <tr key={b.name}>
                    <td className="py-3 px-2.5 border-b border-line">
                      <Band level={b.level} />
                    </td>
                    <td className="py-3 px-2.5 border-b border-line text-muted">
                      {b.range}
                    </td>
                    <td className="py-3 px-2.5 border-b border-line">
                      {b.count}
                    </td>
                    <td className="py-3 px-2.5 border-b border-line text-muted">
                      {b.pct}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </Container>
    </section>
  );
}
