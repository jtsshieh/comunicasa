import { Navbar } from '../../../../components/houses/navbar';
import {
	Button,
	CircularProgress,
	Stack,
	Typography,
	useTheme,
} from '@mui/material';
import { useHouse } from '../../../../lib/hooks/use-house';
import Link from 'next/link';
import RoomIcon from '@mui/icons-material/Room';
import MessageIcon from '@mui/icons-material/Message';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PeopleIcon from '@mui/icons-material/People';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import SettingsIcon from '@mui/icons-material/Settings';
import { useUser } from '../../../../lib/hooks/use-user';
import {
	PageBackground,
	PageContainer,
} from '../../../../components/page-layout';

export default function House() {
	const theme = useTheme();
	const house = useHouse();
	const { user } = useUser();

	if (!house || !user) return <></>;

	const buttonItems = [
		{
			link: `/dashboard/houses/${house.id}/rooms`,
			name: 'Los Cuartos',
			icon: <RoomIcon />,
		},
		{
			link: `/dashboard/houses/${house.id}/chats`,
			name: 'Los Mensajes',
			icon: <MessageIcon />,
		},
		{
			link: `/dashboard/houses/${house.id}/lists`,
			name: 'Las Listas',
			icon: <FormatListBulletedIcon />,
		},
		{
			link: `/dashboard/houses/${house.id}/people`,
			name: 'Las Gentes',
			icon: <PeopleIcon />,
		},
	];

	if (
		user.ownedHouseIds.includes(house.id) ||
		user.memberHouseIds.includes(house.id)
	) {
		buttonItems.push({
			link: `/dashboard/houses/${house.id}/chores`,
			name: 'Los Quehaceres',
			icon: <CleaningServicesIcon />,
		});
	}
	if (user.ownedHouseIds.includes(house.id)) {
		buttonItems.push({
			link: `/dashboard/houses/${house.id}/configuration`,
			name: 'La Configuración',
			icon: <SettingsIcon />,
		});
	}
	return (
		<PageBackground>
			<Navbar />

			{!house ? (
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
						Bienvenido a tu casa
					</Typography>
					<Typography variant="h3" align="center">
						{house.name}
					</Typography>

					<Stack
						direction="row"
						css={{
							flexWrap: 'wrap',
							justifyContent: 'center',
							gap: theme.spacing(2),
						}}
					>
						{buttonItems.map((item) => (
							<Link key={item.name} href={item.link} passHref>
								<Button
									css={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
									}}
									variant="contained"
								>
									{item.icon}
									{item.name}
								</Button>
							</Link>
						))}
					</Stack>
				</PageContainer>
			)}
		</PageBackground>
	);
}
