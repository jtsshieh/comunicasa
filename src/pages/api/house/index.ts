import { withSessionRoute } from '../../../lib/session';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default withSessionRoute(async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'POST') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.create({
			data: {
				name: req.body.name,
				owners: {
					connect: {
						id: req.session.user,
					},
				},
			},
		});
		res.json(house);
	} else if (req.method === 'GET') {
		if (!req.session.user) return res.status(401).json(false);

		const houses = await prisma.house.findMany({
			where: {
				OR: [
					{
						ownerIds: {
							has: req.session.user,
						},
					},
					{
						memberIds: {
							has: req.session.user,
						},
					},
					{
						guestIds: {
							has: req.session.user,
						},
					},
				],
			},
		});
		res.json(houses);
	}
});
