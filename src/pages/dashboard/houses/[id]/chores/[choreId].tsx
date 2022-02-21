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
	Select,
	Stack,
	TextField,
	Typography,
	useTheme,
} from '@mui/material';
import { Navbar } from '../../../../../components/houses/navbar';
import useSWR, { mutate } from 'swr';
import { Chore, Room, User } from '@prisma/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import Check from '@mui/icons-material/Check';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import { useUser } from '../../../../../lib/hooks/use-user';
import { useCallback, useEffect, useState } from 'react';
import { Panel } from '../../../../../components/panel';
import { useSnackbar } from 'notistack';
import { useDialogState } from '../../../../../lib/hooks/use-dialog-state';
import { useHouse } from '../../../../../lib/hooks/use-house';
import {
	PageBackground,
	PageContainer,
} from '../../../../../components/page-layout';

export default function ChoreItem() {
	const theme = useTheme();
	const router = useRouter();
	const { data: chore, error } = useSWR<
		Chore & { assignedTo: User[]; createdBy: User }
	>(
		router.query.id &&
			router.query.choreId &&
			`/api/house/${router.query.id}/chores/${router.query.choreId}`
	);
	const { user } = useUser();
	const { data: people } = useSWR<{
		owners: User[];
		members: User[];
		guests: User[];
	}>(router.query.id && `/api/house/${router.query.id}/people`);
	useEffect(() => {
		if (!error) return;
		router.push(`/dashboard/houses/${router.query.id}/chores`);
	}, [router, error]);

	return (
		<PageBackground>
			<Navbar />
			{!chore || !people || !user ? (
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
			) : (
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
							<Link href={`/dashboard/houses/${router.query.id}/chores`}>
								<Button
									startIcon={<ChevronLeft />}
									css={{
										padding: theme.spacing(1),
										fontWeight: 400,
										fontSize: '1em',
									}}
								>
									Regresar a quehaceres
								</Button>
							</Link>
						</div>
						<Typography align="center" variant="h2">
							{chore.name}
						</Typography>
						<span />
					</div>
					<QuickActionsPanel />
					<ChangeNameDescriptionPanel />
					<AssignPeoplePanel />
					{(chore.createdById === user.id ||
						people.owners.some((o) => o.id === user.id)) && (
						<DeleteChorePanel />
					)}
				</PageContainer>
			)}
		</PageBackground>
	);
}

