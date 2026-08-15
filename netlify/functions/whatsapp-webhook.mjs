import {
  isWhatsAppConfigured,
  verifySignature,
  handleVerificationRequest,
  extractMessages,
  routeMessage,
  sendWhatsAppReply
} from '../../lib/whatsapp-core.mjs';

export default async (req) => {
  const url = new URL(req.url);

  // Meta endpoint verification handshake.
  if (req.method === 'GET') {
    const verification = handleVerificationRequest(url.searchParams);
    if (verification.ok) return new Response(verification.challenge, { status: 200 });
    return new Response('forbidden', { status: 403 });
  }

  if (req.method !== 'POST') return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
  if (!isWhatsAppConfigured()) return Response.json({ ok: false, error: 'not_configured' }, { status: 503 });

  const rawBody = await req.text();
  if (!verifySignature(rawBody, req.headers.get('x-hub-signature-256'))) {
    return Response.json({ ok: false, error: 'invalid_signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ ok: false, error: 'invalid_request_body' }, { status: 400 });
  }

  // Process, reply, and always 200 so Meta does not retry-storm; failures are
  // reflected per message in the Graph send call.
  for (const message of extractMessages(payload)) {
    try {
      const { reply } = await routeMessage({ from: message.from, text: message.text });
      if (reply) await sendWhatsAppReply(message.from, reply);
    } catch { /* keep processing remaining messages */ }
  }
  return Response.json({ ok: true });
};

export const config = { path: '/.netlify/functions/whatsapp-webhook' };
