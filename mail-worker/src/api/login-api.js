import app from '../hono/hono';
import loginService from '../service/login-service';
import result from '../model/result';
import userContext from '../security/user-context';
import { setCookie, deleteCookie } from 'hono/cookie';
import constant from '../const/constant';

app.post('/login', async (c) => {
	const token = await loginService.login(c, await c.req.json());
	setCookie(c, 'mail_session', token, {
		httpOnly: true,
		secure: new URL(c.req.url).protocol === 'https:',
		sameSite: 'Lax',
		path: '/',
		maxAge: constant.TOKEN_EXPIRE
	});
	return c.json(result.ok({ token: token }));
});

app.post('/register', async (c) => {
	const jwt = await loginService.register(c, await c.req.json());
	return c.json(result.ok(jwt));
});

app.delete('/logout', async (c) => {
	await loginService.logout(c, userContext.getUserId(c));
	deleteCookie(c, 'mail_session', { path: '/' });
	return c.json(result.ok());
});

