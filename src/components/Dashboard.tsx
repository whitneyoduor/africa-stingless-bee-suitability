'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import RasterMap from './RasterMap';
import Legend from './Legend';
import type { RasterRecord } from '@/lib/types';

interface Props {
  species: { slug: string; label: string; genus: string }[];
  records: RasterRecord[];
  classes: { from: number; to: number; hex: string }[];
  scenarios: string[];
  models: string[];
}

export default function Dashboard({ species, records, classes, scenarios }: Props) {
  const [search, setSearch] = useState('');
  const [speciesSlug, setSpeciesSlug] = useState(species[0]?.slug ?? '');
  const [scenario, setScenario] = useState(scenarios[0] ?? 'Baseline');
  const [model, setModel] = useState('');
  const [opacity, setOpacity] = useState(0.82);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return species;
    return species.filter((s) => `${s.label} ${s.genus}`.toLowerCase().includes(q));
  }, [species, search]);

  const available = records.filter(
    (r) => r.speciesSlug === speciesSlug && r.scenario === scenario
  );

  const activeModel =
    available.find((r) => r.model === model)?.model ??
    available.find((r) => r.model === 'africa')?.model ??
    available[0]?.model ??
    '';

  const active = available.find((r) => r.model === activeModel);

  const speciesRecs = records
    .filter((r) => r.speciesSlug === speciesSlug)
    .sort(
      (a, b) => a.scenario.localeCompare(b.scenario) || a.model.localeCompare(b.model)
    );

  const bounds: [[number, number], [number, number]] = active
    ? [
        [active.bbox[1], active.bbox[0]],
        [active.bbox[3], active.bbox[2]],
      ]
    : [
        [-46.99, -25.34],
        [37.34, 51.41],
      ];

  const currentSpecies = species.find((s) => s.slug === speciesSlug);

  return (
    <div className="container">
      <div className="dash">
        <aside className="rail">
          <div className="rail-section">
            <div className="rail-title">Species</div>
            <input
              type="search"
              placeholder="Filter species…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 7,
                border: '1px solid var(--border-strong)',
                marginBottom: 10,
                fontSize: 13,
                fontFamily: 'inherit',
              }}
            />
            <div className="species-list">
              {filtered.map((s) => (
                <button
                  key={s.slug}
                  className={`species-item ${s.slug === speciesSlug ? 'active' : ''}`}
                  onClick={() => setSpeciesSlug(s.slug)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rail-section">
            <div className="rail-title">Scenario</div>
            <div className="seg">
              {scenarios.map((s) => (
                <button
                  key={s}
                  className={s === scenario ? 'active' : ''}
                  onClick={() => setScenario(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="rail-section">
            <div className="rail-title">Model</div>
            <select
              value={activeModel}
              onChange={(e) => setModel(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 7,
                border: '1px solid var(--border-strong)',
                fontSize: 13,
                fontFamily: 'inherit',
              }}
            >
              {available.length === 0 && <option value="">none</option>}
              {available.map((r) => (
                <option key={r.model} value={r.model}>
                  {r.model}
                </option>
              ))}
            </select>
          </div>

          <div className="rail-section">
            <div className="rail-title">Opacity</div>
            <input
              type="range"
              min={0.2}
              max={1}
              step={0.02}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
          </div>

          <div className="rail-section">
            <Legend classes={classes} />
          </div>
        </aside>

        <section className="dash-main">
          <div className="dash-bar">
            <div>
              <h1>{currentSpecies?.label ?? 'Select a species'}</h1>
              <div className="sub">
                {active
                  ? `${active.scenario} · ${active.model} · ${active.period}`
                  : 'No layer available'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {active && (
                <a className="btn btn-ghost" href={active.png} download>
                  Download PNG
                </a>
              )}
              <Link className="btn btn-ghost" href={`/species/${speciesSlug}`}>
                Species detail
              </Link>
            </div>
          </div>

          {active ? (
            <RasterMap
              png={active.png}
              bounds={bounds}
              opacity={opacity}
              heightClass="map-tall"
            />
          ) : (
            <div className="map-frame map-tall">
              <div className="empty">No raster available for this combination.</div>
            </div>
          )}

          <div className="mini-stats">
            <div className="mini-stat">
              <div className="v">{active ? active.mean.toFixed(3) : '—'}</div>
              <div className="l">Mean suitability</div>
            </div>
            <div className="mini-stat">
              <div className="v">{active ? active.max.toFixed(3) : '—'}</div>
              <div className="l">Max suitability</div>
            </div>
            <div className="mini-stat">
              <div className="v">{active ? active.min.toFixed(3) : '—'}</div>
              <div className="l">Min suitability</div>
            </div>
            <div className="mini-stat">
              <div className="v">
                {active ? `${(active.coverage * 100).toFixed(1)}%` : '—'}
              </div>
              <div className="l">Modelled coverage</div>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-head">
              <h3>All layers for {currentSpecies?.label}</h3>
              <span className="badge">{speciesRecs.length}</span>
            </div>
            <div className="table-wrap scroll" style={{ border: 'none' }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>Model</th>
                    <th>Period</th>
                    <th>Mean</th>
                    <th>Max</th>
                    <th>Coverage</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {speciesRecs.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span
                          className={`badge ${
                            r.scenario === 'Baseline'
                              ? 'baseline'
                              : r.scenario.toLowerCase()
                          }`}
                        >
                          {r.scenario}
                        </span>
                      </td>
                      <td>
                        <span className="badge model">{r.model}</span>
                      </td>
                      <td>{r.period}</td>
                      <td className="mono">{r.mean.toFixed(3)}</td>
                      <td className="mono">{r.max.toFixed(3)}</td>
                      <td className="mono">{(r.coverage * 100).toFixed(1)}%</td>
                      <td>
                        <a className="btn btn-ghost" href={r.png} download>
                          PNG
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
