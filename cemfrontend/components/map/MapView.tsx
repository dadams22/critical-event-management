'use client';

import styled from "@emotion/styled";
import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import { Location } from "../../api/types";
import React from "react";
import { ColorScheme } from "@mantine/core";

mapboxgl.accessToken =
	'pk.eyJ1IjoiZGFkYW1zMjIiLCJhIjoiY2xqd2llczgyMHd4azNkbWhwb2Z6ZTB3YyJ9.VYzIdS2JPHTEW2aHYPONqg';

const MapContext = React.createContext<mapboxgl.Map | null>(null);

const MapContainer = styled.div`
	width: 100%;
	height: 100%;
`;

interface ComponentProps {
    location: Location;
}

export default function MapView({ location }: ComponentProps) {
    const map = useRef<mapboxgl.Map>(null);
    const mapContainer = useRef(null);

	const colorScheme: ColorScheme = 'dark';

    useEffect(() => {
		if (map.current || !location || !mapContainer.current) return; // initialize map only once
		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style:
				colorScheme === 'dark'
					? 'mapbox://styles/mapbox/dark-v11'
					: 'mapbox://styles/mapbox/light-v11',
			center: [location.longitude, location.latitude],
			zoom: 18,
		});
    }, [location, mapContainer.current]);

    return (
        <MapContainer ref={mapContainer}>
			<MapContext.Provider value={map.current}>

			</MapContext.Provider>
		</MapContainer>
    )
}