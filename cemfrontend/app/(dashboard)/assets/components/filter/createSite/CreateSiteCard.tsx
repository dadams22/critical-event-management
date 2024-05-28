import {
  Button,
  Card,
  Flex,
  Group,
  Input,
  Menu,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useState } from 'react';
import AddressField from '../../../../../../components/AddressField';
import { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import { IconCheck, IconPolygon } from '@tabler/icons-react';
import Label = Menu.Label;
import { Bounds } from '../../../../../../api/types';

interface ComponentProps {
  address?: AddressAutofillRetrieveResponse;
  onSelectAddress: (address: AddressAutofillRetrieveResponse) => void;
  bounds?: Bounds;
  onSave: (siteInfo: {
    name: string;
    address: AddressAutofillRetrieveResponse;
    bounds: Bounds;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function CreateSiteCard({
  address,
  onSelectAddress,
  bounds,
  onSave,
  onCancel,
}: ComponentProps) {
  const theme = useMantineTheme();

  const [name, setName] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const disableSave: boolean = !name || !address || !bounds;
  const handleSave = () => {
    if (disableSave) return;
    setSaving(true);
    onSave({ name, bounds: bounds!, address: address! }).finally(() => setSaving(false));
  };

  return (
    <Card withBorder shadow="md" p="md">
      <Stack>
        <Title order={4}>Create a New Site</Title>
        <TextInput label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <AddressField onSelectAddress={onSelectAddress} />
        <Flex justify="center" align="center" gap={4}>
          {!bounds ? (
            <>
              <IconPolygon size={24} color={theme.colors.blue[6]} />
              <Text fz="sm">Click the map to draw your site bounds.</Text>
            </>
          ) : (
            <>
              <IconCheck size={24} color={theme.colors.blue[6]} />
              <Text fz="sm">Site bounds selected.</Text>
            </>
          )}
          <Input.Label required />
        </Flex>
        <Flex justify="flex-end">
          <Group>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button disabled={disableSave} onClick={handleSave} loading={saving}>
              Save
            </Button>
          </Group>
        </Flex>
      </Stack>
    </Card>
  );
}
