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
import { FormEvent, useCallback } from 'react';
import Link from 'next/link';
import { useDialogState } from '../../../lib/hooks/use-dialog-state';
import { MasterTile, Tile, TileContainer } from '../../../components/tiles';

export default function Dashboard() {
	const theme = useTheme();
	const { data: houses } = useSWR<House[]>('/api/house');
	const [open, show, handleClose, id] = useDialogState();

	return (
		<div
			css={{
				backgroundColor: theme.palette.background.default,
				minHeight: '100vh',
			}}
		>
			<Navbar />
			<CreateHouseModal key={id} open={open} handleClose={handleClose} />
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
				<TileContainer>
					{houses.map((house) => (
						<HouseTile key={house.id} house={house} />
					))}
					<MasterTile onClick={show}>
						<AddIcon />
					</MasterTile>
				</TileContainer>
			)}
		</div>
	);
}

function HouseTile({ house }: { house: House }) {
	const theme = useTheme();

	return (
		<Link href={`/dashboard/houses/${house.id}`}>
			<Tile>
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
						{house.name}
					</Typography>
					<AvatarGroup css={{ justifyContent: 'center' }}>
						{house.ownerIds.map((owner) => (
							<Avatar key={owner} src={`/api/user/${owner}/avatar`} />
						))}
						{house.memberIds.map((owner) => (
							<Avatar key={owner} src={`/api/user/${owner}/avatar`} />
						))}
					</AvatarGroup>
				</div>
			</Tile>
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
