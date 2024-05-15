'use client';

import { useContext, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Site } from '../../../api/types';
import { MapContext } from '../MapView';
import BoundsDisplay from './BoundsDisplay';
import FloorPlanDisplay from './FloorPlanDisplay';

const siteBoundsId = (site: Site) => `site-bounds-${site.id}`;
const siteBoundsLayerId = (site: Site) => `site-bounds-layer-${site.id}`;
const siteFloorPlanId = (site: Site) => `site-floor-plan-${site.id}`;
const siteFloorPlanLayerId = (site: Site) => `site-floor-plan-layer-${site.id}`;

interface ComponentProps {
  site: Site;
  zoomToBounds?: boolean;
  selectedFloorId?: string;
}

export default function SiteDisplay({ site, selectedFloorId }: ComponentProps) {
  const selectedFloor = site.floors.find((floor) => String(floor.id) === selectedFloorId);

  return (
    <>
      <BoundsDisplay bounds={site.bounds} />
      {selectedFloor && <FloorPlanDisplay floor={selectedFloor} />}
    </>
  );
}
