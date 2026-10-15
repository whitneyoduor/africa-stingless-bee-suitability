'use client';

import { useState } from 'react';
import RasterMap from './RasterMap';
import Legend from './Legend';
import type { RasterRecord } from '@/lib/types';
import { SCENARIO_LABELS, MODEL_LABELS } from '@/lib/data';

interface Props {
  species: { slug: string; label: string }[];
  records: RasterRecord[];
  classes: { from: number; to: number; hex: string }[];
  scenarios: string[];
  models: string[];
}

function toBounds(bbox: [number, number, number, number]): [[number, number], [number, number]] {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return [
    [minLat, minLon],
    [maxLat, maxLon],
  ];
}

export default function MapExplorer({
  species,
  records,
  classes,
  scenarios,
  initialSpecies,
  initialScenario,
  mapHeight = 'map-tall',
}: {
  species: { slug: string; label: string }[];
  records: RasterRecord[];
  classes: { from: number; to: number; hex: string }[];
  scenarios: string[];
  initialSpecies?: string;
  initialScenario?: string;
  mapHeight?: string;
}) {
  const [speciesSlug, setSpeciesSlug] = useState(
    initialSpecies ?? species[0]?.slug ?? ''
  );
  const [scenario, setScenario] = useState(initialScenario ?? scenarios[0] ?? 'Baseline');
  const [opacity, setOpacity] = useState(0.82);

  const availableRecords = records.filter(
    (r) => r.speciesSlug === speciesSlug && r.scenario === scenario
  );

  const [model, setModel] = useState('');
  const activeModel =
    availableRecords.find((r) => r.model === model)?.model ??
    availableRecords.find((r) => r.model === 'africa')?.model ??
    availableRecords[0]?.model ??
    '';

  const active = availableRecords.find((r) => r.model === activeModel);

  const bounds: [[number, number], [number, number]] = active
    ? [
        [active.bbox[1], active.bbox[0]],
        [active.bbox[3], active.bbox[2]],
      ]
    : [
        [-46.99, -25.34],
        [37.34, 51.41],
      ];

  return (
    <div className="grid grid-2" style={{ gridTemplateColumns: '1fr 340px' }}>
      <div>
        <div className="map-toolbar">
          <div className="field">
            <label htmlFor="sp">Species</label>
            <select
              id="species"
              value={speciesSlug}
              onChange={(e) => {
                setSpeciesSlug(e.target.value);
                setModel('');
              }}
            >
              {species.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Scenario</label>
            <select
              value={scenario}
              onChange={(e) => {
                setScenario(e.target.value);
                setModel('');
              }}
            >
              {scenarios.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Model</label>
            <select value={activeModel} onChange={(e) => setModel(e.target.value)}>
              {availableRecords.map((r) => (
                <option key={r.model} value={r.model}>
                  {r.model}
                </option>
              ))}
              {availableRecords.length === 0 && <option>—</option>}
            </select>
          </div>
          <div className="field range-field">
            <label>Overlay opacity · {(opacity * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.02"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
          </div>
        </div>

        {active ? (
          <RasterMap
            png={active.png}
            bounds={bounds}
            opacity={opacity}
            heightClass={mapHeight}
          />
        ) : (
          <div className={`map-frame ${mapHeight}`}>
            <div className="empty">No raster available for this combination.</div>
          </div>
        )}
      </div>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="panel">
          <div className="panel-head">
            <h3>Layer details</h3>
          </div>
          <div className="panel-body">
            {active ? (
              <>
                <div className="stat-row">
                  <span className="k">Species</span>
                  <span className="v" style={{ fontStyle: 'italic' }}>
                    {active.species}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="k">Scenario</span>
                  <span className="v">{active.scenario}</span>
                </div>
                <div className="stat-row">
                  <span className="k">Model</span>
                  <span className="v">{active.model}</span>
                </div>
                <div className="stat-row">
                  <span className="k">Period</span>
                  <span className="v">{active.period}</span>
                </div>
                <div className="stat-row">
                  <span className="k">Min suitability</span>
                  <span className="v">{active.min.toFixed(3)}</span>
                </div>
                <div className="stat-row">
                  <span className="k">Mean suitability</span>
                  <span className="v">{active.mean.toFixed(3)}</span>
                </div>
                <div className="stat-row">
                  <span className="k">Max suitability</span>
                  <span className="v">{active.max.toFixed(3)}</span>
                </div>
                <div className="stat-row">
                  <span className="k">Valid area</span>
                  <span className="v">{(active.coverage * 100).toFixed(1)}%</span>
                </div>
                <div className="stat-row">
                  <span className="k">Raster size</span>
                  <span className="v">
                    {active.width}×{active.height}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="k">File</span>
                  <span className="v mono" style={{ fontSize: 11 }}>
                    {active.file}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  <a className="btn" href={active.png} download>
                    Download PNG
                  </a>
                  <a className="btn btn-ghost" href={`/species/${active.speciesSlug}`}>
                    Species page
                  </a>
                </div>
              </>
            ) : (
              <div className="empty">No layer selected.</div>
            )}
          </div>
        </div>

        <Legend classes={classes} />

        <div className="note">
          Suitability index ranges from 0 (unsuitable) to 1 (highly suitable).
          Transparent areas indicate no-data (non-modelled or masked cells).
        </div>
      </aside>
    </div>
  );
}
