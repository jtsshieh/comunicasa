import { alpha, Paper, styled } from '@mui/material';
import {
	ComponentPropsWithoutRef,
	forwardRef,
	HTMLProps,
	PropsWithChildren,
} from 'react';

export const TileContainer = styled('div')(({ theme }) => ({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
	gridAutoRows: '1fr',
	gap: theme.spacing(2),
	padding: theme.spacing(2),
}));

const TileWrapper = styled(Paper)(({ theme }) => ({
	display: 'flex',
	'&:hover': {
		cursor: 'pointer',
		backgroundColor: alpha(
			theme.palette.background.paper,
			1 - theme.palette.action.hoverOpacity
		),
	},
	'&::before': {
		display: 'block',
		content: '""',
		paddingBottom: '100%',
	},
}));

const TileInside = styled('div')({
	flex: 1,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
});

export const Tile = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
	function GridItem(props, ref) {
		return (
			<TileWrapper>
				<TileInside ref={ref} {...props} />
			</TileWrapper>
		);
	}
);
