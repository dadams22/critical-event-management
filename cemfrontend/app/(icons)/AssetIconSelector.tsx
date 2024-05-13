'use client';

import { Select, SelectItem } from '@mantine/core';
import { forwardRef } from 'react';
import styled from '@emotion/styled';
import { AssetIconIdentifier, assetIconOptions, getAssetIcon } from './assetTypes';

const Item = styled.div`
  width: min-content;
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
  return (
    <Select
      value={iconIdentifier}
      data={assetIconOptions}
      itemComponent={AssetIconItem}
      onChange={onIconSelected}
    />
  );
}
