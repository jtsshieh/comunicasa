import { Navbar } from '../../components/navbar';
import { useTheme } from '@mui/material';

export default function Dashboard() {
	const theme = useTheme();
	return (
		<div
			css={{
				backgroundColor: theme.palette.background.default,
			}}
		>
			<Navbar />
		</div>
	);
}
