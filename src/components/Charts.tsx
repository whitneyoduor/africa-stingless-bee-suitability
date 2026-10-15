import type { RasterRecord } from '@/lib/types';

const SCENARIO_COLORS: Record<string, string> = {
  Baseline: '#1f6b3b',
  SSP126: '#2f6fb0',
  SSP370: '#c0392b',
};

export function SuitabilityByScenario({
  data,
  scenarios,
}: {
  data: { label: string; values: Record<string, number | null> }[];
  scenarios: string[];
}) {
  const width = Math.max(680, data.length * 92 + 80);
  const height = 360;
  const pad = { top: 24, right: 24, bottom: 96, left: 52 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const allValues = data
    .flatMap((d) => scenarios.map((s) => d.values[s]))
    .filter((v): v is number => v != null);
  const max = allValues.length ? Math.max(...allValues) : 1;
  const yMax = Math.ceil(max * 10) / 10 || 1;

  const groupW = plotW / data.length;
  const barW = Math.min(18, (groupW - 16) / scenarios.length);

  const y = (v: number) => pad.top + plotH - (v / yMax) * plotH;

  const ticks = Array.from({ length: 6 }, (_, i) => (i / 5) * yMax);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img">
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={y(t)}
            y2={y(t)}
            stroke="#e2e8e3"
            strokeWidth={1}
          />
          <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" fontSize={10} fill="#6b7a70">
            {t.toFixed(1)}
          </text>
        </g>
      ))}

      {data.map((d, gi) => {
        const gx = pad.left + gi * groupW;
        const totalBars = scenarios.length;
        const groupInner = totalBars * barW + (totalBars - 1) * 3;
        const startX = gx + (groupW - groupInner) / 2;
        return (
          <g key={d.label}>
            {scenarios.map((s, si) => {
              const v = d.values[s];
              if (v == null) return null;
              const bx = startX + si * (barW + 3);
              const by = y(v);
              return (
                <g key={s}>
                  <rect
                    x={bx}
                    y={by}
                    width={barW}
                    height={pad.top + plotH - by}
                    rx={2}
                    fill={SCENARIO_COLORS[s] ?? '#888'}
                  >
                    <title>
                      {d.label} · {s}: {v.toFixed(3)}
                    </title>
                  </rect>
                </g>
              );
            })}
            <text
              x={gx + groupW / 2}
              y={height - pad.bottom + 16}
              textAnchor="end"
              fontSize={10.5}
              fill="#3b4a41"
              transform={`rotate(-40 ${gx + groupW / 2} ${height - pad.bottom + 16})`}
              fontStyle="italic"
            >
              {d.label}
            </text>
          </g>
        );
      })}

      <line
        x1={pad.left}
        x2={width - pad.right}
        y1={pad.top + plotH}
        y2={pad.top + plotH}
        stroke="#c6d0c7"
      />
    </svg>
  );
}

export function CoverageBars({ data }: { data: { label: string; coverage: number }[] }) {
  const max = Math.max(...data.map((d) => d.coverage), 0.01);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
      {data.map((d) => (
        <div key={d.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
            <span style={{ fontStyle: 'italic' }}>{d.label}</span>
            <span style={{ color: 'var(--muted)' }}>{(d.coverage * 100).toFixed(1)}%</span>
          </div>
          <div className="progress">
            <span style={{ width: `${(d.coverage / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function scenarioMeans(recs: RasterRecord[], scenario: string, model = 'africa') {
  return recs.filter((r) => r.scenario === scenario && r.model === model);
}
