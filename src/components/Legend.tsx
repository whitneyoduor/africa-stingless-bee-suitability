interface LegendProps {
  classes: { from: number; to: number; hex: string }[];
}

export default function Legend({ classes }: LegendProps) {
  return (
    <div className="legend">
      <h4>Suitability index</h4>
      <div className="legend-items">
        {classes.map((c, i) => (
          <div
            key={i}
            className="legend-items-seg"
            style={{
              flex: 1,
              height: 16,
              background: c.hex,
            }}
            title={`${c.from.toFixed(2)} – ${c.to.toFixed(2)}`}
          />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 6,
          fontSize: 11,
          color: 'var(--muted)',
          fontWeight: 600,
        }}
      >
        <span>0.0 · low</span>
        <span>0.5</span>
        <span>high · 1.0</span>
      </div>
    </div>
  );
}
