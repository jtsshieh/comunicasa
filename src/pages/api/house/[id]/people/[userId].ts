import { withSessionRoute } from '../../../../../lib/session';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../../lib/prisma';

export default withSessionRoute(async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'PATCH') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);
		if (!house.ownerIds.includes(req.session.user))
			return res.status(401).json(false);

		const user = await prisma.user.findUnique({
			where: { id: req.query.userId as string },
		});
		if (!user) return res.status(400).json(false);
		if (house.ownerIds.includes(user.id)) return res.status(401).json(false);
		if (!house.memberIds.includes(user.id) && !house.guestIds.includes(user.id))
			return res.status(400).json(false);

		await prisma.user.update({
			where: { id: req.query.userId as string },
			data: Object.assign(
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
				user.guestHouseIds.includes(req.query.id as string)
					? {
							guestHouses: {
								disconnect: { id: req.query.id as string },
							},
					  }
					: user.memberHouseIds.includes(req.query.id as string)
					? {
							memberHouses: {
								disconnect: { id: req.query.id as string },
							},
					  }
					: {}
			),
		});
		res.json(true);
	} else if (req.method === 'DELETE') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);
		if (!house.ownerIds.includes(req.session.user))
			return res.status(401).json(false);

		const user = await prisma.user.findUnique({
			where: { id: req.query.userId as string },
		});
		if (!user) return res.status(400).json(false);
		if (house.ownerIds.includes(user.id)) return res.status(401).json(false);
		if (!house.memberIds.includes(user.id) && !house.guestIds.includes(user.id))
			return res.status(400).json(false);

		await prisma.user.update({
			where: { id: req.query.userId as string },
			data: user.guestHouseIds.includes(req.query.id as string)
				? {
						guestHouses: {
							disconnect: { id: req.query.id as string },
						},
				  }
				: user.memberHouseIds.includes(req.query.id as string)
				? {
						memberHouses: {
							disconnect: { id: req.query.id as string },
						},
				  }
				: {},
		});
		res.json(true);
	}
});
