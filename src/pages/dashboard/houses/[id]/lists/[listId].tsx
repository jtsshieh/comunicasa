import {
	Button,
	Checkbox,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControlLabel,
	IconButton,
	ListItemIcon,
	Menu,
	MenuItem,
	Paper,
	TextField,
	Typography,
	useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import { List as ListModel, ListItem as ListItemModel } from '@prisma/client';
import { useDialogState } from '../../../../../lib/hooks/use-dialog-state';
import { Navbar } from '../../../../../components/houses/navbar';
import { useHouse } from '../../../../../lib/hooks/use-house';
import { FormEvent, useCallback, useState } from 'react';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import Link from 'next/link';
import SettingsIcon from '@mui/icons-material/Settings';
import { useUser } from '../../../../../lib/hooks/use-user';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

export default function List() {
	const theme = useTheme();
	const router = useRouter();
	const { data: list } = useSWR<ListModel & { items: ListItemModel[] }>(
		router.query.id &&
			router.query.listId &&
			`/api/house/${router.query.id}/lists/${router.query.listId}`
	);
	const [deleteListOpen, showDeleteList, handleDeleteListClose, deleteListId] =
		useDialogState('delete');
	const [addItemOpen, showAddItem, handleAddItemClose, addItemId] =
		useDialogState('add');
	const [editNameOpen, showEditName, handleEditNameClose, editNameId] =
		useDialogState('add');
	const house = useHouse();
	const { user } = useUser();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const settingsPopper = Boolean(anchorEl);

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
			<AddItemModal
				key={addItemId}
				open={addItemOpen}
				handleClose={handleAddItemClose}
			/>

			<DeleteListConfirmation
				key={deleteListId}
				open={deleteListOpen}
				handleClose={handleDeleteListClose}
			/>
			{!list || !house || !user ? (
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
					<EditNameModal
						key={editNameId}
						open={editNameOpen}
						handleClose={handleEditNameClose}
						name={list.name}
					/>

					<div
						css={{
							width: '100%',
							display: 'grid',
							gridTemplateColumns: '1fr auto 1fr',
						}}
					>
						<div
							css={{
								display: 'flex',
								alignItems: 'center',
							}}
						>
							<Link href={`/dashboard/houses/${router.query.id}/lists`}>
								<Button
									startIcon={<ChevronLeft />}
									css={{
										padding: theme.spacing(1),
										fontWeight: 400,
										fontSize: '1em',
									}}
								>
									Regresar a listas
								</Button>
							</Link>
						</div>
						<Typography align="center" variant="h2">
							{list.name}
						</Typography>
						<div
							css={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'flex-end',
								width: '100%',
							}}
						>
							<IconButton
								css={{
									transition: 'transform 0.5s',
									'&:hover': {
										transform: 'rotate(180deg)',
									},
								}}
								onClick={(e) => setAnchorEl(e.currentTarget)}
								disabled={!house.ownerIds.includes(user.id)}
							>
								<SettingsIcon />
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
								open={settingsPopper}
								onClose={() => setAnchorEl(null)}
							>
								<MenuItem
									onClick={() => {
										showEditName();
										setAnchorEl(null);
									}}
								>
									<ListItemIcon>
										<EditIcon />
									</ListItemIcon>
									Editar Nombre
								</MenuItem>
								<MenuItem
									onClick={() => {
										showDeleteList();
										setAnchorEl(null);
									}}
								>
									<ListItemIcon>
										<DeleteIcon />
									</ListItemIcon>
									Eliminar
								</MenuItem>
							</Menu>
						</div>
					</div>
					<Paper
						css={{
							display: 'flex',
							flexDirection: 'column',
							gap: theme.spacing(2),
							padding: theme.spacing(2),
							width: '100%',
						}}
					>
						{list.items.map((item) => (
							<ListItem
								key={item.id}
								item={item}
								canChange={house.ownerIds
									.concat(house.memberIds)
									.includes(user.id)}
							/>
						))}
						{house.ownerIds.concat(house.memberIds).includes(user.id) && (
							<Button
								onClick={showAddItem}
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
				</Container>
			)}
		</div>
	);
}

function ListItem({
	item,
	canChange,
}: {
	item: ListItemModel;
	canChange: boolean;
}) {
	const router = useRouter();
	const theme = useTheme();
	const [open, show, handleClose, id] = useDialogState('add');
	const [title, setTitle] = useState(item.title);
	const handleCheck = useCallback(async () => {
		const payload = {
			checked: !item.checked,
		};

		const res = await fetch(
			`/api/house/${router.query.id}/lists/items/${item.id}`,
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
				`/api/house/${router.query.id}/lists/${router.query.listId}`
			);
		}
	}, [item, router]);
	const handleChange = useCallback(async () => {
		const payload = {
			title,
		};

		const res = await fetch(
			`/api/house/${router.query.id}/lists/items/${item.id}`,
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
				`/api/house/${router.query.id}/lists/${router.query.listId}`
			);
		}
	}, [title, item, router]);

	return (
		<div
			css={{
				display: 'flex',
				alignItems: 'center',
				gap: theme.spacing(2),
			}}
		>
			<DeleteListItemConfirmation
				key={id}
				open={open}
				handleClose={handleClose}
				itemId={item.id}
			/>
			<Checkbox
				checked={item.checked}
				onChange={handleCheck}
				disabled={!canChange}
			/>
			<TextField
				fullWidth
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				onBlur={handleChange}
				disabled={!canChange}
			/>
			{canChange && (
				<IconButton onClick={show}>
					<DeleteIcon />
				</IconButton>
			)}
		</div>
	);
}

