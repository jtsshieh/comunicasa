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
		});
		if (!house) return res.status(400).json(false);
		const chats = await prisma.chat.findMany({
			where: {
				houseId: req.query.id as string,
				members: {
					some: {
						id: { equals: req.session.user },
					},
				},
			},
		});
		res.json(chats);
	} else if (req.method === 'POST') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);

		const chat = await prisma.chat.create({
			data: {
				name: req.body.name,
				house: {
					connect: {
						id: house.id,
					},
				},
				owner: {
					connect: {
						id: req.session.user,
					},
				},
				members: {
					connect: {
						id: req.session.user,
					},
				},
			},
		});

		res.json(chat);
	}
});
