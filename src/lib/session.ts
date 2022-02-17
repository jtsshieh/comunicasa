import { IronSessionOptions } from 'iron-session';
import { NextApiHandler } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';

const sessionOptions: IronSessionOptions = {
	password: process.env.COOKIE_PASSWORD as string,
	cookieName: 'sid',
	cookieOptions: {
		secure: process.env.NODE_ENV === 'production',
	},
};

declare module 'iron-session' {
	interface IronSessionData {
		user: string;
	}
}

export function withSessionRoute(handler: NextApiHandler) {
	return withIronSessionApiRoute(handler, sessionOptions);
}
