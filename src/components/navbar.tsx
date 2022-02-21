import { useUser } from '../lib/hooks/use-user';
import {
	Avatar,
	Button,
	darken,
	Link as MuiLink,
	Popover,
	Stack,
	useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { useState } from 'react';
import { ProfileDropdown } from './profile-dropdown';
import { useRouter } from 'next/router';

export function Navbar() {
	const theme = useTheme();
	const { user } = useUser();
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const router = useRouter();

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
			<div
				css={{ display: 'flex', gap: theme.spacing(1), alignItems: 'center' }}
			>
				<img
					css={{ height: '56px', width: 'auto' }}
					src="/logo_text.svg"
					alt="House"
				/>
			</div>
			<Stack direction="row" spacing={2}>
				<Link href="/dashboard" passHref>
					<MuiLink
						variant="body1"
						css={{
							color: router.asPath === '/dashboard' ? 'white' : undefined,
						}}
					>
						Inicio
					</MuiLink>
				</Link>
				<Link href="/dashboard/houses" passHref>
					<MuiLink
						variant="body1"
						css={{
							color:
								router.asPath === '/dashboard/houses' ? 'white' : undefined,
						}}
					>
						Casas
					</MuiLink>
				</Link>
			</Stack>
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
