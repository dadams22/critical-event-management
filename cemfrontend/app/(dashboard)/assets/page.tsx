'use client';
import { Center, Loader, Button, useMantineTheme, Autocomplete } from '@mantine/core';
import useSWR from 'swr';
import Api from '../../../api/Api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styled from '@emotion/styled';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import _ from 'lodash';
import MapView from '../../../components/map/MapView';
import { AssetSummary } from './AssetSummary';
import { useMemo, useState } from 'react';
import { Location } from '../../../api/types';
import AddAssetForm from './AddAssetForm';
import InspectAssetCard from './InspectAssetCard';

dayjs.extend(relativeTime);

const MapContainer = styled.div`
	position: relative;
	height: 0;
	min-height: 100%;
	width: 100%;
`;

const OverlayGrid = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	padding: 16px;

	display: grid;
	grid-template-areas: 'sidebar actions' 'sidebar .' 'sidebar footer';
	grid-template-columns: 300px 1fr;
	grid-template-rows: min-content 1fr min-content;
	gap: 10px;

	pointer-events: none;

	& > * {
		pointer-events: all;
	}
`;

const ActionBar = styled.div`
	grid-area: actions;
	width: 100%;

	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const SideBar = styled.div`
	grid-area: sidebar;
	overflow-y: auto;
	margin: -16px -10px;
	padding: 16px 10px;
`;

const Footer = styled.div`
	grid-area: footer;
`;

export default function AssetsPage() {
	const { data: sites, isLoading: sitesLoading } = useSWR('sites/all', Api.getSites);
	const { data: assetTypes, isLoading: assetTypesLoading } = useSWR(
		'assetTypes/all',
		Api.getAssetTypes
	);
	const {
		data: assets,
		isLoading: assetsLoading,
		mutate: mutateAssets,
	} = useSWR('assets/all', Api.getAssets);

	const [addingAsset, setAddingAsset] = useState<boolean>(false);
	const [addAssetLocation, setAddAssetLocation] = useState<Location>();
	const [inspectedAssetId, setInspectedAssetId] = useState<string>();
	const inspectedAsset = useMemo<Asset | undefined>(
		() => _.find(assets, { id: inspectedAssetId }),
		[assets, inspectedAssetId]
	);

	if (sitesLoading || assetTypesLoading || assetsLoading)
		return (
			<Center h="100%">
				<Loader variant="bars" />
			</Center>
		);

	const handleClickAddAsset = () => {
		setAddingAsset(true);
	};

	const handleAddAsset = (location: Location) => {
		setAddAssetLocation(location);
	};

	const handleCancelAddAsset = () => {
		setAddingAsset(false);
		setAddAssetLocation(undefined);
	};

	const handleSaveAsset = async ({
		name,
		assetType,
		photo,
	}: {
		name: string;
		assetType: string;
		photo?: File;
	}) => {
		if (!addAssetLocation || !sites) return;

		const floorId = sites[0].floors[0].id;

		await Api.createAsset({
			floor: floorId,
			name,
			assetType,
			longitude: addAssetLocation.longitude,
			latitude: addAssetLocation.latitude,
			photo,
		}).then((asset) => {
			mutateAssets();
			setAddingAsset(false);
			setAddAssetLocation(undefined);
		});
	};

	return (
		<MapContainer>
			{!!sites?.[0] && (
				<MapView
					location={_.pick(sites[0], ['longitude', 'latitude'])}
					sites={sites}
					assets={assets}
					onClickAsset={setInspectedAssetId}
					addAsset={addingAsset ? { onAdd: handleAddAsset } : undefined}
					marker={addAssetLocation ? { location: addAssetLocation } : undefined}
				/>
			)}
			<OverlayGrid>
				<SideBar>
					{addingAsset ? (
						<AddAssetForm
							onSave={handleSaveAsset}
							onCancel={handleCancelAddAsset}
							locationSelected={!!addAssetLocation}
							assetTypes={assetTypes!}
						/>
					) : inspectedAsset ? (
						<InspectAssetCard
							asset={inspectedAsset}
							onClose={() => setInspectedAssetId(undefined)}
						/>
					) : null}
				</SideBar>
				<ActionBar>
					<div />
					<Autocomplete
						w={400}
						data={[]}
						icon={<IconSearch size={20} />}
						placeholder="Search for assets..."
					/>
					<Button leftIcon={<IconPlus size={20} />} onClick={handleClickAddAsset}>
						Add Asset
					</Button>
				</ActionBar>
				<Footer>
					<AssetSummary />
				</Footer>
			</OverlayGrid>
		</MapContainer>
	);
}
