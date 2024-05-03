'use client';

import { useContext, useEffect } from 'react';
import { Floor } from '../../../api/types';
import { MapContext } from '../MapView';

const floorPlanSourceId = (floor: Floor) => `site-floor-plan-${floor.id}`;
const floorPlanLayerId = (floor: Floor) => `site-floor-plan-layer-${floor.id}`;

interface ComponentProps {
	floor: Floor;
}

export default function FloorPlanDisplay({ floor }: ComponentProps) {
	const map = useContext(MapContext);

	useEffect(() => {
		if (!map) return;

		// Floor plan
		map.addSource(floorPlanSourceId(floor), {
			type: 'image',
			url: floor.floor_plan,
			coordinates: floor.floor_plan_bounds,
		});
		map.addLayer({
			id: floorPlanLayerId(floor),
			type: 'raster',
			source: floorPlanSourceId(floor),
			paint: {
				'raster-fade-duration': 0,
			},
		});

		return () => {
			if (!map) return;

			map.removeLayer(floorPlanLayerId(floor));
			map.removeSource(floorPlanSourceId(floor));
		};
	}, [map, floor]);

	return null;
}
