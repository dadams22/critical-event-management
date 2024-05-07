'use client';

import { useContext, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMantineTheme } from '@mantine/core';
import ReactDOM from 'react-dom';
import { Location } from '../../../api/types';
import { MapContext } from '../MapView';
import { getAssetIcon, AssetIconIdentifier } from '../../../app/(icons)/assetTypes';

export interface MarkerProps {
	location: Location;
	color?: string;
	iconIdentifier?: AssetIconIdentifier;
	onClick?: () => void;
}

export default function Marker({ location, iconIdentifier, color, onClick }: MarkerProps) {
	const theme = useMantineTheme();

	const map = useContext(MapContext);

	useEffect(() => {
		if (!map) return;

		let iconElement;
		if (iconIdentifier) {
			iconElement = document.createElement('div');
			const icon = getAssetIcon(iconIdentifier, { size: 30, color });
			ReactDOM.render(icon, iconElement);
		}

		const marker = new mapboxgl.Marker({
			color: color || theme.colors.red[8],
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
	}, [map, color]);

	return null;
}
