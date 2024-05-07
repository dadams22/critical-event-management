'use client';

import {
	Button,
	Card,
	CloseButton,
	Flex,
	Image,
	Stack,
	Text,
	Timeline,
	Title,
} from '@mantine/core';
import { Asset } from '../../../api/types';
import { getAssetIcon } from '../../(icons)/assetTypes';
import dayjs from 'dayjs';
import { useDisclosure } from '@mantine/hooks';
import MaintenanceLogModal from './MaintenanceLogModal';
import { IconTool } from '@tabler/icons-react';
import Api from '../../../api/Api';

const formatMaintenanceDate = (dateString: string): string => {
	const targetDate = dayjs(dateString, 'YYYY-MM-DD');
	const currentDate = dayjs();
	const diffInDays = targetDate.diff(currentDate, 'day');
	const diffInMonths = targetDate.diff(currentDate, 'month');

	let diffString;
	if (diffInDays < 0) {
		diffString = `(${Math.abs(diffInDays)} days overdue)`;
	} else if (diffInDays === 0) {
		diffString = `(today)`;
	} else if (diffInMonths < 1) {
		diffString = `(${diffInDays} days from now)`;
	} else {
		diffString = `(${diffInMonths} months from now)`;
	}

	return `${targetDate.format('MMMM D, YYYY')} ${diffString}`;
};

interface ComponentProps {
	asset: Asset;
	onUpdateAsset: () => void;
	onClose: () => void;
}

export default function InspectAssetCard({ asset, onUpdateAsset, onClose }: ComponentProps) {
	const [
		maintenanceLogModalOpened,
		{ open: openMaintenanceLogModal, close: closeMaintenanceLogModal },
	] = useDisclosure();

	const handleLogMaintenance = (payload: {
		notes: string;
		photo?: File;
		nextMaintenanceDate?: Date;
	}) => {
		const { notes, photo, nextMaintenanceDate } = payload;
		return Api.createMaintenanceLog({ assetId: asset.id, notes, photo, nextMaintenanceDate }).then(
			() => onUpdateAsset()
		);
	};

	return (
		<>
			<Card withBorder shadow="md" p="md">
				<Flex justify="space-between" mb="sm">
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
								{getAssetIcon(asset.asset_type.icon_identifier)}
								{asset.asset_type.name}
							</Flex>
						</Text>
					</Stack>
					<Stack spacing={0}>
						<Text fz="sm" fw={600}>
							Next Maintenance Date
						</Text>
						<Text>{formatMaintenanceDate(asset.next_maintenance_date)}</Text>
					</Stack>
					<Stack spacing="sm">
						<Text fz="sm">Maintenance History</Text>
						{asset.maintenance_logs.length ? (
							<Timeline active={asset.maintenance_logs.length - 1}>
								{asset.maintenance_logs.map((maintenance_log) => (
									<Timeline.Item title="Maintenance Recorded">
										<Text c="dimmed">
											{dayjs(maintenance_log.created_at).format('MMMM D, YYYY h:mm A')}
										</Text>
										<Text>{maintenance_log.notes}</Text>
										{maintenance_log.photo && <Image src={maintenance_log.photo} />}
									</Timeline.Item>
								))}
							</Timeline>
						) : (
							<Text c="dimmed">No maintenance recorded.</Text>
						)}
					</Stack>
					<Button leftIcon={<IconTool size={20} />} onClick={openMaintenanceLogModal}>
						Log Maintenance
					</Button>
				</Stack>
			</Card>
			<MaintenanceLogModal
				opened={maintenanceLogModalOpened}
				onClose={closeMaintenanceLogModal}
				onSave={handleLogMaintenance}
			/>
		</>
	);
}
