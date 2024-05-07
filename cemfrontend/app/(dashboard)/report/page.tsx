'use client';
import { useEffect, useState } from 'react';
import { Button, Flex, Title, Text, Space } from '@mantine/core';
import { IconUrgent } from '@tabler/icons-react';
import Api from '../../../api/Api';
import { useRouter } from 'next/navigation';
import { Location } from '../../../api/types';
import useSWR from 'swr';

export default function ReportPage() {
	const router = useRouter();

	const [location, setLocation] = useState<Location | undefined>();

	const getLocation = () => {
		navigator.geolocation.getCurrentPosition((position) => {
			setLocation({
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			});
		});
	};

	useEffect(() => {
		getLocation();
	}, []);

	const [loading, setLoading] = useState<boolean>(false);
	const handleReportIncident = () => {
		setLoading(true);
		Api.reportIncident({ location })
			.then((incident_report) => {
				router.push(`/report/${incident_report.id}`);
			})
			.finally(() => setLoading(false));
	};

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
				color="blue"
				leftIcon={<IconUrgent />}
			>
				Report Incident
			</Button>
			<Space h="sm" />
			{location && (
				<Text size="xs" c="dimmed">
					Location: {location.latitude}, {location.longitude}
				</Text>
			)}
		</Flex>
	);
}
