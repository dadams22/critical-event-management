'use client';

import React, { useEffect, useRef } from 'react';
import { Location } from '../../../../api/types';
import mapboxgl from 'mapbox-gl';
import styled from '@emotion/styled';
import { useMantineTheme, Text, ColorScheme } from '@mantine/core';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

mapboxgl.accessToken =
	'pk.eyJ1IjoiZGFkYW1zMjIiLCJhIjoiY2xqd2llczgyMHd4azNkbWhwb2Z6ZTB3YyJ9.VYzIdS2JPHTEW2aHYPONqg';

const MapContainer = styled.div`
	width: 100%;
	height: 100%;
`;

export type Bounds = [number, number][];

interface ComponentProps {
	location: Location;
	onUpdateBounds: (bounds?: Bounds) => void;
	polygons?: Bounds[];
	floorPlanImageUrl?: string;
}

export default function MapView({ location, onUpdateBounds, polygons, floorPlanImageUrl }: ComponentProps) {
	const theme = useMantineTheme();

	const map = useRef(null);
	const mapContainer = useRef<HTMLDivElement>(null);

	const colorScheme: ColorScheme = 'dark';

	console.log(map.current?.getBounds())

	useEffect(() => {
		if (map.current) return; // initialize map only once
		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style:
				colorScheme === 'dark'
					? 'mapbox://styles/mapbox/dark-v11'
					: 'mapbox://styles/mapbox/light-v11',
			center: [location.longitude, location.latitude],
			zoom: 18,
		});

		const marker = new mapboxgl.Marker({
			color: theme.colors.red[8],
		})
			.setLngLat([location.longitude, location.latitude])
			.addTo(map.current);

		// Add polygon editing controls
		if (!!onUpdateBounds) {
			const draw = new MapboxDraw({
				displayControlsDefault: false,
				// Select which mapbox-gl-draw control buttons to add to the map.
				controls: !!onUpdateBounds
					? {
							polygon: true,
							trash: true,
						}
					: {},
				touchEnabled: !!onUpdateBounds,
				// Set mapbox-gl-draw to draw by default.
				// The user does not have to click the polygon control button first.
				defaultMode: 'draw_polygon',
			});
			map.current.addControl(draw);

			if (!!polygons) {
				polygons.forEach((bounds, i) => {
					draw.add({
						id: `polygon-${i}`,
						type: 'Feature',
						geometry: {
							type: 'Polygon',
							coordinates: bounds,
						},
					});
				});

				draw.changeMode('simple_select', {
					featureIds: ['polygon-0'],
				});
			}

			const handleUpdateBounds = (e) => {
				console.log(e);
				onUpdateBounds(e.features?.[0]?.geometry?.coordinates);
			};

			map.current.on('draw.create', handleUpdateBounds);
			map.current.on('draw.delete', () => onUpdateBounds(undefined));
			map.current.on('draw.update', handleUpdateBounds);
		} else if (!!polygons) {
			map.current!.on('load', () => {
				polygons.forEach((bounds, i) => {
					map.current!.addSource(`polygon-${i}`, {
						type: 'geojson',
						data: {
							type: 'Feature',
							geometry: {
								type: 'Polygon',
								// These coordinates outline Maine.
								coordinates: bounds,
							},
						},
					});
					map.current!.addLayer({
						id: `polygon-${i}`,
						type: 'fill',
						source: `polygon-${i}`, // reference the data source
						layout: {},
						paint: {
							'fill-color': '#0080ff', // blue color fill
							'fill-opacity': 0.5,
						},
					});
				});
			});
		}
	});

	useEffect(() => {
		if (!!onUpdateBounds) {
			const polygonButton = document.getElementsByClassName('mapbox-gl-draw_polygon')[0];
			polygonButton.disabled = !!polygons;
		}
	}, [onUpdateBounds, polygons, map.current]);

	return <MapContainer ref={mapContainer} />;
}
