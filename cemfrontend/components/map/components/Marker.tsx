'use client';

import { useContext, useEffect } from 'react';
import { Location } from '../../../api/types';
import { MapContext } from '../MapView';
import mapboxgl from 'mapbox-gl';
import { useMantineTheme } from '@mantine/core';

export interface MarkerProps {
	location: Location;
}

export default function Marker({ location }: MarkerProps) {
	const theme = useMantineTheme();

	const map = useContext(MapContext);

	useEffect(() => {
		if (!map) return;

		const marker = new mapboxgl.Marker({
			color: theme.colors.red[8],
		})
			.setLngLat([location.longitude, location.latitude])
			.addTo(map);

		return () => {
			if (!map) return;
			marker.remove();
		};
	}, [map]);

	return null;
}
