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
			include: { chores: { include: { createdBy: true } } },
		});
		if (!house) return res.status(400).json(false);
		if (!house.ownerIds.concat(house.memberIds).includes(req.session.user))
			return res.status(401).json(false);

		res.json(house.chores);
	} else if (req.method === 'POST') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);
		if (!house.ownerIds.concat(house.memberIds).includes(req.session.user))
			return res.status(401).json(false);

		const chore = await prisma.chore.create({
			data: {
				name: req.body.name,
				description: req.body.description,
				house: {
					connect: {
						id: house.id,
					},
				},
				assignedToIds: req.body.assignedToIds,
				dueAt: req.body.dueAt,
				createdBy: {
					connect: {
						id: req.body.createdBy,
					},
				},
			},
		});

		res.json(chore);
	}
});
