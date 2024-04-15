'use client';
import React from 'react';
import { Autocomplete, Button, Flex, Group, Modal, Stack, Stepper, TextInput } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Api from '../../../../api/Api';
import { Person } from '../../../../api/types';
import { AddressAutofillCore, AddressAutofillSuggestion, SessionToken } from '@mapbox/search-js-core';
import _ from 'lodash';
import AddressField from '../../../../components/AddressField';
import MapView from '../../report/[incidentReportId]/MapView';
import { useCounter } from '@mantine/hooks';

interface ComponentProps {
	opened: boolean;
	onClose: () => void;
}

export default function CreateSiteModal({ opened, onClose }: ComponentProps) {
	const [saving, setSaving] = useState<boolean>(false);
	const [siteName, setSiteName] = useState<string>('');
	const [address, setAddress] = useState<AddressAutofillSuggestion>();

	const [step, stepHandlers] = useCounter(0, { min: 0, max: 3 });

	const nextDisabled = useMemo(() => {
		if (step === 0) return !!siteName && !!address;

		return false;
	}, [step, siteName, address]);

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
							<AddressField value={address?.full_address} onSelectAddress={setAddress} />
						</Stack>
					</Stepper.Step>
					<Stepper.Step label="Define Site Bounds">
						{/* <MapView location={{ latitude: addres, longitude}} /> */}
					</Stepper.Step>
					<Stepper.Step label="Add Floor Plans">

					</Stepper.Step>
				</Stepper>
				<Flex justify="flex-end">
					<Group>
						<Button variant="outline" onClick={stepHandlers.decrement} disabled={step === 0}>
							Previous
						</Button>
						<Button variant='filled' onClick={stepHandlers.increment}>
							{step === 3 ? 'Save' : 'Next'}
						</Button>
					</Group>
				</Flex>
			</Stack>
		</Modal>
	);
}
