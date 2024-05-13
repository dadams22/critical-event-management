'use client';

import { AssetType } from '../../../api/types';
import { ActionIcon, Button, Checkbox, Chip, Flex, Group, Menu, Text } from '@mantine/core';
import { IconAsset, IconFilter, IconX } from '@tabler/icons-react';
import { getAssetIcon } from '../../(icons)/assetTypes';
import { produce } from 'immer';

interface ComponentProps {
  assetTypes: AssetType[];
  selected: string[];
  onChange: (selected: string[]) => void;
  clear: () => void;
}

export default function AssetTypeFilter({ assetTypes, selected, onChange, clear }: ComponentProps) {
  const handleItemClick = (assetTypeId: string) => () => {
    if (selected.includes(assetTypeId)) {
      onChange(selected.filter((id) => id !== assetTypeId));
    } else {
      onChange([...selected, assetTypeId]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === 0) {
      onChange(assetTypes.map(({ id }) => id));
    } else {
      onChange([]);
    }
  };

  const handleClearClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    clear();
    e.stopPropagation();
  };

  const handleCloseMenu = () => {
    if (selected.length === 0) clear();
  };

  return (
    <Menu defaultOpened closeOnItemClick={false} position="bottom-start" onClose={handleCloseMenu}>
      <Menu.Target>
        <Button variant="default" radius="xl" size="xs" leftIcon={<IconAsset size={16} />}>
          <Group spacing={4}>
            Asset Types
            {selected.length > 0 && <Text c="dimmed">{selected.length}</Text>}
          </Group>
          <ActionIcon mr={-10} onClick={handleClearClick}>
            <IconX size={12} />
          </ActionIcon>
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          icon={
            <Checkbox
              size="xs"
              style={{ pointerEvents: 'none' }}
              checked={selected.length > 0}
              indeterminate={selected.length > 0 && selected.length !== assetTypes.length}
            />
          }
          onClick={handleSelectAll}
        >
          Select all
        </Menu.Item>
        <Menu.Divider />
        {assetTypes.map((assetType) => (
          <Menu.Item
            icon={
              <Checkbox
                size="xs"
                style={{ pointerEvents: 'none' }}
                checked={selected.includes(assetType.id)}
              />
            }
            onClick={handleItemClick(assetType.id)}
          >
            <Flex align="center" gap={4}>
              {getAssetIcon(assetType.icon_identifier, { size: 16 })} {assetType.name}
            </Flex>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
