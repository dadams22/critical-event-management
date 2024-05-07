'use client';

import { Autocomplete, Loader } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  AddressAutofillCore,
  AddressAutofillRetrieveResponse,
  AddressAutofillSuggestion,
  SessionToken,
} from '@mapbox/search-js-core';
import { useEffect, useMemo, useState } from 'react';

interface ComponentProps {
  value?: string;
  onSelectAddress: (address: AddressAutofillRetrieveResponse) => void;
}

export default function AddressField({ value = '', onSelectAddress }: ComponentProps) {
  const [searchValue, setSearchValue] = useState<string>(value);
  const [loading, setLoading] = useState(false);
  const [addressResults, setAddressResults] = useState<AddressAutofillSuggestion[]>([]);

  const [debouncedSearchValue] = useDebouncedValue(searchValue, 300);

  const addressAutofill = useMemo(
    () =>
      new AddressAutofillCore({
        accessToken:
          'pk.eyJ1IjoiZGFkYW1zMjIiLCJhIjoiY2xqd2llczgyMHd4azNkbWhwb2Z6ZTB3YyJ9.VYzIdS2JPHTEW2aHYPONqg',
      }),
    []
  );
  const mapboxSessionToken = useMemo(() => new SessionToken(), []);

  useEffect(() => {
    if (!searchValue) return;

    setLoading(true);
    addressAutofill
      .suggest(searchValue, { sessionToken: mapboxSessionToken })
      .then((response) =>
        setAddressResults(
          response.suggestions.map((suggestion) => ({
            ...suggestion,
            value: suggestion.full_address || '',
          }))
        )
      )
      .finally(() => setLoading(false));
  }, [debouncedSearchValue]);

  const [retrieving, setRetrieving] = useState<boolean>(false);
  const handleSelectAddress = (address: AddressAutofillSuggestion) => {
    setRetrieving(true);
    addressAutofill
      .retrieve(address, { sessionToken: mapboxSessionToken })
      .then(onSelectAddress)
      .finally(() => setRetrieving(false));
  };

  return (
    <Autocomplete
      label="Address"
      data={addressResults}
      value={searchValue}
      onChange={setSearchValue}
      onItemSubmit={handleSelectAddress}
      filter={() => true}
      dropdownPosition="bottom"
      required
      withinPortal
      zIndex={2001}
      rightSection={loading || retrieving ? <Loader size="xs" /> : undefined}
      disabled={retrieving}
    />
  );
}
