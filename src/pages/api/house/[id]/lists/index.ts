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
			include: { lists: true },
		});
		if (!house) return res.status(400).json(false);
		if (
			!house.ownerIds
				.concat(house.memberIds)
				.concat(house.guestIds)
				.includes(req.session.user)
		)
			return res.status(401).json(false);

		res.json(house.lists);
	} else if (req.method === 'POST') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);
		if (!house.ownerIds.includes(req.session.user))
			return res.status(401).json(false);

		const room = await prisma.list.create({
			data: {
				name: req.body.name,
				house: {
					connect: {
						id: house.id,
					},
				},
			},
		});

		res.json(room);
	}
});
