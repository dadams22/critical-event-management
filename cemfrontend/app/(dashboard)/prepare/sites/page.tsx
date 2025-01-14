'use client';

import {
  Title,
  Text,
  Button,
  Flex,
  Center,
  Loader,
  Stack,
  SimpleGrid,
  ScrollArea,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import useSWR from 'swr';
import Api from '../../../../api/Api';
import SiteCard from './SiteCard';

export default function SitesPage() {
  const { data: sites, isLoading } = useSWR('sites/all', Api.getSites);

  return (
    <>
      <Title order={2}>Sites</Title>
      <Text c="dimmed">Create and manage sites.</Text>
      {isLoading ? (
        <Center h="100%" w="100%">
          <Loader />
        </Center>
      ) : (
        <Stack>
          <div>
            <Button leftIcon={<IconPlus size={20} />}>Create Site</Button>
          </div>
          <SimpleGrid cols={3}>
            {sites?.map((site) => <SiteCard key={site.id} site={site} />)}
          </SimpleGrid>
        </Stack>
      )}
    </>
  );
}
