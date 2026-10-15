export type Scenario = 'Baseline' | 'SSP126' | 'SSP370';

export interface RasterRecord {
  id: string;
  speciesSlug: string;
  species: string;
  scenario: Scenario;
  period: string;
  model: string;
  file: string;
  png: string;
  width: number;
  height: number;
  bbox: [number, number, number, number];
  min: number;
  max: number;
  mean: number;
  validPixels: number;
  totalPixels: number;
  coverage: number;
  bytes: number;
}
