import {
	Avatar,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	IconButton,
	InputLabel,
	ListItemIcon,
	Menu,
	MenuItem,
	Select,
	TextField,
	Typography,
	useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useUser } from '../../../../../../lib/hooks/use-user';
import useSWR, { mutate } from 'swr';
import { Chat as ChatModel, User } from '@prisma/client';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useDialogState } from '../../../../../../lib/hooks/use-dialog-state';
import { Navbar } from '../../../../../../components/houses/navbar';
import { DeleteConfirmation } from '../../../../../../components/delete-confirmation';
import Link from 'next/link';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import {
	PageBackground,
	PageContainer,
} from '../../../../../../components/page-layout';
import { useSnackbar } from 'notistack';
import { Panel } from '../../../../../../components/panel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function Chat() {
	const theme = useTheme();
	const router = useRouter();
	const { user } = useUser();
	const { data: chat } = useSWR<ChatModel & { members: User[]; owner: User }>(
		router.query.id &&
			router.query.chatId &&
			`/api/house/${router.query.id}/chats/${router.query.chatId}`
	);
	const [deleteChatOpen, showDeleteChat, handleDeleteChatClose, deleteListId] =
		useDialogState('delete');
	const handleDeleteChat = useCallback(async () => {
		const res = await fetch(
			`/api/house/${router.query.id}/chats/${router.query.chatId}`,
			{
				method: 'DELETE',
			}
		);
		if (res.ok) {
			await mutate(`/api/house/${router.query.id}/chats`);
			await router.push(`/dashboard/houses/${router.query.id}/chats`);
		}
	}, [router]);
	useEffect(() => {
		if (!chat || !user) return;
		if (chat.ownerId !== user.id) {
			router.push(
				`/dashboard/houses/${router.query.id}/chats/${router.query.chatId}`
			);
		}
	}, [chat, router, user]);

	return (
		<PageBackground>
			<Navbar />
			<DeleteConfirmation
				key={deleteListId}
				open={deleteChatOpen}
				item="el chat"
				handleClose={handleDeleteChatClose}
				handleDelete={handleDeleteChat}
			/>

			{!chat || !user ? (
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
								gridTemplateAreas: '"back settings"\n' + '"text text"',
								gridTemplateColumns: 'none',
							},
						}}
					>
						<div
							css={{
								display: 'flex',
								alignItems: 'center',
								[theme.breakpoints.down('md')]: {
									gridArea: 'back',
								},
							}}
						>
							<Link
								href={`/dashboard/houses/${router.query.id}/chats/${router.query.chatId}`}
								passHref
							>
								<Button
									startIcon={<ChevronLeft />}
									css={{
										padding: theme.spacing(1),
										fontWeight: 400,
										fontSize: '1em',
									}}
								>
									Regresar a chat
								</Button>
							</Link>
						</div>
						<Typography
							align="center"
							variant="h2"
							css={{
								[theme.breakpoints.down('md')]: {
									gridArea: 'text',
								},
							}}
						>
							Configuración de Chat
						</Typography>
						<span />
					</div>
					<EditNamePanel />
					<EditPeoplePanel />
					<DeleteChatPanel />
				</PageContainer>
			)}
		</PageBackground>
	);
}

