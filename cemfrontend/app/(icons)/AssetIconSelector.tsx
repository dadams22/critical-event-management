'use client';

import { createStyles, Menu, Paper, Select, SelectItem, SimpleGrid } from '@mantine/core';
import { forwardRef } from 'react';
import styled from '@emotion/styled';
import { AssetIconIdentifier, assetIconOptions, getAssetIcon } from './assetTypes';

const useStyles = createStyles({
  container: {
    position: 'relative',
    pointerEvents: 'all',
  },

  value: {
    position: 'absolute',
    top: '50%',
    left: '8px',
    transform: 'translateY(-50%)',

    display: 'flex',
    alignItems: 'center',

    pointerEvents: 'none',
  },

  select: {
    '.mantine-Select-dropdown': {
      width: '160px !important',
      left: '0 !important',
    },
    '.mantine-Select-itemsWrapper': {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, min-content)',
      gridAutoRow: 'min-content',
      gap: '6px',
    },
  },
});

const Item = styled.div`
  width: min-content;

  display: flex;
  align-items: center;
`;

const AssetIconItem = forwardRef<HTMLDivElement, SelectItem>(
  ({ value, label, ...others }: SelectItem, ref) => (
    <Item ref={ref} {...others}>
      {getAssetIcon(value)}
    </Item>
  )
);

interface AssetIconSelectorProps {
  iconIdentifier: string | undefined;
  onIconSelected: (iconIdentifier: AssetIconIdentifier) => void;
}

export default function AssetIconSelector({
  iconIdentifier,
  onIconSelected,
}: AssetIconSelectorProps) {
  const { classes } = useStyles();

  return (
    <div className={classes.container}>
      <Select
        w={60}
        className={classes.select}
        value={iconIdentifier}
        data={assetIconOptions}
        itemComponent={AssetIconItem}
        onChange={onIconSelected}
      />
      {!!iconIdentifier && <div className={classes.value}>{getAssetIcon(iconIdentifier)}</div>}
    </div>
  );
}
