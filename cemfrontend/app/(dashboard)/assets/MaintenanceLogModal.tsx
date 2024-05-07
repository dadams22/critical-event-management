'use client';

import { Button, FileButton, Flex, Group, Image, Modal, Stack, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconPhoto } from '@tabler/icons-react';
import _ from 'lodash';
import { useState } from 'react';

interface ComponentProps {
	opened: boolean;
	onClose: () => void;
	onSave: (payload: { notes: string; photo?: File }) => Promise<any>;
}

export default function MaintenanceLogModal({ opened, onClose, onSave }: ComponentProps) {
	const [notes, setNotes] = useState<string>('');
	const [photo, setPhoto] = useState<File>();
	const [photoUrl, setPhotoUrl] = useState<string>();
	const [nextMaintenanceDate, setNextMaintenanceDate] = useState<Date | null>();

	const canSave: boolean = !!notes;

	const handlePhotoUpload = (file: File | null) => {
		if (!file) {
			setPhoto(undefined);
			setPhotoUrl(undefined);
			return;
		}

		setPhoto(file);

		const reader = new FileReader();
		reader.onload = (event: ProgressEvent<FileReader>) => {
			setPhotoUrl(String(event.target?.result));
		};
		reader.readAsDataURL(file);
	};

	const [saving, setSaving] = useState<boolean>(false);

	const handleSave = () => {
		setSaving(true);
		onSave({ notes, photo, nextMaintenanceDate })
			.then(() => {
				setNotes('');
				setPhoto(undefined);
				setPhotoUrl(undefined);
				setNextMaintenanceDate(null);
				onClose();
			})
			.finally(() => setSaving(false));
	};

	return (
		<Modal title="Log Maintenance" opened={opened} onClose={onClose}>
			<Stack>
				<Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} required />
				<DateInput
					label="Next Mainenance Date"
					value={nextMaintenanceDate}
					onChange={setNextMaintenanceDate}
					minDate={new Date()}
					popoverProps={{ position: 'right', withinPortal: true }}
					firstDayOfWeek={0}
				/>
				{photoUrl && <Image src={photoUrl} radius="sm" caption={photo?.name} />}
				<FileButton accept="image/png,image/jpeg" onChange={handlePhotoUpload}>
					{(props) => (
						<Button
							variant={!!photo ? 'outline' : 'filled'}
							size="sm"
							leftIcon={<IconPhoto size={20} />}
							{...props}
						>
							{!!photo ? 'Change Image' : 'Upload Image'}
						</Button>
					)}
				</FileButton>
				<Flex justify="flex-end">
					<Group>
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button variant="filled" onClick={handleSave} loading={saving} disabled={!canSave}>
							Save
						</Button>
					</Group>
				</Flex>
			</Stack>
		</Modal>
	);
}
