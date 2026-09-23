import jwtUtils from '../utils/jwt-utils';
import KvConst from '../const/kv-const';

// Browser image and download requests cannot attach the SPA's Authorization header.
export async function attachmentUserId(request, env) {
	const cookie = request.headers.get('Cookie') || '';
	const match = cookie.split(';').map(part => part.trim())
		.find(part => part.startsWith('mail_session='));
	if (!match) return null;

	const token = match.slice('mail_session='.length);
	const payload = await jwtUtils.verifyToken({ env }, token);
	if (!payload?.userId || !payload?.token) return null;

	const authInfo = await env.kv.get(KvConst.AUTH_INFO + payload.userId, { type: 'json' });
	return authInfo?.tokens?.includes(payload.token) ? payload.userId : null;
}

export async function ownsAttachment(env, userId, key) {
	if (!userId || !key.startsWith('attachments/')) return false;
	const row = await env.db.prepare(
		'SELECT 1 FROM attachments WHERE key = ? AND user_id = ? LIMIT 1'
	).bind(key, userId).first();
	return !!row;
}

export function attachmentResponse(obj) {
	if (!obj) return new Response('Not found', { status: 404 });
	const headers = new Headers({ 'Cache-Control': 'private, no-store' });
	const metadata = obj.httpMetadata || {};
	if (metadata.contentType) headers.set('Content-Type', metadata.contentType);
	if (metadata.contentDisposition) headers.set('Content-Disposition', metadata.contentDisposition);
	if (obj instanceof Response) {
		for (const name of ['Content-Type', 'Content-Disposition']) {
			const value = obj.headers.get(name);
			if (value) headers.set(name, value);
		}
		return new Response(obj.body, { status: obj.status, headers });
	}
	return new Response(obj.body, { headers });
}
