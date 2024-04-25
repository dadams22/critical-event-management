'use client';

import styled from '@emotion/styled';
import mapboxgl from 'mapbox-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bounds, Location, Site } from '../../api/types';
import React from 'react';
import { ColorScheme } from '@mantine/core';
import Marker from './components/Marker';
import SiteDisplay from './components/SiteDisplay';
import DrawBoundsControls, { DrawBoundsControlsProps } from './components/DrawBoundsControls';
import PlaceFloorPlanControls, {
	PlaceFloorPlanControlsProps,
} from './components/PlaceFloorPlanControls';

mapboxgl.accessToken =
	'pk.eyJ1IjoiZGFkYW1zMjIiLCJhIjoiY2xqd2llczgyMHd4azNkbWhwb2Z6ZTB3YyJ9.VYzIdS2JPHTEW2aHYPONqg';

export const MapContext = React.createContext<mapboxgl.Map | null>(null);

const MapContainer = styled.div`
	width: 100%;
	height: 100%;
`;

interface ComponentProps {
	location: Location;
	sites?: Site[];
	drawBounds?: DrawBoundsControlsProps;
	floorPlan?: PlaceFloorPlanControlsProps;
}

export default function MapView({ location, sites, drawBounds, floorPlan }: ComponentProps) {
	const colorScheme: ColorScheme = 'dark';
	const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>();
	const [loaded, setLoaded] = useState<boolean>(false);

	const map = useMemo<mapboxgl.Map | null>(() => {
		if (!mapContainer) return null;
		map.current = new mapboxgl.Map({
			container: mapContainer,
			style:
				colorScheme === 'dark'
					? 'mapbox://styles/mapbox/dark-v11'
					: 'mapbox://styles/mapbox/light-v11',
			center: [location.longitude, location.latitude],
			zoom: 18,
		});

		map.on('load', () => setLoaded(true));

		return map;
	}, [mapContainer]);

	return (
		<MapContainer ref={(elem) => setMapContainer(elem)}>
			<MapContext.Provider value={map}>
				{loaded && (
					<>
						<Marker location={location} />
						{sites && sites.map((site) => <SiteDisplay site={site} />)}
						{drawBounds && <DrawBoundsControls {...drawBounds} />}
						{floorPlan && <PlaceFloorPlanControls {...floorPlan} />}
					</>
				)}
			</MapContext.Provider>
		</MapContainer>
	);
}