function QuickActionsPanel() {
	const router = useRouter();
	const { data: people } = useSWR<{
		owners: User[];
		members: User[];
		guests: User[];
	}>(router.query.id && `/api/house/${router.query.id}/people`);
	const { data: chore } = useSWR<
		Chore & { assignedTo: User[]; createdBy: User }
	>(
		router.query.id &&
			router.query.choreId &&
			`/api/house/${router.query.id}/chores/${router.query.choreId}`
	);
	const { user } = useUser();
	const acceptDone = useCallback(async () => {
		const res = await fetch(
			`/api/house/${router.query.id}/chores/${router.query.choreId}`,
			{
				method: 'DELETE',
			}
		);
		if (res.ok) {
			await mutate(`/api/house/${router.query.id}/chores`);
			await router.push(`/dashboard/houses/${router.query.id}/chores`);
		}
	}, [router]);
	const rejectDone = useCallback(async () => {
		const res = await fetch(
			`/api/house/${router.query.id}/chores/${router.query.choreId}`,
			{
				method: 'PATCH',
				body: JSON.stringify({ completed: false }),
				headers: {
					'content-type': 'application/json',
				},
			}
		);
		if (res.ok) {
			await mutate(
				`/api/house/${router.query.id}/chores/${router.query.choreId}`
			);
		}
	}, [router]);
	const markDone = useCallback(async () => {
		if (!people || !user) return;
		if (people.owners.some((o) => o.id === user.id)) {
			acceptDone();
		} else {
			const res = await fetch(
				`/api/house/${router.query.id}/chores/${router.query.choreId}`,
				{
					method: 'PATCH',
					body: JSON.stringify({ completed: true }),
					headers: {
						'content-type': 'application/json',
					},
				}
			);
			if (res.ok) {
				await mutate(
					`/api/house/${router.query.id}/chores/${router.query.choreId}`
				);
			}
		}
	}, [people, user, acceptDone, router.query.id, router.query.choreId]);

	if (
		!people ||
		!user ||
		!chore ||
		(!chore.completed && !chore.assignedToIds.includes(user.id))
	)
		return <></>;
	return (
		<Panel>
			{chore.completed ? (
				people.owners.some((u) => u.id === user.id) ? (
					<>
						<Typography variant="h5" align="center">
							Este quehacer está terminado
						</Typography>
						<Stack
							direction="row"
							spacing={2}
							css={{ justifyContent: 'center' }}
						>
							<Button
								color="success"
								variant="contained"
								startIcon={<Check />}
								onClick={acceptDone}
							>
								Aceptar
							</Button>
							<Button
								color="error"
								variant="contained"
								startIcon={<DoDisturbIcon />}
								onClick={rejectDone}
							>
								Rechazar
							</Button>
						</Stack>
					</>
				) : (
					<>
						<Typography variant="h5" align="center">
							Espera a que un dueño aceptar
						</Typography>
					</>
				)
			) : chore.assignedToIds.includes(user.id) ? (
				<>
					<Typography variant="h5" align="center">
						¿Está terminado?
					</Typography>
					<Stack direction="row" spacing={2} css={{ justifyContent: 'center' }}>
						<Button
							color="success"
							variant="contained"
							startIcon={<Check />}
							onClick={markDone}
						>
							Marcar como hecho
						</Button>
					</Stack>
				</>
			) : (
				false
			)}
		</Panel>
	);
}

function ChangeNameDescriptionPanel() {
	const theme = useTheme();
	const router = useRouter();
	const { user } = useUser();
	const { data: chore } = useSWR<
		Chore & { assignedTo: User[]; createdBy: User }
	>(
		router.query.id &&
			router.query.choreId &&
			`/api/house/${router.query.id}/chores/${router.query.choreId}`
	);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const { enqueueSnackbar } = useSnackbar();
	const { data: people } = useSWR<{
		owners: User[];
		members: User[];
		guests: User[];
	}>(router.query.id && `/api/house/${router.query.id}/people`);
	const updateDetails = useCallback(async () => {
		const payload = {
			name: name,
			description: description,
		};
		const house = await fetch(
			`/api/house/${router.query.id}/chores/${router.query.choreId}`,
			{
				method: 'PUT',
				body: JSON.stringify(payload),
				headers: {
					'content-type': 'application/json',
				},
			}
		);
		if (house.ok) {
			await enqueueSnackbar('Listo', { variant: 'success' });
			await mutate(
				`/api/house/${router.query.id}/chores/${router.query.choreId}`
			);
		}
	}, [router, name, description]);

	useEffect(() => {
		if (chore && name === '' && description === '') {
			setName(chore.name);
			setDescription(chore.description);
		}
		// doesn't include name/description so it only happens on first render
	}, [chore]);
	if (!chore || !people || !user) return <></>;

	const isElevated =
		chore.createdById === user.id ||
		people.owners.some((o) => o.id === user.id);
	return (
		<Panel>
			<Typography variant="h3">Cambiar el nombre y la descripción</Typography>
			<div
				css={{
					display: 'grid',
					gap: theme.spacing(2),
					margin: theme.spacing(2) + ' 0',
					gridTemplateAreas: '"name button"\n' + '"description button"',
					gridTemplateColumns: 'auto max-content',
				}}
			>
				<TextField
					name="name"
					label="El nombre de quehacer"
					fullWidth
					variant="outlined"
					value={name}
					onChange={(e) => setName(e.target.value)}
					css={{ gridArea: 'name' }}
					disabled={!isElevated}
				/>
				<TextField
					name="description"
					label="La descripción de quehacer"
					fullWidth
					variant="outlined"
					value={description}
					multiline
					onChange={(e) => setDescription(e.target.value)}
					css={{ gridArea: 'description' }}
					disabled={!isElevated}
				/>
				<Button
					variant="contained"
					onClick={updateDetails}
					css={{ gridArea: 'button' }}
					disabled={!isElevated}
				>
					Cambiar
				</Button>
			</div>
		</Panel>
	);
}

