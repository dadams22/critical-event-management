'use client';

import { useContext, useEffect, useMemo } from "react";
import { Bounds } from "../../../api/types";
import { MapContext } from "../MapView";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { polygon } from '@turf/helpers';
import { TxRectMode } from 'mapbox-gl-draw-rotate-scale-rect-mode';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import BoundsDisplay from "./BoundsDisplay";

export interface PlaceFloorPlanControlsProps {
    floorPlanImageUrl: string;
    width: number;
    height: number;
    onUpdateFloorPlanBounds: (bounds: Bounds) => void;
    siteBounds: Bounds;
}

export default function PlaceFloorPlanControls({ floorPlanImageUrl, width, height, onUpdateFloorPlanBounds, siteBounds }: ComponentProps) {
    const map = useContext(MapContext);

    const draw = useMemo<MapboxDraw>(() => new MapboxDraw({
        displayControlsDefault: false,
        // Select which mapbox-gl-draw control buttons to add to the map.
        controls: {},
        touchEnabled: false,
        // Set mapbox-gl-draw to draw by default.
        // The user does not have to click the polygon control button first.
        defaultMode: 'draw_polygon',
        modes: Object.assign(
            {
                tx_poly: TxRectMode,
            },
            MapboxDraw.modes
        ),
    }), []);

    useEffect(() => {
        if (!map) return;

        map.addControl(draw);

		const computeRect = (center: [number, number], size: [number, number]) => {
			const cUL = map
				.unproject([center[0] - size[0] / 2, center[1] - size[1] / 2])
				.toArray();
			const cUR = map
				.unproject([center[0] + size[0] / 2, center[1] - size[1] / 2])
				.toArray();
			const cLR = map
				.unproject([center[0] + size[0] / 2, center[1] + size[1] / 2])
				.toArray();
			const cLL = map
				.unproject([center[0] - size[0] / 2, center[1] + size[1] / 2])
				.toArray();

			return [cUL, cUR, cLR, cLL, cUL];
		};

        const drawUpdateOverlayByFeature = (feature) => {
			const coordinates = feature.geometry.coordinates[0].slice(0, 4);
			// TODO: Change this
			var overlaySourceId = 'floorPlanImage';
			map.getSource(overlaySourceId).setCoordinates(coordinates);
			onUpdateFloorPlanBounds(coordinates);
		};

        const canvas = map.getCanvas();
		// Get the device pixel ratio, falling back to 1.
		// var dpr = window.devicePixelRatio || 1;
		// Get the size of the canvas in CSS pixels.
		const rect = canvas.getBoundingClientRect();
		const w = rect.width;
		const h = rect.height;

		let im_w = width;
		let im_h = height;
		while (im_w >= 0.8 * w || im_h >= 0.8 * h) {
			im_w = Math.round(0.8 * im_w);
			im_h = Math.round(0.8 * im_h);
		}

		const cPoly = computeRect([w / 2, h / 2], [im_w, im_h]);
		const cBox = cPoly.slice(0, 4);

		map.addSource('floorPlanImage', {
			type: 'image',
			url: floorPlanImageUrl,
			coordinates: cBox,
		});

        map.addLayer({
			id: 'floorPlanImageLayer',
			type: 'raster',
			source: 'floorPlanImage',
			paint: {
				'raster-opacity': 0.9,
				'raster-fade-duration': 0,
			},
		});

		const poly = polygon([cPoly]);
		poly.id = 'floorPlanPoly';
		poly.properties.overlaySourceId = 'floorPlanImage';
		poly.properties.type = 'overlay';
		draw.add(poly);
		draw.changeMode('tx_poly', {
			featureId: poly.id, // required
			canRotate: true,
		});

        const onData = (e) => {
			if (e.sourceId && e.sourceId.startsWith('mapbox-gl-draw-')) {
				if (
					e.type &&
					e.type == 'data' &&
					e.source.data
					// && e.sourceDataType && e.sourceDataType == 'content'
					// && e.sourceDataType == undefined
					// && e.isSourceLoaded
				) {
					// var source = this.map.getSource(e.sourceId);
					//var geojson = source._data;
					var geojson = e.source.data;
					if (
						geojson &&
						geojson.features &&
						geojson.features.length > 0 &&
						geojson.features[0].properties
					) {
						drawUpdateOverlayByFeature(geojson.features[0]);
					}
				}
			}
		};

		map.on('data', onData);

        return () => {
            map.removeControl(draw);
        };
    }, [map])
    
    return <BoundsDisplay bounds={siteBounds} />;
}