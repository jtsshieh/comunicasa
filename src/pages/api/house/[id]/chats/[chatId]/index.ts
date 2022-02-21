import { withSessionRoute } from '../../../../../../lib/session';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../../../lib/prisma';

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
		const chat = await prisma.chat.findUnique({
			where: {
				id: req.query.chatId as string,
			},
			include: { members: true, owner: true },
		});
		if (!chat) return res.status(404).json(false);
		if (!chat.memberIds.includes(req.session.user))
			return res.status(401).json(false);

		res.json(chat);
	} else if (req.method === 'PUT') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);

		const chat = await prisma.chat.findUnique({
			where: { id: req.query.chatId as string },
		});
		if (!chat) return res.status(400).json(false);
		if (chat.ownerId !== req.session.user) return res.status(401).json(false);

		const updated = await prisma.chat.update({
			where: { id: req.query.chatId as string },
			data: {
				name: req.body.name,
			},
		});
		res.json(updated);
	} else if (req.method === 'DELETE') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);

		const chat = await prisma.chat.findUnique({
			where: { id: req.query.chatId as string },
		});
		if (!chat) return res.status(400).json(false);
		if (chat.ownerId !== req.session.user) return res.status(401).json(false);

		await prisma.chat.delete({
			where: { id: req.query.chatId as string },
		});
		res.json(true);
	}
});
