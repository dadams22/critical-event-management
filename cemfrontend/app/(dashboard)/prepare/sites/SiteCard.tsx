'use client';

import { Card, Stack, Text } from '@mantine/core';
import _ from 'lodash';
import styled from '@emotion/styled';
import { Site } from '../../../../api/types';
import MapView from '../../../../components/map/MapView';

const MapContainer = styled.div`
  display: contents;
  pointer-events: none;
`;

interface ComponentProps {
  site: Site;
}

export default function SiteCard({ site }: ComponentProps) {
  return (
    <Card p="md">
      <Card.Section h={240}>
        <MapContainer>
          <MapView location={_.pick(site, ['longitude', 'latitude'])} sites={[site]} />
        </MapContainer>
      </Card.Section>
      <Stack pt="md" spacing="xs">
        <Text fw={600}>{site.name}</Text>
        <Text fz="sm" c="dimmed">
          {site.address}
        </Text>
      </Stack>
    </Card>
  );
}
