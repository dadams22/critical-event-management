'use client';
import { useState } from 'react';
import { Button, Flex, SimpleGrid, Title, Center, Text, Space } from "@mantine/core";
import { IconExclamationMark, IconFiretruck, IconStorm, IconTornado, IconUrgent } from "@tabler/icons";
import Api from '../../../api/Api';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);
    const handleReportIncident = () => {
        setLoading(true);
        Api.reportIncident()
            .then((incident_report) => {
                router.push(`/report/${incident_report.id}`);
            })
            .finally(() => setLoading(false));
    }

    return (
        <Flex h="100%" direction="column" justify="center" align="center">
            <Title order={2}>Experiencing an emergency?</Title>
            <Space h="sm" />
            <Text c="dimmed">Report an emergency in a single click.</Text>
            <Space h="xl" />
            <Button 
                onClick={handleReportIncident}
                loading={loading}
                size="lg" 
                color="red" 
                leftIcon={<IconUrgent />} 
            >
                Report Emergency
            </Button>
        </Flex>
    );
}
