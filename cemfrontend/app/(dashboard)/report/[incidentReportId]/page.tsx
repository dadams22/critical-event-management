'use client';
import { Title } from "@mantine/core";
import useSWR from 'swr';
import Api from "../../../../api/Api";

interface ComponentProps {
    params: {
        incidentReportId: string;
    }
}

export default function IncidentReportPage({ params: { incidentReportId } }: ComponentProps) {
    const { data: incident_report, error } = useSWR(`incident/${incidentReportId}`, () => Api.getIncidentReport(incidentReportId));
    
    if (error) return <div>Error loading data</div>;
    if (!incident_report) return <div>Loading...</div>;

    const { reporter } = incident_report;

    return (
        <div>
            <Title order={2}>Active Incident</Title>
            <Title order={5}>Reported by {reporter.first_name} {reporter.last_name}</Title>
        </div>
    );
}