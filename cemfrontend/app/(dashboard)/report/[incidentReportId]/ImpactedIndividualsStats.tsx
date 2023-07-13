import {
	RingProgress,
	Text,
	SimpleGrid,
	Paper,
	Center,
	Group,
	MantineColor,
	Card,
} from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';

interface StatDisplayProps {
	label: string;
	progress: number;
	count: number;
	color: MantineColor;
}

const data: StatDisplayProps[] = [
	{
		label: 'Impacted',
		progress: 100,
		count: 255,
		color: 'blue',
	},
	{
		label: 'Safe',
		progress: 65,
		count: 165,
		color: 'green',
	},
	{
		label: 'Awaiting',
		progress: 23,
		count: 85,
		color: 'yellow',
	},
	{
		label: 'Require Help',
		progress: 2,
		count: 5,
		color: 'red',
	},
];

const icons = {
	up: IconArrowUpRight,
	down: IconArrowDownRight,
};

export function ImpactedIndividualsStats() {
	const stats = data.map((stat) => {
		return (
			<Card
				withBorder
				radius="md"
				shadow="sm"
				p="xs"
				key={stat.label}
				onClick={console.log}
				style={{ cursor: 'pointer' }}
			>
				<Group>
					<RingProgress
						size={60}
						roundCaps
						thickness={8}
						sections={[{ value: stat.progress, color: stat.color }]}
						label={<Center>{/* <Icon size="1.4rem" stroke={1.5} /> */}</Center>}
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
