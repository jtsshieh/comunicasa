import { Button, Typography, useTheme } from '@mui/material';
import Link from 'next/link';

export default function Home() {
	const theme = useTheme();

	return (
		<div
			css={{
				height: '100vh',
				width: '100vw',
				backgroundColor: theme.palette.background.default,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				color: 'white',
			}}
		>
			<div>
				<img css={{ height: '35vh' }} src="/house.svg" alt="House" />
			</div>
			<div
				css={{
					padding: theme.spacing(5),
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'start',
					gap: theme.spacing(4),
				}}
			>
				<Typography align="center" variant="h1">
					Bienvenido a Comunicasa
				</Typography>
				<Link href="/auth/signin" passHref>
					<Button size="large" variant="contained">
						Iniciar sesión
					</Button>
				</Link>
			</div>
		</div>
	);
}
