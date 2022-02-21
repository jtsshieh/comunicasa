import { Container, styled } from '@mui/material';

export const PageContainer = styled(Container)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: theme.spacing(4),
	padding: theme.spacing(4),
}));

export const PageBackground = styled('div')(({ theme }) => ({
	backgroundColor: theme.palette.background.default,
	minHeight: '100vh',
	color: 'white',
}));
