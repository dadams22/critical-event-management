'use client';

import { MinimalUser } from '../../../api/types';
import { ActionIcon, Button, Checkbox, Flex, Group, Menu, Text } from '@mantine/core';
import { IconAsset, IconX } from '@tabler/icons-react';
import { getAssetIcon } from '../../(icons)/assetTypes';

function getUserDisplayName(user: MinimalUser): string {
  return !user.first_name && !user.last_name ? user.email : `${user.first_name} ${user.last_name}`;
}

interface ComponentProps {
  users: MinimalUser[];
  selected: string[];
  onChange: (selected: string[]) => void;
  clear: () => void;
}

export default function AssetManagerFilter({ users, selected, onChange, clear }: ComponentProps) {
  const handleItemClick = (userId: string) => () => {
    if (selected.includes(userId)) {
      onChange(selected.filter((id) => id !== userId));
    } else {
      onChange([...selected, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === 0) {
      onChange(users.map(({ id }) => String(id)));
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
            Managed by
            {selected.length > 0 && (
              <Text c="dimmed">
                {selected.length > 1
                  ? selected.length
                  : getUserDisplayName(users.find((user) => String(user.id) === selected[0])!)}
              </Text>
            )}
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
              indeterminate={selected.length > 0 && selected.length !== users.length}
            />
          }
          onClick={handleSelectAll}
        >
          Select all
        </Menu.Item>
        <Menu.Divider />
        {users.map((user) => (
          <Menu.Item
            icon={
              <Checkbox
                size="xs"
                style={{ pointerEvents: 'none' }}
                checked={selected.includes(String(user.id))}
              />
            }
            onClick={handleItemClick(String(user.id))}
          >
            {getUserDisplayName(user)}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
