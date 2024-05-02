'use client';

import { Card, CloseButton, Flex, Image, Stack, Text, Title } from '@mantine/core';
import { Asset } from '../../../api/types';
import { getIcon } from '../../(icons)/assetTypes';

interface ComponentProps {
	asset: Asset;
	onClose: () => void;
}

export default function InspectAssetCard({ asset, onClose }: ComponentProps) {
	return (
		<Card withBorder shadow="md" p="md">
			<Flex justify="space-between">
				<Title order={4}>Asset Details</Title>
				<CloseButton onClick={onClose} />
			</Flex>
			<Stack spacing="sm">
				{asset.photo && <Image src={asset.photo} radius="sm" />}
				<Stack spacing={0}>
					<Text fz="sm" fw={600}>
						Name
					</Text>
					<Text>{asset.name}</Text>
				</Stack>
				<Stack spacing={0}>
					<Text fz="sm" fw={600}>
						Asset Type
					</Text>
					<Text>
						<Flex gap={4} align="center">
							{getIcon(asset.asset_type.icon_identifier)}
							{asset.asset_type.name}
						</Flex>
					</Text>
				</Stack>
			</Stack>
		</Card>
	);
}
