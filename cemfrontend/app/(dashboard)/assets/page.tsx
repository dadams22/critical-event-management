'use client';

import {
  Center,
  Loader,
  Button,
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem,
  Title,
  Group,
  Flex,
  SegmentedControl,
  SegmentedControlItem,
  Stack,
  Menu,
  Overlay,
  Text,
  createStyles,
} from '@mantine/core';
import useSWR, { mutate } from 'swr';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styled from '@emotion/styled';
import {
  IconBriefcase,
  IconBuilding,
  IconClick,
  IconMap,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconStack,
  IconTable,
} from '@tabler/icons-react';
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { produce } from 'immer';
import MapView from '../../../components/map/MapView';
import Api from '../../../api/Api';
import { Asset, Bounds, Location } from '../../../api/types';
import CreateAssetCard from './components/CreateAssetCard';
import AssetsTable from './AssetsTable';
import useAssetFilters from './components/filter/useAssetFilters';
import AssetFilterBar from './components/filter/AssetFilterBar';
import { useRouter, useSearchParams } from 'next/navigation';
import CreateSiteCard from './components/filter/createSite/CreateSiteCard';
import CreateBuildingCard from './components/filter/createBuilding/CreateBuildingCard';
import InspectAssetCard from './InspectAssetCard';
import useCreateSiteState from './components/filter/createSite/useCreateSiteState';
import { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import useCreateBuildingState from './components/filter/createBuilding/useCreateBuildingState';
import SiteBuildingFloorSelector from './components/SiteBuildingFloorSelector';

dayjs.extend(relativeTime);

function assetPageRoute(params: { site?: string; floor?: string; asset?: string }): string {
  if (!params) return '/assets';
  return `/assets?${Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;
}

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
  grid-template-areas: 'actions . sidebar' '. . sidebar';
  grid-template-columns: max-content 1fr minmax(300px, 480px);
  grid-template-rows: min-content 1fr;
  gap: 10px;

  pointer-events: none;
  z-index: 2;

  & > * > * {
    pointer-events: all;
  }
`;

const TableSection = styled.div`
  grid-row: 2;
  grid-column: 1/-1;
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

type DisplayType = 'map' | 'table';
const DISPLAY_OPTIONS: SegmentedControlItem[] = [
  {
    value: 'map',
    label: (
      <Center>
        <IconMap size={20} />
      </Center>
    ),
  },
  {
    value: 'table',
    label: (
      <Center>
        <IconTable size={20} />
      </Center>
    ),
  },
];

type CreateMode = 'site' | 'building' | 'asset';

export default function AssetsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const siteId = searchParams.get('site');
  const buildingId = searchParams.get('building');
  const floorId = searchParams.get('floor');
  const inspectedAssetId = searchParams.get('asset');

  const updateUrl = (params: {
    site?: string;
    building?: string;
    floor?: string;
    asset?: string;
  }) => {
    const updatedParams = {
      site: siteId || undefined,
      building: buildingId || undefined,
      floor: floorId || undefined,
      asset: inspectedAssetId || undefined,
      ...params,
    };
    router.push(assetPageRoute(_.omitBy(updatedParams, _.isUndefined)));
  };

  const [selectedDisplayType, setSelectedDisplayType] = useState<'map' | 'table'>('map');
  const [searchValue, setSearchValue] = useState('');
  const [createMode, setCreateMode] = useState<CreateMode | null>(null);

  const {
    data: sites,
    isLoading: sitesLoading,
    mutate: mutateSites,
  } = useSWR('sites/all', Api.getSites, {
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });
  const [location, setLocation] = useState<Location>();
  const createSiteState = useCreateSiteState();
  const handleSetCreateSiteAddress = (address: AddressAutofillRetrieveResponse) => {
    setLocation({
      longitude: address.features?.[0]?.geometry?.coordinates[0],
      latitude: address.features?.[0]?.geometry?.coordinates[1],
    });
    createSiteState.setAddress(address);
  };
  const selectedSite = sites?.find((site) => String(site.id) === siteId);
  useEffect(() => {
    if (!selectedSite) return;
    setLocation(_.pick(selectedSite, ['longitude', 'latitude']));
  }, [selectedSite]);
  const handleCreateSite = ({
    name,
    address,
    bounds,
  }: {
    name: string;
    address: AddressAutofillRetrieveResponse;
    bounds: Bounds;
  }): Promise<any> => {
    return Api.createSite({
      name,
      address: address.features[0].properties.full_address!,
      bounds,
      longitude: address.features[0].geometry.coordinates[0],
      latitude: address.features[0].geometry.coordinates[1],
    }).then((site) => {
      setCreateMode(null);
      mutateSites();
      createSiteState.reset();
      updateUrl({ site: site.id });
    });
  };
  const handleCancelCreateSite = () => {
    setCreateMode(null);
    createSiteState.reset();
  };

  const createBuildingState = useCreateBuildingState();
  const handleCreateBuilding = ({ name }: { name: string }): Promise<void> => {
    if (!siteId) return;
    return Api.createBuilding({
      siteId,
      name,
      floors: createBuildingState.floors,
    }).then(() => {
      setCreateMode(null);
      mutateSites();
      createBuildingState.reset();
    });
  };
  const handleCancelCreateBuilding = () => {
    setCreateMode(null);
    createBuildingState.reset();
  };

  const { data: assetTypes, isLoading: assetTypesLoading } = useSWR(
    'assetTypes/all',
    Api.getAssetTypes
  );

  const {
    data: allAssets,
    isLoading: assetsLoading,
    mutate: mutateAssets,
  } = useSWR('assets/all', Api.getAssets);
  const { data: users, loading: usersLoading } = useSWR('user/all', Api.getUsers);
  const { filterFn, ...filterBarProps } = useAssetFilters({});
  const assets = useMemo<Asset[]>(
    () =>
      allAssets?.filter(
        (asset: Asset) =>
          (floorId === 'all' || String(asset.floor.id) === floorId) &&
          filterFn(asset) &&
          (selectedDisplayType === 'map' ||
            searchValue.length < 3 ||
            asset.name.toLowerCase().includes(searchValue.toLowerCase()))
      ) || [],
    [allAssets, floorId, filterFn, searchValue, selectedDisplayType]
  );
  const inspectedAsset = useMemo(
    () => assets.find((asset) => String(asset.id) === inspectedAssetId),
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

  const [addAssetLocation, setAddAssetLocation] = useState<Location>();
  const handleSaveAsset = async ({
    name,
    assetType,
    photo,
    nextMaintenanceDate,
    managedBy,
  }: {
    name: string;
    assetType: string;
    photo?: File;
    nextMaintenanceDate: Date;
    managedBy?: string;
  }) => {
    if (!addAssetLocation || !floorId) return;

    await Api.createAsset({
      floor: floorId,
      name,
      assetType,
      longitude: addAssetLocation.longitude,
      latitude: addAssetLocation.latitude,
      photo,
      nextMaintenanceDate,
      managedBy,
    }).then((asset) => {
      mutateAssets(
        produce(assets, (draft) => {
          draft.push(asset);
        })
      );
      setCreateMode(null);
      setAddAssetLocation(undefined);
      updateUrl({ asset: asset.id });
    });
  };
  const handleCancelCreateAsset = () => {
    setCreateMode(null);
    setAddAssetLocation(undefined);
  };

  const createModeToComponent: Record<CreateMode, React.ReactNode> = {
    site: (
      <CreateSiteCard
        onSave={handleCreateSite}
        onCancel={handleCancelCreateSite}
        address={createSiteState.address}
        onSelectAddress={handleSetCreateSiteAddress}
        bounds={createSiteState.bounds}
      />
    ),
    building: (
      <CreateBuildingCard
        sites={sites}
        siteId={siteId!}
        onChangeSite={(selectedSiteId) => updateUrl({ site: selectedSiteId })}
        floors={createBuildingState.floors}
        setFloors={createBuildingState.setFloors}
        floorPlanPlacementIndex={createBuildingState.floorPlanPlacementIndex}
        setFloorPlanPlacementIndex={createBuildingState.setFloorPlanPlacementIndex}
        onSave={handleCreateBuilding}
        onCancel={handleCancelCreateBuilding}
      />
    ),
    asset: (
      <CreateAssetCard
        onSave={handleSaveAsset}
        onCancel={handleCancelCreateAsset}
        locationSelected={!!addAssetLocation}
        assetTypes={assetTypes || []}
        users={users || []}
        sites={sites || []}
        siteId={siteId || undefined}
        buildingId={buildingId || undefined}
        floorId={floorId || undefined}
        updateLocation={updateUrl}
      />
    ),
  };

  if (sitesLoading || assetTypesLoading || assetsLoading || usersLoading) {
    return (
      <Center h="100%">
        <Loader variant="bars" />
      </Center>
    );
  }

  if (!siteId && sites?.length)
    router.replace(
      assetPageRoute({ site: String(sites[0].id), building: String(sites[0]?.floors?.[0]?.id) })
    );

  return (
    <MapContainer id="mapcontainer">
      {selectedDisplayType === 'map' && !!location && (
        <MapView
          location={location}
          sites={sites}
          assets={assets}
          onClickAsset={(assetId) => updateUrl({ asset: assetId })}
          selectedAssetId={inspectedAssetId || undefined}
          addAsset={createMode === 'asset' ? { onAdd: setAddAssetLocation } : undefined}
          marker={addAssetLocation ? { location: addAssetLocation } : undefined}
          zoomToSite={siteId || undefined}
          selectedBuildingId={buildingId || undefined}
          selectedFloorId={floorId || undefined}
          drawBounds={
            createMode === 'site'
              ? { bounds: createSiteState.bounds, onUpdateBounds: createSiteState.setBounds }
              : undefined
          }
          floorPlan={createBuildingState.placeFloorPlanControls}
        />
      )}
      <OverlayGrid>
        <SideBar>
          {selectedDisplayType === 'map' &&
            (createMode ? (
              createModeToComponent[createMode]
            ) : inspectedAsset ? (
              <InspectAssetCard
                asset={inspectedAsset}
                onUpdateAsset={() => mutateAssets()}
                onClose={() => updateUrl({ asset: undefined })}
              />
            ) : (
              <Flex justify="flex-end">
                <Menu position="bottom-end">
                  <Menu.Target>
                    <Button leftIcon={<IconPlus size={20} />}>Add</Button>
                  </Menu.Target>
                  <Menu.Dropdown maw={240}>
                    <Menu.Label>Create a new</Menu.Label>
                    <Menu.Item
                      icon={<IconMapPin size={20} />}
                      onClick={() => setCreateMode('site')}
                    >
                      Site
                    </Menu.Item>
                    <Menu.Item
                      icon={<IconBuilding size={20} />}
                      onClick={() => setCreateMode('building')}
                      disabled={!siteId}
                    >
                      Building
                    </Menu.Item>
                    <Menu.Item
                      icon={<IconBriefcase size={20} />}
                      onClick={() => setCreateMode('asset')}
                      disabled={!assetTypes?.length}
                    >
                      Asset
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Flex>
            ))}
        </SideBar>
        <ActionBar>
          <Stack spacing="sm">
            <Group>
              <Title order={3}>Assets</Title>
              {sites && (
                <SiteBuildingFloorSelector
                  sites={sites}
                  siteId={siteId || undefined}
                  buildingId={buildingId || undefined}
                  floorId={floorId || undefined}
                  onChange={(selections) => updateUrl({ ...selections, asset: undefined })}
                />
              )}
              <Autocomplete
                w={280}
                data={assetAutocompleteItems}
                icon={<IconSearch size={20} />}
                placeholder="Search for assets..."
                onItemSubmit={(assetAutocompleteItem) =>
                  updateUrl({ asset: assetAutocompleteItem.asset.id })
                }
                value={searchValue}
                onChange={setSearchValue}
              />
            </Group>
            <Group>
              <SegmentedControl
                data={DISPLAY_OPTIONS}
                onChange={(value) => setSelectedDisplayType(value as DisplayType)}
              />
              <AssetFilterBar
                assetTypes={assetTypes || []}
                users={users || []}
                {...filterBarProps}
              />
            </Group>
          </Stack>
        </ActionBar>
        {selectedDisplayType === 'table' && (
          <TableSection>
            <AssetsTable
              assets={assets}
              onInspectAsset={(assetId) => updateUrl({ asset: assetId })}
              inspectedAssetId={inspectedAssetId || undefined}
            />
          </TableSection>
        )}
      </OverlayGrid>
    </MapContainer>
  );
}
