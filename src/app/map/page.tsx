import type { Metadata } from 'next';
import MapExplorer from '@/components/MapExplorer';
import { classes, records, scenarios, speciesList } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Interactive map',
  description: 'Explore stingless bee distribution suitability layers across scenarios.',
};

export default function MapPage() {
  const species = speciesList
    .map((s) => ({ slug: s.slug, label: s.label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">Interactive mapping</span>
        <h1>Suitability map explorer</h1>
        <p style={{ maxWidth: '70ch' }}>
          Select a species and scenario to display its suitability surface over Africa.
          Adjust layer opacity and inspect the statistics for each raster.
        </p>
      </div>

      <MapExplorer
        species={species}
        records={records}
        classes={classes}
        scenarios={scenarios}
      />
    </div>
  );
}
