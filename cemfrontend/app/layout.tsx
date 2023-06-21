import { getCookie, setCookie } from 'cookies-next';
import { ColorScheme } from '@mantine/core';
import { AppContext } from 'next/app';
import Head from 'next/head';

import RootStyleRegistry from './emotion';

export const metadata = {
  title: 'Next.js',
  description: 'Generated by Next.js',
}

interface ComponentProps {
  colorScheme: ColorScheme;
  children: React.ReactNode;
}

export default function RootLayout({ colorScheme, children }: ComponentProps) {
  return (
   <html lang="en-US">
      <Head>
        <title>Mantine next example</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>
      <body>
        <RootStyleRegistry colorScheme={colorScheme}>
         {children}
        </RootStyleRegistry>
      </body>
   </html>
  );
}

RootLayout.getInitialProps = async () => {
  return {
    colorScheme: getCookie('mantine-color-scheme') || 'dark',
  };
};
