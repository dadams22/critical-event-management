'use client';

import React, { useRef, useMemo, useState } from 'react';
import {
  ActionIcon,
  Button,
  Center,
  createStyles,
  Flex,
  Grid,
  Group,
  Modal,
  Overlay,
  Stack,
  Stepper,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import _ from 'lodash';
import { useCounter } from '@mantine/hooks';
import styled from '@emotion/styled';
import {
  IconCheck,
  IconClick,
  IconPencil,
  IconPhotoPlus,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { produce } from 'immer';
import AddressField from '../../../../components/AddressField';
// import { Polygon } from '@turf/helpers/dist/es';
import Api from '../../../../api/Api';
import MapView from '../../../../components/map/MapView';
import { Bounds } from '../../../../api/types';

const useStyles = createStyles((theme) => ({
  overlay: {
    cursor: 'pointer',
    opacity: 0.75,
    border: '1px solid transparent',
    '&:hover': {
      opacity: 0.85,
      border: `1px solid ${theme.colors.blue[6]}`,
    },
    borderRadius: '8px',
    transitionProperty: 'opacity border',
    transitionDuration: '300ms',
  },
  clickableRow: {
    cursor: 'pointer',
  },
}));

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 420px;
  border-radius: 8px;
  overflow: hidden;
`;

const FloorPlanInput = styled.input`
  display: none;
`;

const ImageMeasurer = styled.img`
  visibility: hidden;
`;

interface ComponentProps {
  opened: boolean;
  onSave: () => void;
  onClose: () => void;
}

export default function CreateSiteModal({ opened, onSave, onClose }: ComponentProps) {
  const { classes } = useStyles();

  const [saving, setSaving] = useState<boolean>(false);
  const [siteName, setSiteName] = useState<string>('');
  const [address, setAddress] = useState<AddressAutofillRetrieveResponse>();
  const [siteBounds, setSiteBounds] = useState<Bounds>();

  const [step, stepHandlers] = useCounter(0, { min: 0, max: 2 });

  const floorPlanInputRef = useRef<HTMLInputElement>(null);
  const [floorPlanImageUrl, setFloorPlanImageUrl] = useState<string>();
  const [floorPlanBounds, setFloorPlanBounds] = useState<Bounds>();
  const [floorPlanDimensions, setFloorPlanDimensions] = useState<{
    width: number;
    height: number;
  }>();
  const [floorPlanFile, setFloorPlanFile] = useState<File>();
  const floorPlanMeasurerRef = useRef<HTMLImageElement>(null);

  const [floors, setFloors] = useState<
    {
      name?: string;
      floorPlanBounds?: Bounds;
      floorPlanImageUrl?: string;
      floorPlanImage?: File;
      floorPlanDimensions?: {
        width: number;
        height: number;
      };
    }[]
  >([]);
  const [editingFloorName, setEditingFloorName] = useState<string>('');
  const [floorBeingEditedIndex, setFloorBeingEditedIndex] = useState<number>();
  const [floorPlanPlacementIndex, setFloorPlanPlacementIndex] = useState<number>();

  const handleClickAddFloor = () => {
    setFloors(
      produce(floors, (draft) => {
        draft.push({ name: '' });
        setFloorBeingEditedIndex(draft.length - 1);
      })
    );
    setEditingFloorName('');
  };

  const handleFloorPlanOverlayClick = () => {
    floorPlanInputRef.current?.click();
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

  const nextDisabled = useMemo(() => {
    if (step === 0) return !siteName || !address;
    if (step === 1) return !siteBounds;
    if (step === 2) return;
    !address ||
      !address?.features?.[0]?.properties?.full_address ||
      !siteBounds ||
      !floors.length ||
      floors.some((floor) => !floor.name || !floor.floorPlanImage || !floor.floorPlanImageUrl);

    return false;
  }, [step, siteName, address, siteBounds, siteBounds, floorPlanFile]);

  const handleSave = () => {
    if (
      !address ||
      !address?.features?.[0]?.properties?.full_address ||
      !siteBounds ||
      !floors.length ||
      floors.some((floor) => !floor.name || !floor.floorPlanImage || !floor.floorPlanImageUrl)
    )
      return;

    setSaving(true);
    Api.createSite({
      name: siteName,
      address: address?.features?.[0]?.properties?.full_address,
      bounds: siteBounds,
      longitude: address?.features?.[0]?.geometry?.coordinates?.[0],
      latitude: address?.features?.[0]?.geometry?.coordinates?.[1],
      floors: floors.map((floor) => _.pick(floor, ['name', 'floorPlanImage', 'floorPlanBounds'])),
    })
      .then(() => {
        onSave();
        onClose();
      })
      .finally(() => setSaving(false));
  };

  return (
    <Modal title="Create Site" opened={opened} onClose={onClose} size="xl" zIndex={2000} centered>
      <Stack>
        <Stepper active={step}>
          <Stepper.Step label="Site Info">
            <Stack>
              <TextInput
                label="Site Name"
                required
                disabled={saving}
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
              <AddressField
                value={address?.features?.[0]?.properties?.full_address}
                onSelectAddress={setAddress}
              />
            </Stack>
          </Stepper.Step>
          <Stepper.Step label="Define Site Bounds">
            {address && (
              <MapContainer>
                <MapView
                  location={{
                    longitude: address.features?.[0]?.geometry?.coordinates?.[0],
                    latitude: address.features?.[0]?.geometry?.coordinates?.[1],
                  }}
                  showLocationMarker
                  drawBounds={{
                    bounds: siteBounds,
                    onUpdateBounds: setSiteBounds,
                  }}
                />
              </MapContainer>
            )}
          </Stepper.Step>
          <Stepper.Step label="Add Floor Plans">
            {address && (
              <Grid>
                <Grid.Col span={4}>
                  <Table>
                    <thead>
                      <th align="left">Floors</th>
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
                            className={
                              floorBeingEditedIndex === undefined ? classes.clickableRow : undefined
                            }
                            onClick={
                              floorBeingEditedIndex === undefined
                                ? () => setFloorPlanPlacementIndex(i)
                                : undefined
                            }
                          >
                            {i === floorBeingEditedIndex ? (
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
                                        setFloorBeingEditedIndex(undefined);
                                        setEditingFloorName('');
                                        e.stopPropagation();
                                      }}
                                      disabled={!editingFloorName}
                                    >
                                      <IconCheck size={20} />
                                    </ActionIcon>
                                    <ActionIcon
                                      onClick={(e) => {
                                        setFloorBeingEditedIndex(undefined);
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
                                    <ActionIcon
                                      onClick={() => {
                                        setFloorBeingEditedIndex(i);
                                        setEditingFloorName(floor.name || '');
                                      }}
                                      disabled={floorBeingEditedIndex !== undefined}
                                    >
                                      <IconPencil size={20} />
                                    </ActionIcon>
                                    <ActionIcon
                                      onClick={() => {
                                        setFloors(
                                          produce(floors, (draft) => {
                                            draft.splice(i, 1);
                                          })
                                        );
                                      }}
                                      disabled={floorBeingEditedIndex !== undefined}
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
                              onClick={handleClickAddFloor}
                              disabled={floorBeingEditedIndex !== undefined}
                            >
                              Add Floor
                            </Button>
                          </Center>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Grid.Col>
                <Grid.Col span={8}>
                  <MapContainer>
                    <MapView
                      key="new"
                      location={{
                        longitude: address.features?.[0]?.geometry?.coordinates?.[0],
                        latitude: address.features?.[0]?.geometry?.coordinates?.[1],
                      }}
                      floorPlan={
                        floorPlanPlacementIndex !== undefined &&
                        !!floors[floorPlanPlacementIndex].floorPlanImageUrl &&
                        !!floors[floorPlanPlacementIndex].floorPlanDimensions &&
                        !!siteBounds
                          ? {
                              onUpdateFloorPlanBounds: (bounds) => {
                                setFloors(
                                  produce(floors, (draft) => {
                                    draft[floorPlanPlacementIndex].floorPlanBounds = bounds;
                                  })
                                );
                              },
                              floorPlanBounds: floors[floorPlanPlacementIndex].floorPlanBounds,
                              floorPlanImageUrl: floors[floorPlanPlacementIndex].floorPlanImageUrl,
                              ...floors[floorPlanPlacementIndex].floorPlanDimensions,
                              siteBounds,
                            }
                          : undefined
                      }
                    />
                    {floorPlanPlacementIndex === undefined ? (
                      <Overlay center>
                        <Stack align="center">
                          <IconClick size={80} />
                          <Text>Select a floor to add a floor plan.</Text>
                        </Stack>
                      </Overlay>
                    ) : !floors[floorPlanPlacementIndex].floorPlanImageUrl ? (
                      <Overlay
                        center
                        className={classes.overlay}
                        onClick={handleFloorPlanOverlayClick}
                      >
                        <Stack align="center">
                          <IconPhotoPlus size={80} />
                          <Text>Add a floor plan.</Text>
                        </Stack>
                        <FloorPlanInput
                          type="file"
                          accept=".svg, .png"
                          ref={floorPlanInputRef}
                          onChange={handleFloorPlanUpload}
                        />
                      </Overlay>
                    ) : null}
                    {floorPlanPlacementIndex !== undefined &&
                      !!floors[floorPlanPlacementIndex].floorPlanImageUrl &&
                      !floors[floorPlanPlacementIndex].floorPlanDimensions && (
                        <ImageMeasurer
                          ref={floorPlanMeasurerRef}
                          src={floors[floorPlanPlacementIndex].floorPlanImageUrl}
                          onLoad={(e) => {
                            const image = e.target as HTMLImageElement;
                            setFloors(
                              produce(floors, (draft) => {
                                draft[floorPlanPlacementIndex].floorPlanDimensions = {
                                  width: image.naturalWidth,
                                  height: image.naturalHeight,
                                };
                              })
                            );
                          }}
                        />
                      )}
                  </MapContainer>
                </Grid.Col>
              </Grid>
            )}
          </Stepper.Step>
        </Stepper>
        <Flex justify="flex-end">
          <Group>
            <Button variant="outline" onClick={stepHandlers.decrement} disabled={step === 0}>
              Previous
            </Button>
            <Button
              variant="filled"
              onClick={step === 2 ? handleSave : stepHandlers.increment}
              disabled={nextDisabled}
            >
              {step === 2 ? 'Save' : 'Next'}
            </Button>
          </Group>
        </Flex>
      </Stack>
    </Modal>
  );
}
