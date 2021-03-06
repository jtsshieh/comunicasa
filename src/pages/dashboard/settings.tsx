import {
	Avatar,
	Button,
	CircularProgress,
	Typography,
	useTheme,
} from '@mui/material';
import { Navbar } from '../../components/navbar';
import { useUser } from '../../lib/hooks/use-user';
import { ChangeEvent, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Panel } from '../../components/panel';
import { PageBackground, PageContainer } from '../../components/page-layout';

export default function Settings() {
	const { user } = useUser();
	return (
		<PageBackground>
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
				<PageContainer>
					<Typography variant="h2" align="center">
						Gestionar tu cuenta
					</Typography>

					<AvatarPanel />
				</PageContainer>
			)}
		</PageBackground>
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
		<Panel>
			<Typography variant="h3">Cambiar Avatar</Typography>
			<div css={{ display: 'flex', gap: theme.spacing(4) }}>
				<Avatar
					alt="Avatar"
					src={`/api/user/${user.id}/avatar`}
					css={{ width: '128px', height: '128px' }}
				/>
				<div
					css={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: theme.spacing(2),
						flex: 1,
						[theme.breakpoints.down('md')]: {
							flexDirection: 'column',
							alignItems: 'stretch',
						},
					}}
				>
					<label htmlFor="avatar-file" css={{ flex: 1 }}>
						<input
							id="avatar-file"
							accept="image/png,image/jpeg"
							type="file"
							css={{ display: 'none' }}
							onChange={handleOnChange}
						/>
						<Button
							variant="contained"
							component="span"
							color="info"
							css={{ width: '100%' }}
						>
							Subir
						</Button>
					</label>
					<Button onClick={resetAvatar} css={{ flex: 1 }}>
						Reajustar
					</Button>
				</div>
			</div>
		</Panel>
	);
}
