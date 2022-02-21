import { createTheme } from '@mui/material';

export const theme = createTheme({
	components: {
		MuiCheckbox: {
			defaultProps: {
				disableRipple: true,
			},
		},
		MuiIconButton: {
			defaultProps: {
				disableTouchRipple: true,
			},
			styleOverrides: {
				root: {
					borderRadius: '12px',
				},
			},
		},
		MuiListItem: {
			defaultProps: {
				disablePadding: true,
			},
		},
		MuiListItemButton: {
			defaultProps: {
				disableTouchRipple: true,
			},
			styleOverrides: {
				root: ({ theme }) => ({
					'&:hover': {
						backgroundColor: theme.palette.primary.dark,
					},
				}),
			},
		},
		MuiList: {
			styleOverrides: {
				root: ({ theme }) => ({
					backgroundColor: theme.palette.primary.main,
					borderRadius: '12px',
				}),
			},
		},
		MuiLink: {
			defaultProps: {
				underline: 'none',
				color: '#c1c1c1',
			},
			styleOverrides: {
				root: {
					'&:hover': {
						color: '#ffffff',
					},
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					color: 'white',
					padding: '12px 32px',
					textTransform: 'none',
				},
			},
			defaultProps: {
				disableRipple: true,
				disableElevation: true,
			},
		},
	},

	shape: {
		borderRadius: '12px',
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
