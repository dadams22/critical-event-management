'use client';
import { Center, Loader, Space, Title, Text, Timeline, Grid, Card } from "@mantine/core";
import useSWR from 'swr';
import Api from "../../../../api/Api";
import MapView from "./MapView";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { ImpactedIndividualsStats } from "./ImpactedIndividualsStats";
import styled from "@emotion/styled";
import SearchBar from "./SearchBar";

dayjs.extend(relativeTime);

const MapContainer = styled.div`
    position: relative;
    height: 0;
    min-height: 100%;
    width: 100%;
`;

const OverlayGrid = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    padding: 16px;

    display: grid;
    grid-template-areas: 'sidebar search' 'sidebar .' 'sidebar footer';
    grid-template-columns: 300px 1fr;
    grid-template-rows: min-content 1fr min-content;
    gap: 10px;

    pointer-events: none;

    & > * {
        pointer-events: all;
    }
`;

const SideBar = styled.div`
    grid-area: sidebar;
`;

const Search = styled.div`
    grid-area: search;

    display: flex;
    justify-content: center;
`

const Footer = styled.div`
    grid-area: footer;
`;

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
        <MapContainer>
            {location && <MapView location={location} />}
            <OverlayGrid>
                <SideBar>
                    <Card shadow="sm">
                        <Timeline active={1} bulletSize={24} lineWidth={2}>
                            <Timeline.Item title="Incident Reported">
                                <Text color="dimmed" size="sm">{reporter.first_name} {reporter.last_name} reported an incident.</Text>
                                <Text size="xs" mt={4}>{incidentTime.format('HH:MM A')} ({incidentTime.fromNow()})</Text>
                            </Timeline.Item>
                        </Timeline>
                    </Card>
                </SideBar>
                <Search>
                    <SearchBar />
                </Search>
                <Footer>
                    <ImpactedIndividualsStats />
                </Footer>
            </OverlayGrid>
        </MapContainer>
    );
}