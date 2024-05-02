'use client';

import {
	RingProgress,
	Text,
	SimpleGrid,
	Center,
	Group,
	MantineColor,
	Card,
	useMantineTheme,
} from '@mantine/core';
import { Person, PersonStatus } from '../../../../api/types';
import _ from 'lodash';
import {
	IconQuestionMark,
	IconShieldCheck,
	IconSos,
	IconUsers,
	TablerIcon,
} from '@tabler/icons-react';

interface StatDisplayProps {
	label: string;
	progress: number;
	count: number;
	color: MantineColor;
	Icon: TablerIcon;
}

interface ComponentProps {
	people: Person[];
	statusByPerson: { [personId: string]: PersonStatus };
}

export function ImpactedIndividualsStats({ people, statusByPerson }: ComponentProps) {
	const theme = useMantineTheme();

	const safe = people.filter(
		(person) => statusByPerson[person.id] && statusByPerson[person.id].safe
	);
	const awaiting = people.filter((person) => !statusByPerson[person.id]);
	const needHelp = people.filter(
		(person) => statusByPerson[person.id] && !statusByPerson[person.id].safe
	);

	const data: StatDisplayProps[] = [
		{
			label: 'Impacted',
			progress: 100,
			count: people.length,
			color: 'blue',
			Icon: IconUsers,
		},
		{
			label: 'Safe',
			progress: (safe.length / people.length) * 100,
			count: safe.length,
			color: 'green',
			Icon: IconShieldCheck,
		},
		{
			label: 'Awaiting',
			progress: (awaiting.length / people.length) * 100,
			count: awaiting.length,
			color: 'yellow',
			Icon: IconQuestionMark,
		},
		{
			label: 'Require Help',
			progress: (needHelp.length / people.length) * 100,
			count: needHelp.length,
			color: 'red',
			Icon: IconSos,
		},
	];

	const stats = data.map((stat) => {
		return (
			<Card
				withBorder
				radius="md"
				shadow="sm"
				p="xs"
				key={stat.label}
				style={{ cursor: 'pointer' }}
			>
				<Group>
					<RingProgress
						size={60}
						roundCaps
						thickness={8}
						sections={[{ value: stat.progress, color: stat.color }]}
						label={
							<Center>
								<stat.Icon size="1.4rem" stroke={1.5} color={theme.colors[stat.color][7]} />
							</Center>
						}
					/>

					<div>
						<Text color="dimmed" size="xs" transform="uppercase" weight={700}>
							{stat.label}
						</Text>
						<Text weight={700} size="xl">
							{stat.count}
						</Text>
					</div>
				</Group>
			</Card>
		);
	});

	return (
		<SimpleGrid
			cols={4}
			spacing="sm"
			breakpoints={[
				{ maxWidth: 'sm', cols: 1 },
				{ maxWidth: 'lg', cols: 2 },
			]}
		>
			{stats}
		</SimpleGrid>
	);
}
