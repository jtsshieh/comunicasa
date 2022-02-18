import {
	alpha,
	Avatar,
	AvatarGroup,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Paper,
	TextField,
	Typography,
	useTheme,
} from '@mui/material';
import { Navbar } from '../../../components/navbar';
import { House } from '@prisma/client';
import AddIcon from '@mui/icons-material/Add';
import useSWR, { mutate } from 'swr';
import { FormEvent, useCallback, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
	const theme = useTheme();
	const { data: houses } = useSWR<House[]>('/api/house');
	const [showModal, setShowModal] = useState(false);

	return (
		<div
			css={{
				backgroundColor: theme.palette.background.default,
				minHeight: '100vh',
			}}
		>
			<Navbar />
			<CreateHouseModal
				open={showModal}
				handleClose={() => setShowModal(false)}
			/>
			{!houses ? (
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
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
						gap: theme.spacing(2),
						padding: theme.spacing(2),
					}}
				>
					{houses.map((house) => (
						<HouseTile key={house.id} house={house} />
					))}
					<Paper
						css={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							'&::before': {
								display: 'block',
								content: '""',
								paddingBottom: '100%',
							},
							'&:hover': {
								cursor: 'pointer',
								backgroundColor: alpha(
									theme.palette.background.paper,
									1 - theme.palette.action.hoverOpacity
								),
							},
						}}
						onClick={() => setShowModal(true)}
					>
						<AddIcon />
					</Paper>
				</div>
			)}
		</div>
	);
}

function HouseTile({ house }: { house: House }) {
	const theme = useTheme();

	return (
		<Link href={`/dashboard/houses/${house.id}`}>
			<Paper
				css={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					paddingBottom: '100%',
					height: 0,
					'&:hover': {
						cursor: 'pointer',
						backgroundColor: alpha(
							theme.palette.background.paper,
							1 - theme.palette.action.hoverOpacity
						),
					},
				}}
			>
				<Typography variant="h4">{house.name}</Typography>
				<AvatarGroup>
					{house.ownerIds.map((owner) => (
						<Avatar key={owner} src={`/api/user/${owner}/avatar`} />
					))}
					{house.memberIds.map((owner) => (
						<Avatar key={owner} src={`/api/user/${owner}/avatar`} />
					))}
				</AvatarGroup>
			</Paper>
		</Link>
	);
}

function CreateHouseModal({
	open,
	handleClose,
}: {
	open: boolean;
	handleClose: () => void;
}) {
	const handleCreate = useCallback(
		async (e: FormEvent) => {
			e.preventDefault();
			const target = e.target as typeof e.target & {
				name: { value: string };
			};
			const payload = {
				name: target.name.value,
			};
			const house = await fetch('/api/house', {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					'content-type': 'application/json',
				},
			});
			if (house.ok) {
				handleClose();
				await mutate('/api/house');
			}
		},
		[handleClose]
	);

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			// @ts-ignore
			PaperProps={{ component: 'form', onSubmit: handleCreate }}
		>
			<DialogTitle>Crear Casa</DialogTitle>
			<DialogContent>
				<DialogContentText>
					¡Dale un nombre a tu casa! Después de crearla, puede agregar a su
					familia.
				</DialogContentText>
				<TextField
					autoFocus
					name="name"
					label="El nombre de casa"
					fullWidth
					variant="outlined"
					margin="normal"
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>Cancelar</Button>
				<Button type="submit" variant="contained">
					Crear
				</Button>
			</DialogActions>
		</Dialog>
	);
}
