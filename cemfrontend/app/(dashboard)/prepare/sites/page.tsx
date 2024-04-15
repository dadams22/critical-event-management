'use client';

import { Title, Text, Button, Flex } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons';
import { ModalNames } from '../../../(modals)';
import CreateSiteModal from './CreateSiteModal';
import { useDisclosure } from '@mantine/hooks';

export default function SitesPage() {
	const [createSiteModalOpened, { open: openCreateSiteModal, close: closeCreateSiteModal }] = useDisclosure();

	return (
		<>
			<Title order={2}>Sites</Title>
			<Text c="dimmed">Create and manage sites.</Text>
			<Flex><Button leftIcon={<IconPlus size={20} />} onClick={openCreateSiteModal}>Create Site</Button></Flex>
			<CreateSiteModal opened={createSiteModalOpened} onClose={closeCreateSiteModal} />
		</>
	);
}
