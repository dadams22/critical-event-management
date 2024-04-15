'use client';

import { Autocomplete, Button, Flex, Group, Stack, TextInput } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Api from '../../api/Api';
import { Person } from '../../api/types';
import { AddressAutofillCore, SessionToken } from '@mapbox/search-js-core';
import _ from 'lodash';
import AddressField from '../../components/AddressField';

interface ComponentProps {
	// doneCallback: (person: Person) => void;
}

export default function CreateSiteModal({
	// innerProps: { doneCallback },
	context,
	id,
}: ContextModalProps<ComponentProps>) {
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
		<Stack>
			<TextInput
				label="Site Name"
				required
				disabled={saving}
				value={siteName}
				onChange={(e) => setSiteName(e.target.value)}
			/>
			<AddressField />
            <Autocomplete
				label="Address"
				data={[]}
				required
				disabled={saving}
				value={address}
				onChange={setAddress}
			/>
			<Flex justify="flex-end">
				<Button loading={saving} onClick={handleSave}>
					Save
				</Button>
			</Flex>
		</Stack>
	);
}
