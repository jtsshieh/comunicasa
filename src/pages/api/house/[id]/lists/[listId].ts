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
		if (
			!house.ownerIds
				.concat(house.memberIds)
				.concat(house.guestIds)
				.includes(req.session.user)
		)
			return res.status(401).json(false);

		const list = await prisma.list.findUnique({
			where: { id: req.query.listId as string },
			include: { items: true },
		});
		res.json(list);
	} else if (req.method === 'DELETE') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);
		if (!house.ownerIds.includes(req.session.user))
			return res.status(401).json(false);

		await prisma.list.delete({
			where: { id: req.query.listId as string },
		});
		res.json(true);
	} else if (req.method === 'POST') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);
		if (!house.ownerIds.concat(house.memberIds).includes(req.session.user))
			return res.status(401).json(false);

		const list = await prisma.list.findUnique({
			where: { id: req.query.listId as string },
		});

		if (!list) return res.status(404).json(false);

		const listItem = await prisma.listItem.create({
			data: {
				title: req.body.title,
				checked: false,
				list: {
					connect: {
						id: list.id,
					},
				},
			},
		});

		res.json(listItem);
	} else if (req.method === 'PATCH') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);
		if (!house.ownerIds.concat(house.memberIds).includes(req.session.user))
			return res.status(401).json(false);

		const list = await prisma.list.update({
			where: { id: req.query.listId as string },
			data: {
				name: req.body.name,
			},
		});
		res.json(list);
	}
});