function EditNamePanel() {
	const theme = useTheme();
	const router = useRouter();
	const { data: chat } = useSWR<ChatModel>(
		router.query.id &&
			router.query.chatId &&
			`/api/house/${router.query.id}/chats/${router.query.chatId}`
	);
	const [name, setName] = useState(chat?.name);
	const { enqueueSnackbar } = useSnackbar();
	useEffect(() => {
		setName(chat?.name);
	}, [chat]);
	const changeName = useCallback(async () => {
		const payload = {
			name,
		};
		const res = await fetch(
			`/api/house/${router.query.id}/chats/${router.query.chatId}`,
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
				`/api/house/${router.query.id}/chats/${router.query.chatId}`
			);
			await mutate(`/api/house/${router.query.id}/chats`);
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
					label="El nombre de chat"
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

function EditPeoplePanel() {
	const router = useRouter();
	const { enqueueSnackbar } = useSnackbar();
	const theme = useTheme();
	const { data: people } = useSWR<{
		owners: User[];
		members: User[];
		guests: User[];
	}>(router.query.id && `/api/house/${router.query.id}/people`);
	const { data: chat } = useSWR<ChatModel & { members: User[]; owner: User }>(
		router.query.id &&
			router.query.chatId &&
			`/api/house/${router.query.id}/chats/${router.query.chatId}`
	);
	const [personSelected, setPersonSelected] = useState<string | null>('');
	const handleAdd = useCallback(async () => {
		const payload = {
			member: personSelected,
		};
		const res = await fetch(
			`/api/house/${router.query.id}/chats/${router.query.chatId}/members`,
			{
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					'content-type': 'application/json',
				},
			}
		);
		if (res.ok) {
			await mutate(
				`/api/house/${router.query.id}/chats/${router.query.chatId}`
			);
			await mutate(`/api/house/${router.query.id}/chats`);
			await enqueueSnackbar('Listo', { variant: 'success' });
		}
	}, [router, personSelected, enqueueSnackbar]);

	if (!people || !chat) return <></>;
	return (
		<Panel>
			<Typography variant="h3">Miembros de chat</Typography>
			<div
				css={{
					display: 'grid',
					gridTemplateColumns: '1fr auto',
					rowGap: theme.spacing(2),
					width: '100%',
				}}
			>
				{chat.members.map((person) => (
					<Fragment key={person.id}>
						<div
							css={{
								display: 'flex',
								alignItems: 'center',
								gap: theme.spacing(1),
							}}
						>
							<Avatar key={person.id} src={`/api/user/${person.id}/avatar`} />
							<Typography variant="body1">{person.name}</Typography>
							{chat.owner.id === person.id && <AdminPanelSettingsIcon />}
						</div>
						<PeopleOptions
							person={person}
							isOwner={chat.owner.id === person.id}
						/>
					</Fragment>
				))}
			</div>

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
							.concat(people.guests)
							.filter((e) => !chat.memberIds.includes(e.id))
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
					onClick={async () => {
						if (!personSelected) return;
						await handleAdd();
						setPersonSelected(null);
					}}
				>
					Agregar
				</Button>
			</div>
		</Panel>
	);
}

function PeopleOptions({
	person,
	isOwner,
}: {
	person: User;
	isOwner: boolean;
}) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const { enqueueSnackbar } = useSnackbar();
	const [
		deleteMemberOpen,
		showDeleteMember,
		handleDeleteMemberClose,
		deleteMemberKey,
	] = useDialogState();
	const [makeOwnerOpen, showMakeOwner, handleMakeOwnerClose, makeOwnerKey] =
		useDialogState();
	const open = Boolean(anchorEl);
	const router = useRouter();
	const handleDelete = useCallback(async () => {
		const payload = {
			member: person.id,
		};
		const res = await fetch(
			`/api/house/${router.query.id}/chats/${router.query.chatId}/members`,
			{
				method: 'DELETE',
				body: JSON.stringify(payload),
				headers: {
					'content-type': 'application/json',
				},
			}
		);
		if (res.ok) {
			await mutate(
				`/api/house/${router.query.id}/chats/${router.query.chatId}`
			);
			await mutate(`/api/house/${router.query.id}/chats`);
			await enqueueSnackbar('Listo', { variant: 'success' });
		}
	}, [router, person, enqueueSnackbar]);
	const handleMakeOwner = useCallback(async () => {
		const payload = {
			owner: person.id,
		};
		const res = await fetch(
			`/api/house/${router.query.id}/chats/${router.query.chatId}/members`,
			{
				method: 'PATCH',
				body: JSON.stringify(payload),
				headers: {
					'content-type': 'application/json',
				},
			}
		);
		if (res.ok) {
			await mutate(
				`/api/house/${router.query.id}/chats/${router.query.chatId}`
			);
			await mutate(`/api/house/${router.query.id}/chats`);
			await enqueueSnackbar('Listo', { variant: 'success' });
			await router.push(
				`/dashboard/houses/${router.query.id}/chats/${router.query.chatId}`
			);
		}
	}, [router, person, enqueueSnackbar, setAnchorEl]);

	return (
		<div
			css={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<DeleteConfirmation
				key={deleteMemberKey}
				open={deleteMemberOpen}
				item="la gente"
				handleClose={handleDeleteMemberClose}
				handleDelete={handleDelete}
			/>
			<MakeOwnerConfirmation
				key={makeOwnerKey}
				open={makeOwnerOpen}
				handleClose={handleMakeOwnerClose}
				handleMakeOwner={handleMakeOwner}
				person={person.name}
			/>
			<IconButton
				onClick={(e) => setAnchorEl(e.currentTarget)}
				disabled={isOwner}
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
				<MenuItem onClick={showMakeOwner}>
					<ListItemIcon>
						<AdminPanelSettingsIcon />
					</ListItemIcon>
					Haccer al dueño
				</MenuItem>
				<MenuItem onClick={showDeleteMember}>
					<ListItemIcon>
						<DeleteIcon />
					</ListItemIcon>
					Eliminar
				</MenuItem>
			</Menu>
		</div>
	);
}

export function MakeOwnerConfirmation({
	open,
	handleClose,
	handleMakeOwner,
	person,
}: {
	open: boolean;
	handleClose: () => void;
	handleMakeOwner: () => void;
	person: string;
}) {
	return (
		<Dialog open={open} onClose={handleClose}>
			<DialogTitle>¿Hacer {person} el dueño del chat?</DialogTitle>
			<DialogContent>
				<DialogContentText>
					¿Está seguro de que quiere hacer {person} el dueño del chat? ¡No puede
					deshacer!
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>Cancelar</Button>
				<Button onClick={handleMakeOwner} variant="contained" color="error">
					Hacer
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function DeleteChatPanel() {
	const router = useRouter();
	const [open, show, handleClose, id] = useDialogState();
	const handleDelete = useCallback(async () => {
		const res = await fetch(
			`/api/house/${router.query.id}/chats/${router.query.chatId}`,
			{
				method: 'DELETE',
			}
		);
		if (res.ok) {
			await mutate(`/api/house/${router.query.id}/chats`);
			await router.push(`/dashboard/houses/${router.query.id}/chats`);
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
				item="el chat"
				handleClose={handleClose}
				handleDelete={handleDelete}
			/>
			<Typography variant="h3">Eliminar el chat</Typography>
			<Typography variant="body1">
				Eliminar el chat es permanente. ¡No puede recuperar!
			</Typography>
			<Button variant="contained" color="error" onClick={show}>
				Eliminar
			</Button>
		</Panel>
	);
}
