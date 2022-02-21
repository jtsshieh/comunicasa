import {
	Avatar,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
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
import { Panel } from '../../../../../components/panel';
import { useDialogState } from '../../../../../lib/hooks/use-dialog-state';
import Link from 'next/link';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import {
	PageBackground,
	PageContainer,
} from '../../../../../components/page-layout';
import { DeleteConfirmation } from '../../../../../components/delete-confirmation';

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
		<PageBackground>
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
			) : room.ownerIds.includes(user.id) ||
			  house.ownerIds.includes(user.id) ? (
				<PageContainer>
					<div
						css={{
							width: '100%',
							display: 'grid',
							gridTemplateColumns: '1fr auto 1fr',

							[theme.breakpoints.down('md')]: {
								gridTemplateColumns: 'auto',
							},
						}}
					>
						<div
							css={{
								display: 'flex',
								alignItems: 'center',
							}}
						>
							<Link href={`/dashboard/houses/${router.query.id}/rooms`}>
								<Button
									startIcon={<ChevronLeft />}
									css={{
										padding: theme.spacing(1),
										fontWeight: 400,
										fontSize: '1em',
									}}
								>
									Regresar a cuartos
								</Button>
							</Link>
						</div>
						<Typography align="center" variant="h2">
							{room.name}
						</Typography>
						<span />
					</div>
					<NameChangePanel />
					<ManageOwnersPanels />
					<DeleteRoomPanel />
				</PageContainer>
			) : (
				<></>
			)}
		</PageBackground>
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
		<Panel>
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
		</Panel>
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
	const [personSelected, setPersonSelected] = useState<string | null>('');
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
		<Panel>
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
								? () => syncChanges(owners.filter((o) => o !== owner.id))
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
						if (!personSelected) return;
						syncChanges(owners.concat([personSelected]));
						setPersonSelected(null);
					}}
				>
					Agregar
				</Button>
			</div>
		</Panel>
	);
}

function DeleteRoomPanel() {
	const router = useRouter();
	const [open, show, handleClose, id] = useDialogState();
	const handleDelete = useCallback(async () => {
		const res = await fetch(
			`/api/house/${router.query.id}/rooms/${router.query.roomId}`,
			{
				method: 'DELETE',
			}
		);
		if (res.ok) {
			await mutate(`/api/house/${router.query.id}/rooms`);
			await router.push(`/dashboard/houses/${router.query.id}/rooms`);
		}
	}, [router]);

	return (
		<Panel
			css={{
				border: 'solid 1px red',
			}}
		>
			<DeleteConfirmation
				key={id}
				open={open}
				item="el cuarto"
				handleClose={handleClose}
				handleDelete={handleDelete}
			/>
			<Typography variant="h3">Eliminar el cuarto</Typography>
			<Typography variant="body1">
				Eliminar el cuarto es permanente. ¡No puede recuperar!
			</Typography>
			<Button variant="contained" color="error" onClick={show}>
				Eliminar
			</Button>
		</Panel>
	);
}
