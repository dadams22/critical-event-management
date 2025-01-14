import { useCallback, useState } from 'react';
import webpack from 'webpack';
import { useDisclosure } from '@mantine/hooks';
import { Asset } from '../../../../../api/types';
import { SelectionMode } from './NextMaintenanceDateFilter';

interface HookParams {}

interface HookResult {
  filterFn: (asset: Asset) => boolean;
  selectedAssetTypes: string[];
  setSelectedAssetTypes: (selected: string[]) => void;
  selectionMode: SelectionMode;
  setSelectionMode: (mode: SelectionMode) => void;
  selectedDate: Date | null | [Date | null, Date | null];
  setSelectedDate: (selectedDate: Date | null | [Date | null, Date | null]) => void;
  selectedManagers: string[];
  setSelectedManagers: (selected: string[]) => void;
}

export default function useAssetFilters({}: HookParams): HookResult {
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<string[]>([]);

  const [dateSelectionMode, setDateSelectionMode] = useState<SelectionMode>(true);
  const [selectedDate, setSelectedDate] = useState<Date | null | [Date | null, Date | null]>(null);

  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);

  const filterFn = useCallback(
    (asset: Asset) => {
      if (selectedAssetTypes.length > 0 && !selectedAssetTypes.includes(asset.asset_type.id))
        return false;

      if (
        selectedManagers.length > 0 &&
        (!asset.managed_by?.id || !selectedManagers.includes(String(asset.managed_by.id)))
      )
        return false;

      const assetMaintenanceDate = new Date(asset.next_maintenance_date);
      let [afterDate, beforeDate] = Array.isArray(selectedDate) ? selectedDate : [null, null];
      if (dateSelectionMode === 'before') {
        beforeDate = selectedDate as Date | null;
      }
      if (dateSelectionMode === 'after') {
        afterDate = selectedDate as Date | null;
      }

      if (!!beforeDate && !(assetMaintenanceDate < beforeDate)) return false;
      if (!!afterDate && !(assetMaintenanceDate > afterDate)) return false;

      return true;
    },
    [selectedAssetTypes, dateSelectionMode, selectedDate, selectedManagers]
  );

  return {
    filterFn,
    selectedAssetTypes,
    setSelectedAssetTypes,
    selectionMode: dateSelectionMode,
    setSelectionMode: setDateSelectionMode,
    selectedDate,
    setSelectedDate,
    selectedManagers,
    setSelectedManagers,
  };
}
