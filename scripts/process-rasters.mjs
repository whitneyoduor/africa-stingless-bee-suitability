import { fromFile } from 'geotiff';
import { PNG } from 'pngjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const SOURCE_DIR = path.resolve(projectRoot, process.env.SOURCE_DIR || '../Results');
const OUT_RASTERS = path.resolve(projectRoot, 'public/rasters');
const OUT_DATA = path.resolve(projectRoot, 'src/data');

const CLASSES = [
  { min: 0.0, max: 0.1, color: [255, 255, 204], alpha: 40 },
  { min: 0.1, max: 0.2, color: [255, 237, 160], alpha: 80 },
  { min: 0.2, max: 0.3, color: [254, 217, 118], alpha: 110 },
  { min: 0.3, max: 0.4, color: [254, 178, 76], alpha: 140 },
  { min: 0.4, max: 0.5, color: [253, 141, 60], alpha: 165 },
  { min: 0.5, max: 0.6, color: [252, 78, 42], alpha: 185 },
  { min: 0.6, max: 0.7, color: [227, 26, 28], alpha: 205 },
  { min: 0.7, max: 0.8, color: [189, 0, 38], alpha: 220 },
  { min: 0.8, max: 1.01, color: [128, 0, 38], alpha: 235 },
];

function classify(v) {
  for (let i = 0; i < CLASSES.length; i++) {
    if (v >= CLASSES[i].min && v < CLASSES[i].max) return CLASSES[i];
  }
  return CLASSES[CLASSES.length - 1];
}

function walkTifs(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTifs(full));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.tif')) out.push(full);
  }
  return out;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseMeta(file) {
  const base = path.basename(file, '.tif');
  const speciesDir = path.basename(path.dirname(file));
  const speciesLabel = speciesDir.replace(/_/g, ' ');
  const speciesSlug = slugify(speciesDir);

  let scenario = 'Baseline';
  let model = 'africa';
  let period = 'Baseline';

  if (/_ssp126_/i.test(base)) {
    scenario = 'SSP126';
    period = '2041-2070';
  } else if (/_ssp370_/i.test(base)) {
    scenario = 'SSP370';
    period = '2041-2070';
  } else {
    if (/_maxnet$/i.test(base)) model = 'maxnet';
    else if (/_rf$/i.test(base)) model = 'rf';
    else if (/_esm$/i.test(base)) model = 'esm';
    else if (/_masked$/i.test(base)) model = 'masked';
    else model = 'africa';
  }

  return {
    id: slugify(base),
    speciesSlug,
    species: speciesLabel,
    scenario,
    period,
    model,
    file: path.basename(file),
  };
}

async function processFile(file) {
  const meta = parseMeta(file);
  const tiff = await fromFile(file);
  const image = await tiff.getImage();
  const width = image.getWidth();
  const height = image.getHeight();
  const bbox = image.getBoundingBox();

  const rasters = await image.readRasters();
  const band = rasters[0];

  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let valid = 0;
  for (let i = 0; i < band.length; i++) {
    const v = band[i];
    if (v == null || Number.isNaN(v) || !Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
    valid++;
  }
  const mean = valid ? sum / valid : 0;

  const png = new PNG({ width, height });
  for (let i = 0; i < band.length; i++) {
    const v = band[i];
    const o = i * 4;
    if (v == null || Number.isNaN(v) || !Number.isFinite(v)) {
      png.data[o] = 0;
      png.data[o + 1] = 0;
      png.data[o + 2] = 0;
      png.data[o + 3] = 0;
      continue;
    }
    const c = classify(v);
    png.data[o] = c.color[0];
    png.data[o + 1] = c.color[1];
    png.data[o + 2] = c.color[2];
    png.data[o + 3] = c.alpha;
  }

  if (!fs.existsSync(OUT_RASTERS)) fs.mkdirSync(OUT_RASTERS, { recursive: true });
  const pngName = `${meta.id}.png`;
  const buffer = PNG.sync.write(png, { colorType: 6, deflateLevel: 9 });
  fs.writeFileSync(path.join(OUT_RASTERS, pngName), buffer);

  return {
    ...meta,
    png: `/rasters/${pngName}`,
    width,
    height,
    bbox,
    min: Number(min.toFixed(4)),
    max: Number(max.toFixed(4)),
    mean: Number(mean.toFixed(4)),
    validPixels: valid,
    totalPixels: band.length,
    coverage: Number((valid / band.length).toFixed(4)),
    bytes: buffer.length,
  };
}

async function main() {
  console.log(`Source: ${SOURCE_DIR}`);
  const files = walkTifs(SOURCE_DIR);
  console.log(`Found ${files.length} GeoTIFF files`);

  const records = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    try {
      const rec = await processFile(f);
      records.push(rec);
      console.log(`[${i + 1}/${files.length}] ${rec.scenario} ${rec.model} ${rec.species} -> ${rec.png} (${(rec.bytes / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`[${i + 1}/${files.length}] FAILED ${f}: ${err.message}`);
    }
  }

  records.sort((a, b) => a.species.localeCompare(b.species) || a.scenario.localeCompare(b.scenario) || a.model.localeCompare(b.model));

  const speciesMap = new Map();
  for (const r of records) {
    if (!speciesMap.has(r.speciesSlug)) {
      speciesMap.set(r.speciesSlug, {
        slug: r.speciesSlug,
        label: r.species,
        genus: r.species.split(' ')[0],
        scenarios: new Set(),
        models: new Set(),
        records: 0,
      });
    }
    const s = speciesMap.get(r.speciesSlug);
    s.scenarios.add(r.scenario);
    s.models.add(r.model);
    s.records++;
  }

  const species = [...speciesMap.values()].map((s) => ({
    slug: s.slug,
    label: s.label,
    genus: s.genus,
    scenarios: [...s.scenarios].sort(),
    models: [...s.models].sort(),
    records: s.records,
  }));

  const bounds = records.length
    ? records[0].bbox
    : [-25.34, -46.99, 51.41, 37.34];

  const dataset = {
    generatedAt: new Date().toISOString(),
    title: 'Africa Stingless Bee Suitability',
    organisation: 'icipe',
    bounds,
    classes: CLASSES.map((c) => ({
      from: c.min,
      to: c.max,
      color: `rgb(${c.color.join(',')})`,
      hex: '#' + c.color.map((x) => x.toString(16).padStart(2, '0')).join(''),
      alpha: c.alpha,
    })),
    scenarios: [...new Set(records.map((r) => r.scenario))].sort(),
    models: [...new Set(records.map((r) => r.model))].sort(),
    species,
    records,
  };

  if (!fs.existsSync(OUT_DATA)) fs.mkdirSync(OUT_DATA, { recursive: true });
  fs.writeFileSync(path.join(OUT_DATA, 'dataset.json'), JSON.stringify(dataset, null, 2));

  const totalBytes = records.reduce((a, r) => a + r.bytes, 0);
  console.log(`\nWrote ${records.length} records`);
  console.log(`Total PNG size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Dataset: ${path.join(OUT_DATA, 'dataset.json')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
