import app from '../hono/hono';
import userService from '../service/user-service';
import result from '../model/result';
import userContext from '../security/user-context';
import BizError from '../error/biz-error';

const avatarKey = userId => `profile-avatar:${userId}`;
const avatarMetaKey = userId => `profile-avatar-meta:${userId}`;

app.get('/avatar/:userId', async (c) => {
	const userId = Number(c.req.param('userId'));
	if (!Number.isSafeInteger(userId) || userId < 1) return c.notFound();
	const bytes = await c.env.kv.get(avatarKey(userId), 'arrayBuffer');
	if (!bytes) return c.notFound();
	const signature = new Uint8Array(bytes);
	let contentType = 'image/jpeg';
	if (signature[0] === 0x89 && signature[1] === 0x50) contentType = 'image/png';
	else if (signature[0] === 0x52 && signature[1] === 0x49) contentType = 'image/webp';
	return new Response(bytes, { headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=60', 'X-Content-Type-Options': 'nosniff' } });
});

app.post('/my/avatar', async (c) => {
	const userId = userContext.getUserId(c);
	const form = await c.req.formData();
	const file = form.get('avatar');
	if (!(file instanceof File) || file.size < 1 || file.size > 512 * 1024) {
		throw new BizError('请上传不超过 512 KB 的头像图片');
	}
	const bytes = await file.arrayBuffer();
	const header = new Uint8Array(bytes.slice(0, 12));
	const jpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
	const png = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
	const webp = String.fromCharCode(...header.slice(0, 4)) === 'RIFF' && String.fromCharCode(...header.slice(8, 12)) === 'WEBP';
	if (!((file.type === 'image/jpeg' && jpeg) || (file.type === 'image/png' && png) || (file.type === 'image/webp' && webp))) {
		throw new BizError('头像仅支持 JPG、PNG 或 WebP 格式');
	}
	const version = Date.now();
	await c.env.kv.put(avatarKey(userId), bytes);
	await c.env.kv.put(avatarMetaKey(userId), String(version));
	return c.json(result.ok({ avatarUrl: `/api/avatar/${userId}?v=${version}` }));
});

app.delete('/my/avatar', async (c) => {
	const userId = userContext.getUserId(c);
	await Promise.all([c.env.kv.delete(avatarKey(userId)), c.env.kv.delete(avatarMetaKey(userId))]);
	return c.json(result.ok());
});

app.get('/my/loginUserInfo', async (c) => {
	const user = await userService.loginUserInfo(c, userContext.getUserId(c));
	return c.json(result.ok(user));
});

app.put('/my/resetPassword', async (c) => {
	await userService.resetPassword(c, await c.req.json(), userContext.getUserId(c));
	return c.json(result.ok());
});

app.delete('/my/delete', async (c) => {
	await userService.delete(c, userContext.getUserId(c));
	return c.json(result.ok());
});

