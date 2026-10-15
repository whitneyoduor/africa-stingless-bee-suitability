'use client';

import { useMemo, useState } from 'react';
import type { RasterRecord } from '@/lib/types';

interface Props {
  records: RasterRecord[];
  scenarios: string[];
  models: string[];
  species: { slug: string; label: string }[];
}

type SortKey = 'species' | 'scenario' | 'model' | 'mean' | 'max' | 'coverage';

export default function InventoryTable({ records, scenarios, models, species }: Props) {
  const [search, setSearch] = useState('');
  const [scenario, setScenario] = useState('all');
  const [model, setModel] = useState('all');
  const [speciesSlug, setSpeciesSlug] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('species');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = records.filter((r) => {
      if (scenario !== 'all' && r.scenario !== scenario) return false;
      if (model !== 'all' && r.model !== model) return false;
      if (speciesSlug !== 'all' && r.speciesSlug !== speciesSlug) return false;
      if (q && !`${r.species} ${r.file} ${r.model}`.toLowerCase().includes(q)) return false;
      return true;
    });
    rows.sort((a, b) => {
      let cmp: number;
      if (sortKey === 'mean' || sortKey === 'max' || sortKey === 'coverage') {
        cmp = (a[sortKey] as number) - (b[sortKey] as number);
      } else {
        cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [records, search, scenario, model, speciesSlug, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function downloadCsv() {
    const header = [
      'species',
      'scenario',
      'model',
      'period',
      'mean',
      'min',
      'max',
      'coverage',
      'file',
      'png',
    ];
    const lines = [header.join(',')];
    for (const r of filtered) {
      lines.push(
        [
          r.species,
          r.scenario,
          r.model,
          r.period,
          r.mean,
          r.min,
          r.max,
          r.coverage,
          r.file,
          r.png,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stingless-bee-suitability-inventory.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <>
      <div className="map-toolbar">
        <div className="field" style={{ flex: 1, minWidth: 220 }}>
          <label htmlFor="inv-search">Search</label>
          <input
            id="inv-search"
            type="search"
            placeholder="Species, model or filename…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="inv-species">Species</label>
          <select
            id="inv-species"
            value={speciesSlug}
            onChange={(e) => setSpeciesSlug(e.target.value)}
          >
            <option value="all">All species</option>
            {species.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="inv-scenario">Scenario</label>
          <select
            id="inv-scenario"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          >
            <option value="all">All scenarios</option>
            {scenarios.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="inv-model">Model</label>
          <select id="inv-model" value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="all">All models</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ minWidth: 'auto' }}>
          <label>&nbsp;</label>
          <button type="button" className="btn" onClick={downloadCsv}>
            Export CSV
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="badge">{filtered.length} of {records.length} layers</span>
      </div>

      <div className="table-wrap scroll">
        <table className="data">
          <thead>
            <tr>
              <th className="sortable" onClick={() => toggleSort('species')}>
                Species{sortIndicator('species')}
              </th>
              <th className="sortable" onClick={() => toggleSort('scenario')}>
                Scenario{sortIndicator('scenario')}
              </th>
              <th className="sortable" onClick={() => toggleSort('model')}>
                Model{sortIndicator('model')}
              </th>
              <th className="sortable" onClick={() => toggleSort('mean')}>
                Mean{sortIndicator('mean')}
              </th>
              <th className="sortable" onClick={() => toggleSort('max')}>
                Max{sortIndicator('max')}
              </th>
              <th className="sortable" onClick={() => toggleSort('coverage')}>
                Coverage{sortIndicator('coverage')}
              </th>
              <th>File</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty">No layers match your filters.</div>
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontStyle: 'italic' }}>{r.species}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.scenario === 'Baseline' ? 'baseline' : r.scenario.toLowerCase()
                      }`}
                    >
                      {r.scenario}
                    </span>
                  </td>
                  <td>
                    <span className="badge model">{r.model}</span>
                  </td>
                  <td className="mono">{r.mean.toFixed(3)}</td>
                  <td className="mono">{r.max.toFixed(3)}</td>
                  <td className="mono">{(r.coverage * 100).toFixed(1)}%</td>
                  <td className="mono" style={{ fontSize: 11.5 }}>
                    {r.file}
                  </td>
                  <td>
                    <a className="btn" href={r.png} download>
                      PNG
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
