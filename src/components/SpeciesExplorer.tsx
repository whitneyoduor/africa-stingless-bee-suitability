'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SpeciesExplorer({
  species,
  scenarios,
}: {
  species: {
    slug: string;
    label: string;
    genus: string;
    scenarios: string[];
    models: string[];
    records: number;
  }[];
  scenarios: string[];
}) {
  const [search, setSearch] = useState('');
  const [genus, setGenus] = useState('all');
  const [scenario, setScenario] = useState('all');

  const genuses = [...new Set(species.map((s) => s.genus))].sort();

  const filtered = species
    .filter((s) => {
      const q = search.trim().toLowerCase();
      if (q && !`${s.label} ${s.genus}`.toLowerCase().includes(q)) return false;
      if (genus !== 'all' && s.genus !== genus) return false;
      if (scenario !== 'all' && !s.scenarios.includes(scenario)) return false;
      return true;
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <>
      <div className="map-toolbar">
        <div className="field" style={{ flex: 1, minWidth: 240 }}>
          <label htmlFor="search">Search species</label>
          <input
            id="search"
            type="search"
            placeholder="e.g. Meliponula, armata…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="genus">Genus</label>
          <select id="genus" value={genus} onChange={(e) => setGenus(e.target.value)}>
            <option value="all">All genera</option>
            {genuses.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="scenario">Scenario</label>
          <select
            id="scenario"
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
        <div className="field" style={{ minWidth: 'auto' }}>
          <label>&nbsp;</label>
          <span className="badge">{filtered.length} shown</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No species match your filters.</div>
      ) : (
        <div className="species-grid">
          {filtered.map((s) => (
            <Link key={s.slug} href={`/species/${s.slug}`} className="species-card">
              <span className="genus">{s.genus}</span>
              <span className="sci">{s.label}</span>
              <div className="badges">
                {s.scenarios.map((sc) => (
                  <span
                    key={sc}
                    className={`badge ${sc === 'Baseline' ? 'baseline' : sc.toLowerCase()}`}
                  >
                    {sc}
                  </span>
                ))}
              </div>
              <div className="badges">
                {s.models.map((m) => (
                  <span key={m} className="badge model">
                    {m}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {s.records} layer{s.records > 1 ? 's' : ''}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
