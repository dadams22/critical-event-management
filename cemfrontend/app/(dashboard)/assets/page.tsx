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
} from '@mantine/core';
import useSWR from 'swr';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styled from '@emotion/styled';
import {
  IconMap,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconStack,
  IconTable,
} from '@tabler/icons-react';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import { modals } from '@mantine/modals';
import { produce } from 'immer';
import MapView from '../../../components/map/MapView';
import Api from '../../../api/Api';
import { Asset, Location, Site } from '../../../api/types';
import AddAssetForm from './AddAssetForm';
import InspectAssetCard from './InspectAssetCard';
import { ModalNames } from '../../(modals)';
import AssetsTable from './AssetsTable';
import useAssetFilters from './useAssetFilters';
import AssetFilterBar from './AssetFilterBar';
import { useRouter, useSearchParams } from 'next/navigation';

dayjs.extend(relativeTime);

function assetPageRoute(params: { site?: string; floor?: string; asset?: string }): string {
  if (!params) return '/assets';
  return (
    '/assets?' +
    Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
  );
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

export default function AssetsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const siteId = searchParams.get('site');
  const floorId = searchParams.get('floor');
  const inspectedAssetId = searchParams.get('asset');

  const updateUrl = (params: { site?: string; floor?: string; asset?: string }) => {
    const updatedParams = {
      site: siteId || undefined,
      floor: floorId || undefined,
      asset: inspectedAssetId,
      ...params,
    };
    router.push(assetPageRoute(_.omitBy(updatedParams, _.isUndefined)));
  };

  const { data: sites, isLoading: sitesLoading } = useSWR('sites/all', Api.getSites, {
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });
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

  const [selectedDisplayType, setSelectedDisplayType] = useState<'map' | 'table'>('map');
  const [searchValue, setSearchValue] = useState('');

  const { filterFn, ...filterBarProps } = useAssetFilters({});

  const selectedSite = sites?.find((site) => String(site.id) === siteId);
  const siteOptions = useMemo<SelectItem[]>(
    () => [
      ...(sites?.map((site) => ({
        label: site.name,
        value: String(site.id),
      })) || []),
      // { label: 'New site', value: 'new' },
    ],
    [sites]
  );
  const floorOptions: SelectItem[] = selectedSite
    ? [
        { value: 'all', label: 'All Floors' },
        ...selectedSite.floors.map((floor) => ({ value: String(floor.id), label: floor.name })),
      ]
    : [];

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
  const [addingAsset, setAddingAsset] = useState<boolean>(false);
  const [addAssetLocation, setAddAssetLocation] = useState<Location>();
  const inspectedAsset = useMemo<Asset | undefined>(
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

  const [siteInfo, setSiteInfo] = useState<{
    name: string;
    address: AddressAutofillRetrieveResponse;
  }>();

  // useEffect(() => {
  //   if (selectedSiteId === 'new') {
  //     modals.openContextModal({
  //       modal: ModalNames.SiteInfo,
  //       title: 'Enter Site Info',
  //       innerProps: {
  //         doneCallback: setSiteInfo,
  //       },
  //     });
  //   }
  // }, [selectedSiteId]);

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
      setAddingAsset(false);
      setAddAssetLocation(undefined);
      updateUrl({ asset: asset.id });
    });
  };

  if (sitesLoading || assetTypesLoading || assetsLoading || usersLoading) {
    return (
      <Center h="100%">
        <Loader variant="bars" />
      </Center>
    );
  }

  if (!siteId)
    router.replace(
      assetPageRoute({ site: String(sites?.[0].id), floor: String(sites?.[0]?.floors?.[0]?.id) })
    );

  return (
    <MapContainer id="mapcontainer">
      {((selectedSite && selectedDisplayType === 'map') || !!siteInfo?.address) && (
        <MapView
          location={
            siteId === 'new' && !!siteInfo?.address
              ? {
                  longitude: siteInfo?.address?.features?.[0]?.geometry?.coordinates?.[0],
                  latitude: siteInfo?.address?.features?.[0]?.geometry?.coordinates?.[1],
                }
              : _.pick(selectedSite, ['longitude', 'latitude'])
          }
          sites={sites}
          assets={assets}
          onClickAsset={(assetId) => updateUrl({ asset: assetId })}
          selectedAssetId={inspectedAssetId}
          addAsset={addingAsset ? { onAdd: handleAddAsset } : undefined}
          marker={addAssetLocation ? { location: addAssetLocation } : undefined}
          zoomToSite={siteId || undefined}
          selectedFloorId={floorId || undefined}
        />
      )}
      <OverlayGrid>
        <SideBar>
          {addingAsset ? (
            <AddAssetForm
              onSave={handleSaveAsset}
              onCancel={handleCancelAddAsset}
              locationSelected={!!addAssetLocation}
              assetTypes={assetTypes || []}
              users={users || []}
            />
          ) : inspectedAsset ? (
            <InspectAssetCard
              asset={inspectedAsset}
              onUpdateAsset={() => mutateAssets()}
              onClose={() => updateUrl({ asset: undefined })}
            />
          ) : selectedDisplayType === 'map' ? (
            <Flex justify="flex-end">
              <Button leftIcon={<IconPlus size={20} />} onClick={handleClickAddAsset}>
                Add Asset
              </Button>
            </Flex>
          ) : null}
        </SideBar>
        <ActionBar>
          <Stack spacing="sm">
            <Group>
              <Title order={3}>Assets</Title>
              <Select
                icon={<IconMapPin size={20} />}
                data={siteOptions}
                value={siteId}
                onChange={(siteId) => {
                  const newSite = sites?.find((site) => String(site.id) === siteId);
                  updateUrl({
                    site: siteId || undefined,
                    floor: (newSite?.floors?.length || 0) > 1 ? 'all' : newSite?.floors?.[0]?.id,
                    asset: undefined,
                  });
                }}
                w={160}
              />
              {(selectedSite?.floors.length || 0) > 1 && (
                <Select
                  w={160}
                  icon={<IconStack size={20} />}
                  data={floorOptions}
                  value={floorId}
                  onChange={(floorId) =>
                    updateUrl({ floor: floorId || undefined, asset: undefined })
                  }
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
