import { User } from '@prisma/client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';

export function useUser({
	redirectTo = '/auth/signin',
	redirectIfFound = false,
} = {}) {
	const { data: user, mutate: mutateUser, error } = useSWR<User>('/api/user');
	const router = useRouter();

	useEffect(() => {
		if (!redirectTo || (!user && !error)) return;

		if (
			(redirectTo && !redirectIfFound && error) ||
			(redirectIfFound && user)
		) {
			router.push(redirectTo);
		}
	}, [router, user, redirectIfFound, redirectTo, error]);

	return { user, mutateUser };
}
