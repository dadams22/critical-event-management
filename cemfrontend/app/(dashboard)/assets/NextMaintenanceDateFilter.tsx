'use client';

import { ActionIcon, Button, Group, Menu, Radio, Stack, Text } from '@mantine/core';
import { IconCalendar, IconX } from '@tabler/icons-react';
import { DatePicker } from '@mantine/dates';
import { useState } from 'react';
import dayjs from 'dayjs';

export type SelectionMode = 'before' | 'between' | 'after';

interface ComponentProps {
  selectionMode: SelectionMode;
  setSelectionMode: (mode: SelectionMode) => void;
  selectedDate: Date | null | [Date | null, Date | null];
  setSelectedDate: (selectedDate: Date | null | [Date | null, Date | null]) => void;
  clear: () => void;
}

export default function NextMaintenanceDateFilter({
  selectionMode,
  setSelectionMode,
  selectedDate,
  setSelectedDate,
  clear,
}: ComponentProps) {
  const handleChangeSelectionMode = (mode: SelectionMode) => {
    setSelectedDate(mode === 'between' ? [null, null] : null);
    setSelectionMode(mode);
  };

  const handleClearClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    clear();
  };

  const handleMenuClose = () => {
    if (
      selectedDate === null ||
      (Array.isArray(selectedDate) && selectedDate.some((date) => date === null))
    ) {
      clear();
    }
  };

  const dateLabel = (() => {
    if (
      selectedDate === null ||
      (Array.isArray(selectedDate) && selectedDate.some((date) => date === null))
    )
      return null;
    if (selectionMode === 'before') return `Before ${dayjs(selectedDate as Date).format('M/D/YY')}`;
    if (selectionMode === 'after') return `After ${dayjs(selectedDate as Date).format('M/D/YY')}`;
    return `${dayjs(selectedDate[0]! as Date).format('M/D/YY')} - ${dayjs(selectedDate[1]! as Date).format('M/D/YY')}`;
  })();

  return (
    <Menu defaultOpened closeOnItemClick={false} position="bottom-start" onClose={handleMenuClose}>
      <Menu.Target>
        <Button variant="default" radius="xl" size="xs" leftIcon={<IconCalendar size={16} />}>
          <Group spacing={4}>
            Next Maintenance
            {!!dateLabel && <Text c="dimmed">{dateLabel}</Text>}
          </Group>
          <ActionIcon mr={-10} onClick={handleClearClick}>
            <IconX size={12} />
          </ActionIcon>
        </Button>
      </Menu.Target>
      <Menu.Dropdown p="sm">
        <Stack spacing="xs">
          <Radio.Group value={selectionMode} onChange={handleChangeSelectionMode}>
            <Group>
              <Radio label="Before" value="before" style={{ cursor: 'pointer' }} />
              <Radio label="Between" value="between" style={{ cursor: 'pointer' }} />
              <Radio label="After" value="after" style={{ cursor: 'pointer' }} />
            </Group>
          </Radio.Group>
          <Menu.Divider />
          <DatePicker
            key={selectionMode}
            type={selectionMode === 'between' ? 'range' : 'default'}
            value={selectedDate}
            onChange={setSelectedDate}
            firstDayOfWeek={0}
          />
        </Stack>
      </Menu.Dropdown>
    </Menu>
  );
}
