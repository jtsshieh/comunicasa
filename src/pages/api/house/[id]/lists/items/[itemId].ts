import { withSessionRoute } from '../../../../../../lib/session';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../../../lib/prisma';

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
		if (!house.ownerIds.concat(house.memberIds).includes(req.session.user))
			return res.status(401).json(false);

		const item = await prisma.listItem.update({
			where: { id: req.query.itemId as string },
			data: Object.assign(
				req.body.title ? { title: req.body.title } : {},
				req.body.checked !== undefined ? { checked: req.body.checked } : {}
			),
		});
		res.json(item);
	} else if (req.method === 'DELETE') {
		if (!req.session.user) return res.status(401).json(false);
		const house = await prisma.house.findUnique({
			where: { id: req.query.id as string },
		});
		if (!house) return res.status(400).json(false);
		if (!house.ownerIds.concat(house.memberIds).includes(req.session.user))
			return res.status(401).json(false);

		const item = await prisma.listItem.delete({
			where: { id: req.query.itemId as string },
		});
		res.json(item);
	}
});
