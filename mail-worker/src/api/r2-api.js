import r2Service from '../service/r2-service';
import app from '../hono/hono';
import { attachmentUserId, ownsAttachment, attachmentResponse } from '../security/attachment-access';

app.get('/oss/*', async (c) => {
	const key = c.req.path.split('/oss/')[1];
	const userId = await attachmentUserId(c.req.raw, c.env);
	if (!userId) return c.text('Unauthorized', 401);
	if (!await ownsAttachment(c.env, userId, key)) return c.text('Not found', 404);
	return attachmentResponse(await r2Service.getObj(c, key));
});
