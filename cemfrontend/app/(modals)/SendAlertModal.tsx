'use client';

import { Button, NativeSelect, Select, SelectItem, Stack, Textarea } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconSpeakerphone } from '@tabler/icons';
import { useState } from 'react';

const MESSAGE_TEMPLATES: SelectItem[] = [
	{
		label: 'Fire',
		value:
			'FIRE: A fire has been reported in the building. Please proceed to the nearest exit in an orderly manner.',
	},
	{
		label: 'Tornado',
		value:
			'TORNADO: A tornado warning has been put in place. Please proceed to the first floor and shelter in place. Avoid any windows and use the desks and tables as shelter.',
	},
];

interface ComponentProps {}

export default function SendAlertModal({}: ContextModalProps<ComponentProps>) {
	const [message, setMessage] = useState<string>('');

	const handleSelectTemplate = (value: string | null) => {
		setMessage(value || '');
	};

	const handleMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(event.target.value);
	};

	return (
		<Stack>
			<Select
				label="Template"
				placeholder="No template selected"
				data={MESSAGE_TEMPLATES}
				onChange={handleSelectTemplate}
			/>
			<Textarea
				label="Message"
				value={message}
				onChange={handleMessageChange}
				placeholder="Message..."
				minRows={5}
				withAsterisk
			/>
			<Button color="red" leftIcon={<IconSpeakerphone size={20} />}>
				Send Alert
			</Button>
		</Stack>
	);
}
