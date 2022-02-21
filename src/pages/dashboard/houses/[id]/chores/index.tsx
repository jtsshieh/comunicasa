import {
	alpha,
	Avatar,
	AvatarGroup,
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
import { Chore, User } from '@prisma/client';
import { useHouse } from '../../../../../lib/hooks/use-house';
import { useUser } from '../../../../../lib/hooks/use-user';
import { Navbar } from '../../../../../components/houses/navbar';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { useDialogState } from '../../../../../lib/hooks/use-dialog-state';
import { DateTimePicker } from '@mui/lab';
import { grey, red } from '@mui/material/colors';
import Link from 'next/link';
import { Panel } from '../../../../../components/panel';

export default function Chores() {
	const theme = useTheme();
	const router = useRouter();
	const { data: chores } = useSWR<(Chore & { createdBy: User })[]>(
		router.query.id && `/api/house/${router.query.id}/chores`
	);
	const house = useHouse();
	const { user } = useUser();
	useEffect(() => {
		if (!house || !user) return;
		if (!house.ownerIds.includes(user.id) && !house.memberIds.includes(user.id))
			router.push(`/dashboard/houses/${house.id}`);
	}, [house, user, router]);

	return (
		<div
			css={{
				backgroundColor: theme.palette.background.default,
				minHeight: '100vh',
				color: 'white',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<Navbar />
			{!chores || !house || !user ? (
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
				<Container
					css={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: theme.spacing(4),
						padding: theme.spacing(4),
					}}
				>
					<Typography align="center" variant="h2">
						Los quehaceres
					</Typography>
					<div
						css={{
							display: 'grid',
							gap: theme.spacing(4),
							gridTemplateColumns: 'repeat(2, 1fr)',
						}}
					>
						<ForYou />
						{house.ownerIds.includes(user.id) ? (
							<AllChores />
						) : (
							<CreatedChores />
						)}
					</div>
				</Container>
			)}
		</div>
	);
}

export function ForYou() {
	const router = useRouter();
	const { data: chores } = useSWR<(Chore & { createdBy: User })[]>(
		router.query.id && `/api/house/${router.query.id}/chores`
	);
	const { user } = useUser();
	if (!chores || !user) return <></>;
	const userChores = chores.filter((chore) =>
		chore.assignedToIds.includes(user.id)
	);
	return (
		<div>
			<Typography variant="h3" align="center">
				Para usted
			</Typography>
			{userChores.length > 0 ? (
				<Stack spacing={2}>
					{userChores.map((chore) => (
						<ChoreTile key={chore.id} chore={chore} />
					))}
				</Stack>
			) : (
				<Typography variant="body1">
					¡Está listo! No tiene otros quehaceres.
				</Typography>
			)}
		</div>
	);
}

function AllChores() {
	const router = useRouter();
	const theme = useTheme();
	const { data: chores } = useSWR<(Chore & { createdBy: User })[]>(
		router.query.id && `/api/house/${router.query.id}/chores`
	);
	const { user } = useUser();
	const [open, show, handleClose, id] = useDialogState();
	if (!chores || !user) return <></>;

	return (
		<div>
			<Typography variant="h3" align="center">
				Todos los quehaceres
			</Typography>
			<CreateChoreModel key={id} open={open} handleClose={handleClose} />
			<Stack spacing={2}>
				{chores.map((chore) => (
					<ChoreTile key={chore.id} chore={chore} />
				))}
				<Button
					onClick={show}
					css={{
						width: '100%',
						padding: theme.spacing(4),
						justifyContent: 'center',
					}}
				>
					<AddIcon />
				</Button>
			</Stack>
		</div>
	);
}

function CreatedChores() {
	const router = useRouter();
	const theme = useTheme();
	const { data: chores } = useSWR<(Chore & { createdBy: User })[]>(
		router.query.id && `/api/house/${router.query.id}/chores`
	);
	const { user } = useUser();
	const [open, show, handleClose, id] = useDialogState();
	if (!chores || !user) return <></>;

	return (
		<div>
			<Typography variant="h3" align="center">
				Quehaceres creados
			</Typography>
			<CreateChoreModel key={id} open={open} handleClose={handleClose} />
			<Stack spacing={2}>
				{chores
					.filter((c) => c.createdById === user.id)
					.map((chore) => (
						<ChoreTile key={chore.id} chore={chore} />
					))}
				<Button
					onClick={show}
					css={{
						width: '100%',
						padding: theme.spacing(4),
						justifyContent: 'center',
					}}
				>
					<AddIcon />
				</Button>
			</Stack>
		</div>
	);
}

function ChoreTile({ chore }: { chore: Chore & { createdBy: User } }) {
	const theme = useTheme();
	const router = useRouter();

	return (
		<Link href={`/dashboard/houses/${router.query.id}/chores/${chore.id}`}>
			<Paper
				css={{
					display: 'flex',
					flexDirection: 'column',
					padding: theme.spacing(2),
					cursor: 'pointer',
					'&:hover': {
						backgroundColor: alpha(
							theme.palette.background.paper,
							1 - theme.palette.action.hoverOpacity
						),
					},
				}}
			>
				<div css={{ display: 'flex', alignItems: 'center' }}>
					<Typography variant="h4">{chore.name}</Typography>
					<AvatarGroup css={{ justifyContent: 'flex-start', flex: 1 }}>
						{chore.assignedToIds.map((person) => (
							<Avatar key={person} src={`/api/user/${person}/avatar`} />
						))}
					</AvatarGroup>
				</div>

				<Typography variant="body1" color={grey[500]}>
					{chore.description}
				</Typography>
				<Typography
					variant="body1"
					color={grey[500]}
					css={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}
				>
					Creado por:
					<div
						css={{
							display: 'flex',
							alignItems: 'center',
							gap: theme.spacing(1),
						}}
					>
						<Avatar src={`/api/user/${chore.createdById}/avatar`} />
						{chore.createdBy.name}
					</div>
				</Typography>
				<Typography variant="body1" color={red[300]}>
					Fecha límite: {new Date(chore.dueAt).toLocaleString('es-ES')}
				</Typography>
			</Paper>
		</Link>
	);
}

function CreateChoreModel({
	open,
	handleClose,
}: {
	open: boolean;
	handleClose: () => void;
}) {
	const router = useRouter();
	const theme = useTheme();
	const [assignedTo, setAssignedTo] = useState<User[]>([]);
	const [dueAt, setDueAt] = useState<Date | null>(new Date());
	const { data: people } = useSWR<{
		owners: User[];
		members: User[];
		guests: User[];
	}>(router.query.id && `/api/house/${router.query.id}/people`);
	const [personSelected, setPersonSelected] = useState<string | null>('');
	const { user } = useUser();
	const handleCreate = useCallback(
		async (e: FormEvent) => {
			e.preventDefault();
			const target = e.target as typeof e.target & {
				name: { value: string };
				description: { value: string };
			};
			const payload = {
				name: target.name.value,
				description: target.description.value,
				assignedToIds: assignedTo.map((p) => p.id),
				dueAt: dueAt?.toISOString(),
				createdBy: user?.id,
			};
			const house = await fetch(`/api/house/${router.query.id}/chores`, {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					'content-type': 'application/json',
				},
			});
			if (house.ok) {
				handleClose();
				await mutate(`/api/house/${router.query.id}/chores`);
			}
		},
		[user, assignedTo, dueAt, router.query.id, handleClose]
	);

	if (!people) return <></>;
	return (
		<Dialog
			open={open}
			onClose={handleClose}
			// @ts-ignore
			PaperProps={{ component: 'form', onSubmit: handleCreate }}
		>
			<DialogTitle>Crear un quehacer</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					name="name"
					label="El nombre de quehacer"
					fullWidth
					variant="outlined"
					margin="normal"
				/>
				<TextField
					name="description"
					label="La descripción de quehacer"
					fullWidth
					variant="outlined"
					margin="dense"
					multiline
				/>
				<DateTimePicker
					renderInput={(props) => (
						<TextField fullWidth margin="dense" {...props} />
					)}
					label="Fecha límite"
					value={dueAt}
					onChange={(newValue) => setDueAt(newValue)}
					minDateTime={new Date()}
				/>
				<div css={{ margin: theme.spacing(2) + ' 0' }}>
					<DialogContentText>
						Escoge personas que van a hacer el quehacer.
					</DialogContentText>
					<Stack direction="row" spacing={1}>
						{assignedTo.map((person) => (
							<Chip
								key={person.id}
								avatar={
									<Avatar
										key={person.id}
										src={`/api/user/${person.id}/avatar`}
									/>
								}
								label={person.name}
								onDelete={() =>
									setAssignedTo(assignedTo.filter((p) => p.id !== person.id))
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
									.filter((e) => !assignedTo.some((p) => p.id === e.id))
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
							onClick={() => {
								if (!personSelected) return;
								setAssignedTo(
									assignedTo.concat([
										people.owners
											.concat(people.members)
											.find((p) => p.id === personSelected) as User,
									])
								);
								setPersonSelected(null);
							}}
						>
							Agregar
						</Button>
					</div>
				</div>
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
