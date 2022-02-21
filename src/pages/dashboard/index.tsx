import { Navbar } from '../../components/navbar';
import { useTheme } from '@mui/material';
import { PageBackground } from '../../components/page-layout';

export default function Dashboard() {
	const theme = useTheme();
	return (
		<PageBackground>
			<Navbar />
		</PageBackground>
	);
}
