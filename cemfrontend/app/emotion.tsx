'use client';
import { useState } from 'react';
import { CacheProvider } from '@emotion/react';
import { useEmotionCache, MantineProvider, ColorScheme, ColorSchemeProvider } from '@mantine/core';
import { useServerInsertedHTML } from 'next/navigation';
import { setCookie } from 'cookies-next';

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

	const [colorScheme, setColorScheme] = useState<ColorScheme>(initialColorScheme);

	const toggleColorScheme = (value?: ColorScheme) => {
		const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
		setColorScheme(nextColorScheme);
		setCookie('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 });
	};

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
				<MantineProvider withGlobalStyles withNormalizeCSS>
					{children}
				</MantineProvider>
			</ColorSchemeProvider>
		</CacheProvider>
	);
}
