'use client';

import { useContext, useEffect } from 'react';
import { MapContext } from '../MapView';
import { Location } from '../../../api/types';

export interface AddAssetControlsProps {
  onAdd: (location: Location) => void;
}

export default function AddAssetControls({ onAdd }: AddAssetControlsProps) {
  const map = useContext(MapContext);

  useEffect(() => {
    if (!map) return;

    const handleClick = (e) => {
      onAdd({ longitude: e.lngLat.lng, latitude: e.lngLat.lat });
    };
    map.on('click', handleClick);

    map.getCanvas().style.cursor = 'crosshair';

    return () => {
      map.off('click', handleClick);
      map.getCanvas().style.cursor = '';
    };
  }, [map]);

  return null;
}
