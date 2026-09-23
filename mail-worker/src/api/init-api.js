import app from '../hono/hono';
import { dbInit } from '../init/init';

app.post('/init', (c) => {
	return dbInit.init(c);
})
