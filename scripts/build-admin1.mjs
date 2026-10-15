import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const input = process.argv[2];
const output =
  process.argv[3] || path.resolve(projectRoot, 'public/geo/africa-admin1.geojson');
const tolerance = Number(process.env.SIMPLIFY || 0.02);

const AFRICA_ISO3 = new Set([
  'DZA', 'AGO', 'BEN', 'BWA', 'BFA', 'BDI', 'CPV', 'CMR', 'CAF', 'TCD', 'COM',
  'COG', 'COD', 'CIV', 'DJI', 'EGY', 'GNQ', 'ERI', 'SWZ', 'ETH', 'GAB', 'GMB',
  'GHA', 'GIN', 'GNB', 'KEN', 'LSO', 'LBR', 'LBY', 'MDG', 'MWI', 'MLI', 'MRT',
  'MUS', 'MAR', 'MOZ', 'NAM', 'NER', 'NGA', 'RWA', 'STP', 'SEN', 'SYC', 'SLE',
  'SOM', 'ZAF', 'SSD', 'SDN', 'TZA', 'TGO', 'TUN', 'UGA', 'ZMB', 'ZWE', 'ESH',
  'SOL', 'IOA', 'REU', 'MYT', 'SHN',
]);

function perpDistance(p, a, b) {
  const [x, y] = p;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
  const cx = x1 + Math.max(0, Math.min(1, t)) * dx;
  const cy = y1 + Math.max(0, Math.min(1, t)) * dy;
  return Math.hypot(x - cx, y - cy);
}

function simplify(points, tol) {
  if (points.length <= 3) return points;
  const sqTol = tol * tol;
  const keep = new Array(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDist = 0;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const d = perpDistance(points[i], points[first], points[last]);
      if (d > maxDist) {
        maxDist = d;
        index = i;
      }
    }
    if (maxDist > tol && index !== -1) {
      keep[index] = true;
      stack.push([first, index], [index, last]);
    }
  }
  const out = [];
  for (let i = 0; i < points.length; i++) {
    if (keep[i]) out.push(points[i]);
  }
  return out.length >= 3 ? out : points;
}

function roundRing(ring) {
  let prev = null;
  const out = [];
  for (const [x, y] of ring) {
    const rx = Math.round(x * 10000) / 10000;
    const ry = Math.round(y * 10000) / 10000;
    if (prev && prev[0] === rx && prev[1] === ry) continue;
    out.push([rx, ry]);
    prev = [rx, ry];
  }
  return out;
}

function processGeometry(geom) {
  if (geom.type === 'Polygon') {
    return {
      type: 'Polygon',
      coordinates: geom.coordinates.map((ring) => roundRing(simplify(roundRing(ring), tolerance))),
    };
  }
  if (geom.type === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geom.coordinates.map((poly) =>
        poly.map((ring) => roundRing(simplify(roundRing(ring), tolerance)))
      ),
    };
  }
  return geom;
}

const raw = JSON.parse(fs.readFileSync(input, 'utf8'));
console.log(`input features: ${raw.features.length}`);
console.log('prop keys:', Object.keys(raw.features[0].properties).join(','));

function isAfrica(props) {
  if (props.region === 'Africa') return true;
  if (props.continent === 'Africa') return true;
  if (props.adm0_a3 && AFRICA_ISO3.has(props.adm0_a3)) return true;
  if (props.sov_a3 && AFRICA_ISO3.has(props.sov_a3)) return true;
  return false;
}

const features = [];
for (const f of raw.features) {
  if (!isAfrica(f.properties)) continue;
  const geom = processGeometry(f.geometry);
  if (!geom) continue;
  features.push({
    type: 'Feature',
    properties: {
      name: f.properties.name || f.properties.name_en || '',
      country: f.properties.admin || '',
      iso: f.properties.adm0_a3 || '',
      type: f.properties.type_en || '',
    },
    geometry: geom,
  });
}

const out = { type: 'FeatureCollection', features };
if (!fs.existsSync(path.dirname(output))) fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(out));

const inSize = fs.statSync(input).size;
const outSize = fs.statSync(output).size;
console.log(`africa features: ${features.length}`);
console.log(`countries: ${new Set(features.map((f) => f.properties.iso)).size}`);
console.log(`size: ${(inSize / 1e6).toFixed(2)} MB -> ${(outSize / 1e6).toFixed(2)} MB`);
console.log(`written: ${output}`);
