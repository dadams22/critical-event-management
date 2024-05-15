'use client';

import { useState } from 'react';

import {
  createStyles,
  Button,
  Center,
  Flex,
  Loader,
  Title,
  TextInput,
  Table,
  Text,
  useMantineTheme,
  Stack,
  Group,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import useSWR from 'swr';
import Api from '../../../../api/Api';
import { getAssetIcon } from '../../../(icons)/assetTypes';
import IconSelector from '../../../(icons)/AssetIconSelector';

const useStyles = createStyles((theme) => ({
  inlineForm: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
  },

  iconColumn: {
    width: '80px',
  },
}));

export default function AssetTypesPage() {
  const { classes, cx } = useStyles();

  const { data: assetTypes, isLoading, mutate } = useSWR('assetTypes/all', Api.getAssetTypes);

  const [adding, setAdding] = useState(false);

  const [saving, setSaving] = useState<boolean>(false);
  const [newAssetTypeName, setNewAssetTypeName] = useState<string>('');
  const [newAssetIconIdentifier, setNewAssetIconIdentifier] = useState<string | undefined>(
    undefined
  );

  const handleSave = () => {
    if (!newAssetTypeName || !newAssetIconIdentifier) {
      return;
    }
    setSaving(true);

    Api.createAssetType({ name: newAssetTypeName, iconIdentifier: newAssetIconIdentifier })
      .then(() => {
        setNewAssetTypeName('');
        setNewAssetIconIdentifier('');
        setAdding(false);
        mutate();
      })
      .finally(() => setSaving(false));
  };

  return (
    <>
      <Title order={2}>Asset Types</Title>
      <Text c="dimmed">Configure common asset types to track asset locations and maintenance.</Text>
      {isLoading ? (
        <Center my="xl">
          <Loader />
        </Center>
      ) : (
        <Center>
          <Stack w={800}>
            <Flex maw={800}>
              <Button
                disabled={adding}
                leftIcon={<IconPlus size={20} />}
                onClick={() => setAdding(true)}
              >
                Add Asset Type
              </Button>
            </Flex>
            <Table sx={{ maxWidth: 800 }} verticalSpacing="sm">
              <thead>
                <tr>
                  <th className={classes.iconColumn}>Icon</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {adding && (
                  <tr className={cx(classes.inlineForm)}>
                    <td className={classes.iconColumn}>
                      <IconSelector
                        iconIdentifier={newAssetIconIdentifier}
                        onIconSelected={setNewAssetIconIdentifier}
                      />
                    </td>
                    <td>
                      <Group>
                        <TextInput
                          placeholder="Asset Type Name"
                          required
                          disabled={saving}
                          value={newAssetTypeName}
                          onChange={(e) => setNewAssetTypeName(e.target.value)}
                          autoFocus
                          style={{ flex: 2 }}
                        />
                        <Button
                          variant="outline"
                          disabled={saving}
                          onClick={() => setAdding(false)}
                        >
                          Cancel
                        </Button>
                        <Button loading={saving} onClick={handleSave}>
                          Save
                        </Button>
                      </Group>
                    </td>
                  </tr>
                )}
                {(assetTypes || []).map((assetType) => (
                  <tr key={assetType.id}>
                    <td className={classes.iconColumn}>
                      <Flex align="center">{getAssetIcon(assetType.icon_identifier)}</Flex>
                    </td>
                    <td>{assetType.name}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Stack>
        </Center>
      )}
    </>
  );
}