function DeleteListItemConfirmation({
	open,
	handleClose,
	itemId,
}: {
	open: boolean;
	handleClose: () => void;
	itemId: string;
}) {
	const router = useRouter();

	const handleDelete = useCallback(async () => {
		const res = await fetch(
			`/api/house/${router.query.id}/lists/items/${itemId}`,
			{
				method: 'DELETE',
			}
		);
		if (res.ok) {
			await mutate(
				`/api/house/${router.query.id}/lists/${router.query.listId}`
			);
			handleClose();
		}
	}, [router, itemId, handleClose]);

	return (
		<Dialog open={open} onClose={handleClose}>
			<DialogTitle>¿Eliminar el elemento de lista?</DialogTitle>
			<DialogContent>
				<DialogContentText>
					¿Está seguro de que quiere eliminar este elemento? ¡No puede
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

function DeleteListConfirmation({
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
			`/api/house/${house.id}/lists/${router.query.listId}`,
			{
				method: 'DELETE',
			}
		);
		if (res.ok) {
			await mutate(`/api/house/${house.id}/lists`);
			await router.push(`/dashboard/houses/${house.id}/lists`);
		}
	}, [house, router]);

	return (
		<Dialog open={open} onClose={handleClose}>
			<DialogTitle>¿Eliminar la lista?</DialogTitle>
			<DialogContent>
				<DialogContentText>
					¿Está seguro de que quiere eliminar esta lista? ¡No puede recuperar!
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

function AddItemModal({
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
				title: target.name.value,
			};
			const house = await fetch(
				`/api/house/${router.query.id}/lists/${router.query.listId}`,
				{
					method: 'POST',
					body: JSON.stringify(payload),
					headers: {
						'content-type': 'application/json',
					},
				}
			);
			if (house.ok) {
				handleClose();
				await mutate(
					`/api/house/${router.query.id}/lists/${router.query.listId}`
				);
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
			<DialogTitle>Crear Elemento de Lista</DialogTitle>
			<DialogContent>
				<DialogContentText>
					¡Dale un nombre al elemento de lista!
				</DialogContentText>
				<TextField
					autoFocus
					name="name"
					label="El elemento de lista"
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

function EditNameModal({
	open,
	handleClose,
	name,
}: {
	open: boolean;
	handleClose: () => void;
	name: string;
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
			const house = await fetch(
				`/api/house/${router.query.id}/lists/${router.query.listId}`,
				{
					method: 'PATCH',
					body: JSON.stringify(payload),
					headers: {
						'content-type': 'application/json',
					},
				}
			);
			if (house.ok) {
				handleClose();
				await mutate(
					`/api/house/${router.query.id}/lists/${router.query.listId}`
				);
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
			<DialogTitle>Editar la Lista</DialogTitle>
			<DialogContent>
				<DialogContentText>
					¡Dale un nombre al elemento de lista!
				</DialogContentText>
				<TextField
					autoFocus
					name="name"
					label="El nombre de lista"
					fullWidth
					variant="outlined"
					margin="normal"
					defaultValue={name}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>Cancelar</Button>
				<Button type="submit" variant="contained">
					Editar
				</Button>
			</DialogActions>
		</Dialog>
	);
}
