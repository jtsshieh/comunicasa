import { withSessionRoute } from '../../../../../../../lib/session';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../../../../lib/prisma';

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
			include: {
				members: true,
				owner: true,
				messages: {
					orderBy: {
						createdAt: 'desc',
					},
					take: 50,
					where: req.query.before
						? { createdAt: { lt: req.query.before as string } }
						: undefined,
					include: { author: true },
				},
			},
		});
		if (!chat) return res.status(404).json(false);
		if (!chat.memberIds.includes(req.session.user))
			return res.status(401).json(false);
		res.json(chat.messages);
	} else if (req.method === 'POST') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);
		const chat = await prisma.chat.findUnique({
			where: {
				id: req.query.chatId as string,
			},
		});
		if (!chat) return res.status(404).json(false);
		if (!chat.memberIds.includes(req.session.user))
			return res.status(401).json(false);

		const message = await prisma.chatMessage.create({
			data: {
				chat: {
					connect: {
						id: chat.id,
					},
				},
				author: {
					connect: {
						id: req.session.user,
					},
				},
				content: req.body.content,
			},
		});
		return res.json(message);
	}
});
