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
	ListItemButton,
	ListItemText,
	Paper,
	TextField,
	Typography,
	useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import { Chat as ChatModel } from '@prisma/client';
import { useDialogState } from '../../../../../lib/hooks/use-dialog-state';
import { useHouse } from '../../../../../lib/hooks/use-house';
import { useUser } from '../../../../../lib/hooks/use-user';
import {
	PageBackground,
	PageContainer,
} from '../../../../../components/page-layout';
import { Navbar } from '../../../../../components/houses/navbar';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';
import { FormEvent, useCallback } from 'react';

export default function Chats() {
	const theme = useTheme();
	const router = useRouter();
	const { data: chats } = useSWR<ChatModel[]>(
		router.query.id && `/api/house/${router.query.id}/chats`
	);
	const [open, show, handleClose, id] = useDialogState();
	const house = useHouse();
	const { user } = useUser();

	return (
		<PageBackground>
			<Navbar />
			<CreateChatModel key={id} open={open} handleClose={handleClose} />
			{!chats || !house || !user ? (
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
					<Typography align="center" variant="h2">
						Las Mensajes
					</Typography>
					<Paper
						css={{
							display: 'flex',
							width: '100%',
							flexDirection: 'column',
						}}
					>
						{chats.map((list) => (
							<ChatTile key={list.id} chat={list} />
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
					</Paper>
				</PageContainer>
			)}
		</PageBackground>
	);
}

function ChatTile({ chat }: { chat: ChatModel }) {
	const theme = useTheme();
	const router = useRouter();

	return (
		<Link
			href={`/dashboard/houses/${router.query.id}/chats/${chat.id}`}
			passHref
		>
			<ListItemButton
				css={{
					padding: theme.spacing(4),
					justifyContent: 'space-between',
					'&:hover': {
						backgroundColor: alpha(
							'#ffffff',
							theme.palette.action.hoverOpacity
						),
					},
				}}
			>
				<ListItemText primary={chat.name} />
				<AvatarGroup>
					{chat.memberIds.map((member) => (
						<Avatar key={member} src={`/api/user/${member}/avatar`} />
					))}
				</AvatarGroup>
			</ListItemButton>
		</Link>
	);
}

function CreateChatModel({
	open,
	handleClose,
}: {
	open: boolean;
	handleClose: () => void;
}) {
	const router = useRouter();
	const handleCreate = useCallback(
		async (e: FormEvent) => {
			e.preventDefault();
			const target = e.target as typeof e.target & {
				name: { value: string };
			};
			const payload = {
				name: target.name.value,
			};
			const house = await fetch(`/api/house/${router.query.id}/chats`, {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					'content-type': 'application/json',
				},
			});
			if (house.ok) {
				handleClose();
				await mutate(`/api/house/${router.query.id}/chats`);
			}
		},
		[router, handleClose]
	);

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			// @ts-ignore
			PaperProps={{ component: 'form', onSubmit: handleCreate }}
		>
			<DialogTitle>Crear Chat</DialogTitle>
			<DialogContent>
				<DialogContentText>
					¡Dale un nombre a tu chat! Después de crearlo, puede agregar gentes.
				</DialogContentText>
				<TextField
					autoFocus
					name="name"
					label="El nombre de chat"
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
