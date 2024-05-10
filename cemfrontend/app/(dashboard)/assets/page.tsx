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
  Flex, SegmentedControl, SegmentedControlItem,
} from '@mantine/core';
import useSWR from 'swr';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styled from '@emotion/styled';
import { IconMap, IconMapPin, IconPlus, IconSearch, IconStack, IconTable } from '@tabler/icons-react';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import MapView from '../../../components/map/MapView';
import Api from '../../../api/Api';
import {Asset, Bounds, Location, Site} from '../../../api/types';
import AddAssetForm from './AddAssetForm';
import InspectAssetCard from './InspectAssetCard';
import { getAssetIcon } from '../../(icons)/assetTypes';
import {AddressAutofillRetrieveResponse} from "@mapbox/search-js-core";
import {modals} from "@mantine/modals";
import {ModalNames} from "../../(modals)";
import AssetsTable from "./AssetsTable";

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
  { value: 'map', label: <Center><IconMap size={20} /></Center> },
  { value: 'table', label: <Center><IconTable size={20} /></Center> },
];

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

  const [selectedDisplayType, setSelectedDisplayType] = useState<'map' | 'table'>('map');

  const siteOptions = useMemo<SelectItem[]>(
    () =>
      [
          ...(sites?.map((site) => ({
            label: site.name,
            value: site.id,
          })) || []),
        // { label: 'New site', value: 'new' },
      ],
    [sites]
  );
  const [selectedSiteId, setSelectedSiteId] = useState<string | null | 'new'>();
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>();
  const [lastSelectedSite, setLastSelectedSite] = useState<Site>();
  useEffect(() => {
    if (selectedSiteId !== 'new') setLastSelectedSite(sites?.find((site) => site.id === selectedSiteId));
  }, [selectedSiteId, sites]);
  const floorOptions: SelectItem[] =
    lastSelectedSite?.floors?.map((floor) => ({ value: String(floor.id), label: floor.name })) || [];

  const assets = useMemo<Asset[]>(
    () => allAssets?.filter((asset: Asset) => String(asset.floor.id) === selectedFloorId) || [],
    [allAssets, selectedFloorId]
  );
  const [inspectedAssetId, setInspectedAssetId] = useState<string>();
  const [addingAsset, setAddingAsset] = useState<boolean>(false);
  const [addAssetLocation, setAddAssetLocation] = useState<Location>();
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

  const [siteInfo, setSiteInfo] = useState<{ name: string; address: AddressAutofillRetrieveResponse}>();

  useEffect(() => {
    if (selectedSiteId === 'new') modals.openContextModal({
      modal: ModalNames.SiteInfo,
      title: 'Enter Site Info',
      innerProps: {
        doneCallback: setSiteInfo,
      },
    });
  }, [selectedSiteId]);

  useEffect(() => {
    if (!!sites?.length && !selectedSiteId) {
      const defaultSite = sites[0];
      setSelectedSiteId(defaultSite.id);
      setSelectedFloorId(String(defaultSite.floors[0].id));
    }
  }, [sites, selectedSiteId]);

  useEffect(() => {
    setSelectedFloorId(String(lastSelectedSite?.floors?.[0]?.id) || undefined);
    setInspectedAssetId(undefined);
    setAddingAsset(false);
    setAddAssetLocation(undefined);
  }, [lastSelectedSite]);

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

  if (sitesLoading || assetTypesLoading || assetsLoading) {
    return (
        <Center h="100%">
          <Loader variant="bars" />
        </Center>
    );
  }

  return (
    <MapContainer id="mapcontainer">
      {(lastSelectedSite && selectedDisplayType === 'map' || !!siteInfo?.address) && (
        <MapView
          location={selectedSiteId === 'new' && !!siteInfo?.address ? {
                longitude: siteInfo?.address?.features?.[0]?.geometry?.coordinates?.[0],
                latitude: siteInfo?.address?.features?.[0]?.geometry?.coordinates?.[1],
              } : _.pick(lastSelectedSite, ['longitude', 'latitude'])
          }
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
          ) : selectedDisplayType === 'map' ? (
              <Flex justify="flex-end">
                <Button leftIcon={<IconPlus size={20} />} onClick={handleClickAddAsset}>
                  Add Asset
                </Button>
              </Flex>
          ) : null}
        </SideBar>
        <ActionBar>
          <Group>
            <Title order={3}>Assets</Title>
            <Select
              icon={<IconMapPin size={20} />}
              data={siteOptions}
              value={selectedSiteId}
              onChange={setSelectedSiteId}
              w={160}
            />
            {(lastSelectedSite?.floors.length || 0) > 1 && (
              <Select
                w={100}
                icon={<IconStack size={20} />}
                data={floorOptions}
                value={selectedFloorId}
                onChange={setSelectedFloorId}
              />
            )}
            <Autocomplete
              w={280}
              data={assetAutocompleteItems}
              icon={<IconSearch size={20} />}
              placeholder="Search for assets..."
              onItemSubmit={(assetAutocompleteItem) =>
                setInspectedAssetId(assetAutocompleteItem.asset.id)
              }
            />
            <SegmentedControl
              data={DISPLAY_OPTIONS}
              onChange={(value) => setSelectedDisplayType(value as DisplayType)}
            />
          </Group>
        </ActionBar>
        {selectedDisplayType === 'table' && (
            <TableSection>
              <AssetsTable assets={assets} />
            </TableSection>
        )}
      </OverlayGrid>
    </MapContainer>
  );
}
