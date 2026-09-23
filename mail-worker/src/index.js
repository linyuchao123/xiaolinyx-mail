import app from './hono/webs';
import { email } from './email/email';
import userService from './service/user-service';
import verifyRecordService from './service/verify-record-service';
import emailService from './service/email-service';
import kvObjService from './service/kv-obj-service';
import r2Service from './service/r2-service';
import { attachmentUserId, ownsAttachment, attachmentResponse } from './security/attachment-access';
import oauthService from './service/oauth-service';
import analysisService from './service/analysis-service';
export default {
	 async fetch(req, env, ctx) {

		const url = new URL(req.url)

		if (url.pathname.startsWith('/api/')) {
			url.pathname = url.pathname.replace('/api', '')
			req = new Request(url.toString(), req)
			return app.fetch(req, env, ctx);
		}

		 if (url.pathname.startsWith('/attachments/')) {
			 const key = url.pathname.substring(1);
			 const userId = await attachmentUserId(req, env);
			 if (!userId) return new Response('Unauthorized', { status: 401 });
			 if (!await ownsAttachment(env, userId, key)) {
				 return new Response('Not found', { status: 404 });
			 }
			 return attachmentResponse(await r2Service.getObj({ env }, key));
		 }

		 if (url.pathname.startsWith('/static/')) {
			 return await kvObjService.toObjResp({ env }, url.pathname.substring(1));
		 }

		return env.assets.fetch(req);
	},
	email: email,
	async scheduled(c, env, ctx) {
		if (c.cron === '*/30 * * * *') {
			await analysisService.refreshEchartsCache({ env })
			return;
		}

		await verifyRecordService.clearRecord({ env })
		await userService.resetDaySendCount({ env })
		await emailService.completeReceiveAll({ env })
		await emailService.autoClean({ env })
		await analysisService.refreshEchartsCache({ env })
		await oauthService.clearNoBindOathUser({ env })
	},
};
