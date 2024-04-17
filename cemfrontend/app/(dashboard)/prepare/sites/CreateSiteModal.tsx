'use client';
import React from 'react';
import { Button, Flex, Group, Modal, Stack, Stepper, TextInput } from '@mantine/core';
import { useMemo, useState } from 'react';
import {
	AddressAutofillRetrieveResponse,
} from '@mapbox/search-js-core';
import _ from 'lodash';
import AddressField from '../../../../components/AddressField';
import MapView, { Bounds } from '../../report/[incidentReportId]/MapView';
import { useCounter } from '@mantine/hooks';
import styled from '@emotion/styled';

const MapContainer = styled.div`
	width: 100%;
	height: 400px;
	border-radius: 8px;
	overflow: hidden;
`;

interface ComponentProps {
	opened: boolean;
	onClose: () => void;
}

export default function CreateSiteModal({ opened, onClose }: ComponentProps) {
	const [saving, setSaving] = useState<boolean>(false);
	const [siteName, setSiteName] = useState<string>('');
	const [address, setAddress] = useState<AddressAutofillRetrieveResponse>();
	const [siteBounds, setSiteBounds] = useState<Bounds>();

	console.log(siteBounds);

	const [step, stepHandlers] = useCounter(0, { min: 0, max: 2 });

	const nextDisabled = useMemo(() => {
		if (step === 0) return !siteName || !address;
		if (step === 1) return !siteBounds;

		return false;
	}, [step, siteName, address, siteBounds]);

	return (
		<Modal opened={opened} onClose={onClose} size="xl" zIndex={2000} centered>
			<Stack>
				<Stepper active={step}>
					<Stepper.Step label="Site Info">
						<Stack>
							<TextInput
								label="Site Name"
								required
								disabled={saving}
								value={siteName}
								onChange={(e) => setSiteName(e.target.value)}
							/>
							<AddressField
								value={address?.features?.[0]?.properties?.full_address}
								onSelectAddress={setAddress}
							/>
						</Stack>
					</Stepper.Step>
					<Stepper.Step label="Define Site Bounds">
						{address && (
							<MapContainer>
								<MapView
									location={{
										longitude: address.features?.[0]?.geometry?.coordinates?.[0],
										latitude: address.features?.[0]?.geometry?.coordinates?.[1],
									}}
									onUpdateBounds={setSiteBounds}
									polygons={siteBounds ? [siteBounds] : undefined}
								/>
							</MapContainer>
						)}
					</Stepper.Step>
					<Stepper.Step label="Add Floor Plans">
						{address && (
							<MapContainer>
								<MapView
									key="new"
									location={{
										longitude: address.features?.[0]?.geometry?.coordinates?.[0],
										latitude: address.features?.[0]?.geometry?.coordinates?.[1],
									}}
									polygons={siteBounds ? [siteBounds] : undefined}
								/>
							</MapContainer>
						)}
					</Stepper.Step>
				</Stepper>
				<Flex justify="flex-end">
					<Group>
						<Button variant="outline" onClick={stepHandlers.decrement} disabled={step === 0}>
							Previous
						</Button>
						<Button variant="filled" onClick={stepHandlers.increment} disabled={nextDisabled}>
							{step === 2 ? 'Save' : 'Next'}
						</Button>
					</Group>
				</Flex>
			</Stack>
		</Modal>
	);
}
