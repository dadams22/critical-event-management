'use client';

import { Icon, IconFireExtinguisher, IconHeartBolt, IconBleach, IconAsset } from '@tabler/icons-react';

const DEFAULT_ASSET_ICON = <IconAsset />;

export enum IconIdentifier {
    FireExtinguisher = 'fire-extinguisher',
    HeartBolt = 'heart-bolt',
    Bleach = 'bleach',
    Asset = 'asset',
}

export const iconMap: Record<IconIdentifier, React.ReactNode> = {
    [IconIdentifier.FireExtinguisher]: <IconFireExtinguisher />,
    [IconIdentifier.HeartBolt]: <IconHeartBolt />,
    [IconIdentifier.Bleach]: <IconBleach />,
    [IconIdentifier.Asset]: <IconAsset />,
};

export function getIcon(identifier: string) {
    if (iconMap[identifier as IconIdentifier]) {
        return iconMap[identifier as IconIdentifier];
    }
    return DEFAULT_ASSET_ICON;
}

export const iconOptions = [
    { value: IconIdentifier.FireExtinguisher, label: 'Fire Extinguisher' },
    { value: IconIdentifier.HeartBolt, label: 'AED' },
    { value: IconIdentifier.Bleach, label: 'Chemical Wash Station' },
    { value: IconIdentifier.Asset, label: 'Other' },
];
