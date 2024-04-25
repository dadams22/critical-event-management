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
import _ from 'lodash';
import { IconCheck, IconUrgent, TablerIcon } from '@tabler/icons';
import { IconClockExclamation } from '@tabler/icons-react';

interface StatDisplayProps {
	label: string;
	progress: number;
	count: number;
	color: MantineColor;
	Icon: TablerIcon;
}

interface ComponentProps {}

export function AssetSummary({}: ComponentProps) {
	const theme = useMantineTheme();

	const data: StatDisplayProps[] = [
		{
			label: 'In Compliance',
			progress: 85,
			count: 85,
			color: 'green',
			Icon: IconCheck,
		},
		{
			label: 'Needs Maintenance',
			progress: 10,
			count: 10,
			color: 'yellow',
			Icon: IconClockExclamation,
		},
		{
			label: 'Out of Compliance',
			progress: 5,
			count: 5,
			color: 'red',
			Icon: IconUrgent,
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
			cols={3}
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
