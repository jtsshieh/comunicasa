import {
	Button,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Paper,
	Typography,
	useTheme,
} from '@mui/material';
import { useHouse } from '../../../../lib/use-house';
import { Navbar } from '../../../../components/houses/navbar';
import { useCallback, useState } from 'react';
import { mutate } from 'swr';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';

export default function HouseConfiguration() {
	const theme = useTheme();
	const house = useHouse();
	const [showModal, setShowModal] = useState(false);

	return (
		<div
			css={{
				backgroundColor: theme.palette.background.default,
				minHeight: '100vh',
				color: 'white',
			}}
		>
			<DeleteHouseConfirmation
				open={showModal}
				handleClose={() => setShowModal(false)}
			/>
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
				<>
					<Navbar />

					<Container
						css={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: theme.spacing(4),
						}}
					>
						<Typography variant="h2">Configuración</Typography>
						<Paper
							css={{
								display: 'flex',
								flexDirection: 'column',
								gap: theme.spacing(2),
								padding: theme.spacing(4),
								width: '100%',
								border: 'solid 1px red',
							}}
						>
							<Typography variant="h3">Eliminar la casa</Typography>
							<Typography variant="body1">
								Eliminar la casa es permanente. ¡No puede recuperar!
							</Typography>
							<Button
								variant="contained"
								color="error"
								onClick={() => setShowModal(true)}
							>
								Eliminar
							</Button>
						</Paper>
					</Container>
				</>
			)}
		</div>
	);
}

function DeleteHouseConfirmation({
	open,
	handleClose,
}: {
	open: boolean;
	handleClose: () => void;
}) {
	const house = useHouse();
	const router = useRouter();
	const { enqueueSnackbar } = useSnackbar();

	const handleDelete = useCallback(async () => {
		if (!house) return;

		const res = await fetch(`/api/house/${house.id}`, {
			method: 'DELETE',
		});
		if (res.ok) {
			await mutate('/api/house');
			await router.push('/dashboard/houses');
		}
	}, [house, router]);

	return (
		<Dialog open={open} onClose={handleClose}>
			<DialogTitle>¿Eliminar la casa?</DialogTitle>
			<DialogContent>
				<DialogContentText>
					¿Está seguro de que quiere eliminar esta casa? ¡No puede recuperar!
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>Cancelar</Button>
				<Button onClick={handleDelete} variant="contained" color="error">
					Eliminar
				</Button>
			</DialogActions>
		</Dialog>
	);
}
