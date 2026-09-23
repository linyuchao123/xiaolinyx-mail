// Keep a margin below Resend's free plan limit of 100 emails per UTC day.
const DAILY_LIMIT = 80;

function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

const outboundQuotaService = {
  async reserve(c, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > DAILY_LIMIT) return false;
    await c.env.db.prepare(
      'CREATE TABLE IF NOT EXISTS outbound_quota (day TEXT PRIMARY KEY, count INTEGER NOT NULL)'
    ).run();
    const row = await c.env.db.prepare(
      'INSERT INTO outbound_quota (day, count) VALUES (?, ?) ' +
      'ON CONFLICT(day) DO UPDATE SET count = count + excluded.count ' +
      'WHERE count + excluded.count <= ? RETURNING count'
    ).bind(utcDay(), quantity, DAILY_LIMIT).first();
    return !!row;
  },
  async refund(c, quantity) {
    await c.env.db.prepare(
      'UPDATE outbound_quota SET count = MAX(0, count - ?) WHERE day = ?'
    ).bind(quantity, utcDay()).run();
  }
};

export default outboundQuotaService;
