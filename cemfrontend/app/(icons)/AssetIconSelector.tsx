'use client';

import { Group, Button } from '@mantine/core';
import { AssetIconIdentifier, assetIconOptions, getAssetIcon } from './assetTypes';

interface AssetIconSelectorProps {
	iconIdentifier: string | undefined;
	onIconSelected: (iconIdentifier: AssetIconIdentifier) => void;
}

export default function AssetIconSelector({
	iconIdentifier,
	onIconSelected,
}: AssetIconSelectorProps) {
	return (
		<Group>
			{assetIconOptions.map(({ value, label }) => (
				<Button
					key={value}
					color={iconIdentifier === value ? 'blue' : 'gray'}
					onClick={() => onIconSelected(value)}
					title={label}
				>
					{getAssetIcon(value)}
				</Button>
			))}
		</Group>
	);
}
