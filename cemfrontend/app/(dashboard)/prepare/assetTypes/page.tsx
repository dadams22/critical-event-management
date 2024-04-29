'use client';

import { Title, Text, } from "@mantine/core";

export default function AssetTypesPage() {
    return (
        <>
            <Title order={2}>
                Asset Types
            </Title>
            <Text c="dimmed">
				Configure common asset types to track asset locations and maintenance.
			</Text>
        </>
    )
}