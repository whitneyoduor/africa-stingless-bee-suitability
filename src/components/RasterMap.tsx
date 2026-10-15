'use client';

import { useEffect, useRef, useState } from 'react';

type Bounds = [[number, number], [number, number]];

interface RasterMapProps {
  png: string;
  bounds: Bounds;
  opacity?: number;
  heightClass?: string;
  basemap?: boolean;
  zoom?: number;
}

export default function RasterMap({
  png,
  bounds,
  opacity = 0.8,
  heightClass = 'map-tall',
  basemap = true,
}: RasterMapProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const layerRef = useRef<unknown>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let map: import('leaflet').Map | null = null;

    (async () => {
      const L = (await import('leaflet')).default;
      if (disposed || !elRef.current) return;

      map = L.map(elRef.current, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
      });

      if (basemap) {
        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
          }
        ).addTo(map);
      }

      map.fitBounds(bounds, { padding: [8, 8] });
      map.setMaxBounds([
        [bounds[0][0] - 12, bounds[0][1] - 12],
        [bounds[1][0] + 12, bounds[1][1] + 12],
      ]);

      mapRef.current = map;
      setReady(true);
    })();

    return () => {
      disposed = true;
      if (map) map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      const map = mapRef.current as import('leaflet').Map | null;
      if (cancelled || !map) return;

      if (layerRef.current) {
        map.removeLayer(layerRef.current as import('leaflet').Layer);
      }
      const overlay = L.imageOverlay(png, bounds, {
        opacity,
        interactive: false,
        className: 'raster-overlay',
      });
      overlay.addTo(map);
      layerRef.current = overlay;
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, png, bounds, opacity]);

  return <div ref={elRef} className={`map-frame ${heightClass}`} />;
}
