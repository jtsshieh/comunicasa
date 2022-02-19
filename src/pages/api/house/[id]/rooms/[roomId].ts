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

		const room = await prisma.room.findUnique({
			where: { id: req.query.roomId as string },
			include: { owners: true },
		});
		res.json(room);
	} else if (req.method === 'PUT') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
			include: { rooms: true },
		});
		if (!house) return res.status(400).json(false);
		const room = await prisma.room.findUnique({
			where: { id: req.query.roomId as string },
		});
		if (
			!room ||
			!house.ownerIds.concat(room.ownerIds).includes(req.session.user)
		)
			return res.status(401).json(false);

		await prisma.room.update({
			where: { id: req.query.roomId as string },
			data: Object.assign(
				req.body.name ? { name: req.body.name } : {},
				req.body.ownerIds ? { ownerIds: req.body.ownerIds } : {}
			),
		});
		res.json(true);
	} else if (req.method === 'DELETE') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
			include: { rooms: true },
		});
		if (!house) return res.status(400).json(false);
		if (!house.ownerIds.includes(req.session.user))
			return res.status(401).json(false);

		await prisma.room.delete({
			where: { id: req.query.roomId as string },
		});
		res.json(true);
	}
});
