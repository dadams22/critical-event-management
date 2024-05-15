'use client';

import {
  IconFireExtinguisher,
  IconFirstAidKit,
  IconHeartBolt,
  IconBleach,
  IconAsset,
  IconProps,
  IconDoor,
  IconElevator,
  IconFlame,
  IconFireHydrant,
  IconDroplet,
  IconUrgent,
  IconSquareKey,
  IconBandage,
  IconBiohazard,
  IconDeviceCctv,
  IconLadder,
  IconBolt,
  IconFountain,
  IconAdjustments,
  IconPlugConnected,
  IconRouter,
  IconNetwork,
  IconWifi,
  IconCircuitSwitchOpen,
  IconRipple,
  IconLock,
  IconVolume,
  IconSpeakerphone,
  IconDeviceTv,
  IconRippleOff,
  IconBoltOff,
} from '@tabler/icons-react';
import { SelectItem } from '@mantine/core';

const DEFAULT_ASSET_ICON = IconAsset;

export enum AssetIconIdentifier {
  FireExtinguisher = 'fire-extinguisher',
  HeartBolt = 'heart-bolt',
  FirstAid = 'first-aid-kit',
  Asset = 'asset',
  Door = 'door',
  Elevator = 'elevator',
  Flame = 'flame',
  FireHydrant = 'fire-hydrant',
  Droplet = 'droplet',
  Urgent = 'urgent',
  SquareKey = 'square-key',
  Bandage = 'bandage',
  Biohazard = 'biohazard',
  DeviceCctv = 'device-cctv',
  Ladder = 'ladder',
  Bolt = 'bolt',
  BoltOff = 'bolt-off',
  Fountain = 'fountain',
  Adjustments = 'adjustments',
  PlugConnected = 'plug-connected',
  Router = 'router',
  Network = 'network',
  Wifi = 'wifi',
  CircuitSwitchOpen = 'circuit-switch-open',
  Ripple = 'ripple',
  RippleOff = 'ripple-off',
  Lock = 'lock',
  Volume = 'volume',
  Speakerphone = 'speakerphone',
  DeviceTv = 'device-tv',
  Bleach = 'bleach',
}

export const assetIconMap: Record<AssetIconIdentifier, React.ReactComponentElement<IconProps>> = {
  [AssetIconIdentifier.FireExtinguisher]: IconFireExtinguisher,
  [AssetIconIdentifier.FirstAid]: IconFirstAidKit,
  [AssetIconIdentifier.HeartBolt]: IconHeartBolt,
  [AssetIconIdentifier.Asset]: IconAsset,
  [AssetIconIdentifier.Door]: IconDoor,
  [AssetIconIdentifier.Elevator]: IconElevator,
  [AssetIconIdentifier.Flame]: IconFlame,
  [AssetIconIdentifier.FireHydrant]: IconFireHydrant,
  [AssetIconIdentifier.Droplet]: IconDroplet,
  [AssetIconIdentifier.Urgent]: IconUrgent,
  [AssetIconIdentifier.SquareKey]: IconSquareKey,
  [AssetIconIdentifier.Bandage]: IconBandage,
  [AssetIconIdentifier.Biohazard]: IconBiohazard,
  [AssetIconIdentifier.DeviceCctv]: IconDeviceCctv,
  [AssetIconIdentifier.Ladder]: IconLadder,
  [AssetIconIdentifier.Bolt]: IconBolt,
  [AssetIconIdentifier.BoltOff]: IconBoltOff,
  [AssetIconIdentifier.Fountain]: IconFountain,
  [AssetIconIdentifier.Adjustments]: IconAdjustments,
  [AssetIconIdentifier.PlugConnected]: IconPlugConnected,
  [AssetIconIdentifier.Router]: IconRouter,
  [AssetIconIdentifier.Network]: IconNetwork,
  [AssetIconIdentifier.Wifi]: IconWifi,
  [AssetIconIdentifier.CircuitSwitchOpen]: IconCircuitSwitchOpen,
  [AssetIconIdentifier.Ripple]: IconRipple,
  [AssetIconIdentifier.RippleOff]: IconRippleOff,
  [AssetIconIdentifier.Lock]: IconLock,
  [AssetIconIdentifier.Volume]: IconVolume,
  [AssetIconIdentifier.Speakerphone]: IconSpeakerphone,
  [AssetIconIdentifier.DeviceTv]: IconDeviceTv,
  [AssetIconIdentifier.Bleach]: IconBleach,
};

export function getAssetIcon(identifier: string, options?: { size?: number; color?: string }) {
  const Icon = assetIconMap[identifier as AssetIconIdentifier] || DEFAULT_ASSET_ICON;
  return <Icon size={options?.size || 20} color={options?.color} />;
}

export const assetIconOptions: SelectItem[] = Object.values(AssetIconIdentifier).map(
  (iconIdentifier) => ({
    value: iconIdentifier,
    label: '',
  })
);
