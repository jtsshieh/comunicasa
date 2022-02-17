import { withSessionRoute } from '../../../lib/session';
import { NextApiRequest, NextApiResponse } from 'next';

export default withSessionRoute(async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'POST') {
		req.session.destroy();
		res.json(true);
	}
});
