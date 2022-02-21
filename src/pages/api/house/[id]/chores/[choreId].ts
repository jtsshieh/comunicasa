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
		if (!house.ownerIds.concat(house.memberIds).includes(req.session.user))
			return res.status(401).json(false);

		const chore = await prisma.chore.findUnique({
			where: { id: req.query.choreId as string },
			include: { assignedTo: true, createdBy: true },
		});
		res.json(chore);
	} else if (req.method === 'DELETE') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);
		if (!house.ownerIds.includes(req.session.user))
			return res.status(401).json(false);

		await prisma.chore.delete({
			where: { id: req.query.choreId as string },
		});
		res.json(true);
	} else if (req.method === 'PATCH') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);
		if (!house.ownerIds.concat(house.memberIds).includes(req.session.user))
			return res.status(401).json(false);

		const chore = await prisma.chore.update({
			where: { id: req.query.choreId as string },
			data: { completed: req.body.completed },
		});
		res.json(chore);
	} else if (req.method === 'PUT') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);
		if (!house.ownerIds.concat(house.memberIds).includes(req.session.user))
			return res.status(401).json(false);

		const chore = await prisma.chore.findUnique({
			where: { id: req.query.choreId as string },
		});
		if (!chore) return res.status(404).json(false);
		// Didn't create it and isn't an owner
		if (
			chore.createdById !== req.session.user &&
			!house.ownerIds.includes(req.session.user)
		)
			return res.status(401).json(false);

		const updated = await prisma.chore.update({
			where: { id: req.query.choreId as string },
			data: {
				name: req.body.name,
				description: req.body.description,
				dueAt: req.body.dueAt,
				assignedToIds: req.body.assignedToIds,
			},
		});
		res.json(chore);
	}
});
