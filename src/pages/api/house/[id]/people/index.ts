import { withSessionRoute } from '../../../../../lib/session';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../../lib/prisma';

export default withSessionRoute(async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'GET') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
			select: {
				owners: true,
				members: true,
				guests: true,
			},
		});
		res.json(house);
	} else if (req.method === 'POST') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);
		if (!house.ownerIds.includes(req.session.user))
			return res.status(401).json(false);

		const user = await prisma.user.findUnique({
			where: { email: req.body.email as string },
		});
		if (!user) return res.status(400).json(false);

		await prisma.user.update({
			where: { email: req.body.email as string },
			data:
				req.body.role === 'guest'
					? {
							guestHouses: {
								connect: { id: req.query.id as string },
							},
					  }
					: req.body.role === 'member'
					? {
							memberHouses: {
								connect: { id: req.query.id as string },
							},
					  }
					: req.body.role === 'owner'
					? {
							ownedHouses: {
								connect: { id: req.query.id as string },
							},
					  }
					: {},
		});
		res.json(true);
	}
});
