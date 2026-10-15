import raw from '@/data/dataset.json';
import type { RasterRecord, Scenario } from './types';

export interface Dataset {
  generatedAt: string;
  title: string;
  organisation: string;
  bounds: [number, number, number, number];
  classes: { from: number; to: number; color: string; hex: string; alpha: number }[];
  scenarios: string[];
  models: string[];
  species: {
    slug: string;
    label: string;
    genus: string;
    scenarios: string[];
    models: string[];
    records: number;
  }[];
  records: RasterRecord[];
}

export const dataset = raw as unknown as Dataset;

export const bounds = dataset.bounds;
export const classes = dataset.classes;
export const scenarios = dataset.scenarios;
export const models = dataset.models;
export const speciesList = dataset.species;
export const records = dataset.records;

export const SCENARIO_LABELS: Record<string, string> = {
  Baseline: 'Baseline (current)',
  SSP126: 'SSP126 (2041–2070, low emissions)',
  SSP370: 'SSP370 (2041–2070, high emissions)',
};

export const MODEL_LABELS: Record<string, string> = {
  africa: 'Africa extent',
  maxnet: 'MaxEnt',
  rf: 'Random Forest',
  esm: 'Ensemble',
  masked: 'Masked',
};

export function scenarioShort(s: string): string {
  if (s === 'Baseline') return 'Baseline';
  return s;
}

export function getSpecies(slug: string) {
  return speciesList.find((s) => s.slug === slug);
}

export function getSpeciesRecords(slug: string): RasterRecord[] {
  return records.filter((r) => r.speciesSlug === slug);
}

export function getRecord(
  speciesSlug: string,
  scenario: string,
  model: string
): RasterRecord | undefined {
  return records.find(
    (r) => r.speciesSlug === speciesSlug && r.scenario === scenario && r.model === model
  );
}

export function recordsFor(speciesSlug: string, scenario: string): RasterRecord[] {
  return records.filter((r) => r.speciesSlug === speciesSlug && r.scenario === scenario);
}

export function defaultModelFor(speciesSlug: string): string {
  const mods = new Set(recordsFor(speciesSlug, 'Baseline').map((r) => r.model));
  if (mods.has('africa')) return 'africa';
  return [...mods][0] ?? 'africa';
}

export function toLatLngBounds(
  record: RasterRecord
): [[number, number], [number, number]] {
  const [minLon, minLat, maxLon, maxLat] = record.bbox;
  return [
    [minLat, minLon],
    [maxLat, maxLon],
  ];
}

export function allGenuses(): string[] {
  return [...new Set(speciesList.map((s) => s.genus))].sort();
}

export function baselineFuturePairs(model = 'africa') {
  return speciesList
    .map((s) => {
      const base = getRecord(s.slug, 'Baseline', model);
      const s126 = getRecord(s.slug, 'SSP126', model);
      const s370 = getRecord(s.slug, 'SSP370', model);
      return { species: s, baseline: base, ssp126: s126, ssp370: s370 };
    })
    .filter((p) => p.baseline || p.ssp126 || p.ssp370);
}

export function delta(baseline?: RasterRecord, future?: RasterRecord): number | null {
  if (!baseline || !future) return null;
  return Number((future.mean - baseline.mean).toFixed(4));
}

export type { RasterRecord, Scenario };
