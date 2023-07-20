'use client';

import { Button, Center, Flex, Loader, Space, Title } from '@mantine/core';
import {
	Avatar,
	Badge,
	Table,
	Group,
	Text,
	ActionIcon,
	Anchor,
	ScrollArea,
	useMantineTheme,
} from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import useSWR from 'swr';
import Api from '../../../../api/Api';
import { IconPlus, IconUserPlus } from '@tabler/icons';
import { modals } from '@mantine/modals';
import { ModalNames } from '../../../(modals)';
import { produce } from 'immer';
import { Person } from '../../../../api/types';
import { useState } from 'react';

const data: { first_name: string; last_name: string; role: string; phone: string }[] = [
	{ first_name: 'David', last_name: 'Adams', role: 'Student', phone: '+1 (860) 817-2974' },
];

const jobColors: Record<string, string> = {
	admin: 'cyan',
	teacher: 'purple',
	student: 'pink',
};

export default function PeoplePage() {
	const theme = useMantineTheme();

	const { data: people, isLoading, mutate } = useSWR('/people', Api.getPeople);

	const handleClickAddPerson = () => {
		modals.openContextModal({
			modal: ModalNames.AddPerson,
			title: 'Add Person',
			innerProps: {
				doneCallback: (person: Person) =>
					mutate(
						produce((people) => {
							people && people.unshift(person);
						}, people)
					),
			},
		});
	};

	const [deletingId, setDeletingId] = useState<string | undefined>();
	const handleDeletePerson = (personId: string) => async () => {
		setDeletingId(deletingId);
		await Api.deletePerson(personId).finally(() => setDeletingId(undefined));
		mutate(people?.filter((person) => person.id !== personId));
	};

	const rows = people?.map((person) => (
		<tr key={person.phone}>
			<td>
				<Group spacing="sm">
					<Avatar size={30} radius={30}>
						{person.first_name.charAt(0)}
						{person.last_name.charAt(0)}
					</Avatar>
					<Text fz="sm" fw={500}>
						{person.first_name} {person.last_name}
					</Text>
				</Group>
			</td>

			{/* <td>
				<Badge
					color={jobColors[item.role.toLowerCase()]}
					variant={theme.colorScheme === 'dark' ? 'light' : 'outline'}
				>
					{item.role}
				</Badge>
			</td> */}
			<td>
				<Text fz="sm" c="dimmed">
					{person.phone}
				</Text>
			</td>
			<td>
				<Group spacing={0} position="right">
					{/* <ActionIcon>
						<IconPencil size="1rem" stroke={1.5} />
					</ActionIcon> */}
					<ActionIcon
						color="red"
						onClick={handleDeletePerson(person.id)}
						loading={deletingId === person.id}
						disabled={!!deletingId}
					>
						<IconTrash size="1rem" stroke={1.5} />
					</ActionIcon>
				</Group>
			</td>
		</tr>
	));

	return (
		<>
			<Title order={2}>People</Title>
			<Text c="dimmed">
				Configure a list of people to notify and monitor in the event of an incident
			</Text>
			<Space h="md" />
			<Center>
				<ScrollArea>
					{isLoading ? (
						<Center my="xl">
							<Loader />
						</Center>
					) : (
						<>
							<Flex maw={800} justify="flex-end">
								<Button leftIcon={<IconUserPlus size={20} />} onClick={handleClickAddPerson}>
									Add Person
								</Button>
							</Flex>
							<Table sx={{ minWidth: 800 }} verticalSpacing="sm">
								<thead>
									<tr>
										<th>Name</th>
										{/* <th>Role</th> */}
										<th>Phone</th>
										<th />
									</tr>
								</thead>
								<tbody>{rows}</tbody>
							</Table>
						</>
					)}
				</ScrollArea>
			</Center>
		</>
	);
}
