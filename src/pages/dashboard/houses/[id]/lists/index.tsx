import {
	alpha,
	Button,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	List,
	ListItemButton,
	ListItemText,
	Paper,
	TextField,
	Typography,
	useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import { List as ListModel } from '@prisma/client';
import { FormEvent, useCallback, useState } from 'react';
import { Navbar } from '../../../../../components/houses/navbar';
import AddIcon from '@mui/icons-material/Add';
import { useDialogState } from '../../../../../lib/hooks/use-dialog-state';
import Link from 'next/link';
import { useHouse } from '../../../../../lib/hooks/use-house';
import { useUser } from '../../../../../lib/hooks/use-user';
import {
	PageBackground,
	PageContainer,
} from '../../../../../components/page-layout';

export default function Lists() {
	const theme = useTheme();
	const router = useRouter();
	const { data: lists } = useSWR<ListModel[]>(
		router.query.id && `/api/house/${router.query.id}/lists`
	);
	const [open, show, handleClose, id] = useDialogState();
	const house = useHouse();
	const { user } = useUser();

	return (
		<PageBackground>
			<Navbar />
			<CreateListModal key={id} open={open} handleClose={handleClose} />
			{!lists || !house || !user ? (
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
						Las listas
					</Typography>
					<Paper
						css={{
							display: 'flex',
							width: '100%',
							flexDirection: 'column',
						}}
					>
						{lists.map((list) => (
							<ListTile key={list.id} list={list} />
						))}
						{house.ownerIds.concat(house.memberIds).includes(user.id) && (
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
						)}
					</Paper>
				</PageContainer>
			)}
		</PageBackground>
	);
}

function ListTile({ list }: { list: ListModel }) {
	const theme = useTheme();
	const router = useRouter();

	return (
		<Link href={`/dashboard/houses/${router.query.id}/lists/${list.id}`}>
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
				<ListItemText primary={list.name} />
			</ListItemButton>
		</Link>
	);
}

function CreateListModal({
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
			const house = await fetch(`/api/house/${router.query.id}/lists`, {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					'content-type': 'application/json',
				},
			});
			if (house.ok) {
				handleClose();
				await mutate(`/api/house/${router.query.id}/lists`);
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
			<DialogTitle>Crear Lista</DialogTitle>
			<DialogContent>
				<DialogContentText>
					¡Dale un nombre a tu lista! Después de crearla, puede agregar puntos a
					la lista.
				</DialogContentText>
				<TextField
					autoFocus
					name="name"
					label="El nombre de lista"
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
