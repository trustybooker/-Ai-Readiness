import { isConfigured, runSecretary, logConversationLead, rateLimit } from '../lib/secretary-core.mjs';

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  return JSON.parse(req.body);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  if (!isConfigured()) return res.status(503).json({ ok: false, error: 'not_configured' });

  const ip = req.headers['x-forwarded-for'] || 'unknown';
  if (!rateLimit(`secretary:${ip}`)) return res.status(429).json({ ok: false, error: 'rate_limited' });

  let data;
  try {
    data = parseBody(req);
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid_request_body' });
  }

  const message = String(data.message || '').trim();
  if (!message) return res.status(400).json({ ok: false, error: 'message_required' });
  const history = Array.isArray(data.history) ? data.history : [];

  try {
    const result = await runSecretary({ message, history });
    let logged = null;
    if (result.handoff || result.lead) {
      logged = await logConversationLead({ result, message, history, channel: String(data.channel || 'web') });
    }
    return res.status(200).json({
      ok: true,
      reply: result.reply,
      handoff: result.handoff,
      offer_booking: result.offer_booking,
      booking_url: process.env.BOOKING_URL || '',
      logged: Boolean(logged?.ok)
    });
  } catch {
    return res.status(502).json({ ok: false, error: 'secretary_unavailable' });
  }
}
