import { useUser } from '../../lib/hooks/use-user';
import {
	useTheme,
	Link as MuiLink,
	Button,
	Popover,
	Avatar,
	darken,
	useMediaQuery,
	IconButton,
	Collapse,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useHouse } from '../../lib/hooks/use-house';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import { ProfileDropdown } from '../profile-dropdown';
import { Theme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export function Navbar() {
	const theme = useTheme();
	const house = useHouse();
	const isMobile = useMediaQuery<Theme>((theme) =>
		theme.breakpoints.down('md')
	);
	const [open, setOpen] = useState(false);

	if (!house) return <></>;

	return (
		<>
			<nav
				css={{
					padding: theme.spacing(2),
					display: 'grid',
					gridTemplateColumns: '1fr auto 1fr',
					alignItems: 'center',
					backgroundColor: darken(theme.palette.background.default, 0.5),
					color: 'white',
				}}
			>
				{!isMobile ? (
					<>
						<BackToDashboard />
						<Items />
						<Profile />
					</>
				) : (
					<>
						<div>
							<IconButton onClick={() => setOpen(!open)}>
								<MenuIcon />
							</IconButton>
						</div>
						<span />
						<Profile />
					</>
				)}
			</nav>
			{isMobile && (
				<Collapse
					in={open}
					css={{
						position: 'absolute',
						width: '100%',
						backgroundColor: darken(theme.palette.background.default, 0.5),
						padding: theme.spacing(2),
						zIndex: 1000,
					}}
				>
					<BackToDashboard mobile={true} />
					<Items mobile={true} />
				</Collapse>
			)}
		</>
	);
}

function BackToDashboard({ mobile = false }) {
	const theme = useTheme();
	return (
		<div
			css={{
				display: 'flex',
				justifyContent: mobile ? 'center' : undefined,
			}}
		>
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
	);
}

function Items({ mobile = false }) {
	const theme = useTheme();
	const { user } = useUser();
	const house = useHouse();

	if (!house || !user) return <></>;

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
			link: `/dashboard/houses/${house.id}/people`,
			name: 'Gentes',
		},
	];

	if (
		user.ownedHouseIds.includes(house.id) ||
		user.memberHouseIds.includes(house.id)
	) {
		navbarItems.push({
			link: `/dashboard/houses/${house.id}/chores`,
			name: 'Quehaceres',
		});
	}
	if (user.ownedHouseIds.includes(house.id)) {
		navbarItems.push({
			link: `/dashboard/houses/${house.id}/configuration`,
			name: 'Configuración',
		});
	}
	return (
		<div
			css={{
				display: 'flex',
				gap: theme.spacing(2),
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: mobile ? 'column' : 'row',
			}}
		>
			{navbarItems.map((item) => (
				<NavbarItem link={item.link} name={item.name} key={item.name} />
			))}
		</div>
	);
}

function Profile() {
	const theme = useTheme();
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const { user } = useUser();

	if (!user) return <></>;
	return (
		<div css={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
			<Button
				endIcon={<ExpandMoreIcon />}
				startIcon={<Avatar alt="Avatar" src={`/api/user/${user.id}/avatar`} />}
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
