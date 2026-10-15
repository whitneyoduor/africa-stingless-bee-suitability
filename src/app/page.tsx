import Link from 'next/link';
import { dataset, speciesList, records, scenarios, models } from '@/lib/data';

export default function HomePage() {
  const baselineCount = records.filter((r) => r.scenario === 'Baseline').length;
  const futureCount = records.filter((r) => r.scenario !== 'Baseline').length;

  const featured = speciesList;

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="eyebrow">icipe · Climate suitability atlas</span>
          <h1>Mapping Africa&apos;s stingless bee suitability</h1>
          <p>
            An organisational dashboard of modelled distribution suitability for{' '}
            {speciesList.length} African stingless bee species under current climate
            and future projections for 2041–2070 (SSP126 &amp; SSP370).
          </p>
          <div className="hero-actions">
            <Link className="btn" href="/map">
              Open interactive map
            </Link>
            <Link className="btn btn-ghost" href="/species">
              Explore species
            </Link>
            <Link className="btn btn-ghost" href="/compare">
              Compare scenarios
            </Link>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="stats" style={{ marginTop: -28 }}>
          <div className="stat">
            <div className="value">{speciesList.length}</div>
            <div className="label">Species</div>
          </div>
          <div className="stat">
            <div className="value">{records.length}</div>
            <div className="label">Suitability surfaces</div>
          </div>
          <div className="stat accent">
            <div className="value">{futureCount}</div>
            <div className="label">Future projections</div>
          </div>
          <div className="stat">
            <div className="value">{models.length}</div>
            <div className="label">Modelling approaches</div>
          </div>
        </div>

        <section className="grid grid-2" style={{ marginTop: 28 }}>
          <div className="panel">
            <div className="panel-head">
              <h3>What this dashboard provides</h3>
            </div>
            <div className="panel-body">
              <p>
                Spatial suitability surfaces for African stingless bees (tribe
                Meliponini) at a common geographic extent. Each layer expresses a
                suitability index from 0 (unsuitable) to 1 (highly suitable).
              </p>
              <ul style={{ color: 'var(--ink-soft)', paddingLeft: 18 }}>
                <li>{baselineCount} baseline (current climate) surfaces</li>
                <li>{futureCount} future surfaces across SSP126 &amp; SSP370</li>
                <li>Interactive mapping, scenario comparison and analytics</li>
                <li>Open downloads of all rendered layers and metadata</li>
              </ul>
              <div className="tag-row">
                <Link className="btn" href="/analytics">
                  View analytics
                </Link>
                <Link className="btn btn-ghost" href="/data">
                  Browse data
                </Link>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Scenarios &amp; models</h3>
            </div>
            <div className="panel-body">
              <p>
                Future suitability is projected for the 2041–2070 period under two
                Shared Socioeconomic Pathways:
              </p>
              <div className="stat-row">
                <span className="k">Baseline</span>
                <span className="v">Current climate</span>
              </div>
              <div className="stat-row">
                <span className="k">SSP126</span>
                <span className="v">Low-emissions pathway</span>
              </div>
              <div className="stat-row">
                <span className="k">SSP370</span>
                <span className="v">High-emissions pathway</span>
              </div>
              <p style={{ marginTop: 14 }}>
                Layers are available for different modelling approaches: Africa extent,
                MaxEnt, Random Forest, ensemble (ESM) and masked variants.
              </p>
              <div className="badges">
                {models.map((m) => (
                  <span key={m} className="badge model">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="section-head">
          <h2>Species covered</h2>
          <Link className="btn btn-ghost" href="/species">
            Open species explorer
          </Link>
        </div>

        <div className="species-grid">
          {featured.map((s) => (
            <Link key={s.slug} href={`/species/${s.slug}`} className="species-card">
              <span className="genus">{s.genus}</span>
              <span className="sci">{s.label}</span>
              <div className="badges">
                {s.scenarios.map((sc) => (
                  <span
                    key={sc}
                    className={`badge ${
                      sc === 'Baseline' ? 'baseline' : sc.toLowerCase()
                    }`}
                  >
                    {sc}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {s.records} layer{s.records > 1 ? 's' : ''}
              </span>
            </Link>
          ))}
        </div>

        <div className="note" style={{ marginTop: 28 }}>
          Dataset generated {new Date(dataset.generatedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          . Data are model-derived suitability surfaces intended for research,
          conservation and pollinator planning.
        </div>
      </div>
    </>
  );
}
