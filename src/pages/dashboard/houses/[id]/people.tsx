import {
	Avatar,
	Button,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	IconButton,
	ListItemIcon,
	Menu,
	MenuItem,
	Paper,
	Select,
	TextField,
	Typography,
	useTheme,
} from '@mui/material';
import { useHouse } from '../../../../lib/hooks/use-house';
import { Navbar } from '../../../../components/houses/navbar';
import { User } from '@prisma/client';
import { FormEvent, useCallback, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import { useDialogState } from '../../../../lib/hooks/use-dialog-state';
import { useUser } from '../../../../lib/hooks/use-user';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { grey } from '@mui/material/colors';

export default function HousePeople() {
	const theme = useTheme();
	const router = useRouter();
	const house = useHouse();
	const { user } = useUser();
	const [open, show, handleClose, id] = useDialogState();
	const { data: people } = useSWR<{
		owners: User[];
		members: User[];
		guests: User[];
	}>(router.query.id && `/api/house/${router.query.id}/people`);
	const isOwner = !!(user && house?.ownerIds.includes(user.id));
	const handleChange = useCallback(
		async (user: string, role: string) => {
			const payload = {
				role,
			};
			const house = await fetch(
				`/api/house/${router.query.id}/people/${user}`,
				{
					method: 'PATCH',
					body: JSON.stringify(payload),
					headers: {
						'content-type': 'application/json',
					},
				}
			);
			if (house.ok) {
				await mutate(`/api/house/${router.query.id}/people`);
			}
		},
		[router]
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
			<AddPersonModal key={id} open={open} handleClose={handleClose} />
			{!house || !people || !user ? (
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
				<Container
					css={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: theme.spacing(4),
						paddingTop: theme.spacing(4),
						paddingBottom: theme.spacing(4),
					}}
				>
					<Typography align="center" variant="h2">
						Las Gentes
					</Typography>
					<Paper
						css={{
							display: 'grid',
							gridTemplateColumns: '7fr 3fr 56px',
							padding: theme.spacing(4),
							rowGap: theme.spacing(2),
							width: '100%',
						}}
					>
						<Typography variant="subtitle1">Las gentes</Typography>
						<Typography variant="subtitle1" align="center">
							El rol
						</Typography>
						<div />
						<OwnersGroup people={people.owners} />
						<MembersGroup
							people={people.members}
							canChange={isOwner}
							handleChange={handleChange}
						/>
						<GuestsGroup
							people={people.guests}
							canChange={isOwner}
							handleChange={handleChange}
						/>
						{isOwner && (
							<Button css={{ gridColumn: '1 / span 3' }} onClick={show}>
								<AddIcon />
							</Button>
						)}
					</Paper>
				</Container>
			)}
		</div>
	);
}

