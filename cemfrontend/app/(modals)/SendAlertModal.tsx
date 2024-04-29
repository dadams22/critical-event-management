'use client';

import { Button, Select, SelectItem, Stack, Textarea } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconSpeakerphone } from '@tabler/icons-react';
import { useState } from 'react';
import Api from '../../api/Api';
import { Alert } from '../../api/types';
import _ from 'lodash';

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
	{
		label: 'Lockdown',
		value:
			'LOCKDOWN: A lockdown has been put into place. Please proceed to your assigned classroom and remain silent. Shelter in place until the lockdown has been lifted.',
	},
];

interface ComponentProps {
	incidentId: string;
	doneCallback: (alert: Alert) => void;
}

export default function SendAlertModal({
	innerProps: { incidentId, doneCallback },
	context,
	id,
}: ContextModalProps<ComponentProps>) {
	const [message, setMessage] = useState<string>('');
	const [sending, setSending] = useState<boolean>(false);

	const handleSelectTemplate = (value: string | null) => {
		setMessage(value || '');
	};

	const handleMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(event.target.value);
	};

	const handleClickSendAlert = async () => {
		setSending(true);
		const alert = await Api.sendAlert(incidentId, message);
		setSending(false);
		doneCallback(alert);
		context.closeModal(id);
	};

	return (
		<Stack>
			<Select
				label="Template"
				placeholder="No template selected"
				data={MESSAGE_TEMPLATES}
				disabled={sending}
				onChange={handleSelectTemplate}
			/>
			<Textarea
				label="Message"
				value={message}
				disabled={sending}
				onChange={handleMessageChange}
				placeholder="Message..."
				minRows={5}
				withAsterisk
			/>
			<Button
				color="red"
				leftIcon={<IconSpeakerphone size={20} />}
				loading={sending}
				disabled={!message}
				onClick={handleClickSendAlert}
			>
				Send Alert
			</Button>
		</Stack>
	);
}
