'use client';
import React from 'react';
import { Autocomplete, Button, Flex, Group, Modal, Stack, Stepper, TextInput } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Api from '../../../../api/Api';
import { Person } from '../../../../api/types';
import { AddressAutofillCore, SessionToken } from '@mapbox/search-js-core';
import _ from 'lodash';
import AddressField from '../../../../components/AddressField';

interface ComponentProps {
	opened: boolean;
	onClose: () => void;
}

export default function CreateSiteModal({ opened, onClose }: ComponentProps) {
	const [saving, setSaving] = useState<boolean>(false);
	const [siteName, setSiteName] = useState<string>('');
	const [address, setAddress] = useState<string>('');

	const addressAutofill = useMemo(() => new AddressAutofillCore({ accessToken: 'pk.eyJ1IjoiZGFkYW1zMjIiLCJhIjoiY2xqd2llczgyMHd4azNkbWhwb2Z6ZTB3YyJ9.VYzIdS2JPHTEW2aHYPONqg' }), []);
	const mapboxSessionToken = useMemo(() => new SessionToken(), []);
	const [addressResults, setAddressResults] = useState([]);

	// const debouncedAutofillSuggest = useDebouncedCallback(
	// 		(value: string) => addressAutofill.suggest(value, { sessionToken: mapboxSessionToken}), 
	// 		300
	// );

	// useEffect(() => {
	// 	debouncedAutofillSuggest(address).then((response) => setAddressResults(response.suggestions));
	// }, [address])

	const handleSave = () => {
		setSaving(true);
		// Api.createPerson({ firstName, lastName, phone })
		// 	.then((person) => {
		// 		doneCallback(person);
		// 		context.closeModal(id);
		// 	})
		// 	.finally(() => setSaving(false));
	};

	return (
		<Modal opened={opened} onClose={onClose} size="xl" zIndex={2000} centered>
			<Stack>
				<Stepper active={0}>
					<Stepper.Step label="Site Info">
						<Stack align='center'>
							<TextInput
								label="Site Name"
								required
								disabled={saving}
								value={siteName}
								onChange={(e) => setSiteName(e.target.value)}
								size="lg"
							/>
							<AddressField />
							<Flex justify="flex-end">
								<Button loading={saving} onClick={handleSave}>
									Save
								</Button>
							</Flex>
						</Stack>
					</Stepper.Step>
					<Stepper.Step label="Define Site Bounds">
						
					</Stepper.Step>
					<Stepper.Step label="Add Floor Plans">

					</Stepper.Step>
				</Stepper>
			</Stack>
		</Modal>
	);
}
