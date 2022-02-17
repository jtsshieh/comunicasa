import { Button, TextField, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import { FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../lib/use-user';

export default function SignIn() {
	const theme = useTheme();
	const { mutateUser } = useUser({
		redirectTo: '/dashboard',
		redirectIfFound: true,
	});
	const router = useRouter();
	const [error, setError] = useState(false);
	const onSubmit = useCallback(
		async (e: FormEvent) => {
			e.preventDefault();
			setError(false);
			const target = e.target as typeof e.target & {
				email: { value: string };
				password: { value: string };
			};
			const payload = {
				email: target.email.value,
				password: target.password.value,
			};
			const res = await fetch('/api/auth/signin', {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					'content-type': 'application/json',
				},
			});
			const error = await res.json();
			if (!error) {
				setError(true);
			} else {
				await mutateUser();
			}
		},
		[mutateUser, router]
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
			<form
				css={{
					width: '40vw',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					gap: theme.spacing(4),
				}}
				onSubmit={onSubmit}
			>
				<Typography align="center" variant="h2">
					Inciar sesión
				</Typography>

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
					}}
				>
					<TextField
						label="Contraseña"
						variant="outlined"
						fullWidth
						required
						name="password"
						type="password"
					/>
					{error && (
						<Typography variant="subtitle1" color="error">
							Correo electrónico o contraseña incorrecta
						</Typography>
					)}
				</div>
				<div
					css={{
						width: '100%',
						display: 'flex',
						justifyContent: 'space-between',
					}}
				>
					<Link href="/auth/create-account" passHref>
						<Button>Crear Cuenta</Button>
					</Link>
					<Button variant="contained" type="submit">
						Siguiente
					</Button>
				</div>
			</form>
		</div>
	);
}
