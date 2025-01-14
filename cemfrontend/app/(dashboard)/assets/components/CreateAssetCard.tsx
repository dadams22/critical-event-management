'use client';

import {
  Autocomplete,
  Button,
  Card,
  FileButton,
  Flex,
  Group,
  Image,
  Input,
  Paper,
  Select,
  SelectItem,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { IconCheck, IconClick, IconCrosshair, IconPhoto, IconSelector } from '@tabler/icons-react';
import { forwardRef, useState } from 'react';
import { DateInput } from '@mantine/dates';
import { AssetType, MinimalUser, Site } from '../../../../api/types';
import { getAssetIcon } from '../../../(icons)/assetTypes';
import Api from '../../../../api/Api';

interface ComponentProps {
  onSave: (assetInfo: {
    name: string;
    assetType: string;
    photo?: File;
    nextMaintenanceDate: Date;
    managedBy?: string;
  }) => Promise<void>;
  onCancel: () => void;
  locationSelected: boolean;
  assetTypes: AssetType[];
  users: MinimalUser[];
  sites: Site[];
  siteId?: string;
  buildingId?: string;
  floorId?: string;
  updateLocation: (location: { site?: string; building?: string; floor?: string }) => void;
}

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  value: string;
  label: string;
  icon_identifier: string;
}

const AssetTypeSelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ icon_identifier, label, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap align="center">
        {getAssetIcon(icon_identifier)}
        <div>
          <Text size="sm">{label}</Text>
        </div>
      </Group>
    </div>
  )
);

export default function CreateAssetCard({
  onSave,
  onCancel,
  locationSelected,
  assetTypes,
  users,
  sites,
  siteId,
  buildingId,
  floorId,
  updateLocation,
}: ComponentProps) {
  const theme = useMantineTheme();

  const [name, setName] = useState<string>('');
  const [assetType, setAssetType] = useState<string | null>();
  const [assetImage, setAssetImage] = useState<File>();
  const [assetImageUrl, setAssetImageUrl] = useState<string>();
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState<Date | null>();
  const [managerId, setManagerId] = useState<string | null>();

  const handleImageUpload = (file: File | null) => {
    if (!file) {
      setAssetImage(undefined);
      setAssetImageUrl(undefined);
      return;
    }

    setAssetImage(file);

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      setAssetImageUrl(String(event.target?.result));
    };
    reader.readAsDataURL(file);
  };

  const siteOptions: SelectItem[] = sites.map((site) => ({
    label: site.name,
    value: String(site.id),
  }));
  const selectedSite = sites.find((site) => String(site.id) === siteId);
  const handleSelectSite = (selectedSiteId: string) => {
    if (selectedSiteId === siteId) return;
    updateLocation({ site: selectedSiteId, building: undefined, floor: undefined });
  };

  const buildingOptions: SelectItem[] = selectedSite
    ? selectedSite.buildings.map((building) => ({
        label: building.name,
        value: String(building.id),
      }))
    : [];
  const selectedBuilding = selectedSite?.buildings?.find(
    (building) => String(building.id) === buildingId
  );
  const handleSelectBuilding = (selectedBuildingId: string) => {
    if (selectedBuildingId === buildingId) return;
    const newlySelectedBuilding = selectedSite?.buildings.find(
      (building) => String(building.id) === buildingId
    );
    updateLocation({
      building: selectedBuildingId,
      floor:
        newlySelectedBuilding?.floors?.length === 1
          ? String(newlySelectedBuilding.floors[0].id)
          : undefined,
    });
  };

  const floorOptions: SelectItem[] = selectedBuilding
    ? selectedBuilding.floors.map((floor) => ({
        label: floor.name,
        value: String(floor.id),
      }))
    : [];
  const handleSelectFloor = (selectedFloorId: string) => {
    if (selectedFloorId === floorId) return;
    updateLocation({ floor: selectedFloorId });
  };

  const assetTypeOptions: ItemProps[] = assetTypes.map(({ name, icon_identifier, id }) => ({
    value: id,
    label: name,
    icon_identifier,
  }));

  const userOptions: SelectItem[] = users.map((user) => ({
    value: user.id,
    label:
      !user.first_name && !user.last_name ? user.email : `${user.first_name} ${user.last_name}`,
  }));

  const [saving, setSaving] = useState<boolean>(false);
  const disableSave: boolean = !name || !locationSelected || !assetType || !nextMaintenanceDate;
  const handleSave = () => {
    if (disableSave) return;
    setSaving(true);
    onSave({
      name,
      assetType: assetType!,
      photo: assetImage,
      nextMaintenanceDate: nextMaintenanceDate!,
      managedBy: managerId || undefined,
    }).finally(() => setSaving(false));
  };

  return (
    <Card withBorder shadow="md" p="md">
      <Stack>
        <Title order={4}>Create a New Asset</Title>
        <Flex justify="center" align="center" gap={4}>
          {locationSelected ? (
            <>
              <IconCheck size={20} color={theme.colors.blue[8]} />
              <Text size="sm">Location selected.</Text>
            </>
          ) : (
            <>
              <IconClick size={20} />
              <Text size="sm">
                Click the map to select a location.
                <Input.Label required />
              </Text>
            </>
          )}
        </Flex>
        <TextInput
          label="Asset Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Select
          label="Site"
          data={siteOptions}
          value={siteId}
          onChange={handleSelectSite}
          required
        />
        <Group w="100%">
          <Select
            label="Building"
            data={buildingOptions}
            value={buildingId}
            onChange={handleSelectBuilding}
            required
            disabled={!selectedSite}
          />
          <Select
            label="Floor"
            data={floorOptions}
            value={floorId}
            required
            onChange={handleSelectFloor}
            disabled={!selectedBuilding}
          />
        </Group>
        <Select
          value={assetType}
          onChange={setAssetType}
          data={assetTypeOptions}
          itemComponent={AssetTypeSelectItem}
          label="Asset Type"
          required
        />
        <DateInput
          label="Next Maintenance Date"
          value={nextMaintenanceDate}
          onChange={setNextMaintenanceDate}
          required
          minDate={new Date()}
          popoverProps={{ position: 'right', withinPortal: true }}
          firstDayOfWeek={0}
        />
        <Select label="Manager" data={userOptions} value={managerId} onChange={setManagerId} />
        {assetImageUrl && <Image src={assetImageUrl} radius="sm" caption={assetImage?.name} />}
        <FileButton accept="image/png,image/jpeg" onChange={handleImageUpload}>
          {(props) => (
            <Button
              variant={assetImage ? 'outline' : 'filled'}
              size="sm"
              leftIcon={<IconPhoto size={20} />}
              {...props}
            >
              {assetImage ? 'Change Image' : 'Upload Image'}
            </Button>
          )}
        </FileButton>
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
