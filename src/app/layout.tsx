import type { Metadata } from 'next';
import './globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: {
    default: 'Africa Stingless Bee Suitability | icipe',
    template: '%s | Africa Stingless Bee Suitability',
  },
  description:
    'Interactive distribution suitability dashboard for African stingless bees under baseline and future climate scenarios (SSP126 & SSP370, 2041–2070).',
  applicationName: 'Africa Stingless Bee Suitability',
  keywords: [
    'stingless bees',
    'Africa',
    'species distribution',
    'climate change',
    'suitability',
    'icipe',
    'pollinators',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
