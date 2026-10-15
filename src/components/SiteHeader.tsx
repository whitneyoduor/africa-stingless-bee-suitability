'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Dashboard' },
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
        <Link href="/" className="brand" aria-label="Africa Stingless Bee Suitability dashboard">
          <span className="mark" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 15c0-3.3 3.6-6 8-6s8 2.7 8 6-3.6 6-8 6-8-2.7-8-6Z"
                fill="rgba(255,255,255,0.92)"
              />
              <path d="M6 5.5 9 8M18 5.5 15 8" stroke="rgba(255,255,255,0.92)" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M5 13h14M5 17h14" stroke="#1f6b3b" strokeWidth="1.4" />
            </svg>
          </span>
          <span className="titles">
            <span className="t1">Africa Stingless Bee Suitability</span>
            <span className="t2">icipe · climate suitability dashboard</span>
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
