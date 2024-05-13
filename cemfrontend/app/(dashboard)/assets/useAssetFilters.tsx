import { useCallback, useState } from 'react';
import webpack from 'webpack';
import { Asset } from '../../../api/types';
import { useDisclosure } from '@mantine/hooks';
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
}

export default function useAssetFilters({}: HookParams): HookResult {
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<string[]>([]);

  const [dateSelectionMode, setDateSelectionMode] = useState<SelectionMode>(true);
  const [selectedDate, setSelectedDate] = useState<Date | null | [Date | null, Date | null]>(null);

  const filterFn = useCallback(
    (asset: Asset) => {
      if (selectedAssetTypes.length > 0 && !selectedAssetTypes.includes(asset.asset_type.id))
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
    [selectedAssetTypes, dateSelectionMode, selectedDate]
  );

  return {
    filterFn,
    selectedAssetTypes,
    setSelectedAssetTypes,
    selectionMode: dateSelectionMode,
    setSelectionMode: setDateSelectionMode,
    selectedDate,
    setSelectedDate,
  };
}
