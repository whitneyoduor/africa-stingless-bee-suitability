import type { Metadata } from 'next';
import CompareView from '@/components/CompareView';
import { classes, records, scenarios, speciesList } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Compare scenarios',
  description:
    'Compare baseline and future suitability layers side by side for African stingless bees.',
};

export default function ComparePage() {
  const species = speciesList
    .map((s) => ({ slug: s.slug, label: s.label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">Scenario comparison</span>
        <h1>Compare suitability layers</h1>
        <p>
          Put any two layers side by side — for example baseline versus SSP370, or two
          species under the same scenario — and read the difference in mean suitability.
        </p>
      </div>
      <CompareView species={species} records={records} classes={classes} scenarios={scenarios} />
    </div>
  );
}
