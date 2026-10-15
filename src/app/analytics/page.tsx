import type { Metadata } from 'next';
import Link from 'next/link';
import { SuitabilityByScenario } from '@/components/Charts';
import { baselineFuturePairs, dataset, records, speciesList } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Summary analytics of stingless bee suitability across scenarios.',
};

export default function AnalyticsPage() {
  const pairs = baselineFuturePairs('africa').sort((a, b) =>
    a.species.label.localeCompare(b.species.label)
  );

  const chartData = pairs.map((p) => ({
    label: p.species.label,
    values: {
      Baseline: p.baseline?.mean ?? null,
      SSP126: p.ssp126?.mean ?? null,
      SSP370: p.ssp370?.mean ?? null,
    },
  }));

  const scenarioSummary = ['Baseline', 'SSP126', 'SSP370'].map((s) => {
    const rs = records.filter((r) => r.scenario === s && r.model === 'africa');
    const mean = rs.length ? rs.reduce((a, r) => a + r.mean, 0) / rs.length : 0;
    return { scenario: s, mean, count: rs.length };
  });

  let increase = 0;
  let decrease = 0;
  let stable = 0;
  for (const p of pairs) {
    if (p.baseline && p.ssp370) {
      const d = p.ssp370.mean - p.baseline.mean;
      if (d > 0.01) increase++;
      else if (d < -0.01) decrease++;
      else stable++;
    }
  }

  const coverageData = pairs
    .filter((p) => p.baseline)
    .map((p) => ({ label: p.species.label, coverage: p.baseline!.coverage }))
    .sort((a, b) => b.coverage - a.coverage);

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">Analytics</span>
        <h1>Suitability across scenarios</h1>
        <p>
          Aggregate comparison of mean modelled suitability for the {pairs.length}{' '}
          species with a consistent continental extent (model: africa).
        </p>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="value">{speciesList.length}</div>
          <div className="label">Species</div>
        </div>
        <div className="stat">
          <div className="value" style={{ color: 'var(--brand)' }}>
            {increase}
          </div>
          <div className="label">Increase by SSP370</div>
        </div>
        <div className="stat accent">
          <div className="value">{decrease}</div>
          <div className="label">Decrease by SSP370</div>
        </div>
        <div className="stat">
          <div className="value">{stable}</div>
          <div className="label">Broadly stable</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Mean suitability per species by scenario</h3>
          <div className="badges">
            {['Baseline', 'SSP126', 'SSP370'].map((s) => (
              <span key={s} className="badge">
                <span
                  style={{
                    display: 'inline-block',
                    width: 9,
                    height: 9,
                    borderRadius: 2,
                    marginRight: 5,
                    background:
                      s === 'Baseline' ? '#1f6b3b' : s === 'SSP126' ? '#2f6fb0' : '#c0392b',
                  }}
                />
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="panel-body" style={{ overflowX: 'auto' }}>
          <SuitabilityByScenario
            data={chartData}
            scenarios={['Baseline', 'SSP126', 'SSP370']}
          />
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="panel">
          <div className="panel-head">
            <h3>Scenario averages</h3>
          </div>
          <div className="panel-body">
            {scenarioSummary.map((s) => (
              <div className="stat-row" key={s.scenario}>
                <span className="k">
                  {s.scenario} <span style={{ color: 'var(--muted)' }}>({s.count})</span>
                </span>
                <span className="v">{s.mean.toFixed(4)}</span>
              </div>
            ))}
            <p style={{ marginTop: 14, fontSize: 13 }}>
              Mean suitability index averaged across species sharing the continental
              (<em>africa</em>) extent. Values range 0–1.
            </p>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Baseline modelled coverage</h3>
          </div>
          <div className="panel-body">
            {coverageData.map((c) => (
              <div key={c.label} style={{ marginBottom: 8 }}>
                <div className="stat-row" style={{ border: 'none', padding: 0 }}>
                  <span className="k" style={{ fontStyle: 'italic' }}>
                    {c.label}
                  </span>
                  <span className="v">{(c.coverage * 100).toFixed(1)}%</span>
                </div>
                <div className="progress">
                  <span style={{ width: `${Math.min(100, c.coverage * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="note" style={{ marginTop: 22 }}>
        These analytics summarise the modelled surfaces and do not represent observed
        occurrence. Generated {new Date(dataset.generatedAt).toLocaleDateString('en-GB')}.{' '}
        <Link href="/data">Browse the full dataset →</Link>
      </div>
    </div>
  );
}
