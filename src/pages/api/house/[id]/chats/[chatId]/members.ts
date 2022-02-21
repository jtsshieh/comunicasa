import prisma from '../../../../../../lib/prisma';
import { withSessionRoute } from '../../../../../../lib/session';
import { NextApiRequest, NextApiResponse } from 'next';

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

		const chat = await prisma.chat.findUnique({
			where: { id: req.query.chatId as string },
		});
		if (!chat) return res.status(400).json(false);
		if (chat.ownerId !== req.session.user) return res.status(401).json(false);

		const updated = await prisma.chat.update({
			where: { id: req.query.chatId as string },
			data: {
				owner: {
					connect: {
						id: req.body.owner,
					},
				},
			},
		});
		res.json(updated);
	} else if (req.method === 'POST') {
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
				members: {
					connect: {
						id: req.body.member,
					},
				},
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

		const updated = await prisma.chat.update({
			where: { id: req.query.chatId as string },
			data: {
				members: {
					disconnect: {
						id: req.body.member,
					},
				},
			},
		});
		res.json(updated);
	}
});
