'use client';

import {
  RingProgress,
  Text,
  SimpleGrid,
  Center,
  Group,
  MantineColor,
  Card,
  useMantineTheme,
} from '@mantine/core';
import _ from 'lodash';
import {
  IconCheck,
  IconUrgent,
  TablerIcon,
  IconClockExclamation,
  IconAsset,
} from '@tabler/icons-react';
import { useMemo } from 'react';
import { Asset, MaintenanceStatus } from '../../../api/types';

interface StatDisplayProps {
  label: string;
  progress: number;
  count: number;
  color: MantineColor;
  Icon: TablerIcon;
}

interface ComponentProps {
  assets: Asset[];
}

export function AssetSummary({ assets }: ComponentProps) {
  const theme = useMantineTheme();

  const data: StatDisplayProps[] = useMemo(() => {
    const compliantCount = assets.filter(
      (asset) => asset.maintenance_status === MaintenanceStatus.COMPLIANT
    ).length;
    const needsMaintenanceCount = assets.filter(
      (asset) => asset.maintenance_status === MaintenanceStatus.NEEDS_MAINTENANCE
    ).length;
    const outOfComplianceCount = assets.filter(
      (asset) => asset.maintenance_status === MaintenanceStatus.OUT_OF_COMPLIANCE
    ).length;
    return [
      {
        label: 'Total Assets',
        progress: 100,
        count: assets.length,
        color: 'blue',
        Icon: IconAsset,
      },
      {
        label: 'In Compliance',
        progress: (compliantCount / assets.length) * 100,
        count: compliantCount,
        color: 'green',
        Icon: IconCheck,
      },
      {
        label: 'Need Maintenance',
        progress: (needsMaintenanceCount / assets.length) * 100,
        count: needsMaintenanceCount,
        color: 'yellow',
        Icon: IconClockExclamation,
      },
      {
        label: 'Out of Compliance',
        progress: (outOfComplianceCount / assets.length) * 100,
        count: outOfComplianceCount,
        color: 'red',
        Icon: IconUrgent,
      },
    ];
  }, [assets]);

  const stats = data.map((stat) => (
    <Card withBorder radius="md" shadow="sm" p="xs" key={stat.label} style={{ cursor: 'pointer' }}>
      <Group>
        <RingProgress
          size={60}
          roundCaps
          thickness={8}
          sections={[{ value: stat.progress, color: stat.color }]}
          label={
            <Center>
              <stat.Icon size="1.4rem" stroke={1.5} color={theme.colors[stat.color][7]} />
            </Center>
          }
        />

        <div>
          <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
            {stat.label}
          </Text>
          <Text weight={700} size="xl">
            {stat.count}
          </Text>
        </div>
      </Group>
    </Card>
  ));

  return (
    <SimpleGrid
      cols={4}
      spacing="sm"
      breakpoints={[
        { maxWidth: 'sm', cols: 1 },
        { maxWidth: 'lg', cols: 2 },
      ]}
    >
      {stats}
    </SimpleGrid>
  );
}
