'use client';
import {
	Center,
	Loader,
	Space,
	Title,
	Text,
	Timeline,
	Grid,
	Card,
	Group,
	ActionIcon,
	HoverCard,
	Button,
	useMantineTheme,
} from '@mantine/core';
import useSWR from 'swr';
import Api from '../../../../api/Api';
import MapView from './MapView';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ImpactedIndividualsStats } from './ImpactedIndividualsStats';
import styled from '@emotion/styled';
import SearchBar from './SearchBar';
import { IconAlarm, IconCheck, IconSpeakerphone, IconUrgent } from '@tabler/icons';
import { modals } from '@mantine/modals';
import { ModalNames } from '../../../(modals)';
import { Alert } from '../../../../api/types';
import { produce } from 'immer';
import _ from 'lodash';

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
	grid-template-areas: 'sidebar actions' 'sidebar .' 'sidebar footer';
	grid-template-columns: 300px 1fr;
	grid-template-rows: min-content 1fr min-content;
	gap: 10px;

	pointer-events: none;

	& > * {
		pointer-events: all;
	}
`;

const ActionBar = styled.div`
	grid-area: actions;
	width: 100%;

	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const SideBar = styled.div`
	grid-area: sidebar;
	overflow-y: auto;
	margin: -16px -10px;
	padding: 16px 10px;
`;

const Footer = styled.div`
	grid-area: footer;
`;

interface ComponentProps {
	params: {
		incidentReportId: string;
	};
}

export default function IncidentReportPage({ params: { incidentReportId } }: ComponentProps) {
	const theme = useMantineTheme();

	const {
		data: incident_report,
		error,
		mutate,
	} = useSWR(`incident/${incidentReportId}`, () => Api.getIncidentReport(incidentReportId), {
		refreshInterval: 2000,
	});

	const { data: people } = useSWR('people', Api.getPeople);

	console.log(people);
	console.log(incident_report);

	if (error) return <div>Error loading data</div>;
	if (!incident_report || !people)
		return (
			<Center h="100%">
				<Loader variant="bars" />
			</Center>
		);

	const { reporter, location, created_at } = incident_report;

	const incidentTime = dayjs(created_at);

	const statusByPerson = _.keyBy(_.sortBy(incident_report.statuses, 'created_at'), 'person');

	const sendAlertCallback = (alert: Alert) => {
		mutate(
			produce((incident_report) => {
				incident_report.alerts.push(alert);
			}, incident_report)
		);
	};

	const handleClickSendAlert = () => {
		modals.openContextModal({
			modal: ModalNames.SendAlert,
			title: 'Send Alert',
			innerProps: {
				incidentId: incidentReportId,
				doneCallback: sendAlertCallback,
			},
		});
	};

	const handleClickResolve = () => {
		const onConfirm = async () => {
			await Api.resolveIncident(incident_report.id);
		};

		modals.openConfirmModal({
			title: 'Resove Incident',
			children: <Text size="sm">Are you sure you want to mark this incident as resolved?</Text>,
			labels: { confirm: 'Mark Resolved', cancel: 'Cancel' },
			confirmProps: { color: 'green', leftIcon: <IconCheck size={20} /> },
			onConfirm,
		});
	};

	return (
		<MapContainer>
			{location && <MapView location={location} />}
			<OverlayGrid>
				<SideBar>
					<Card shadow="sm">
						<Timeline bulletSize={24} lineWidth={2}>
							{incident_report.resolved_at && (
								<Timeline.Item
									key="resolved"
									title="Incident Resolved"
									bullet={<IconCheck size={16} color={theme.colors.green[7]} />}
								>
									<Text size="xs" mt={4}>
										{dayjs(incident_report.resolved_at).format('HH:MM A')} (
										{dayjs(incident_report.resolved_at).fromNow()})
									</Text>
									<Text color="dimmed" size="sm">
										The incident was marked resolved and closed.
									</Text>
								</Timeline.Item>
							)}
							{incident_report.alerts
								.slice()
								.reverse()
								.map((alert) => {
									const alertTime = dayjs(alert.created_at);
									return (
										<Timeline.Item
											key={alert.id}
											title="Alert Sent"
											bullet={<IconSpeakerphone size="16" color={theme.colors.red[7]} />}
										>
											<Text size="xs" mt={4}>
												{alertTime.format('HH:MM A')} ({alertTime.fromNow()})
											</Text>
											<Text color="dimmed" size="sm">
												{alert.sender.first_name} {alert.sender.last_name} sent an alert.
											</Text>
											<Space h="sm" />
											<Text size="sm">{alert.body}</Text>
										</Timeline.Item>
									);
								})}
							<Timeline.Item
								title="Incident Reported"
								bullet={<IconUrgent size="16" color={theme.colors.blue[7]} />}
							>
								<Text size="xs" mt={4}>
									{incidentTime.format('HH:MM A')} ({incidentTime.fromNow()})
								</Text>
								<Text color="dimmed" size="sm">
									{reporter.first_name} {reporter.last_name} reported an incident.
								</Text>
							</Timeline.Item>
						</Timeline>
					</Card>
				</SideBar>
				<ActionBar>
					<div />
					<SearchBar people={people} statusByPerson={statusByPerson} />
					{!incident_report.resolved_at ? (
						<Group>
							<Button
								key="resolve"
								variant="filled"
								color="green"
								leftIcon={<IconCheck size="20" />}
								onClick={handleClickResolve}
							>
								Resolve
							</Button>
							<Button
								key="alert"
								variant="filled"
								color="red"
								leftIcon={<IconSpeakerphone size="20" />}
								onClick={handleClickSendAlert}
							>
								Send Alert
							</Button>
						</Group>
					) : (
						<div />
					)}
				</ActionBar>
				<Footer>
					<ImpactedIndividualsStats people={people} statusByPerson={statusByPerson} />
				</Footer>
			</OverlayGrid>
		</MapContainer>
	);
}
