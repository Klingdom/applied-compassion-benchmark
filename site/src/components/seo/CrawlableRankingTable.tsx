import type { RankingEntry } from "@/components/index/RankingTable";

type Props = {
  data: RankingEntry[];
  indexName: string;
  nameLabel?: string;
};

/**
 * Server-rendered table of ranking data that is visible to search engine
 * crawlers and AI answer engines in the static HTML output. Visually hidden
 * from sighted users (the interactive RankingTable handles display), but
 * fully accessible to screen readers and crawlers.
 */
export default function CrawlableRankingTable({ data, indexName, nameLabel = "Entity" }: Props) {
  return (
    <div
      className="sr-only"
      aria-label={`Complete ${indexName} ranking data`}
    >
      <h2>{indexName} — Complete Rankings</h2>
      <table>
        <caption>{indexName} — {data.length} entities ranked by composite compassion score</caption>
        <thead>
          <tr>
            <th>Rank</th>
            <th>{nameLabel}</th>
            <th>Composite Score</th>
            <th>Band</th>
            <th>AWR</th>
            <th>EMP</th>
            <th>ACT</th>
            <th>EQU</th>
            <th>BND</th>
            <th>ACC</th>
            <th>SYS</th>
            <th>INT</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={entry.rank}>
              <td>{entry.rank}</td>
              <td>{entry.name}</td>
              <td>{entry.composite}</td>
              <td>{entry.band}</td>
              <td>{entry.scores.AWR}</td>
              <td>{entry.scores.EMP}</td>
              <td>{entry.scores.ACT}</td>
              <td>{entry.scores.EQU}</td>
              <td>{entry.scores.BND}</td>
              <td>{entry.scores.ACC}</td>
              <td>{entry.scores.SYS}</td>
              <td>{entry.scores.INT}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
