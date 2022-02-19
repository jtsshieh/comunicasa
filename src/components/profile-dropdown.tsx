import { useUser } from '../lib/hooks/use-user';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import {
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

export function ProfileDropdown() {
	const { mutateUser } = useUser();
	const router = useRouter();
	const goToSettings = useCallback(() => {
		router.push('/dashboard/settings');
	}, [router]);
	const logout = useCallback(async () => {
		await fetch('/api/auth/logout', { method: 'POST' });
		await mutateUser();
	}, [mutateUser]);
	return (
		<List
			css={{
				width: '250px',
			}}
		>
			<ListItem>
				<ListItemButton onClick={goToSettings}>
					<ListItemIcon>
						<SettingsIcon />
					</ListItemIcon>
					<ListItemText>Gestionar tu cuenta</ListItemText>
				</ListItemButton>
			</ListItem>
			<ListItem>
				<ListItemButton onClick={logout}>
					<ListItemIcon>
						<LogoutIcon />
					</ListItemIcon>
					<ListItemText>Cerrar sesión</ListItemText>
				</ListItemButton>
			</ListItem>
		</List>
	);
}
