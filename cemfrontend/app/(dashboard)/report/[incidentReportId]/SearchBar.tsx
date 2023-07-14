'use client';

import {
	Badge,
	Box,
	Flex,
	Group,
	Input,
	MantineColor,
	Menu,
	Paper,
	Space,
	Stack,
	Text,
} from '@mantine/core';
import { useToggle } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons';
import { useState } from 'react';

type Status = 'safe' | 'awaiting' | 'help';

const STATUS_CONFIG: Record<Status, { label: string; color: MantineColor }> = {
	safe: {
		label: 'Safe',
		color: 'green',
	},
	awaiting: {
		label: 'Awaiting',
		color: 'yellow',
	},
	help: {
		label: 'Needs Help',
		color: 'red',
	},
};

const searchResults: { name: string; status: Status }[] = [
	{ name: 'Avid Dadams', status: 'safe' },
	{ name: 'Rahul Ramakrishnan', status: 'awaiting' },
	{ name: 'Sharoni Macaroni', status: 'help' },
];

interface ComponentProps {}

export default function SearchBar({}: ComponentProps) {
	const [menuOpen, setMenuOpen] = useState<boolean>(false);

	const handleFocus = () => setMenuOpen(true);
	const handleBlur = () => setMenuOpen(false);

	return (
		<Box w={400} pos="relative">
			<Input
				w={400}
				icon={<IconSearch size={16} />}
				placeholder="Search..."
				opacity={0.8}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>
			{menuOpen && (
				<Box pos="absolute" top="100%" left={0} right={0}>
					<Space h="xs" />
					<Paper shadow="sm">
						<Stack spacing={0}>
							{searchResults.map(({ name, status }) => {
								const { label, color } = STATUS_CONFIG[status];
								return (
									<Flex dir="row" justify="space-between" align="center" px="sm" py="xs">
										<Text fz="sm" fw={500}>
											{name}
										</Text>
										<Badge color={color}>{label}</Badge>
									</Flex>
								);
							})}
						</Stack>
					</Paper>
				</Box>
			)}
		</Box>
	);
}
