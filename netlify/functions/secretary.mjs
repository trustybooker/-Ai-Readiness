import { isConfigured, runSecretary, logConversationLead, rateLimit, suggestPublicLinks } from '../../lib/secretary-core.mjs';

export default async (req, context) => {
  if (req.method !== 'POST') return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
  if (!isConfigured()) return Response.json({ ok: false, error: 'not_configured' }, { status: 503 });

  const ip = String(context?.ip || req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  if (!rateLimit(`secretary:${ip}`)) return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 });

  let data;
  try { data = await req.json(); }
  catch { return Response.json({ ok: false, error: 'invalid_request_body' }, { status: 400 }); }

  const message = String(data.message || '').trim();
  if (!message) return Response.json({ ok: false, error: 'message_required' }, { status: 400 });
  const history = Array.isArray(data.history) ? data.history : [];

  try {
    const result = await runSecretary({ message, history });
    let logged = null;
    if (result.handoff || result.lead) logged = await logConversationLead({ result, message, history, channel: String(data.channel || 'web') });
    const links=[...new Map([...suggestPublicLinks(message),...suggestPublicLinks(result.reply),...(result.offer_booking?[{key:'booking',label:'Booking & review',href:'/booking.html'}]:[])].map(x=>[x.href,x])).values()].slice(0,4);
    return Response.json({ ok: true, reply: result.reply, handoff: result.handoff, offer_booking: result.offer_booking, booking_url: process.env.BOOKING_URL || '/booking.html', links, logged: Boolean(logged?.ok), followup_saved: Boolean(logged?.ok) });
  } catch {
    return Response.json({ ok: false, error: 'secretary_unavailable' }, { status: 502 });
  }
};

export const config = { path: ['/.netlify/functions/secretary', '/api/secretary'], rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
