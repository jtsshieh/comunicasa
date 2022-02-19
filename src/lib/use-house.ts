import useSWR from 'swr';
import { House } from '@prisma/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function useHouse() {
	const router = useRouter();
	const { data: house, error } = useSWR<House>(
		router.query.id && `/api/house/${router.query.id}`
	);

	useEffect(() => {
		if (error) router.push('/dashboard/houses');
	}, [error, router]);
	return house;
}
