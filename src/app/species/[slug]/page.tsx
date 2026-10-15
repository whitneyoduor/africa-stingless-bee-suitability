import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MapExplorer from '@/components/MapExplorer';
import {
  classes,
  getSpecies,
  getSpeciesRecords,
  records,
  scenarios,
  speciesList,
} from '@/lib/data';

export function generateStaticParams() {
  return speciesList.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const species = getSpecies(slug);
  if (!species) return { title: 'Species not found' };
  return {
    title: species.label,
    description: `Distribution suitability for ${species.label} across baseline and future climate scenarios.`,
  };
}

export default async function SpeciesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const species = getSpecies(slug);
  if (!species) notFound();

  const recs = getSpeciesRecords(slug);
  const detailSpecies = speciesList
    .map((s) => ({ slug: s.slug, label: s.label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const totalBytes = recs.reduce((a, r) => a + r.bytes, 0);

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/species" className="badge">
          ← All species
        </Link>
        <h1 style={{ marginTop: 12, fontStyle: 'italic' }}>{species.label}</h1>
        <p>
          Genus <strong>{species.genus}</strong> · {species.records} suitability layer
          {species.records > 1 ? 's' : ''} across {species.scenarios.length} scenarios.
        </p>
        <div className="badges">
          {species.scenarios.map((sc) => (
            <span key={sc} className={`badge ${sc === 'Baseline' ? 'baseline' : sc.toLowerCase()}`}>
              {sc}
            </span>
          ))}
          {species.models.map((m) => (
            <span key={m} className="badge model">
              {m}
            </span>
          ))}
        </div>
      </div>

      <MapExplorer
        species={detailSpecies}
        records={records}
        classes={classes}
        scenarios={scenarios}
        initialSpecies={slug}
      />

      <div className="section-head">
        <h2>Layers for {species.label}</h2>
        <span className="badge">{(totalBytes / 1024 / 1024).toFixed(2)} MB</span>
      </div>

      <div className="table-wrap scroll">
        <table className="data">
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Model</th>
              <th>Period</th>
              <th>Mean</th>
              <th>Max</th>
              <th>Coverage</th>
              <th>File</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {recs.map((r) => (
              <tr key={r.id}>
                <td>
                  <span className={`badge ${r.scenario === 'Baseline' ? 'baseline' : r.scenario.toLowerCase()}`}>
                    {r.scenario}
                  </span>
                </td>
                <td>
                  <span className="badge model">{r.model}</span>
                </td>
                <td>{r.period}</td>
                <td className="mono">{r.mean.toFixed(3)}</td>
                <td className="mono">{r.max.toFixed(3)}</td>
                <td>{(r.coverage * 100).toFixed(1)}%</td>
                <td className="mono">{r.file}</td>
                <td>
                  <a className="btn" style={{ padding: '5px 12px', fontSize: 12 }} href={r.png} download>
                    PNG
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