function AddPersonModal({
	open,
	handleClose,
}: {
	open: boolean;
	handleClose: () => void;
}) {
	const [email, setEmail] = useState('');
	const [role, setRole] = useState('guest');
	const [error, setError] = useState(false);
	const theme = useTheme();
	const router = useRouter();
	const handleAdd = useCallback(
		async (e: FormEvent) => {
			e.preventDefault();
			const payload = {
				email,
				role,
			};
			const house = await fetch(`/api/house/${router.query.id}/people`, {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					'content-type': 'application/json',
				},
			});
			if (house.ok) {
				handleClose();
				await mutate(`/api/house/${router.query.id}/people`);
			} else {
				setError(true);
			}
		},
		[email, handleClose, role, router.query.id]
	);
	return (
		<Dialog
			open={open}
			onClose={handleClose}
			// @ts-ignore
			PaperProps={{ component: 'form', onSubmit: handleAdd }}
		>
			<DialogTitle>Agregar una persona</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Escribir el correo electrónico de una person que quiere agregar a su
					casa.
				</DialogContentText>
				<div
					css={{
						display: 'flex',
						gap: theme.spacing(2),
						width: '100%',
					}}
				>
					<TextField
						autoFocus
						name="name"
						label="Correo Electrónico"
						variant="outlined"
						margin="normal"
						css={{ flex: 1 }}
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						error={error}
						helperText={
							error ? 'La cuenta con el correo electrónico no existe' : ''
						}
					/>
					<FormControl margin="normal">
						<Select value={role} onChange={(e) => setRole(e.target.value)}>
							<MenuItem value="owner">Dueño</MenuItem>
							<MenuItem value="member">Miembro</MenuItem>
							<MenuItem value="guest">Invitado</MenuItem>
						</Select>
					</FormControl>
				</div>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>Cancelar</Button>
				<Button type="submit" variant="contained">
					Agregar
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function RemovePerson({
	person,
	disabled,
}: {
	person: User;
	disabled: boolean;
}) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const router = useRouter();

	const open = Boolean(anchorEl);
	const handleDelete = useCallback(async () => {
		const house = await fetch(
			`/api/house/${router.query.id}/people/${person.id}`,
			{
				method: 'DELETE',
			}
		);
		if (house.ok) {
			await mutate(`/api/house/${router.query.id}/people`);
		}
	}, [router, person]);

	return (
		<div
			css={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<IconButton
				onClick={(e) => setAnchorEl(e.currentTarget)}
				disabled={disabled}
			>
				<MoreVertIcon />
			</IconButton>
			<Menu
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				open={open}
				onClose={() => setAnchorEl(null)}
			>
				<MenuItem onClick={handleDelete}>
					<ListItemIcon>
						<DeleteIcon />
					</ListItemIcon>
					Eliminar
				</MenuItem>
			</Menu>
		</div>
	);
}

function OwnersGroup({ people }: { people: User[] }) {
	const theme = useTheme();
	return (
		<>
			{people.map((person) => (
				<Fragment key={person.id}>
					<div
						css={{
							display: 'flex',
							gap: theme.spacing(2),
							alignItems: 'center',
						}}
					>
						<Avatar src={`/api/user/${person.id}/avatar`} />
						<div>
							<Typography variant="body2">{person.name}</Typography>
							<Typography variant="body2" css={{ color: grey[700] }}>
								{person.email}
							</Typography>
						</div>
					</div>
					<div>
						<FormControl fullWidth disabled>
							<Select value="owner">
								<MenuItem value="owner">Dueño</MenuItem>
								<MenuItem value="member">Miembro</MenuItem>
								<MenuItem value="guest">Invitado</MenuItem>
							</Select>
						</FormControl>
					</div>
					<RemovePerson disabled={true} person={person} />
				</Fragment>
			))}
		</>
	);
}

function MembersGroup({
	people,
	canChange,
	handleChange,
}: {
	people: User[];
	canChange: boolean;
	handleChange: (user: string, role: string) => void;
}) {
	const theme = useTheme();
	return (
		<>
			{people.map((person) => (
				<>
					<div
						css={{
							display: 'flex',
							gap: theme.spacing(2),
							alignItems: 'center',
						}}
					>
						<Avatar src={`/api/user/${person.id}/avatar`} />
						<div>
							<Typography variant="body2">{person.name}</Typography>
							<Typography variant="body2" css={{ color: grey[700] }}>
								{person.email}
							</Typography>
						</div>
					</div>
					<div>
						<FormControl fullWidth disabled={!canChange}>
							<Select
								value="member"
								onChange={(e) => handleChange(person.id, e.target.value)}
							>
								<MenuItem value="owner">Dueño</MenuItem>
								<MenuItem value="member">Miembro</MenuItem>
								<MenuItem value="guest">Invitado</MenuItem>
							</Select>
						</FormControl>
					</div>
					<RemovePerson disabled={!canChange} person={person} />
				</>
			))}
		</>
	);
}

function GuestsGroup({
	people,
	canChange,
	handleChange,
}: {
	people: User[];
	canChange: boolean;
	handleChange: (user: string, role: string) => void;
}) {
	const theme = useTheme();

	return (
		<>
			{people.map((person) => (
				<>
					<div
						css={{
							display: 'flex',
							gap: theme.spacing(2),
							alignItems: 'center',
						}}
					>
						<Avatar src={`/api/user/${person.id}/avatar`} />
						<div>
							<Typography variant="body2">{person.name}</Typography>
							<Typography variant="body2" css={{ color: grey[700] }}>
								{person.email}
							</Typography>
						</div>
					</div>
					<div>
						<FormControl fullWidth disabled={!canChange}>
							<Select
								value="guest"
								onChange={(e) => handleChange(person.id, e.target.value)}
							>
								<MenuItem value="owner">Dueño</MenuItem>
								<MenuItem value="member">Miembro</MenuItem>
								<MenuItem value="guest">Invitado</MenuItem>
							</Select>
						</FormControl>
					</div>
					<RemovePerson disabled={!canChange} person={person} />
				</>
			))}
		</>
	);
}
