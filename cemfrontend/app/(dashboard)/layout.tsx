'use client';

import {
  createStyles,
  rem,
  useMantineTheme,
  Tooltip,
  UnstyledButton,
  Stack,
  Center,
  Loader,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAsset,
  IconHome,
  IconLogout,
  IconSettings,
  IconSquareLetterHFilled,
  IconSquareLetterPFilled,
  IconUrgent,
} from '@tabler/icons-react';
import { deleteCookie, getCookie } from 'cookies-next';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Api, { AUTH_TOKEN_KEY } from '../../api/Api';

const useStyles = createStyles((theme) => ({
  pageContainer: {
    height: 0,
    minHeight: '100vh',
    display: 'flex',
  },

  main: {
    flexGrow: 2,
  },

  root: {
    position: 'relative',
    zIndex: 1,
  },

  navbar: {
    width: '80px',
    height: '100%',
    padding: theme.spacing.md,
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
    zIndex: 2001,
  },

  navbarMain: {
    flex: 1,
    marginTop: '50px',
  },

  link: {
    width: '50px',
    height: '50px',
    borderRadius: theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
    },

    '&[data-active]': {
      '&, &:hover': {
        backgroundColor: theme.colors.blue[1],
        color: theme.colors.blue[8],
      },
    },
  },
}));

interface NavbarLinkProps {
  icon: typeof IconAsset;
  label: string;
  link?: string;
  active?: boolean;
  onClick?: () => void;
}

const links: NavbarLinkProps[] = [
  { label: 'Home', link: '/home', icon: IconHome },
  { label: 'Assets', link: '/assets', icon: IconAsset },
  { label: 'Report', link: '/report', icon: IconUrgent },
];

function NavbarLink({ icon: Icon, label, active, link, onClick }: NavbarLinkProps) {
  const { classes } = useStyles();
  const router = useRouter();

  const handleClick = () => {
    if (link) router.push(link);
    if (onClick) onClick();
  };

  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        className={classes.link}
        data-active={active || undefined}
        onClick={handleClick}
      >
        <Icon size={20} />
      </UnstyledButton>
    </Tooltip>
  );
}

interface ComponentProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: ComponentProps) {
  const { classes, cx } = useStyles();
  const theme = useMantineTheme();

  const pathname = usePathname();

  const [authenticating, setAuthenticating] = useState(true);

  const items = links.map((link) => (
    <NavbarLink {...link} key={link.label} active={pathname.startsWith(link.link)} />
  ));

  const router = useRouter();
  const token = getCookie(AUTH_TOKEN_KEY);
  useEffect(() => {
    Api.checkAuth()
      .then((authenticated) => {
        if (!authenticated) router.replace(`/login?next=${pathname}`);
      })
      .finally(() => setAuthenticating(false));
  }, [token]);

  const handleLogout = () => {
    deleteCookie(AUTH_TOKEN_KEY);
    router.push('/login');
  };

  return (
    <div className={classes.pageContainer}>
      <nav className={classes.navbar}>
        <Center>
          <IconSquareLetterHFilled size={30} color={theme.colors.blue[8]} />
        </Center>

        <div className={classes.navbarMain}>
          <Stack justify="center" gap={0}>
            {items}
          </Stack>
        </div>

        <Stack justify="center" gap={0}>
          <NavbarLink
            icon={IconSettings}
            label="Settings"
            link="/prepare"
            active={pathname.startsWith('/prepare')}
          />
          <NavbarLink icon={IconLogout} label="Logout" onClick={handleLogout} />
        </Stack>
      </nav>
      <main className={classes.main}>
        {authenticating ? (
          <Center h="100%">
            <Loader variant="bars" size="lg" />
          </Center>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
