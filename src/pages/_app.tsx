import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material';
import { theme } from '../lib/theme';
import '../styles/reset.css';
import { SWRConfig } from 'swr';
import { fetcher } from '../lib/fetcher';
import { SnackbarProvider } from 'notistack';
import DateAdapter from '@mui/lab/AdapterDateFns';
import { LocalizationProvider } from '@mui/lab';

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
					<LocalizationProvider dateAdapter={DateAdapter}>
						<Head>
							<link
								rel="stylesheet"
								href="https://use.typekit.net/pzr3ekr.css"
							/>
							<link
								rel="apple-touch-icon"
								sizes="180x180"
								href="/apple-touch-icon.png"
							/>
							<link
								rel="icon"
								type="image/png"
								sizes="32x32"
								href="/favicon-32x32.png"
							/>
							<link
								rel="icon"
								type="image/png"
								sizes="16x16"
								href="/favicon-16x16.png"
							/>
							<link rel="manifest" href="/site.webmanifest" />
						</Head>
						<Component {...pageProps} />
					</LocalizationProvider>
				</SnackbarProvider>
			</ThemeProvider>
		</SWRConfig>
	);
}
