import { Button, CircularProgress, Typography } from '@mui/material';
import { useHouse } from '../../../../lib/hooks/use-house';
import { Navbar } from '../../../../components/houses/navbar';
import { useCallback, useEffect } from 'react';
import { mutate } from 'swr';
import { useRouter } from 'next/router';
import { Panel } from '../../../../components/panel';
import { useUser } from '../../../../lib/hooks/use-user';
import {
	PageBackground,
	PageContainer,
} from '../../../../components/page-layout';
import { DeleteConfirmation } from '../../../../components/delete-confirmation';
import { useDialogState } from '../../../../lib/hooks/use-dialog-state';

export default function HouseConfiguration() {
	const house = useHouse();
	const [open, show, handleClose, key] = useDialogState();
	const { user } = useUser();
	const router = useRouter();
	useEffect(() => {
		if (!house || !user) return;
		if (!house.ownerIds.includes(user.id))
			router.push(`/dashboard/houses/${house.id}`);
	}, [house, user, router]);
	const handleDelete = useCallback(async () => {
		if (!house) return;

		const res = await fetch(`/api/house/${router.query.id}`, {
			method: 'DELETE',
		});
		if (res.ok) {
			await mutate('/api/house');
			await router.push('/dashboard/houses');
		}
	}, [router]);

	return (
		<PageBackground>
			<Navbar />
			<DeleteConfirmation
				key={key}
				open={open}
				item="la casa"
				handleClose={handleClose}
				handleDelete={handleDelete}
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
						<Button variant="contained" color="error" onClick={show}>
							Eliminar
						</Button>
					</Panel>
				</PageContainer>
			)}
		</PageBackground>
	);
}
