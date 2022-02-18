import { useUser } from '../../lib/use-user';
import {
	Typography,
	useTheme,
	Link as MuiLink,
	Button,
	Popover,
	Avatar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useHouse } from '../../lib/use-house';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import HomeIcon from '@mui/icons-material/Home';
import { ProfileDropdown } from '../profile-dropdown';

export function Navbar() {
	const theme = useTheme();
	const { user } = useUser();
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const { house } = useHouse();

	if (!user || !house) return <></>;
	const navbarItems = [
		{
			link: `/dashboard/houses/${house.id}`,
			name: 'Incio',
		},
		{
			link: `/dashboard/houses/${house.id}/rooms`,
			name: 'Cuartos',
		},
		{
			link: `/dashboard/houses/${house.id}/chat`,
			name: 'Mensajes',
		},
		{
			link: `/dashboard/houses/${house.id}/lists`,
			name: 'Listas',
		},
		{
			link: `/dashboard/houses/${house.id}/chores`,
			name: 'Quehaceres',
		},
		{
			link: `/dashboard/houses/${house.id}/people`,
			name: 'Gentes',
		},
	];

	if (user.ownedHouseIds.includes(house.id)) {
		navbarItems.push({
			link: `/dashboard/houses/${house.id}/configuration`,
			name: 'Configuración',
		});
	}
	return (
		<nav
			css={{
				padding: theme.spacing(2),
				display: 'flex',
				alignItems: 'center',
				backdropFilter: 'blur(5px)',
				color: 'white',
			}}
		>
			<div css={{ flex: 1 }}>
				<Link href="/dashboard" passHref>
					<Button
						startIcon={<ChevronLeft />}
						css={{
							padding: theme.spacing(1),
							fontWeight: 400,
							fontSize: '1em',
						}}
					>
						Regresar a panel web
					</Button>
				</Link>
			</div>
			<div
				css={{
					display: 'flex',
					gap: theme.spacing(2),
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				{navbarItems.map((item) => (
					<NavbarItem link={item.link} name={item.name} key={item.name} />
				))}
			</div>
			<div css={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
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

function NavbarItem({ link, name }: { link: string; name: string }) {
	const router = useRouter();
	return (
		<Link href={link} passHref>
			<MuiLink
				variant="body1"
				css={
					(
						name === 'Incio'
							? router.asPath === link
							: router.asPath.startsWith(link)
					)
						? { color: 'white' }
						: null
				}
			>
				{name}
			</MuiLink>
		</Link>
	);
}
