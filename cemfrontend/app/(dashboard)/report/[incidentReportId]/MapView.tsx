'use client';

import React, { useEffect, useRef } from 'react';
import { Location } from '../../../../api/types';
import mapboxgl from 'mapbox-gl';
import styled from '@emotion/styled';
import { useMantineTheme, Text, ColorScheme } from '@mantine/core';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { TxRectMode, TxCenter } from 'mapbox-gl-draw-rotate-scale-rect-mode';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { polygon } from '@turf/helpers';

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
	floorPlan?: {
		floorPlanImageUrl: string;
		floorPlanBounds: Polygon;
		width: number;
		height: number;
	}
}

export default function MapView({ location, onUpdateBounds, polygons, floorPlan }: ComponentProps) {
	const theme = useMantineTheme();

	const map = useRef(null);
	const draw = useRef(null);
	const mapContainer = useRef<HTMLDivElement>(null);

	const colorScheme: ColorScheme = 'dark';

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
			draw.current = new MapboxDraw({
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
				modes: Object.assign({
					tx_poly: TxRectMode,
				}, MapboxDraw.modes),
			});
			map.current.addControl(draw.current);

			if (!!polygons) {
				polygons.forEach((bounds, i) => {
					draw.current.add({
						id: `polygon-${i}`,
						type: 'Feature',
						geometry: {
							type: 'Polygon',
							coordinates: bounds,
						},
					});
				});

				draw.current.changeMode('simple_select', {
					featureIds: ['polygon-0'],
				});
			}

			const handleUpdateBounds = (e) => {
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
			if (!polygonButton) return;
			polygonButton.disabled = !!polygons;
		}
	}, [onUpdateBounds, polygons, map.current]);

	useEffect(() => {
		if (!floorPlan || !map.current) return;

		if (!draw.current) {
			draw.current = new MapboxDraw({
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
				modes: Object.assign({
					tx_poly: TxRectMode,
				}, MapboxDraw.modes),
			});
			map.current.addControl(draw.current);
		}

		const { floorPlanImageUrl, floorPlanBounds, width, height } = floorPlan;

		const computeRect = (center, size) => {
			const cUL = map.current.unproject ([center[0] - size[0]/2, center[1] - size[1]/2]).toArray();
			const cUR = map.current.unproject ([center[0] + size[0]/2, center[1] - size[1]/2]).toArray();
			const cLR = map.current.unproject ([center[0] + size[0]/2, center[1] + size[1]/2]).toArray();
			const cLL = map.current.unproject ([center[0] - size[0]/2, center[1] + size[1]/2]).toArray();
		
			return [cUL,cUR,cLR,cLL,cUL];
		};

		const drawUpdateOverlayByFeature = (feature) => {
			var coordinates = feature.geometry.coordinates[0].slice(0, 4);
			// TODO: Change this
			var overlaySourceId = 'floorPlanImage';
			map.current.getSource(overlaySourceId).setCoordinates(coordinates);
		};

		const canvas = map.current.getCanvas();
		// Get the device pixel ratio, falling back to 1.
		// var dpr = window.devicePixelRatio || 1;
		// Get the size of the canvas in CSS pixels.
		var rect = canvas.getBoundingClientRect();
		const w = rect.width;
		const h = rect.height;
		// console.log('canvas: ' + w + 'x' + h);
	
		let im_w = width;
		let im_h = height;
		while (im_w >= (0.8 * w) || im_h >= (0.8 * h)) {
			im_w = Math.round(0.8 * im_w);
			im_h = Math.round(0.8 * im_h);
		}
	
		const cPoly = computeRect([w/2, h/2], [im_w, im_h]);
		const cBox = cPoly.slice(0, 4);

		map.current.addSource("floorPlanImage", {
			"type": "image",
			"url": floorPlanImageUrl,
			"coordinates": cBox,
		});
	
		map.current.addLayer({
			"id": "floorPlanImageLayer",
			"type": "raster",
			"source": "floorPlanImage",
			"paint": {
				"raster-opacity": 0.90,
				"raster-fade-duration": 0
			},
		});

		const poly = polygon([cPoly]);
		poly.id = 'floorPlanPoly';
		floorPlanBounds.properties.overlaySourceId = 'floorPlanImage';
    	floorPlanBounds.properties.type = 'overlay';
		draw.current.add(poly)
		draw.current.changeMode('tx_poly', {
			featureId: poly.id, // required
			canRotate: true,
		});

		const onData = (e) => {
			if (e.sourceId && e.sourceId.startsWith('mapbox-gl-draw-')) {
				if (e.type && e.type == 'data'
					&& e.source.data
					// && e.sourceDataType && e.sourceDataType == 'content'
					// && e.sourceDataType == undefined
					// && e.isSourceLoaded
				) {
					// var source = this.map.getSource(e.sourceId);
					//var geojson = source._data;
					var geojson = e.source.data;
					console.log(geojson);
					if (geojson && geojson.features && geojson.features.length > 0
						&& geojson.features[0].properties) {
						drawUpdateOverlayByFeature(geojson.features[0]);
					}
				}
			}
		};

		map.current.on('data', onData);
	}, [floorPlan, draw.current, map.current]);

	return <MapContainer ref={mapContainer} />;
}
