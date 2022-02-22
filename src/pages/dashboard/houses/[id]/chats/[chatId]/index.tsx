import {
	PageBackground,
	PageContainer,
} from '../../../../../../components/page-layout';
import { Navbar } from '../../../../../../components/houses/navbar';
import useSWR, { mutate } from 'swr';
import { Chat as ChatModel, User, ChatMessage } from '@prisma/client';
import { useRouter } from 'next/router';
import {
	Avatar,
	Button,
	CircularProgress,
	darkScrollbar,
	IconButton,
	InputBase,
	Paper,
	Popover,
	TextField,
	Typography,
	useTheme,
} from '@mui/material';
import Link from 'next/link';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import SettingsIcon from '@mui/icons-material/Settings';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '../../../../../../lib/hooks/use-user';
import { grey } from '@mui/material/colors';
import data from 'emoji-mart/data/twitter.json';
import { Emoji, EmojiData, NimbleEmoji, NimblePicker } from 'emoji-mart';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import 'emoji-mart/css/emoji-mart.css';

export default function Chat() {
	const theme = useTheme();
	const router = useRouter();
	const { user } = useUser();
	const { data: chat, error } = useSWR<
		ChatModel & { members: User[]; owner: User }
	>(
		router.query.id &&
			router.query.chatId &&
			`/api/house/${router.query.id}/chats/${router.query.chatId}`
	);

	useEffect(() => {
		if (error && !chat)
			router.push(`/dashboard/houses/${router.query.id}/chats`);
	}, [router, error, chat]);

	return (
		<PageBackground css={{ display: 'flex', flexDirection: 'column' }}>
			<Navbar />
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
				<PageContainer css={{ flex: 1 }}>
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
								href={`/dashboard/houses/${router.query.id}/chats`}
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
									Regresar a chats
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
							{chat.name}
						</Typography>
						<div
							css={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'flex-end',
								width: '100%',
								[theme.breakpoints.down('md')]: {
									gridArea: 'settings',
								},
							}}
						>
							<Link
								href={`/dashboard/houses/${router.query.id}/chats/${router.query.chatId}/settings`}
								passHref
							>
								<IconButton
									css={{
										transition: 'transform 0.5s',
										'&:hover': {
											transform: 'rotate(180deg)',
										},
									}}
									disabled={!(chat.owner.id === user.id)}
								>
									<SettingsIcon />
								</IconButton>
							</Link>
						</div>
					</div>
					<MessageContainer />
				</PageContainer>
			)}
		</PageBackground>
	);
}

function MessageContainer() {
	const theme = useTheme();
	const router = useRouter();
	const { data: messages } = useSWR<(ChatMessage & { author: User })[]>(
		router.query.id &&
			router.query.chatId &&
			`/api/house/${router.query.id}/chats/${router.query.chatId}/messages`,
		{ refreshInterval: 1000 }
	);
	const [text, setText] = useState('');
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const sendMessage = useCallback(
		async (e: FormEvent) => {
			e.preventDefault();
			if (text.length === 0) return;
			const payload = {
				content: text,
			};
			const res = await fetch(
				`/api/house/${router.query.id}/chats/${router.query.chatId}/messages`,
				{
					method: 'POST',
					body: JSON.stringify(payload),
					headers: {
						'content-type': 'application/json',
					},
				}
			);
			if (res.ok) {
				setText('');
				await mutate(
					`/api/house/${router.query.id}/chats/${router.query.chatId}/messages`
				);
			}
		},
		[text, router]
	);
	const onEmojiSelect = useCallback(
		(emoji: EmojiData) => {
			setText(text + emoji.colons + ' ');
			setAnchorEl(null);
		},
		[text]
	);
	if (!messages) return <></>;
	return (
		<Paper
			css={{
				flex: 1,
				width: '100%',
				padding: theme.spacing(2),
				display: 'flex',
				flexDirection: 'column',
				gap: theme.spacing(2),
			}}
		>
			<div
				css={{
					overflowY: 'auto',
					display: 'flex',
					flex: '1 1 auto',
					height: '0px',
					flexDirection: 'column-reverse',
					gap: theme.spacing(4),
					...darkScrollbar(),
				}}
			>
				{messages.map((message) => (
					<div
						key={message.id}
						css={{
							display: 'grid',
							gridTemplateAreas: '"pfp author"\n' + '"pfp content"',
							gridTemplateColumns: 'max-content auto',
							columnGap: theme.spacing(2),
						}}
					>
						<div css={{ gridArea: 'pfp' }}>
							<Avatar src={`/api/user/${message.author.id}/avatar`} />
						</div>
						<div
							css={{
								gridArea: 'author',
								display: 'flex',
								gap: theme.spacing(1),
							}}
						>
							<Typography variant="body1">{message.author.name}</Typography>
							<Typography variant="body2" color={grey[500]}>
								{new Date(message.createdAt).toLocaleString('es-ES')}
							</Typography>
						</div>
						<div css={{ gridArea: 'content' }}>
							<Typography
								variant="body1"
								css={{ display: 'flex', alignItems: 'center' }}
							>
								{generatePreview(message.content)}
							</Typography>
						</div>
					</div>
				))}
			</div>
			<form
				css={{
					width: '100%',
					display: 'flex',
					flexDirection: 'row',
					gap: theme.spacing(2),
				}}
				onSubmit={sendMessage}
			>
				<TextField
					fullWidth
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Escribir la mensaje"
				/>
				<Popover
					open={Boolean(anchorEl)}
					anchorEl={anchorEl}
					onClose={() => setAnchorEl(null)}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					transformOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
				>
					<NimblePicker
						theme="dark"
						set="twitter"
						data={data}
						showSkinTones={false}
						showPreview={false}
						color={theme.palette.primary.main}
						onSelect={onEmojiSelect}
						skin={1}
						autoFocus
					/>
				</Popover>
				<IconButton onClick={() => setAnchorEl(buttonRef.current)}>
					<EmojiEmotionsIcon />
				</IconButton>
				<Button variant="contained" type="submit" ref={buttonRef}>
					Mandar
				</Button>
			</form>
		</Paper>
	);
}

function generatePreview(text: string) {
	const result = [];
	let begin = 0;
	let beginEmoji = -1;
	for (let i = 0; i < text.length; i++) {
		// start/end emoji
		if (text[i] === ':') {
			// start emoji
			if (beginEmoji === -1) {
				beginEmoji = i;

				// take text before emoji and throw into span

				result.push(<span>{text.slice(begin, i)}</span>);
				begin = -1;
				// end emoji
			} else {
				result.push(
					<NimbleEmoji
						data={data}
						size={24}
						emoji={text.slice(beginEmoji, i + 1)}
						set="twitter"
					/>
				);
				// reset emoji counter and start taking text
				beginEmoji = -1;
				begin = i + 1;
			}
		}
	}

	if (begin !== -1) result.push(<span>{text.slice(begin)}</span>);
	if (result.length === 0) result.push(<span>{text}</span>);
	return <>{result}</>;
}
