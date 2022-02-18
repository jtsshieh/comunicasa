import { withSessionRoute } from '../../../../lib/session';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

export default withSessionRoute(async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'GET') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		res.json(house);
	} else if (req.method === 'DELETE') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house || !house.ownerIds.includes(req.session.user))
			return res.status(401).json(false);
		await prisma.house.delete({ where: { id: req.query.id as string } });
		res.json(true);
	}
});
