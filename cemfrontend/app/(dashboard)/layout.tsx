'use client';
import { useState } from 'react';
import { createStyles, Navbar, Group, Code, getStylesRef, rem, Flex, Title, ThemeIcon, Space } from '@mantine/core';
import {
  IconBellRinging,
  IconFingerprint,
  IconKey,
  IconSettings,
  Icon2fa,
  IconDatabaseImport,
  IconReceipt2,
  IconSwitchHorizontal,
  IconLogout,
} from '@tabler/icons-react';
import { IconAlertTriangle, IconMessage2, IconUrgent } from '@tabler/icons';
import Image from 'next/image';
import iconMessageBolt from '../../public/icons/message-2-bolt.svg';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const useStyles = createStyles((theme) => ({
  header: {
    paddingBottom: theme.spacing.md,
    marginBottom: `calc(${theme.spacing.md} * 1.5)`,
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,
  },

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

  main: {
    padding: theme.spacing.md,
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 2,
  },
}));

const data = [
  { link: '/report', label: 'Report', icon: IconUrgent },
  { link: '/notify', label: 'Notify', icon: IconMessage2 },
];

interface ComponentProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: ComponentProps) {
  const { classes, cx } = useStyles();
  const pathname = usePathname();

  const activeLink = data.find((linkConfig) => pathname.startsWith(linkConfig.link)) || data[0];

  const links = data.map((item) => (
    <Link
      className={cx(classes.link, { [classes.linkActive]: pathname.startsWith(item.link) })}
      href={item.link}
      key={item.label}
    >
        <item.icon className={classes.linkIcon} />
      <span>{item.label}</span>
    </Link>
  ));

  return (
    <Flex miw="100%" w={0} mih="100%" h={0}>
        <Navbar height="100%" width={{ sm: 300 }} p="md">
            <Navbar.Section grow>
                <Group className={classes.header} position="apart">
                    <Title order={3}>SimpleCEM</Title>
                    <Code sx={{ fontWeight: 700 }}>v0.0.1</Code>
                </Group>
                {links}
            </Navbar.Section>

            <Navbar.Section className={classes.footer}>
                <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
                <IconLogout className={classes.linkIcon} stroke={1.5} />
                <span>Logout</span>
                </a>
            </Navbar.Section>
        </Navbar>
        <main className={classes.main}>
            {/* <Title order={2}>{activeLink.label}</Title>
            <Space h="md" /> */}
            {children}
        </main>
    </Flex>
  );
}