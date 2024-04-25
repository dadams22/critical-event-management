'use client';

import { Paper, Stack, TextInput, Title } from "@mantine/core";
import { useState } from "react";

interface ComponentProps {

}

export default function AddAssetForm({}: ComponentProps) {
    const [name, setName] = useState<string>('');

    return (
        <Paper shadow="sm" p="md">
            <Stack>
                <Title order={4}>
                    Add Asset Information
                </Title>
                <TextInput label="Asset Name" value={name} onChange={(e) => setName(e.target.value)} />
            </Stack>
        </Paper>
    );
}
