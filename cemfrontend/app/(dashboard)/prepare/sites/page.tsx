'use client';

import { Title, Text, Button, Flex } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons';
import { ModalNames } from '../../../(modals)';

export default function SitesPage() {
	const handleClickCreateSite = () => {
		modals.openContextModal({
			modal: ModalNames.CreateSite,
			title: 'Create Site',
			innerProps: {},
		});
	};

	return (
		<>
			<Title order={2}>Sites</Title>
			<Text c="dimmed">Create and manage sites.</Text>
			<Flex><Button leftIcon={<IconPlus size={20} />} onClick={handleClickCreateSite}>Create Site</Button></Flex>
		</>
	);
}
