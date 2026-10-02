export const sectionSlug = (title: string): string => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/**
 * Report contents: <nav aria-label> with an <ol>; sticky left rail from 1024px
 * (see .pilot-toc in globals.css), an inline list below that. Links are at
 * least 24px tall (WCAG 2.5.8).
 */
export default function ReportToc({ sections }: { sections: { id: string; title: string }[] }) {
  return (
    <nav aria-label="Report contents" className="pilot-toc">
      <p className="pilot-toc-title">On this page</p>
      <ol>
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${sectionSlug(s.title)}`}>{s.title}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
