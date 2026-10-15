/**
 * glyph.tsx -- the model shapes of the pilot figures and the dashboard. Pure (no wave, no fs), so a client component
 * (the dashboard control bar) can draw the same shape beside a model name as the server-rendered figures do.
 * Models are told apart by shape plus a text label, never by colour.
 */

/**
 * Build shapes. The first six are the report's original set, in the original order, so no existing figure changes.
 * Three more (star, x-cross, triangle-down) were added for the dashboard: with six, a seventh build silently reused a
 * shape. `assertShapesSuffice` makes that a build failure instead.
 */
export const SHAPES = ["circle", "square", "triangle", "diamond", "plus", "hexagon", "star", "x-cross", "triangle-down"] as const;
export type ShapeKind = (typeof SHAPES)[number];
export const SHAPE_COUNT = SHAPES.length;
/** Fails the build when a wave has more builds than distinct shapes (two builds must never share a shape). */
export function assertShapesSuffice(builds: number, label = "figure"): void {
  if (builds > SHAPES.length) throw new Error(`${label}: ${builds} builds but only ${SHAPES.length} distinct shapes; add shapes to SHAPES in figure-kit.tsx`);
}

export const shapeWord = (k: ShapeKind): string => ({ circle: "circle", square: "square", triangle: "triangle", diamond: "diamond", plus: "plus sign", hexagon: "hexagon", star: "star", "x-cross": "cross", "triangle-down": "downward triangle" })[k];

export function Glyph({ kind, cx, cy, r = 5, hollow = false }: { kind: ShapeKind; cx: number; cy: number; r?: number; hollow?: boolean }) {
  const cls = hollow ? "pf-hollow" : "pf-fill";
  switch (kind) {
    case "circle":
      return <circle className={cls} cx={cx} cy={cy} r={r} />;
    case "square":
      return <rect className={cls} x={cx - r} y={cy - r} width={2 * r} height={2 * r} />;
    case "triangle":
      return <polygon className={cls} points={`${cx},${cy - r * 1.2} ${cx + r * 1.15},${cy + r * 0.95} ${cx - r * 1.15},${cy + r * 0.95}`} />;
    case "diamond":
      return <polygon className={cls} points={`${cx},${cy - r * 1.25} ${cx + r * 1.25},${cy} ${cx},${cy + r * 1.25} ${cx - r * 1.25},${cy}`} />;
    case "plus":
      return <path className="pf-stroke pf-thick" d={`M ${cx - r} ${cy} L ${cx + r} ${cy} M ${cx} ${cy - r} L ${cx} ${cy + r}`} />;
    case "hexagon":
      return (
        <polygon
          className={cls}
          points={[0, 1, 2, 3, 4, 5].map((i) => `${(cx + r * 1.2 * Math.cos((Math.PI / 3) * i)).toFixed(2)},${(cy + r * 1.2 * Math.sin((Math.PI / 3) * i)).toFixed(2)}`).join(" ")}
        />
      );
    case "star":
      return (
        <polygon
          className={cls}
          points={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => { const rr = (i % 2 === 0 ? 1.35 : 0.58) * r; const a = -Math.PI / 2 + (Math.PI / 5) * i; return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`; }).join(" ")}
        />
      );
    case "x-cross":
      return <path className="pf-stroke pf-thick" d={`M ${cx - r} ${cy - r} L ${cx + r} ${cy + r} M ${cx - r} ${cy + r} L ${cx + r} ${cy - r}`} />;
    case "triangle-down":
      return <polygon className={cls} points={`${cx},${cy + r * 1.2} ${cx + r * 1.15},${cy - r * 0.95} ${cx - r * 1.15},${cy - r * 0.95}`} />;
  }
}

