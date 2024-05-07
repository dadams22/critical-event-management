'use client';

import { useContext, useEffect, useMemo } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { TxRectMode } from 'mapbox-gl-draw-rotate-scale-rect-mode';
import { Bounds } from '../../../api/types';
import { MapContext } from '../MapView';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

export interface DrawBoundsControlsProps {
	onUpdateBounds: (bounds?: Bounds) => void;
	bounds?: Bounds;
}

export default function DrawBoundsControls({ onUpdateBounds, bounds }: DrawBoundsControlsProps) {
	const map = useContext(MapContext);

	const draw = useMemo<MapboxDraw>(
		() =>
			new MapboxDraw({
				displayControlsDefault: false,
				// Select which mapbox-gl-draw control buttons to add to the map.
				controls: {
					polygon: true,
					trash: true,
				},
				touchEnabled: true,
				// Set mapbox-gl-draw to draw by default.
				// The user does not have to click the polygon control button first.
				defaultMode: 'draw_polygon',
				modes: {
					tx_poly: TxRectMode,
					...MapboxDraw.modes,
				},
			}),
		[]
	);

	useEffect(() => {
		if (!map) return;

		map.addControl(draw);

		if (bounds) {
			draw.add({
				id: 'bounds',
				type: 'Feature',
				geometry: {
					type: 'Polygon',
					coordinates: bounds,
				},
				properties: {},
			});

			draw.changeMode('simple_select', {
				featureIds: ['bounds'],
			});
		}

		const handleUpdateBounds = (e) => {
			onUpdateBounds(e.features?.[0]?.geometry?.coordinates);
		};
		map.on('draw.create', handleUpdateBounds);
		map.on('draw.delete', () => onUpdateBounds(undefined));
		map.on('draw.update', handleUpdateBounds);

		return () => {
			map.removeControl(draw);
		};
	}, [map, draw]);

	useEffect(() => {
		// disable create polygon button if there is already a defined polygon
		const polygonButton = document.getElementsByClassName('mapbox-gl-draw_polygon')[0];
		if (!polygonButton) return;
		polygonButton.disabled = !!bounds;
	}, [map, bounds]);

	return null;
}
