import { Paper, styled } from '@mui/material';

export const Panel = styled(Paper)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	gap: theme.spacing(2),
	padding: theme.spacing(4),
	justifyContent: 'center',
	width: '100%',
}));
