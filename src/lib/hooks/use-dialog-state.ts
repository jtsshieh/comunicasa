import { useEffect, useRef, useState } from 'react';

export function useDialogState() {
	const openId = useRef(1);

	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) {
			openId.current = openId.current + 1;
		}
	}, [open]);

	return {
		open,
		show: () => setOpen(true),
		handleClose: () => setOpen(false),
		id: openId.current,
	};
}
