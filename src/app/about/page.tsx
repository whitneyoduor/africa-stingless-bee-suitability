import type { Metadata } from 'next';
import { dataset, records, speciesList, models } from '@/lib/data';

export const metadata: Metadata = {
  title: 'About & methods',
  description: 'About the Africa Stingless Bee Suitability atlas and its methods.',
};

export default function AboutPage() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">About</span>
        <h1>About this atlas</h1>
        <p style={{ maxWidth: '70ch' }}>
          The Africa Stingless Bee Suitability atlas presents modelled distribution
          suitability for African stingless bees (tribe Meliponini), a group of
          ecologically and economically important pollinators. It is intended to
          support research, conservation planning and pollinator-friendly land-use
          decisions.
        </p>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-head">
            <h3>Data</h3>
          </div>
          <div className="panel-body">
            <div className="stat-row">
              <span className="k">Species</span>
              <span className="v">{speciesList.length}</span>
            </div>
            <div className="stat-row">
              <span className="k">Raster layers</span>
              <span className="v">{records.length}</span>
            </div>
            <div className="stat-row">
              <span className="k">Modelling approaches</span>
              <span className="v">{models.join(', ')}</span>
            </div>
            <div className="stat-row">
              <span className="k">Scenarios</span>
              <span className="v">Baseline, SSP126, SSP370</span>
            </div>
            <div className="stat-row">
              <span className="k">Future period</span>
              <span className="v">2041–2070</span>
            </div>
            <div className="stat-row">
              <span className="k">Index range</span>
              <span className="v">0 – 1</span>
            </div>
            <div className="stat-row">
              <span className="k">Last generated</span>
              <span className="v">
                {new Date(dataset.generatedAt).toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Methods &amp; interpretation</h3>
          </div>
          <div className="panel-body">
            <p>
              Layers are model-derived estimates of environmental suitability for each
              species. Pixel values span 0–1; values near 1 indicate more suitable
              conditions and values near 0 indicate unsuitable conditions. Areas with
              no model support are shown as transparent (no-data).
            </p>
            <p>
              The exact definition of the index (e.g. probability of occurrence versus
              habitat suitability), the baseline period, and the specific climate
              models behind each scenario should be confirmed with the data provider.
              The 2041–2070 window for future layers is taken directly from the source
              filenames.
            </p>
            <p>
              Future layers represent the 2041–2070 climatology under two Shared
              Socioeconomic Pathways — SSP126 (low emissions) and SSP370 (high
              emissions). Differences between baseline and future layers indicate
              projected shifts in suitable area.
            </p>
            <p>
              Multiple layer variants are provided where available, distinguished by
              a filename suffix: <strong>africa</strong>, <strong>maxnet</strong>,{' '}
              <strong>rf</strong>, <strong>esm</strong> and <strong>masked</strong>.
              Compare layers only within the same suffix. The precise meaning of each
              suffix should be confirmed with the data provider.
            </p>
          </div>
        </div>
      </div>

      <div className="note" style={{ marginTop: 22 }}>
        These are modelled surfaces, not observed occurrence records. Several details
        (index definition, baseline period, climate models, and layer suffixes) are not
        documented in the source files and should be confirmed with the data provider.
        Interpret with appropriate uncertainty; intended for research and planning.
      </div>
    </div>
  );
}
