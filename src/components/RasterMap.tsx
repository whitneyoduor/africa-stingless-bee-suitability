'use client';

import { useEffect, useRef, useState } from 'react';

type Bounds = [[number, number], [number, number]];

interface RasterMapProps {
  png: string;
  bounds: Bounds;
  opacity?: number;
  heightClass?: string;
  showAdmin?: boolean;
  basemap?: 'light' | 'streets';
}

const STYLES: Record<NonNullable<RasterMapProps['basemap']>, string> = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  streets: 'https://tiles.openfreemap.org/styles/liberty',
};

export default function RasterMap({
  png,
  bounds,
  opacity = 0.82,
  heightClass = 'map-tall',
  showAdmin = true,
  basemap = 'light',
}: RasterMapProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('maplibre-gl').Map | null>(null);
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);

  const [south, west] = bounds[0];
  const [north, east] = bounds[1];
  const corners: [[number, number], [number, number], [number, number], [number, number]] = [
    [west, north],
    [east, north],
    [east, south],
    [west, south],
  ];

  const pngRef = useRef(png);
  const cornersRef = useRef(corners);
  const opacityRef = useRef(opacity);
  const showAdminRef = useRef(showAdmin);
  pngRef.current = png;
  cornersRef.current = corners;
  opacityRef.current = opacity;
  showAdminRef.current = showAdmin;

  useEffect(() => {
    let disposed = false;
    let map: import('maplibre-gl').Map | null = null;

    (async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      if (disposed || !elRef.current) return;

      map = new maplibregl.Map({
        container: elRef.current,
        style: STYLES[basemap],
        bounds: [
          [west, south],
          [east, north],
        ],
        fitBoundsOptions: { padding: 20 },
        maxZoom: 19,
        attributionControl: { compact: true },
      });

      const m = map;
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      const resizeObserver = new ResizeObserver(() => m.resize());
      resizeObserver.observe(elRef.current);

      const setupOverlays = () => {
        if (disposed) return;
        const firstSymbolId = m.getStyle().layers?.find((l) => l.type === 'symbol')?.id;

        if (!m.getSource('admin1')) {
          m.addSource('admin1', {
            type: 'geojson',
            data: '/geo/africa-admin1.geojson',
          });
        }
        if (!m.getLayer('admin1-line')) {
          m.addLayer(
            {
              id: 'admin1-line',
              type: 'line',
              source: 'admin1',
              paint: {
                'line-color': '#5f6f66',
                'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.35, 6, 1.2],
                'line-opacity': 0.72,
                'line-dasharray': [2, 1.5],
              },
            },
            firstSymbolId
          );
        }

        if (!m.getSource('raster')) {
          m.addSource('raster', {
            type: 'image',
            url: pngRef.current,
            coordinates: cornersRef.current,
          });
        }
        if (!m.getLayer('raster')) {
          m.addLayer(
            {
              id: 'raster',
              type: 'raster',
              source: 'raster',
              paint: {
                'raster-opacity': opacityRef.current,
                'raster-fade-duration': 0,
              },
            },
            firstSymbolId
          );
        }

        m.setLayoutProperty(
          'admin1-line',
          'visibility',
          showAdminRef.current ? 'visible' : 'none'
        );

        readyRef.current = true;
        setReady(true);
      };

      m.on('load', setupOverlays);
      m.on('style.load', setupOverlays);

      window.setTimeout(setupOverlays, 4000);

      m.on('error', () => {
        /* tolerate optional basemap/boundary failures */
      });

      mapRef.current = m;
    })();

    return () => {
      disposed = true;
      readyRef.current = false;
      const m = mapRef.current;
      if (m) m.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource('raster') as import('maplibre-gl').ImageSource | undefined;
    if (source && typeof source.updateImage === 'function') {
      source.updateImage({ url: png, coordinates: corners });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, png]);

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    if (!map || !map.getLayer('raster')) return;
    map.setPaintProperty('raster', 'raster-opacity', opacity);
  }, [ready, opacity]);

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    if (!map || !map.getLayer('admin1-line')) return;
    map.setLayoutProperty('admin1-line', 'visibility', showAdmin ? 'visible' : 'none');
  }, [ready, showAdmin]);

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(STYLES[basemap]);
  }, [ready, basemap]);

  return <div ref={elRef} className={`map-frame ${heightClass}`} />;
}
