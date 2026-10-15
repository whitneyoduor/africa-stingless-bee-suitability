'use client';

import { useState } from 'react';
import RasterMap from './RasterMap';
import Legend from './Legend';
import type { RasterRecord } from '@/lib/types';

interface Props {
  species: { slug: string; label: string }[];
  records: RasterRecord[];
  classes: { from: number; to: number; hex: string }[];
  scenarios: string[];
}

function boundsOf(r?: RasterRecord): [[number, number], [number, number]] {
  if (!r) return [
    [-46.99, -25.34],
    [37.34, 51.41],
  ];
  return [
    [r.bbox[1], r.bbox[0]],
    [r.bbox[3], r.bbox[2]],
  ];
}

export default function CompareView({ species, records, classes, scenarios }: Props) {
  const first = species[0]?.slug ?? '';
  const [left, setLeft] = useState({
    speciesSlug: first,
    scenario: 'Baseline',
    model: 'africa',
  });
  const [right, setRight] = useState({
    speciesSlug: first,
    scenario: scenarios.includes('SSP370') ? 'SSP370' : scenarios[scenarios.length - 1] ?? 'Baseline',
    model: 'africa',
  });

  const resolve = (sel: typeof left) => {
    const avail = records.filter(
      (r) => r.speciesSlug === sel.speciesSlug && r.scenario === sel.scenario
    );
    return (
      avail.find((r) => r.model === sel.model) ??
      avail.find((r) => r.model === 'africa') ??
      avail[0]
    );
  };

  const leftRec = resolve(left);
  const rightRec = resolve(right);

  const deltaMean =
    leftRec && rightRec
      ? Number((rightRec.mean - leftRec.mean).toFixed(4))
      : null;

  const Panel = ({
    sel,
    setSel,
    rec,
    label,
  }: {
    sel: typeof left;
    setSel: (v: typeof left) => void;
    rec?: RasterRecord;
    label: string;
  }) => {
    const avail = records.filter(
      (r) => r.speciesSlug === sel.speciesSlug && r.scenario === sel.scenario
    );
    return (
      <div className="panel">
        <div className="panel-head">
          <h3>{label}</h3>
          {rec && (
            <span className={`badge ${rec.scenario === 'Baseline' ? 'baseline' : rec.scenario.toLowerCase()}`}>
              {rec.scenario}
            </span>
          )}
        </div>
        <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label>Species</label>
            <select
              value={sel.speciesSlug}
              onChange={(e) => setSel({ ...sel, speciesSlug: e.target.value })}
            >
              {species.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Scenario</label>
              <select
                value={sel.scenario}
                onChange={(e) => setSel({ ...sel, scenario: e.target.value })}
              >
                {scenarios.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Model</label>
              <select
                value={rec?.model ?? sel.model}
                onChange={(e) => setSel({ ...sel, model: e.target.value })}
              >
                {avail.map((r) => (
                  <option key={r.model} value={r.model}>
                    {r.model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {rec ? (
            <RasterMap
              png={rec.png}
              bounds={boundsOf(rec)}
              opacity={0.85}
              heightClass="map-mid"
            />
          ) : (
            <div className="empty">No layer available.</div>
          )}

          {rec && (
            <div className="stat-row">
              <span className="k">Mean suitability</span>
              <span className="v">{rec.mean.toFixed(3)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-2">
        <Panel sel={left} setSel={setLeft} rec={leftRec} label="Layer A" />
        <Panel sel={right} setSel={setRight} rec={rightRec} label="Layer B" />
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <h3>Difference (B − A)</h3>
        </div>
        <div className="panel-body">
          {deltaMean === null ? (
            <p>Select two layers to compare.</p>
          ) : (
            <>
              <div className="stat-row">
                <span className="k">Δ mean suitability</span>
                <span
                  className="v"
                  style={{ color: deltaMean >= 0 ? 'var(--brand)' : 'var(--danger)' }}
                >
                  {deltaMean >= 0 ? '+' : ''}
                  {deltaMean.toFixed(4)}
                </span>
              </div>
              <div className="stat-row">
                <span className="k">Interpretation</span>
                <span className="v" style={{ fontFamily: 'inherit' }}>
                  {deltaMean > 0.01
                    ? 'Overall increase in suitable area'
                    : deltaMean < -0.01
                    ? 'Overall decrease in suitable area'
                    : 'Broadly stable'}
                </span>
              </div>
            </>
          )}
          <div style={{ marginTop: 14 }}>
            <Legend classes={classes} />
          </div>
        </div>
      </div>
    </>
  );
}
