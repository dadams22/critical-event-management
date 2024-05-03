'use client';

import {
	Autocomplete,
	Button,
	Card,
	FileButton,
	Flex,
	Group,
	Image,
	Paper,
	Select,
	SelectItem,
	Stack,
	Text,
	TextInput,
	Title,
	useMantineTheme,
} from '@mantine/core';
import { IconCheck, IconClick, IconCrosshair, IconPhoto, IconSelector } from '@tabler/icons-react';
import { forwardRef, useState } from 'react';
import { AssetType } from '../../../api/types';
import { getAssetIcon } from '../../(icons)/assetTypes';
import Api from '../../../api/Api';
import { DateInput } from '@mantine/dates';

interface ComponentProps {
	onSave: (assetInfo: {
		name: string;
		assetType: string;
		photo?: File;
		nextMaintenanceDate: Date;
	}) => Promise<void>;
	onCancel: () => void;
	locationSelected: boolean;
	assetTypes: AssetType[];
}

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
	value: string;
	label: string;
	icon_identifier: string;
}

const AssetTypeSelectItem = forwardRef<HTMLDivElement, ItemProps>(
	({ icon_identifier, label, ...others }: ItemProps, ref) => (
		<div ref={ref} {...others}>
			<Group noWrap align="center">
				{getAssetIcon(icon_identifier)}
				<div>
					<Text size="sm">{label}</Text>
				</div>
			</Group>
		</div>
	)
);

export default function AddAssetForm({
	onSave,
	onCancel,
	locationSelected,
	assetTypes,
}: ComponentProps) {
	const theme = useMantineTheme();

	const [name, setName] = useState<string>('');
	const [assetType, setAssetType] = useState<string | null>();
	const [assetImage, setAssetImage] = useState<File>();
	const [assetImageUrl, setAssetImageUrl] = useState<string>();
	const [nextMaintenanceDate, setNextMaintenanceDate] = useState<Date | null>();

	const handleImageUpload = (file: File | null) => {
		if (!file) {
			setAssetImage(undefined);
			setAssetImageUrl(undefined);
			return;
		}

		setAssetImage(file);

		const reader = new FileReader();
		reader.onload = (event: ProgressEvent<FileReader>) => {
			setAssetImageUrl(String(event.target?.result));
		};
		reader.readAsDataURL(file);
	};

	const assetTypeOptions: ItemProps[] = assetTypes.map(({ name, icon_identifier, id }) => ({
		value: id,
		label: name,
		icon_identifier,
	}));

	const [saving, setSaving] = useState<boolean>(false);
	const disableSave: boolean = !name || !locationSelected || !assetType || !nextMaintenanceDate;
	const handleSave = () => {
		if (disableSave) return;
		setSaving(true);
		onSave({
			name,
			assetType: assetType!,
			photo: assetImage,
			nextMaintenanceDate: nextMaintenanceDate!,
		}).finally(() => setSaving(false));
	};

	return (
		<Card withBorder shadow="md" p="md">
			<Stack>
				<Title order={4}>Create a New Asset</Title>
				<Flex justify="center" align="center" gap={4}>
					{locationSelected ? (
						<>
							<IconCheck size={20} color={theme.colors.blue[8]} />
							<Text size="sm">Location selected.</Text>
						</>
					) : (
						<>
							<IconClick size={20} />
							<Text size="sm">Click the map to select a location.</Text>
						</>
					)}
				</Flex>
				<TextInput
					label="Asset Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
				<Select
					value={assetType}
					onChange={setAssetType}
					data={assetTypeOptions}
					itemComponent={AssetTypeSelectItem}
					label="Asset Type"
					required
				/>
				<DateInput
					label="Next Mainenance Date"
					value={nextMaintenanceDate}
					onChange={setNextMaintenanceDate}
					required
					minDate={new Date()}
					popoverProps={{ position: 'right', withinPortal: true }}
					firstDayOfWeek={0}
				/>
				{assetImageUrl && <Image src={assetImageUrl} radius="sm" caption={assetImage?.name} />}
				<FileButton accept="image/png,image/jpeg" onChange={handleImageUpload}>
					{(props) => (
						<Button
							variant={!!assetImage ? 'outline' : 'filled'}
							size="sm"
							leftIcon={<IconPhoto size={20} />}
							{...props}
						>
							{!!assetImage ? 'Change Image' : 'Upload Image'}
						</Button>
					)}
				</FileButton>
				<Flex justify="flex-end">
					<Group>
						<Button variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button disabled={disableSave} onClick={handleSave} loading={saving}>
							Save
						</Button>
					</Group>
				</Flex>
			</Stack>
		</Card>
	);
}
