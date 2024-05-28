'use client';

import { Site } from '../../../../api/types';
import { Button, createStyles, Menu, Select, SimpleGrid, Stack } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import build from 'next/dist/build';

const useStyles = createStyles((theme) => ({
  noDropdown: {
    '.mantine-Select-dropdown': {
      display: 'none',
    },
  },
  selectedItem: {
    backgroundColor: theme.colors.blue[6],
    color: 'white',

    ':hover': {
      backgroundColor: theme.colors.blue[6],
      color: 'white',
    },
  },
}));

interface ComponentProps {
  sites: Site[];
  siteId: string;
  buildingId?: string;
  floorId?: string;
  onChange: (selections: { site?: string; floor?: string; building?: string }) => void;
}

export default function SiteBuildingFloorSelector({
  sites,
  siteId,
  buildingId,
  floorId,
  onChange,
}: ComponentProps) {
  const { classes, cx } = useStyles();

  const [opened, handlers] = useDisclosure();

  const selectedSite = sites.find((site) => String(site.id) === siteId);
  const selectedBuilding = selectedSite?.buildings?.find(
    (building) => String(building.id) === buildingId
  );
  const selectedFloor = selectedBuilding?.floors?.find((floor) => String(floor.id) === floorId);
  const hasMultipleBuildings = selectedSite?.buildings?.length || 0 > 1;
  const hasMultipleFloors: boolean = selectedBuilding?.floors.length || 0 > 1;

  const selectionLabel: string = (() => {
    const selections: string[] = [selectedSite?.name];

    if (selectedBuilding) selections.push(selectedBuilding.name);
    if (selectedFloor) selections.push(selectedFloor.name);

    return selections.join(' - ');
  })();

  const handleSelectSite = (siteId: string) => () => {
    onChange({ site: siteId, building: undefined, floor: undefined });
  };

  const handleSelectBuilding = (buildingId: string) => () => {
    onChange({ building: buildingId, floor: undefined });
  };
  const handleSelectAllBuildings = () => {
    onChange({ building: undefined, floor: undefined });
  };

  const handleSelectFloor = (floorId: string) => () => {
    onChange({ floor: floorId });
  };
  const handleSelectAllFloors = () => {
    onChange({ floor: undefined });
  };

  return (
    <Menu closeOnItemClick={false} position="bottom-start">
      <Menu.Target>
        <Select
          className={classes.noDropdown}
          w={260}
          icon={<IconMapPin size={20} />}
          data={[{ label: selectionLabel, value: 'selection' }]}
          value="selection"
        />
      </Menu.Target>
      <Menu.Dropdown>
        <SimpleGrid cols={hasMultipleFloors ? 3 : hasMultipleBuildings ? 2 : 1} spacing="xs">
          <Stack spacing={0}>
            <Menu.Label>Sites</Menu.Label>
            {sites.map((site) => (
              <Menu.Item
                className={cx(siteId === String(site.id) && classes.selectedItem)}
                onClick={handleSelectSite(String(site.id))}
              >
                {site.name}
              </Menu.Item>
            ))}
          </Stack>
          {hasMultipleBuildings && (
            <Stack spacing={0}>
              <Menu.Label>Buildings</Menu.Label>
              <Menu.Item
                className={cx(buildingId === undefined && classes.selectedItem)}
                onClick={handleSelectAllBuildings}
              >
                All Buildings
              </Menu.Item>
              {selectedSite?.buildings.map((building) => (
                <Menu.Item
                  className={cx(buildingId === String(building.id) && classes.selectedItem)}
                  onClick={handleSelectBuilding(String(building.id))}
                >
                  {building.name}
                </Menu.Item>
              ))}
            </Stack>
          )}
          {hasMultipleFloors && (
            <Stack spacing={0}>
              <Menu.Label>Floors</Menu.Label>
              <Menu.Item
                className={cx(floorId === undefined && classes.selectedItem)}
                onClick={handleSelectAllFloors}
              >
                All Floors
              </Menu.Item>
              {selectedBuilding?.floors?.map((floor) => (
                <Menu.Item
                  className={cx(floorId === String(floor.id) && classes.selectedItem)}
                  onClick={handleSelectFloor(String(floor.id))}
                >
                  {floor.name}
                </Menu.Item>
              ))}
            </Stack>
          )}
        </SimpleGrid>
      </Menu.Dropdown>
    </Menu>
  );
}
