import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Typography,
	useTheme,
} from '@mui/material';
import { useHouse } from '../../../../lib/hooks/use-house';
import { Navbar } from '../../../../components/houses/navbar';
import { useCallback, useEffect, useState } from 'react';
import { mutate } from 'swr';
import { useRouter } from 'next/router';
import { Panel } from '../../../../components/panel';
import { useUser } from '../../../../lib/hooks/use-user';
import {
	PageBackground,
	PageContainer,
} from '../../../../components/page-layout';

export default function HouseConfiguration() {
	const house = useHouse();
	const [showModal, setShowModal] = useState(false);
	const { user } = useUser();
	const router = useRouter();
	useEffect(() => {
		if (!house || !user) return;
		if (!house.ownerIds.includes(user.id))
			router.push(`/dashboard/houses/${house.id}`);
	}, [house, user, router]);

	return (
		<PageBackground>
			<Navbar />
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
				<PageContainer>
					<Typography align="center" variant="h2">
						Configuración
					</Typography>
					<Panel
						css={{
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
					</Panel>
				</PageContainer>
			)}
		</PageBackground>
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
