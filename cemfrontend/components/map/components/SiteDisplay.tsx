'use client';

import { useContext, useEffect } from 'react';
import { Site } from '../../../api/types';
import { MapContext } from '../MapView';
import BoundsDisplay from './BoundsDisplay';
import mapboxgl from 'mapbox-gl';

const siteBoundsId = (site: Site) => `site-bounds-${site.id}`;
const siteBoundsLayerId = (site: Site) => `site-bounds-layer-${site.id}`;
const siteFloorPlanId = (site: Site) => `site-floor-plan-${site.id}`;
const siteFloorPlanLayerId = (site: Site) => `site-floor-plan-layer-${site.id}`;

interface ComponentProps {
	site: Site;
	zoomToBounds?: boolean;
}

export default function SiteDisplay({ site, zoomToBounds }: ComponentProps) {
	const map = useContext(MapContext);

	console.log(site.bounds);

	useEffect(() => {
		if (!map) return;

		// Floor plan
		map.addSource(siteFloorPlanId(site), {
			type: 'image',
			url: site.floors[0].floor_plan,
			coordinates: site.floors[0].floor_plan_bounds,
		});
		map.addLayer({
			id: siteFloorPlanLayerId(site),
			type: 'raster',
			source: siteFloorPlanId(site),
			paint: {
				'raster-fade-duration': 0,
			},
		});

		if (zoomToBounds) {
			const zoomBounds = new mapboxgl.LngLatBounds();
			(typeof site.bounds === 'string' ? JSON.parse(site.bounds) : site.bounds).forEach((coord) =>
				zoomBounds.extend(coord)
			);
			map.fitBounds(zoomBounds, { padding: 40 });
		}

		return () => {
			if (!map) return;

			// map.removeLayer(siteFloorPlanLayerId(site));
			// map.removeSource(siteFloorPlanId(site));
		};
	}, [map, site]);

	return <BoundsDisplay bounds={site.bounds} />;
}
