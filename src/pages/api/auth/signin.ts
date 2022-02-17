import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import argon2 from 'argon2';
import { withSessionRoute } from '../../../lib/session';

export default withSessionRoute(async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'POST') {
		const user = await prisma.user.findUnique({
			where: {
				email: req.body.email,
			},
		});
		if (!user || !(await argon2.verify(user.password, req.body.password))) {
			res.status(401).send(false);
		} else {
			req.session.user = user.id;
			await req.session.save();
			res.json(true);
		}
	}
});
