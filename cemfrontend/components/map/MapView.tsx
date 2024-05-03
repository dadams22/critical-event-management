'use client';

import styled from '@emotion/styled';
import mapboxgl from 'mapbox-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Asset, Bounds, Location, MaintenanceStatus, Site } from '../../api/types';
import React from 'react';
import { ColorScheme, MantineColor, useMantineTheme } from '@mantine/core';
import Marker, { MarkerProps } from './components/Marker';
import SiteDisplay from './components/SiteDisplay';
import DrawBoundsControls, { DrawBoundsControlsProps } from './components/DrawBoundsControls';
import PlaceFloorPlanControls, {
	PlaceFloorPlanControlsProps,
} from './components/PlaceFloorPlanControls';
import AddAssetControls, { AddAssetControlsProps } from './components/AddAssetControls';
import _ from 'lodash';

mapboxgl.accessToken =
	'pk.eyJ1IjoiZGFkYW1zMjIiLCJhIjoiY2xqd2llczgyMHd4azNkbWhwb2Z6ZTB3YyJ9.VYzIdS2JPHTEW2aHYPONqg';

export const MapContext = React.createContext<mapboxgl.Map | null>(null);

const MapContainer = styled.div`
	width: 100%;
	height: 100%;
`;

interface ComponentProps {
	location: Location;
	showLocationMarker?: boolean;
	sites?: Site[];
	assets?: Asset[];
	onClickAsset?: (assetId: string) => void;
	drawBounds?: DrawBoundsControlsProps;
	floorPlan?: PlaceFloorPlanControlsProps;
	addAsset?: AddAssetControlsProps;
	marker?: MarkerProps;
	zoomToSite?: string;
	selectedFloorId?: string;
}

export default function MapView({
	location,
	showLocationMarker,
	sites,
	assets,
	onClickAsset,
	drawBounds,
	floorPlan,
	addAsset,
	marker,
	zoomToSite,
	selectedFloorId,
}: ComponentProps) {
	const theme = useMantineTheme();
	const colorScheme: ColorScheme = 'dark';
	const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>();
	const [loaded, setLoaded] = useState<boolean>(false);

	const map = useMemo<mapboxgl.Map | null>(() => {
		if (!mapContainer) return null;

		const map = new mapboxgl.Map({
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

	const MAINTENANCE_STATUS_TO_COLOR: Record<MaintenanceStatus, MantineColor> = {
		[MaintenanceStatus.COMPLIANT]: theme.colors.green[8],
		[MaintenanceStatus.NEEDS_MAINTENANCE]: theme.colors.yellow[8],
		[MaintenanceStatus.OUT_OF_COMPLIANCE]: theme.colors.red[8],
	};

	return (
		<MapContainer ref={(elem) => setMapContainer(elem)}>
			<MapContext.Provider value={map}>
				{loaded && (
					<>
						{showLocationMarker && <Marker location={location} />}
						{sites &&
							sites.map((site) => (
								<SiteDisplay
									key={site.id}
									site={site}
									zoomToBounds={sites.length === 1 || zoomToSite === site.id}
									selectedFloorId={selectedFloorId}
								/>
							))}
						{assets &&
							assets.map((asset) => (
								<Marker
									key={asset.id}
									location={_.pick(asset, ['latitude', 'longitude'])}
									iconIdentifier={asset.asset_type.icon_identifier}
									color={MAINTENANCE_STATUS_TO_COLOR[asset.maintenance_status]}
									onClick={() => onClickAsset(asset.id)}
								/>
							))}
						{drawBounds && <DrawBoundsControls {...drawBounds} />}
						{floorPlan && (
							<PlaceFloorPlanControls key={floorPlan.floorPlanImageUrl} {...floorPlan} />
						)}
						{addAsset && <AddAssetControls {...addAsset} />}
						{marker && <Marker {...marker} />}
					</>
				)}
			</MapContext.Provider>
		</MapContainer>
	);
}
