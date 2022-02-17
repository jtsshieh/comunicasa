import { createTheme } from '@mui/material';

export const theme = createTheme({
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: '32px',
					padding: '12px 32px',
				},
			},
			defaultProps: {
				disableRipple: true,
				disableElevation: true,
			},
		},
	},

	palette: {
		mode: 'dark',

		background: {
			default: '#274753',
		},
		primary: {
			main: '#41a5a1',
		},
	},

	typography: {
		fontFamily: ['Effra', 'sans-serif'].join(', '),
		h1: {
			fontWeight: 900,
		},
		h2: {
			fontWeight: 700,
		},
	},
});
