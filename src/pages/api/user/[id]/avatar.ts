import { withSessionRoute } from '../../../../lib/session';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { genAvatarImage } from '../../../../lib/avatar/gen-avatar-image';
import { resizeAvatarImage } from '../../../../lib/avatar/resize-avatar-image';
import busboy, { Busboy } from 'busboy';
import concat from 'concat-stream';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default withSessionRoute(async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'PUT') {
		let bb: Busboy;
		try {
			bb = busboy({ headers: req.headers });
		} catch {
			const user = await prisma.user.findUnique({
				where: { id: req.query.id as string },
			});
			if (!user) return res.status(400).json(false);

			const avatar = await genAvatarImage(user.name);
			await prisma.userAvatar.upsert({
				where: { userId: req.query.id as string },
				update: { avatar },
				create: {
					userId: req.query.id as string,
					avatar,
				},
			});
			return res.json(true);
		}
		const file: Buffer | undefined = await new Promise((resolve) => {
			bb.on('file', (name, file) => {
				file.pipe(
					concat({ encoding: 'buffer' }, function (data) {
						resolve(data);
					})
				);
			});
			bb.on('end', () => {
				resolve(undefined);
			});
			req.pipe(bb);
		});

		if (!file) return res.status(400).json(false);

		const avatar = await resizeAvatarImage(file);

		await prisma.userAvatar.upsert({
			where: { userId: req.query.id as string },
			update: { avatar },
			create: {
				userId: req.query.id as string,
				avatar,
			},
		});

		res.json(true);
	} else if (req.method === 'GET') {
		const avatar = await prisma.userAvatar.findUnique({
			where: { userId: req.query.id as string },
		});
		if (!avatar) return res.status(404).json(false);
		res.setHeader('content-type', 'image/jpeg');
		res.send(avatar.avatar);
	}
});
