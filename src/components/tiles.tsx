import { alpha, Paper, styled } from '@mui/material';

export const TileContainer = styled('div')(({ theme }) => ({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
	gridAutoRows: '1fr',
	gap: theme.spacing(2),
	padding: theme.spacing(2),
}));

export const Tile = styled(Paper)(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	'&:hover': {
		cursor: 'pointer',
		backgroundColor: alpha(
			theme.palette.background.paper,
			1 - theme.palette.action.hoverOpacity
		),
	},
}));

export const MasterTile = styled(Tile)({
	'&::before': {
		display: 'block',
		content: '""',
		paddingBottom: '100%',
	},
});
