import { Navbar } from '../../../../components/houses/navbar';
import { CircularProgress, Typography, useTheme } from '@mui/material';
import { useHouse } from '../../../../lib/hooks/use-house';

export default function House() {
	const theme = useTheme();
	const house = useHouse();

	return (
		<div
			css={{
				backgroundColor: theme.palette.background.default,
				minHeight: '100vh',
				color: 'white',
			}}
		>
			<Navbar />

			{!house ? (
				<div
					css={{
						height: '100vh',
						width: '100vw',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<CircularProgress />
				</div>
			) : (
				<div
					css={{
						marginTop: theme.spacing(4),
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						paddingTop: theme.spacing(4),
						paddingBottom: theme.spacing(4),
					}}
				>
					<Typography variant="h2">Bienvenido a tu casa</Typography>
					<Typography variant="h3">{house.name}</Typography>
				</div>
			)}
		</div>
	);
}
