import { useUser } from '../lib/hooks/use-user';
import {
	useTheme,
	Link as MuiLink,
	Button,
	Popover,
	Avatar,
	darken,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { useState } from 'react';
import { ProfileDropdown } from './profile-dropdown';

export function Navbar() {
	const theme = useTheme();
	const { user } = useUser();
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

	if (!user) return <></>;
	return (
		<nav
			css={{
				padding: theme.spacing(2),
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				color: 'white',
				backgroundColor: darken(theme.palette.background.default, 0.5),
			}}
		>
			<div>
				<Link href="/dashboard/houses" passHref>
					<MuiLink variant="body1">Casas</MuiLink>
				</Link>
			</div>
			<div>
				<Button
					endIcon={<ExpandMoreIcon />}
					startIcon={
						<Avatar alt="Avatar" src={`/api/user/${user.id}/avatar`} />
					}
					onClick={(e) => setAnchorEl(e.currentTarget)}
					css={{
						padding: theme.spacing(1),
						fontWeight: 400,
						fontSize: '1em',
					}}
				>
					{user.name}
				</Button>
				<Popover
					open={Boolean(anchorEl)}
					anchorEl={anchorEl}
					onClose={() => setAnchorEl(null)}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
				>
					<ProfileDropdown />
				</Popover>
			</div>
		</nav>
	);
}
