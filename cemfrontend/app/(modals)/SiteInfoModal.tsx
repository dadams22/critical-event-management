'use client';

import { Button, Flex, Group, Stack, TextInput } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import React, { useState } from 'react';
import Api from '../../api/Api';
import { Person } from '../../api/types';
import { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import AddressField from '../../components/AddressField';

interface ComponentProps {
  doneCallback: (siteInfo: { name: string; address: AddressAutofillRetrieveResponse }) => void;
}

export default function SiteInfoModal({
  innerProps: { doneCallback },
  context,
  id,
}: ContextModalProps<ComponentProps>) {
  const [siteName, setSiteName] = useState<string>('');
  const [address, setAddress] = useState<AddressAutofillRetrieveResponse>();

  const canSubmit = !!siteName && !!address;
  const handleSubmit = () => {
    if (!canSubmit) return;
    doneCallback({ name: siteName, address });
    context.closeModal(id);
  };

  return (
    <Stack>
      <TextInput
        label="Site Name"
        required
        value={siteName}
        onChange={(e) => setSiteName(e.target.value)}
      />
      <AddressField
        value={address?.features?.[0]?.properties?.full_address}
        onSelectAddress={setAddress}
      />
      <Flex justify="flex-end">
        <Button disabled={!canSubmit} onClick={handleSubmit}>
          Submit
        </Button>
      </Flex>
    </Stack>
  );
}
