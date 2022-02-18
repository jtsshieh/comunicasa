import useSWR from 'swr';
import { House } from '@prisma/client';
import { useRouter } from 'next/router';

export function useHouse() {
	const router = useRouter();
	const { data: house } = useSWR<House>(`/api/house/${router.query.id}`);

	return { house };
}
