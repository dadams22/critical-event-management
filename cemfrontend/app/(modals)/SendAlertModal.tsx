'use client';

import { Button, Stack, Textarea } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconSpeakerphone } from '@tabler/icons';

interface ComponentProps {}

export default function SendAlertModal({}: ContextModalProps<ComponentProps>) {
	return (
		<Stack>
			<Textarea label="Message" placeholder="Message..." withAsterisk />
			<Button color="red" leftIcon={<IconSpeakerphone size={20} />}>
				Send Alert
			</Button>
		</Stack>
	);
}
