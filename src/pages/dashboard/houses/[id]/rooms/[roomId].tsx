import {
	Avatar,
	Button,
	Chip,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
	TextField,
	Typography,
	useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import { Room, User } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';
import { Navbar } from '../../../../../components/houses/navbar';
import { useHouse } from '../../../../../lib/hooks/use-house';
import { useSnackbar } from 'notistack';
import { useUser } from '../../../../../lib/hooks/use-user';

export default function Rooms() {
	const theme = useTheme();
	const router = useRouter();
	const house = useHouse();
	const { user } = useUser();
	const { data: room } = useSWR<Room>(
		router.query.id &&
			router.query.roomId &&
			`/api/house/${router.query.id}/rooms/${router.query.roomId}`
	);

	return (
		<div
			css={{
				backgroundColor: theme.palette.background.default,
				minHeight: '100vh',
				color: 'white',
			}}
		>
			<Navbar />

			{!room || !house || !user ? (
				<div
					css={{
						height: '100%',
						width: '100vw',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<CircularProgress />
				</div>
			) : room.ownerIds.includes(user.id) ? (
				<Container
					css={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: theme.spacing(4),
					}}
				>
					<Typography variant="h2">{room.name}</Typography>
					<NameChangePanel />
					<ManageOwnersPanels />
					<DeleteRoomPanel />
				</Container>
			) : (
				<></>
			)}
		</div>
	);
}

function NameChangePanel() {
	const theme = useTheme();
	const router = useRouter();
	const { data: room } = useSWR<Room>(
		router.query.id &&
			router.query.roomId &&
			`/api/house/${router.query.id}/rooms/${router.query.roomId}`
	);
	const [name, setName] = useState(room?.name);
	const { enqueueSnackbar } = useSnackbar();
	useEffect(() => {
		setName(room?.name);
	}, [room]);
	const changeName = useCallback(async () => {
		const payload = {
			name,
		};
		const res = await fetch(
			`/api/house/${router.query.id}/rooms/${router.query.roomId}`,
			{
				method: 'PUT',
				body: JSON.stringify(payload),
				headers: {
					'content-type': 'application/json',
				},
			}
		);

		if (res.ok) {
			await mutate(
				`/api/house/${router.query.id}/rooms/${router.query.roomId}`
			);
			await mutate(`/api/house/${router.query.id}/rooms`);
			await enqueueSnackbar('Listo', { variant: 'success' });
		}
	}, [enqueueSnackbar, name, router.query.id, router.query.roomId]);

	return (
		<Paper
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: theme.spacing(2),
				padding: theme.spacing(4),
				width: '100%',
			}}
		>
			<Typography variant="h3">Cambiar el nombre</Typography>
			<div
				css={{
					display: 'flex',
					gap: theme.spacing(2),
					margin: theme.spacing(2) + ' 0',
				}}
			>
				<TextField
					name="name"
					label="El nombre de cuarto"
					fullWidth
					variant="outlined"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
				<Button variant="contained" onClick={changeName}>
					Cambiar
				</Button>
			</div>
		</Paper>
	);
}

function ManageOwnersPanels() {
	const theme = useTheme();
	const router = useRouter();
	const { user } = useUser();
	const { data: room } = useSWR<Room & { owners: User[] }>(
		router.query.id &&
			router.query.roomId &&
			`/api/house/${router.query.id}/rooms/${router.query.roomId}`
	);
	const { data: people } = useSWR<{
		owners: User[];
		members: User[];
		guests: User[];
	}>(router.query.id && `/api/house/${router.query.id}/people`);
	const [owners, setOwners] = useState<string[]>([]);
	const [personSelected, setPersonSelected] = useState('');
	const { enqueueSnackbar } = useSnackbar();
	useEffect(() => {
		if (!room) return;
		setOwners(room.ownerIds);
	}, [room]);
	const syncChanges = useCallback(
		async (owners: string[]) => {
			const payload = {
				ownerIds: owners,
			};
			const res = await fetch(
				`/api/house/${router.query.id}/rooms/${router.query.roomId}`,
				{
					method: 'PUT',
					body: JSON.stringify(payload),
					headers: {
						'content-type': 'application/json',
					},
				}
			);

			if (res.ok) {
				await mutate(
					`/api/house/${router.query.id}/rooms/${router.query.roomId}`
				);
				await mutate(`/api/house/${router.query.id}/rooms`);
				await enqueueSnackbar('Listo', { variant: 'success' });
			}
		},
		[enqueueSnackbar, router.query.id, router.query.roomId]
	);
	if (!room || !people || !user) return <></>;
	const isElevated = people.owners.some((o) => o.id === user.id);

	return (
		<Paper
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: theme.spacing(2),
				padding: theme.spacing(4),
				width: '100%',
			}}
		>
			<Typography variant="h3">Administrar propietarios</Typography>

			<Stack direction="row" spacing={1}>
				{room.owners.map((owner) => (
					<Chip
						key={owner.id}
						avatar={
							<Avatar key={owner.id} src={`/api/user/${owner.id}/avatar`} />
						}
						label={owner.name}
						onDelete={
							isElevated
								? () => {
										syncChanges(owners.filter((o) => o !== owner.id));
								  }
								: undefined
						}
					/>
				))}
			</Stack>
			<div
				css={{
					display: 'flex',
					gap: theme.spacing(2),
					margin: theme.spacing(2) + ' 0',
				}}
			>
				<FormControl fullWidth>
					<InputLabel>La persona</InputLabel>
					<Select
						value={personSelected}
						onChange={(e) => setPersonSelected(e.target.value)}
						label="La persona"
					>
						{people.owners
							.concat(people.members)
							.filter((e) => !owners.includes(e.id))
							.map((person) => (
								<MenuItem key={person.id} value={person.id}>
									<div
										css={{
											display: 'flex',
											alignItems: 'center',
											gap: theme.spacing(1),
										}}
									>
										<Avatar src={`/api/user/${person.id}/avatar`} />
										{person.name}
									</div>
								</MenuItem>
							))}
					</Select>
				</FormControl>
				<Button
					variant="contained"
					onClick={() => {
						syncChanges(owners.concat([personSelected]));
					}}
				>
					Agregar
				</Button>
			</div>
		</Paper>
	);
}

function DeleteRoomPanel() {
	const theme = useTheme();
	const [showModal, setShowModal] = useState(false);

	return (
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
			<DeleteRoomConfirmation
				open={showModal}
				handleClose={() => setShowModal(false)}
			/>
			<Typography variant="h3">Eliminar el cuarto</Typography>
			<Typography variant="body1">
				Eliminar el cuarto es permanente. ¡No puede recuperar!
			</Typography>
			<Button
				variant="contained"
				color="error"
				onClick={() => setShowModal(true)}
			>
				Eliminar
			</Button>
		</Paper>
	);
}
function DeleteRoomConfirmation({
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

		const res = await fetch(
			`/api/house/${house.id}/rooms/${router.query.roomId}`,
			{
				method: 'DELETE',
			}
		);
		if (res.ok) {
			await mutate(`/api/house/${house.id}/rooms`);
			await router.push(`/dashboard/houses/${house.id}/rooms`);
		}
	}, [house, router]);

	return (
		<Dialog open={open} onClose={handleClose}>
			<DialogTitle>¿Eliminar el cuarto?</DialogTitle>
			<DialogContent>
				<DialogContentText>
					¿Está seguro de que quiere eliminar esto cuarto? ¡No puede recuperar!
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
