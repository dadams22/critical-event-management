import { getCookie } from 'cookies-next';
import { ColorScheme } from '@mantine/core';
import Head from 'next/head';
import 'mapbox-gl/dist/mapbox-gl.css';

import RootStyleRegistry from './emotion';

export const metadata = {
  title: 'HUMAN',
  description: 'Safety for all.',
};

interface ComponentProps {
  colorScheme: ColorScheme;
  children: React.ReactNode;
}

export default function RootLayout({ children }: ComponentProps) {
  return (
    <html lang="en-US">
      <Head>
        <title>HUMAN</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <body style={{ minHeight: '100vh', height: 0, minWidth: '100vw', width: 0 }}>
        <RootStyleRegistry colorScheme="dark">{children}</RootStyleRegistry>
      </body>
    </html>
  );
}

RootLayout.getInitialProps = async () => ({
  colorScheme: getCookie('mantine-color-scheme') || 'dark',
});
