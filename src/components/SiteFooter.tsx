import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="cols">
          <div>
            <h4>Africa Stingless Bee Suitability</h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '46ch' }}>
              Species distribution suitability surfaces for African stingless bees
              (Meliponini) under baseline climate and future projections for 2041–2070
              (SSP126 &amp; SSP370).
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <Link href="/">Dashboard map</Link>
            <Link href="/species">Species explorer</Link>
            <Link href="/compare">Scenario comparison</Link>
            <Link href="/analytics">Analytics</Link>
          </div>
          <div>
            <h4>Resources</h4>
            <Link href="/data">Data &amp; downloads</Link>
            <Link href="/about">About &amp; methods</Link>
            <a href="/dataset.json" download>
              dataset.json
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} icipe — International Centre of Insect Physiology and Ecology.</span>
          <span>Data are model-derived suitability surfaces for research and planning.</span>
        </div>
      </div>
    </footer>
  );
}
