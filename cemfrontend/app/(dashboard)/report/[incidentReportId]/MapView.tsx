import React, { useEffect, useRef } from 'react';
import { Location } from '../../../../api/types';
import mapboxgl from 'mapbox-gl';
import styled from '@emotion/styled';
import { useMantineTheme, Text } from '@mantine/core';

mapboxgl.accessToken = 'pk.eyJ1IjoiZGFkYW1zMjIiLCJhIjoiY2xqd2llczgyMHd4azNkbWhwb2Z6ZTB3YyJ9.VYzIdS2JPHTEW2aHYPONqg';

const MapContainer = styled.div`
    width: 100%;
    height: 100%;
`;

interface ComponentProps{
    location: Location;
}

export default function MapView({ location }: ComponentProps) {
    const theme = useMantineTheme();

    const map = useRef(null);
    const mapContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [location.longitude, location.latitude],
            zoom: 18,
        });

        const marker = new mapboxgl.Marker({
            color: theme.colors.red[8],
        })
            .setLngLat([location.longitude, location.latitude])
            .addTo(map.current);
    });

    return (
        <MapContainer ref={mapContainer} />
    )
}