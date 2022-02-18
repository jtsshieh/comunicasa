import {
	Avatar,
	Button,
	CircularProgress,
	Paper,
	Typography,
	useTheme,
} from '@mui/material';
import { Navbar } from '../../components/navbar';
import { useUser } from '../../lib/use-user';
import { ChangeEvent, useCallback } from 'react';
import { useRouter } from 'next/router';

export default function Settings() {
	const theme = useTheme();
	const { user } = useUser();
	return (
		<div
			css={{
				backgroundColor: theme.palette.background.default,
				minHeight: '100vh',
			}}
		>
			<Navbar />
			{!user ? (
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
				<div
					css={{
						marginTop: theme.spacing(4),
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<AvatarPanel />
				</div>
			)}
		</div>
	);
}

function AvatarPanel() {
	const theme = useTheme();
	const { user } = useUser();
	const router = useRouter();
	const resetAvatar = useCallback(async () => {
		if (!user) return;

		const res = await fetch(`/api/user/${user.id}/avatar`, {
			method: 'PUT',
		});
		if (res.ok) {
			router.reload();
		}
	}, [user, router]);
	const handleOnChange = useCallback(
		async (e: ChangeEvent<HTMLInputElement>) => {
			if (!user) return;
			const formData = new FormData();
			if (!e.target.files?.[0]) return;
			formData.append('file', e.target.files?.[0]);

			const res = await fetch(`/api/user/${user.id}/avatar`, {
				method: 'PUT',
				body: formData,
			});
			if (res.ok) {
				router.reload();
			}
		},
		[user, router]
	);

	if (!user) return <></>;
	return (
		<Paper
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: theme.spacing(2),
				padding: theme.spacing(4),
				justifyContent: 'center',
			}}
		>
			<Typography variant="h3">Cambiar Avatar</Typography>
			<div css={{ display: 'flex', gap: theme.spacing(4) }}>
				<Avatar
					alt="Avatar"
					src={`/api/user/${user.id}/avatar`}
					css={{ width: '64px', height: '64px' }}
				/>
				<div
					css={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: theme.spacing(2),
					}}
				>
					<label htmlFor="avatar-file">
						<input
							id="avatar-file"
							accept="image/png,image/jpeg"
							type="file"
							css={{ display: 'none' }}
							onChange={handleOnChange}
						/>
						<Button variant="contained" component="span" color="info">
							Subir
						</Button>
					</label>
					<Button onClick={resetAvatar}>Reajustar</Button>
				</div>
			</div>
		</Paper>
	);
}
