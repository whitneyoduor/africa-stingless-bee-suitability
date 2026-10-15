import type { Metadata } from 'next';
import InventoryTable from '@/components/InventoryTable';
import { records, scenarios, models } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Data & downloads',
  description: 'Summary analytics of stingless bee suitability across scenarios.',
};

export default function DataPage() {
  const totalBytes = records.reduce((a, r) => a + r.bytes, 0);
  const sizeMb = (totalBytes / 1024 / 1024).toFixed(1);

  const species = [...new Set(records.map((r) => r.speciesSlug))]
    .sort()
    .map((slug) => {
      const rec = records.find((r) => r.speciesSlug === slug)!;
      return { slug, label: rec.species };
    });

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">Data &amp; downloads</span>
        <h1>Data inventory</h1>
        <p>
          Search, filter, sort and download every suitability layer. Export the visible
          set as CSV or grab the full metadata file.
        </p>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="value">{records.length}</div>
          <div className="label">Raster layers</div>
        </div>
        <div className="stat">
          <div className="value">{species.length}</div>
          <div className="label">Species</div>
        </div>
        <div className="stat accent">
          <div className="value">{sizeMb}</div>
          <div className="label">MB of PNG tiles</div>
        </div>
        <div className="stat">
          <div className="value">{models.length}</div>
          <div className="label">Modelling approaches</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <h3>Bulk downloads</h3>
        </div>
        <div className="panel-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a className="btn" href="/dataset.json" download>
            Download dataset.json
          </a>
          <span className="badge">{records.length} rendered layers</span>
          <span className="badge">{sizeMb} MB total</span>
        </div>
      </div>

      <InventoryTable
        records={records}
        scenarios={scenarios}
        models={models}
        species={species}
      />
    </div>
  );
}
