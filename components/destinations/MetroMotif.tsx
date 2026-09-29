/**
 * Moscow's identity motif: an abstract ring-and-radials diagram (not the
 * official metro map). The verste line arrives from the left and stops at
 * the centre, the kilometre zero.
 */
const RADIALS = [
  { a: 8, o: 18 },
  { a: 34, o: -22 },
  { a: 58, o: 10 },
  { a: 83, o: -8 },
  { a: 107, o: 24 },
  { a: 131, o: -16 },
  { a: 154, o: 6 },
  { a: 176, o: -26 },
];

export function MetroMotif({ className = "" }: { className?: string }) {
  const c = 300;
  const r = 150;
  return (
    <svg viewBox="0 0 600 600" aria-hidden="true" className={className}>
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <circle cx={c} cy={c} r={r} strokeWidth={2} strokeOpacity={0.55} />
        <circle cx={c} cy={c} r={r * 1.9} strokeWidth={1} strokeOpacity={0.14} strokeDasharray="2 8" />
        {RADIALS.map(({ a, o }) => {
          const rad = (a * Math.PI) / 180;
          const nx = -Math.sin(rad) * o;
          const ny = Math.cos(rad) * o;
          const dx = Math.cos(rad) * 290;
          const dy = Math.sin(rad) * 290;
          return (
            <line
              key={a}
              x1={c + nx - dx}
              y1={c + ny - dy}
              x2={c + nx + dx}
              y2={c + ny + dy}
              strokeWidth={1.2}
              strokeOpacity={0.3}
            />
          );
        })}
      </g>
      <g fill="currentColor" fillOpacity={0.6}>
        {RADIALS.flatMap(({ a, o }) =>
          [-1, 1].map((side) => {
            const rad = (a * Math.PI) / 180;
            const along = Math.sqrt(Math.max(0, r * r - o * o)) * side;
            return (
              <circle
                key={`${a}-${side}`}
                cx={c - Math.sin(rad) * o + Math.cos(rad) * along}
                cy={c + Math.cos(rad) * o + Math.sin(rad) * along}
                r={3.2}
              />
            );
          }),
        )}
      </g>
      <path d={`M -20 ${c + 70} C 120 ${c + 60}, 220 ${c + 20}, ${c} ${c}`} fill="none" strokeWidth={2.4} style={{ stroke: "var(--route)" }} />
      <circle cx={c} cy={c} r={7} style={{ fill: "var(--route)" }} />
      <circle cx={c} cy={c} r={16} fill="none" strokeOpacity={0.4} style={{ stroke: "var(--route)" }} />
    </svg>
  );
}
