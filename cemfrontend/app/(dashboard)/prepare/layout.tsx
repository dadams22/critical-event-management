'use client';

import {
  createStyles,
  Navbar,
  getStylesRef,
  rem,
  Flex,
  Stack,
  Title,
  ScrollArea,
} from '@mantine/core';
import { IconAsset, IconBuildingCommunity, IconUsers, TablerIcon } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';

const useStyles = createStyles((theme) => ({
  footer: {
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,
  },

  link: {
    ...theme.fn.focusStyles(),
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    fontSize: theme.fontSizes.sm,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,

      [`& .${getStylesRef('icon')}`]: {
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
      },
    },
  },

  linkIcon: {
    ref: getStylesRef('icon'),
    color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
    marginRight: theme.spacing.sm,
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
      [`& .${getStylesRef('icon')}`]: {
        color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
      },
    },
  },
}));

const data: { link: string; label: string; icon: TablerIcon }[] = [
  { link: '/prepare/sites', label: 'Sites', icon: IconBuildingCommunity },
  { link: '/prepare/people', label: 'People', icon: IconUsers },
  { link: '/prepare/assetTypes', label: 'Asset Types', icon: IconAsset },
];

interface ComponentProps {
  children: React.ReactNode;
}

export default function NavbarSimple({ children }: ComponentProps) {
  const { classes, cx } = useStyles();

  const pathname = usePathname();

  const links = data.map((item) => (
    <a
      className={cx(classes.link, { [classes.linkActive]: pathname.startsWith(item.link) })}
      href={item.link}
      key={item.label}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <Flex mah="100vh">
      <Navbar zIndex={2000} width={{ sm: 300 }} p="md">
        <Title order={4} pb="md">
          Settings
        </Title>
        <Navbar.Section grow>{links}</Navbar.Section>

        {/* <Navbar.Section className={classes.footer}>
            <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
            <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
            <span>Change account</span>
            </a>

            <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>Logout</span>
            </a>
        </Navbar.Section> */}
      </Navbar>

      <ScrollArea mah="100%" w="100%">
        <Stack p="lg" w="100%">
          {children}
        </Stack>
      </ScrollArea>
    </Flex>
  );
}
