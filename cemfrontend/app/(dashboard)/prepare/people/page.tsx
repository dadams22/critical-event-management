'use client';

import { Center, Space, Title } from '@mantine/core';
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
	const rows = data.map((item) => (
		<tr key={item.phone}>
			<td>
				<Group spacing="sm">
					<Avatar size={30} radius={30}>
						{item.first_name.charAt(0)}
						{item.last_name.charAt(0)}
					</Avatar>
					<Text fz="sm" fw={500}>
						{item.first_name} {item.last_name}
					</Text>
				</Group>
			</td>

			<td>
				<Badge
					color={jobColors[item.role.toLowerCase()]}
					variant={theme.colorScheme === 'dark' ? 'light' : 'outline'}
				>
					{item.role}
				</Badge>
			</td>
			<td>
				<Text fz="sm" c="dimmed">
					{item.phone}
				</Text>
			</td>
			<td>
				<Group spacing={0} position="right">
					{/* <ActionIcon>
						<IconPencil size="1rem" stroke={1.5} />
					</ActionIcon> */}
					<ActionIcon color="red">
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
					<Table sx={{ minWidth: 800 }} verticalSpacing="sm">
						<thead>
							<tr>
								<th>Name</th>
								<th>Role</th>
								<th>Phone</th>
								<th />
							</tr>
						</thead>
						<tbody>{rows}</tbody>
					</Table>
				</ScrollArea>
			</Center>
		</>
	);
}
