type GalaxyPattern = {
  id: number;
  name: string;
  category: string;
};

type Point = GalaxyPattern & {
  x: number;
  y: number;
  color: string;
};

const categoryCenters: Record<string, { x: number; y: number; color: string }> = {
  Arrays: { x: 160, y: 155, color: "#7dd3fc" },
  Trees: { x: 350, y: 95, color: "#86efac" },
  Graphs: { x: 535, y: 155, color: "#c4b5fd" },
  "Dynamic Programming": { x: 760, y: 110, color: "#fda4af" },
  Search: { x: 830, y: 305, color: "#fde68a" },
  "Data Structures": { x: 625, y: 365, color: "#93c5fd" },
  Stacks: { x: 430, y: 365, color: "#f0abfc" },
  Recursion: { x: 255, y: 335, color: "#bef264" },
  Strings: { x: 95, y: 315, color: "#fdba74" },
};

const offsets = [
  { x: 0, y: 0 },
  { x: 44, y: -22 },
  { x: -42, y: 26 },
  { x: 24, y: 48 },
  { x: -30, y: -46 },
  { x: 73, y: 24 },
  { x: -72, y: -18 },
  { x: 8, y: -72 },
  { x: -12, y: 79 },
];

function galaxyPoints(patterns: GalaxyPattern[]) {
  const seen = new Map<string, number>();

  return patterns.map<Point>((pattern) => {
    const center = categoryCenters[pattern.category] ?? { x: 470, y: 235, color: "#9aa7b8" };
    const index = seen.get(pattern.category) ?? 0;
    seen.set(pattern.category, index + 1);
    const offset = offsets[index] ?? {
      x: Math.cos(index * 2.1) * (54 + index * 3),
      y: Math.sin(index * 2.1) * (54 + index * 3),
    };

    return {
      ...pattern,
      x: center.x + offset.x,
      y: center.y + offset.y,
      color: center.color,
    };
  });
}

export function AlgorithmGalaxy({
  patterns,
  solvedPatternIds,
}: {
  patterns: GalaxyPattern[];
  solvedPatternIds: Set<number>;
}) {
  const points = galaxyPoints(patterns);
  const pointsByCategory = new Map<string, Point[]>();

  for (const point of points) {
    const group = pointsByCategory.get(point.category) ?? [];
    group.push(point);
    pointsByCategory.set(point.category, group);
  }

  const categoryLinks = Object.keys(categoryCenters)
    .map((category) => pointsByCategory.get(category)?.[0])
    .filter((point): point is Point => Boolean(point));

  return (
    <div id="galaxy-map" className="surface scroll-mt-8 overflow-hidden p-4 sm:p-6">
      <div className="overflow-x-auto pb-2" aria-label="Scrollable personal algorithm galaxy">
        <svg
          viewBox="0 0 930 455"
          role="img"
          aria-labelledby="galaxy-svg-title galaxy-svg-description"
          className="min-w-[760px]"
        >
          <title id="galaxy-svg-title">Your personal algorithm galaxy</title>
          <desc id="galaxy-svg-description">
            Each dot is an algorithm pattern. Bright filled dots are example problems you have marked as solved.
          </desc>
          <defs>
            <filter id="solved-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {categoryLinks.slice(1).map((point, index) => {
            const previous = categoryLinks[index];
            return (
              <line
                key={`category-link-${point.category}`}
                x1={previous.x}
                y1={previous.y}
                x2={point.x}
                y2={point.y}
                stroke="#26364d"
                strokeWidth="1"
                strokeDasharray="3 10"
              />
            );
          })}

          {[...pointsByCategory.entries()].flatMap(([category, group]) =>
            group.slice(1).map((point, index) => (
              <line
                key={`${category}-${point.id}`}
                x1={group[index].x}
                y1={group[index].y}
                x2={point.x}
                y2={point.y}
                stroke="#31435e"
                strokeWidth="1.2"
              />
            )),
          )}

          {Object.entries(categoryCenters).map(([category, center]) => (
            <text
              key={category}
              x={center.x}
              y={center.y - 86}
              textAnchor="middle"
              fill="#8190a4"
              fontSize="11"
              fontWeight="600"
            >
              {category}
            </text>
          ))}

          {points.map((point) => {
            const solved = solvedPatternIds.has(point.id);
            return (
              <a key={point.id} href={`#pattern-${point.id}`} aria-label={`${point.name}: ${solved ? "solved" : "not solved"}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={solved ? 9 : 7}
                  fill={solved ? point.color : "#121d2c"}
                  stroke={point.color}
                  strokeWidth={solved ? 2 : 1.5}
                  opacity={solved ? 1 : 0.68}
                  filter={solved ? "url(#solved-glow)" : undefined}
                  className="transition hover:opacity-100"
                />
              </a>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] px-2 pt-4 text-xs text-[#8190a4]">
        <span>Choose a node to open its pattern below.</span>
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border border-[#63a9ff] bg-[#121d2c]" />Not solved</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#75d49b]" />Solved</span>
        </span>
      </div>
    </div>
  );
}
