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
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconShieldHalfFilled } from '@tabler/icons';
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
		flexDirection: 'column',
	},

	main: {
		flexGrow: 2,
	},

	root: {
		position: 'relative',
		zIndex: 1,
	},

	dropdown: {
		position: 'absolute',
		top: HEADER_HEIGHT,
		left: 0,
		right: 0,
		zIndex: 0,
		borderTopRightRadius: 0,
		borderTopLeftRadius: 0,
		borderTopWidth: 0,
		overflow: 'hidden',

		[theme.fn.largerThan('sm')]: {
			display: 'none',
		},
	},

	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: '100%',
	},

	links: {
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},

	burger: {
		[theme.fn.largerThan('sm')]: {
			display: 'none',
		},
	},

	link: {
		display: 'block',
		lineHeight: 1,
		padding: `${rem(8)} ${rem(12)}`,
		borderRadius: theme.radius.sm,
		textDecoration: 'none',
		color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
		fontSize: theme.fontSizes.sm,
		fontWeight: 500,

		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
		},

		[theme.fn.smallerThan('sm')]: {
			borderRadius: 0,
			padding: theme.spacing.md,
		},
	},

	linkActive: {
		'&, &:hover': {
			backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
			color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
		},
	},
}));

interface HeaderResponsiveProps {
	links: { link: string; label: string }[];
}

const links: { link: string; label: string }[] = [
	{ label: 'Report', link: '/report' },
	{ label: 'Prepare', link: '/prepare' },
];

interface ComponentProps {
	children: React.ReactNode;
}

export default function AppLayout({ children }: ComponentProps) {
	const { classes, cx } = useStyles();
	const theme = useMantineTheme();

	const [opened, { toggle, close }] = useDisclosure(false);

	const pathname = usePathname();

	const items = links.map((link) => (
		<Link
			key={link.label}
			href={link.link}
			className={cx(classes.link, { [classes.linkActive]: pathname.startsWith(link.link) })}
		>
			{link.label}
		</Link>
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
			<Header height={HEADER_HEIGHT} className={classes.root} px="lg">
				<div className={classes.header}>
					<Group>
						<IconShieldHalfFilled color={theme.colors.blue[8]} />
						<Title color="blue" order={3}>
							SimpleCEM
						</Title>
					</Group>
					<Group spacing={5} className={classes.links}>
						{items}
					</Group>

					<Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />

					<Transition transition="pop-top-right" duration={200} mounted={opened}>
						{(styles) => (
							<Paper className={classes.dropdown} withBorder style={styles}>
								{items}
							</Paper>
						)}
					</Transition>
				</div>
			</Header>
			<main className={classes.main}>{children}</main>
		</div>
	);
}
