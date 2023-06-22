'use client';
import { Button, Flex, SimpleGrid, Title, Center, Text, Space } from "@mantine/core";
import { IconExclamationMark, IconFiretruck, IconStorm, IconTornado, IconUrgent } from "@tabler/icons";

export default function ReportPage() {
    return (
        <Flex h="100%" direction="column" justify="center" align="center">
            <Title order={2}>Experiencing an emergency?</Title>
            <Space h="sm" />
            <Text c="dimmed">Report an emergency by clicking the button below.</Text>
            <Space h="xl" />
            <Button size="lg" color="red" leftIcon={<IconUrgent />}>Report Emergency</Button>
        </Flex>
    );
}
