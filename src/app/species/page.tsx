import type { Metadata } from 'next';
import SpeciesExplorer from '@/components/SpeciesExplorer';
import { speciesList, scenarios } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Species explorer',
  description: 'Browse and filter the stingless bee species covered by the atlas.',
};

export default function SpeciesIndexPage() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">Species explorer</span>
        <h1>{speciesList.length} African stingless bee species</h1>
        <p>
          Filter the species catalogue by name, genus or scenario availability, then
          open a species page for its suitability layers.
        </p>
      </div>
      <SpeciesExplorer species={speciesList} scenarios={scenarios} />
    </div>
  );
}
