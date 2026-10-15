'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/map', label: 'Map' },
  { href: '/species', label: 'Species' },
  { href: '/compare', label: 'Compare' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/data', label: 'Data' },
  { href: '/about', label: 'About' },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="container bar">
        <Link href="/" className="brand" aria-label="Africa Stingless Bee Suitability home">
          <span className="mark" aria-hidden>
            🐝
          </span>
          <span className="titles">
            <span className="t1">Africa Stingless Bee Suitability</span>
            <span className="t2">icipe · Climate suitability atlas</span>
          </span>
        </Link>
        <nav className="nav">
          {LINKS.map((l) => {
            const active =
              l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={active ? 'active' : ''}>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
