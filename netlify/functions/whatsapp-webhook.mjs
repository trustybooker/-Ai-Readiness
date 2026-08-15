import {
  isWhatsAppConfigured,
  verifySignature,
  handleVerificationRequest,
  extractMessages,
  routeMessage,
  sendWhatsAppReply
} from '../../lib/whatsapp-core.mjs';
import {reserveWebhookEvent} from '../../lib/webhook-replay.mjs';

export default async (req) => {
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const verification = handleVerificationRequest(url.searchParams);
    if (verification.ok) return new Response(verification.challenge, { status: 200 });
    return new Response('forbidden', { status: 403 });
  }

  if (req.method !== 'POST') return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
  const contentLength=Number(req.headers.get('content-length')||0);if(contentLength>1048576)return Response.json({ok:false,error:'request_too_large'},{status:413});
  if (!isWhatsAppConfigured()) return Response.json({ ok: false, error: 'not_configured' }, { status: 503 });

  const rawBody = await req.text();
  if (!verifySignature(rawBody, req.headers.get('x-hub-signature-256'))) {
    return Response.json({ ok: false, error: 'invalid_signature' }, { status: 401 });
  }

  let payload;
  try { payload = JSON.parse(rawBody); }
  catch { return Response.json({ ok: false, error: 'invalid_request_body' }, { status: 400 }); }

  for (const message of extractMessages(payload)) {
    try {
      const reservation=await reserveWebhookEvent('whatsapp',message.id);
      if(reservation.duplicate)continue;
      const { reply } = await routeMessage({ from: message.from, text: message.text });
      if (reply) await sendWhatsAppReply(message.from, reply);
    } catch { /* keep processing remaining messages; endpoint still acknowledges Meta */ }
  }
  return Response.json({ ok: true });
};

export const config = { path: '/.netlify/functions/whatsapp-webhook' };
