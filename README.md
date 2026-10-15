# Africa Stingless Bee Suitability

An organisational dashboard of modelled distribution suitability for African
stingless bees (tribe Meliponini) under baseline climate and future projections
for **2041–2070** (SSP126 & SSP370).

Built with **Next.js 15 (App Router) + TypeScript** and deployed on **Vercel**.

## Features

- **Interactive map** — Leaflet map with species / scenario / model selectors, opacity control, per-layer statistics and legend.
- **Species explorer** — searchable, filterable catalogue with a detail page per species.
- **Scenario comparison** — any two layers side by side, with a difference (B − A) readout.
- **Analytics** — mean suitability per species by scenario, scenario averages and modelled coverage (hand-built SVG charts, no extra dependencies).
- **Data inventory** — searchable, filterable, sortable table with PNG downloads and CSV export.
- **Downloads** — rendered PNG layers plus `dataset.json` metadata.

## Data pipeline

The source files are georeferenced GeoTIFF suitability surfaces (EPSG:4326). They
are pre-rendered into small, quantised, transparent-aware PNGs and a single metadata
file:

```
npm run process:rasters
```

- Reads `.tif` files from `SOURCE_DIR` (default `../Results`).
- Writes optimised PNGs to `public/rasters/`.
- Writes metadata (bounds, statistics, classes) to `src/data/dataset.json`.

The source GeoTIFFs are **not** committed; only the rendered PNGs and metadata are,
keeping the repository small.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve production build
```

## Deployment (Vercel)

1. Import `whitneyoduor/africa-stingless-bee-suitability` on Vercel.
2. Framework preset: **Next.js** (auto-detected).
3. Build command: `next build`. Output: default (`.next`).
4. Deploy. No `vercel.json` is required.

## Data note

Surfaces are model-derived suitability estimates (0 = unsuitable, 1 = highly
suitable) and do not represent observed occurrence. Intended for research,
conservation and pollinator planning.
