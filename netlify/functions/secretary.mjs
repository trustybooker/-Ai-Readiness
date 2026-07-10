import { isConfigured, runSecretary, logConversationLead, rateLimit } from '../../lib/secretary-core.mjs';

export default async (req, context) => {
  if (req.method !== 'POST') return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
  if (!isConfigured()) return Response.json({ ok: false, error: 'not_configured' }, { status: 503 });

  const ip = context?.ip || req.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`secretary:${ip}`)) return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 });

  let data;
  try {
    data = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid_request_body' }, { status: 400 });
  }

  const message = String(data.message || '').trim();
  if (!message) return Response.json({ ok: false, error: 'message_required' }, { status: 400 });
  const history = Array.isArray(data.history) ? data.history : [];

  try {
    const result = await runSecretary({ message, history });
    let logged = null;
    if (result.handoff || result.lead) {
      logged = await logConversationLead({ result, message, history, channel: String(data.channel || 'web') });
    }
    return Response.json({
      ok: true,
      reply: result.reply,
      handoff: result.handoff,
      offer_booking: result.offer_booking,
      booking_url: process.env.BOOKING_URL || '',
      logged: Boolean(logged?.ok)
    });
  } catch {
    return Response.json({ ok: false, error: 'secretary_unavailable' }, { status: 502 });
  }
};

export const config = { path: '/.netlify/functions/secretary' };
