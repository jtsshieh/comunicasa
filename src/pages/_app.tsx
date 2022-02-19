import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material';
import { theme } from '../lib/theme';
import '../styles/reset.css';
import { SWRConfig } from 'swr';
import { fetcher } from '../lib/fetcher';
import { SnackbarProvider } from 'notistack';

export default function App({ Component, pageProps }: AppProps) {
	return (
		<SWRConfig value={{ fetcher }}>
			<ThemeProvider theme={theme}>
				<SnackbarProvider
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
				>
					<Head>
						<link rel="stylesheet" href="https://use.typekit.net/pzr3ekr.css" />
					</Head>
					<Component {...pageProps} />
				</SnackbarProvider>
			</ThemeProvider>
		</SWRConfig>
	);
}
