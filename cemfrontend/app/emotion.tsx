'use client';

import { CacheProvider } from '@emotion/react';
import { useEmotionCache, MantineProvider, ColorScheme, ColorSchemeProvider } from '@mantine/core';
import { useServerInsertedHTML } from 'next/navigation';
import { ModalsProvider } from '@mantine/modals';
import { APP_MODALS } from './(modals)';
import { ModalSettings } from '@mantine/modals/lib/context';
import _ from 'lodash';

const DEFAULT_MODAL_SETTINGS: ModalSettings = {
	centered: true,
	zIndex: 2000,
};

interface ComponentProps {
	colorScheme: ColorScheme;
	children: React.ReactNode;
}

export default function RootStyleRegistry({
	colorScheme: initialColorScheme,
	children,
}: ComponentProps) {
	const cache = useEmotionCache();
	cache.compat = true;

	const colorScheme = 'dark';
	const toggleColorScheme = _.noop();
	// const [colorScheme, setColorScheme] = useState<ColorScheme>(initialColorScheme);

	// const toggleColorScheme = (value?: ColorScheme) => {
	// 	const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
	// 	setColorScheme(nextColorScheme);
	// 	setCookie('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 });
	// };

	useServerInsertedHTML(() => (
		<style
			data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
			dangerouslySetInnerHTML={{
				__html: Object.values(cache.inserted).join(' '),
			}}
		/>
	));

	return (
		<CacheProvider value={cache}>
			<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
				<MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
					<ModalsProvider modals={APP_MODALS} modalProps={DEFAULT_MODAL_SETTINGS}>
						{children}
					</ModalsProvider>
				</MantineProvider>
			</ColorSchemeProvider>
		</CacheProvider>
	);
}
