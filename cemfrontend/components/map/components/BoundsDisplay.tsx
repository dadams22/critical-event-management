'use client';

import { useContext, useEffect, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import { Bounds } from '../../../api/types';
import { MapContext } from '../MapView';
import { useMantineTheme } from '@mantine/core';

const sourceId = (id: string) => `bounds-source-${id}`;
const layerId = (id: string) => `bounds-layer-${id}`;

interface ComponentProps {
  bounds: Bounds;
}

export default function BoundsDisplay({ bounds }: ComponentProps) {
  const map = useContext(MapContext);
  const theme = useMantineTheme();

  useEffect(() => {
    if (!map) return;

    const id = uuid();

    map.addSource(sourceId(id), {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: typeof bounds === 'string' ? JSON.parse(bounds) : bounds,
        },
      },
    });
    map.addLayer({
      id: layerId(id),
      type: 'fill',
      source: sourceId(id),
      layout: {},
      paint: {
        'fill-color': theme.colors.blue[4],
        'fill-opacity': 0.15,
      },
    });

    return () => {
      if (!map) return;

      map.removeSource(sourceId(id));
      map.removeLayer(layerId(id));
    };
  }, [map]);

  return null;
}
