import { alpha, Paper, styled } from '@mui/material';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

export const TileContainer = styled('div')(({ theme }) => ({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
	gridAutoRows: '1fr',
	gap: theme.spacing(2),
	width: '100%',
}));

const TileWrapper = styled(Paper)({
	display: 'flex',
	'&:hover': {
		cursor: 'pointer',
		border: '1px solid white',
	},
	'&::before': {
		display: 'block',
		content: '""',
		paddingBottom: '100%',
	},
});

const TileInside = styled('div')({
	flex: 1,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
});

export const Tile = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
	function GridItem(props, ref) {
		const { children, ...rest } = props;
		return (
			<TileWrapper ref={ref} {...rest}>
				<TileInside>{children}</TileInside>
			</TileWrapper>
		);
	}
);
