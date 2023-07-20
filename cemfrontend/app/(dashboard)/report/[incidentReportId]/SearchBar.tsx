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
import { Person, PersonStatus } from '../../../../api/types';

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

interface ComponentProps {
    people: Person[];
    statusByPerson: { [personId: string]: PersonStatus };
}

export default function SearchBar({ people, statusByPerson }: ComponentProps) {
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

	const handleFocus = () => setMenuOpen(true);
	const handleBlur = () => setMenuOpen(false);

    const searchResults = people.filter(
        (person) => !!searchValue && `${person.first_name} ${person.last_name}`.toLowerCase().includes(searchValue.toLowerCase())
    ).slice(0, 5);

	return (
		<Box w={400} pos="relative">
			<Input
				w={400}
				icon={<IconSearch size={16} />}
				placeholder="Search..."
				opacity={0.8}
				onFocus={handleFocus}
				onBlur={handleBlur}
                value={searchValue}
                onChange={handleSearchChange}
			/>
			{menuOpen && (
				<Box pos="absolute" top="100%" left={0} right={0}>
					<Space h="xs" />
					<Paper shadow="sm">
						<Stack spacing={0}>
							{searchResults.map(({ id, first_name, last_name }) => {
								const status: Status = statusByPerson[id] === undefined ? 'awaiting' : statusByPerson[id] ? 'safe' : 'help';
                                const { label, color } = STATUS_CONFIG[status];
								return (
									<Flex dir="row" justify="space-between" align="center" px="sm" py="xs">
										<Text fz="sm" fw={500} transform='capitalize'>
											{first_name} {last_name}
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
