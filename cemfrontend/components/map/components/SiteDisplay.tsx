'use client';

import { useContext, useEffect } from 'react';
import { Site } from '../../../api/types';
import { MapContext } from '../MapView';
import BoundsDisplay from './BoundsDisplay';
import mapboxgl from 'mapbox-gl';
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

export default function SiteDisplay({ site, zoomToBounds, selectedFloorId }: ComponentProps) {
	const map = useContext(MapContext);

	const selectedFloor = site.floors.find((floor) => String(floor.id) === selectedFloorId);

	useEffect(() => {
		if (!map) return;
		if (zoomToBounds) {
			const zoomBounds = new mapboxgl.LngLatBounds();
			(typeof site.bounds === 'string' ? JSON.parse(site.bounds) : site.bounds).forEach((coord) =>
				zoomBounds.extend(coord)
			);
			map.fitBounds(zoomBounds, { padding: 40 });
		}
	}, [zoomToBounds, map]);

	return (
		<>
			<BoundsDisplay bounds={site.bounds} />
			{selectedFloor && <FloorPlanDisplay floor={selectedFloor} />}
		</>
	);
}
