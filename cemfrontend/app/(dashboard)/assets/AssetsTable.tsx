'use client';

import {
  ActionIcon,
  Anchor,
  Badge,
  Center,
  createStyles,
  Flex,
  Group,
  Menu,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useState } from 'react';
import { IconAsset, IconCalendar, IconFilter, IconFilterPlus } from '@tabler/icons-react';
import AssetTypeFilter from './components/filter/AssetTypeFilter';
import { getAssetIcon } from '../../(icons)/assetTypes';
import { Asset, AssetType } from '../../../api/types';
import NextMaintenanceDateFilter from './components/filter/NextMaintenanceDateFilter';
import AssetStatusPill from '../../../components/asset/AssetStatusPill';

const useStyles = createStyles((theme) => ({
  row: {
    ':hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },

    cursor: 'pointer',
  },

  selected: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
  },
}));

interface ComponentProps {
  assets: Asset[];
  onInspectAsset: (assetId: string) => void;
  inspectedAssetId?: string;
}

export default function AssetsTable({ assets, onInspectAsset, inspectedAssetId }: ComponentProps) {
  const { classes, cx } = useStyles();

  return assets.length > 0 ? (
    <Table>
      <thead>
        <tr>
          <th>Asset Name</th>
          <th>Type</th>
          <th>Maintenance Status</th>
          <th>Next Maintenance Date</th>
        </tr>
      </thead>
      <tbody>
        {assets.map((asset) => (
          <tr
            key={asset.id}
            className={cx(
              classes.row,
              String(asset.id) === String(inspectedAssetId) && classes.selected
            )}
            onClick={() => onInspectAsset(asset.id)}
          >
            <td>{asset.name}</td>
            <td>
              <Flex gap="sm" align="center">
                {getAssetIcon(asset.asset_type.icon_identifier)}
                {asset.asset_type.name}
              </Flex>
            </td>
            <td>
              <AssetStatusPill status={asset.maintenance_status} />
            </td>
            <td>{dayjs(asset.next_maintenance_date).format('MMMM D, YYYY')}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  ) : (
    <Center h="100%">
      <Text c="dimmed">No Assets Found.</Text>
    </Center>
  );
}
