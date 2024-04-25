'use client';

import { Button, Flex, Group, Paper, Stack, TextInput, Title } from "@mantine/core";
import { useState } from "react";

interface ComponentProps {
    onCancel: () => void;
}

export default function AddAssetForm({ onCancel }: ComponentProps) {
    const [name, setName] = useState<string>('');

    return (
        <Paper shadow="md" p="md">
            <Stack>
                <Title order={4}>
                    Add Asset Information
                </Title>
                <TextInput label="Asset Name" value={name} onChange={(e) => setName(e.target.value)} />
                <Flex justify="flex-end">
                    <Group>
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button>
                            Save
                        </Button>
                    </Group>
                </Flex>
            </Stack>
        </Paper>
    );
}
