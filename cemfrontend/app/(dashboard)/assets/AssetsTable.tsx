'use client';

import { Asset, AssetType } from '../../../api/types';
import {
  ActionIcon,
  Anchor,
  Badge,
  Center,
  Flex,
  Group,
  Menu,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { getAssetIcon } from '../../(icons)/assetTypes';
import dayjs from 'dayjs';
import AssetTypeFilter from './AssetTypeFilter';
import _ from 'lodash';
import { useState } from 'react';
import { IconAsset, IconCalendar, IconFilter, IconFilterPlus } from '@tabler/icons-react';
import NextMaintenanceDateFilter from './NextMaintenanceDateFilter';

interface ComponentProps {
  assets: Asset[];
}

export default function AssetsTable({ assets }: ComponentProps) {
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
          <tr key={asset.id}>
            <td>{asset.name}</td>
            <td>
              <Flex gap="sm" align="center">
                {getAssetIcon(asset.asset_type.icon_identifier)}
                {asset.asset_type.name}
              </Flex>
            </td>
            <td>
              {asset.maintenance_status === 'COMPLIANT' ? (
                <Badge color="green">Compliant</Badge>
              ) : asset.maintenance_status === 'NEEDS_MAINTENANCE' ? (
                <Badge color="yellow">Maintenance Due</Badge>
              ) : asset.maintenance_status === 'OUT_OF_COMPLIANCE' ? (
                <Badge color="red">Overdue</Badge>
              ) : null}
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
