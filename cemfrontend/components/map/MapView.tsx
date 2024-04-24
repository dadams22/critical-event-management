'use client';

import styled from "@emotion/styled";
import mapboxgl from "mapbox-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Location } from "../../api/types";
import React from "react";
import { ColorScheme } from "@mantine/core";
import Marker from './components/Marker';

mapboxgl.accessToken =
	'pk.eyJ1IjoiZGFkYW1zMjIiLCJhIjoiY2xqd2llczgyMHd4azNkbWhwb2Z6ZTB3YyJ9.VYzIdS2JPHTEW2aHYPONqg';

export const MapContext = React.createContext<mapboxgl.Map | null>(null);

const MapContainer = styled.div`
	width: 100%;
	height: 100%;
`;

interface ComponentProps {
    location: Location;
}

export default function MapView({ location }: ComponentProps) {
    const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>();
	const colorScheme: ColorScheme = 'dark';

	const map = useMemo<mapboxgl.Map | null>(() => {
		if (!mapContainer) return null;

		return new mapboxgl.Map({
			container: mapContainer,
			style:
				colorScheme === 'dark'
					? 'mapbox://styles/mapbox/dark-v11'
					: 'mapbox://styles/mapbox/light-v11',
			center: [location.longitude, location.latitude],
			zoom: 18,
		})
	}, [mapContainer]);

    return (
        <MapContainer ref={(elem) => setMapContainer(elem)}>
			<MapContext.Provider value={map}>
				<Marker location={location} />
			</MapContext.Provider>
		</MapContainer>
    )
}