'use client';

import { IconFireExtinguisher, IconHeartBolt, IconBleach, IconAsset } from '@tabler/icons-react';

const DEFAULT_ASSET_ICON = <IconAsset size={20} />;

export enum AssetIconIdentifier {
    FireExtinguisher = 'fire-extinguisher',
    HeartBolt = 'heart-bolt',
    Bleach = 'bleach',
    Asset = 'asset',
}

export const assetIconMap: Record<AssetIconIdentifier, React.ReactNode> = {
    [AssetIconIdentifier.FireExtinguisher]: <IconFireExtinguisher />,
    [AssetIconIdentifier.HeartBolt]: <IconHeartBolt />,
    [AssetIconIdentifier.Bleach]: <IconBleach />,
    [AssetIconIdentifier.Asset]: <IconAsset />,
};

export function getAssetIcon(identifier: string) {
    if (assetIconMap[identifier as AssetIconIdentifier]) {
        return assetIconMap[identifier as AssetIconIdentifier];
    }
    return DEFAULT_ASSET_ICON;
}

export const assetIconOptions = [
    { value: AssetIconIdentifier.FireExtinguisher, label: 'Fire Extinguisher' },
    { value: AssetIconIdentifier.HeartBolt, label: 'AED' },
    { value: AssetIconIdentifier.Bleach, label: 'Chemical Wash Station' },
    { value: AssetIconIdentifier.Asset, label: 'Other' },
];
