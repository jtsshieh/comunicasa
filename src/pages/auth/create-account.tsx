import {
	Button,
	Container,
	TextField,
	Typography,
	useTheme,
} from '@mui/material';
import { FocusEvent, FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SignIn() {
	const theme = useTheme();
	const router = useRouter();
	const onSubmit = useCallback(
		async (e: FormEvent) => {
			e.preventDefault();
			const target = e.target as typeof e.target & {
				name: { value: string };
				email: { value: string };
				password: { value: string };
			};
			const payload = {
				name: target.name.value,
				email: target.email.value,
				password: target.password.value,
			};
			const res = await fetch('/api/user', {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					'content-type': 'application/json',
				},
			});
			const user = await res.json();

			const loginPayload = {
				email: target.email.value,
				password: target.password.value,
			};
			await fetch('/api/auth/signin', {
				method: 'POST',
				body: JSON.stringify(loginPayload),
				headers: {
					'content-type': 'application/json',
				},
			});

			await router.push('/dashboard');
		},
		[router]
	);
	const [password, setPassword] = useState('');
	const [passwordError, setPasswordError] = useState(false);

	const handleOnBlur = useCallback(
		async (e: FocusEvent<HTMLInputElement>) => {
			if (e.target.value != password) {
				setPasswordError(true);
			} else {
				setPasswordError(false);
			}
		},
		[password, setPasswordError]
	);

	return (
		<div
			css={{
				height: '100vh',
				width: '100vw',
				backgroundColor: theme.palette.background.default,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				color: 'white',
			}}
		>
			<Container
				component="form"
				css={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					gap: theme.spacing(4),
				}}
				onSubmit={onSubmit}
			>
				<Typography align="center" variant="h2">
					Crear Cuenta
				</Typography>
				<TextField
					label="Nombre"
					variant="outlined"
					fullWidth
					required
					name="name"
				/>
				<TextField
					label="Correo electrónico"
					variant="outlined"
					fullWidth
					required
					type="email"
					name="email"
				/>
				<div
					css={{
						width: '100%',
						display: 'flex',
						justifyContent: 'space-between',
						gap: theme.spacing(4),
					}}
				>
					<TextField
						label="Contraseña"
						variant="outlined"
						fullWidth
						required
						name="password"
						type="password"
						onChange={(e) => setPassword(e.target.value)}
						value={password}
						error={passwordError}
						helperText={passwordError ? 'Las contraseñas no coinciden' : ''}
					/>
					<TextField
						label="Confirmación"
						variant="outlined"
						fullWidth
						required
						name="confirmation"
						type="password"
						onBlur={handleOnBlur}
						error={passwordError}
					/>
				</div>
				<div
					css={{
						width: '100%',
						display: 'flex',
						justifyContent: 'space-between',
					}}
				>
					<Link href="/auth/signin" passHref>
						<Button>Iniciar sesión</Button>
					</Link>
					<Button variant="contained" type="submit">
						Crear Cuenta
					</Button>
				</div>
			</Container>
		</div>
	);
}
