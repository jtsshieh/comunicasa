import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import argon2 from 'argon2';
import { withSessionRoute } from '../../../lib/session';
import { genAvatarImage } from '../../../lib/gen-avatar-image';

export default withSessionRoute(async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'POST') {
		const avatar = await genAvatarImage(req.body.name);
		const user = await prisma.user.create({
			data: {
				name: req.body.name,
				email: req.body.email,
				password: await argon2.hash(req.body.password),

				avatar: {
					create: {
						avatar,
					},
				},
			},
		});
		res.json(user);
	} else if (req.method === 'GET') {
		if (!req.session.user) return res.status(401).json(false);

		const user = await prisma.user.findUnique({
			where: {
				id: req.session.user,
			},
		});
		if (user) res.json(user);
		else res.status(401).json(false);
	}
});
