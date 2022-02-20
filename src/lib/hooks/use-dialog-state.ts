import { useEffect, useRef, useState } from 'react';

export function useDialogState(prefix = '') {
	const openId = useRef(1);

	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) {
			openId.current = openId.current + 1;
		}
	}, [open]);

	return [
		open,
		() => setOpen(true),
		() => setOpen(false),
		prefix + openId.current,
	] as const;
}
