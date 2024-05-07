'use client';

import { Button, Flex, Group, Stack, TextInput } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useState } from 'react';
import Api from '../../api/Api';
import { Person } from '../../api/types';

interface ComponentProps {
  doneCallback: (person: Person) => void;
}

export default function AddPersonModal({
  innerProps: { doneCallback },
  context,
  id,
}: ContextModalProps<ComponentProps>) {
  const [saving, setSaving] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const handleSave = () => {
    setSaving(true);
    Api.createPerson({ firstName, lastName, phone })
      .then((person) => {
        doneCallback(person);
        context.closeModal(id);
      })
      .finally(() => setSaving(false));
  };

  return (
    <Stack>
      <Group w="100%" grow>
        <TextInput
          label="First Name"
          required
          disabled={saving}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextInput
          label="Last Name"
          required
          disabled={saving}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </Group>
      <TextInput
        label="Phone"
        required
        disabled={saving}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Flex justify="flex-end">
        <Button loading={saving} onClick={handleSave}>
          Save
        </Button>
      </Flex>
    </Stack>
  );
}
