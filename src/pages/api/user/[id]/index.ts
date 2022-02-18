import prisma from '../../../../lib/prisma';
import { withSessionRoute } from '../../../../lib/session';
import { NextApiRequest, NextApiResponse } from 'next';

export default withSessionRoute(async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (!req.query.id) return res.status(401).json(false);

	const user = await prisma.user.findUnique({
		where: {
			id: req.query.id as string,
		},
	});
	if (user) res.json(user);
	else res.status(401).json(false);
});
