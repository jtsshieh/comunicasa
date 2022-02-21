import { Navbar } from '../../components/navbar';
import { PageBackground, PageContainer } from '../../components/page-layout';
import { Button, Stack, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';

export default function Dashboard() {
	const theme = useTheme();
	const buttonItems = [
		{
			name: 'Las casas',
			link: '/dashboard/houses',
			icon: <HomeIcon />,
		},
		{
			name: 'Gestionar tu Cuenta',
			link: '/dashboard/settings',
			icon: <SettingsIcon />,
		},
	];

	return (
		<PageBackground>
			<Navbar />

			<PageContainer>
				<Typography align="center" variant="h2">
					Bienvenido al panel web de Comunicasa!
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
		</PageBackground>
	);
}