function AssignPeoplePanel() {
	const theme = useTheme();
	const router = useRouter();
	const { user } = useUser();
	const { data: chore } = useSWR<
		Chore & { assignedTo: User[]; createdBy: User }
	>(
		router.query.id &&
			router.query.choreId &&
			`/api/house/${router.query.id}/chores/${router.query.choreId}`
	);
	const { data: people } = useSWR<{
		owners: User[];
		members: User[];
		guests: User[];
	}>(router.query.id && `/api/house/${router.query.id}/people`);
	const [assignedTo, setAssignedTo] = useState<string[]>([]);
	const [personSelected, setPersonSelected] = useState<string | null>('');
	const { enqueueSnackbar } = useSnackbar();
	useEffect(() => {
		if (!chore) return;
		setAssignedTo(chore.assignedToIds);
	}, [chore]);
	const syncChanges = useCallback(
		async (assignedToIds: string[]) => {
			const payload = {
				assignedToIds: assignedToIds,
			};
			const res = await fetch(
				`/api/house/${router.query.id}/chores/${router.query.choreId}`,
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
					`/api/house/${router.query.id}/chores/${router.query.choreId}`
				);
				await mutate(`/api/house/${router.query.id}/chores`);
				await enqueueSnackbar('Listo', { variant: 'success' });
			}
		},
		[enqueueSnackbar, router]
	);
	if (!chore || !people || !user) return <></>;
	const isElevated =
		chore.createdById === user.id ||
		people.owners.some((o) => o.id === user.id);

	return (
		<Panel>
			<Typography variant="h3">Escoge personas</Typography>

			<Stack direction="row" spacing={1}>
				{chore.assignedTo.map((person) => (
					<Chip
						key={person.id}
						avatar={
							<Avatar key={person.id} src={`/api/user/${person.id}/avatar`} />
						}
						label={person.name}
						onDelete={
							isElevated
								? () => syncChanges(assignedTo.filter((o) => o !== person.id))
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
						disabled={!isElevated}
					>
						{people.owners
							.concat(people.members)
							.filter((e) => !assignedTo.includes(e.id))
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
					disabled={!isElevated}
					onClick={() => {
						if (!personSelected) return;
						syncChanges(assignedTo.concat([personSelected]));
						setPersonSelected(null);
					}}
				>
					Agregar
				</Button>
			</div>
		</Panel>
	);
}

function DeleteChorePanel() {
	const theme = useTheme();
	const [open, show, handleClose, id] = useDialogState();

	return (
		<Panel
			css={{
				border: 'solid 1px red',
			}}
		>
			<DeleteChoreConfirmation key={id} open={open} handleClose={handleClose} />
			<Typography variant="h3">Eliminar el quehacer</Typography>
			<Typography variant="body1">
				Eliminar el quehacer es permanente. ¡No puede recuperar!
			</Typography>
			<Button variant="contained" color="error" onClick={show}>
				Eliminar
			</Button>
		</Panel>
	);
}
function DeleteChoreConfirmation({
	open,
	handleClose,
}: {
	open: boolean;
	handleClose: () => void;
}) {
	const router = useRouter();

	const handleDelete = useCallback(async () => {
		const res = await fetch(
			`/api/house/${router.query.id}/chores/${router.query.choreId}`,
			{
				method: 'DELETE',
			}
		);
		if (res.ok) {
			await mutate(`/api/house/${router.query.id}/chores`);
			await router.push(`/dashboard/houses/${router.query.id}/chores`);
		}
	}, [router]);

	return (
		<Dialog open={open} onClose={handleClose}>
			<DialogTitle>¿Eliminar el quehacer?</DialogTitle>
			<DialogContent>
				<DialogContentText>
					¿Está seguro de que quiere eliminar este quehacer? ¡No puede
					recuperar!
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
