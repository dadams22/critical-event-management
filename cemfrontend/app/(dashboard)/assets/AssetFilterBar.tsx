'use client';

import { ActionIcon, Anchor, Group, Menu } from '@mantine/core';
import {IconAsset, IconCalendar, IconFilterPlus, IconUser} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import AssetTypeFilter from './AssetTypeFilter';
import NextMaintenanceDateFilter, { SelectionMode } from './NextMaintenanceDateFilter';
import {AssetType, MinimalUser} from '../../../api/types';
import AssetManagerFilter from "./AssetManagerFilter";

interface ComponentProps {
  assetTypes: AssetType[];
  selectedAssetTypes: string[];
  setSelectedAssetTypes: (selected: string[]) => void;
  selectionMode: SelectionMode;
  setSelectionMode: (mode: SelectionMode) => void;
  selectedDate: Date | null | [Date | null, Date | null];
  setSelectedDate: (selectedDate: Date | null | [Date | null, Date | null]) => void;
  users: MinimalUser[];
  selectedManagers: string[];
  setSelectedManagers: (selected: string[]) => void;
}

export default function AssetFilterBar({
  assetTypes,
  selectedAssetTypes,
  setSelectedAssetTypes,
  selectionMode,
  setSelectionMode,
  selectedDate,
  setSelectedDate,
    users,
    selectedManagers,
    setSelectedManagers,
}: ComponentProps) {
  const [showAssetTypesFilter, assetTypesFilterHandlers] = useDisclosure();
  const [showNextMaintenanceDateFilter, nextMaintenanceDateFilterHandlers] = useDisclosure();
  const [showManagerFilter, managerFilterHandlers] = useDisclosure();

  const handleClearAssetTypes = () => {
    setSelectedAssetTypes([]);
    assetTypesFilterHandlers.close();
  };

  const handleClearNextMaintenanceDate = () => {
    setSelectionMode('before');
    setSelectedDate(null);
    nextMaintenanceDateFilterHandlers.close();
  };

  const handleClearManagers = () => {
    setSelectedManagers([]);
    managerFilterHandlers.close();
  };

  const handleClearAll = () => {
    handleClearAssetTypes();
    handleClearNextMaintenanceDate();
    assetTypesFilterHandlers.close();
    nextMaintenanceDateFilterHandlers.close();
  };

  return (
    <Group>
      <Menu position="bottom-start">
        <Menu.Target>
          <ActionIcon variant="light" color="blue">
            <IconFilterPlus size={20} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Filter by</Menu.Label>
          <Menu.Item icon={<IconAsset size={16} />} onClick={assetTypesFilterHandlers.open}>
            Asset Type
          </Menu.Item>
          <Menu.Item
            icon={<IconCalendar size={16} />}
            onClick={nextMaintenanceDateFilterHandlers.open}
          >
            Next Maintenance Date
          </Menu.Item>
          <Menu.Item icon={<IconUser size={16} />} onClick={managerFilterHandlers.open}>
            Manager
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      {showAssetTypesFilter && (
        <AssetTypeFilter
          assetTypes={assetTypes}
          selected={selectedAssetTypes}
          onChange={setSelectedAssetTypes}
          clear={handleClearAssetTypes}
        />
      )}
      {showNextMaintenanceDateFilter && (
        <NextMaintenanceDateFilter
          selectionMode={selectionMode}
          setSelectionMode={setSelectionMode}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          clear={handleClearNextMaintenanceDate}
        />
      )}
      {showManagerFilter && (
          <AssetManagerFilter users={users} selected={selectedManagers} onChange={setSelectedManagers} clear={handleClearManagers} />
      )}
      {(showAssetTypesFilter || showNextMaintenanceDateFilter) && (
        <Anchor size="sm" fw={600} underline={false} onClick={handleClearAll}>
          Clear all
        </Anchor>
      )}
    </Group>
  );
}
