'use client';

import { useState } from 'react';

import { Button, Center, Flex, Loader, Title, TextInput, Table, Text, useMantineTheme  } from '@mantine/core';
import { IconUserPlus } from '@tabler/icons-react';
import useSWR from 'swr';
import Api from '../../../../api/Api';
import { getIcon } from '../../../(icons)/assetTypes';;

export default function AssetTypesPage() {
    const theme = useMantineTheme();

    const { data: assetTypes, isLoading, mutate } = useSWR('/asset_types', Api.getAssetTypes);

    const [ adding, setAdding ] = useState(false);

    const [saving, setSaving] = useState<boolean>(false);
	const [newAssetTypeName, setNewAssetTypeName] = useState<string>('');
	const [newAssetIconIdentifier, setNewAssetIconIdentifier] = useState<string | undefined>(undefined);

    const handleSave = () => {
        if (!newAssetTypeName || !newAssetIconIdentifier) {
            return;
        }
        setSaving(true);

        Api
            .createAssetType({ name: newAssetTypeName, iconIdentifier: newAssetIconIdentifier })
            .then(() => {
                setNewAssetTypeName('');
                setNewAssetIconIdentifier('');
                setAdding(false);
                mutate();
            })
            .finally(() => setSaving(false));
        }

    return (
        <>
            <Title order={2}>
                Asset Types
            </Title>
            <Text c="dimmed">
				Configure common asset types to track asset locations and maintenance.
			</Text>
            {isLoading ? (
                <Center my="xl">
                    <Loader />
                </Center>
            ) : (
                <>
                    <Flex maw={800} justify="flex-end">
                        <Button disabled={adding} leftIcon={<IconUserPlus size={20} />} onClick={() => setAdding(true)}>
                            Add Asset Type
                        </Button>
                    </Flex>
                    <Table sx={{ minWidth: 800 }} verticalSpacing="sm">
                        <thead>
                            <tr>
                                <th>Icon</th>
                                <th>Name</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {adding && (
                                <tr>
                                    <td>
                                        <TextInput
                                            placeholder='Icon Identifier'
                                            required
                                            disabled={saving}
                                            value={newAssetIconIdentifier}
                                            onChange={(e) => setNewAssetIconIdentifier(e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <TextInput
                                            placeholder='Asset Type Name'
                                            required
                                            disabled={saving}
                                            value={newAssetTypeName}
                                            onChange={(e) => setNewAssetTypeName(e.target.value)}
                                            autoFocus={true}
                                        />
                                    </td>
                                    <td>
                                        <Button disabled={saving} onClick={handleSave}>
                                            Save
                                        </Button>
                                    </td>
                                </tr>
                            )}
                            {(assetTypes || []).map((assetType) => (
                                <tr key={assetType.id}>
                                    <td>{ getIcon(assetType.icon_identifier) }</td>
                                    <td>{assetType.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}
        </>
    )
}