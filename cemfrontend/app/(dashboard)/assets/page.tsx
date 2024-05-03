'use client';
import {
	Center,
	Loader,
	Button,
	useMantineTheme,
	Autocomplete,
	AutocompleteItem,
	Stack,
	Select,
	SelectItem,
	Card,
	Title,
	Radio,
} from '@mantine/core';
import useSWR from 'swr';
import Api from '../../../api/Api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styled from '@emotion/styled';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import _ from 'lodash';
import MapView from '../../../components/map/MapView';
import { AssetSummary } from './AssetSummary';
import { useEffect, useMemo, useState } from 'react';
import { Asset, Location } from '../../../api/types';
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
	grid-template-areas: 'sidebar actions actions' 'sidebar . controls' 'sidebar footer footer';
	grid-template-columns: 300px 1fr min-content;
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

const Controls = styled.div`
	grid-area: controls;
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
		data: allAssets,
		isLoading: assetsLoading,
		mutate: mutateAssets,
	} = useSWR('assets/all', Api.getAssets);

	console.log(allAssets);

	const siteOptions = useMemo<SelectItem[]>(
		() =>
			sites?.map((site) => ({
				label: site.name,
				value: site.id,
			})) || [],
		[sites]
	);
	const [selectedSiteId, setSelectedSiteId] = useState<string | null>();
	const [selectedFloorId, setSelectedFloorId] = useState<string>();
	const selectedSite = sites?.find((site) => site.id === selectedSiteId);

	const assets = useMemo<Asset[]>(
		() => allAssets?.filter((asset: Asset) => String(asset.floor.id) === selectedFloorId) || [],
		[allAssets, selectedFloorId]
	);
	const [inspectedAssetId, setInspectedAssetId] = useState<string>();
	const [addingAsset, setAddingAsset] = useState<boolean>(false);
	const [addAssetLocation, setAddAssetLocation] = useState<Location>();

	console.log(selectedFloorId);

	useEffect(() => {
		if (!!sites?.length && !selectedSiteId) {
			const defaultSite = sites[0];
			setSelectedSiteId(defaultSite.id);
			setSelectedFloorId(String(defaultSite.floors[0].id));
		}
	}, [sites, selectedSiteId]);

	useEffect(() => {
		setSelectedFloorId(String(selectedSite?.floors?.[0]?.id) || undefined);
		setInspectedAssetId(undefined);
		setAddingAsset(false);
		setAddAssetLocation(undefined);
	}, [selectedSiteId]);

	const inspectedAsset = useMemo<Asset | undefined>(
		() => _.find(assets, { id: inspectedAssetId }),
		[assets, inspectedAssetId]
	);

	const assetAutocompleteItems = useMemo<AutocompleteItem[]>(
		() =>
			assets?.map((asset) => ({
				value: asset.name,
				asset,
			})) || [],
		[assets]
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
		nextMaintenanceDate,
	}: {
		name: string;
		assetType: string;
		photo?: File;
		nextMaintenanceDate: Date;
	}) => {
		if (!addAssetLocation || !selectedFloorId) return;

		await Api.createAsset({
			floor: selectedFloorId,
			name,
			assetType,
			longitude: addAssetLocation.longitude,
			latitude: addAssetLocation.latitude,
			photo,
			nextMaintenanceDate,
		}).then((asset) => {
			mutateAssets();
			setAddingAsset(false);
			setAddAssetLocation(undefined);
		});
	};

	return (
		<MapContainer>
			{selectedSite && (
				<MapView
					location={_.pick(selectedSite, ['longitude', 'latitude'])}
					sites={sites}
					assets={assets}
					onClickAsset={setInspectedAssetId}
					addAsset={addingAsset ? { onAdd: handleAddAsset } : undefined}
					marker={addAssetLocation ? { location: addAssetLocation } : undefined}
					zoomToSite={selectedSiteId}
					selectedFloorId={selectedFloorId}
				/>
			)}
			<OverlayGrid>
				<SideBar>
					<Stack>
						<Select data={siteOptions} value={selectedSiteId} onChange={setSelectedSiteId} />
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
								onUpdateAsset={() => mutateAssets()}
								onClose={() => setInspectedAssetId(undefined)}
							/>
						) : null}
					</Stack>
				</SideBar>
				<ActionBar>
					<div />
					<Autocomplete
						w={400}
						data={assetAutocompleteItems}
						icon={<IconSearch size={20} />}
						placeholder="Search for assets..."
						onItemSubmit={(assetAutocompleteItem) =>
							setInspectedAssetId(assetAutocompleteItem.asset.id)
						}
					/>
					<Button leftIcon={<IconPlus size={20} />} onClick={handleClickAddAsset}>
						Add Asset
					</Button>
				</ActionBar>
				<Controls>
					{selectedSite && (
						<Card miw={120} w="max-content">
							<Stack>
								<Title order={5}>Select Floor</Title>
								<Radio.Group value={selectedFloorId} onChange={setSelectedFloorId} pl="sm">
									<Stack>
										{selectedSite.floors.map((floor) => (
											<Radio value={String(floor.id)} label={floor.name} />
										))}
									</Stack>
								</Radio.Group>
							</Stack>
						</Card>
					)}
				</Controls>
				<Footer>{assets && <AssetSummary assets={assets} />}</Footer>
			</OverlayGrid>
		</MapContainer>
	);
}
