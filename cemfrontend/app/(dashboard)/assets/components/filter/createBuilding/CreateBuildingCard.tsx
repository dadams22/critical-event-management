import {
  ActionIcon,
  Button,
  Card,
  Center,
  createStyles,
  Flex,
  Group,
  Image,
  Indicator,
  IndicatorProps,
  Input,
  Select,
  SelectItem,
  Stack,
  Table,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import React, { useRef, useState } from 'react';
import { produce } from 'immer';
import {
  IconCheck,
  IconLayoutCollage,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { Site } from '../../../../../../api/types';
import { FloorDraft } from './useCreateBuildingState';
import withConditionalWrapper from '../../../../../../components/withConditionalWrapper';

const useStyles = createStyles((theme) => ({
  noDisplay: {
    visibility: 'hidden',
  },
}));

const ConditionalIndicator = withConditionalWrapper<IndicatorProps>(Indicator);

interface ComponentProps {
  sites: Site[];
  siteId: string;
  onChangeSite: (siteId: string) => void;
  floors: FloorDraft[];
  setFloors: (floors: FloorDraft[]) => void;
  floorPlanPlacementIndex?: number;
  setFloorPlanPlacementIndex: (i: number | undefined) => void;
  onSave: (buildingInfo: { name: string }) => Promise<void>;
  onCancel: () => void;
}

export default function CreateBuildingCard({
  sites,
  siteId,
  onChangeSite,
  floors,
  setFloors,
  floorPlanPlacementIndex,
  setFloorPlanPlacementIndex,
  onSave,
  onCancel,
}: ComponentProps) {
  const { classes, cx } = useStyles();

  const floorPlanInputRef = useRef<HTMLInputElement>(null);
  const floorPlanMeasurerRef = useRef<HTMLImageElement>(null);

  const [name, setName] = useState<string>('');

  const siteItems: SelectItem[] = sites.map((site) => ({
    label: site.name,
    value: String(site.id),
  }));

  const [editingFloorName, setEditingFloorName] = useState<string>('');
  const [editingFloorIndex, setEditingFloorIndex] = useState<number>();
  const addFloor = () => {
    setFloors(
      produce(floors, (draft) => {
        draft.push({ name: '' });
        setEditingFloorIndex(draft.length - 1);
      })
    );
    setEditingFloorName('');
  };
  const handleFloorPlanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || floorPlanPlacementIndex === undefined) return;

    const imageFile = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      setFloors(
        produce(floors, (draft) => {
          draft[floorPlanPlacementIndex].floorPlanImageUrl = String(event.target?.result);
          draft[floorPlanPlacementIndex].floorPlanImage = imageFile;
        })
      );
    };
    reader.readAsDataURL(imageFile);
  };
  const handleImageMeasurerLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (floorPlanPlacementIndex === undefined) return;

    const image = e.target as HTMLImageElement;
    setFloors(
      produce(floors, (draft) => {
        draft[floorPlanPlacementIndex].floorPlanDimensions = {
          width: image.naturalWidth,
          height: image.naturalHeight,
        };
      })
    );
  };

  const [saving, setSaving] = useState<boolean>(false);
  const disableSave: boolean =
    !name || floors.some((floor) => !floor.name || !floor.floorPlanBounds || !floor.floorPlanImage);
  const handleSave = () => {
    if (disableSave) return;
    setSaving(true);
    onSave({ name }).finally(() => setSaving(false));
  };

  return (
    <>
      <Card withBorder shadow="md" p="md">
        <Stack>
          <Title order={4}>Create Building</Title>
          <TextInput label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Select label="Site" data={siteItems} value={siteId} onChange={onChangeSite} required />
          <Table>
            <thead>
              <th align="left">
                <Input.Label required>Floors</Input.Label>
              </th>
            </thead>
            <tbody>
              {!floors.length ? (
                <tr>
                  <td colSpan={2} align="center">
                    No floors have been added.
                  </td>
                </tr>
              ) : (
                floors.map((floor, i) => (
                  <tr
                    onClick={
                      editingFloorIndex === undefined
                        ? () => setFloorPlanPlacementIndex(i)
                        : undefined
                    }
                  >
                    {i === editingFloorIndex ? (
                      <>
                        <td>
                          <TextInput
                            value={editingFloorName}
                            placeholder={`Floor ${i + 1}`}
                            onChange={(e) => setEditingFloorName(e.target.value)}
                          />
                        </td>
                        <td>
                          <Group miw="max-content" spacing="xs">
                            <ActionIcon
                              onClick={(e) => {
                                setFloors(
                                  produce(floors, (draft) => {
                                    draft[i].name = editingFloorName;
                                  })
                                );
                                setEditingFloorIndex(undefined);
                                setEditingFloorName('');
                                e.stopPropagation();
                              }}
                              disabled={!editingFloorName}
                            >
                              <IconCheck size={20} />
                            </ActionIcon>
                            <ActionIcon
                              onClick={(e) => {
                                setEditingFloorIndex(undefined);
                                setEditingFloorName('');
                                e.stopPropagation();
                              }}
                            >
                              <IconX size={20} />
                            </ActionIcon>
                          </Group>
                        </td>
                      </>
                    ) : (
                      <>
                        <td width="100%">{floor.name}</td>
                        <td>
                          <Group miw="max-content" spacing="xs">
                            <ConditionalIndicator visible={!floor.floorPlanBounds} color="red">
                              <Tooltip label="Add floor plan">
                                <ActionIcon
                                  onClick={() => {
                                    setFloorPlanPlacementIndex(i);
                                    floorPlanInputRef.current?.click();
                                  }}
                                >
                                  <IconLayoutCollage size={20} />
                                </ActionIcon>
                              </Tooltip>
                            </ConditionalIndicator>
                            <ActionIcon
                              onClick={() => {
                                setEditingFloorIndex(i);
                                setEditingFloorName(floor.name || '');
                              }}
                              disabled={editingFloorIndex !== undefined}
                            >
                              <IconPencil size={20} />
                            </ActionIcon>
                            <ActionIcon
                              onClick={() => {
                                if (i === floorPlanPlacementIndex) {
                                  setFloorPlanPlacementIndex(undefined);
                                } else {
                                  setFloorPlanPlacementIndex(i - 1);
                                }
                                setFloors(
                                  produce(floors, (draft) => {
                                    draft.splice(i, 1);
                                  })
                                );
                              }}
                              disabled={editingFloorIndex !== undefined}
                            >
                              <IconTrash size={20} />
                            </ActionIcon>
                          </Group>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
              <tr>
                <td colSpan={2}>
                  <Center>
                    <Button
                      leftIcon={<IconPlus size={20} />}
                      onClick={addFloor}
                      disabled={editingFloorIndex !== undefined}
                    >
                      Add Floor
                    </Button>
                  </Center>
                </td>
              </tr>
            </tbody>
          </Table>
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
      <input
        ref={floorPlanInputRef}
        type="file"
        accept=".png, .svg, .jpeg"
        className={classes.noDisplay}
        onChange={handleFloorPlanUpload}
      />
      <Image
        ref={floorPlanMeasurerRef}
        alt=""
        className={classes.noDisplay}
        src={
          floorPlanPlacementIndex !== undefined
            ? floors[floorPlanPlacementIndex].floorPlanImageUrl
            : undefined
        }
        onLoad={handleImageMeasurerLoad}
      />
    </>
  );
}
