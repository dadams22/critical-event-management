'use client';
import {
	createStyles,
	Header,
	Group,
	Burger,
	Paper,
	Transition,
	rem,
	Title,
	useMantineTheme,
	Tooltip,
	UnstyledButton,
	Stack,
	Center,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
	IconAlarm,
	IconAsset,
	IconLogout,
	IconSettings,
	IconShieldHalfFilled,
	IconSquareLetterPFilled,
	IconSquareRoundedLetterPFilled,
	IconUrgent,
} from '@tabler/icons-react';
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Api, { AUTH_TOKEN_KEY } from '../../api/Api';
import { useEffect } from 'react';

const HEADER_HEIGHT = rem(60);

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

interface HeaderResponsiveProps {
	links: { link: string; label: string }[];
}

interface NavbarLinkProps {
	icon: typeof IconAsset;
	label: string;
	link: string;
	active?: boolean;
}

const links: NavbarLinkProps[] = [
	{ label: 'Assets', link: '/assets', icon: IconAsset },
	{ label: 'Report', link: '/report', icon: IconUrgent },
];

function NavbarLink({ icon: Icon, label, active, link }: NavbarLinkProps) {
	const { classes } = useStyles();
	const router = useRouter();

	const handleClick = () => {
		router.push(link);
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

	const [opened, { toggle, close }] = useDisclosure(false);

	const pathname = usePathname();

	const items = links.map((link, index) => (
		<NavbarLink {...link} key={link.label} active={pathname.startsWith(link.link)} />
	));

	const router = useRouter();
	const token = getCookie(AUTH_TOKEN_KEY);
	useEffect(() => {
		Api.checkAuth().then((authenticated) => {
			if (!authenticated) router.replace('/login');
		});
	}, [token]);

	return (
		<div className={classes.pageContainer}>
			<nav className={classes.navbar}>
				<Center>
					<IconSquareLetterPFilled size={30} color={theme.colors.blue[8]} />
				</Center>

				<div className={classes.navbarMain}>
					<Stack justify="center" gap={0}>
						{items}
					</Stack>
				</div>

				<Stack justify="center" gap={0}>
					<NavbarLink icon={IconSettings} label="Settings" link="/prepare" />
					<NavbarLink icon={IconLogout} label="Logout" />
				</Stack>
			</nav>
			<main className={classes.main}>{children}</main>
		</div>
	);
}
