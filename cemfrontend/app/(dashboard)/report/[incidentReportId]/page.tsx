'use client';
import { Center, Loader, Space, Title, Text, Timeline } from "@mantine/core";
import useSWR from 'swr';
import Api from "../../../../api/Api";
import MapView from "./MapView";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { ImpactedIndividualsStats } from "./ImpactedIndividualsStats";

dayjs.extend(relativeTime);

interface ComponentProps {
    params: {
        incidentReportId: string;
    }
}

export default function IncidentReportPage({ params: { incidentReportId } }: ComponentProps) {
    const { data: incident_report, error } = useSWR(`incident/${incidentReportId}`, () => Api.getIncidentReport(incidentReportId));

    console.log(incident_report);
    
    if (error) return <div>Error loading data</div>;
    if (!incident_report) return (
        <Center h="100%">
            <Loader variant="bars" />
        </Center>
    );

    const { reporter, location, created_at } = incident_report;

    const incidentTime = dayjs(created_at);

    return (
        <div>
            <Title order={2}>Active Incident</Title>
            <Space h="lg" />
            {location && <MapView location={location} />}
            <Space h="xl" />
            <ImpactedIndividualsStats />
            <Space h='xl' />
            <Center>
                <Timeline active={1} bulletSize={24} lineWidth={2}>
                    <Timeline.Item title="Incident Reported">
                        <Text color="dimmed" size="sm">{reporter.first_name} {reporter.last_name} reported an incident.</Text>
                        <Text size="xs" mt={4}>{incidentTime.format('HH:MM A')} ({incidentTime.fromNow()})</Text>
                    </Timeline.Item>
                </Timeline>
            </Center>
        </div>
    );
}