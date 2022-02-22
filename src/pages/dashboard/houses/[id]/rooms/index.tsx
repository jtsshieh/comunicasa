import {
	Avatar,
	AvatarGroup,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField,
	Typography,
	useTheme,
} from '@mui/material';
import { Navbar } from '../../../../../components/houses/navbar';
import { Room } from '@prisma/client';
import AddIcon from '@mui/icons-material/Add';
import useSWR, { mutate } from 'swr';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Tile, TileContainer } from '../../../../../components/tiles';
import {
	PageBackground,
	PageContainer,
} from '../../../../../components/page-layout';
import { useHouse } from '../../../../../lib/hooks/use-house';
import { useUser } from '../../../../../lib/hooks/use-user';
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	MouseSensor,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	rectSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragHandleIcon from '@mui/icons-material/DragHandle';

export default function Rooms() {
	const router = useRouter();
	const { data: rooms } = useSWR<Room[]>(
		router.query.id && `/api/house/${router.query.id}/rooms`
	);
	const [sorted, setSorted] = useState<Room[]>([]);
	useEffect(() => {
		if (rooms) setSorted(rooms);
	}, [rooms]);
	const house = useHouse();
	const { user } = useUser();
	const [showModal, setShowModal] = useState(false);
	const sensors = useSensors(
		useSensor(MouseSensor),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	return (
		<PageBackground>
			<Navbar />
			<CreateRoomModal
				open={showModal}
				handleClose={() => setShowModal(false)}
			/>
			{!rooms || !house || !user ? (
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
						Los cuartos
					</Typography>
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={function handleDragEnd(event) {
							const { active, over } = event;

							if (active.id !== over?.id) {
								setSorted((items) => {
									const oldIndex = items.findIndex((i) => i.id === active.id);
									const newIndex = items.findIndex((i) => i.id === over?.id);

									return arrayMove(items, oldIndex, newIndex);
								});
							}
						}}
					>
						<SortableContext
							items={sorted.map((r) => r.id)}
							strategy={rectSortingStrategy}
						>
							<TileContainer>
								{sorted.map((room) => (
									<RoomTile key={room.id} room={room} />
								))}
								{!user.guestHouseIds.includes(house.id) && (
									<Tile onClick={() => setShowModal(true)}>
										<AddIcon />
									</Tile>
								)}
							</TileContainer>
						</SortableContext>
					</DndContext>
				</PageContainer>
			)}
		</PageBackground>
	);
}

function RoomTile({ room }: { room: Room }) {
	const theme = useTheme();
	const router = useRouter();
	const {
		isDragging,
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: room.id });

	return (
		<Link href={`/dashboard/houses/${router.query.id}/rooms/${room.id}`}>
			<Tile
				ref={setNodeRef}
				css={[
					{
						transition,
						transform: CSS.Transform.toString(transform),
					},
					isDragging && { zIndex: 2 },
				]}
				{...(isDragging ? { elevation: 24 } : {})}
				{...attributes}
			>
				<div
					css={{
						display: 'flex',
						flexDirection: 'column',
						padding: theme.spacing(2),
						height: '100%',
						justifyContent: 'space-between',
						width: '100%',
					}}
				>
					<div>
						<span
							css={{
								width: '100%',
								display: 'flex',
								justifyContent: 'flex-end',
							}}
						>
							<DragHandleIcon
								{...listeners}
								css={{
									'&:hover': {
										cursor: 'grab',
									},
								}}
							/>
						</span>
						<Typography
							variant="h4"
							align="center"
							css={{ overflowWrap: 'anywhere' }}
						>
							{room.name}
						</Typography>
					</div>
					<AvatarGroup css={{ justifyContent: 'center' }}>
						{room.ownerIds.map((owner) => (
							<Avatar key={owner} src={`/api/user/${owner}/avatar`} />
						))}
					</AvatarGroup>
				</div>
			</Tile>
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
