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
import { Navbar } from '../../../../../components/houses/navbar';
import { Room } from '@prisma/client';
import AddIcon from '@mui/icons-material/Add';
import useSWR, { mutate } from 'swr';
import { FormEvent, useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Rooms() {
	const theme = useTheme();
	const router = useRouter();
	const { data: rooms } = useSWR<Room[]>(`/api/house/${router.query.id}/rooms`);
	const [showModal, setShowModal] = useState(false);

	return (
		<div
			css={{
				backgroundColor: theme.palette.background.default,
				minHeight: '100vh',
			}}
		>
			<Navbar />
			<CreateRoomModal
				open={showModal}
				handleClose={() => setShowModal(false)}
			/>
			{!rooms ? (
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
				<div
					css={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
						gridAutoRows: '1fr',
						gap: theme.spacing(2),
						padding: theme.spacing(2),
					}}
				>
					{rooms.map((room) => (
						<RoomTile key={room.id} room={room} />
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

function RoomTile({ room }: { room: Room }) {
	const theme = useTheme();
	const router = useRouter();

	return (
		<Link href={`/dashboard/houses/${router.query.id}/rooms/${room.id}`}>
			<Paper
				css={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					'&:hover': {
						cursor: 'pointer',
						backgroundColor: alpha(
							theme.palette.background.paper,
							1 - theme.palette.action.hoverOpacity
						),
					},
				}}
			>
				<div
					css={{
						display: 'flex',
						flexDirection: 'column',
						padding: theme.spacing(2),
						height: '100%',
						justifyContent: 'space-between',
					}}
				>
					<Typography
						variant="h4"
						align="center"
						css={{ overflowWrap: 'anywhere' }}
					>
						{room.name}
					</Typography>
					<AvatarGroup css={{ justifyContent: 'center' }}>
						{room.ownerIds.map((owner) => (
							<Avatar key={owner} src={`/api/user/${owner}/avatar`} />
						))}
					</AvatarGroup>
				</div>
			</Paper>
		</Link>
	);
}

function CreateRoomModal({
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
			const house = await fetch(`/api/house/${router.query.id}/rooms`, {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					'content-type': 'application/json',
				},
			});
			if (house.ok) {
				handleClose();
				await mutate(`/api/house/${router.query.id}/rooms`);
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
			<DialogTitle>Crear Cuarto</DialogTitle>
			<DialogContent>
				<DialogContentText>
					¡Dale un nombre a tu cuarto! Después de crearlo, puede agregar
					personas al cuarto.
				</DialogContentText>
				<TextField
					autoFocus
					name="name"
					label="El nombre de cuarto"
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
