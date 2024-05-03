'use client';

import {
	IconFireExtinguisher,
	IconFirstAidKit,
	IconHeartBolt,
	IconBleach,
	IconAsset,
	IconProps,
} from '@tabler/icons-react';

const DEFAULT_ASSET_ICON = IconAsset;

export enum AssetIconIdentifier {
	FireExtinguisher = 'fire-extinguisher',
	HeartBolt = 'heart-bolt',
	Bleach = 'bleach',
	FirstAid = 'first-aid-kit',
	Asset = 'asset',
}

export const assetIconMap: Record<AssetIconIdentifier, React.ReactComponentElement<IconProps>> = {
	[AssetIconIdentifier.FireExtinguisher]: IconFireExtinguisher,
	[AssetIconIdentifier.FirstAid]: IconFirstAidKit,
	[AssetIconIdentifier.HeartBolt]: IconHeartBolt,
	[AssetIconIdentifier.Bleach]: IconBleach,
	[AssetIconIdentifier.Asset]: IconAsset,
};

export function getAssetIcon(identifier: string, options?: { size?: number; color?: string }) {
	const Icon = assetIconMap[identifier as AssetIconIdentifier] || DEFAULT_ASSET_ICON;
	return <Icon size={options?.size || 20} color={options?.color} />;
}

export const assetIconOptions = [
	{ value: AssetIconIdentifier.FireExtinguisher, label: 'Fire Extinguisher' },
	{ value: AssetIconIdentifier.HeartBolt, label: 'AED' },
	{ value: AssetIconIdentifier.Bleach, label: 'Chemical Wash Station' },
	{ value: AssetIconIdentifier.FirstAid, label: 'First Aid Kit' },
	{ value: AssetIconIdentifier.Asset, label: 'Other' },
];
