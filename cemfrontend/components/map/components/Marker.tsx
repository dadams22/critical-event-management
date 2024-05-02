'use client';

import { useContext, useEffect } from 'react';
import { Location } from '../../../api/types';
import { MapContext } from '../MapView';
import mapboxgl from 'mapbox-gl';
import { useMantineTheme } from '@mantine/core';
import { getAssetIcon, AssetIconIdentifier } from '../../../app/(icons)/assetTypes';
import ReactDOM from 'react-dom';

export interface MarkerProps {
	location: Location;
	iconIdentifier?: AssetIconIdentifier;
	onClick?: () => void;
}

export default function Marker({ location, iconIdentifier, onClick }: MarkerProps) {
	const theme = useMantineTheme();

	const map = useContext(MapContext);

	useEffect(() => {
		if (!map) return;

		let iconElement;
		if (iconIdentifier) {
			iconElement = document.createElement('div');
			const icon = getAssetIcon(iconIdentifier);
			ReactDOM.render(icon, iconElement);
		}

		const marker = new mapboxgl.Marker({
			color: theme.colors.red[8],
			element: iconElement || undefined,
		})
			.setLngLat([location.longitude, location.latitude])
			.addTo(map);

		if (onClick) {
			marker.getElement().addEventListener('click', onClick);
		}

		return () => {
			if (!map) return;
			marker.remove();
		};
	}, [map]);

	return null;
}
